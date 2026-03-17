"""Application-level auth helpers that bridge Supabase Auth to our user/tenant model."""

import uuid

from sqlalchemy.orm import Session

from app.models.tenant import Tenant
from app.models.user import User


class AuthService:
    @staticmethod
    def get_app_user(db: Session, supabase_user_id: str) -> User | None:
        """Resolve a Supabase auth UID to our application User record."""
        return (
            db.query(User)
            .filter(User.supabase_auth_user_id == supabase_user_id)
            .first()
        )

    @staticmethod
    def get_tenant_id_for_user(db: Session, supabase_user_id: str) -> uuid.UUID | None:
        user = AuthService.get_app_user(db, supabase_user_id)
        return user.tenant_id if user else None

    @staticmethod
    def provision_user(db: Session, supabase_user_id: str, email: str) -> User:
        """Create a User (and personal Tenant) on first login if they don't exist yet."""
        existing = AuthService.get_app_user(db, supabase_user_id)
        if existing:
            return existing

        # Create a personal tenant named after the email domain
        domain = email.split("@")[-1] if "@" in email else "personal"
        slug_base = domain.replace(".", "-")
        # Make slug unique by appending a short UUID fragment
        slug = f"{slug_base}-{str(uuid.uuid4())[:8]}"

        tenant = Tenant(
            name=domain,
            slug=slug,
            plan="free",
            status="active",
        )
        db.add(tenant)
        db.flush()  # get tenant.id without committing

        user = User(
            tenant_id=tenant.id,
            supabase_auth_user_id=supabase_user_id,
            email=email,
            full_name="",
            role="admin",
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user


auth_service = AuthService()
