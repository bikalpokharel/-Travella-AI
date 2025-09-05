import json
from typing import Dict
from ..config import VIDEOS_JSON

VIDEOS = json.load(open(VIDEOS_JSON, "r", encoding="utf-8"))

def video_recs(place: str) -> Dict:
    p = place.lower()
    d = VIDEOS.get(p, {})
    # Always return keys to keep schema stable
    return {
        "place": p,
        "youtube_shorts": d.get("youtube_shorts", [])[:5],
        "tiktok": d.get("tiktok", [])[:5],
        "instagram_reels": d.get("instagram_reels", [])[:5],
    }