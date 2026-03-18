import { useEffect, useRef, useState } from "react";
import { useEmailContext } from "../hooks/useEmailContext";
import { useCustomer } from "../hooks/useCustomer";
import { EmailSummary } from "./EmailSummary";
import { CustomerCard } from "./CustomerCard";
import { DraftReply } from "./DraftReply";
import { HistoryPanel } from "./HistoryPanel";
import { generateDraft, generateDraftMock } from "../services/api";
import type { DraftResponse, EmailContext } from "../types";

type ActiveTab = "generate" | "history";
type Tone = "professional" | "friendly" | "formal" | "concise";

const TONE_OPTIONS: { value: Tone; label: string; emoji: string }[] = [
  { value: "professional", label: "Professional", emoji: "💼" },
  { value: "friendly",     label: "Friendly",     emoji: "😊" },
  { value: "formal",       label: "Formal",        emoji: "🎩" },
  { value: "concise",      label: "Concise",       emoji: "⚡" },
];

function localMockDraft(email: EmailContext): DraftResponse {
  return {
    summary: `Email from ${email.senderEmail} regarding "${email.subject}".`,
    draft_reply:
      `Hi,\n\nThank you for reaching out regarding "${email.subject}".\n\n` +
      `I've reviewed your message and will follow up with the relevant details shortly. ` +
      `Please let me know if you need anything in the meantime.\n\nBest regards`,
    missing_information: ["Backend not connected — local preview only"],
    confidence_notes: "Local preview mode",
  };
}

