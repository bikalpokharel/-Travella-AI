from fastapi.testclient import TestClient
from src.api import app

client = TestClient(app)

def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    assert "status" in r.json()

def test_videos_schema():
    r = client.post("/videos", json={"place":"kathmandu"})
    js = r.json()
    assert "youtube_shorts" in js and "tiktok" in js and "instagram_reels" in js