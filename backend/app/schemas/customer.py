import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, EmailStr
from app.schemas.common import BaseSchema


class CustomerBase(BaseModel):
    name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    segment: Optional[str] = "standard"


class CustomerCreate(CustomerBase):
    pass


class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    segment: Optional[str] = None
    is_active: Optional[bool] = None


class CustomerResponse(CustomerBase, BaseSchema):
    id: uuid.UUID
    company_id: uuid.UUID
    total_purchases: Decimal
    last_purchase_date: Optional[datetime] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime
