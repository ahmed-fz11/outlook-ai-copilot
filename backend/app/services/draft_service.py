"""Orchestrates the full draft-generation flow: customer lookup -> AI -> persist."""

import uuid
from datetime import datetime

from sqlalchemy.orm import Session

from app.models.email_event import EmailEvent
from app.models.draft import Draft
from app.schemas.email import EmailContext
from app.services.ai_service import ai_service
from app.services.customer_repository import customer_repository


class DraftService:
    def generate(
        self,
        db: Session,
        tenant_id: uuid.UUID,
        user_id: uuid.UUID,
        email: EmailContext,
        tone: str = "professional",
    ) -> dict:
        """End-to-end: look up customer, call AI, save event + draft, return result."""

        # 1. Customer lookup
        customer = customer_repository.lookup(db, tenant_id, email.sender_email)
        customer_info = None
        if customer:
            customer_info = {
                "company_name": customer.company_name,
                "contact_name": customer.contact_name,
                "segment": customer.segment,
                "preferred_tone": customer.preferred_tone,
                "account_notes": customer.account_notes or "",
                "pricing_notes": customer.pricing_notes or "",
            }
            tone = customer.preferred_tone or tone

        # 2. Call AI (fall back to mock draft if OpenAI is not configured)
        try:
            ai_result = ai_service.generate_draft(
                email_text=email.body,
                subject=email.subject,
                sender_email=email.sender_email,
                customer_info=customer_info,
                thread_summary=email.thread_summary,
                tone=tone,
            )
        except RuntimeError:
            # OpenAI key not set yet — return a structured mock so customer
            # card and DB logging still work
            ai_result = {
                "summary": f"Email from {email.sender_email} about: {email.subject}",
                "draft_reply": (
                    f"Hi{', ' + customer.contact_name if customer else ''},\n\n"
                    f"Thank you for your email regarding \"{email.subject}\".\n\n"
                    "I've reviewed your message and will follow up shortly.\n\n"
                    "Best regards"
                ),
                "missing_information": ["AI key not configured — add OPENAI_API_KEY to backend/.env"],
                "confidence_notes": "Mock draft — AI not active",
                "token_input": 0,
                "token_output": 0,
            }

        # 3. Persist email event
        email_event = EmailEvent(
            tenant_id=tenant_id,
            user_id=user_id,
            outlook_message_ref=email.outlook_message_ref,
            sender_email=email.sender_email,
            subject=email.subject,
            raw_email_text=email.body,
            summary_text=ai_result["summary"],
        )
        db.add(email_event)
        db.flush()

        # 4. Persist draft
        draft = Draft(
            tenant_id=tenant_id,
            user_id=user_id,
            email_event_id=email_event.id,
            model_name=ai_service.model,
            generated_draft=ai_result["draft_reply"],
            missing_info_json=ai_result["missing_information"],
            token_input=ai_result["token_input"],
            token_output=ai_result["token_output"],
            estimated_cost=self._estimate_cost(ai_result["token_input"], ai_result["token_output"]),
        )
        db.add(draft)
        db.commit()
        db.refresh(draft)

        return {
            **ai_result,
            "draft_id": draft.id,
            "customer_name": customer.contact_name if customer else None,
            "customer_company": customer.company_name if customer else None,
        }

    @staticmethod
    def _estimate_cost(tokens_in: int, tokens_out: int) -> float:
        """Rough cost estimate for gpt-4o-mini pricing."""
        return (tokens_in * 0.00015 + tokens_out * 0.0006) / 1000


draft_service = DraftService()
