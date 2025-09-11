#!/usr/bin/env python3
"""
Backend Video Collection Management System
This script manages video collection for the travel assistant backend.
"""

import sys
import argparse
import schedule
import time
from pathlib import Path
from datetime import datetime

# Add src to path
sys.path.append(str(Path(__file__).parent / "src"))

from services.video_collector import VideoCollector

class VideoManager:
    def __init__(self):
        self.collector = VideoCollector()
        self.destinations = [
            "kathmandu", "pokhara", "chitwan", "lumbini", 
            "bhaktapur", "patan", "nagarkot", "bandipur"
        ]
    
    def collect_videos_for_destination(self, destination: str, max_videos: int = 5):
        """Collect videos for a specific destination"""
        print(f"🎥 [{datetime.now().strftime('%H:%M:%S')}] Collecting videos for {destination}...")
        try:
            result = self.collector.collect_videos_for_destination(destination, max_videos)
            youtube_count = len(result.get("youtube_videos", []))
            instagram_count = len(result.get("instagram_reels", []))
            tiktok_count = len(result.get("tiktok", []))
            print(f"✅ [{datetime.now().strftime('%H:%M:%S')}] Collected {youtube_count} YouTube, {instagram_count} Instagram, {tiktok_count} TikTok videos for {destination}")
            return True
        except Exception as e:
            print(f"❌ [{datetime.now().strftime('%H:%M:%S')}] Error collecting videos for {destination}: {e}")
            return False
    
    def collect_all_videos(self, max_videos: int = 5):
        """Collect videos for all destinations"""
        print(f"🎥 [{datetime.now().strftime('%H:%M:%S')}] Starting video collection for all destinations...")
        success_count = 0
        
        for destination in self.destinations:
            if self.collect_videos_for_destination(destination, max_videos):
                success_count += 1
            time.sleep(2)  # Rate limiting between destinations
        
        print(f"✅ [{datetime.now().strftime('%H:%M:%S')}] Video collection completed! Successfully collected videos for {success_count}/{len(self.destinations)} destinations")
        return success_count == len(self.destinations)
    
    def schedule_daily_collection(self, max_videos: int = 5):
        """Schedule daily video collection at 2 AM"""
        print(f"📅 [{datetime.now().strftime('%H:%M:%S')}] Scheduling daily video collection at 2:00 AM...")
        
        schedule.every().day.at("02:00").do(self.collect_all_videos, max_videos)
        
        print("🔄 Video collection scheduler started. Press Ctrl+C to stop.")
        try:
            while True:
                schedule.run_pending()
                time.sleep(60)  # Check every minute
        except KeyboardInterrupt:
            print(f"\n⏹️  [{datetime.now().strftime('%H:%M:%S')}] Video collection scheduler stopped.")
    
    def get_collection_stats(self):
        """Get statistics about collected videos"""
        print(f"📊 [{datetime.now().strftime('%H:%M:%S')}] Video Collection Statistics:")
        print("-" * 50)
        
        total_youtube = 0
        total_instagram = 0
        total_tiktok = 0
        
        for destination in self.destinations:
            if destination in self.collector.video_data:
                data = self.collector.video_data[destination]
                youtube_count = len(data.get("youtube_videos", []))
                instagram_count = len(data.get("instagram_reels", []))
                tiktok_count = len(data.get("tiktok", []))
                
                total_youtube += youtube_count
                total_instagram += instagram_count
                total_tiktok += tiktok_count
                
                print(f"📍 {destination.capitalize():12} | YouTube: {youtube_count:2} | Instagram: {instagram_count:2} | TikTok: {tiktok_count:2}")
            else:
                print(f"📍 {destination.capitalize():12} | No data available")
        
        print("-" * 50)
        print(f"📈 Total Videos: {total_youtube + total_instagram + total_tiktok} (YouTube: {total_youtube}, Instagram: {total_instagram}, TikTok: {total_tiktok})")
    
    def cleanup_old_videos(self, days_old: int = 30):
        """Clean up videos older than specified days"""
        print(f"🧹 [{datetime.now().strftime('%H:%M:%S')}] Cleaning up videos older than {days_old} days...")
        # This would implement cleanup logic if needed
        print("✅ Cleanup completed (feature not implemented yet)")

def main():
    parser = argparse.ArgumentParser(description="Backend Video Collection Management")
    parser.add_argument("--collect", "-c", help="Collect videos for specific destination")
    parser.add_argument("--collect-all", "-a", action="store_true", help="Collect videos for all destinations")
    parser.add_argument("--schedule", "-s", action="store_true", help="Start scheduled video collection")
    parser.add_argument("--stats", action="store_true", help="Show collection statistics")
    parser.add_argument("--max-videos", "-m", type=int, default=5, help="Maximum videos per platform (default: 5)")
    parser.add_argument("--cleanup", type=int, help="Clean up videos older than N days")
    
    args = parser.parse_args()
    
    manager = VideoManager()
    
    if args.collect:
        manager.collect_videos_for_destination(args.collect, args.max_videos)
    elif args.collect_all:
        manager.collect_all_videos(args.max_videos)
    elif args.schedule:
        manager.schedule_daily_collection(args.max_videos)
    elif args.stats:
        manager.get_collection_stats()
    elif args.cleanup:
        manager.cleanup_old_videos(args.cleanup)
    else:
        print("Backend Video Collection Management System")
        print("=" * 50)
        print("Available commands:")
        print("  --collect DESTINATION    Collect videos for specific destination")
        print("  --collect-all            Collect videos for all destinations")
        print("  --schedule               Start scheduled daily collection")
        print("  --stats                  Show collection statistics")
        print("  --cleanup DAYS           Clean up old videos")
        print("  --max-videos N           Set max videos per platform")
        print("\nExamples:")
        print("  python manage_videos.py --collect kathmandu")
        print("  python manage_videos.py --collect-all --max-videos 10")
        print("  python manage_videos.py --schedule")
        print("  python manage_videos.py --stats")

if __name__ == "__main__":
    main()
