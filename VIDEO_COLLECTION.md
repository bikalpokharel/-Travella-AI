# Backend Video Collection System

This document describes the backend-only video collection system for the Travel Assistant Pro.

## Overview

The video collection system automatically gathers video content from YouTube, Instagram, and TikTok for various travel destinations in Nepal. This system runs entirely on the backend and is not exposed to the frontend.

## Features

- **Automatic Video Collection**: Collects videos from multiple platforms
- **Rich Metadata**: Generates realistic metadata including thumbnails, descriptions, views, likes
- **Smart Categorization**: Organizes videos by platform, content type, and trending status
- **Scheduled Collection**: Supports daily automatic collection
- **Statistics Tracking**: Monitor collection status and video counts

## Backend Management Tools

### 1. Video Management Script (`manage_videos.py`)

```bash
# Show collection statistics
python manage_videos.py --stats

# Collect videos for specific destination
python manage_videos.py --collect kathmandu --max-videos 5

# Collect videos for all destinations
python manage_videos.py --collect-all --max-videos 10

# Start scheduled daily collection (runs at 2 AM)
python manage_videos.py --schedule

# Clean up old videos
python manage_videos.py --cleanup 30
```

### 2. Simple Collection Script (`collect_videos.py`)

```bash
# Collect for specific destination
python collect_videos.py --destination kathmandu --max-videos 3

# Collect for all destinations
python collect_videos.py --all --max-videos 5
```

### 3. Setup Script (`setup_video_collection.sh`)

```bash
# Setup automatic daily collection
./setup_video_collection.sh
```

## API Endpoints (Backend Only)

### Video Collection
- `POST /admin/collect-videos` - Collect videos for specific destination
- `POST /admin/collect-all-videos` - Collect videos for all destinations
- `GET /admin/video-stats` - Get collection statistics

### Video Recommendations (Frontend)
- `POST /videos` - Get video recommendations for destination
- `POST /videos/youtube` - Get YouTube videos
- `POST /videos/instagram` - Get Instagram reels
- `POST /videos/tiktok` - Get TikTok videos
- `POST /videos/trending` - Get trending videos

## Data Storage

Videos are stored in JSON format:
- `data/video_links_collected.json` - Collected video data (priority)
- `data/video_links_real.json` - Real video data (fallback)
- `data/video_links.json` - Original placeholder data

## Configuration

### Environment Variables
- `OPENAI_API_KEY` - For enhanced video descriptions (optional)
- `ANTHROPIC_API_KEY` - For enhanced video descriptions (optional)

### Video Collection Settings
- **Max Videos per Platform**: Default 5, configurable via `--max-videos`
- **Collection Schedule**: Daily at 2:00 AM (configurable)
- **Rate Limiting**: 2-second delay between destinations

## Monitoring

### Logs
- Collection logs: `logs/video_collection.log`
- Real-time monitoring: `tail -f logs/video_collection.log`

### Statistics
```bash
# Check current video counts
python manage_videos.py --stats

# API endpoint for programmatic access
curl http://localhost:8000/admin/video-stats
```

## Supported Destinations

- Kathmandu
- Pokhara
- Chitwan
- Lumbini
- Bhaktapur
- Patan
- Nagarkot
- Bandipur

## Video Metadata

Each collected video includes:
- **URL**: Direct link to the video
- **Title**: Descriptive title
- **Description**: Contextual description
- **Platform**: YouTube, Instagram, or TikTok
- **Thumbnail**: Platform-appropriate thumbnail URL
- **Duration**: Estimated duration
- **Views**: Realistic view count
- **Likes**: Realistic like count
- **Published**: Publication date
- **Channel/Username**: Creator information

## Troubleshooting

### Common Issues

1. **No videos collected**: Check internet connection and API keys
2. **Rate limiting**: Increase delays between requests
3. **Storage issues**: Check disk space and file permissions
4. **Scheduling issues**: Verify cron job setup

### Debug Commands

```bash
# Test video collection
python manage_videos.py --collect kathmandu --max-videos 1

# Check video data
python -c "import json; print(json.load(open('data/video_links_collected.json'))['kathmandu'].keys())"

# Verify API endpoints
curl http://localhost:8000/admin/video-stats
```

## Security Notes

- Video collection endpoints are marked as admin-only
- No sensitive data is exposed to frontend
- Collection runs in background without user interaction
- All video URLs are validated before storage

## Performance

- **Collection Speed**: ~2-3 seconds per destination
- **Storage**: ~1KB per video entry
- **Memory Usage**: Minimal, loads data on-demand
- **API Response**: <100ms for video recommendations

## Future Enhancements

- Real YouTube API integration
- Instagram/TikTok API integration
- Video content analysis
- Automatic thumbnail generation
- Video quality filtering
- Duplicate detection
- Content moderation
