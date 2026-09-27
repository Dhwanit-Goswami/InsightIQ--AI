from typing import Dict, Any, List
from decimal import Decimal
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.services.analytics import AnalyticsService

router = APIRouter()


def _serialize(obj):
    """Recursively convert Decimal → float in nested dicts/lists."""
    if isinstance(obj, dict):
        return {k: _serialize(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_serialize(v) for v in obj]
    if isinstance(obj, Decimal):
        return float(obj)
    return obj


@router.get("/overview")
def get_analytics_overview(
    days: int = Query(30, ge=7, le=365),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve high-level analytics summary."""
    overview = AnalyticsService.get_dashboard_overview(db, current_user.company_id, days)
    return _serialize({
        "period_days": days,
        "kpis": overview["kpis"],
        "monthly_trend": overview["monthly_trend"],
        "expense_breakdown": overview["expense_breakdown"],
        "inventory_summary": overview["inventory_summary"]
    })


@router.get("/revenue")
def get_revenue_analytics(
    days: int = Query(30, ge=7, le=365),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve detailed revenue trend data."""
    overview = AnalyticsService.get_dashboard_overview(db, current_user.company_id, days)
    return _serialize({
        "revenue_kpi": overview["kpis"]["revenue"],
        "monthly_trend": overview["monthly_trend"]
    })


@router.get("/expenses")
def get_expense_analytics(
    days: int = Query(30, ge=7, le=365),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve expense categories and breakdown."""
    overview = AnalyticsService.get_dashboard_overview(db, current_user.company_id, days)
    return _serialize({
        "expense_kpi": overview["kpis"]["expenses"],
        "categories": overview["expense_breakdown"]
    })


@router.get("/products")
def get_product_analytics(
    days: int = Query(90, ge=7, le=365),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve top performing products by volume and revenue."""
    overview = AnalyticsService.get_dashboard_overview(db, current_user.company_id, days)
    return _serialize({
        "top_products": overview["top_products"]
    })
