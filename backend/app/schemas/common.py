from pydantic import BaseModel


class ServiceStatus(BaseModel):
    database: str   # "connected" | "not_configured" | "error"
    openai: str     # "configured" | "not_configured"
    supabase: str   # "configured" | "not_configured"


class HealthResponse(BaseModel):
    status: str = "ok"
    version: str = "0.1.0"
    environment: str = "development"
    services: ServiceStatus
