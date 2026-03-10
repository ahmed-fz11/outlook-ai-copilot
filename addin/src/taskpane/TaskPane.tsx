import { useState } from "react";
import { useEmailContext } from "../hooks/useEmailContext";
import { EmailSummary } from "./EmailSummary";
import { CustomerCard } from "./CustomerCard";
import { DraftReply } from "./DraftReply";
import { ActionButtons } from "./ActionButtons";
import { generateDraftMock } from "../services/api";
import type { DraftResponse, EmailContext } from "../types";

function localMockDraft(email: EmailContext): DraftResponse {
  return {
    summary: `Email from ${email.senderEmail} regarding "${email.subject}". This is a local preview — connect the FastAPI backend in Milestone 3 for real AI-generated drafts.`,
    draft_reply:
      `Hi,\n\nThank you for reaching out regarding "${email.subject}".\n\n` +
      `I've reviewed your message and will follow up with the relevant details shortly. ` +
      `Please let me know if you need anything in the meantime.\n\n` +
      `Best regards`,
    missing_information: [
      "Backend not connected yet — this is a local preview",
      "Start the FastAPI server in Milestone 3 for real AI drafts",
    ],
    confidence_notes: "Local preview mode",
  };
}

export function TaskPane() {
  const { email, loading: emailLoading, error: emailError } = useEmailContext();
  const [draft, setDraft] = useState<DraftResponse | null>(null);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!email) return;
    setGenerating(true);
    try {
      const result = await generateDraftMock(email);
      setDraft(result);
    } catch {
      await new Promise((r) => setTimeout(r, 700));
      setDraft(localMockDraft(email));
    } finally {
      setGenerating(false);
    }
  };

  // ── Loading state ──────────────────────────────────────────
  if (emailLoading) {
    return (
      <div className="taskpane-root">
        <Header />
        <div className="state-screen">
          <div className="state-icon loading">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <p className="state-title">Reading email…</p>
          <div className="loading-dots">
            <span /><span /><span />
          </div>
        </div>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────
  if (emailError) {
    return (
      <div className="taskpane-root">
        <Header />
        <div className="state-screen">
          <div className="state-icon error">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <p className="state-title">Couldn't read email</p>
          <p className="state-subtitle">{emailError}</p>
        </div>
      </div>
    );
  }

  // ── Empty state ────────────────────────────────────────────
  if (!email) {
    return (
      <div className="taskpane-root">
        <Header />
        <div className="state-screen">
          <div className="state-icon empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2"/>
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
            </svg>
          </div>
          <p className="state-title">No email selected</p>
          <p className="state-subtitle">Open an email in Outlook to get started</p>
        </div>
      </div>
    );
  }

  // ── Main view ──────────────────────────────────────────────
  return (
    <div className="taskpane-root">
      <Header />

      <div className="container">

        {/* Email info + body preview (Milestone 2) */}
        <div className="section">
          <EmailSummary
            sender={email.senderEmail}
            subject={email.subject}
            body={email.body}
            summary={draft?.summary}
          />
        </div>

        {/* Customer card — shown when backend returns a match */}
        {draft?.customer_name && (
          <div className="section">
            <div className="section-label">Matched Customer</div>
            <CustomerCard
              name={draft.customer_name}
              company={draft.customer_company}
            />
          </div>
        )}

        {/* Generate button */}
        {!draft && (
          <div className="generate-section">
            <button
              className="btn-generate"
              onClick={handleGenerate}
              disabled={generating}
            >
              {generating ? (
                <>
                  <div className="spinner" />
                  Generating draft…
                </>
              ) : (
                <>
                  {/* wand/sparkle icon */}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3l1.88 5.76a1 1 0 0 0 .95.69h6.06l-4.9 3.56a1 1 0 0 0-.36 1.12L17.5 20l-4.9-3.56a1 1 0 0 0-1.18 0L6.5 20l1.87-5.87a1 1 0 0 0-.36-1.12L3.11 9.45h6.06a1 1 0 0 0 .95-.69L12 3z"/>
                  </svg>
                  Generate Draft
                </>
              )}
            </button>
          </div>
        )}

        {/* Draft reply + actions */}
        {draft && (
          <>
            <div className="section">
              <DraftReply
                draftText={draft.draft_reply}
                missingInfo={draft.missing_information}
              />
            </div>
            <ActionButtons
              draftText={draft.draft_reply}
              onRegenerate={handleGenerate}
              generating={generating}
            />
          </>
        )}

      </div>
    </div>
  );
}

function Header() {
  return (
    <header className="taskpane-header">
      <div className="header-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3l1.88 5.76a1 1 0 0 0 .95.69h6.06l-4.9 3.56a1 1 0 0 0-.36 1.12L17.5 20l-4.9-3.56a1 1 0 0 0-1.18 0L6.5 20l1.87-5.87a1 1 0 0 0-.36-1.12L3.11 9.45h6.06a1 1 0 0 0 .95-.69L12 3z"/>
        </svg>
      </div>
      <div className="header-text">
        <h1>Email Copilot</h1>
        <p>AI-powered reply assistant</p>
      </div>
    </header>
  );
}
