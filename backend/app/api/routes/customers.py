"""Customer lookup endpoints."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_user
from app.schemas.customer import CustomerCard
from app.services.customer_repository import customer_repository

router = APIRouter()


@router.get("/lookup", response_model=CustomerCard | None)
async def lookup_customer(
    sender_email: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Look up a customer by sender email for the current tenant."""
    tenant_id = current_user.get("tenant_id")
    if not tenant_id:
        raise HTTPException(status_code=403, detail="User not linked to a tenant")

    customer = customer_repository.lookup(db, tenant_id, sender_email)
    if not customer:
        return None

    return CustomerCard.model_validate(customer)
