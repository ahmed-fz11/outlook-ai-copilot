from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.routes import health, drafts, customers, email_events, auth

app = FastAPI(
    title="Outlook AI Copilot API",
    version="0.1.0",
    docs_url="/docs" if settings.APP_ENV == "development" else None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(drafts.router, prefix="/api/drafts", tags=["drafts"])
app.include_router(customers.router, prefix="/api/customers", tags=["customers"])
app.include_router(email_events.router, prefix="/api/email-events", tags=["email-events"])
