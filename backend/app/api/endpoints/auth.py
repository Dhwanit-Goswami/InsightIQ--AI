"""
Auth endpoints — login, register, me, plus:
- POST /auth/forgot-password   — request password reset link
- POST /auth/reset-password    — consume token and set new password
- GET  /auth/sessions          — list active sessions for current user
- DELETE /auth/sessions/{id}   — revoke a specific session
"""
import hashlib
import secrets
import uuid
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import List, Optional

from app.core.database import get_db
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
)
from app.models.user import User
from app.models.company import Company
from app.models.password_reset_token import PasswordResetToken
from app.models.user_session import UserSession
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse
from app.schemas.user import UserResponse
from app.schemas.company import CompanyResponse
from app.services.email_service import send_password_reset_email
from app.core.config import settings

router = APIRouter()

RESET_TOKEN_EXPIRE_MINUTES = 60  # 1 hour


# ─── Schemas ──────────────────────────────────────────────────────────────────

class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


class SessionResponse(BaseModel):
    id: str
    device_name: Optional[str]
    ip_address: Optional[str]
    created_at: str
    last_active: str
    is_revoked: bool
    is_current: bool = False


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _hash_token(raw: str) -> str:
    return hashlib.sha256(raw.encode()).hexdigest()


def _create_session(
    db: Session,
    user: User,
    jti: str,
    expires_at: datetime,
    request: Optional[Request] = None,
) -> UserSession:
    device_name = None
    ip_address = None
    user_agent = None
    if request:
        ua = request.headers.get("user-agent", "")
        user_agent = ua[:500]
        ip_address = (
            request.headers.get("x-forwarded-for", "").split(",")[0].strip()
            or getattr(request.client, "host", None)
        )
        # Derive a human-readable device name from UA
        if "Mobile" in ua:
            device_name = "Mobile Browser"
        elif "Windows" in ua:
            device_name = "Windows Desktop"
        elif "Mac" in ua:
            device_name = "macOS Desktop"
        elif "Linux" in ua:
            device_name = "Linux Desktop"
        else:
            device_name = "Web Browser"

    session = UserSession(
        user_id=user.id,
        company_id=user.company_id,
        jti=jti,
        device_name=device_name,
        ip_address=ip_address,
        user_agent=user_agent,
        expires_at=expires_at,
    )
    db.add(session)
    return session


# ─── Endpoints ────────────────────────────────────────────────────────────────

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, request: Request, db: Session = Depends(get_db)):
    """Register a new company and initial owner user account."""
    existing_user = db.query(User).filter(User.email == payload.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )

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

    user = User(
        company_id=company.id,
        name=payload.name,
        email=payload.email,
        password_hash=hash_password(payload.password),
        role=payload.role if payload.role in ["owner", "admin"] else "owner",
        is_active=True
    )
    db.add(user)
    db.flush()

    jti = secrets.token_hex(32)
    expires_at = datetime.now(timezone.utc) + timedelta(hours=24)
    _create_session(db, user, jti, expires_at, request)

    db.commit()
    db.refresh(user)
    db.refresh(company)

    token = create_access_token({
        "sub": str(user.id),
        "company_id": str(company.id),
        "role": user.role,
        "jti": jti,
    })
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
        company=CompanyResponse.model_validate(company)
    )


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, request: Request, db: Session = Depends(get_db)):
    """Authenticate user with email and password, returning JWT access token."""
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password.")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User account is deactivated.")

    user.last_login = datetime.now(timezone.utc)

    jti = secrets.token_hex(32)
    expires_at = datetime.now(timezone.utc) + timedelta(hours=24)
    _create_session(db, user, jti, expires_at, request)

    db.commit()
    db.refresh(user)

    company = db.query(Company).filter(Company.id == user.company_id).first()
    token = create_access_token({
        "sub": str(user.id),
        "company_id": str(user.company_id),
        "role": user.role,
        "jti": jti,
    })
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
        company=CompanyResponse.model_validate(company) if company else None
    )


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Retrieve current authenticated user details."""
    return UserResponse.model_validate(current_user)


@router.post("/forgot-password", status_code=status.HTTP_200_OK)
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """
    Request a password reset link.
    Always returns 200 OK to prevent user enumeration.
    If email exists, a reset link is sent (or printed to console in dev mode).
    """
    user = db.query(User).filter(User.email == payload.email).first()
    if user:
        # Invalidate all existing unused tokens for this user
        db.query(PasswordResetToken).filter(
            PasswordResetToken.user_id == user.id,
            PasswordResetToken.used == False,
        ).update({"used": True})

        raw_token = secrets.token_urlsafe(32)
        token_hash = _hash_token(raw_token)
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=RESET_TOKEN_EXPIRE_MINUTES)

        prt = PasswordResetToken(
            user_id=user.id,
            token_hash=token_hash,
            expires_at=expires_at,
            used=False,
        )
        db.add(prt)
        db.commit()

        frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:5173")
        reset_link = f"{frontend_url}/reset-password?token={raw_token}"
        send_password_reset_email(to_email=user.email, reset_link=reset_link, user_name=user.name)

    return {"message": "If that email is registered, a reset link has been sent."}


@router.post("/reset-password", status_code=status.HTTP_200_OK)
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Consume a reset token and update the user's password."""
    if len(payload.new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters.")

    token_hash = _hash_token(payload.token)
    prt = db.query(PasswordResetToken).filter(
        PasswordResetToken.token_hash == token_hash,
        PasswordResetToken.used == False,
    ).first()

    if not prt:
        raise HTTPException(status_code=400, detail="Invalid or already used reset token.")

    if prt.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Reset token has expired. Please request a new one.")

    user = db.query(User).filter(User.id == prt.user_id).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=400, detail="User account not found or inactive.")

    user.password_hash = hash_password(payload.new_password)
    prt.used = True
    db.commit()

    return {"message": "Password updated successfully. You can now log in with your new password."}


@router.get("/sessions", response_model=List[SessionResponse])
def list_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List all active (non-revoked, non-expired) sessions for the current user."""
    now = datetime.now(timezone.utc)
    sessions = (
        db.query(UserSession)
        .filter(
            UserSession.user_id == current_user.id,
            UserSession.is_revoked == False,
            UserSession.expires_at > now,
        )
        .order_by(UserSession.last_active.desc())
        .all()
    )
    return [
        SessionResponse(
            id=str(s.id),
            device_name=s.device_name,
            ip_address=s.ip_address,
            created_at=s.created_at.strftime("%d %b %Y, %H:%M"),
            last_active=s.last_active.strftime("%d %b %Y, %H:%M"),
            is_revoked=s.is_revoked,
        )
        for s in sessions
    ]


@router.delete("/sessions/{session_id}", status_code=status.HTTP_200_OK)
def revoke_session(
    session_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Revoke a specific session by ID. Only the owner can revoke their own sessions."""
    session = db.query(UserSession).filter(
        UserSession.id == session_id,
        UserSession.user_id == current_user.id,
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")
    if session.is_revoked:
        return {"message": "Session was already revoked."}

    session.is_revoked = True
    session.revoked_at = datetime.now(timezone.utc)
    db.commit()
    return {"message": "Session revoked successfully."}
