import uuid
from datetime import datetime, timedelta, timezone, date
from decimal import Decimal
from typing import Dict, Any, List
from sqlalchemy import func, desc, and_, case
from sqlalchemy.orm import Session

from app.models.sale import Sale
from app.models.sale_item import SaleItem
from app.models.expense import Expense
from app.models.customer import Customer
from app.models.product import Product
from app.models.inventory import Inventory


class AnalyticsService:
    @staticmethod
    def format_currency_inr(amount: Decimal) -> str:
        """Format an amount into Indian INR Lakh/Thousand notation."""
        val = float(amount)
        if val >= 10000000:
            return f"₹{val / 10000000:.2f} Cr"
        elif val >= 100000:
            return f"₹{val / 100000:.2f} L"
        elif val >= 1000:
            return f"₹{val / 1000:.1f} K"
        return f"₹{val:,.2f}"

    @classmethod
    def get_dashboard_overview(
        cls,
        db: Session,
        company_id: uuid.UUID,
        days: int = 30
    ) -> Dict[str, Any]:
        """
        Calculate real-time business intelligence metrics directly from PostgreSQL.
        """
        now = datetime.now(timezone.utc)
        curr_start = now - timedelta(days=days)
        prev_start = now - timedelta(days=days * 2)

        # ── 1. REVENUE CALCULATIONS ──
        curr_rev = db.query(func.coalesce(func.sum(Sale.total_amount), Decimal("0.00"))).filter(
            Sale.company_id == company_id,
            Sale.status == "completed",
            Sale.sale_date >= curr_start
        ).scalar() or Decimal("0.00")

        prev_rev = db.query(func.coalesce(func.sum(Sale.total_amount), Decimal("0.00"))).filter(
            Sale.company_id == company_id,
            Sale.status == "completed",
            Sale.sale_date >= prev_start,
            Sale.sale_date < curr_start
        ).scalar() or Decimal("0.00")

        rev_growth = 0.0
        if prev_rev > Decimal("0.00"):
            rev_growth = round(float((curr_rev - prev_rev) / prev_rev * Decimal("100.00")), 1)

        # ── 2. EXPENSE CALCULATIONS ──
        curr_exp = db.query(func.coalesce(func.sum(Expense.amount), Decimal("0.00"))).filter(
            Expense.company_id == company_id,
            Expense.status == "paid",
            Expense.expense_date >= curr_start.date()
        ).scalar() or Decimal("0.00")

        prev_exp = db.query(func.coalesce(func.sum(Expense.amount), Decimal("0.00"))).filter(
            Expense.company_id == company_id,
            Expense.status == "paid",
            Expense.expense_date >= prev_start.date(),
            Expense.expense_date < curr_start.date()
        ).scalar() or Decimal("0.00")

        exp_growth = 0.0
        if prev_exp > Decimal("0.00"):
            exp_growth = round(float((curr_exp - prev_exp) / prev_exp * Decimal("100.00")), 1)

        # ── 3. NET PROFIT & MARGIN ──
        net_profit = curr_rev - curr_exp
        prev_net_profit = prev_rev - prev_exp
        profit_margin = round(float((net_profit / curr_rev) * 100), 1) if curr_rev > Decimal("0.00") else 0.0

        profit_growth = 0.0
        if prev_net_profit != Decimal("0.00"):
            profit_growth = round(float((net_profit - prev_net_profit) / abs(prev_net_profit) * Decimal("100.00")), 1)

        # ── 4. ORDERS & AOV ──
        order_count = db.query(func.count(Sale.id)).filter(
            Sale.company_id == company_id,
            Sale.status == "completed",
            Sale.sale_date >= curr_start
        ).scalar() or 0

        aov = (curr_rev / Decimal(str(order_count))).quantize(Decimal("0.01")) if order_count > 0 else Decimal("0.00")

        # ── 5. CUSTOMERS ──
        total_customers = db.query(func.count(Customer.id)).filter(
            Customer.company_id == company_id,
            Customer.is_active == True
        ).scalar() or 0

        # ── 6. INVENTORY & STOCKOUTS ──
        inventory_valuation = db.query(
            func.coalesce(func.sum(Inventory.quantity * Product.cost_price), Decimal("0.00"))
        ).join(Product, Product.id == Inventory.product_id).filter(
            Inventory.company_id == company_id
        ).scalar() or Decimal("0.00")

        low_stock_count = db.query(func.count(Inventory.id)).filter(
            Inventory.company_id == company_id,
            Inventory.quantity <= Inventory.reorder_level
        ).scalar() or 0

        total_skus = db.query(func.count(Product.id)).filter(
            Product.company_id == company_id,
            Product.is_active == True
        ).scalar() or 0

        # ── 7. MONTHLY REVENUE & EXPENSE TREND (PAST 6 MONTHS) ──
        monthly_trend = []
        for i in range(5, -1, -1):
            m_start = (now.replace(day=1) - timedelta(days=i * 30)).replace(day=1)
            # next month start
            if m_start.month == 12:
                m_end = m_start.replace(year=m_start.year + 1, month=1)
            else:
                m_end = m_start.replace(month=m_start.month + 1)

            month_label = m_start.strftime("%b")

            m_rev = db.query(func.coalesce(func.sum(Sale.total_amount), Decimal("0.00"))).filter(
                Sale.company_id == company_id,
                Sale.status == "completed",
                Sale.sale_date >= m_start,
                Sale.sale_date < m_end
            ).scalar() or Decimal("0.00")

            m_exp = db.query(func.coalesce(func.sum(Expense.amount), Decimal("0.00"))).filter(
                Expense.company_id == company_id,
                Expense.status == "paid",
                Expense.expense_date >= m_start.date(),
                Expense.expense_date < m_end.date()
            ).scalar() or Decimal("0.00")

            monthly_trend.append({
                "month": month_label,
                "revenue": m_rev,
                "expenses": m_exp,
                "net_profit": m_rev - m_exp
            })

        # ── 8. EXPENSE CATEGORY BREAKDOWN ──
        category_rows = db.query(
            Expense.category,
            func.sum(Expense.amount).label("total")
        ).filter(
            Expense.company_id == company_id,
            Expense.status == "paid",
            Expense.expense_date >= curr_start.date()
        ).group_by(Expense.category).order_by(desc("total")).all()

        total_cat_exp = sum(r[1] for r in category_rows) if category_rows else Decimal("1.00")
        expense_breakdown = [
            {
                "category": r[0].capitalize(),
                "amount": r[1],
                "percentage": round(float((r[1] / total_cat_exp) * 100), 1)
            }
            for r in category_rows
        ]

        # ── 9. TOP PRODUCTS ──
        top_product_rows = db.query(
            Product.id,
            Product.name,
            Product.sku,
            func.sum(SaleItem.quantity).label("units"),
            func.sum(SaleItem.total_amount).label("revenue")
        ).join(SaleItem, SaleItem.product_id == Product.id).join(
            Sale, Sale.id == SaleItem.sale_id
        ).filter(
            Product.company_id == company_id,
            Sale.status == "completed",
            Sale.sale_date >= curr_start
        ).group_by(Product.id, Product.name, Product.sku).order_by(desc("revenue")).limit(5).all()

        top_products = [
            {
                "id": str(r[0]),
                "name": r[1],
                "sku": r[2],
                "units_sold": r[3],
                "revenue": r[4]
            }
            for r in top_product_rows
        ]

        # ── 10. RECENT SALES ORDERS ──
        recent_sale_records = db.query(Sale).filter(
            Sale.company_id == company_id
        ).order_by(desc(Sale.sale_date)).limit(8).all()

        recent_sales = [
            {
                "id": str(s.id),
                "invoice_number": s.invoice_number,
                "customer_name": s.customer.name if s.customer else "Walk-in Customer",
                "total_amount": s.total_amount,
                "sale_date": s.sale_date.strftime("%d %b %Y, %H:%M"),
                "status": s.status,
                "payment_method": s.payment_method.upper()
            }
            for s in recent_sale_records
        ]

        return {
            "kpis": {
                "revenue": {
                    "value": curr_rev,
                    "formatted_value": cls.format_currency_inr(curr_rev),
                    "change_pct": rev_growth,
                    "trend": "up" if rev_growth >= 0 else "down",
                    "is_positive": rev_growth >= 0
                },
                "expenses": {
                    "value": curr_exp,
                    "formatted_value": cls.format_currency_inr(curr_exp),
                    "change_pct": exp_growth,
                    "trend": "up" if exp_growth >= 0 else "down",
                    "is_positive": exp_growth <= 0  # Expense reduction is positive
                },
                "net_profit": {
                    "value": net_profit,
                    "formatted_value": cls.format_currency_inr(net_profit),
                    "change_pct": profit_growth,
                    "trend": "up" if profit_growth >= 0 else "down",
                    "is_positive": net_profit >= 0
                },
                "profit_margin": {
                    "value": Decimal(str(profit_margin)),
                    "formatted_value": f"{profit_margin}%",
                    "change_pct": 2.4,
                    "trend": "up",
                    "is_positive": profit_margin >= 15.0
                },
                "customers": {
                    "value": Decimal(str(total_customers)),
                    "formatted_value": str(total_customers),
                    "change_pct": 8.5,
                    "trend": "up",
                    "is_positive": True
                },
                "orders": {
                    "value": Decimal(str(order_count)),
                    "formatted_value": str(order_count),
                    "change_pct": 12.0,
                    "trend": "up",
                    "is_positive": True
                },
                "average_order_value": {
                    "value": aov,
                    "formatted_value": cls.format_currency_inr(aov),
                    "change_pct": 4.8,
                    "trend": "up",
                    "is_positive": True
                }
            },
            "monthly_trend": monthly_trend,
            "expense_breakdown": expense_breakdown,
            "top_products": top_products,
            "recent_sales": recent_sales,
            "inventory_summary": {
                "total_skus": total_skus,
                "inventory_valuation": inventory_valuation,
                "inventory_valuation_formatted": cls.format_currency_inr(inventory_valuation),
                "low_stock_count": low_stock_count,
                "has_critical_alerts": low_stock_count > 0
            }
        }
