import re
from .preprocess import normalize

CITY_WORDS = set()

def load_cities(path):
    global CITY_WORDS
    CITY_WORDS = set([c.strip().lower() for c in open(path, "r", encoding="utf-8").read().splitlines() if c.strip()])

def parse_entities(text: str):
    t = normalize(text)
    # city
    city = None
    for c in CITY_WORDS:
        if f" {c} " in f" {t} ":
            city = c
            break
    # days
    m = re.search(r"(\d+)\s*(?:day|days)", t)
    days = int(m.group(1)) if m else None
    # budget (very rough)
    m = re.search(r"\$(\d+)|(?:budget|under)\s*\$?(\d+)", t)
    budget = int(m.group(1) or m.group(2)) if m else None
    # people (pax)
    m = re.search(r"(\d+)\s*(?:people|pax|persons|adults)", t)
    pax = int(m.group(1)) if m else None
    return {"city": city, "days": days, "budget": budget, "pax": pax}