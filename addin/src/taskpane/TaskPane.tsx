import { useState } from "react";
import { useEmailContext } from "../hooks/useEmailContext";
import { EmailSummary } from "./EmailSummary";
import { CustomerCard } from "./CustomerCard";
import { DraftReply } from "./DraftReply";
import { ActionButtons } from "./ActionButtons";
import { generateDraftMock } from "../services/api";
import type { DraftResponse, EmailContext } from "../types";

// Local fallback used when the backend is not yet running.
// Produces a realistic-looking draft entirely in the browser.
function localMockDraft(email: EmailContext): DraftResponse {
  return {
    summary: `${email.senderEmail} sent an email with the subject "${email.subject}". This is a locally generated preview — the backend is not connected yet.`,
    draft_reply:
      `Hi,\n\nThank you for your email regarding "${email.subject}".\n\n` +
      `I have reviewed your message and will follow up with the relevant details shortly.\n\n` +
      `Best regards`,
    missing_information: [
      "Backend not connected yet — this is a local preview",
      "Connect the FastAPI backend in Milestone 3 for real AI drafts",
    ],
    confidence_notes: "Local preview mode",
  };
}

export function TaskPane() {
  const { email, loading: emailLoading, error: emailError } = useEmailContext();
  const [draft, setDraft] = useState<DraftResponse | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!email) return;
    setGenerating(true);
    setError(null);
    try {
      const result = await generateDraftMock(email);
      setDraft(result);
    } catch {
      // Backend not running yet — fall back to local preview
      await new Promise((r) => setTimeout(r, 600)); // brief delay so it feels real
      setDraft(localMockDraft(email));
    } finally {
      setGenerating(false);
    }
  };

  if (emailLoading) {
    return (
      <div className="container">
        <p>Reading email...</p>
      </div>
    );
  }

  if (emailError) {
    return (
      <div className="container">
        <p className="error-message">Error: {emailError}</p>
      </div>
    );
  }

  if (!email) {
    return (
      <div className="container">
        <p>Select an email to get started.</p>
      </div>
    );
  }

  return (
    <div className="container taskpane">
      <header className="taskpane-header">
        <h2>Email Copilot</h2>
      </header>

      <EmailSummary
        sender={email.senderEmail}
        subject={email.subject}
        summary={draft?.summary}
      />

      {draft?.customer_name && (
        <CustomerCard
          name={draft.customer_name}
          company={draft.customer_company}
        />
      )}

      {!draft && (
        <button
          className="btn-primary"
          onClick={handleGenerate}
          disabled={generating}
        >
          {generating ? "Generating..." : "Generate Draft"}
        </button>
      )}

      {error && <p className="error-message">{error}</p>}

      {draft && (
        <>
          <DraftReply
            draftText={draft.draft_reply}
            missingInfo={draft.missing_information}
          />
          <ActionButtons
            draftText={draft.draft_reply}
            onRegenerate={handleGenerate}
            generating={generating}
          />
        </>
      )}
    </div>
  );
}
