"""Abstract mail provider interface.

MVP: email content comes directly from the Outlook add-in via Office.js.
Future: this module will integrate Microsoft Graph for full mailbox access,
thread history, and server-side mail operations.
"""


class MailProvider:
    """Placeholder for future Graph integration."""

    @staticmethod
    def get_thread_history(message_id: str) -> list[dict]:
        """Will call Graph API to fetch conversation thread. Stub for now."""
        return []

    @staticmethod
    def insert_draft_to_mailbox(message_id: str, draft_body: str) -> bool:
        """Will call Graph API to create a draft reply. Stub for now."""
        return False


mail_provider = MailProvider()
