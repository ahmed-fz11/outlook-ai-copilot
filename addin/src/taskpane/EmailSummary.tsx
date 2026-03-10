import { useState } from "react";

interface EmailSummaryProps {
  sender: string;
  subject: string;
  body: string;
  summary?: string;
}

function getInitials(email: string): string {
  const name = email.split("@")[0];
  const parts = name.split(/[._-]/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export function EmailSummary({ sender, subject, body, summary }: EmailSummaryProps) {
  const [bodyOpen, setBodyOpen] = useState(false);
  const trimmedBody = body.trim();
  const wordCount = trimmedBody.split(/\s+/).filter(Boolean).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>

      {/* Email info card */}
      <div className="email-card">
        <div className="email-card-header">
          {/* envelope icon */}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2"/>
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
          </svg>
          <span>Current Email</span>
        </div>

        <div className="email-card-body">
          {/* Sender row */}
          <div className="email-field">
            <span className="email-field-label">From</span>
            <div className="sender-row">
              <div className="sender-avatar">{getInitials(sender)}</div>
              <div className="sender-info">
                <div className="sender-email">{sender}</div>
              </div>
            </div>
          </div>

          {/* Subject */}
          <div className="email-field">
            <span className="email-field-label">Subject</span>
            <div className="email-field-value subject">{subject}</div>
          </div>
        </div>
      </div>

      {/* Body preview — collapsible (Milestone 2) */}
      {trimmedBody && (
        <div className="body-preview">
          <div className="body-preview-header" onClick={() => setBodyOpen(!bodyOpen)}>
            <div className="body-preview-header-left">
              {/* document icon */}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
              <span>Email Body</span>
            </div>
            {/* chevron */}
            <svg className={`body-preview-chevron ${bodyOpen ? "open" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>

          {bodyOpen && (
            <>
              <div className="body-preview-content">{trimmedBody}</div>
              <div className="body-chars">{wordCount} words · {trimmedBody.length} characters</div>
            </>
          )}
        </div>
      )}

      {/* AI summary — only shown after generation */}
      {summary && (
        <div className="summary-card">
          <div className="summary-card-header">
            {/* sparkle icon */}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3l1.88 5.76a1 1 0 0 0 .95.69h6.06l-4.9 3.56a1 1 0 0 0-.36 1.12L17.5 20l-4.9-3.56a1 1 0 0 0-1.18 0L6.5 20l1.87-5.87a1 1 0 0 0-.36-1.12L3.11 9.45h6.06a1 1 0 0 0 .95-.69L12 3z"/>
            </svg>
            <span>AI Summary</span>
          </div>
          <p className="summary-text">{summary}</p>
        </div>
      )}
    </div>
  );
}
