import json
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import httpx
from sqlalchemy.orm import Session
from ..db import init_db, SessionLocal, Video
from pathlib import Path
from ..config import VIDEOS_JSON

class VideoService:
    def __init__(self):
        init_db()
        self.video_data = self._load_video_data()
    
    def _load_video_data(self) -> Dict:
        """Load video data from JSON file"""
        try:
            # Try to load collected video data first, then real data, then original
            collected_videos_path = VIDEOS_JSON.parent / "video_links_collected.json"
            real_videos_path = VIDEOS_JSON.parent / "video_links_real.json"
            
            if collected_videos_path.exists():
                with open(collected_videos_path, "r", encoding="utf-8") as f:
                    return json.load(f)
            elif real_videos_path.exists():
                with open(real_videos_path, "r", encoding="utf-8") as f:
                    return json.load(f)
            else:
                with open(VIDEOS_JSON, "r", encoding="utf-8") as f:
                    return json.load(f)
        except Exception as e:
            print(f"Warning: Could not load video data: {e}")
            return {}
    
    def get_video_recommendations(self, place: str, video_type: str = "all") -> Dict:
        """Get video recommendations for a place with enhanced metadata"""
        place_lower = place.lower()
        
        if place_lower not in self.video_data:
            return {
                "title": f"Videos for {place.capitalize()}",
                "videos": [],
                "message": f"No videos found for {place.capitalize()}"
            }
        
        place_videos = self.video_data[place_lower]
        
        if video_type == "instagram":
            if "enhanced_videos" in place_videos and "instagram" in place_videos["enhanced_videos"]:
                videos = place_videos["enhanced_videos"]["instagram"]
            else:
                videos = self._enhance_videos(place_videos.get("instagram_reels", []), "instagram", place)
            title = f"Instagram Reels for {place.capitalize()}"
        elif video_type == "youtube":
            if "enhanced_videos" in place_videos and "youtube" in place_videos["enhanced_videos"]:
                videos = place_videos["enhanced_videos"]["youtube"]
            else:
                youtube_videos = place_videos.get("youtube_videos", []) + place_videos.get("youtube_shorts", [])
                videos = self._enhance_videos(youtube_videos, "youtube", place)
            title = f"YouTube Videos for {place.capitalize()}"
        elif video_type == "tiktok":
            if "enhanced_videos" in place_videos and "tiktok" in place_videos["enhanced_videos"]:
                videos = place_videos["enhanced_videos"]["tiktok"]
            else:
                videos = self._enhance_videos(place_videos.get("tiktok", []), "tiktok", place)
            title = f"TikTok Videos for {place.capitalize()}"
        else:
            # Combine all types
            if "enhanced_videos" in place_videos:
                instagram_videos = place_videos["enhanced_videos"].get("instagram", [])
                youtube_videos = place_videos["enhanced_videos"].get("youtube", [])
                tiktok_videos = place_videos["enhanced_videos"].get("tiktok", [])
                videos = instagram_videos + youtube_videos + tiktok_videos
            else:
                instagram_videos = self._enhance_videos(place_videos.get("instagram_reels", []), "instagram", place)
                youtube_videos = self._enhance_videos(place_videos.get("youtube_videos", []) + place_videos.get("youtube_shorts", []), "youtube", place)
                tiktok_videos = self._enhance_videos(place_videos.get("tiktok", []), "tiktok", place)
                videos = instagram_videos + youtube_videos + tiktok_videos
            title = f"Video Recommendations for {place.capitalize()}"
        
        return {
            "title": title,
            "videos": videos[:10],  # Limit to 10 videos
            "total_count": len(videos),
            "instagram_count": len(place_videos.get("instagram_reels", [])),
            "youtube_count": len(place_videos.get("youtube_videos", []) + place_videos.get("youtube_shorts", [])),
            "tiktok_count": len(place_videos.get("tiktok", []))
        }
    
    def _enhance_videos(self, video_urls: List[str], platform: str, place: str) -> List[Dict]:
        """Enhance video URLs with metadata and descriptions"""
        enhanced_videos = []
        
        # Video descriptions based on place and platform
        descriptions = {
            "kathmandu": {
                "youtube": [
                    "Explore the ancient temples and bustling streets of Kathmandu",
                    "Discover hidden gems in Nepal's capital city",
                    "Taste authentic Newari cuisine in Kathmandu",
                    "Visit UNESCO World Heritage sites in Kathmandu",
                    "Experience the vibrant culture of Kathmandu"
                ],
                "instagram": [
                    "Stunning views of Kathmandu's ancient architecture",
                    "Colorful street life in Nepal's capital",
                    "Amazing food experiences in Kathmandu",
                    "Cultural moments in Kathmandu temples",
                    "Beautiful sunsets over Kathmandu valley"
                ],
                "tiktok": [
                    "Quick tour of Kathmandu's must-see spots",
                    "Fun facts about Kathmandu you didn't know",
                    "Best street food in Kathmandu",
                    "Kathmandu travel hacks and tips",
                    "Amazing Kathmandu moments in 60 seconds"
                ]
            },
            "pokhara": {
                "youtube": [
                    "Breathtaking mountain views from Pokhara",
                    "Adventure activities in Pokhara",
                    "Peaceful lakeside moments in Pokhara",
                    "Paragliding over the beautiful Pokhara valley",
                    "Exploring Pokhara's natural beauty"
                ],
                "instagram": [
                    "Stunning sunrise over the Himalayas from Pokhara",
                    "Peaceful Phewa Lake views",
                    "Adventure vibes in Pokhara",
                    "Beautiful Pokhara landscapes",
                    "Relaxing moments by the lake"
                ],
                "tiktok": [
                    "Pokhara adventure in 60 seconds",
                    "Best photo spots in Pokhara",
                    "Pokhara travel tips and tricks",
                    "Amazing Pokhara experiences",
                    "Quick Pokhara city tour"
                ]
            }
        }
        
        place_descriptions = descriptions.get(place.lower(), {
            "youtube": [f"Amazing {place} travel experiences"],
            "instagram": [f"Beautiful {place} moments"],
            "tiktok": [f"Quick {place} tour"]
        })
        
        platform_descriptions = place_descriptions.get(platform, [f"Great {place} content"])
        
        for i, url in enumerate(video_urls):
            description = platform_descriptions[i % len(platform_descriptions)]
            
            enhanced_video = {
                "url": url,
                "title": f"{place.capitalize()} Travel Video {i+1}",
                "description": description,
                "platform": platform,
                "thumbnail": self._get_thumbnail_url(url, platform),
                "duration": self._get_duration_estimate(platform),
                "views": self._get_views_estimate(),
                "likes": self._get_likes_estimate()
            }
            enhanced_videos.append(enhanced_video)
        
        return enhanced_videos
    
    def _get_thumbnail_url(self, url: str, platform: str) -> str:
        """Generate thumbnail URL based on platform"""
        if platform == "youtube":
            video_id = url.split("v=")[-1].split("&")[0] if "v=" in url else url.split("/")[-1]
            return f"https://img.youtube.com/vi/{video_id}/maxresdefault.jpg"
        elif platform == "instagram":
            return "https://via.placeholder.com/300x400/FF6B6B/FFFFFF?text=Instagram+Reel"
        elif platform == "tiktok":
            return "https://via.placeholder.com/300x400/000000/FFFFFF?text=TikTok+Video"
        return "https://via.placeholder.com/300x200/4ECDC4/FFFFFF?text=Video"
    
    def _get_duration_estimate(self, platform: str) -> str:
        """Get estimated duration based on platform"""
        if platform == "youtube":
            return "5-15 min"
        elif platform == "instagram":
            return "15-30 sec"
        elif platform == "tiktok":
            return "15-60 sec"
        return "1-5 min"
    
    def _get_views_estimate(self) -> str:
        """Get estimated view count"""
        import random
        views = random.randint(1000, 1000000)
        if views >= 1000000:
            return f"{views//1000000}M views"
        elif views >= 1000:
            return f"{views//1000}K views"
        return f"{views} views"
    
    def _get_likes_estimate(self) -> str:
        """Get estimated like count"""
        import random
        likes = random.randint(50, 50000)
        if likes >= 1000:
            return f"{likes//1000}K likes"
        return f"{likes} likes"
    
    def get_trending_videos(self, place: str) -> Dict:
        """Get trending videos for a place (DB first, then fallback)"""
        place_lower = place.lower()
        now = datetime.utcnow()

        # Try DB cache (last 24h)
        with SessionLocal() as db:
            recent = (
                db.query(Video)
                .filter(Video.city == place_lower)
                .order_by(Video.trending_score.desc(), Video.last_updated.desc())
                .limit(10)
                .all()
            )
            if recent:
                videos = [
                    {
                        "url": v.url,
                        "platform": v.platform,
                        "title": v.title,
                        "thumbnail": v.thumbnail,
                        "duration": None,
                        "views": None,
                        "likes": None,
                    }
                    for v in recent
                ]
                return {"title": f"Trending Videos for {place.capitalize()}", "videos": videos, "total_count": len(videos)}

        # Fallback to file
        if place_lower not in self.video_data:
            return {"title": f"Trending Videos for {place.capitalize()}", "videos": [], "message": f"No trending videos found for {place.capitalize()}"}
        trending_videos = self.video_data[place_lower].get("trending", [])
        return {"title": f"Trending Videos for {place.capitalize()}", "videos": trending_videos[:5], "total_count": len(trending_videos)}

    async def fetch_live_trending(self, place: str) -> List[Dict]:
        """Fetch live trending short videos via public endpoints or scrapers (placeholder)."""
        place_q = place.replace(" ", "%20")
        results: List[Dict] = []

        # NOTE: Replace with official APIs where available.
        # Placeholder: construct search URLs for manual review/scraper integration.
        results.append({
            "platform": "youtube",
            "url": f"https://www.youtube.com/results?search_query={place_q}%20shorts",
            "title": f"Trending YouTube Shorts for {place}",
            "thumbnail": None,
        })
        results.append({
            "platform": "instagram",
            "url": f"https://www.instagram.com/explore/search/keyword/?q={place_q}",
            "title": f"Trending Instagram Reels for {place}",
            "thumbnail": None,
        })
        results.append({
            "platform": "tiktok",
            "url": f"https://www.tiktok.com/search?q={place_q}",
            "title": f"Trending TikTok for {place}",
            "thumbnail": None,
        })
        return results

    def cache_videos(self, city: str, videos: List[Dict]) -> int:
        """Persist fetched videos into DB cache."""
        saved = 0
        with SessionLocal() as db:
            for v in videos:
                rec = Video(
                    city=city.lower(),
                    platform=v.get("platform", "unknown"),
                    url=v.get("url", ""),
                    trending_score=float(v.get("trending_score", 0.0)),
                    title=v.get("title"),
                    thumbnail=v.get("thumbnail"),
                    last_updated=datetime.utcnow(),
                )
                db.add(rec)
                saved += 1
            db.commit()
        return saved
    
    def get_video_by_category(self, place: str, category: str) -> Dict:
        """Get videos by category (food, culture, adventure, etc.)"""
        place_lower = place.lower()
        
        if place_lower not in self.video_data:
            return {
                "title": f"{category.title()} Videos for {place.capitalize()}",
                "videos": [],
                "message": f"No {category} videos found for {place.capitalize()}"
            }
        
        category_videos = self.video_data[place_lower].get("categories", {}).get(category, [])
        
        return {
            "title": f"{category.title()} Videos for {place.capitalize()}",
            "videos": category_videos[:8],  # Limit to 8 videos
            "total_count": len(category_videos)
        }
    
    def get_instagram_reels(self, place: str) -> Dict:
        """Get Instagram reels for a place"""
        return self.get_video_recommendations(place, "instagram")
    
    def get_youtube_videos(self, place: str) -> Dict:
        """Get YouTube videos for a place"""
        return self.get_video_recommendations(place, "youtube")
    
    def get_tiktok_videos(self, place: str) -> Dict:
        """Get TikTok videos for a place"""
        return self.get_video_recommendations(place, "tiktok")

# Legacy function for backward compatibility
def video_recs(place: str) -> Dict:
    """Legacy function for backward compatibility"""
    video_service = VideoService()
    p = place.lower()
    d = video_service.video_data.get(p, {})
    # Always return keys to keep schema stable
    return {
        "place": p,
        "youtube_shorts": d.get("youtube_shorts", [])[:5],
        "tiktok": d.get("tiktok", [])[:5],
        "instagram_reels": d.get("instagram_reels", [])[:5],
    }
