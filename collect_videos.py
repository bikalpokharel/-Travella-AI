#!/usr/bin/env python3
"""
Video Collection Management Script
This script helps collect and manage video data for the travel assistant.
"""

import sys
import argparse
from pathlib import Path

# Add src to path
sys.path.append(str(Path(__file__).parent / "src"))

from services.video_collector import VideoCollector

def main():
    parser = argparse.ArgumentParser(description="Collect videos for travel destinations")
    parser.add_argument("--destination", "-d", help="Specific destination to collect videos for")
    parser.add_argument("--all", "-a", action="store_true", help="Collect videos for all destinations")
    parser.add_argument("--max-videos", "-m", type=int, default=5, help="Maximum videos per platform (default: 5)")
    
    args = parser.parse_args()
    
    collector = VideoCollector()
    
    if args.all:
        print("🎥 Collecting videos for all destinations...")
        result = collector.collect_all_destinations()
        print(f"✅ Successfully collected videos for {len(result)} destinations")
        for dest, data in result.items():
            youtube_count = len(data.get("youtube_videos", []))
            instagram_count = len(data.get("instagram_reels", []))
            tiktok_count = len(data.get("tiktok", []))
            print(f"  📍 {dest.capitalize()}: {youtube_count} YouTube, {instagram_count} Instagram, {tiktok_count} TikTok")
    
    elif args.destination:
        print(f"🎥 Collecting videos for {args.destination}...")
        result = collector.collect_videos_for_destination(args.destination, args.max_videos)
        youtube_count = len(result.get("youtube_videos", []))
        instagram_count = len(result.get("instagram_reels", []))
        tiktok_count = len(result.get("tiktok", []))
        print(f"✅ Successfully collected {youtube_count} YouTube, {instagram_count} Instagram, {tiktok_count} TikTok videos for {args.destination}")
    
    else:
        print("Please specify either --destination or --all")
        print("Examples:")
        print("  python collect_videos.py --destination kathmandu")
        print("  python collect_videos.py --all")
        print("  python collect_videos.py --destination pokhara --max-videos 10")

if __name__ == "__main__":
    main()
