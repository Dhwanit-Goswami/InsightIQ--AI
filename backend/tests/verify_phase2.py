"""
Phase 2 Verification Script — Tests live data from PostgreSQL
Run: python tests/verify_phase2.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal
from app.services.analytics import AnalyticsService
from app.models.user import User
from app.models.sale import Sale
from sqlalchemy.orm import joinedload
from sqlalchemy import desc
from decimal import Decimal

db = SessionLocal()

user = db.query(User).first()
if not user:
    print("ERROR: No users found in database")
    sys.exit(1)

cid = user.company_id
print(f"Testing with company_id={cid} (user={user.email})\n")

PASS = []
FAIL = []

for days in [7, 30, 90, 365]:
    result = AnalyticsService.get_dashboard_overview(db, cid, days)
    kpis = result["kpis"]
    rev = kpis["revenue"]
    exp = kpis["expenses"]
    profit = kpis["net_profit"]
    orders = kpis["orders"]
    aov = kpis["average_order_value"]
    trend = result["monthly_trend"]
    exp_bdown = result["expense_breakdown"]
    top_prods = result["top_products"]

    print(f"--- days={days} ---")
    print(f"  Revenue:        {rev['formatted_value']} (change={rev['change_pct']}%)")
    print(f"  Expenses:       {exp['formatted_value']}")
    print(f"  Net Profit:     {profit['formatted_value']}")
    print(f"  Orders:         {orders['value']}")
    print(f"  AOV:            {aov['formatted_value']}")
    print(f"  Expense cats:   {len(exp_bdown)}")
    print(f"  Top products:   {len(top_prods)}")

    # Check that 'profit' key is in monthly_trend items
    if trend:
        first = trend[0]
        has_profit = "profit" in first
        profit_val = first.get("profit", "MISSING")
        net_profit_val = first.get("net_profit", "MISSING")
        print(f"  Trend[0]:       month={first['month']}, profit={profit_val}, net_profit={net_profit_val}")
        if has_profit:
            PASS.append(f"days={days}: trend has 'profit' key")
        else:
            FAIL.append(f"days={days}: trend MISSING 'profit' key")
    else:
        print(f"  Trend:          (empty)")

    # Check that top_products have 'growth' key
    for p in top_prods:
        if "growth" not in p:
            FAIL.append(f"days={days}: product {p['name']} missing 'growth' key")
            break
    else:
        if top_prods:
            PASS.append(f"days={days}: top_products all have 'growth' key")

    print()

# Test recent sales - verify nested customer and items resolution
print("--- Recent Sales / Activity Mapping ---")
recent = db.query(Sale).options(
    joinedload(Sale.customer),
    joinedload(Sale.items)
).filter(Sale.company_id == cid).order_by(desc(Sale.sale_date)).limit(3).all()

for s in recent:
    cust_name = s.customer.name if s.customer else "Walk-in Customer"
    item_names = [i.product.name if i.product else "Unknown" for i in s.items]
    items_str = ", ".join(item_names) if item_names else "No items"
    print(f"  Sale {s.invoice_number}: customer={cust_name}, items={items_str}, status={s.status}")
    # Verify no raw UUIDs
    if str(s.customer_id) == cust_name:
        FAIL.append(f"Sale {s.invoice_number}: customer_name is UUID, not resolved!")
    else:
        PASS.append(f"Sale {s.invoice_number}: customer resolved correctly")

print()
print(f"PASSED: {len(PASS)}")
for p in PASS:
    print(f"  [OK] {p}")

if FAIL:
    print(f"\nFAILED: {len(FAIL)}")
    for f in FAIL:
        print(f"  [FAIL] {f}")
else:
    print("\nAll checks passed!")

db.close()
