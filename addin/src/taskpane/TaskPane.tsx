import { useState } from "react";
import { useEmailContext } from "../hooks/useEmailContext";
import { EmailSummary } from "./EmailSummary";
import { CustomerCard } from "./CustomerCard";
import { DraftReply } from "./DraftReply";
import { ActionButtons } from "./ActionButtons";
import { generateDraftMock } from "../services/api";
import type { DraftResponse } from "../types";

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
    } catch (e: any) {
      setError(e.message ?? "Failed to generate draft");
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
