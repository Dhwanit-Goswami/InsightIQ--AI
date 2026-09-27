import uuid
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, func, Uuid
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from app.core.database import Base


class Report(Base):
    __tablename__ = "reports"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    company_id = Column(Uuid, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False, index=True)
    report_type = Column(String(100), nullable=False, index=True)
    description = Column(Text, nullable=True)
    generated_by = Column(Uuid, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    parameters = Column(JSONB, nullable=True)
    status = Column(String(50), default="pending", nullable=False)  # pending, generating, completed, failed
    file_path = Column(String(500), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    company = relationship("Company", back_populates="reports")
    generator = relationship("User", back_populates="reports_generated")

    def __repr__(self) -> str:
        return f"<Report id={self.id} name='{self.name}' type='{self.report_type}' status='{self.status}'>"
