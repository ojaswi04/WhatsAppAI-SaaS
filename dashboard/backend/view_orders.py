import os
import uuid
from typing import Any, Dict, List, NotRequired, TypedDict, cast

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from supabase import Client, create_client

from auth_backend import get_current_tenant_id


# Load env from root directory
dotenv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env")
load_dotenv(dotenv_path=dotenv_path)

app = FastAPI(
	title="Orders API",
	description="Fetch order data from Supabase",
	version="1.0.0",
)

app.add_middleware(
	CORSMiddleware,
	allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)


class OrderRecord(TypedDict):
	order_id: int
	created_at: str
	customer_id: str
	tenant_id: int
	payments: NotRequired[List[str]]


class TenantSettingsPayload(BaseModel):
	business_name: str
	whatsapp_number: str | None = None
	ai_tone: str | None = None
	currency: str | None = None
	google_business_id: str | None = None


class ProductPayload(BaseModel):
	name: str
	price_cents: int
	material: str | None = None
	sizes: List[str] | None = None
	colors: List[str] | None = None
	in_stock: bool = True
	is_returnable: bool = True
	return_window_days: int | None = None
	description: str | None = None


def get_supabase_client() -> Client:
	supabase_url = os.getenv("SUPABASE_URL")
	supabase_key = os.getenv("SUPABASE_KEY")

	if not supabase_url or not supabase_key:
		raise HTTPException(
			status_code=500,
			detail="SUPABASE_URL and SUPABASE_KEY must be set in environment variables or .env",
		)

	return create_client(supabase_url, supabase_key)


@app.get("/health")
def health_check() -> JSONResponse:
	"""Single health endpoint for API and Supabase connectivity."""
	content: Dict[str, Any] = {
		"success": True,
		"status": "ok",
		"api": "up",
		"supabase": {
			"status": "unknown",
			"message": "Not checked",
		},
	}

	status_code = 200

	try:
		supabase = get_supabase_client()
		query_result = (
			supabase
			.schema("public")
			.table("orders")
			.select("order_id")
			.limit(1)
			.execute()
		)
		content["supabase"] = {
			"status": "connected",
			"message": "Supabase connection successful",
			"checked_table": "public.orders",
			"sample_count": len(query_result.data or []),
		}
	except HTTPException as exc:
		status_code = 500
		content["success"] = False
		content["status"] = "degraded"
		content["supabase"] = {
			"status": "misconfigured",
			"message": "Supabase environment variables are missing or invalid",
			"detail": str(exc.detail),
		}
	except Exception as exc:
		status_code = 503
		content["success"] = False
		content["status"] = "degraded"
		content["supabase"] = {
			"status": "unreachable",
			"message": "Failed to connect to Supabase",
			"detail": str(exc),
		}

	return JSONResponse(status_code=status_code, content=content)


@app.get("/orders")
def get_orders(
	limit: int = Query(default=100, ge=1, le=1000),
	tenant_id: int = Depends(get_current_tenant_id),
) -> JSONResponse:
	"""Fetch rows from public.orders."""
	try:
		supabase = get_supabase_client()
		query = supabase.schema("public").table("orders").select(
			"order_id, created_at, customer_id, tenant_id, payments"
		)

		query = query.eq("tenant_id", tenant_id)

		query_result = query.limit(limit).execute()
		orders = cast(List[OrderRecord], query_result.data or [])
		return JSONResponse(
			status_code=200,
			content={
				"success": True,
				"count": len(orders),
				"tenant_id": tenant_id,
				"orders": orders,
			},
		)
	except HTTPException:
		raise
	except Exception as exc:
		raise HTTPException(
			status_code=500,
			detail=f"Failed to fetch orders from Supabase: {exc}",
		) from exc


@app.get("/payments")
def get_payments(
	limit: int = Query(default=100, ge=1, le=1000),
	tenant_id: int = Depends(get_current_tenant_id)
) -> JSONResponse:
	"""Fetch payments from public.app_payments."""
	try:
		supabase = get_supabase_client()
		query = supabase.schema("public").table("app_payments").select("*")

		query = query.eq("tenant_id", tenant_id)

		query_result = query.limit(limit).execute()
		payments = cast(List[Dict[str, Any]], query_result.data or [])
		return JSONResponse(
			status_code=200,
			content={
				"success": True,
				"count": len(payments),
				"tenant_id": tenant_id,
				"payments": payments,
			},
		)
	except HTTPException:
		raise
	except Exception as exc:
		raise HTTPException(
			status_code=500,
			detail=f"Failed to fetch payments from Supabase: {exc}",
		) from exc


@app.get("/settings")
def get_settings(tenant_id: int = Depends(get_current_tenant_id)) -> JSONResponse:
	"""Fetch all settings for the tenant."""
	try:
		supabase = get_supabase_client()
		query_result = supabase.schema("public").table("app_tenants").select(
			"business_name, whatsapp_number, ai_tone, currency, google_business_id"
		).eq("tenant_id", tenant_id).execute()
		
		if not query_result.data:
			raise HTTPException(status_code=404, detail="Tenant settings not found")
			
		return JSONResponse(status_code=200, content={"success": True, "settings": query_result.data[0]})
	except HTTPException:
		raise
	except Exception as exc:
		raise HTTPException(status_code=500, detail=str(exc))

