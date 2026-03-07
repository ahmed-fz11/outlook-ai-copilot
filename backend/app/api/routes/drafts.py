"""Draft generation endpoints."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_user
from app.schemas.draft import GenerateDraftRequest, GenerateDraftResponse
from app.services.draft_service import draft_service

router = APIRouter()


@router.post("/generate", response_model=GenerateDraftResponse)
async def generate_draft(
    payload: GenerateDraftRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Accept email context from the add-in, generate AI draft, return structured result."""
    user_id = current_user.get("user_id")
    tenant_id = current_user.get("tenant_id")

    if not user_id or not tenant_id:
        raise HTTPException(status_code=403, detail="User not linked to a tenant")

    result = draft_service.generate(
        db=db,
        tenant_id=tenant_id,
        user_id=user_id,
        email=payload.email,
        tone=payload.tone,
    )

    return GenerateDraftResponse(**result)


@router.post("/generate-mock", response_model=GenerateDraftResponse)
async def generate_draft_mock(payload: GenerateDraftRequest):
    """Mock endpoint for early milestone testing (no auth, no DB, no AI)."""
    return GenerateDraftResponse(
        summary=f"Email from {payload.email.sender_email} about: {payload.email.subject}",
        draft_reply=(
            f"Hi,\n\nThank you for your email regarding \"{payload.email.subject}\".\n\n"
            "I've reviewed your message and will follow up with the relevant details shortly.\n\n"
            "Best regards"
        ),
        missing_information=["Specific deadline if any", "Budget range if applicable"],
        confidence_notes="Mock response — AI integration not yet active",
    )
