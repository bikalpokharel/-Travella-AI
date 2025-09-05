import json
from datetime import date, timedelta
from ..config import PARTNERS_JSON

PARTNERS = json.load(open(PARTNERS_JSON, "r", encoding="utf-8"))

def hotel_suggest(city: str, checkin: str | None = None, nights: int = 2, pax: int = 2):
    if not checkin:
        checkin = date.today().isoformat()
    checkout = (date.fromisoformat(checkin) + timedelta(days=nights)).isoformat()
    tmpl = PARTNERS["hotels"]["deeplink_template"]
    return {
        "tips": [
            "Stay near city center or transit lines",
            "Filter by rating 8+/10 and recent reviews",
            "Compare refundable vs non-refundable rates"
        ],
        "deeplink": tmpl.format(city=city, checkin=checkin, checkout=checkout, pax=pax),
        "checkin": checkin,
        "checkout": checkout,
        "pax": pax
    }

def flight_suggest(origin: str, destination: str, date_str: str, pax: int = 1):
    tmpl = PARTNERS["flights"]["deeplink_template"]
    return {
        "tips": ["Book 2–6 weeks in advance for domestic routes", "Carry buffer time in monsoon season"],
        "deeplink": tmpl.format(origin=origin, destination=destination, date=date_str, pax=pax),
        "origin": origin, "destination": destination, "date": date_str, "pax": pax
    }