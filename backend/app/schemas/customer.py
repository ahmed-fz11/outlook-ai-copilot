import uuid

from pydantic import BaseModel, ConfigDict


class CustomerCard(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    company_name: str
    contact_name: str
    email: str
    segment: str
    preferred_tone: str
    account_notes: str | None = None
    status: str
