"""Agent endpoints.

POST /agent/route      called by the WhatsApp webhook service (server-to-server,
                       authenticated with the X-Agent-Key header)
GET  /agent/handoffs   open human-handoff tickets for the logged-in tenant
"""
import hmac
import os
import sys
from functools import lru_cache
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Depends, Header, HTTPException, Query
from pydantic import BaseModel, Field

REPO_ROOT = Path(__file__).resolve().parents[2]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from agent import IntentClassifier, IntentRouter, SupabaseStore  # noqa: E402
from auth_backend import get_current_tenant_id  # noqa: E402

router = APIRouter(prefix="/agent", tags=["agent"])


class IncomingMessage(BaseModel):
    tenant_id: int
    phone: str = Field(..., min_length=5, max_length=20)
    text: str = Field(..., max_length=4096)


@lru_cache(maxsize=1)
def get_classifier() -> IntentClassifier:
    return IntentClassifier()


def get_store() -> SupabaseStore:
    from view_orders import get_supabase_client  # local import avoids a circular import
    return SupabaseStore(get_supabase_client())


def require_agent_key(x_agent_key: Optional[str] = Header(default=None)) -> None:
    expected = os.getenv("AGENT_API_KEY")
    if not expected:
        raise HTTPException(status_code=500, detail="AGENT_API_KEY is not configured")
    if not x_agent_key or not hmac.compare_digest(x_agent_key, expected):
        raise HTTPException(status_code=401, detail="Invalid agent key")


@router.post("/route", dependencies=[Depends(require_agent_key)])
def route_message(msg: IncomingMessage):
    threshold = float(os.getenv("AGENT_CONFIDENCE_THRESHOLD", "0.70"))
    result = IntentRouter(get_store(), get_classifier(), threshold).route(msg.tenant_id, msg.phone, msg.text)
    return {"success": True, **result.to_dict()}


@router.get("/handoffs")
def list_handoffs(
    status: str = Query(default="open"),
    limit: int = Query(default=50, ge=1, le=500),
    tenant_id: int = Depends(get_current_tenant_id),
):
    from view_orders import get_supabase_client
    rows = (get_supabase_client().schema("public").table("human_handoffs").select("*")
            .eq("tenant_id", tenant_id).eq("status", status)
            .order("created_at", desc=True).limit(limit).execute().data or [])
    return {"success": True, "count": len(rows), "handoffs": rows}
