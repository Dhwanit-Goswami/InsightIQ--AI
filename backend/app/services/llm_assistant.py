"""
LLM AI Assistant Service — Google Gemini integration.
Injects live company KPIs, expenses, inventory, customer segments, trends, insights, and forecasts.
Gracefully falls back to the deterministic rule engine if unconfigured or offline.
"""
import logging
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)


def _format_list(items: List[str], empty_msg: str = "None recorded") -> str:
    return "\n".join(items) if items else empty_msg


def _build_system_prompt(kpi_context: Dict[str, Any]) -> str:
    """Build a rich, minimum-necessary system prompt with live business context."""
    company_name = kpi_context.get("company_name", "the company")
    rev = kpi_context.get("revenue_formatted", "N/A")
    rev_chg = kpi_context.get("revenue_change_pct", 0)
    exp = kpi_context.get("expenses_formatted", "N/A")
    exp_chg = kpi_context.get("expenses_change_pct", 0)
    profit = kpi_context.get("profit_formatted", "N/A")
    margin = kpi_context.get("profit_margin", "N/A")
    aov = kpi_context.get("aov_formatted", "N/A")
    customers = kpi_context.get("total_customers", "N/A")
    orders = kpi_context.get("order_count", "N/A")
    low_stock = kpi_context.get("low_stock_count", 0)
    total_skus = kpi_context.get("total_skus", 0)
    inv_val = kpi_context.get("inventory_valuation_formatted", "N/A")

    exp_lines = [
        f"  - {e['category']}: {e['amount_formatted']} ({e['percentage']}%)"
        for e in kpi_context.get("expense_breakdown", [])
    ]
    top_prod_lines = [
        f"  - {p['name']} ({p['sku']}): {p['units_sold']} units, {p['revenue_formatted']}"
        for p in kpi_context.get("top_products", [])
    ]
    low_stock_lines = [
        f"  - {p['name']} ({p['sku']}): {p['quantity']} on hand (reorder level {p['reorder_level']})"
        for p in kpi_context.get("low_stock_products", [])
    ]
    seg_lines = [
        f"  - {s['segment']}: {s['count']} customers"
        for s in kpi_context.get("customer_segments", [])
    ]
    trend_lines = [
        f"  - {t['month']}: Rev {t['revenue_formatted']}, Exp {t['expenses_formatted']}, Profit {t['profit_formatted']}"
        for t in kpi_context.get("monthly_trend", [])
    ]
    insight_lines = [
        f"  - [{i['severity'].upper()}] {i['title']}"
        for i in kpi_context.get("recent_insights", [])
    ]
    forecast_lines = [
        f"  - {f['month']}: {f['forecast_formatted']}"
        for f in kpi_context.get("forecast_points", [])
    ]

    return f"""You are InsightIQ AI, an expert business intelligence analyst and strategic advisor for SMEs.

You are currently assisting {company_name}. Here are their verified real-time business metrics (last 90 days):
- Revenue: {rev} ({rev_chg:+.1f}% vs prior period)
- Expenses: {exp} ({exp_chg:+.1f}% vs prior period)
- Net Profit: {profit} (Margin: {margin}%)
- Orders Completed: {orders} | Average Order Value: {aov}
- Active Customers: {customers}
- Inventory: {total_skus} active SKUs, valuation {inv_val}, {low_stock} low-stock alerts

Expense Breakdown (90d):
{_format_list(exp_lines)}

Top Performing Products (90d):
{_format_list(top_prod_lines)}

Low-Stock Alert Items:
{_format_list(low_stock_lines)}

Customer Segments:
{_format_list(seg_lines)}

6-Month Trend:
{_format_list(trend_lines)}

Recent AI Insights:
{_format_list(insight_lines)}

ML Sales Forecast ({kpi_context.get('forecast_model', 'N/A')}):
{_format_list(forecast_lines, "Insufficient historical data for forecast")}

Rules:
1. Answer the exact question asked using the verified metrics above.
2. Clearly distinguish observed facts/numbers from strategic recommendations.
3. NEVER invent revenue figures, product names, forecasts, or records not present above.
4. If required data is unavailable or empty, state that clearly.
5. Use conversation history to handle follow-up questions coherently.
6. Keep responses concise, structured, and actionable."""


