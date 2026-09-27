"""
SQLAlchemy models package initialization for InsightIQ.
Imports all models so they are registered with Base.metadata for Alembic discovery.
"""

from app.models.company import Company
from app.models.employee import Employee
from app.models.user import User
from app.models.customer import Customer
from app.models.product import Product
from app.models.inventory import Inventory
from app.models.sale import Sale
from app.models.sale_item import SaleItem
from app.models.expense import Expense
from app.models.business_metric import BusinessMetric
from app.models.report import Report
from app.models.ai_insight import AIInsight
from app.models.ai_recommendation import AIRecommendation

__all__ = [
    "Company",
    "Employee",
    "User",
    "Customer",
    "Product",
    "Inventory",
    "Sale",
    "SaleItem",
    "Expense",
    "BusinessMetric",
    "Report",
    "AIInsight",
    "AIRecommendation",
]
