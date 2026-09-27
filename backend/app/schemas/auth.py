import uuid
from typing import Optional
from pydantic import BaseModel, EmailStr
from app.schemas.user import UserResponse
from app.schemas.company import CompanyResponse


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    company_name: str
    industry: Optional[str] = "General SME"
    role: str = "owner"


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
    company: Optional[CompanyResponse] = None
