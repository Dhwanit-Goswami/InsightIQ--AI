import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.models.user import User
from app.models.company import Company
from app.schemas.company import CompanyResponse, CompanyUpdate

router = APIRouter()


@router.get("/current", response_model=CompanyResponse)
def get_current_company(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve details of current authenticated user's company."""
    company = db.query(Company).filter(Company.id == current_user.company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company record not found.")
    return CompanyResponse.model_validate(company)


@router.get("/{company_id}", response_model=CompanyResponse)
def get_company_by_id(
    company_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve company details. Enforces company isolation."""
    if current_user.company_id != company_id and current_user.role != "owner":
        raise HTTPException(status_code=403, detail="Cross-company access is prohibited.")
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found.")
    return CompanyResponse.model_validate(company)


@router.put("/{company_id}", response_model=CompanyResponse)
def update_company(
    company_id: uuid.UUID,
    payload: CompanyUpdate,
    current_user: User = Depends(require_role(["owner", "admin"])),
    db: Session = Depends(get_db)
):
    """Update company settings. Only owners and admins can update."""
    if current_user.company_id != company_id:
        raise HTTPException(status_code=403, detail="Cross-company access is prohibited.")
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found.")

    for field, val in payload.model_dump(exclude_unset=True).items():
        setattr(company, field, val)

    db.commit()
    db.refresh(company)
    return CompanyResponse.model_validate(company)
