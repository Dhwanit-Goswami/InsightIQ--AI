import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional, List
from pydantic import BaseModel
from app.schemas.common import BaseSchema
from app.schemas.customer import CustomerResponse
from app.schemas.product import ProductResponse


class SaleItemCreate(BaseModel):
    product_id: uuid.UUID
    quantity: Decimal
    unit_price: Decimal
    discount: Decimal = Decimal("0.00")
    tax: Decimal = Decimal("0.00")


class SaleItemResponse(BaseSchema):
    id: uuid.UUID
    sale_id: uuid.UUID
    product_id: uuid.UUID
    quantity: Decimal
    unit_price: Decimal
    discount: Decimal
    tax: Decimal
    total_amount: Decimal
    product: Optional[ProductResponse] = None


class SaleCreate(BaseModel):
    customer_id: Optional[uuid.UUID] = None
    invoice_number: str
    sale_date: Optional[datetime] = None
    payment_method: str = "upi"
    status: str = "completed"
    notes: Optional[str] = None
    items: List[SaleItemCreate]


class SaleUpdate(BaseModel):
    customer_id: Optional[uuid.UUID] = None
    status: Optional[str] = None
    notes: Optional[str] = None


class SaleResponse(BaseSchema):
    id: uuid.UUID
    company_id: uuid.UUID
    customer_id: Optional[uuid.UUID] = None
    invoice_number: str
    sale_date: datetime
    subtotal: Decimal
    tax_amount: Decimal
    discount_amount: Decimal
    total_amount: Decimal
    payment_method: str
    status: str
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    customer: Optional[CustomerResponse] = None
    items: List[SaleItemResponse] = []
