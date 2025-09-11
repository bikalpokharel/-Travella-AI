from fastapi import FastAPI, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from .predict import Predictor
from .entities import load_cities, parse_entities
from .config import CITIES_TXT, MODEL_PATH
from .services import recommend, booking, videos, i18n
from .db import init_db
from .services.llm import LLMService
from .services.video_collector import VideoCollector

app = FastAPI(title="Travella AI — v1", version="1.1.0")

# Add CORS middleware to allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://127.0.0.1:8080", "http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load resources
load_cities(CITIES_TXT)
init_db()

# Initialize LLM service
llm_service = LLMService()

class Query(BaseModel):
    text: str = Field(..., examples=["Plan 3 days in Kathmandu with hidden places"])

class PredictResponse(BaseModel):
    intent: str
    confidence: float
    entities: Dict[str, Optional[str | int]]
    suggestions: Dict[str, Any]
    llm_response: Optional[str] = None
    llm_available: bool = False

@app.get("/health")
def health():
    return {
        "status": "ok", 
        "model_exists": MODEL_PATH.exists(),
        "llm_available": llm_service.is_available(),
        "llm_providers": {
            "openai": bool(llm_service.openai_api_key),
            "anthropic": bool(llm_service.anthropic_api_key)
        }
    }

@app.post("/predict", response_model=PredictResponse)
async def predict(q: Query, x_lang: Optional[str] = Header(default=None, alias="X-Lang")):
    i18n.load(x_lang)
    pred = Predictor().predict(q.text)
    ents = parse_entities(q.text)
    sug = recommend.suggest(pred["intent"], ents.get("city"))
    
    # Get LLM response if available
    llm_response = None
    if llm_service.is_available():
        try:
            llm_response = await llm_service.get_llm_response(
                q.text, pred["intent"], ents, ents.get("city")
            )
        except Exception as e:
            print(f"LLM response failed: {e}")
            # Use fallback response when LLM fails
            llm_response = llm_service.get_fallback_response(pred["intent"], ents, ents.get("city"))
    else:
        # Use fallback response when LLM is not available
        llm_response = llm_service.get_fallback_response(pred["intent"], ents, ents.get("city"))
    
    return {
        "intent": pred["intent"], 
        "confidence": pred["confidence"], 
        "entities": ents, 
        "suggestions": sug,
        "llm_response": llm_response,
        "llm_available": llm_service.is_available()
    }

class PlanReq(BaseModel):
    city: Optional[str] = Field(default=None, examples=["kathmandu"])
    days: int = Field(default=2, ge=1, le=14)
    profile: Optional[str] = Field(default=None, examples=["solo","family","business","couple","backpacker"])
    pax: int = Field(default=2, ge=1, le=12)
    budget: str = Field(default="mid", examples=["budget","mid","luxury"])

@app.post("/plan")
def plan(req: PlanReq, x_lang: Optional[str] = Header(default=None, alias="X-Lang")):
    i18n.load(x_lang)
    city = (req.city or "kathmandu").lower()
    out = recommend.assemble_plan(city, req.days, req.profile, req.pax, req.budget)
    out["title"] = i18n.t("plan_title", city=city.capitalize(), days=req.days)
    return out

class VideoReq(BaseModel):
    place: str = Field(..., examples=["kathmandu"])

class BudgetPlanReq(BaseModel):
    city: str = Field(..., examples=["kathmandu"])
    days: int = Field(..., ge=1, le=60, examples=[3])
    pax: int = Field(default=2, ge=1, le=12)
    budget_level: str = Field(default="mid", examples=["budget", "mid", "luxury"])
    origin: Optional[str] = Field(default=None, examples=["delhi", "pokhara"])

@app.post("/videos")
def short_videos(req: VideoReq, x_lang: Optional[str] = Header(default=None, alias="X-Lang")):
    i18n.load(x_lang)
    video_service = videos.VideoService()
    # Try live fetch + cache in background-like manner (sync for now)
    try:
        import asyncio
        live = asyncio.run(video_service.fetch_live_trending(req.place))
        if live:
            video_service.cache_videos(req.place, live)
    except Exception:
        pass
    out = video_service.get_video_recommendations(req.place, "all")
    out["title"] = i18n.t("video_title", place=req.place.capitalize())
    return out

