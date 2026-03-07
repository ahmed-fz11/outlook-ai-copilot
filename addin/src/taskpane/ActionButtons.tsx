interface ActionButtonsProps {
  draftText: string;
  onRegenerate: () => void;
  generating: boolean;
}

export function ActionButtons({
  draftText,
  onRegenerate,
  generating,
}: ActionButtonsProps) {
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
  };

  return (
    <div className="action-buttons">
      <button className="btn-primary" onClick={handleCopy}>
        Copy Draft
      </button>
      <button
        className="btn-secondary"
        onClick={onRegenerate}
        disabled={generating}
      >
        {generating ? "Regenerating..." : "Regenerate"}
      </button>
    </div>
  );
}
