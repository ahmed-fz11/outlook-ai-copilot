interface CustomerCardProps {
  name: string;
  company?: string | null;
}

export function CustomerCard({ name, company }: CustomerCardProps) {
  return (
    <section className="card customer-card">
      <h4>Customer</h4>
      <p className="customer-name">{name}</p>
      {company && <p className="customer-company">{company}</p>}
    </section>
  );
}
