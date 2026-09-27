import uuid
from sqlalchemy import Column, String, Boolean, Numeric, Date, DateTime, ForeignKey, UniqueConstraint, func, Uuid
from sqlalchemy.orm import relationship

from app.core.database import Base


class Employee(Base):
    __tablename__ = "employees"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    company_id = Column(Uuid, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    employee_code = Column(String(50), nullable=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    email = Column(String(255), nullable=True, index=True)
    phone = Column(String(50), nullable=True)
    department = Column(String(100), nullable=True, index=True)
    designation = Column(String(100), nullable=True)
    joining_date = Column(Date, nullable=True)
    salary = Column(Numeric(14, 2), nullable=True)
    status = Column(String(50), default="active", nullable=False)  # active, on_leave, terminated

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    __table_args__ = (
        UniqueConstraint("company_id", "employee_code", name="uq_company_employee_code"),
    )

    # Relationships
    company = relationship("Company", back_populates="employees")
    user = relationship("User", back_populates="employee", uselist=False)

    def __repr__(self) -> str:
        return f"<Employee id={self.id} code='{self.employee_code}' name='{self.name}'>"
