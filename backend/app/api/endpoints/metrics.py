import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.business_metric import BusinessMetric
from app.schemas.business_metric import BusinessMetricResponse, BusinessMetricCreate

router = APIRouter()


@router.get("", response_model=List[BusinessMetricResponse])
def list_business_metrics(
    metric_name: Optional[str] = None,
    category: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve time-series business metrics for company."""
    query = db.query(BusinessMetric).filter(BusinessMetric.company_id == current_user.company_id)
    if metric_name:
        query = query.filter(BusinessMetric.metric_name == metric_name)
    if category:
        query = query.filter(BusinessMetric.category == category)

    metrics = query.order_by(BusinessMetric.metric_date.desc()).limit(100).all()
    # Format metadata_ -> metadata for response
    results = []
    for m in metrics:
        res = BusinessMetricResponse(
            id=m.id,
            company_id=m.company_id,
            metric_name=m.metric_name,
            metric_value=m.metric_value,
            metric_date=m.metric_date,
            category=m.category,
            metadata=m.metadata_,
            created_at=m.created_at,
            updated_at=m.updated_at
        )
        results.append(res)
    return results


@router.post("", response_model=BusinessMetricResponse)
def create_business_metric(
    payload: BusinessMetricCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Record a new business metric point."""
    bm = BusinessMetric(
        company_id=current_user.company_id,
        metric_name=payload.metric_name,
        metric_value=payload.metric_value,
        metric_date=payload.metric_date,
        category=payload.category,
        metadata_=payload.metadata
    )
    db.add(bm)
    db.commit()
    db.refresh(bm)
    return BusinessMetricResponse(
        id=bm.id,
        company_id=bm.company_id,
        metric_name=bm.metric_name,
        metric_value=bm.metric_value,
        metric_date=bm.metric_date,
        category=bm.category,
        metadata=bm.metadata_,
        created_at=bm.created_at,
        updated_at=bm.updated_at
    )
