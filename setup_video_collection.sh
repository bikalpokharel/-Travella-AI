#!/bin/bash
# Video Collection Setup Script
# This script sets up automatic video collection for the travel assistant

echo "🎥 Setting up Video Collection System..."

# Make scripts executable
chmod +x manage_videos.py
chmod +x collect_videos.py

# Create log directory
mkdir -p logs

# Setup cron job for daily video collection at 2 AM
echo "📅 Setting up daily video collection cron job..."
(crontab -l 2>/dev/null; echo "0 2 * * * cd $(pwd) && source .venv/bin/activate && python manage_videos.py --collect-all --max-videos 5 >> logs/video_collection.log 2>&1") | crontab -

echo "✅ Video collection system setup complete!"
echo ""
echo "📋 Available commands:"
echo "  python manage_videos.py --collect kathmandu     # Collect for specific destination"
echo "  python manage_videos.py --collect-all           # Collect for all destinations"
echo "  python manage_videos.py --stats                 # Show collection statistics"
echo "  python manage_videos.py --schedule              # Start scheduled collection"
echo ""
echo "📊 Check logs: tail -f logs/video_collection.log"
echo "🗑️  Remove cron job: crontab -e (remove the video collection line)"