export function TaskPane({ onSignOut }: { onSignOut: () => void }) {
  const { email, loading: emailLoading, error: emailError } = useEmailContext();
  const { customer } = useCustomer(email?.senderEmail);
  const [draft, setDraft] = useState<DraftResponse | null>(null);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>("generate");
  const [tone, setTone] = useState<Tone>("professional");
  const [copied, setCopied] = useState(false);
  const toneAutoSet = useRef(false);

  const VALID_TONES: Tone[] = ["professional", "friendly", "formal", "concise"];

  // Auto-select the customer's preferred tone on first load
  useEffect(() => {
    if (customer?.preferred_tone && !toneAutoSet.current) {
      const preferred = customer.preferred_tone as Tone;
      if (VALID_TONES.includes(preferred)) {
        setTone(preferred);
        toneAutoSet.current = true;
      }
    }
  }, [customer]);

  const handleGenerate = async (overrideTone?: Tone) => {
    if (!email) return;
    setGenerating(true);
    const activeTone = overrideTone ?? tone;
    try {
      const result = await generateDraft(email, activeTone);
      setDraft(result);
    } catch {
      try {
        const result = await generateDraftMock(email, activeTone);
        setDraft(result);
      } catch {
        await new Promise((r) => setTimeout(r, 700));
        setDraft(localMockDraft(email));
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!draft) return;
    try {
      await navigator.clipboard.writeText(draft.draft_reply);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = draft.draft_reply;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Loading state ──────────────────────────────────────────
  if (emailLoading) {
    return (
      <div className="taskpane-root">
        <Header onSignOut={onSignOut} />
        <div className="state-screen">
          <div className="state-icon loading">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <p className="state-title">Reading email…</p>
          <div className="loading-dots"><span /><span /><span /></div>
        </div>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────
  if (emailError) {
    return (
      <div className="taskpane-root">
        <Header onSignOut={onSignOut} />
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
        <Header onSignOut={onSignOut} />
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
      <Header onSignOut={onSignOut} />

      {/* Scrollable content area */}
      <div className="taskpane-scroll">
        <div className="container">

          {/* Email card */}
          <div className="section">
            <EmailSummary
              sender={email.senderEmail}
              subject={email.subject}
              body={email.body}
              summary={activeTab === "generate" ? draft?.summary : undefined}
            />
          </div>

          {/* Customer match — shown as soon as email loads (or from draft response) */}
          {activeTab === "generate" && (customer || draft?.customer_name) && (
            <div className="section">
              <CustomerCard
                name={customer?.contact_name ?? draft?.customer_name ?? ""}
                company={customer?.company_name ?? draft?.customer_company}
              />
            </div>
          )}

          {/* Tab bar */}
          <div className="tab-bar">
            <button
              className={`tab-btn ${activeTab === "generate" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("generate")}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3l1.88 5.76a1 1 0 0 0 .95.69h6.06l-4.9 3.56a1 1 0 0 0-.36 1.12L17.5 20l-4.9-3.56a1 1 0 0 0-1.18 0L6.5 20l1.87-5.87a1 1 0 0 0-.36-1.12L3.11 9.45h6.06a1 1 0 0 0 .95-.69L12 3z"/>
              </svg>
              Generate
            </button>
            <button
              className={`tab-btn ${activeTab === "history" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("history")}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              History
            </button>
          </div>

          {/* ── Generate tab ── */}
          {activeTab === "generate" && (
            <>
              {/* Tone selector */}
              <div className="tone-row">
                <span className="tone-label">Tone</span>
                <div className="tone-pills">
                  {TONE_OPTIONS.map((t) => (
                    <button
                      key={t.value}
                      className={`tone-pill ${tone === t.value ? "tone-pill-active" : ""}`}
                      onClick={() => setTone(t.value)}
                      disabled={generating}
                    >
                      {t.emoji} {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Draft area or placeholder */}
              {draft ? (
                <div className="section">
                  <DraftReply
                    draftText={draft.draft_reply}
                    missingInfo={draft.missing_information}
                  />
                </div>
              ) : (
                <div className="generate-placeholder">
                  <div className="generate-placeholder-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 3l1.88 5.76a1 1 0 0 0 .95.69h6.06l-4.9 3.56a1 1 0 0 0-.36 1.12L17.5 20l-4.9-3.56a1 1 0 0 0-1.18 0L6.5 20l1.87-5.87a1 1 0 0 0-.36-1.12L3.11 9.45h6.06a1 1 0 0 0 .95-.69L12 3z"/>
                    </svg>
                  </div>
                  <p>Ready to generate</p>
                  <span>Select a tone and click Generate Draft below</span>
                </div>
              )}
            </>
          )}

          {/* ── History tab ── */}
          {activeTab === "history" && (
            <div className="section">
              <div className="section-label">Previous Drafts from this Sender</div>
              <HistoryPanel
                senderEmail={email.senderEmail}
                onSelect={(selected) => {
                  setDraft(selected);
                  setActiveTab("generate");
                }}
              />
            </div>
          )}

        </div>
      </div>

      {/* ── Sticky bottom action bar — only on generate tab ── */}
      {activeTab === "generate" && (
        <div className="action-bar">
          {draft ? (
            <>
              <button
                className={`action-bar-btn action-bar-copy ${copied ? "copied" : ""}`}
                onClick={handleCopy}
              >
                {copied ? (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                    </svg>
                    Copy Draft
                  </>
                )}
              </button>
              <button
                className="action-bar-btn action-bar-regen"
                onClick={() => handleGenerate()}
                disabled={generating}
              >
                {generating ? (
                  <>
                    <div className="spinner spinner-blue" />
                    Working…
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="23 4 23 10 17 10"/>
                      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                    </svg>
                    Regenerate
                  </>
                )}
              </button>
            </>
          ) : (
            <button
              className="action-bar-btn action-bar-generate"
              onClick={() => handleGenerate()}
              disabled={generating}
            >
              {generating ? (
                <>
                  <div className="spinner" />
                  Generating draft…
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3l1.88 5.76a1 1 0 0 0 .95.69h6.06l-4.9 3.56a1 1 0 0 0-.36 1.12L17.5 20l-4.9-3.56a1 1 0 0 0-1.18 0L6.5 20l1.87-5.87a1 1 0 0 0-.36-1.12L3.11 9.45h6.06a1 1 0 0 0 .95-.69L12 3z"/>
                  </svg>
                  Generate Draft
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function Header({ onSignOut }: { onSignOut: () => void }) {
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
      <button className="header-logout-btn" onClick={onSignOut} title="Sign out">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
      </button>
    </header>
  );
}
