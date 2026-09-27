from decimal import Decimal
from typing import List, Optional, Dict, Any
from pydantic import BaseModel


class MetricCard(BaseModel):
    value: Decimal
    formatted_value: str
    change_pct: float
    trend: str  # up, down, neutral
    is_positive: bool


class MonthlyRevenuePoint(BaseModel):
    month: str
    revenue: Decimal
    expenses: Decimal
    net_profit: Decimal


class ExpenseCategoryBreakdown(BaseModel):
    category: str
    amount: Decimal
    percentage: float


class TopProductItem(BaseModel):
    id: str
    name: str
    sku: str
    units_sold: Decimal
    revenue: Decimal


class RecentSaleItem(BaseModel):
    id: str
    invoice_number: str
    customer_name: str
    total_amount: Decimal
    sale_date: str
    status: str
    payment_method: str


class DashboardOverviewResponse(BaseModel):
    kpis: Dict[str, MetricCard]
    monthly_trend: List[MonthlyRevenuePoint]
    expense_breakdown: List[ExpenseCategoryBreakdown]
    top_products: List[TopProductItem]
    recent_sales: List[RecentSaleItem]
    inventory_summary: Dict[str, Any]
