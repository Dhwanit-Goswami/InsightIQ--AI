import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.models.user import User
from app.models.employee import Employee
from app.schemas.employee import EmployeeResponse, EmployeeCreate, EmployeeUpdate

router = APIRouter()


@router.get("", response_model=List[EmployeeResponse])
def list_employees(
    department: Optional[str] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List employees scoped to the current user's company."""
    query = db.query(Employee).filter(Employee.company_id == current_user.company_id)
    if department:
        query = query.filter(Employee.department.ilike(f"%{department}%"))
    if status_filter:
        query = query.filter(Employee.status == status_filter)
    if search:
        query = query.filter(
            (Employee.name.ilike(f"%{search}%")) |
            (Employee.email.ilike(f"%{search}%")) |
            (Employee.employee_code.ilike(f"%{search}%"))
        )
    return [EmployeeResponse.model_validate(e) for e in query.order_by(Employee.name).all()]


@router.post("", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
def create_employee(
    payload: EmployeeCreate,
    current_user: User = Depends(require_role(["owner", "admin", "manager"])),
    db: Session = Depends(get_db)
):
    """Create a new employee record."""
    employee = Employee(
        company_id=current_user.company_id,
        **payload.model_dump()
    )
    db.add(employee)
    db.commit()
    db.refresh(employee)
    return EmployeeResponse.model_validate(employee)


@router.get("/{employee_id}", response_model=EmployeeResponse)
def get_employee(
    employee_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve an employee record."""
    employee = db.query(Employee).filter(
        Employee.id == employee_id,
        Employee.company_id == current_user.company_id
    ).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found.")
    return EmployeeResponse.model_validate(employee)


@router.put("/{employee_id}", response_model=EmployeeResponse)
def update_employee(
    employee_id: uuid.UUID,
    payload: EmployeeUpdate,
    current_user: User = Depends(require_role(["owner", "admin", "manager"])),
    db: Session = Depends(get_db)
):
    """Update employee details."""
    employee = db.query(Employee).filter(
        Employee.id == employee_id,
        Employee.company_id == current_user.company_id
    ).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found.")

    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(employee, k, v)

    db.commit()
    db.refresh(employee)
    return EmployeeResponse.model_validate(employee)


@router.delete("/{employee_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_employee(
    employee_id: uuid.UUID,
    current_user: User = Depends(require_role(["owner", "admin"])),
    db: Session = Depends(get_db)
):
    """Delete employee record."""
    employee = db.query(Employee).filter(
        Employee.id == employee_id,
        Employee.company_id == current_user.company_id
    ).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found.")
    db.delete(employee)
    db.commit()
    return None
