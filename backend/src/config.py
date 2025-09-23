from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
MODELS_DIR = ROOT / "models"

INTENT_DATA = DATA_DIR / "sample_queries.csv"
PLACES_JSON = DATA_DIR / "places.json"
FOODS_JSON = DATA_DIR / "foods.json"
GEMS_JSON = DATA_DIR / "hidden_gems.json"
VIDEOS_JSON = DATA_DIR / "video_links.json"
PARTNERS_JSON = DATA_DIR / "partners.json"
CITIES_TXT = DATA_DIR / "cities_nepal.txt"

MODEL_PATH = MODELS_DIR / "intent_clf.joblib"
TEST_SIZE = 0.5
RANDOM_STATE = 42
MAX_FEATURES = 3000
NGRAM_RANGE = (1, 2)
MIN_CONFIDENCE = 0.45
DEFAULT_LANG = "en"