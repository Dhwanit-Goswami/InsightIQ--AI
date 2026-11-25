"""UserSession model — tracks active JWT sessions for server-side revocation."""
import uuid
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, func, Uuid, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class UserSession(Base):
    __tablename__ = "user_sessions"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id = Column(Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    company_id = Column(Uuid, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)

    # Unique JWT identifier (jti claim) stored to enable per-token revocation
    jti = Column(String(64), nullable=False, unique=True, index=True)

    # Device fingerprint
    device_name = Column(String(200), nullable=True)
    ip_address = Column(String(45), nullable=True)   # IPv4 or IPv6
    user_agent = Column(Text, nullable=True)

    is_revoked = Column(Boolean, default=False, nullable=False, index=True)
    revoked_at = Column(DateTime(timezone=True), nullable=True)

    expires_at = Column(DateTime(timezone=True), nullable=False)
    last_active = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user = relationship("User", back_populates="sessions")

    def __repr__(self) -> str:
        return f"<UserSession jti={self.jti} revoked={self.is_revoked}>"
