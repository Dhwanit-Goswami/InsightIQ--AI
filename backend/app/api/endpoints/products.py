import uuid
from decimal import Decimal
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.models.user import User
from app.models.product import Product
from app.models.inventory import Inventory
from app.schemas.product import ProductResponse, ProductCreate, ProductUpdate

router = APIRouter()


@router.get("", response_model=List[ProductResponse])
def list_products(
    category: Optional[str] = None,
    search: Optional[str] = None,
    is_active: Optional[bool] = None,
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List products scoped to the user's company."""
    query = db.query(Product).filter(Product.company_id == current_user.company_id)
    if category and category != "All":
        query = query.filter(Product.category == category)
    if is_active is not None:
        query = query.filter(Product.is_active == is_active)
    if search:
        query = query.filter(
            (Product.name.ilike(f"%{search}%")) |
            (Product.sku.ilike(f"%{search}%")) |
            (Product.category.ilike(f"%{search}%"))
        )
    products = query.order_by(Product.name).offset(offset).limit(limit).all()
    return [ProductResponse.model_validate(p) for p in products]


@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    payload: ProductCreate,
    initial_stock: Decimal = Query(Decimal("0.00"), description="Initial inventory quantity"),
    reorder_level: Decimal = Query(Decimal("10.00"), description="Inventory reorder threshold"),
    current_user: User = Depends(require_role(["owner", "admin", "manager"])),
    db: Session = Depends(get_db)
):
    """Create a new product and initialize its inventory record."""
    existing_sku = db.query(Product).filter(
        Product.company_id == current_user.company_id,
        Product.sku == payload.sku
    ).first()
    if existing_sku:
        raise HTTPException(status_code=400, detail=f"Product with SKU '{payload.sku}' already exists.")

    product = Product(
        company_id=current_user.company_id,
        **payload.model_dump()
    )
    db.add(product)
    db.flush()

    inventory = Inventory(
        company_id=current_user.company_id,
        product_id=product.id,
        quantity=initial_stock,
        reorder_level=reorder_level,
        warehouse_location="Main Hub"
    )
    db.add(inventory)
    db.commit()
    db.refresh(product)
    return ProductResponse.model_validate(product)


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(
    product_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve product details."""
    product = db.query(Product).filter(
        Product.id == product_id,
        Product.company_id == current_user.company_id
    ).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found.")
    return ProductResponse.model_validate(product)


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: uuid.UUID,
    payload: ProductUpdate,
    current_user: User = Depends(require_role(["owner", "admin", "manager"])),
    db: Session = Depends(get_db)
):
    """Update product information."""
    product = db.query(Product).filter(
        Product.id == product_id,
        Product.company_id == current_user.company_id
    ).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found.")

    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(product, k, v)

    db.commit()
    db.refresh(product)
    return ProductResponse.model_validate(product)


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: uuid.UUID,
    current_user: User = Depends(require_role(["owner", "admin"])),
    db: Session = Depends(get_db)
):
    """Soft delete product by marking is_active=False."""
    product = db.query(Product).filter(
        Product.id == product_id,
        Product.company_id == current_user.company_id
    ).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found.")
    product.is_active = False
    db.commit()
    return None
