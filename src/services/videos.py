import json
from typing import Dict, List, Optional
from pathlib import Path
from ..config import VIDEOS_JSON

class VideoService:
    def __init__(self):
        self.video_data = self._load_video_data()
    
    def _load_video_data(self) -> Dict:
        """Load video data from JSON file"""
        try:
            with open(VIDEOS_JSON, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"Warning: Could not load video data: {e}")
            return {}
    
    def get_video_recommendations(self, place: str, video_type: str = "all") -> Dict:
        """Get video recommendations for a place"""
        place_lower = place.lower()
        
        if place_lower not in self.video_data:
            return {
                "title": f"Videos for {place.capitalize()}",
                "videos": [],
                "message": f"No videos found for {place.capitalize()}"
            }
        
        place_videos = self.video_data[place_lower]
        
        if video_type == "instagram":
            videos = place_videos.get("instagram_reels", [])
            title = f"Instagram Reels for {place.capitalize()}"
        elif video_type == "youtube":
            videos = place_videos.get("youtube_videos", []) + place_videos.get("youtube_shorts", [])
            title = f"YouTube Videos for {place.capitalize()}"
        elif video_type == "tiktok":
            videos = place_videos.get("tiktok", [])
            title = f"TikTok Videos for {place.capitalize()}"
        else:
            # Combine all types
            instagram_videos = place_videos.get("instagram_reels", [])
            youtube_videos = place_videos.get("youtube_videos", []) + place_videos.get("youtube_shorts", [])
            tiktok_videos = place_videos.get("tiktok", [])
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
    
    def get_trending_videos(self, place: str) -> Dict:
        """Get trending videos for a place"""
        place_lower = place.lower()
        
        if place_lower not in self.video_data:
            return {
                "title": f"Trending Videos for {place.capitalize()}",
                "videos": [],
                "message": f"No trending videos found for {place.capitalize()}"
            }
        
        trending_videos = self.video_data[place_lower].get("trending", [])
        
        return {
            "title": f"Trending Videos for {place.capitalize()}",
            "videos": trending_videos[:5],  # Top 5 trending
            "total_count": len(trending_videos)
        }
    
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
