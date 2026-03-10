import { useState } from "react";

interface ActionButtonsProps {
  draftText: string;
  onRegenerate: () => void;
  generating: boolean;
}

export function ActionButtons({ draftText, onRegenerate, generating }: ActionButtonsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(draftText);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = draftText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="action-row">
      <button className={`btn-action btn-copy ${copied ? "copied" : ""}`} onClick={handleCopy}>
        {copied ? (
          <>
            {/* check icon */}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Copied!
          </>
        ) : (
          <>
            {/* copy icon */}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            Copy Draft
          </>
        )}
      </button>

      <button className="btn-action btn-regenerate" onClick={onRegenerate} disabled={generating}>
        {generating ? (
          <>
            <div className="spinner" style={{ borderColor: "rgba(37,99,235,0.3)", borderTopColor: "#2563eb" }} />
            Working…
          </>
        ) : (
          <>
            {/* refresh icon */}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10"/>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
            Regenerate
          </>
        )}
      </button>
    </div>
  );
}
