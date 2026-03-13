from fastapi import APIRouter

from app.core.config import settings
from app.schemas.common import HealthResponse, ServiceStatus

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """
    Reports whether the server is running and which services are configured.
    Safe to call without auth — used by Render, the add-in, and tests.
    """
    # Check database
    db_status = "not_configured"
    if settings.DATABASE_URL:
        try:
            from app.core.database import engine
            if engine:
                with engine.connect():
                    pass
                db_status = "connected"
        except Exception:
            db_status = "error"

    return HealthResponse(
        status="ok",
        version="0.1.0",
        environment=settings.APP_ENV,
        services=ServiceStatus(
            database=db_status,
            openai="configured" if settings.OPENAI_API_KEY else "not_configured",
            supabase="configured" if settings.SUPABASE_URL else "not_configured",
        ),
    )
