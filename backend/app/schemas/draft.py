import uuid
from datetime import datetime

from pydantic import BaseModel


class GenerateDraftRequest(BaseModel):
    email: "EmailContext"
    tone: str = "professional"

    class Config:
        from_attributes = True


class GenerateDraftResponse(BaseModel):
    summary: str
    draft_reply: str
    missing_information: list[str]
    confidence_notes: str | None = None
    customer_name: str | None = None
    customer_company: str | None = None
    draft_id: uuid.UUID | None = None


class SavedDraft(BaseModel):
    id: uuid.UUID
    generated_draft: str | None
    model_name: str
    token_input: int
    token_output: int
    estimated_cost: float
    created_at: datetime

    class Config:
        from_attributes = True


from app.schemas.email import EmailContext  # noqa: E402

GenerateDraftRequest.model_rebuild()
