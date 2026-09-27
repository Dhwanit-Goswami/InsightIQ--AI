import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel
from app.schemas.common import BaseSchema
from app.schemas.product import ProductResponse


class InventoryBase(BaseModel):
    product_id: uuid.UUID
    quantity: Decimal = Decimal("0.00")
    reorder_level: Decimal = Decimal("10.00")
    warehouse_location: Optional[str] = None


class InventoryCreate(InventoryBase):
    pass


class InventoryUpdate(BaseModel):
    quantity: Optional[Decimal] = None
    reorder_level: Optional[Decimal] = None
    warehouse_location: Optional[str] = None


class InventoryResponse(InventoryBase, BaseSchema):
    id: uuid.UUID
    company_id: uuid.UUID
    last_restocked_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    product: Optional[ProductResponse] = None
