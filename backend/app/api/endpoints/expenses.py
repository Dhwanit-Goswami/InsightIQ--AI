import uuid
from decimal import Decimal
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.models.user import User
from app.models.expense import Expense
from app.schemas.expense import ExpenseResponse, ExpenseCreate, ExpenseUpdate

router = APIRouter()


@router.get("", response_model=List[ExpenseResponse])
def list_expenses(
    category: Optional[str] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = None,
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List expenses scoped to the current user's company."""
    query = db.query(Expense).filter(Expense.company_id == current_user.company_id)
    if category and category != "All":
        query = query.filter(Expense.category == category)
    if status_filter:
        query = query.filter(Expense.status == status_filter)
    if search:
        query = query.filter(
            (Expense.description.ilike(f"%{search}%")) |
            (Expense.vendor.ilike(f"%{search}%")) |
            (Expense.category.ilike(f"%{search}%"))
        )

    expenses = query.order_by(Expense.expense_date.desc()).offset(offset).limit(limit).all()
    return [ExpenseResponse.model_validate(e) for e in expenses]


@router.post("", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
def create_expense(
    payload: ExpenseCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Log an operating expense."""
    expense = Expense(
        company_id=current_user.company_id,
        **payload.model_dump()
    )
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return ExpenseResponse.model_validate(expense)


@router.get("/{expense_id}", response_model=ExpenseResponse)
def get_expense(
    expense_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve expense details."""
    expense = db.query(Expense).filter(
        Expense.id == expense_id,
        Expense.company_id == current_user.company_id
    ).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense record not found.")
    return ExpenseResponse.model_validate(expense)


@router.put("/{expense_id}", response_model=ExpenseResponse)
def update_expense(
    expense_id: uuid.UUID,
    payload: ExpenseUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update expense details."""
    expense = db.query(Expense).filter(
        Expense.id == expense_id,
        Expense.company_id == current_user.company_id
    ).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense record not found.")

    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(expense, k, v)

    db.commit()
    db.refresh(expense)
    return ExpenseResponse.model_validate(expense)


@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense(
    expense_id: uuid.UUID,
    current_user: User = Depends(require_role(["owner", "admin"])),
    db: Session = Depends(get_db)
):
    """Delete expense."""
    expense = db.query(Expense).filter(
        Expense.id == expense_id,
        Expense.company_id == current_user.company_id
    ).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense record not found.")
    db.delete(expense)
    db.commit()
    return None
