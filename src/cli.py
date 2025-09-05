import sys, json
from .predict import Predictor
from .entities import load_cities, parse_entities
from .config import CITIES_TXT
from .services import recommend, videos

def main():
    load_cities(CITIES_TXT)
    if len(sys.argv) < 2:
        print('Usage: python -m src.cli "your query"'); sys.exit(1)
    q = " ".join(sys.argv[1:])
    pred = Predictor().predict(q)
    ents = parse_entities(q)
    print(f"Intent: {pred['intent']} ({pred['confidence']:.2f})")
    print("Entities:", ents)
    sug = recommend.suggest(pred["intent"], ents.get("city"))
    print("Suggestions:")
    for s in sug.get("results", []):
        print("-", s)
    if ents.get("city"):
        v = videos.video_recs(ents["city"])
        if any([v["youtube_shorts"], v["tiktok"], v["instagram_reels"]]):
            print("Short videos:", json.dumps(v, indent=2))

if __name__ == "__main__":
    main()