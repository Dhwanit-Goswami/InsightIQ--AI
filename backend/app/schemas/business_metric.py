import uuid
from datetime import datetime, date
from decimal import Decimal
from typing import Optional, Any, Dict
from pydantic import BaseModel
from app.schemas.common import BaseSchema


class BusinessMetricBase(BaseModel):
    metric_name: str
    metric_value: Decimal
    metric_date: date
    category: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class BusinessMetricCreate(BusinessMetricBase):
    pass


class BusinessMetricResponse(BaseSchema):
    id: uuid.UUID
    company_id: uuid.UUID
    metric_name: str
    metric_value: Decimal
    metric_date: date
    category: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime
