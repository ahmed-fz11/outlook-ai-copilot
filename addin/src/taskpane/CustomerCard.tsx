interface CustomerCardProps {
  name: string;
  company?: string | null;
}

function getInitials(name: string): string {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export function CustomerCard({ name, company }: CustomerCardProps) {
  return (
    <div className="customer-card">
      <div className="customer-avatar">{getInitials(name)}</div>
      <div className="customer-info">
        <div className="customer-name">{name}</div>
        {company && <div className="customer-company">{company}</div>}
      </div>
      {/* verified badge */}
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, opacity: 0.7 }}>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
    </div>
  );
}
