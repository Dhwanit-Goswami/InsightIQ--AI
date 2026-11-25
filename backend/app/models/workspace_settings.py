"""WorkspaceSettings model — persists user/workspace notification and theme preferences."""
import uuid
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, func, Uuid
from sqlalchemy.orm import relationship

from app.core.database import Base


class WorkspaceSettings(Base):
    __tablename__ = "workspace_settings"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id = Column(Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    company_id = Column(Uuid, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)

    # Notification toggles
    weekly_digest = Column(Boolean, default=True, nullable=False)
    ai_insights_alerts = Column(Boolean, default=True, nullable=False)
    revenue_alerts = Column(Boolean, default=True, nullable=False)
    push_alerts = Column(Boolean, default=False, nullable=False)

    # Appearance
    theme = Column(String(10), default="dark", nullable=False)  # 'dark' | 'light'

    # Regional / language (placeholder for future use)
    language = Column(String(10), default="en", nullable=False)
    timezone = Column(String(50), default="Asia/Kolkata", nullable=False)
    currency = Column(String(5), default="INR", nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    user = relationship("User", back_populates="workspace_settings")

    def __repr__(self) -> str:
        return f"<WorkspaceSettings user_id={self.user_id}>"
