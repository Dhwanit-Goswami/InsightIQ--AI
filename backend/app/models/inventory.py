import uuid
from sqlalchemy import Column, String, Numeric, DateTime, ForeignKey, UniqueConstraint, func, Uuid
from sqlalchemy.orm import relationship

from app.core.database import Base


class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    company_id = Column(Uuid, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Uuid, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    quantity = Column(Numeric(12, 2), default=0.00, nullable=False)
    reorder_level = Column(Numeric(12, 2), default=10.00, nullable=False)
    warehouse_location = Column(String(100), nullable=True)
    last_restocked_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    __table_args__ = (
        UniqueConstraint("company_id", "product_id", name="uq_company_product_inventory"),
    )

    # Relationships
    company = relationship("Company", back_populates="inventory")
    product = relationship("Product", back_populates="inventory")

    def __repr__(self) -> str:
        return f"<Inventory id={self.id} product_id={self.product_id} qty={self.quantity}>"
