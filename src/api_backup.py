from fastapi import FastAPI, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from .predict import Predictor
from .entities import load_cities, parse_entities
from .config import CITIES_TXT, MODEL_PATH
from .services import recommend, booking, videos, i18n
from .services.llm import LLMService

app = FastAPI(title="Travel Assistant Pro — v1", version="1.0.0")

# Add CORS middleware to allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://127.0.0.1:8080", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load resources
load_cities(CITIES_TXT)

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

@app.post("/plan")
def plan(req: PlanReq, x_lang: Optional[str] = Header(default=None, alias="X-Lang")):
    i18n.load(x_lang)
    city = (req.city or "kathmandu").lower()
    out = recommend.assemble_plan(city, req.days, req.profile)
    out["title"] = i18n.t("plan_title", city=city.capitalize(), days=req.days)
    return out

class VideoReq(BaseModel):
    place: str = Field(..., examples=["kathmandu"])

@app.post("/videos")
def short_videos(req: VideoReq, x_lang: Optional[str] = Header(default=None, alias="X-Lang")):
    i18n.load(x_lang)
    out = videos.video_recs(req.place)
    out["title"] = i18n.t("video_title", place=req.place.capitalize())
    return out

class BookHotelReq(BaseModel):
    city: str = Field(..., examples=["kathmandu"])
    checkin: Optional[str] = Field(default=None, examples=["2025-08-20"])
    nights: int = Field(default=2, ge=1, le=30)
    pax: int = Field(default=2, ge=1, le=10)

@app.post("/book/suggest")
def book_suggest(req: BookHotelReq, x_lang: Optional[str] = Header(default=None, alias="X-Lang")):
    i18n.load(x_lang)
    return {"title": i18n.t("book_tips"), "hotel": booking.hotel_suggest(req.city, req.checkin, req.nights, req.pax)}

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