import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel
from app.schemas.common import BaseSchema


class ProductBase(BaseModel):
    sku: str
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    unit: str = "pcs"
    cost_price: Decimal = Decimal("0.00")
    selling_price: Decimal = Decimal("0.00")
    tax_rate: Decimal = Decimal("18.00")
    supplier: Optional[str] = None
    is_active: bool = True


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    unit: Optional[str] = None
    cost_price: Optional[Decimal] = None
    selling_price: Optional[Decimal] = None
    tax_rate: Optional[Decimal] = None
    supplier: Optional[str] = None
    is_active: Optional[bool] = None


class ProductResponse(ProductBase, BaseSchema):
    id: uuid.UUID
    company_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
