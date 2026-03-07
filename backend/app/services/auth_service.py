"""Application-level auth helpers that bridge Supabase Auth to our user/tenant model."""

import uuid

from sqlalchemy.orm import Session

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


auth_service = AuthService()
