import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr
from app.schemas.common import BaseSchema


class CompanyBase(BaseModel):
    name: str
    legal_name: Optional[str] = None
    industry: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: str = "India"
    pincode: Optional[str] = None
    website: Optional[str] = None
    currency: str = "INR"
    timezone: str = "Asia/Kolkata"


class CompanyCreate(CompanyBase):
    pass


class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    legal_name: Optional[str] = None
    industry: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    pincode: Optional[str] = None
    website: Optional[str] = None
    currency: Optional[str] = None
    timezone: Optional[str] = None


class CompanyResponse(CompanyBase, BaseSchema):
    id: uuid.UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime
