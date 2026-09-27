import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.models.user import User
from app.models.inventory import Inventory
from app.models.product import Product
from app.schemas.inventory import InventoryResponse, InventoryUpdate

router = APIRouter()


@router.get("", response_model=List[InventoryResponse])
def list_inventory(
    low_stock_only: bool = Query(False, description="Filter for items where quantity <= reorder_level"),
    search: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List inventory items joined with product information."""
    query = (
        db.query(Inventory)
        .options(joinedload(Inventory.product))
        .filter(Inventory.company_id == current_user.company_id)
    )

    if low_stock_only:
        query = query.filter(Inventory.quantity <= Inventory.reorder_level)

    if search:
        query = query.join(Product).filter(
            (Product.name.ilike(f"%{search}%")) |
            (Product.sku.ilike(f"%{search}%")) |
            (Inventory.warehouse_location.ilike(f"%{search}%"))
        )

    records = query.all()
    return [InventoryResponse.model_validate(r) for r in records]


@router.get("/low-stock", response_model=List[InventoryResponse])
def get_low_stock_alerts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve all inventory items that have reached or dropped below reorder level."""
    records = (
        db.query(Inventory)
        .options(joinedload(Inventory.product))
        .filter(
            Inventory.company_id == current_user.company_id,
            Inventory.quantity <= Inventory.reorder_level
        )
        .all()
    )
    return [InventoryResponse.model_validate(r) for r in records]


@router.put("/{inventory_id}", response_model=InventoryResponse)
def update_stock(
    inventory_id: uuid.UUID,
    payload: InventoryUpdate,
    current_user: User = Depends(require_role(["owner", "admin", "manager"])),
    db: Session = Depends(get_db)
):
    """Update stock quantity or reorder thresholds."""
    inv = (
        db.query(Inventory)
        .options(joinedload(Inventory.product))
        .filter(
            Inventory.id == inventory_id,
            Inventory.company_id == current_user.company_id
        )
        .first()
    )
    if not inv:
        raise HTTPException(status_code=404, detail="Inventory record not found.")

    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(inv, k, v)

    inv.last_restocked_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(inv)
    return InventoryResponse.model_validate(inv)
