"""Draft generation endpoints."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.draft import Draft
from app.schemas.draft import GenerateDraftRequest, GenerateDraftResponse, SavedDraft
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


@router.get("/history", response_model=list[SavedDraft])
async def draft_history(
    limit: int = 20,
    sender_email: str | None = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return all drafts for the current user filtered by sender, across all their emails."""
    from app.models.email_event import EmailEvent
    user_id = current_user.get("user_id")
    rows = (
        db.query(Draft, EmailEvent.subject)
        .join(EmailEvent, Draft.email_event_id == EmailEvent.id)
        .filter(Draft.user_id == user_id)
    )
    if sender_email:
        rows = rows.filter(EmailEvent.sender_email == sender_email)
    rows = rows.order_by(Draft.created_at.desc()).limit(limit).all()

    result = []
    for draft, subject in rows:
        d = SavedDraft.model_validate(draft)
        d.subject = subject
        result.append(d)
    return result


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
