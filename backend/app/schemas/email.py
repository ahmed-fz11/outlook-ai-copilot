from pydantic import BaseModel


class EmailContext(BaseModel):
    """Payload sent from the Outlook add-in with the current email's content."""

    sender_email: str
    subject: str
    body: str
    outlook_message_ref: str | None = None
    thread_summary: str | None = None
