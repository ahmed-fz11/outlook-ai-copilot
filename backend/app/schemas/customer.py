import uuid

from pydantic import BaseModel


class CustomerCard(BaseModel):
    id: uuid.UUID
    company_name: str
    contact_name: str
    email: str
    segment: str
    preferred_tone: str
    account_notes: str | None = None
    status: str

    class Config:
        from_attributes = True
