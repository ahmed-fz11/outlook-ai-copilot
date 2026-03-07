"""Auth-related endpoints.

MVP: Supabase handles actual login/signup via magic link on the frontend.
These endpoints let the backend verify sessions and resolve app-level user info.
"""

from fastapi import APIRouter, Depends

from app.api.deps import get_current_user

router = APIRouter()


@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    """Return the authenticated user's app-level profile."""
    return {
        "email": current_user.get("email"),
        "user_id": str(current_user.get("user_id")) if current_user.get("user_id") else None,
        "tenant_id": str(current_user.get("tenant_id")) if current_user.get("tenant_id") else None,
    }
