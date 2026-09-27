import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.report import Report
from app.schemas.report import ReportResponse, ReportCreate

router = APIRouter()


@router.get("", response_model=List[ReportResponse])
def list_reports(
    report_type: Optional[str] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List business intelligence reports for the current company."""
    query = db.query(Report).filter(Report.company_id == current_user.company_id)
    if report_type and report_type != "All":
        query = query.filter(Report.report_type == report_type)
    if status_filter:
        query = query.filter(Report.status == status_filter)
    if search:
        query = query.filter(Report.name.ilike(f"%{search}%"))

    reports = query.order_by(Report.created_at.desc()).all()
    return [ReportResponse.model_validate(r) for r in reports]


@router.post("", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
def create_report(
    payload: ReportCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Request generation of a new report."""
    report = Report(
        company_id=current_user.company_id,
        generated_by=current_user.id,
        name=payload.name,
        report_type=payload.report_type,
        description=payload.description,
        parameters=payload.parameters,
        status="completed",  # Generated immediately for evaluation MVP
        completed_at=datetime.now(timezone.utc)
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return ReportResponse.model_validate(report)


@router.get("/{report_id}", response_model=ReportResponse)
def get_report(
    report_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve report metadata."""
    report = db.query(Report).filter(
        Report.id == report_id,
        Report.company_id == current_user.company_id
    ).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found.")
    return ReportResponse.model_validate(report)
