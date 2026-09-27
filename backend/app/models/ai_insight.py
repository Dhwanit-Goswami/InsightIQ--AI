import uuid
from sqlalchemy import Column, String, Text, Boolean, Numeric, Date, DateTime, ForeignKey, func, Uuid
from sqlalchemy.orm import relationship

from app.core.database import Base


class AIInsight(Base):
    __tablename__ = "ai_insights"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    company_id = Column(Uuid, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    summary = Column(Text, nullable=False)
    detailed_analysis = Column(Text, nullable=True)
    category = Column(String(100), nullable=False, index=True)  # sales, revenue, expenses, customers, inventory, profitability, operations, general
    severity = Column(String(50), default="info", nullable=False)  # info, low, medium, high, critical
    confidence_score = Column(Numeric(5, 2), nullable=True)        # 0.00 to 100.00 %
    data_period_start = Column(Date, nullable=True)
    data_period_end = Column(Date, nullable=True)
    is_read = Column(Boolean, default=False, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    company = relationship("Company", back_populates="ai_insights")
    recommendations = relationship("AIRecommendation", back_populates="insight", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<AIInsight id={self.id} category='{self.category}' severity='{self.severity}'>"
