import uuid
from sqlalchemy import Column, String, Text, Numeric, DateTime, ForeignKey, UniqueConstraint, func, Uuid
from sqlalchemy.orm import relationship

from app.core.database import Base


class Sale(Base):
    __tablename__ = "sales"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    company_id = Column(Uuid, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    customer_id = Column(Uuid, ForeignKey("customers.id", ondelete="SET NULL"), nullable=True, index=True)
    invoice_number = Column(String(100), nullable=False, index=True)
    sale_date = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    subtotal = Column(Numeric(14, 2), default=0.00, nullable=False)
    tax_amount = Column(Numeric(14, 2), default=0.00, nullable=False)
    discount_amount = Column(Numeric(14, 2), default=0.00, nullable=False)
    total_amount = Column(Numeric(14, 2), default=0.00, nullable=False)
    payment_method = Column(String(50), default="cash", nullable=False)  # cash, upi, card, bank_transfer, other
    status = Column(String(50), default="completed", nullable=False)      # completed, pending, cancelled, refunded
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    __table_args__ = (
        UniqueConstraint("company_id", "invoice_number", name="uq_company_invoice_number"),
    )

    # Relationships
    company = relationship("Company", back_populates="sales")
    customer = relationship("Customer", back_populates="sales")
    items = relationship("SaleItem", back_populates="sale", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Sale id={self.id} invoice='{self.invoice_number}' total={self.total_amount}>"
