interface EmailSummaryProps {
  sender: string;
  subject: string;
  summary?: string;
}

export function EmailSummary({ sender, subject, summary }: EmailSummaryProps) {
  return (
    <section className="card email-summary">
      <div className="field">
        <span className="label">From</span>
        <span className="value">{sender}</span>
      </div>
      <div className="field">
        <span className="label">Subject</span>
        <span className="value">{subject}</span>
      </div>
      {summary && (
        <div className="field">
          <span className="label">Summary</span>
          <p className="value summary-text">{summary}</p>
        </div>
      )}
    </section>
  );
}
