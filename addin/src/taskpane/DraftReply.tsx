interface DraftReplyProps {
  draftText: string;
  missingInfo: string[];
}

export function DraftReply({ draftText, missingInfo }: DraftReplyProps) {
  return (
    <section className="card draft-reply">
      <h4>Suggested Reply</h4>
      <div className="draft-text">{draftText}</div>

      {missingInfo.length > 0 && (
        <div className="missing-info">
          <h5>Missing Information</h5>
          <ul>
            {missingInfo.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
