import uuid
from datetime import datetime
from typing import Optional, Any, Dict
from pydantic import BaseModel
from app.schemas.common import BaseSchema


class ReportBase(BaseModel):
    name: str
    report_type: str
    description: Optional[str] = None
    parameters: Optional[Dict[str, Any]] = None


class ReportCreate(ReportBase):
    pass


class ReportResponse(ReportBase, BaseSchema):
    id: uuid.UUID
    company_id: uuid.UUID
    status: str
    file_path: Optional[str] = None
    generated_by: Optional[uuid.UUID] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
