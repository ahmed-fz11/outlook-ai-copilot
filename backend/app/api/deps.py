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

    Returns a dict with 'sub', 'email', 'user_id', and 'tenant_id'.
    In early milestones before auth is wired, routes can skip this dependency.
    """
    supabase_uid = token_payload["sub"]
    app_user = auth_service.get_app_user(db, supabase_uid)

    return {
        **token_payload,
        "user_id": app_user.id if app_user else None,
        "tenant_id": app_user.tenant_id if app_user else None,
    }