class BookHotelReq(BaseModel):
    city: str = Field(..., examples=["kathmandu"])
    checkin: Optional[str] = Field(default=None, examples=["2025-08-20"])
    nights: int = Field(default=2, ge=1, le=30)
    pax: int = Field(default=2, ge=1, le=10)
    origin: Optional[str] = Field(default=None, examples=["delhi"]) 
    date: Optional[str] = Field(default=None, examples=["2025-09-01"]) 
    budget: Optional[str] = Field(default=None, examples=["budget","mid","luxury"]) 

@app.post("/book/suggest")
def book_suggest(req: BookHotelReq, x_lang: Optional[str] = Header(default=None, alias="X-Lang")):
    i18n.load(x_lang)
    bs = booking.BookingService()
    options = bs.get_all_booking_options(
        city=req.city,
        origin=req.origin,
        date=req.date,
        pax=req.pax,
        budget=req.budget,
    )
    return {"title": i18n.t("book_tips"), **options}

class FlightReq(BaseModel):
    origin: str = Field(..., examples=["kathmandu"])
    destination: str = Field(..., examples=["pokhara"])
    date: str = Field(..., examples=["2025-09-01"])
    pax: int = Field(default=1, ge=1, le=10)

@app.post("/book/flight")
def book_flight(req: FlightReq):
    return booking.flight_suggest(req.origin, req.destination, req.date, req.pax)

class AgencyReq(BaseModel):
    agency: str = Field(..., examples=["Third Pole Group"])
    city: str = Field(..., examples=["kathmandu"])
    days: int = Field(default=3, ge=1, le=14)
    logo_url: Optional[str] = Field(default=None)

@app.post("/agency/itinerary")
def agency_itinerary(req: AgencyReq, x_lang: Optional[str] = Header(default=None, alias="X-Lang")):
    i18n.load(x_lang)
    base = recommend.assemble_plan(req.city.lower(), req.days, "agency")
    return {"title": i18n.t("agency_title", agency=req.agency, city=req.city.capitalize()), "brand": {"name": req.agency, "logo": req.logo_url}, **base}
# Enhanced Video Endpoints
class VideoCategoryReq(BaseModel):
    place: str = Field(..., examples=["kathmandu"])
    category: str = Field(..., examples=["food", "culture", "adventure"])

@app.post("/videos/category")
def videos_by_category(req: VideoCategoryReq, x_lang: Optional[str] = Header(default=None, alias="X-Lang")):
    i18n.load(x_lang)
    video_service = videos.VideoService()
    return video_service.get_video_by_category(req.place, req.category)

@app.post("/videos/trending")
def trending_videos(req: VideoReq, x_lang: Optional[str] = Header(default=None, alias="X-Lang")):
    i18n.load(x_lang)
    video_service = videos.VideoService()
    return video_service.get_trending_videos(req.place)

@app.post("/videos/instagram")
def instagram_reels(req: VideoReq, x_lang: Optional[str] = Header(default=None, alias="X-Lang")):
    i18n.load(x_lang)
    video_service = videos.VideoService()
    return video_service.get_instagram_reels(req.place)

@app.post("/videos/youtube")
def youtube_videos(req: VideoReq, x_lang: Optional[str] = Header(default=None, alias="X-Lang")):
    i18n.load(x_lang)
    video_service = videos.VideoService()
    return video_service.get_youtube_videos(req.place)

@app.post("/videos/tiktok")
def tiktok_videos(req: VideoReq, x_lang: Optional[str] = Header(default=None, alias="X-Lang")):
    i18n.load(x_lang)
    video_service = videos.VideoService()
    return video_service.get_tiktok_videos(req.place)

