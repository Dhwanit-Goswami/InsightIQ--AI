"""
Workspace Settings endpoints — persistent user preferences via PostgreSQL.
GET  /api/v1/settings   — load settings for current user
PUT  /api/v1/settings   — save / upsert settings for current user
"""
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.workspace_settings import WorkspaceSettings

router = APIRouter()


class SettingsPayload(BaseModel):
    weekly_digest: Optional[bool] = None
    ai_insights_alerts: Optional[bool] = None
    revenue_alerts: Optional[bool] = None
    push_alerts: Optional[bool] = None
    theme: Optional[str] = None           # 'dark' | 'light'
    language: Optional[str] = None
    timezone: Optional[str] = None
    currency: Optional[str] = None


class SettingsResponse(BaseModel):
    weekly_digest: bool
    ai_insights_alerts: bool
    revenue_alerts: bool
    push_alerts: bool
    theme: str
    language: str
    timezone: str
    currency: str

    class Config:
        from_attributes = True


@router.get("", response_model=SettingsResponse)
def get_settings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return the current user's workspace settings, creating defaults if first visit."""
    ws = db.query(WorkspaceSettings).filter(WorkspaceSettings.user_id == current_user.id).first()
    if not ws:
        ws = WorkspaceSettings(
            user_id=current_user.id,
            company_id=current_user.company_id,
        )
        db.add(ws)
        db.commit()
        db.refresh(ws)
    return SettingsResponse.model_validate(ws)


@router.put("", response_model=SettingsResponse)
def update_settings(
    payload: SettingsPayload,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Upsert workspace settings for the current user."""
    ws = db.query(WorkspaceSettings).filter(WorkspaceSettings.user_id == current_user.id).first()
    if not ws:
        ws = WorkspaceSettings(
            user_id=current_user.id,
            company_id=current_user.company_id,
        )
        db.add(ws)

    if payload.weekly_digest is not None:
        ws.weekly_digest = payload.weekly_digest
    if payload.ai_insights_alerts is not None:
        ws.ai_insights_alerts = payload.ai_insights_alerts
    if payload.revenue_alerts is not None:
        ws.revenue_alerts = payload.revenue_alerts
    if payload.push_alerts is not None:
        ws.push_alerts = payload.push_alerts
    if payload.theme is not None and payload.theme in ("dark", "light"):
        ws.theme = payload.theme
    if payload.language is not None:
        ws.language = payload.language
    if payload.timezone is not None:
        ws.timezone = payload.timezone
    if payload.currency is not None:
        ws.currency = payload.currency

    db.commit()
    db.refresh(ws)
    return SettingsResponse.model_validate(ws)
