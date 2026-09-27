import uuid
from sqlalchemy import Column, String, Text, Numeric, Date, DateTime, ForeignKey, func, Uuid
from sqlalchemy.orm import relationship

from app.core.database import Base


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    company_id = Column(Uuid, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    category = Column(String(100), nullable=False, index=True)
    description = Column(Text, nullable=False)
    amount = Column(Numeric(14, 2), nullable=False)
    expense_date = Column(Date, nullable=False, index=True)
    payment_method = Column(String(50), default="bank_transfer", nullable=False)
    vendor = Column(String(255), nullable=True)
    status = Column(String(50), default="paid", nullable=False)  # pending, paid, approved, rejected
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    company = relationship("Company", back_populates="expenses")

    def __repr__(self) -> str:
        return f"<Expense id={self.id} category='{self.category}' amount={self.amount}>"