def _format_gemini_history(history: Optional[List[Dict[str, str]]]) -> List[Dict[str, Any]]:
    """Convert chat history into Gemini's expected role/parts structure."""
    if not history:
        return []
    formatted: List[Dict[str, Any]] = []
    for item in history[-10:]:
        role = (item.get("role") or "").strip().lower()
        content = (item.get("content") or "").strip()
        if not content:
            continue
        gemini_role = "model" if role in ("assistant", "model") else "user"
        formatted.append({"role": gemini_role, "parts": [content]})
    return formatted


def get_llm_response(
    user_message: str,
    kpi_context: Dict[str, Any],
    api_key: Optional[str] = None,
    model_name: str = "gemini-1.5-flash",
    history: Optional[List[Dict[str, str]]] = None,
) -> Dict[str, Any]:
    """
    Get AI response from Google Gemini.
    Falls back to deterministic data-backed response if API key is missing or request fails.
    """
    if not api_key or not api_key.strip():
        return _fallback_response(
            user_message,
            kpi_context,
            error="GEMINI_API_KEY is not configured in backend environment.",
        )

    effective_model = (model_name or "gemini-1.5-flash").strip()

    try:
        import google.generativeai as genai  # type: ignore

        genai.configure(api_key=api_key.strip())
        model = genai.GenerativeModel(
            model_name=effective_model,
            system_instruction=_build_system_prompt(kpi_context),
        )

        gemini_history = _format_gemini_history(history)
        gen_config = genai.types.GenerationConfig(
            max_output_tokens=600,
            temperature=0.3,
        )

        if gemini_history:
            chat = model.start_chat(history=gemini_history)
            response = chat.send_message(
                user_message,
                generation_config=gen_config,
                request_options={"timeout": 15},
            )
        else:
            response = model.generate_content(
                user_message,
                generation_config=gen_config,
                request_options={"timeout": 15},
            )

        answer = (getattr(response, "text", None) or "").strip()
        if not answer:
            raise ValueError("LLM returned an empty response.")

        return {
            "response": answer,
            "source": effective_model,
            "powered_by_llm": True,
            "fallback_reason": None,
        }

    except ImportError:
        logger.warning("google-generativeai package not installed. Using fallback.")
        return _fallback_response(user_message, kpi_context, error="LLM client library is not installed.")
    except TimeoutError:
        logger.error("Gemini API request timed out.")
        return _fallback_response(user_message, kpi_context, error="AI provider request timed out.")
    except Exception as exc:
        err_name = type(exc).__name__
        logger.error("Gemini API error (%s)", err_name)
        return _fallback_response(user_message, kpi_context, error=f"AI provider unavailable ({err_name}).")


