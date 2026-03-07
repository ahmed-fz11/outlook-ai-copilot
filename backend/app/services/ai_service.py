"""OpenAI integration for email summarization and draft generation."""

from openai import OpenAI

from app.core.config import settings
from app.prompts.templates import build_system_prompt, build_user_prompt


class AIService:
    def __init__(self) -> None:
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = settings.OPENAI_MODEL

    def generate_draft(
        self,
        email_text: str,
        subject: str,
        sender_email: str,
        customer_info: dict | None = None,
        thread_summary: str | None = None,
        tone: str = "professional",
        business_rules: list[str] | None = None,
    ) -> dict:
        """Call OpenAI to produce a summary, draft reply, and missing-info list.

        Returns dict with keys: summary, draft_reply, missing_information,
        confidence_notes, token_input, token_output.
        """
        system_prompt = build_system_prompt()
        user_prompt = build_user_prompt(
            email_text=email_text,
            subject=subject,
            sender_email=sender_email,
            customer_info=customer_info,
            thread_summary=thread_summary,
            tone=tone,
            business_rules=business_rules,
        )

        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            response_format={"type": "json_object"},
            temperature=0.4,
        )

        import json

        content = response.choices[0].message.content or "{}"
        result = json.loads(content)

        return {
            "summary": result.get("summary", ""),
            "draft_reply": result.get("draft_reply", ""),
            "missing_information": result.get("missing_information", []),
            "confidence_notes": result.get("confidence_notes"),
            "token_input": response.usage.prompt_tokens if response.usage else 0,
            "token_output": response.usage.completion_tokens if response.usage else 0,
        }


ai_service = AIService()
