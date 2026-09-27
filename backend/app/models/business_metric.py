import uuid
from sqlalchemy import Column, String, Numeric, Date, DateTime, ForeignKey, Index, func, Uuid
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from app.core.database import Base


class BusinessMetric(Base):
    __tablename__ = "business_metrics"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    company_id = Column(Uuid, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    metric_name = Column(String(100), nullable=False, index=True)
    metric_value = Column(Numeric(18, 4), nullable=False)
    metric_date = Column(Date, nullable=False, index=True)
    category = Column(String(100), nullable=True, index=True)
    metadata_ = Column("metadata", JSONB, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    __table_args__ = (
        Index("ix_business_metric_company_name_date", "company_id", "metric_name", "metric_date"),
    )

    # Relationships
    company = relationship("Company", back_populates="business_metrics")

    def __repr__(self) -> str:
        return f"<BusinessMetric id={self.id} name='{self.metric_name}' value={self.metric_value} date={self.metric_date}>"
