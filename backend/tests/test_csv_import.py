import io
import uuid
from decimal import Decimal
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.core.database import Base, engine, get_db
from app.core.security import create_access_token
from app.models.company import Company
from app.models.user import User
from app.models.customer import Customer
from app.models.product import Product
from app.models.inventory import Inventory
from app.models.sale import Sale
from app.models.expense import Expense


@pytest.fixture
def db_session():
    """Create a scoped database session for testing."""
    session = Session(bind=engine)
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def test_setup(db_session: Session):
    """Set up two distinct test companies and users to test functionality and company isolation."""
    # Company A
    comp_a = Company(
        name=f"Import Test Corp A {uuid.uuid4().hex[:6]}",
        legal_name="Import Test Corp A Ltd",
        industry="Retail",
        is_active=True
    )
    db_session.add(comp_a)
    db_session.flush()

    user_a = User(
        company_id=comp_a.id,
        name="Admin User A",
        email=f"admin_a_{uuid.uuid4().hex[:6]}@insightiq.ai",
        password_hash="test_hashed_pwd",
        role="admin",
        is_active=True
    )
    db_session.add(user_a)

    # Company B (for multi-tenant isolation testing)
    comp_b = Company(
        name=f"Import Test Corp B {uuid.uuid4().hex[:6]}",
        legal_name="Import Test Corp B Ltd",
        industry="Manufacturing",
        is_active=True
    )
    db_session.add(comp_b)
    db_session.flush()

    user_b = User(
        company_id=comp_b.id,
        name="Admin User B",
        email=f"admin_b_{uuid.uuid4().hex[:6]}@insightiq.ai",
        password_hash="test_hashed_pwd",
        role="admin",
        is_active=True
    )
    db_session.add(user_b)
    db_session.commit()

    token_a = create_access_token({"sub": str(user_a.id), "company_id": str(comp_a.id), "role": user_a.role})
    token_b = create_access_token({"sub": str(user_b.id), "company_id": str(comp_b.id), "role": user_b.role})

    return {
        "comp_a": comp_a,
        "user_a": user_a,
        "token_a": token_a,
        "comp_b": comp_b,
        "user_b": user_b,
        "token_b": token_b,
    }


@pytest.fixture
def client():
    return TestClient(app)


# ─── 1. TEMPLATE DOWNLOAD TESTS ───────────────────────────────────

def test_download_templates_all_categories(client: TestClient, test_setup):
    headers = {"Authorization": f"Bearer {test_setup['token_a']}"}
    for cat in ["customers", "products", "sales", "expenses"]:
        res = client.get(f"/api/v1/import/template/{cat}", headers=headers)
        assert res.status_code == 200
        assert "text/csv" in res.headers["content-type"]
        text = res.text
        assert len(text) > 20
        # Check that header row exists
        first_line = text.splitlines()[0]
        assert "," in first_line


def test_download_template_invalid_category(client: TestClient, test_setup):
    headers = {"Authorization": f"Bearer {test_setup['token_a']}"}
    res = client.get("/api/v1/import/template/nonexistent_category", headers=headers)
    assert res.status_code == 400


# ─── 2. EMPTY FILE AND MALFORMED HEADERS TESTS ───────────────────

def test_validate_empty_file(client: TestClient, test_setup):
    headers = {"Authorization": f"Bearer {test_setup['token_a']}"}
    payload = {
        "category": "customers",
        "csv_content": "   ",
        "filename": "empty.csv"
    }
    res = client.post("/api/v1/import/validate", headers=headers, json=payload)
    assert res.status_code == 400
    assert "empty" in res.json()["detail"].lower()


def test_validate_missing_required_headers(client: TestClient, test_setup):
    headers = {"Authorization": f"Bearer {test_setup['token_a']}"}
    payload = {
        "category": "customers",
        "csv_content": "random_col_1,random_col_2\nval1,val2\n",
        "filename": "bad.csv"
    }
    res = client.post("/api/v1/import/validate", headers=headers, json=payload)
    assert res.status_code == 400
    assert "missing" in res.json()["detail"].lower()


# ─── 3. CUSTOMER IMPORT TESTS ─────────────────────────────────────

