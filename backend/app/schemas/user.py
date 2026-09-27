import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr
from app.schemas.common import BaseSchema


class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: str = "analyst"  # owner, admin, manager, analyst


class UserCreate(UserBase):
    company_id: uuid.UUID
    password: str
    employee_id: Optional[uuid.UUID] = None


class UserUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None


class UserResponse(UserBase, BaseSchema):
    id: uuid.UUID
    company_id: uuid.UUID
    employee_id: Optional[uuid.UUID] = None
    is_active: bool
    last_login: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    # Notice: password_hash is strictly NOT exposed
