import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class GenerateDraftRequest(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    email: "EmailContext"
    tone: str = "professional"


class GenerateDraftResponse(BaseModel):
    summary: str
    draft_reply: str
    missing_information: list[str]
    confidence_notes: str | None = None
    customer_name: str | None = None
    customer_company: str | None = None
    draft_id: uuid.UUID | None = None


class SavedDraft(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    generated_draft: str | None
    missing_info_json: list[str] | None = None
    subject: str | None = None
    model_name: str
    token_input: int
    token_output: int
    estimated_cost: float
    created_at: datetime


from app.schemas.email import EmailContext  # noqa: E402

GenerateDraftRequest.model_rebuild()
