from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.services.analytics import AnalyticsService
from app.schemas.dashboard import DashboardOverviewResponse

router = APIRouter()


@router.get("/overview", response_model=DashboardOverviewResponse)
def get_dashboard_overview(
    days: int = Query(30, ge=7, le=365, description="Period in days (7, 30, 90, 365)"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get consolidated real-time dashboard business intelligence overview.
    Calculates revenue, expenses, net profit, margins, top products, recent sales,
    and inventory valuation from actual PostgreSQL transactional records.
    """
    return AnalyticsService.get_dashboard_overview(
        db=db,
        company_id=current_user.company_id,
        days=days
    )
