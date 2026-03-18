interface DraftReplyProps {
  draftText: string;
  missingInfo: string[];
}

export function DraftReply({ draftText, missingInfo }: DraftReplyProps) {
  const wordCount = draftText.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>

      {/* Draft text card */}
      <div className="draft-card">
        <div className="draft-card-header">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <span>Suggested Reply</span>
          <span className="draft-word-count">{wordCount} words</span>
        </div>
        <div className="draft-text">{draftText}</div>
      </div>

      {/* Missing info */}
      {missingInfo.length > 0 && (
        <div className="missing-card">
          <div className="missing-card-header">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <span>Things to fill in</span>
          </div>
          <ul className="missing-list">
            {missingInfo.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