def _fallback_response(
    user_message: str,
    kpi_context: Dict[str, Any],
    error: Optional[str] = None,
) -> Dict[str, Any]:
    """Deterministic data-backed fallback response using real company KPI context."""
    msg = user_message.lower()
    rev = kpi_context.get("revenue_formatted", "N/A")
    rev_chg = kpi_context.get("revenue_change_pct", 0)
    exp = kpi_context.get("expenses_formatted", "N/A")
    exp_chg = kpi_context.get("expenses_change_pct", 0)
    profit = kpi_context.get("profit_formatted", "N/A")
    margin = kpi_context.get("profit_margin", "N/A")
    aov = kpi_context.get("aov_formatted", "N/A")
    low_stock = kpi_context.get("low_stock_count", 0)
    customers = kpi_context.get("total_customers", "N/A")
    orders = kpi_context.get("order_count", "N/A")
    top_products = kpi_context.get("top_products", [])
    low_stock_products = kpi_context.get("low_stock_products", [])
    expense_breakdown = kpi_context.get("expense_breakdown", [])
    recent_insights = kpi_context.get("recent_insights", [])
    forecast_points = kpi_context.get("forecast_points", [])

    if any(w in msg for w in ["expense", "cost", "spend", "spending", "category", "categories"]):
        top_exp = (
            "\n".join(f"• {e['category']}: {e['amount_formatted']} ({e['percentage']}%)" for e in expense_breakdown[:5])
            if expense_breakdown
            else "• No paid expense records found in the last 90 days."
        )
        answer = (
            f"**Expense Breakdown (Last 90 Days)**\n\n"
            f"Total paid expenses are **{exp}** ({exp_chg:+.1f}% vs prior period).\n\n"
            f"**Top Expense Categories:**\n{top_exp}\n\n"
            f"**Recommendation:** Audit the largest category above for recurring vendor rate optimization."
        )
    elif any(w in msg for w in ["inventory", "stock", "product", "sku", "underperforming", "reorder"]):
        low_list = (
            "\n".join(
                f"• {p['name']} ({p['sku']}): {p['quantity']} on hand (reorder at {p['reorder_level']})"
                for p in low_stock_products[:5]
            )
            if low_stock_products
            else "• No SKUs are currently below their reorder threshold."
        )
        top_list = (
            "\n".join(f"• {p['name']}: {p['units_sold']} units ({p['revenue_formatted']})" for p in top_products[:3])
            if top_products
            else "• No product sales recorded in the last 90 days."
        )
        answer = (
            f"**Inventory & Product Performance**\n\n"
            f"You have **{low_stock} low-stock SKU alerts**.\n\n"
            f"**Low-Stock Items:**\n{low_list}\n\n"
            f"**Top Performers (90d):**\n{top_list}"
        )
    elif any(w in msg for w in ["revenue", "sales", "income", "trend", "aov", "order"]):
        top_name = top_products[0]["name"] if top_products else "N/A"
        answer = (
            f"**Revenue & Sales Analysis (Last 90 Days)**\n\n"
            f"• **Revenue:** {rev} ({rev_chg:+.1f}% vs prior period)\n"
            f"• **Completed Orders:** {orders} | **Average Order Value:** {aov}\n"
            f"• **Net Profit:** {profit} ({margin}% margin)\n"
            f"• **Top Product:** {top_name}\n\n"
            f"**Recommendation:** Focus inventory and promotions on top-margin SKUs to sustain revenue momentum."
        )
    elif any(w in msg for w in ["customer", "retention", "churn", "segment"]):
        segs = kpi_context.get("customer_segments", [])
        seg_text = (
            "\n".join(f"• {s['segment'].capitalize()}: {s['count']} customers" for s in segs)
            if segs
            else "• No customer segment breakdown available."
        )
        answer = (
            f"**Customer Intelligence**\n\n"
            f"Active customer base: **{customers}**.\n\n"
            f"**Segment Breakdown:**\n{seg_text}\n\n"
            f"**Recommendation:** Prioritize retention outreach for high-value segments and re-engage inactive accounts."
        )
    elif any(w in msg for w in ["forecast", "predict", "future", "next month"]):
        if forecast_points:
            f_lines = "\n".join(f"• {f['month']}: {f['forecast_formatted']}" for f in forecast_points[:3])
            answer = (
                f"**ML Sales Forecast ({kpi_context.get('forecast_model', 'Holt-Winters')})**\n\n"
                f"{f_lines}\n\n"
                f"View full confidence intervals and RMSE/MAE metrics on the **Analytics** page."
            )
        else:
            answer = (
                "**Sales Forecast**\n\n"
                "Insufficient historical sales data is currently available to generate an ML forecast (at least 2 months of completed sales are required)."
            )
    elif any(w in msg for w in ["risk", "alert", "insight", "focus", "profit", "margin"]):
        ins_text = (
            "\n".join(f"• [{i['severity'].upper()}] {i['title']}" for i in recent_insights[:4])
            if recent_insights
            else "• No recent AI insight alerts recorded."
        )
        answer = (
            f"**Business Health & Key Risks (Last 90 Days)**\n\n"
            f"• **Net Profit:** {profit} ({margin}% margin)\n"
            f"• **Low-Stock Alerts:** {low_stock} SKUs\n\n"
            f"**Recent Insights:**\n{ins_text}"
        )
    else:
        answer = (
            f"**InsightIQ Business Snapshot (Last 90 Days)**\n\n"
            f"• **Revenue:** {rev} ({rev_chg:+.1f}%)\n"
            f"• **Expenses:** {exp} ({exp_chg:+.1f}%)\n"
            f"• **Net Profit:** {profit} ({margin}% margin)\n"
            f"• **Active Customers:** {customers} | **Orders:** {orders}\n"
            f"• **Low-Stock Alerts:** {low_stock} SKUs\n\n"
            f"Ask about revenue trends, expense categories, low-stock products, customer segments, or sales forecasts."
        )

    return {
        "response": answer,
        "source": "deterministic-fallback",
        "powered_by_llm": False,
        "fallback_reason": error or "GEMINI_API_KEY not configured",
    }
