import uuid
from typing import List, Optional
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, Request, status, Query
from sqlalchemy.orm import Session, joinedload
from pydantic import BaseModel

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.ai_insight import AIInsight
from app.models.ai_recommendation import AIRecommendation
from app.schemas.ai import AIInsightResponse, AIRecommendationResponse, AIRecommendationUpdate, AIInsightGenerateResponse
from app.services.insights import InsightService
from app.services.analytics import AnalyticsService
from app.services.llm_assistant import get_llm_response
from app.core.config import settings

router = APIRouter()


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    response: str
    source: str
    powered_by_llm: bool
    fallback_reason: Optional[str] = None


@router.get("", response_model=List[AIInsightResponse])
def list_insights(
    category: Optional[str] = None,
    severity: Optional[str] = None,
    is_read: Optional[bool] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List AI-generated business insights with recommendations."""
    query = (
        db.query(AIInsight)
        .options(joinedload(AIInsight.recommendations))
        .filter(AIInsight.company_id == current_user.company_id)
    )
    if category:
        query = query.filter(AIInsight.category == category)
    if severity:
        query = query.filter(AIInsight.severity == severity)
    if is_read is not None:
        query = query.filter(AIInsight.is_read == is_read)

    insights = query.order_by(AIInsight.created_at.desc()).all()
    return [AIInsightResponse.model_validate(i) for i in insights]


@router.post("/generate", response_model=AIInsightGenerateResponse)
def generate_insights(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Trigger the deterministic data-driven insight engine.
    Analyzes real PostgreSQL transactional data to generate actionable intelligence.
    """
    generated = InsightService.generate_company_insights(
        db=db,
        company_id=current_user.company_id
    )

    # Re-fetch with recommendations loaded
    if generated:
        ids = [i.id for i in generated]
        fresh = (
            db.query(AIInsight)
            .options(joinedload(AIInsight.recommendations))
            .filter(AIInsight.id.in_(ids))
            .all()
        )
    else:
        fresh = []

    return AIInsightGenerateResponse(
        message=f"Generated {len(fresh)} new insights from your business data." if fresh else "No new insights — existing insights are still current within the past 7 days.",
        generated_count=len(fresh),
        insights=[AIInsightResponse.model_validate(i) for i in fresh]
    )


@router.get("/{insight_id}", response_model=AIInsightResponse)
def get_insight(
    insight_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve a specific AI insight with its recommendations."""
    insight = (
        db.query(AIInsight)
        .options(joinedload(AIInsight.recommendations))
        .filter(
            AIInsight.id == insight_id,
            AIInsight.company_id == current_user.company_id
        )
        .first()
    )
    if not insight:
        raise HTTPException(status_code=404, detail="Insight not found.")
    return AIInsightResponse.model_validate(insight)


@router.patch("/{insight_id}/read", response_model=AIInsightResponse)
def mark_insight_read(
    insight_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark an insight as read."""
    insight = (
        db.query(AIInsight)
        .options(joinedload(AIInsight.recommendations))
        .filter(
            AIInsight.id == insight_id,
            AIInsight.company_id == current_user.company_id
        )
        .first()
    )
    if not insight:
        raise HTTPException(status_code=404, detail="Insight not found.")
    insight.is_read = True
    db.commit()
    db.refresh(insight)
    return AIInsightResponse.model_validate(insight)


@router.get("/recommendations/all", response_model=List[AIRecommendationResponse])
def list_recommendations(
    priority: Optional[str] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List AI-generated recommendations for the company."""
    query = db.query(AIRecommendation).filter(
        AIRecommendation.company_id == current_user.company_id
    )
    if priority:
        query = query.filter(AIRecommendation.priority == priority)
    if status_filter:
        query = query.filter(AIRecommendation.status == status_filter)

    recs = query.order_by(AIRecommendation.created_at.desc()).all()
    return [AIRecommendationResponse.model_validate(r) for r in recs]


@router.put("/recommendations/{rec_id}", response_model=AIRecommendationResponse)
def update_recommendation(
    rec_id: uuid.UUID,
    payload: AIRecommendationUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update recommendation status (accept, dismiss, complete)."""
    rec = db.query(AIRecommendation).filter(
        AIRecommendation.id == rec_id,
        AIRecommendation.company_id == current_user.company_id
    ).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found.")

    allowed_statuses = ["pending", "accepted", "dismissed", "completed"]
    if payload.status not in allowed_statuses:
        raise HTTPException(status_code=400, detail=f"Status must be one of: {allowed_statuses}")

    rec.status = payload.status
    db.commit()
    db.refresh(rec)
    return AIRecommendationResponse.model_validate(rec)


@router.post("/chat", response_model=ChatResponse)
def ai_chat(
    payload: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    AI Assistant chat endpoint powered by Google Gemini 1.5 Flash.
    Injects live company KPI context into the prompt.
    Falls back to deterministic responses if GEMINI_API_KEY is not configured.
    """
    if not payload.message or len(payload.message.strip()) < 2:
        raise HTTPException(status_code=400, detail="Message is too short.")

    # Gather live KPI context (90-day window)
    try:
        overview = AnalyticsService.get_dashboard_overview(db, current_user.company_id, days=90)
        kpis = overview.get("kpis", {})
        top_products = overview.get("top_products", [])
        inventory = overview.get("inventory_summary", {})

        kpi_context = {
            "company_name": current_user.company.name if current_user.company else "Your Company",
            "revenue_formatted": kpis.get("revenue", {}).get("formatted_value", "N/A"),
            "profit_formatted": kpis.get("net_profit", {}).get("formatted_value", "N/A"),
            "profit_margin": kpis.get("profit_margin", {}).get("value", 0),
            "total_customers": int(kpis.get("customers", {}).get("value", 0)),
            "order_count": int(kpis.get("orders", {}).get("value", 0)),
            "low_stock_count": inventory.get("low_stock_count", 0),
            "top_product_name": top_products[0]["name"] if top_products else "N/A",
        }
    except Exception:
        kpi_context = {"company_name": "Your Company"}

    api_key = getattr(settings, "GEMINI_API_KEY", None) or None

    result = get_llm_response(
        user_message=payload.message.strip(),
        kpi_context=kpi_context,
        api_key=api_key,
    )
    return ChatResponse(**result)
