import json
from typing import Dict, List, Optional
from datetime import datetime
from .videos import VideoService
from .booking import BookingService
from ..config import PLACES_JSON, FOODS_JSON, GEMS_JSON
from ..preprocess import normalize

PLACES = json.load(open(PLACES_JSON, "r", encoding="utf-8"))
FOODS = json.load(open(FOODS_JSON, "r", encoding="utf-8"))
GEMS = json.load(open(GEMS_JSON, "r", encoding="utf-8"))

def _get_city_list(d: Dict, city: str, fallback: str = "kathmandu") -> List[str]:
    city = (city or fallback).lower()
    return d.get(city, d.get(fallback, []))

def suggest(intent: str, city: str | None) -> Dict:
    out = {"city": city, "results": []}
    if intent in {"find_places", "itinerary_suggestion", "family_friendly", "backpacker", "couples"}:
        out["results"] = _get_city_list(PLACES, city)
    elif intent in {"local_food"}:
        out["results"] = _get_city_list(FOODS, city)
    elif intent in {"find_hidden"}:
        out["results"] = _get_city_list(GEMS, city)
    elif intent in {"digital_nomad"}:
        out["results"] = ["Coworking at Thamel area", "Naya Bazar cafes with Wi-Fi", "Monthly rentals near Lazimpat"]
    elif intent in {"business_travel"}:
        out["results"] = ["Hotels with meeting rooms near Durbar Marg", "Airport pickup options", "Quiet lounges with power & Wi-Fi"]
    elif intent in {"adventure_providers"}:
        out["results"] = ["Registered trekking guides (TAAN)", "Paragliding operators (Pokhara)", "White-water rafting agencies"]
    else:
        out["results"] = ["Tell me more about your interests."]
    return out

def assemble_plan(
    city: str,
    days: int = 2,
    profile: Optional[str] = None,
    pax: int = 2,
    budget_level: str = "mid",
) -> Dict:
    places = _get_city_list(PLACES, city)[:6]
    gems = _get_city_list(GEMS, city)[:4]
    foods = _get_city_list(FOODS, city)[:6]

    video_service = VideoService()
    booking_service = BookingService()

    # Get a few trending/cached videos for the city
    videos_resp = video_service.get_trending_videos(city)
    candidate_videos = []
    for v in videos_resp.get("videos", [])[:6]:
        if isinstance(v, str):
            candidate_videos.append(v)
        else:
            candidate_videos.append(v.get("url"))

    # Get hotel suggestions (deeplinks only; not live pricing yet)
    hotels = booking_service.get_hotel_recommendations(city=city, pax=pax, budget=budget_level)
    hotel_names = [rec["platform"] for rec in hotels.get("recommendations", [])][:3]

    days_out: List[Dict] = []
    for d in range(1, max(1, days) + 1):
        day_items: List[str] = []
        if d == 1:
            day_items += places[:3]
        elif d == 2:
            day_items += gems[:2] + places[3:5]
        else:
            idx = d % max(1, len(places))
            day_items += places[idx: idx + 3]

        eats = foods[(d-1) % max(1, len(foods)): ((d-1) % max(1, len(foods))) + 2]
        associated_videos = candidate_videos[(d-1) % max(1, len(candidate_videos)): ((d-1) % max(1, len(candidate_videos))) + 2]

        days_out.append({
            "day": d,
            "activities": day_items,
            "food": eats,
            "videos": [v for v in associated_videos if v],
            "hotel_options": hotel_names,
        })

    return {
        "summary": f"{days}-day {city.capitalize()} plan",
        "city": city,
        "days": days,
        "profile": profile,
        "pax": pax,
        "budget": budget_level,
        "days_detail": days_out,
    }