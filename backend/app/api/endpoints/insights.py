import uuid
from typing import List, Optional
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, Request, status, Query
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload
from pydantic import BaseModel, Field

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.customer import Customer
from app.models.inventory import Inventory
from app.models.product import Product
from app.models.ai_insight import AIInsight
from app.models.ai_recommendation import AIRecommendation
from app.schemas.ai import AIInsightResponse, AIRecommendationResponse, AIRecommendationUpdate, AIInsightGenerateResponse
from app.services.insights import InsightService
from app.services.analytics import AnalyticsService
from app.services.forecasting import get_sales_forecast
from app.services.llm_assistant import get_llm_response
from app.core.config import settings

router = APIRouter()


class ChatHistoryMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    history: List[ChatHistoryMessage] = Field(default_factory=list)


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
    AI Assistant chat endpoint powered by Google Gemini.
    Injects live, tenant-isolated company business context into the prompt.
    Falls back to deterministic data-backed responses if GEMINI_API_KEY is not configured.
    """
    cleaned_message = (payload.message or "").strip()
    if len(cleaned_message) < 2:
        raise HTTPException(status_code=400, detail="Message must be at least 2 characters.")
    if len(cleaned_message) > 4000:
        raise HTTPException(status_code=400, detail="Message exceeds maximum length of 4000 characters.")

    company_id = current_user.company_id

    # Gather live, minimum-necessary tenant-isolated business context (90-day window)
    try:
        overview = AnalyticsService.get_dashboard_overview(db, company_id, days=90)
        kpis = overview.get("kpis", {})
        top_products_raw = overview.get("top_products", [])
        inventory = overview.get("inventory_summary", {})
        expense_raw = overview.get("expense_breakdown", [])
        trend_raw = overview.get("monthly_trend", [])

        low_stock_rows = (
            db.query(Inventory, Product)
            .join(Product, Product.id == Inventory.product_id)
            .filter(
                Inventory.company_id == company_id,
                Inventory.quantity <= Inventory.reorder_level,
            )
            .order_by(Inventory.quantity.asc())
            .limit(5)
            .all()
        )
        low_stock_products = [
            {
                "name": prod.name,
                "sku": prod.sku,
                "quantity": float(inv.quantity),
                "reorder_level": float(inv.reorder_level),
            }
            for inv, prod in low_stock_rows
        ]

        seg_rows = (
            db.query(Customer.segment, func.count(Customer.id))
            .filter(Customer.company_id == company_id, Customer.is_active == True)
            .group_by(Customer.segment)
            .all()
        )
        customer_segments = [
            {"segment": seg or "standard", "count": int(cnt)}
            for seg, cnt in seg_rows
        ]

        insight_rows = (
            db.query(AIInsight)
            .filter(AIInsight.company_id == company_id)
            .order_by(AIInsight.created_at.desc())
            .limit(5)
            .all()
        )
        recent_insights = [
            {"title": ins.title, "category": ins.category, "severity": ins.severity}
            for ins in insight_rows
        ]

        forecast_data = get_sales_forecast(db, company_id, forecast_months=3)
        forecast_points = [
            {
                "month": fp["month"],
                "forecast_formatted": AnalyticsService.format_currency_inr(Decimal(str(fp["forecast"]))),
            }
            for fp in (forecast_data.get("forecast", []) if forecast_data.get("data_available") else [])
        ]

        kpi_context = {
            "company_name": current_user.company.name if current_user.company else "Your Company",
            "revenue_formatted": kpis.get("revenue", {}).get("formatted_value", "N/A"),
            "revenue_change_pct": kpis.get("revenue", {}).get("change_pct", 0),
            "expenses_formatted": kpis.get("expenses", {}).get("formatted_value", "N/A"),
            "expenses_change_pct": kpis.get("expenses", {}).get("change_pct", 0),
            "profit_formatted": kpis.get("net_profit", {}).get("formatted_value", "N/A"),
            "profit_margin": float(kpis.get("profit_margin", {}).get("value", 0)),
            "aov_formatted": kpis.get("average_order_value", {}).get("formatted_value", "N/A"),
            "total_customers": int(kpis.get("customers", {}).get("value", 0)),
            "order_count": int(kpis.get("orders", {}).get("value", 0)),
            "low_stock_count": inventory.get("low_stock_count", 0),
            "total_skus": inventory.get("total_skus", 0),
            "inventory_valuation_formatted": inventory.get("inventory_valuation_formatted", "N/A"),
            "top_product_name": top_products_raw[0]["name"] if top_products_raw else "N/A",
            "top_products": [
                {
                    "name": p["name"],
                    "sku": p["sku"],
                    "units_sold": float(p["units_sold"]),
                    "revenue_formatted": AnalyticsService.format_currency_inr(Decimal(str(p["revenue"]))),
                }
                for p in top_products_raw[:5]
            ],
            "expense_breakdown": [
                {
                    "category": e["category"],
                    "amount_formatted": AnalyticsService.format_currency_inr(Decimal(str(e["amount"]))),
                    "percentage": e["percentage"],
                }
                for e in expense_raw[:5]
            ],
            "monthly_trend": [
                {
                    "month": t["month"],
                    "revenue_formatted": AnalyticsService.format_currency_inr(Decimal(str(t["revenue"]))),
                    "expenses_formatted": AnalyticsService.format_currency_inr(Decimal(str(t["expenses"]))),
                    "profit_formatted": AnalyticsService.format_currency_inr(Decimal(str(t["net_profit"]))),
                }
                for t in trend_raw[-6:]
            ],
            "low_stock_products": low_stock_products,
            "customer_segments": customer_segments,
            "recent_insights": recent_insights,
            "forecast_model": forecast_data.get("model", "N/A"),
            "forecast_points": forecast_points,
        }
    except Exception:
        kpi_context = {"company_name": "Your Company"}

    api_key = getattr(settings, "GEMINI_API_KEY", None) or None
    model_name = getattr(settings, "GEMINI_MODEL", "gemini-1.5-flash") or "gemini-1.5-flash"
    history_payload = [{"role": h.role, "content": h.content} for h in payload.history[-10:]]

    result = get_llm_response(
        user_message=cleaned_message,
        kpi_context=kpi_context,
        api_key=api_key,
        model_name=model_name,
        history=history_payload,
    )
    return ChatResponse(**result)
