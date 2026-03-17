"""Auth-related endpoints.

MVP: Supabase handles actual login/signup via magic link on the frontend.
These endpoints let the backend verify sessions and resolve app-level user info.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.tenant import Tenant

router = APIRouter()


@router.get("/me")
async def get_me(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return the authenticated user's app-level profile including tenant info."""
    tenant_id = current_user.get("tenant_id")
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first() if tenant_id else None

    return {
        "email": current_user.get("email"),
        "user_id": str(current_user.get("user_id")) if current_user.get("user_id") else None,
        "tenant_id": str(tenant_id) if tenant_id else None,
        "role": current_user.get("role"),
        "tenant_name": tenant.name if tenant else None,
        "tenant_plan": tenant.plan if tenant else None,
    }
