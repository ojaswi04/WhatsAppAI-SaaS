"""Routes each incoming WhatsApp message to the right handler.

    payment_query      -> look up the customer's unpaid payments
    order_tracking     -> look up the customer's latest order
    broadcast_request  -> staff only: queue a consent-checked broadcast for approval
    opt_out            -> record the opt-out immediately and confirm
    greeting           -> friendly reply from the template library
    confidence < 0.70  -> human handoff (also: unknown customers, non-staff broadcasts)
"""
from __future__ import annotations

from dataclasses import asdict, dataclass, field
from typing import Any, Dict, Optional

from .classifier import IntentClassifier
from .reply_templates import get_reply
from .store import Store

DEFAULT_THRESHOLD = 0.70


@dataclass
class RouteResult:
    intent: str
    confidence: float
    action: str
    reply: str
    handoff: bool = False
    handoff_reason: Optional[str] = None
    data: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


HANDOFF_REPLY = "Thanks for your message! A member of our team will get back to you shortly."


def _money(amount: Any) -> str:
    try:
        return f"₹{float(amount):,.2f}"
    except (TypeError, ValueError):
        return str(amount)


class IntentRouter:
    def __init__(self, store: Store, classifier: Optional[IntentClassifier] = None,
                 threshold: float = DEFAULT_THRESHOLD):
        self.store = store
        self.classifier = classifier or IntentClassifier()
        self.threshold = threshold

    # ------------------------------------------------------------------ entry
    def route(self, tenant_id: int, phone: str, text: str) -> RouteResult:
        pred = self.classifier.predict(text)

        if pred.intent == "opt_out" and (pred.rule or pred.confidence >= self.threshold):
            return self._opt_out(tenant_id, phone, text, pred.confidence)

        if pred.confidence < self.threshold:
            return self._handoff(tenant_id, phone, text, pred.intent, pred.confidence,
                                 f"low confidence ({pred.confidence:.2f} < {self.threshold:.2f})")

        handler = {
            "payment_query": self._payment_query,
            "order_tracking": self._order_tracking,
            "broadcast_request": self._broadcast_request,
            "greeting": self._greeting,
        }.get(pred.intent)
        if handler is None:
            return self._handoff(tenant_id, phone, text, pred.intent, pred.confidence, "unsupported intent")
        return handler(tenant_id, phone, text, pred.confidence)

    # --------------------------------------------------------------- handlers
    def _payment_query(self, tenant_id, phone, text, conf) -> RouteResult:
        customer = self.store.find_customer(tenant_id, phone)
        if not customer:
            return self._handoff(tenant_id, phone, text, "payment_query", conf, "customer not found")
        dues = self.store.unpaid_payments(tenant_id, customer["customer_id"])
        if not dues:
            reply = "You have no pending payments with us. Thank you! 😊"
        else:
            total = sum(float(p.get("amount") or 0) for p in dues)
            reply = (f"You have {len(dues)} pending payment(s) totalling {_money(total)}. "
                     + get_reply("PAYMENT"))
        return RouteResult("payment_query", conf, "payment_lookup", reply,
                           data={"pending_count": len(dues), "pending": dues})

    def _order_tracking(self, tenant_id, phone, text, conf) -> RouteResult:
        customer = self.store.find_customer(tenant_id, phone)
        if not customer:
            return self._handoff(tenant_id, phone, text, "order_tracking", conf, "customer not found")
        order = self.store.latest_order(tenant_id, customer["customer_id"])
        if not order:
            reply = "I couldn't find any orders on your number. Could you share your order ID?"
        else:
            status = order.get("status") or "received"
            reply = f"Your latest order #{order['order_id']} is currently: {status}."
        return RouteResult("order_tracking", conf, "order_lookup", reply, data={"order": order})

    def _broadcast_request(self, tenant_id, phone, text, conf) -> RouteResult:
        if not self.store.is_staff(tenant_id, phone):
            return self._handoff(tenant_id, phone, text, "broadcast_request", conf,
                                 "broadcast requested by non-staff number")
        recipients = self.store.opted_in_customer_count(tenant_id)
        row = self.store.queue_broadcast(tenant_id, phone, text, recipients)
        reply = (f"Broadcast queued for approval. It will reach {recipients} customer(s) "
                 "who have not opted out.")
        return RouteResult("broadcast_request", conf, "broadcast_queued", reply, data={"broadcast": row})

    def _opt_out(self, tenant_id, phone, text, conf) -> RouteResult:
        self.store.record_opt_out(tenant_id, phone, text)
        reply = "You've been unsubscribed and won't receive promotional messages from us."
        return RouteResult("opt_out", conf, "opt_out_recorded", reply)

    def _greeting(self, tenant_id, phone, text, conf) -> RouteResult:
        return RouteResult("greeting", conf, "reply", get_reply("GREETING"))

    def _handoff(self, tenant_id, phone, text, intent, conf, reason) -> RouteResult:
        row = self.store.create_handoff(tenant_id, phone, text, intent, conf, reason)
        return RouteResult(intent, conf, "human_handoff", HANDOFF_REPLY, handoff=True,
                           handoff_reason=reason, data={"handoff": row})
