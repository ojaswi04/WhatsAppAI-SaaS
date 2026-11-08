import os
from fastapi import Depends, HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client, Client

_bearer = HTTPBearer()

def get_current_tenant_id(
    creds: HTTPAuthorizationCredentials = Security(_bearer)
) -> int:
    """Verify JWT, return tenant_id (int) embedded in user metadata."""
    token = creds.credentials
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_KEY")
    
    if not supabase_url or not supabase_key:
        raise HTTPException(status_code=500, detail="Supabase env vars missing")
        
    supabase: Client = create_client(supabase_url, supabase_key)
    
    try:
        user_resp = supabase.auth.get_user(token)
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid authentication token: {e}")
        
    if not user_resp.user:
        raise HTTPException(status_code=401, detail="Invalid token")
        
    user_metadata = user_resp.user.user_metadata
    tenant_id = user_metadata.get("tenant_id")
    
    if tenant_id is None:
        raise HTTPException(status_code=403, detail="No tenant associated with this user")
        
    return int(tenant_id)
