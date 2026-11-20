"""
Master Project Completion & Integration Verification Script
Tests all newly completed CRUD endpoints and workflows against live PostgreSQL.
"""
import sys, os, uuid
from datetime import datetime, date
from decimal import Decimal

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from app.main import app
from app.core.database import SessionLocal
from app.models.user import User
from app.models.company import Company
from app.models.product import Product
from app.models.inventory import Inventory
from app.models.sale import Sale
from app.models.customer import Customer
from app.models.expense import Expense
from app.models.report import Report
from app.core.security import create_access_token

client = TestClient(app)
db = SessionLocal()

user = db.query(User).filter(User.email == "demo@insightiq.ai").first()
if not user:
    user = db.query(User).first()
assert user is not None, "A valid database user must exist"

token = create_access_token({
    "sub": str(user.id),
    "company_id": str(user.company_id),
    "role": user.role
})
headers = {"Authorization": f"Bearer {token}"}

print(f"Running verification with user={user.email}, company={user.company_id}\n")

PASS = []
FAIL = []

def record(name, condition, msg=""):
    if condition:
        print(f"  [PASS] {name}")
        PASS.append(name)
    else:
        print(f"  [FAIL] {name}: {msg}")
        FAIL.append(f"{name}: {msg}")

# 1. User Profile Update (PUT /api/v1/users/me)
orig_name = user.name
test_name = f"{orig_name} Verified"
res = client.put("/api/v1/users/me", json={"name": test_name}, headers=headers)
record("PUT /api/v1/users/me", res.status_code == 200 and res.json().get("name") == test_name, res.text)

# Restore original name
client.put("/api/v1/users/me", json={"name": orig_name}, headers=headers)

# 2. Product & Inventory creation (POST /api/v1/products)
test_sku = f"TEST-{uuid.uuid4().hex[:6].upper()}"
prod_payload = {
    "sku": test_sku,
    "name": "Integration Test Scanner Unit",
    "category": "POS Hardware",
    "selling_price": "25000.00",
    "cost_price": "18000.00",
    "unit": "pcs",
}
res = client.post("/api/v1/products?initial_stock=40&reorder_level=10", json=prod_payload, headers=headers)
record("POST /api/v1/products", res.status_code == 201, res.text)
created_prod = res.json()
prod_id = created_prod.get("id")

# Verify inventory record was created
inv_record = db.query(Inventory).filter(Inventory.product_id == prod_id).first()
record("Inventory auto-created for Product", inv_record is not None and inv_record.quantity == Decimal("40.00"))

# 3. Adjust Stock (PUT /api/v1/inventory/{id})
if inv_record:
    res = client.put(f"/api/v1/inventory/{inv_record.id}", json={"quantity": "55.00"}, headers=headers)
    record("PUT /api/v1/inventory/{id}", res.status_code == 200 and Decimal(str(res.json().get("quantity"))) == Decimal("55.00"), res.text)

# 4. Customer CRUD
cust_payload = {
    "name": f"Test Client Corp {uuid.uuid4().hex[:4]}",
    "email": f"test_{uuid.uuid4().hex[:4]}@client.in",
    "phone": "+91 9876543210",
    "city": "Bengaluru",
    "segment": "enterprise"
}
res = client.post("/api/v1/customers", json=cust_payload, headers=headers)
record("POST /api/v1/customers", res.status_code == 201, res.text)
created_cust = res.json()
cust_id = created_cust.get("id")

if cust_id:
    # Update customer
    res = client.put(f"/api/v1/customers/{cust_id}", json={"name": f"{cust_payload['name']} Updated"}, headers=headers)
    record("PUT /api/v1/customers/{id}", res.status_code == 200 and "Updated" in res.json().get("name"), res.text)

# 5. Sale Transaction Persistence (POST /api/v1/sales)
test_inv_num = f"INV-TEST-{uuid.uuid4().hex[:6].upper()}"
sale_payload = {
    "invoice_number": test_inv_num,
    "customer_id": cust_id,
    "payment_method": "upi",
    "status": "completed",
    "notes": "Automated verification sale transaction",
    "items": [
        {
            "product_id": prod_id,
            "quantity": "2.00",
            "unit_price": "25000.00",
            "discount": "0.00",
            "tax": "0.00"
        }
    ]
}
res = client.post("/api/v1/sales", json=sale_payload, headers=headers)
record("POST /api/v1/sales", res.status_code == 201, res.text)
created_sale = res.json()

# Verify inventory decremented: 55 - 2 = 53
db.expire_all()
updated_inv = db.query(Inventory).filter(Inventory.product_id == prod_id).first()
record("Inventory decremented after sale", updated_inv is not None and updated_inv.quantity == Decimal("53.00"))

# 6. Expenses CRUD
exp_payload = {
    "category": "technology",
    "description": "Cloud telemetry and server reservation",
    "amount": "45000.00",
    "expense_date": date.today().isoformat(),
    "payment_method": "bank_transfer",
    "status": "paid"
}
res = client.post("/api/v1/expenses", json=exp_payload, headers=headers)
record("POST /api/v1/expenses", res.status_code == 201, res.text)
created_exp = res.json()
exp_id = created_exp.get("id")

if exp_id:
    # Delete test expense
    res = client.delete(f"/api/v1/expenses/{exp_id}", headers=headers)
    record("DELETE /api/v1/expenses/{id}", res.status_code == 204, res.text)

# 7. Clean up test sale and product and customer to leave DB pristine
if created_sale.get("id"):
    db.query(Sale).filter(Sale.id == created_sale["id"]).delete()
if inv_record:
    db.query(Inventory).filter(Inventory.id == inv_record.id).delete()
if prod_id:
    db.query(Product).filter(Product.id == prod_id).delete()
if cust_id:
    db.query(Customer).filter(Customer.id == cust_id).delete()
db.commit()

# 8. Report creation (POST /api/v1/reports)
rep_payload = {
    "name": f"Comprehensive Q3 Audit {uuid.uuid4().hex[:4]}",
    "report_type": "financial",
    "description": "Executive report for Q3 verification",
    "parameters": {"period": "Q3 FY26"}
}
res = client.post("/api/v1/reports", json=rep_payload, headers=headers)
record("POST /api/v1/reports", res.status_code == 201 and res.json().get("status") == "completed", res.text)
created_rep = res.json()
if created_rep.get("id"):
    db.query(Report).filter(Report.id == created_rep["id"]).delete()
    db.commit()

# 9. Company endpoint verification
res = client.get(f"/api/v1/companies/{user.company_id}", headers=headers)
record("GET /api/v1/companies/{id}", res.status_code == 200 and res.json().get("currency") == "INR", res.text)

print(f"\nSummary: {len(PASS)} PASSED, {len(FAIL)} FAILED")
if FAIL:
    sys.exit(1)
db.close()
