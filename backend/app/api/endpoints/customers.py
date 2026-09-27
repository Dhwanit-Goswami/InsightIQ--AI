import uuid
from decimal import Decimal
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.models.user import User
from app.models.customer import Customer
from app.schemas.customer import CustomerResponse, CustomerCreate, CustomerUpdate

router = APIRouter()


@router.get("", response_model=List[CustomerResponse])
def list_customers(
    segment: Optional[str] = None,
    city: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List customers scoped to the user's company."""
    query = db.query(Customer).filter(Customer.company_id == current_user.company_id)
    if segment:
        query = query.filter(Customer.segment == segment)
    if city:
        query = query.filter(Customer.city.ilike(f"%{city}%"))
    if search:
        query = query.filter(
            (Customer.name.ilike(f"%{search}%")) |
            (Customer.email.ilike(f"%{search}%")) |
            (Customer.phone.ilike(f"%{search}%"))
        )
    customers = query.order_by(Customer.total_purchases.desc()).offset(offset).limit(limit).all()
    return [CustomerResponse.model_validate(c) for c in customers]


@router.post("", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
def create_customer(
    payload: CustomerCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add a new customer."""
    customer = Customer(
        company_id=current_user.company_id,
        total_purchases=Decimal("0.00"),
        is_active=True,
        **payload.model_dump()
    )
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return CustomerResponse.model_validate(customer)


@router.get("/{customer_id}", response_model=CustomerResponse)
def get_customer(
    customer_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get customer details."""
    customer = db.query(Customer).filter(
        Customer.id == customer_id,
        Customer.company_id == current_user.company_id
    ).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found.")
    return CustomerResponse.model_validate(customer)


@router.put("/{customer_id}", response_model=CustomerResponse)
def update_customer(
    customer_id: uuid.UUID,
    payload: CustomerUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update customer details."""
    customer = db.query(Customer).filter(
        Customer.id == customer_id,
        Customer.company_id == current_user.company_id
    ).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found.")

    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(customer, k, v)

    db.commit()
    db.refresh(customer)
    return CustomerResponse.model_validate(customer)


@router.delete("/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_customer(
    customer_id: uuid.UUID,
    current_user: User = Depends(require_role(["owner", "admin"])),
    db: Session = Depends(get_db)
):
    """Delete customer."""
    customer = db.query(Customer).filter(
        Customer.id == customer_id,
        Customer.company_id == current_user.company_id
    ).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found.")
    db.delete(customer)
    db.commit()
    return None
