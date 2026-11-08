"""5-fold cross-validation of the intent classifier on the labelled examples.

Run from the repo root:  python -m agent.evaluate
"""
import numpy as np
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import StratifiedKFold, cross_val_predict

from .classifier import build_pipeline, load_examples
from .router import DEFAULT_THRESHOLD


def main() -> None:
    texts, labels = load_examples()
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=0)
    proba = cross_val_predict(build_pipeline(), texts, labels, cv=cv, method="predict_proba")
    classes = sorted(set(labels))
    pred = np.array(classes)[proba.argmax(axis=1)]
    conf = proba.max(axis=1)
    y = np.array(labels)
    auto = conf >= DEFAULT_THRESHOLD

    print(f"examples: {len(texts)}  intents: {len(classes)}")
    print(f"overall accuracy (5-fold CV): {accuracy_score(y, pred):.3f}")
    print(f"auto-handled at confidence >= {DEFAULT_THRESHOLD}: {auto.mean():.1%} of messages, "
          f"accuracy {accuracy_score(y[auto], pred[auto]):.3f}")
    print(f"sent to a human: {(~auto).mean():.1%}\n")
    print(classification_report(y, pred, digits=2))


if __name__ == "__main__":
    main()
