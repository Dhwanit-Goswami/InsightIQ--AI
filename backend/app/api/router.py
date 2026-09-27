from fastapi import APIRouter

from app.api.endpoints import (
    auth,
    companies,
    users,
    employees,
    customers,
    products,
    inventory,
    sales,
    expenses,
    metrics,
    reports,
    dashboard,
    analytics,
    insights,
)

api_router = APIRouter()

# ─── Health ───────────────────────────────────────────────
@api_router.get("/health", tags=["Health"])
def health_check():
    """Simple health check endpoint to verify backend status."""
    return {"status": "healthy"}

# ─── Auth ─────────────────────────────────────────────────
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])

# ─── Company ──────────────────────────────────────────────
api_router.include_router(companies.router, prefix="/companies", tags=["Companies"])

# ─── Users ────────────────────────────────────────────────
api_router.include_router(users.router, prefix="/users", tags=["Users"])

# ─── Employees ────────────────────────────────────────────
api_router.include_router(employees.router, prefix="/employees", tags=["Employees"])

# ─── Customers ────────────────────────────────────────────
api_router.include_router(customers.router, prefix="/customers", tags=["Customers"])

# ─── Products ─────────────────────────────────────────────
api_router.include_router(products.router, prefix="/products", tags=["Products"])

# ─── Inventory ────────────────────────────────────────────
api_router.include_router(inventory.router, prefix="/inventory", tags=["Inventory"])

# ─── Sales ────────────────────────────────────────────────
api_router.include_router(sales.router, prefix="/sales", tags=["Sales"])

# ─── Expenses ─────────────────────────────────────────────
api_router.include_router(expenses.router, prefix="/expenses", tags=["Expenses"])

# ─── Business Metrics ─────────────────────────────────────
api_router.include_router(metrics.router, prefix="/metrics", tags=["Metrics"])

# ─── Reports ──────────────────────────────────────────────
api_router.include_router(reports.router, prefix="/reports", tags=["Reports"])

# ─── Dashboard ────────────────────────────────────────────
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])

# ─── Analytics ────────────────────────────────────────────
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])

# ─── AI Insights ──────────────────────────────────────────
api_router.include_router(insights.router, prefix="/insights", tags=["AI Insights"])