# Budget planning endpoint
@app.post("/budget/plan")
def budget_plan(req: BudgetPlanReq, x_lang: Optional[str] = Header(default=None, alias="X-Lang")):
    i18n.load(x_lang)
    bs = booking.BookingService()
    return bs.plan_by_budget(city=req.city, days=req.days, pax=req.pax, budget_level=req.budget_level, origin=req.origin)

# Video Collection Endpoints
@app.post("/admin/collect-videos")
def collect_videos_for_destination(req: VideoReq):
    """Collect videos for a specific destination"""
    try:
        collector = VideoCollector()
        result = collector.collect_videos_for_destination(req.place)
        return {
            "status": "success",
            "destination": req.place,
            "message": f"Successfully collected videos for {req.place}",
            "data": result
        }
    except Exception as e:
        return {
            "status": "error",
            "destination": req.place,
            "message": f"Error collecting videos: {str(e)}"
        }

@app.post("/admin/collect-all-videos")
def collect_all_videos():
    """Collect videos for all destinations (Backend only)"""
    try:
        collector = VideoCollector()
        result = collector.collect_all_destinations()
        return {
            "status": "success",
            "message": "Successfully collected videos for all destinations",
            "destinations": list(result.keys()),
            "total_destinations": len(result)
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Error collecting videos: {str(e)}"
        }

@app.get("/admin/video-stats")
def get_video_stats():
    """Get video collection statistics (Backend only)"""
    try:
        collector = VideoCollector()
        stats = {}
        total_youtube = 0
        total_instagram = 0
        total_tiktok = 0
        
        for destination in ["kathmandu", "pokhara", "chitwan", "lumbini", "bhaktapur", "patan", "nagarkot", "bandipur"]:
            if destination in collector.video_data:
                data = collector.video_data[destination]
                youtube_count = len(data.get("youtube_videos", []))
                instagram_count = len(data.get("instagram_reels", []))
                tiktok_count = len(data.get("tiktok", []))
                
                total_youtube += youtube_count
                total_instagram += instagram_count
                total_tiktok += tiktok_count
                
                stats[destination] = {
                    "youtube": youtube_count,
                    "instagram": instagram_count,
                    "tiktok": tiktok_count,
                    "total": youtube_count + instagram_count + tiktok_count
                }
            else:
                stats[destination] = {"youtube": 0, "instagram": 0, "tiktok": 0, "total": 0}
        
        return {
            "status": "success",
            "statistics": stats,
            "totals": {
                "youtube": total_youtube,
                "instagram": total_instagram,
                "tiktok": total_tiktok,
                "grand_total": total_youtube + total_instagram + total_tiktok
            }
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Error getting video stats: {str(e)}"
        }

# Enhanced Booking Endpoints
class ActivityReq(BaseModel):
    city: str = Field(..., examples=["kathmandu"])
    category: Optional[str] = Field(default=None, examples=["adventure", "culture", "food"])

@app.post("/activities")
def activity_recommendations(req: ActivityReq, x_lang: Optional[str] = Header(default=None, alias="X-Lang")):
    i18n.load(x_lang)
    booking_service = booking.BookingService()
    return booking_service.get_activity_recommendations(req.city, req.category)

@app.post("/book/hotels/enhanced")
def enhanced_hotel_booking(req: BookHotelReq, x_lang: Optional[str] = Header(default=None, alias="X-Lang")):
    i18n.load(x_lang)
    booking_service = booking.BookingService()
    checkout = None
    if req.checkin:
        from datetime import datetime, timedelta
        checkin_date = datetime.strptime(req.checkin, "%Y-%m-%d")
        checkout_date = checkin_date + timedelta(days=req.nights)
        checkout = checkout_date.strftime("%Y-%m-%d")
    
    return booking_service.get_hotel_recommendations(
        req.city, req.checkin, checkout, req.pax
    )

@app.post("/book/flights/enhanced")
def enhanced_flight_booking(req: FlightReq, x_lang: Optional[str] = Header(default=None, alias="X-Lang")):
    i18n.load(x_lang)
    booking_service = booking.BookingService()
    return booking_service.get_flight_recommendations(
        req.origin, req.destination, req.date, req.pax
    )
