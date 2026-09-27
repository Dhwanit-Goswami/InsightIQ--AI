from app.schemas.common import BaseSchema, PaginatedResponse
from app.schemas.company import CompanyCreate, CompanyUpdate, CompanyResponse
from app.schemas.user import UserCreate, UserUpdate, UserResponse
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse
from app.schemas.employee import EmployeeCreate, EmployeeUpdate, EmployeeResponse
from app.schemas.customer import CustomerCreate, CustomerUpdate, CustomerResponse
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse
from app.schemas.inventory import InventoryCreate, InventoryUpdate, InventoryResponse
from app.schemas.sale import SaleCreate, SaleUpdate, SaleResponse, SaleItemCreate, SaleItemResponse
from app.schemas.expense import ExpenseCreate, ExpenseUpdate, ExpenseResponse
from app.schemas.business_metric import BusinessMetricCreate, BusinessMetricResponse
from app.schemas.report import ReportCreate, ReportResponse
from app.schemas.ai import AIInsightResponse, AIRecommendationResponse, AIRecommendationUpdate, AIInsightGenerateResponse
from app.schemas.dashboard import DashboardOverviewResponse

__all__ = [
    "BaseSchema",
    "PaginatedResponse",
    "CompanyCreate",
    "CompanyUpdate",
    "CompanyResponse",
    "UserCreate",
    "UserUpdate",
    "UserResponse",
    "LoginRequest",
    "RegisterRequest",
    "TokenResponse",
    "EmployeeCreate",
    "EmployeeUpdate",
    "EmployeeResponse",
    "CustomerCreate",
    "CustomerUpdate",
    "CustomerResponse",
    "ProductCreate",
    "ProductUpdate",
    "ProductResponse",
    "InventoryCreate",
    "InventoryUpdate",
    "InventoryResponse",
    "SaleCreate",
    "SaleUpdate",
    "SaleResponse",
    "SaleItemCreate",
    "SaleItemResponse",
    "ExpenseCreate",
    "ExpenseUpdate",
    "ExpenseResponse",
    "BusinessMetricCreate",
    "BusinessMetricResponse",
    "ReportCreate",
    "ReportResponse",
    "AIInsightResponse",
    "AIRecommendationResponse",
    "AIRecommendationUpdate",
    "AIInsightGenerateResponse",
    "DashboardOverviewResponse",
]
