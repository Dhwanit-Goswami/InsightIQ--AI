"""
Secondary Analytics SQL Endpoints
GET /api/v1/analytics/customer-growth   — real monthly customer acquisition cohorts
GET /api/v1/analytics/quarterly         — real quarterly revenue, cost and margin rollup
GET /api/v1/analytics/forecast          — real ML sales forecast (Holt-Winters / Ridge)
"""
from typing import Dict, Any, List
from decimal import Decimal
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, extract

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.sale import Sale
from app.models.expense import Expense
from app.models.customer import Customer
from app.services.analytics import AnalyticsService
from app.services.forecasting import get_sales_forecast

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


@router.get("/customer-growth")
def get_customer_growth(
    months: int = Query(12, ge=3, le=24),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Real monthly customer acquisition cohorts from PostgreSQL.
    Returns one row per month with new customers acquired that month.
    """
    cutoff = datetime.now(timezone.utc) - timedelta(days=months * 31)

    rows = (
        db.query(
            func.date_trunc("month", Customer.created_at).label("month"),
            func.count(Customer.id).label("new_customers"),
        )
        .filter(
            Customer.company_id == current_user.company_id,
            Customer.created_at >= cutoff,
        )
        .group_by("month")
        .order_by("month")
        .all()
    )

    # Cumulative total starting from customers before the window
    base_count = (
        db.query(func.count(Customer.id))
        .filter(
            Customer.company_id == current_user.company_id,
            Customer.created_at < cutoff,
        )
        .scalar()
        or 0
    )

    result = []
    running_total = base_count
    for row in rows:
        running_total += row.new_customers
        result.append({
            "month": row.month.strftime("%b %Y"),
            "new_customers": row.new_customers,
            "total_customers": running_total,
        })

    # If no data, return a sensible empty response
    if not result:
        return {"data": [], "note": "No customer records found for the selected period."}

    return {"data": result}


@router.get("/quarterly")
def get_quarterly_comparison(
    years: int = Query(2, ge=1, le=4),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Real quarterly revenue, expense and margin rollup from PostgreSQL.
    Returns one row per quarter for the last N fiscal years.
    """
    cutoff = datetime.now(timezone.utc) - timedelta(days=years * 366)

    # Revenue per quarter
    rev_rows = (
        db.query(
            extract("year", Sale.sale_date).label("year"),
            extract("quarter", Sale.sale_date).label("quarter"),
            func.coalesce(func.sum(Sale.total_amount), Decimal("0.00")).label("revenue"),
        )
        .filter(
            Sale.company_id == current_user.company_id,
            Sale.status == "completed",
            Sale.sale_date >= cutoff,
        )
        .group_by("year", "quarter")
        .order_by("year", "quarter")
        .all()
    )

    # Expense per quarter
    exp_rows = (
        db.query(
            extract("year", Expense.expense_date).label("year"),
            extract("quarter", Expense.expense_date).label("quarter"),
            func.coalesce(func.sum(Expense.amount), Decimal("0.00")).label("expenses"),
        )
        .filter(
            Expense.company_id == current_user.company_id,
            Expense.status == "paid",
            Expense.expense_date >= cutoff.date(),
        )
        .group_by("year", "quarter")
        .order_by("year", "quarter")
        .all()
    )

    # Build a dict keyed by (year, quarter)
    exp_map = {(int(r.year), int(r.quarter)): float(r.expenses) for r in exp_rows}

    result = []
    for row in rev_rows:
        yr, qr = int(row.year), int(row.quarter)
        rev = float(row.revenue)
        exp = exp_map.get((yr, qr), 0.0)
        profit = rev - exp
        margin = round((profit / rev * 100), 1) if rev > 0 else 0.0
        result.append({
            "quarter": f"Q{qr} FY{yr}",
            "revenue": round(rev, 2),
            "expenses": round(exp, 2),
            "profit": round(profit, 2),
            "margin_pct": margin,
        })

    if not result:
        return {"data": [], "note": "No quarterly data found for the selected period."}

    return {"data": result}


@router.get("/forecast")
def get_forecast(
    months: int = Query(6, ge=1, le=12),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Real ML sales forecast using Holt-Winters Exponential Smoothing.
    Falls back to Ridge regression if statsmodels is unavailable.
    """
    result = get_sales_forecast(db, current_user.company_id, forecast_months=months)
    return _serialize(result)
