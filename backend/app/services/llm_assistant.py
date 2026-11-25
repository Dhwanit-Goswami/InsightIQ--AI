"""
LLM AI Assistant Service — Google Gemini 1.5 Flash integration.
Injects live company KPIs as business context.
Gracefully falls back to the deterministic rule engine if unconfigured or offline.
"""
import logging
from typing import Optional

logger = logging.getLogger(__name__)


def _build_system_prompt(kpi_context: dict) -> str:
    """Build a rich system prompt with live business KPI context."""
    rev = kpi_context.get("revenue_formatted", "N/A")
    profit = kpi_context.get("profit_formatted", "N/A")
    margin = kpi_context.get("profit_margin", "N/A")
    customers = kpi_context.get("total_customers", "N/A")
    orders = kpi_context.get("order_count", "N/A")
    low_stock = kpi_context.get("low_stock_count", 0)
    top_product = kpi_context.get("top_product_name", "N/A")
    company_name = kpi_context.get("company_name", "the company")

    return f"""You are InsightIQ AI, an expert business intelligence analyst and strategic advisor for Indian SMEs.

You are currently assisting {company_name}. Here are their real-time business metrics (last 90 days):
- Revenue: {rev}
- Net Profit: {profit}
- Profit Margin: {margin}%
- Active Customers: {customers}
- Orders Completed: {orders}
- Low Stock Alerts: {low_stock} SKUs
- Top Product: {top_product}

Your role:
1. Answer the user's business question using the KPI data above where relevant.
2. Provide actionable, specific recommendations for Indian SMEs.
3. Keep responses concise, data-driven, and professional.
4. If a question is outside your business domain, politely redirect.
5. Format responses with bullet points for clarity when listing multiple points.

Always respond in English. Never fabricate specific numbers beyond what is provided above."""


def get_llm_response(user_message: str, kpi_context: dict, api_key: Optional[str] = None) -> dict:
    """
    Get AI response from Google Gemini 1.5 Flash.
    Falls back to deterministic response if API key is missing or request fails.
    """
    if not api_key:
        return _fallback_response(user_message, kpi_context)

    try:
        import google.generativeai as genai  # type: ignore

        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            system_instruction=_build_system_prompt(kpi_context),
        )

        response = model.generate_content(
            user_message,
            generation_config=genai.types.GenerationConfig(
                max_output_tokens=512,
                temperature=0.4,
            ),
            request_options={"timeout": 15},
        )

        answer = response.text.strip()
        return {
            "response": answer,
            "source": "gemini-1.5-flash",
            "powered_by_llm": True,
        }

    except ImportError:
        logger.warning("google-generativeai package not installed. Using fallback.")
        return _fallback_response(user_message, kpi_context)
    except Exception as exc:
        logger.error(f"Gemini API error: {exc}")
        return _fallback_response(user_message, kpi_context, error=str(exc))


def _fallback_response(user_message: str, kpi_context: dict, error: Optional[str] = None) -> dict:
    """Deterministic fallback response using KPI context."""
    msg = user_message.lower()
    rev = kpi_context.get("revenue_formatted", "N/A")
    profit = kpi_context.get("profit_formatted", "N/A")
    margin = kpi_context.get("profit_margin", "N/A")
    low_stock = kpi_context.get("low_stock_count", 0)
    customers = kpi_context.get("total_customers", "N/A")

    if any(w in msg for w in ["revenue", "sales", "income"]):
        answer = (
            f"📊 **Revenue Analysis**\n\n"
            f"Your current 90-day revenue stands at **{rev}** with a net profit of **{profit}**.\n\n"
            f"• Profit margin: **{margin}%** — benchmark for healthy SMEs is 15-20%.\n"
            f"• Focus on high-margin products to improve profitability.\n"
            f"• Consider upselling to your {customers} active customers."
        )
    elif any(w in msg for w in ["inventory", "stock", "product"]):
        answer = (
            f"📦 **Inventory Intelligence**\n\n"
            f"You have **{low_stock} SKUs** with low stock alerts.\n\n"
            f"• Reorder critical items to prevent lost sales.\n"
            f"• Review slow-moving products to free up working capital.\n"
            f"• Maintain safety stock of 2-4 weeks for top-selling items."
        )
    elif any(w in msg for w in ["customer", "retention", "churn"]):
        answer = (
            f"👥 **Customer Insights**\n\n"
            f"Your active customer base: **{customers}**.\n\n"
            f"• Target 20% of top customers who likely drive 80% of revenue (Pareto principle).\n"
            f"• Implement a loyalty program for repeat purchases.\n"
            f"• Follow up with customers inactive for 60+ days."
        )
    elif any(w in msg for w in ["profit", "margin", "cost"]):
        answer = (
            f"💰 **Profitability Analysis**\n\n"
            f"Net Profit: **{profit}** | Margin: **{margin}%**\n\n"
            f"• Review operating expenses monthly to identify waste.\n"
            f"• Renegotiate supplier contracts annually.\n"
            f"• Target a minimum 15% net margin for financial health."
        )
    elif any(w in msg for w in ["forecast", "predict", "future", "next month"]):
        answer = (
            "🔮 **Sales Forecast**\n\n"
            "Navigate to the **Analytics** page to view the AI-powered ML sales forecast.\n\n"
            "• Uses Holt-Winters Exponential Smoothing on your historical data.\n"
            "• Provides 6-month projection with confidence intervals.\n"
            "• Recalculates as new sales data is recorded."
        )
    else:
        answer = (
            f"🤖 **InsightIQ AI Assistant**\n\n"
            f"I can help you analyze your business performance. Here's a quick snapshot:\n\n"
            f"• **Revenue (90d):** {rev}\n"
            f"• **Net Profit:** {profit} ({margin}% margin)\n"
            f"• **Active Customers:** {customers}\n"
            f"• **Low Stock Alerts:** {low_stock} SKUs\n\n"
            f"Ask me about revenue trends, inventory optimization, customer retention, or profitability strategies!"
        )

    return {
        "response": answer,
        "source": "deterministic-fallback",
        "powered_by_llm": False,
        "fallback_reason": error or "GEMINI_API_KEY not configured",
    }
