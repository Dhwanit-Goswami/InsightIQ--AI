import uuid
from sqlalchemy import Column, String, Boolean, Text, Numeric, DateTime, ForeignKey, UniqueConstraint, func, Uuid
from sqlalchemy.orm import relationship

from app.core.database import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    company_id = Column(Uuid, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    sku = Column(String(100), nullable=False, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    category = Column(String(100), nullable=True, index=True)
    unit = Column(String(50), default="pcs", nullable=False)
    cost_price = Column(Numeric(12, 2), default=0.00, nullable=False)
    selling_price = Column(Numeric(12, 2), default=0.00, nullable=False)
    tax_rate = Column(Numeric(5, 2), default=18.00, nullable=False)
    supplier = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    __table_args__ = (
        UniqueConstraint("company_id", "sku", name="uq_company_product_sku"),
    )

    # Relationships
    company = relationship("Company", back_populates="products")
    inventory = relationship("Inventory", back_populates="product", cascade="all, delete-orphan", uselist=False)
    sale_items = relationship("SaleItem", back_populates="product")

    def __repr__(self) -> str:
        return f"<Product id={self.id} sku='{self.sku}' name='{self.name}'>"
