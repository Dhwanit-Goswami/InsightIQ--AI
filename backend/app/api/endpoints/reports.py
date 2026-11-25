import uuid
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Any, Dict
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.report import Report
from app.models.sale import Sale
from app.models.sale_item import SaleItem
from app.models.expense import Expense
from app.models.customer import Customer
from app.models.product import Product
from app.models.inventory import Inventory
from app.schemas.report import ReportResponse, ReportCreate

router = APIRouter()


def _serialize(obj):
    if isinstance(obj, dict):
        return {k: _serialize(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_serialize(v) for v in obj]
    if isinstance(obj, Decimal):
        return float(obj)
    return obj


@router.get("", response_model=List[ReportResponse])
def list_reports(
    report_type: Optional[str] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List business intelligence reports for the current company."""
    query = db.query(Report).filter(Report.company_id == current_user.company_id)
    if report_type and report_type != "All":
        query = query.filter(Report.report_type == report_type)
    if status_filter:
        query = query.filter(Report.status == status_filter)
    if search:
        query = query.filter(Report.name.ilike(f"%{search}%"))

    reports = query.order_by(Report.created_at.desc()).all()
    return [ReportResponse.model_validate(r) for r in reports]


@router.post("", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
def create_report(
    payload: ReportCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Request generation of a new report."""
    report = Report(
        company_id=current_user.company_id,
        generated_by=current_user.id,
        name=payload.name,
        report_type=payload.report_type,
        description=payload.description,
        parameters=payload.parameters,
        status="completed",  # Generated immediately for evaluation MVP
        completed_at=datetime.now(timezone.utc)
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return ReportResponse.model_validate(report)


@router.get("/{report_id}", response_model=ReportResponse)
def get_report(
    report_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve report metadata."""
    report = db.query(Report).filter(
        Report.id == report_id,
        Report.company_id == current_user.company_id
    ).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found.")
    return ReportResponse.model_validate(report)


@router.get("/{report_id}/preview")
def preview_report(
    report_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """
    Return real formatted report content preview based on report type.
    Dynamically extracts top 25 records and summary metrics from PostgreSQL.
    """
    report = db.query(Report).filter(
        Report.id == report_id,
        Report.company_id == current_user.company_id,
    ).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found.")

    company_id = current_user.company_id
    rtype = (report.report_type or "").lower()
    now = datetime.now(timezone.utc)
    params = report.parameters or {}
    days = int(params.get("days", 90))
    cutoff = now - timedelta(days=days)

    rows = []
    summary = {}
    columns = []

    if "sales" in rtype or "revenue" in rtype:
        columns = ["Invoice", "Customer", "Date", "Amount (₹)", "Payment", "Status"]
        sales = (
            db.query(Sale)
            .filter(Sale.company_id == company_id, Sale.sale_date >= cutoff)
            .order_by(desc(Sale.sale_date))
            .limit(25)
            .all()
        )
        rows = [
            {
                "Invoice": s.invoice_number,
                "Customer": s.customer.name if s.customer else "Walk-in",
                "Date": s.sale_date.strftime("%d %b %Y"),
                "Amount (₹)": f"₹{float(s.total_amount):,.2f}",
                "Payment": s.payment_method.upper(),
                "Status": s.status.capitalize(),
            }
            for s in sales
        ]
        total_rev = db.query(func.coalesce(func.sum(Sale.total_amount), Decimal("0"))).filter(
            Sale.company_id == company_id, Sale.status == "completed", Sale.sale_date >= cutoff
        ).scalar() or Decimal("0")
        order_count = db.query(func.count(Sale.id)).filter(
            Sale.company_id == company_id, Sale.status == "completed", Sale.sale_date >= cutoff
        ).scalar() or 0
        summary = {
            "Total Revenue": f"₹{float(total_rev):,.2f}",
            "Completed Orders": order_count,
            "Average Order Value": f"₹{(float(total_rev)/order_count):,.2f}" if order_count else "₹0",
            "Period": f"Last {days} days",
        }

    elif "expense" in rtype or "cost" in rtype:
        columns = ["Category", "Description", "Date", "Amount (₹)", "Vendor", "Status"]
        exps = (
            db.query(Expense)
            .filter(Expense.company_id == company_id, Expense.expense_date >= cutoff.date())
            .order_by(desc(Expense.expense_date))
            .limit(25)
            .all()
        )
        rows = [
            {
                "Category": e.category,
                "Description": (e.description or "")[:50],
                "Date": e.expense_date.strftime("%d %b %Y"),
                "Amount (₹)": f"₹{float(e.amount):,.2f}",
                "Vendor": e.vendor_name or "—",
                "Status": e.status.capitalize(),
            }
            for e in exps
        ]
        total_exp = db.query(func.coalesce(func.sum(Expense.amount), Decimal("0"))).filter(
            Expense.company_id == company_id, Expense.expense_date >= cutoff.date()
        ).scalar() or Decimal("0")
        summary = {
            "Total Expenses": f"₹{float(total_exp):,.2f}",
            "Records Shown": len(rows),
            "Period": f"Last {days} days",
        }

    elif "inventory" in rtype or "stock" in rtype:
        columns = ["Product", "SKU", "Category", "Qty on Hand", "Reorder Level", "Status"]
        invs = (
            db.query(Inventory)
            .filter(Inventory.company_id == company_id)
            .order_by(Inventory.quantity_on_hand)
            .limit(25)
            .all()
        )
        rows = [
            {
                "Product": inv.product.name if inv.product else "Unknown",
                "SKU": inv.product.sku if inv.product else "—",
                "Category": inv.product.category if inv.product else "—",
                "Qty on Hand": inv.quantity_on_hand,
                "Reorder Level": inv.reorder_level,
                "Status": "⚠ Low Stock" if inv.quantity_on_hand <= inv.reorder_level else "OK",
            }
            for inv in invs
        ]
        low_stock = sum(1 for inv in invs if inv.quantity_on_hand <= inv.reorder_level)
        summary = {
            "Total SKUs Shown": len(rows),
            "Low Stock Alerts": low_stock,
        }

    elif "customer" in rtype:
        columns = ["Name", "Email", "Segment", "City", "Joined", "Active"]
        customers = (
            db.query(Customer)
            .filter(Customer.company_id == company_id)
            .order_by(desc(Customer.created_at))
            .limit(25)
            .all()
        )
        rows = [
            {
                "Name": c.name,
                "Email": c.email or "—",
                "Segment": c.customer_segment or "—",
                "City": c.city or "—",
                "Joined": c.created_at.strftime("%d %b %Y"),
                "Active": "Yes" if c.is_active else "No",
            }
            for c in customers
        ]
        total = db.query(func.count(Customer.id)).filter(Customer.company_id == company_id).scalar() or 0
        active = db.query(func.count(Customer.id)).filter(
            Customer.company_id == company_id, Customer.is_active == True
        ).scalar() or 0
        summary = {"Total Customers": total, "Active": active, "Inactive": total - active}

    else:
        # Generic: show latest sales as a default fallback
        columns = ["Invoice", "Date", "Amount (₹)", "Status"]
        sales = db.query(Sale).filter(Sale.company_id == company_id).order_by(desc(Sale.sale_date)).limit(25).all()
        rows = [
            {"Invoice": s.invoice_number, "Date": s.sale_date.strftime("%d %b %Y"),
             "Amount (₹)": f"₹{float(s.total_amount):,.2f}", "Status": s.status.capitalize()}
            for s in sales
        ]
        summary = {"Records Shown": len(rows)}

    return _serialize({
        "report_id": str(report.id),
        "report_name": report.name,
        "report_type": report.report_type,
        "generated_at": report.created_at.strftime("%d %b %Y, %H:%M"),
        "summary": summary,
        "columns": columns,
        "rows": rows,
        "total_rows": len(rows),
    })