def test_validate_and_commit_customers(client: TestClient, test_setup, db_session: Session):
    headers = {"Authorization": f"Bearer {test_setup['token_a']}"}
    csv_content = (
        "name,email,phone,city,state,pincode,address,segment\n"
        "Titan Industries,procurement@titan.co,9820011111,Mumbai,MH,400001,Andheri East,enterprise\n"
        "Shree Ganesh Traders,ganesh@sgtraders.in,9820022222,Pune,MH,411001,FC Road,mid_market\n"
    )

    payload = {
        "category": "customers",
        "csv_content": csv_content,
        "filename": "customers.csv"
    }
    val_res = client.post("/api/v1/import/validate", headers=headers, json=payload)
    assert val_res.status_code == 200
    body = val_res.json()
    assert body["is_valid"] is True
    assert body["total_rows"] == 2
    assert body["valid_count"] == 2
    assert body["invalid_count"] == 0

    # Commit records
    commit_payload = {
        "category": "customers",
        "valid_records": body["valid_records"],
        "mode": "all_or_nothing"
    }
    com_res = client.post("/api/v1/import/commit", headers=headers, json=commit_payload)
    assert com_res.status_code == 200
    assert com_res.json()["imported"] == 2

    # Verify database persistence & company scoping
    custs = db_session.query(Customer).filter(Customer.company_id == test_setup["comp_a"].id).all()
    names = [c.name for c in custs]
    assert "Titan Industries" in names
    assert "Shree Ganesh Traders" in names

    # Verify company B does not see Company A's customers
    custs_b = db_session.query(Customer).filter(Customer.company_id == test_setup["comp_b"].id).all()
    assert not any(c.name == "Titan Industries" for c in custs_b)


def test_customer_duplicate_detection(client: TestClient, test_setup):
    headers = {"Authorization": f"Bearer {test_setup['token_a']}"}
    duplicate_csv = (
        "name,email,phone\n"
        "Duplicate Client,dup@client.com,9820011111\n"
        "Duplicate Client,other@client.com,9820022222\n"
    )

    payload = {
        "category": "customers",
        "csv_content": duplicate_csv,
        "filename": "dup.csv"
    }
    val_res = client.post("/api/v1/import/validate", headers=headers, json=payload)
    assert val_res.status_code == 200
    body = val_res.json()
    assert body["is_valid"] is False
    assert body["invalid_count"] >= 1
    err_msgs = [e["message"] for e in body["errors"]]
    assert any("duplicate" in m.lower() for m in err_msgs)


# ─── 4. PRODUCTS & INVENTORY IMPORT TESTS ─────────────────────────

def test_validate_and_commit_products_with_inventory(client: TestClient, test_setup, db_session: Session):
    headers = {"Authorization": f"Bearer {test_setup['token_a']}"}
    sku1 = f"SKU-{uuid.uuid4().hex[:6].upper()}"
    sku2 = f"SKU-{uuid.uuid4().hex[:6].upper()}"

    csv_content = (
        "sku,name,category,cost_price,selling_price,tax_rate,initial_stock,reorder_level,warehouse_location\n"
        f"{sku1},Thermal Receipt Printer,POS Hardware,4500.00,7500.00,18.0,40,5,Depot 1\n"
        f"{sku2},Barcode Scanner Wireless,POS Hardware,2200.00,3800.00,18.0,25,4,Depot 2\n"
    )

    payload = {
        "category": "products",
        "csv_content": csv_content,
        "filename": "products.csv"
    }
    val_res = client.post("/api/v1/import/validate", headers=headers, json=payload)
    assert val_res.status_code == 200
    body = val_res.json()
    assert body["is_valid"] is True
    assert body["valid_count"] == 2

    # Commit
    commit_payload = {
        "category": "products",
        "valid_records": body["valid_records"],
        "mode": "all_or_nothing"
    }
    com_res = client.post("/api/v1/import/commit", headers=headers, json=commit_payload)
    assert com_res.status_code == 200
    assert com_res.json()["imported"] == 2

    # Verify Product and Inventory created in PostgreSQL
    p1 = db_session.query(Product).filter(Product.sku == sku1, Product.company_id == test_setup["comp_a"].id).first()
    assert p1 is not None
    assert p1.selling_price == Decimal("7500.00")

    inv1 = db_session.query(Inventory).filter(Inventory.product_id == p1.id).first()
    assert inv1 is not None
    assert inv1.quantity == Decimal("40.00")
    assert inv1.reorder_level == Decimal("5.00")


def test_products_invalid_numeric_values(client: TestClient, test_setup):
    headers = {"Authorization": f"Bearer {test_setup['token_a']}"}
    bad_csv = (
        "sku,name,cost_price,selling_price\n"
        "SKU-BAD-1,Bad Product,NOT_A_NUMBER,500.00\n"
        "SKU-BAD-2,Bad Product 2,100.00,-50.00\n"
    )

    payload = {
        "category": "products",
        "csv_content": bad_csv,
        "filename": "bad_num.csv"
    }
    val_res = client.post("/api/v1/import/validate", headers=headers, json=payload)
    assert val_res.status_code == 200
    body = val_res.json()
    assert body["is_valid"] is False
    assert body["invalid_count"] == 2


# ─── 5. SALES IMPORT TESTS ────────────────────────────────────────

