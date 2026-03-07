"""Customer lookup from the database."""

import uuid

from sqlalchemy.orm import Session

from app.models.customer import Customer


class CustomerRepository:
    @staticmethod
    def find_by_email(db: Session, tenant_id: uuid.UUID, sender_email: str) -> Customer | None:
        """Look up a customer by exact email match."""
        return (
            db.query(Customer)
            .filter(Customer.tenant_id == tenant_id, Customer.email == sender_email)
            .first()
        )

    @staticmethod
    def find_by_domain(db: Session, tenant_id: uuid.UUID, domain: str) -> Customer | None:
        """Fall back to domain-level match if no exact email found."""
        return (
            db.query(Customer)
            .filter(Customer.tenant_id == tenant_id, Customer.email_domain == domain)
            .first()
        )

    @staticmethod
    def lookup(db: Session, tenant_id: uuid.UUID, sender_email: str) -> Customer | None:
        """Try exact email first, then domain match."""
        customer = CustomerRepository.find_by_email(db, tenant_id, sender_email)
        if customer:
            return customer
        domain = sender_email.split("@")[-1] if "@" in sender_email else ""
        return CustomerRepository.find_by_domain(db, tenant_id, domain) if domain else None


customer_repository = CustomerRepository()
