from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from .config import MAX_FEATURES, NGRAM_RANGE

def build_pipeline():
    return Pipeline([
        ("tfidf", TfidfVectorizer(max_features=MAX_FEATURES, ngram_range=NGRAM_RANGE)),
        ("clf", LogisticRegression(max_iter=300)),
    ])