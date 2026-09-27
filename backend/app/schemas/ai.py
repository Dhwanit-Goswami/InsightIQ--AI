import uuid
from datetime import datetime, date
from decimal import Decimal
from typing import Optional, List
from pydantic import BaseModel
from app.schemas.common import BaseSchema


class AIRecommendationResponse(BaseSchema):
    id: uuid.UUID
    company_id: uuid.UUID
    insight_id: uuid.UUID
    title: str
    description: str
    priority: str
    status: str
    expected_impact: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class AIRecommendationUpdate(BaseModel):
    status: str  # pending, accepted, dismissed, completed


class AIInsightResponse(BaseSchema):
    id: uuid.UUID
    company_id: uuid.UUID
    title: str
    summary: str
    detailed_analysis: Optional[str] = None
    category: str
    severity: str
    confidence_score: Optional[Decimal] = None
    data_period_start: Optional[date] = None
    data_period_end: Optional[date] = None
    is_read: bool
    created_at: datetime
    updated_at: datetime
    recommendations: List[AIRecommendationResponse] = []


class AIInsightGenerateResponse(BaseModel):
    message: str
    generated_count: int
    insights: List[AIInsightResponse]
