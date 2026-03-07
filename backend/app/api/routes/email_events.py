"""Email event history endpoints (for analytics/audit later)."""

from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def list_email_events():
    """Placeholder — will return paginated email event history for the tenant."""
    return {"message": "Email events endpoint — coming in milestone 7"}
