"""Tests for the WhatsApp intent agent. Run from the repo root: pytest -q"""
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from agent import InMemoryStore, IntentClassifier, IntentRouter  # noqa: E402

TENANT = 1
CUSTOMER = "919800000001"
OWNER = "919900000000"


@pytest.fixture(scope="module")
def classifier():
    return IntentClassifier()


@pytest.fixture
def store():
    return InMemoryStore(
        customers=[
            {"tenant_id": TENANT, "customer_id": "c1", "phone": CUSTOMER, "name": "Demo Customer"},
            {"tenant_id": TENANT, "customer_id": "c2", "phone": "919800000002", "name": "Second Customer"},
            {"tenant_id": 2, "customer_id": "x1", "phone": "919800000009", "name": "Other Tenant"},
        ],
        payments=[
            {"tenant_id": TENANT, "customer_id": "c1", "amount": 450, "status": "unpaid"},
            {"tenant_id": TENANT, "customer_id": "c1", "amount": 200, "status": "paid"},
        ],
        orders=[
            {"tenant_id": TENANT, "customer_id": "c1", "order_id": 101, "status": "packed", "created_at": "2026-11-01T10:00:00"},
            {"tenant_id": TENANT, "customer_id": "c1", "order_id": 102, "status": "out for delivery", "created_at": "2026-11-07T09:00:00"},
        ],
        staff_phones={TENANT: {OWNER}},
    )


@pytest.fixture
def router(store, classifier):
    return IntentRouter(store, classifier, threshold=0.70)


@pytest.mark.parametrize("text,intent", [
    ("where is my order", "order_tracking"),
    ("mera order kahan hai", "order_tracking"),
    ("how much do I owe", "payment_query"),
    ("send this offer to all customers", "broadcast_request"),
    ("stop sending me messages", "opt_out"),
    ("hello", "greeting"),
])
def test_classifier_known_phrases(classifier, text, intent):
    assert classifier.predict(text).intent == intent


def test_stop_keyword_is_rule_based(classifier):
    pred = classifier.predict("STOP")
    assert pred.intent == "opt_out" and pred.confidence == 1.0 and pred.rule == "opt_out_keyword"


def test_payment_query_reports_only_unpaid(router):
    r = router.route(TENANT, CUSTOMER, "how much is pending on my account")
    assert r.intent == "payment_query" and not r.handoff
    assert r.data["pending_count"] == 1 and "450" in r.reply


def test_order_tracking_returns_latest_order(router):
    r = router.route(TENANT, CUSTOMER, "where is my order")
    assert r.action == "order_lookup" and "#102" in r.reply and "out for delivery" in r.reply


def test_opt_out_is_recorded_and_excluded_from_broadcast(router, store):
    r = router.route(TENANT, CUSTOMER, "STOP")
    assert r.action == "opt_out_recorded" and store.is_opted_out(TENANT, CUSTOMER)
    b = router.route(TENANT, OWNER, "send diwali offer to all customers")
    assert b.action == "broadcast_queued"
    assert b.data["broadcast"]["recipient_count"] == 1  # 2 tenant customers minus 1 opt-out


def test_broadcast_from_customer_goes_to_human(router, store):
    r = router.route(TENANT, CUSTOMER, "broadcast a message to everyone")
    assert r.handoff and r.handoff_reason == "broadcast requested by non-staff number"
    assert store.broadcasts == [] and len(store.handoffs) == 1


def test_off_topic_message_goes_to_human(router, store):
    r = router.route(TENANT, CUSTOMER, "do you sell red shoes in size 8")
    assert r.handoff and r.action == "human_handoff" and len(store.handoffs) == 1


def test_low_confidence_triggers_handoff(store, classifier):
    strict = IntentRouter(store, classifier, threshold=0.999)
    r = strict.route(TENANT, CUSTOMER, "where is my order")
    assert r.handoff and r.handoff_reason.startswith("low confidence")


def test_unknown_customer_goes_to_human(router):
    r = router.route(TENANT, "910000000000", "how much do I owe")
    assert r.handoff and r.handoff_reason == "customer not found"


def test_tenants_are_isolated(router):
    r = router.route(2, CUSTOMER, "where is my order")
    assert r.handoff and r.handoff_reason == "customer not found"
