import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
from joblib import dump
from .config import INTENT_DATA, MODEL_PATH, TEST_SIZE, RANDOM_STATE
from .model import build_pipeline
from .preprocess import normalize

def load_data():
    df = pd.read_csv(INTENT_DATA)
    df["text_norm"] = df["text"].astype(str).apply(normalize)
    return df

def main():
    df = load_data()
    X = df["text_norm"]; y = df["intent"]
    Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE, stratify=y)
    pipe = build_pipeline()
    pipe.fit(Xtr, ytr)
    preds = pipe.predict(Xte)
    acc = accuracy_score(yte, preds)
    print(f"Accuracy: {acc:.3f}")
    print(classification_report(yte, preds))
    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    dump(pipe, MODEL_PATH)
    print(f"Saved model to {MODEL_PATH}")

if __name__ == "__main__":
    main()

