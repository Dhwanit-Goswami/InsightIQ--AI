import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.models.user import User
from app.models.sale import Sale
from app.models.sale_item import SaleItem
from app.models.customer import Customer
from app.models.product import Product
from app.models.inventory import Inventory
from app.schemas.sale import SaleResponse, SaleCreate, SaleUpdate

router = APIRouter()


@router.get("", response_model=List[SaleResponse])
def list_sales(
    status_filter: Optional[str] = Query(None, alias="status"),
    payment_method: Optional[str] = None,
    customer_id: Optional[uuid.UUID] = None,
    search: Optional[str] = None,
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List sales orders with customer and items."""
    query = (
        db.query(Sale)
        .options(
            joinedload(Sale.customer),
            joinedload(Sale.items).joinedload(SaleItem.product)
        )
        .filter(Sale.company_id == current_user.company_id)
    )

    if status_filter:
        query = query.filter(Sale.status == status_filter)
    if payment_method:
        query = query.filter(Sale.payment_method == payment_method)
    if customer_id:
        query = query.filter(Sale.customer_id == customer_id)
    if search:
        query = query.filter(
            (Sale.invoice_number.ilike(f"%{search}%")) |
            (Sale.customer.has(Customer.name.ilike(f"%{search}%")))
        )

    sales = query.order_by(Sale.sale_date.desc()).offset(offset).limit(limit).all()
    return [SaleResponse.model_validate(s) for s in sales]


@router.post("", response_model=SaleResponse, status_code=status.HTTP_201_CREATED)
def create_sale(
    payload: SaleCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new sale order with line items and update inventory/customer totals."""
    # Check invoice number uniqueness within company
    existing_inv = db.query(Sale).filter(
        Sale.company_id == current_user.company_id,
        Sale.invoice_number == payload.invoice_number
    ).first()
    if existing_inv:
        raise HTTPException(status_code=400, detail=f"Invoice number '{payload.invoice_number}' already exists.")

    if not payload.items:
        raise HTTPException(status_code=400, detail="A sale must contain at least one line item.")

    subtotal = Decimal("0.00")
    tax_amount = Decimal("0.00")
    discount_amount = Decimal("0.00")
    sale_item_models = []

    for item in payload.items:
        prod = db.query(Product).filter(
            Product.id == item.product_id,
            Product.company_id == current_user.company_id
        ).first()
        if not prod:
            raise HTTPException(status_code=404, detail=f"Product with ID '{item.product_id}' not found.")

        line_subtotal = item.quantity * item.unit_price
        taxable = line_subtotal - item.discount
        line_tax = (taxable * (prod.tax_rate / Decimal("100.00"))).quantize(Decimal("0.01")) if item.tax == Decimal("0.00") else item.tax
        line_total = taxable + line_tax

        subtotal += line_subtotal
        discount_amount += item.discount
        tax_amount += line_tax

        sale_item_models.append(SaleItem(
            product_id=prod.id,
            quantity=item.quantity,
            unit_price=item.unit_price,
            discount=item.discount,
            tax=line_tax,
            total_amount=line_total
        ))

        # Decrement Inventory
        inv = db.query(Inventory).filter(
            Inventory.company_id == current_user.company_id,
            Inventory.product_id == prod.id
        ).first()
        if inv:
            inv.quantity = max(Decimal("0.00"), inv.quantity - item.quantity)

    total_amount = subtotal - discount_amount + tax_amount
    sale_date = payload.sale_date or datetime.now(timezone.utc)

    sale = Sale(
        company_id=current_user.company_id,
        customer_id=payload.customer_id,
        invoice_number=payload.invoice_number,
        sale_date=sale_date,
        subtotal=subtotal,
        tax_amount=tax_amount,
        discount_amount=discount_amount,
        total_amount=total_amount,
        payment_method=payload.payment_method,
        status=payload.status,
        notes=payload.notes,
        items=sale_item_models
    )
    db.add(sale)

    # Update Customer total_purchases
    if payload.customer_id:
        cust = db.query(Customer).filter(
            Customer.id == payload.customer_id,
            Customer.company_id == current_user.company_id
        ).first()
        if cust and payload.status == "completed":
            cust.total_purchases += total_amount
            cust.last_purchase_date = sale_date

    db.commit()
    db.refresh(sale)
    return SaleResponse.model_validate(sale)


@router.get("/{sale_id}", response_model=SaleResponse)
def get_sale(
    sale_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve full sale details."""
    sale = (
        db.query(Sale)
        .options(
            joinedload(Sale.customer),
            joinedload(Sale.items).joinedload(SaleItem.product)
        )
        .filter(
            Sale.id == sale_id,
            Sale.company_id == current_user.company_id
        )
        .first()
    )
    if not sale:
        raise HTTPException(status_code=404, detail="Sale order not found.")
    return SaleResponse.model_validate(sale)


@router.put("/{sale_id}", response_model=SaleResponse)
def update_sale(
    sale_id: uuid.UUID,
    payload: SaleUpdate,
    current_user: User = Depends(require_role(["owner", "admin", "manager"])),
    db: Session = Depends(get_db)
):
    """Update sale status or notes."""
    sale = (
        db.query(Sale)
        .options(
            joinedload(Sale.customer),
            joinedload(Sale.items).joinedload(SaleItem.product)
        )
        .filter(
            Sale.id == sale_id,
            Sale.company_id == current_user.company_id
        )
        .first()
    )
    if not sale:
        raise HTTPException(status_code=404, detail="Sale order not found.")

    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(sale, k, v)

    db.commit()
    db.refresh(sale)
    return SaleResponse.model_validate(sale)
