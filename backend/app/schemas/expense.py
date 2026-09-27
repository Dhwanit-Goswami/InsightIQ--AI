import uuid
from datetime import datetime, date
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel
from app.schemas.common import BaseSchema


class ExpenseBase(BaseModel):
    category: str
    description: str
    amount: Decimal
    expense_date: date
    payment_method: str = "bank_transfer"
    vendor: Optional[str] = None
    status: str = "paid"
    notes: Optional[str] = None


class ExpenseCreate(ExpenseBase):
    pass


class ExpenseUpdate(BaseModel):
    category: Optional[str] = None
    description: Optional[str] = None
    amount: Optional[Decimal] = None
    expense_date: Optional[date] = None
    payment_method: Optional[str] = None
    vendor: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None


class ExpenseResponse(ExpenseBase, BaseSchema):
    id: uuid.UUID
    company_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
