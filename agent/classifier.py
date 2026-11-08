"""Intent classifier for incoming WhatsApp messages.

A TF-IDF (word + character n-gram) logistic-regression model trained on
labelled example phrases in ``data/intent_examples.json``. Character n-grams
make it tolerant to typos and Hinglish spellings ("kahan", "kab aayega").

Explicit opt-out keywords (STOP, UNSUBSCRIBE, ...) are matched by rule before
the model runs, because opting out is a compliance requirement and must never
depend on a probabilistic score.
"""
from __future__ import annotations

import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Optional, Tuple

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import FeatureUnion, Pipeline

DATA_PATH = Path(__file__).resolve().parent / "data" / "intent_examples.json"

OPT_OUT_PATTERN = re.compile(
    r"^\s*(stop|stop all|unsubscribe|opt[\s-]?out|cancel|end|quit)\s*[.!]*\s*$",
    re.IGNORECASE,
)


@dataclass
class Prediction:
    intent: str
    confidence: float
    scores: Dict[str, float]
    rule: Optional[str] = None


def load_examples(path: Path = DATA_PATH) -> Tuple[List[str], List[str]]:
    data = json.loads(path.read_text(encoding="utf-8"))
    texts, labels = [], []
    for intent, phrases in data.items():
        for phrase in phrases:
            texts.append(phrase)
            labels.append(intent)
    return texts, labels


def normalise(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"https?://\S+", " ", text)
    text = re.sub(r"\d+", " 0 ", text)
    return re.sub(r"\s+", " ", text)


def build_pipeline() -> Pipeline:
    features = FeatureUnion([
        ("words", TfidfVectorizer(preprocessor=normalise, ngram_range=(1, 2), sublinear_tf=True)),
        ("chars", TfidfVectorizer(preprocessor=normalise, analyzer="char_wb", ngram_range=(2, 5), sublinear_tf=True)),
    ])
    model = LogisticRegression(C=16.0, max_iter=2000, class_weight="balanced")
    return Pipeline([("features", features), ("model", model)])


class IntentClassifier:
    def __init__(self, texts: Optional[List[str]] = None, labels: Optional[List[str]] = None):
        if texts is None or labels is None:
            texts, labels = load_examples()
        self.pipeline = build_pipeline().fit(texts, labels)
        self.labels: List[str] = list(self.pipeline.classes_)

    def predict(self, text: str) -> Prediction:
        if OPT_OUT_PATTERN.match(text or ""):
            scores = {label: 0.0 for label in self.labels}
            scores["opt_out"] = 1.0
            return Prediction("opt_out", 1.0, scores, rule="opt_out_keyword")

        probs = self.pipeline.predict_proba([text or ""])[0]
        scores = {label: float(p) for label, p in zip(self.labels, probs)}
        intent = max(scores, key=scores.get)
        return Prediction(intent, scores[intent], scores)
