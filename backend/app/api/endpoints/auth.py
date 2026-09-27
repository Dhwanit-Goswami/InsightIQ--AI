import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
)
from app.models.user import User
from app.models.company import Company
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse
from app.schemas.user import UserResponse
from app.schemas.company import CompanyResponse

router = APIRouter()


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    """
    Register a new company and initial owner user account.
    """
    existing_user = db.query(User).filter(User.email == payload.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )

    # Create Company
    company = Company(
        name=payload.company_name,
        legal_name=payload.company_name,
        industry=payload.industry,
        email=payload.email,
        country="India",
        currency="INR",
        timezone="Asia/Kolkata",
        is_active=True
    )
    db.add(company)
    db.flush()

    # Create Owner User
    user = User(
        company_id=company.id,
        name=payload.name,
        email=payload.email,
        password_hash=hash_password(payload.password),
        role=payload.role if payload.role in ["owner", "admin"] else "owner",
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    db.refresh(company)

    # Generate JWT
    token = create_access_token({"sub": str(user.id), "company_id": str(company.id), "role": user.role})

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
        company=CompanyResponse.model_validate(company)
    )


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticate user with email and password, returning JWT access token.
    """
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated."
        )

    # Update last login timestamp
    user.last_login = datetime.now(timezone.utc)
    db.commit()
    db.refresh(user)

    company = db.query(Company).filter(Company.id == user.company_id).first()
    token = create_access_token({"sub": str(user.id), "company_id": str(user.company_id), "role": user.role})

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
        company=CompanyResponse.model_validate(company) if company else None
    )


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """
    Retrieve current authenticated user details.
    """
    return UserResponse.model_validate(current_user)
