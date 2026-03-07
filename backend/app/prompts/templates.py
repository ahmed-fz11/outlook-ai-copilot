"""AI prompt templates for the email copilot."""

import json

SYSTEM_PROMPT = """You are an AI email copilot for business communication.

Your job is to draft professional email replies that are concise, accurate, and grounded only in the provided context.

Rules:
- Do not invent facts, prices, deadlines, or commitments.
- If important information is missing, do not guess. List the missing details clearly.
- Match the requested tone.
- Keep replies practical and ready to send.
- Prefer short paragraphs.
- Include a clear next step when appropriate.

You are helping a team reply to incoming emails inside Outlook.

Return valid JSON with exactly these keys:
- "summary": a 1-3 sentence summary of the incoming email
- "draft_reply": a professional reply draft ready to send
- "missing_information": a list of strings describing any info needed before sending
- "confidence_notes": optional notes about the draft quality or caveats"""

DEFAULT_BUSINESS_RULES = [
    "Do not promise discounts above 10 percent.",
    "Do not commit to delivery dates without confirmation.",
    "Prefer concise professional tone.",
    "If the request is unclear, ask at most 3 clarifying questions.",
]


def build_system_prompt() -> str:
    return SYSTEM_PROMPT


def build_user_prompt(
    email_text: str,
    subject: str,
    sender_email: str,
    customer_info: dict | None = None,
    thread_summary: str | None = None,
    tone: str = "professional",
    business_rules: list[str] | None = None,
) -> str:
    rules = business_rules or DEFAULT_BUSINESS_RULES

    parts = [
        f"Current email:\n{email_text}",
        f"Subject: {subject}",
        f"Sender: {sender_email}",
    ]

    if thread_summary:
        parts.append(f"Thread summary:\n{thread_summary}")
    else:
        parts.append("Thread summary: (not available)")

    if customer_info:
        parts.append(f"Customer info:\n{json.dumps(customer_info, indent=2)}")
    else:
        parts.append("Customer info: (no matching customer record found)")

    parts.append(f"Business rules:\n{json.dumps(rules)}")
    parts.append(f"Preferred tone: {tone}")
    parts.append(
        "Write: a 1-3 sentence summary, a reply draft, and a list of missing information (if any)."
    )

    return "\n\n".join(parts)
