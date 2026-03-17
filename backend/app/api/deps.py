"""Shared FastAPI dependencies for route handlers."""

from fastapi import Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import verify_token
from app.services.auth_service import auth_service


async def get_current_user(
    token_payload: dict = Depends(verify_token),
    db: Session = Depends(get_db),
) -> dict:
    """Resolve Supabase JWT to application user context (user_id + tenant_id).

    Auto-provisions the user + a personal tenant on first login.
    Returns a dict with 'sub', 'email', 'user_id', and 'tenant_id'.
    """
    supabase_uid = token_payload["sub"]
    email = token_payload.get("email", "")
    app_user = auth_service.provision_user(db, supabase_uid, email)

    return {
        **token_payload,
        "user_id": app_user.id,
        "tenant_id": app_user.tenant_id,
        "role": app_user.role,
    }
