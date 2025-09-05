# Travel Assistant Pro — v1 (Final Product)

An opinionated, production-ready starter for your travel NLP assistant. It covers:
- **Plan / Book / Discover**: itineraries, hotel tips, transport options.
- **Local gems & food**: curated "hidden places" and dishes by city.
- **Short‑video recs**: return platform links (YouTube Shorts, TikTok, Instagram Reels).
- **Target users**: solo & backpackers, families, groups, couples, digital nomads, international & domestic tourists, business travelers, hospitality partners, local guides, adventure providers, event visitors, frequent travelers (subscription), and **white‑label** travel agencies.
- **Multilingual** (EN/Nepali demo) via lightweight i18n.
- **FastAPI** with clear endpoints and OpenAPI docs.
- **Sklearn intent model** + simple entity parsing (city, days, budget, pax).
- **Recommender** that blends rules + heuristic scoring.

> This repo supports both **local AI** (fully offline) and **advanced LLMs** (OpenAI GPT, Anthropic Claude). The local AI provides fast intent classification and recommendations, while LLMs enable rich, contextual responses. Booking and social integrations are provided as clean **adapters** you can wire to vendors later.

---

## Quickstart

### Basic Setup (Local AI Only)
```bash
python -m venv .venv
source .venv/bin/activate       # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Train intent model
python -m src.train

# Run API
uvicorn src.api:app --reload
# Open http://127.0.0.1:8000/docs
```

### Advanced Setup (With LLM Integration)
```bash
# Install LLM dependencies
pip install -r requirements.txt

# Run LLM setup script
python setup_llm.py

# Restart API server
uvicorn src.api:app --reload
```

## Key Endpoints
- `POST /predict` → detect intent, entities, suggestions.
- `POST /plan` → city + days + profile → day-by-day plan (gems/food/activities).
- `POST /videos` → city or place → short‑video links (YT Shorts, TikTok, IG Reels).
- `POST /book/suggest` → booking tips + deeplink stubs for hotels & flights.
- `POST /agency/itinerary` → white‑label itinerary with agency branding.
- `GET  /health` → service status.

## Multilingual
Send header `X-Lang: ne` for Nepali (demo strings), default is English (`en`).

## Project Layout
```
travel-assistant-pro-v1/
├── data/
│   ├── sample_queries.csv
│   ├── places.json
│   ├── foods.json
│   ├── hidden_gems.json
│   ├── video_links.json
│   ├── cities_nepal.txt
│   └── partners.json
├── models/
├── src/
│   ├── api.py
│   ├── predict.py
│   ├── model.py
│   ├── preprocess.py
│   ├── entities.py
│   ├── config.py
│   ├── services/
│   │   ├── recommend.py
│   │   ├── booking.py
│   │   ├── videos.py
│   │   └── i18n.py
│   ├── cli.py
│   └── train.py
├── src/i18n/
│   ├── en.json
│   └── ne.json
├── tests/
│   └── test_endpoints_smoke.py
├── README.md
├── requirements.txt
├── Dockerfile
├── Makefile
└── .gitignore
```

## Notes
- Replace placeholder partner deeplinks in `data/partners.json` with real affiliates.
- Extend `hidden_gems.json`, `video_links.json` per city/POI.
- For production: add a DB + auth, caching, rate limits, analytics, tracing.