def test_validate_and_commit_sales_with_stock_decrement(client: TestClient, test_setup, db_session: Session):
    headers = {"Authorization": f"Bearer {test_setup['token_a']}"}

    # First ensure a product and customer exist
    sku = f"SKU-{uuid.uuid4().hex[:6].upper()}"
    prod = Product(
        company_id=test_setup["comp_a"].id,
        sku=sku,
        name="High Speed Router",
        category="Networking",
        cost_price=Decimal("2000.00"),
        selling_price=Decimal("4000.00"),
        tax_rate=Decimal("18.00"),
        unit="pcs"
    )
    db_session.add(prod)
    db_session.flush()

    inv = Inventory(
        company_id=test_setup["comp_a"].id,
        product_id=prod.id,
        quantity=Decimal("50.00"),
        reorder_level=Decimal("10.00")
    )
    db_session.add(inv)

    cust = Customer(
        company_id=test_setup["comp_a"].id,
        name="Global Networks Ltd",
        email=f"network_{uuid.uuid4().hex[:4]}@globalnet.com",
        total_purchases=Decimal("0.00")
    )
    db_session.add(cust)
    db_session.commit()

    inv_number = f"INV-TEST-{uuid.uuid4().hex[:6].upper()}"
    sales_csv = (
        "invoice_number,sale_date,customer,sku,quantity,unit_price,discount,payment_method,status\n"
        f"{inv_number},2026-11-20,Global Networks Ltd,{sku},5,4000.00,0.00,bank_transfer,completed\n"
    )

    payload = {
        "category": "sales",
        "csv_content": sales_csv,
        "filename": "sales.csv"
    }
    val_res = client.post("/api/v1/import/validate", headers=headers, json=payload)
    assert val_res.status_code == 200
    body = val_res.json()
    assert body["is_valid"] is True
    assert body["valid_count"] == 1

    # Commit sale
    commit_payload = {
        "category": "sales",
        "valid_records": body["valid_records"],
        "mode": "all_or_nothing"
    }
    com_res = client.post("/api/v1/import/commit", headers=headers, json=commit_payload)
    assert com_res.status_code == 200
    assert com_res.json()["imported"] == 1

    # Verify inventory was decremented from 50 to 45
    db_session.refresh(inv)
    assert inv.quantity == Decimal("45.00")

    # Verify customer total purchases updated
    db_session.refresh(cust)
    assert cust.total_purchases > Decimal("0.00")


def test_sales_reject_unknown_sku(client: TestClient, test_setup):
    headers = {"Authorization": f"Bearer {test_setup['token_a']}"}
    sales_csv = (
        "invoice_number,sku,quantity\n"
        "INV-NO-SKU,NONEXISTENT_SKU_9999,2\n"
    )

    payload = {
        "category": "sales",
        "csv_content": sales_csv,
        "filename": "bad_sale.csv"
    }
    val_res = client.post("/api/v1/import/validate", headers=headers, json=payload)
    assert val_res.status_code == 200
    body = val_res.json()
    assert body["is_valid"] is False
    assert any("does not exist" in e["message"] for e in body["errors"])


# ─── 6. EXPENSES IMPORT TESTS ─────────────────────────────────────

def test_validate_and_commit_expenses(client: TestClient, test_setup, db_session: Session):
    headers = {"Authorization": f"Bearer {test_setup['token_a']}"}
    expenses_csv = (
        "expense_date,category,description,amount,payment_method,vendor,status\n"
        "2026-11-22,Office Supplies,Ergonomic Chairs & Desks,32500.00,card,Featherlite,paid\n"
        "2026-11-23,Utilities,High Speed Optical Internet,8400.00,upi,Airtel Enterprise,paid\n"
    )

    payload = {
        "category": "expenses",
        "csv_content": expenses_csv,
        "filename": "expenses.csv"
    }
    val_res = client.post("/api/v1/import/validate", headers=headers, json=payload)
    assert val_res.status_code == 200
    body = val_res.json()
    assert body["is_valid"] is True
    assert body["valid_count"] == 2

    # Commit
    commit_payload = {
        "category": "expenses",
        "valid_records": body["valid_records"],
        "mode": "all_or_nothing"
    }
    com_res = client.post("/api/v1/import/commit", headers=headers, json=commit_payload)
    assert com_res.status_code == 200
    assert com_res.json()["imported"] == 2

    # Verify database persistence
    exps = db_session.query(Expense).filter(Expense.company_id == test_setup["comp_a"].id).all()
    descriptions = [e.description for e in exps]
    assert "Ergonomic Chairs & Desks" in descriptions
    assert "High Speed Optical Internet" in descriptions


# ─── 7. ERROR CSV EXPORT ENDPOINT ─────────────────────────────────

def test_download_error_csv_export(client: TestClient, test_setup):
    headers = {"Authorization": f"Bearer {test_setup['token_a']}"}
    payload = {
        "headers": ["name", "email", "phone"],
        "errors": [
            {
                "row": 2,
                "field": "email",
                "message": "Invalid email format",
                "data": {"name": "Test Client", "email": "invalid_email", "phone": "123"}
            }
        ]
    }
    res = client.post("/api/v1/import/error-csv", headers=headers, json=payload)
    assert res.status_code == 200
    assert "text/csv" in res.headers["content-type"]
    text = res.text
    assert "Row_Number" in text
    assert "Invalid email format" in text
    assert "invalid_email" in text
