"""Data access for the agent router.

``SupabaseStore`` talks to the same Supabase tables the dashboard uses.
``InMemoryStore`` holds the same data in dictionaries for tests and demos.
Both expose the same methods, so the router never knows which one it has.
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Protocol


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


class Store(Protocol):
    def find_customer(self, tenant_id: int, phone: str) -> Optional[Dict[str, Any]]: ...
    def unpaid_payments(self, tenant_id: int, customer_id: Any) -> List[Dict[str, Any]]: ...
    def latest_order(self, tenant_id: int, customer_id: Any) -> Optional[Dict[str, Any]]: ...
    def is_staff(self, tenant_id: int, phone: str) -> bool: ...
    def is_opted_out(self, tenant_id: int, phone: str) -> bool: ...
    def record_opt_out(self, tenant_id: int, phone: str, message: str) -> None: ...
    def opted_in_customer_count(self, tenant_id: int) -> int: ...
    def queue_broadcast(self, tenant_id: int, requested_by: str, message: str, recipients: int) -> Dict[str, Any]: ...
    def create_handoff(self, tenant_id: int, phone: str, message: str, intent: str, confidence: float, reason: str) -> Dict[str, Any]: ...


class InMemoryStore:
    def __init__(self, customers=None, payments=None, orders=None, staff_phones=None):
        self.customers: List[Dict[str, Any]] = customers or []
        self.payments: List[Dict[str, Any]] = payments or []
        self.orders: List[Dict[str, Any]] = orders or []
        self.staff_phones: Dict[int, set] = staff_phones or {}
        self.opt_outs: List[Dict[str, Any]] = []
        self.broadcasts: List[Dict[str, Any]] = []
        self.handoffs: List[Dict[str, Any]] = []

    def find_customer(self, tenant_id, phone):
        return next((c for c in self.customers if c["tenant_id"] == tenant_id and c["phone"] == phone), None)

    def unpaid_payments(self, tenant_id, customer_id):
        return [p for p in self.payments
                if p["tenant_id"] == tenant_id and p["customer_id"] == customer_id and p.get("status") != "paid"]

    def latest_order(self, tenant_id, customer_id):
        mine = [o for o in self.orders if o["tenant_id"] == tenant_id and o["customer_id"] == customer_id]
        return max(mine, key=lambda o: o["created_at"]) if mine else None

    def is_staff(self, tenant_id, phone):
        return phone in self.staff_phones.get(tenant_id, set())

    def is_opted_out(self, tenant_id, phone):
        return any(o["tenant_id"] == tenant_id and o["phone"] == phone for o in self.opt_outs)

    def record_opt_out(self, tenant_id, phone, message):
        if not self.is_opted_out(tenant_id, phone):
            self.opt_outs.append({"tenant_id": tenant_id, "phone": phone, "message": message, "created_at": _now()})

    def opted_in_customer_count(self, tenant_id):
        return sum(1 for c in self.customers
                   if c["tenant_id"] == tenant_id and not self.is_opted_out(tenant_id, c["phone"]))

    def queue_broadcast(self, tenant_id, requested_by, message, recipients):
        row = {"id": len(self.broadcasts) + 1, "tenant_id": tenant_id, "requested_by": requested_by,
               "message": message, "recipient_count": recipients, "status": "pending_approval", "created_at": _now()}
        self.broadcasts.append(row)
        return row

    def create_handoff(self, tenant_id, phone, message, intent, confidence, reason):
        row = {"id": len(self.handoffs) + 1, "tenant_id": tenant_id, "phone": phone, "message": message,
               "predicted_intent": intent, "confidence": round(confidence, 3), "reason": reason,
               "status": "open", "created_at": _now()}
        self.handoffs.append(row)
        return row


class SupabaseStore:
    """Reads app_customers, orders, app_payments and app_tenants; writes
    opt_outs, broadcast_requests and human_handoffs (see database/agent_schema.sql)."""

    def __init__(self, client):
        self.db = client

    def _table(self, name):
        return self.db.schema("public").table(name)

    def find_customer(self, tenant_id, phone):
        rows = self._table("app_customers").select("*").eq("tenant_id", tenant_id).eq("phone", phone).limit(1).execute().data
        return rows[0] if rows else None

    def unpaid_payments(self, tenant_id, customer_id):
        rows = self._table("app_payments").select("*").eq("tenant_id", tenant_id).eq("customer_id", customer_id).execute().data or []
        return [p for p in rows if (p.get("status") or p.get("payment_status")) != "paid"]

    def latest_order(self, tenant_id, customer_id):
        rows = (self._table("orders").select("*").eq("tenant_id", tenant_id).eq("customer_id", customer_id)
                .order("created_at", desc=True).limit(1).execute().data)
        return rows[0] if rows else None

    def is_staff(self, tenant_id, phone):
        rows = self._table("app_tenants").select("whatsapp_number").eq("tenant_id", tenant_id).limit(1).execute().data
        return bool(rows) and rows[0].get("whatsapp_number") == phone

    def is_opted_out(self, tenant_id, phone):
        rows = self._table("opt_outs").select("phone").eq("tenant_id", tenant_id).eq("phone", phone).limit(1).execute().data
        return bool(rows)

    def record_opt_out(self, tenant_id, phone, message):
        self._table("opt_outs").upsert({"tenant_id": tenant_id, "phone": phone, "message": message},
                                       on_conflict="tenant_id,phone").execute()

    def opted_in_customer_count(self, tenant_id):
        customers = self._table("app_customers").select("phone").eq("tenant_id", tenant_id).execute().data or []
        opted = {r["phone"] for r in (self._table("opt_outs").select("phone").eq("tenant_id", tenant_id).execute().data or [])}
        return sum(1 for c in customers if c.get("phone") not in opted)

    def queue_broadcast(self, tenant_id, requested_by, message, recipients):
        row = {"tenant_id": tenant_id, "requested_by": requested_by, "message": message,
               "recipient_count": recipients, "status": "pending_approval"}
        return (self._table("broadcast_requests").insert(row).execute().data or [row])[0]

    def create_handoff(self, tenant_id, phone, message, intent, confidence, reason):
        row = {"tenant_id": tenant_id, "phone": phone, "message": message, "predicted_intent": intent,
               "confidence": round(confidence, 3), "reason": reason, "status": "open"}
        return (self._table("human_handoffs").insert(row).execute().data or [row])[0]
