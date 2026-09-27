import uuid
from sqlalchemy import Column, Numeric, DateTime, ForeignKey, func, Uuid
from sqlalchemy.orm import relationship

from app.core.database import Base


class SaleItem(Base):
    __tablename__ = "sale_items"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    sale_id = Column(Uuid, ForeignKey("sales.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Uuid, ForeignKey("products.id", ondelete="RESTRICT"), nullable=False, index=True)
    quantity = Column(Numeric(12, 2), default=1.00, nullable=False)
    unit_price = Column(Numeric(12, 2), default=0.00, nullable=False)
    discount = Column(Numeric(12, 2), default=0.00, nullable=False)
    tax = Column(Numeric(12, 2), default=0.00, nullable=False)
    total_amount = Column(Numeric(12, 2), default=0.00, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    sale = relationship("Sale", back_populates="items")
    product = relationship("Product", back_populates="sale_items")

    def __repr__(self) -> str:
        return f"<SaleItem id={self.id} sale_id={self.sale_id} product_id={self.product_id} total={self.total_amount}>"
