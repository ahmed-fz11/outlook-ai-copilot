import { useEffect, useState } from "react";
import { fetchDraftHistory } from "../services/api";
import type { SavedDraft } from "../services/api";
import type { DraftResponse } from "../types";

interface HistoryPanelProps {
  senderEmail: string;
  onSelect: (draft: DraftResponse) => void;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function HistoryPanel({ senderEmail, onSelect }: HistoryPanelProps) {
  const [drafts, setDrafts] = useState<SavedDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError("");
    fetchDraftHistory(senderEmail)
      .then(setDrafts)
      .catch(() => setError("Could not load history."))
      .finally(() => setLoading(false));
  }, [senderEmail]);

  if (loading) {
    return (
      <div className="history-state">
        <div className="loading-dots"><span /><span /><span /></div>
        <p>Loading history…</p>
      </div>
    );
  }

  if (error) {
    return <div className="history-state history-error">{error}</div>;
  }

  if (drafts.length === 0) {
    return (
      <div className="history-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
        <p>No previous drafts from this sender.</p>
        <span>Generate your first draft above.</span>
      </div>
    );
  }

  return (
    <div className="history-list">
      {drafts.map((d, i) => {
        const isOpen = expanded === d.id;
        const preview = d.generated_draft?.split("\n").find(l => l.trim()) ?? "Empty draft";
        return (
          <div key={d.id} className={`history-item ${isOpen ? "history-item-open" : ""}`}>
            <button
              className="history-item-header"
              onClick={() => setExpanded(isOpen ? null : d.id)}
            >
              <div className="history-item-meta">
                <span className="history-item-num">Draft #{drafts.length - i}</span>
                <span className="history-item-time">{timeAgo(d.created_at)}</span>
              </div>
              {d.subject && (
                <p className="history-item-subject">{d.subject}</p>
              )}
              <p className="history-item-preview">{preview}</p>
              <svg
                className={`history-chevron ${isOpen ? "open" : ""}`}
                viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>

            {isOpen && (
              <div className="history-item-body">
                <div className="history-draft-text">{d.generated_draft}</div>
                {d.missing_info_json && d.missing_info_json.length > 0 && (
                  <div className="history-missing">
                    <span>Missing info:</span>
                    <ul>
                      {d.missing_info_json.map((m, j) => <li key={j}>{m}</li>)}
                    </ul>
                  </div>
                )}
                <button
                  className="btn-use-draft"
                  onClick={() => onSelect({
                    summary: "",
                    draft_reply: d.generated_draft ?? "",
                    missing_information: d.missing_info_json ?? [],
                    draft_id: d.id,
                  })}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Use this draft
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
