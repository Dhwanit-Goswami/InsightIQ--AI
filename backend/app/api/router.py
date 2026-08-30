from fastapi import APIRouter

api_router = APIRouter()

# Health check endpoint
@api_router.get("/health", tags=["Health"])
def health_check():
    """
    Simple health check endpoint to verify backend status.
    Does not require database connection.
    """
    return {"status": "healthy"}

# Placeholder references for future routes
# api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
# api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
# api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
# api_router.include_router(customers.router, prefix="/customers", tags=["Customers"])
# api_router.include_router(sales.router, prefix="/sales", tags=["Sales"])
# api_router.include_router(inventory.router, prefix="/inventory", tags=["Inventory"])
# api_router.include_router(expenses.router, prefix="/expenses", tags=["Expenses"])
# api_router.include_router(reports.router, prefix="/reports", tags=["Reports"])
# api_router.include_router(company.router, prefix="/company", tags=["Company"])
# api_router.include_router(ai.router, prefix="/ai", tags=["AI"])