@app.put("/settings")
def update_settings(
	payload: TenantSettingsPayload,
	tenant_id: int = Depends(get_current_tenant_id)
) -> JSONResponse:
	"""Update tenant settings."""
	try:
		supabase = get_supabase_client()
		update_data = payload.dict(exclude_unset=True)
		
		update_result = supabase.schema("public").table("app_tenants").update(update_data).eq("tenant_id", tenant_id).execute()
		
		if not update_result.data:
			raise HTTPException(status_code=500, detail="Failed to update tenant settings. Ensure tenant exists.")
		
		return JSONResponse(
			status_code=200,
			content={
				"success": True,
				"message": "Settings updated successfully",
				"settings": update_result.data[0]
			},
		)
	except HTTPException:
		raise
	except Exception as exc:
		raise HTTPException(status_code=500, detail=str(exc))


# --- Customers Endpoints ---

@app.get("/customers")
def get_customers(
	limit: int = Query(default=100, ge=1, le=1000),
	tenant_id: int = Depends(get_current_tenant_id)
) -> JSONResponse:
	"""Fetch customers from app_customers for the tenant."""
	try:
		supabase = get_supabase_client()
		query_result = supabase.schema("public").table("app_customers").select("*").eq("tenant_id", tenant_id).limit(limit).execute()
		customers = query_result.data or []
		return JSONResponse(
			status_code=200,
			content={
				"success": True,
				"count": len(customers),
				"customers": customers,
			},
		)
	except HTTPException:
		raise
	except Exception as exc:
		raise HTTPException(status_code=500, detail=str(exc))

# --- Product Endpoints ---

@app.get("/products")
def get_products(
	limit: int = Query(default=100, ge=1, le=1000),
	tenant_id: int = Depends(get_current_tenant_id)
) -> JSONResponse:
	"""Fetch products for the tenant."""
	try:
		supabase = get_supabase_client()
		query_result = supabase.schema("public").table("app_products").select("*").eq("tenant_id", tenant_id).limit(limit).execute()
		products = query_result.data or []
		return JSONResponse(
			status_code=200,
			content={
				"success": True,
				"count": len(products),
				"products": products,
			},
		)
	except HTTPException:
		raise
	except Exception as exc:
		raise HTTPException(status_code=500, detail=str(exc))


@app.post("/products")
def create_product(
	payload: ProductPayload,
	tenant_id: int = Depends(get_current_tenant_id)
) -> JSONResponse:
	"""Create a new product."""
	try:
		supabase = get_supabase_client()
		
		product_data = payload.dict(exclude_none=True)
		product_data["tenant_id"] = tenant_id
		product_data["product_id"] = str(uuid.uuid4()) # Generate a unique product string ID
		
		insert_result = supabase.schema("public").table("app_products").insert(product_data).execute()
		
		return JSONResponse(
			status_code=201,
			content={
				"success": True,
				"product": insert_result.data[0] if insert_result.data else None,
			},
		)
	except HTTPException:
		raise
	except Exception as exc:
		raise HTTPException(status_code=500, detail=str(exc))


@app.put("/products/{product_id}")
def update_product(
	product_id: str,
	payload: ProductPayload,
	tenant_id: int = Depends(get_current_tenant_id)
) -> JSONResponse:
	"""Update an existing product."""
	try:
		supabase = get_supabase_client()
		
		product_data = payload.dict()
		# exclude nulls if needed, or explicitly set to null depending on user intent
		
		update_result = supabase.schema("public").table("app_products").update(product_data).eq("tenant_id", tenant_id).eq("product_id", product_id).execute()
		
		if not update_result.data:
			raise HTTPException(status_code=404, detail="Product not found or not owned by tenant")
			
		return JSONResponse(
			status_code=200,
			content={
				"success": True,
				"product": update_result.data[0],
			},
		)
	except HTTPException:
		raise
	except Exception as exc:
		raise HTTPException(status_code=500, detail=str(exc))


@app.delete("/products/{product_id}")
def delete_product(
	product_id: str,
	tenant_id: int = Depends(get_current_tenant_id)
) -> JSONResponse:
	"""Delete an existing product."""
	try:
		supabase = get_supabase_client()
		
		delete_result = supabase.schema("public").table("app_products").delete().eq("tenant_id", tenant_id).eq("product_id", product_id).execute()
		
		if not delete_result.data:
			raise HTTPException(status_code=404, detail="Product not found or not owned by tenant")
			
		return JSONResponse(
			status_code=200,
			content={
				"success": True,
				"message": "Product deleted successfully"
			},
		)
	except HTTPException:
		raise
	except Exception as exc:
		raise HTTPException(status_code=500, detail=str(exc))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("view_orders:app", port=8000, reload=True)
