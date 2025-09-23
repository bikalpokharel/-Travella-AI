from joblib import load
from .config import MODEL_PATH, MIN_CONFIDENCE
from .preprocess import normalize

class Predictor:
    def __init__(self, model_path=str(MODEL_PATH)):
        self.model = load(model_path)
        self.classes_ = list(self.model.classes_)

    def predict(self, text: str):
        t = normalize(text)
        proba = self.model.predict_proba([t])[0]
        idx = int(proba.argmax())
        return {"intent": self.classes_[idx], "confidence": float(proba[idx])}

    def confident(self, conf: float) -> bool:
        return conf >= MIN_CONFIDENCE