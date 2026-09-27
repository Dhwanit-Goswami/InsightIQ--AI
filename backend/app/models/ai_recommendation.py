import uuid
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, func, Uuid
from sqlalchemy.orm import relationship

from app.core.database import Base


class AIRecommendation(Base):
    __tablename__ = "ai_recommendations"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    company_id = Column(Uuid, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    insight_id = Column(Uuid, ForeignKey("ai_insights.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    priority = Column(String(50), default="medium", nullable=False)  # low, medium, high, critical
    status = Column(String(50), default="pending", nullable=False)    # pending, accepted, dismissed, completed
    expected_impact = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    company = relationship("Company", back_populates="ai_recommendations")
    insight = relationship("AIInsight", back_populates="recommendations")

    def __repr__(self) -> str:
        return f"<AIRecommendation id={self.id} priority='{self.priority}' status='{self.status}'>"
