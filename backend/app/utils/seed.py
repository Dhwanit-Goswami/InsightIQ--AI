"""
Development database seed utility for InsightIQ.
Populates the database with realistic fictional Indian SME business data.
Safe and idempotent to execute multiple times.
"""

import uuid
import random
import sys
from datetime import datetime, timedelta, timezone, date
from decimal import Decimal
from sqlalchemy.orm import Session

# Ensure utf-8 output on Windows consoles
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

from app.core.database import SessionLocal, engine
from app.core.security import hash_password
from app.models.company import Company
from app.models.user import User
from app.models.employee import Employee
from app.models.customer import Customer
from app.models.product import Product
from app.models.inventory import Inventory
from app.models.sale import Sale
from app.models.sale_item import SaleItem
from app.models.expense import Expense
from app.models.business_metric import BusinessMetric
from app.models.report import Report
from app.models.ai_insight import AIInsight
from app.models.ai_recommendation import AIRecommendation


# Fixed Deterministic Company UUIDs
CO_NOVA_ID = uuid.UUID("11111111-1111-1111-1111-111111111111")
CO_FRESH_ID = uuid.UUID("22222222-2222-2222-2222-222222222222")
CO_URBAN_ID = uuid.UUID("33333333-3333-3333-3333-333333333333")


def run_seed():
    """Execute development database seeding."""
    db: Session = SessionLocal()
    try:
        print("[INFO] Checking existing data...")
        existing_company = db.query(Company).filter(Company.id == CO_NOVA_ID).first()
        if existing_company:
            print("[WARN] Data already exists in database. Verifying records...")
            user_count = db.query(User).count()
            sale_count = db.query(Sale).count()
            product_count = db.query(Product).count()
            print(f"[STATS] Current counts: {user_count} users, {product_count} products, {sale_count} sales.")
            if user_count >= 5 and sale_count >= 50:
                print("[OK] Database is already properly seeded! Skipping to prevent duplication.")
                return

        print("[INFO] Starting fresh development seed...")
        random.seed(42)  # For reproducible realistic data

        # OK 1. COMPANIES OK
        companies = [
            Company(
                id=CO_NOVA_ID,
                name="Nova Retail Solutions",
                legal_name="Nova Retail & Distribution Pvt Ltd",
                industry="Retail & Distribution",
                email="contact@novaretail.in",
                phone="+91 79 4012 3456",
                address="402, Titanium City Centre, Prahlad Nagar",
                city="Ahmedabad",
                state="Gujarat",
                country="India",
                pincode="380015",
                website="https://novaretail.in",
                currency="INR",
                timezone="Asia/Kolkata",
                is_active=True,
            ),
            Company(
                id=CO_FRESH_ID,
                name="Ahmedabad Fresh Foods",
                legal_name="Ahmedabad Agro & Fresh Foods LLP",
                industry="Food & FMCG",
                email="sales@freshfoods.in",
                phone="+91 79 2658 9012",
                address="12, APMC Market Yard, Vasna",
                city="Ahmedabad",
                state="Gujarat",
                country="India",
                pincode="380007",
                website="https://freshfoods.in",
                currency="INR",
                timezone="Asia/Kolkata",
                is_active=True,
            ),
            Company(
                id=CO_URBAN_ID,
                name="UrbanCraft Industries",
                legal_name="UrbanCraft Manufacturing India Pvt Ltd",
                industry="Industrial & Hardware",
                email="info@urbancraft.in",
                phone="+91 261 245 7890",
                address="Plot 88, GIDC Industrial Estate, Sachin",
                city="Surat",
                state="Gujarat",
                country="India",
                pincode="394230",
                website="https://urbancraft.in",
                currency="INR",
                timezone="Asia/Kolkata",
                is_active=True,
            ),
        ]
        db.add_all(companies)
        db.flush()
        print("  OK 3 Companies seeded.")

        # OK 2. USERS OK
        common_password_hash = hash_password("Password@123")
        users = [
            # Nova Retail Users
            User(
                company_id=CO_NOVA_ID,
                name="Dhwanit Goswami",
                email="demo@insightiq.ai",
                password_hash=common_password_hash,
                role="owner",
                is_active=True,
            ),
            User(
                company_id=CO_NOVA_ID,
                name="Rajesh Patel",
                email="rajesh@novaretail.in",
                password_hash=common_password_hash,
                role="admin",
                is_active=True,
            ),
            User(
                company_id=CO_NOVA_ID,
                name="Pooja Shah",
                email="pooja@novaretail.in",
                password_hash=common_password_hash,
                role="manager",
                is_active=True,
            ),
            User(
                company_id=CO_NOVA_ID,
                name="Ananya Desai",
                email="ananya@novaretail.in",
                password_hash=common_password_hash,
                role="analyst",
                is_active=True,
            ),
            # Fresh Foods User
            User(
                company_id=CO_FRESH_ID,
                name="Ketan Trivedi",
                email="ketan@freshfoods.in",
                password_hash=common_password_hash,
                role="owner",
                is_active=True,
            ),
            # UrbanCraft User
            User(
                company_id=CO_URBAN_ID,
                name="Harsh Joshi",
                email="harsh@urbancraft.in",
                password_hash=common_password_hash,
                role="owner",
                is_active=True,
            ),
        ]
        db.add_all(users)
        db.flush()
        print("  OK 6 Users seeded (Default password: Password@123).")

        # OK 3. EMPLOYEES OK
        employee_data = [
            ("EMP-001", "Aarav Mehta", "aarav@novaretail.in", "+91 98250 11001", "Sales", "Sales Director", date(2023, 1, 15), Decimal("95000.00")),
            ("EMP-002", "Bhavik Parekh", "bhavik@novaretail.in", "+91 98250 11002", "Sales", "Senior Account Exec", date(2023, 4, 1), Decimal("65000.00")),
            ("EMP-003", "Chirag Modi", "chirag@novaretail.in", "+91 98250 11003", "Operations", "Warehouse Lead", date(2023, 6, 15), Decimal("50000.00")),
            ("EMP-004", "Deepa Joshi", "deepa@novaretail.in", "+91 98250 11004", "Finance", "Senior Accountant", date(2022, 11, 1), Decimal("70000.00")),
            ("EMP-005", "Ekta Panchal", "ekta@novaretail.in", "+91 98250 11005", "Marketing", "Brand Specialist", date(2023, 8, 20), Decimal("55000.00")),
            ("EMP-006", "Farhan Sheikh", "farhan@novaretail.in", "+91 98250 11006", "Operations", "Logistics Coordinator", date(2024, 1, 10), Decimal("42000.00")),
            ("EMP-007", "Gaurav Dave", "gaurav@novaretail.in", "+91 98250 11007", "Sales", "Regional Sales Exec", date(2024, 2, 15), Decimal("48000.00")),
            ("EMP-008", "Hiral Bhatt", "hiral@novaretail.in", "+91 98250 11008", "Human Resources", "HR Generalist", date(2023, 3, 1), Decimal("45000.00")),
            ("EMP-009", "Ishaan Solanki", "ishaan@novaretail.in", "+91 98250 11009", "IT", "Systems Administrator", date(2023, 9, 1), Decimal("62000.00")),
            ("EMP-010", "Jayesh Prajapati", "jayesh@novaretail.in", "+91 98250 11010", "Operations", "Inventory Clerk", date(2024, 3, 1), Decimal("38000.00")),
            ("EMP-011", "Kavita Soni", "kavita@novaretail.in", "+91 98250 11011", "Finance", "Billing Specialist", date(2024, 4, 1), Decimal("40000.00")),
            ("EMP-012", "Lokesh Vora", "lokesh@novaretail.in", "+91 98250 11012", "Sales", "Business Development", date(2024, 5, 1), Decimal("52000.00")),
        ]
        employees = []
        for code, name, email, phone, dept, desig, jdate, sal in employee_data:
            employees.append(Employee(
                company_id=CO_NOVA_ID,
                employee_code=code,
                name=name,
                email=email,
                phone=phone,
                department=dept,
                designation=desig,
                joining_date=jdate,
                salary=sal,
                status="active"
            ))
        db.add_all(employees)
        db.flush()
        print(f"  OK {len(employees)} Employees seeded.")

        # OK 4. CUSTOMERS OK
        customer_presets = [
            ("Shree Balaji Supermarket", "purchase@balajiretail.in", "+91 98980 23401", "Ahmedabad", "Gujarat", "enterprise"),
            ("Surat Diamond Tools Trading", "orders@surattools.in", "+91 98980 23402", "Surat", "Gujarat", "enterprise"),
            ("Vadodara Mega Stores", "inventory@vadodaramarket.com", "+91 98980 23403", "Vadodara", "Gujarat", "vip"),
            ("Apex Global Logistics Hub", "procure@apexlogistics.in", "+91 98980 23404", "Bhiwandi", "Maharashtra", "enterprise"),
            ("Kiran Textiles & Retail", "accounts@kirantextiles.com", "+91 98980 23405", "Surat", "Gujarat", "vip"),
            ("Mumbai Metro Wholesale", "mumbai@metrowholesale.in", "+91 98980 23406", "Mumbai", "Maharashtra", "enterprise"),
            ("Pune Tech Innovations", "purchase@punetech.in", "+91 98980 23407", "Pune", "Maharashtra", "regular"),
            ("Navrang Electronics Outlet", "sales@navrangelec.com", "+91 98980 23408", "Ahmedabad", "Gujarat", "regular"),
            ("Maruti Provision Stores", "maruti.retail@gmail.com", "+91 98980 23409", "Rajkot", "Gujarat", "regular"),
            ("Shakti Packaging Solutions", "shakti.pkg@gmail.com", "+91 98980 23410", "Surat", "Gujarat", "at_risk"),
            ("Omkar Trading Company", "omkar.trading@rediffmail.com", "+91 98980 23411", "Ahmedabad", "Gujarat", "regular"),
            ("Gujarat Fasteners & Tools", "contact@gujaratfasteners.com", "+91 98980 23412", "Vadodara", "Gujarat", "regular"),
            ("Evergreen Dept Stores", "info@evergreenstores.in", "+91 98980 23413", "Mumbai", "Maharashtra", "vip"),
            ("Rajkot Machinery Mart", "rajkot.machinery@gmail.com", "+91 98980 23414", "Rajkot", "Gujarat", "regular"),
            ("Deccan Retail Consortium", "procure@deccanretail.co.in", "+91 98980 23415", "Pune", "Maharashtra", "enterprise"),
            ("Pinnacle Hardware & Electricals", "pinnacle.elec@gmail.com", "+91 98980 23416", "Ahmedabad", "Gujarat", "regular"),
            ("Western Hub Distributors", "admin@westernhub.in", "+91 98980 23417", "Surat", "Gujarat", "vip"),
            ("Siddhi Vinayak Emporium", "siddhi.emporium@yahoo.com", "+91 98980 23418", "Mumbai", "Maharashtra", "at_risk"),
            ("Ambica Traders", "ambica.traders@gmail.com", "+91 98980 23419", "Bhavnagar", "Gujarat", "regular"),
            ("Star India Mart", "support@starindiamart.in", "+91 98980 23420", "Bengaluru", "Karnataka", "enterprise"),
        ]
        customers = []
        for name, email, phone, city, state, seg in customer_presets:
            customers.append(Customer(
                company_id=CO_NOVA_ID,
                name=name,
                email=email,
                phone=phone,
                city=city,
                state=state,
                segment=seg,
                total_purchases=Decimal("0.00"),
                is_active=True
            ))
        # Add 30 additional procedural customers
        cities = ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Mumbai", "Pune", "Gandhinagar"]
        for i in range(21, 51):
            city = random.choice(cities)
            customers.append(Customer(
                company_id=CO_NOVA_ID,
                name=f"Partner Enterprise {i:02d}",
                email=f"client{i}@partnernetwork.in",
                phone=f"+91 98765 {i:05d}",
                city=city,
                state="Gujarat" if city not in ["Mumbai", "Pune"] else "Maharashtra",
                segment=random.choice(["regular", "regular", "vip", "enterprise", "at_risk"]),
                total_purchases=Decimal("0.00"),
                is_active=True
            ))
        db.add_all(customers)
        db.flush()
        print(f"  OK {len(customers)} Customers seeded.")

        # OK 5. PRODUCTS & INVENTORY OK
        catalog = [
            ("SKU-POS-101", "POS Thermal Receipt Printer 80mm", "POS Hardware", Decimal("3200.00"), Decimal("4850.00"), Decimal("18.00"), "TechPrint India", 8, 25),
            ("SKU-POS-102", "Omnidirectional Barcode Scanner 2D", "POS Hardware", Decimal("2800.00"), Decimal("4200.00"), Decimal("18.00"), "TechPrint India", 14, 20),
            ("SKU-POS-103", "Heavy Duty Metal Cash Drawer 5-Bill", "POS Hardware", Decimal("1950.00"), Decimal("2950.00"), Decimal("18.00"), "SafeVault Hardware", 32, 15),
            ("SKU-POS-104", "Wireless Handheld Barcode Reader", "POS Hardware", Decimal("1650.00"), Decimal("2550.00"), Decimal("18.00"), "TechPrint India", 6, 20),
            ("SKU-POS-105", "Customer Display Dual Screen 10-inch", "POS Hardware", Decimal("4500.00"), Decimal("6800.00"), Decimal("18.00"), "DisplayTech Ltd", 18, 10),
            ("SKU-PKG-201", "Thermal Paper Roll 80x75mm (Pack of 50)", "Packaging & Supplies", Decimal("850.00"), Decimal("1350.00"), Decimal("12.00"), "Gujarat Paper Mills", 120, 40),
            ("SKU-PKG-202", "Corrugated Boxes 12x10x8 inch (100 pcs)", "Packaging & Supplies", Decimal("1400.00"), Decimal("2200.00"), Decimal("12.00"), "PackWell Corrugators", 85, 30),
            ("SKU-PKG-203", "Air Bubble Wrap Roll 100m x 1m", "Packaging & Supplies", Decimal("620.00"), Decimal("990.00"), Decimal("12.00"), "PackWell Corrugators", 45, 25),
            ("SKU-PKG-204", "Heavy Duty BOPP Packaging Tape 65m (72 rolls)", "Packaging & Supplies", Decimal("1100.00"), Decimal("1750.00"), Decimal("18.00"), "Adhesive Pro Industries", 90, 35),
            ("SKU-PKG-205", "Security Tamper-Proof Courier Bags (500 pcs)", "Packaging & Supplies", Decimal("950.00"), Decimal("1500.00"), Decimal("18.00"), "ShieldPack Solutions", 110, 30),
            ("SKU-PKG-206", "Direct Thermal Shipping Labels 4x6 (1000 labels)", "Packaging & Supplies", Decimal("420.00"), Decimal("690.00"), Decimal("12.00"), "Gujarat Paper Mills", 160, 50),
            ("SKU-NET-301", "Enterprise Dual-Band Gigabit Router", "Networking & IT", Decimal("3800.00"), Decimal("5600.00"), Decimal("18.00"), "NetLink Devices", 22, 12),
            ("SKU-NET-302", "16-Port Gigabit Unmanaged Switch", "Networking & IT", Decimal("2400.00"), Decimal("3600.00"), Decimal("18.00"), "NetLink Devices", 15, 10),
            ("SKU-NET-303", "CAT6 UTP Network Cable 305m Drum", "Networking & IT", Decimal("4800.00"), Decimal("7200.00"), Decimal("18.00"), "CableTech Cables", 11, 8),
            ("SKU-DIS-401", "Acrylic Countertop Display Stand A4", "Retail Display", Decimal("180.00"), Decimal("350.00"), Decimal("18.00"), "Creative Displays", 95, 30),
            ("SKU-DIS-402", "Modular Gondola Shelf Extension 3ft", "Retail Display", Decimal("2200.00"), Decimal("3400.00"), Decimal("18.00"), "SteelCraft Racks", 19, 10),
            ("SKU-DIS-403", "Price Tag Labeling Gun + 5000 Labels", "Retail Display", Decimal("350.00"), Decimal("650.00"), Decimal("18.00"), "TagMaster Tools", 48, 15),
            ("SKU-SAF-501", "Electronic Digital Safe Locker 25L", "Security & Vault", Decimal("4200.00"), Decimal("6400.00"), Decimal("18.00"), "SafeVault Hardware", 12, 8),
            ("SKU-SAF-502", "Standalone 4-Camera CCTV Security Kit", "Security & Vault", Decimal("6800.00"), Decimal("9900.00"), Decimal("18.00"), "SecureVision Systems", 9, 8),
            ("SKU-WGH-601", "Digital Commercial Weighing Scale 30kg", "Weighing Scales", Decimal("2100.00"), Decimal("3300.00"), Decimal("18.00"), "Eagle Scales Corp", 28, 12),
            ("SKU-WGH-602", "Platform Heavy Duty Weighing Scale 150kg", "Weighing Scales", Decimal("4600.00"), Decimal("6900.00"), Decimal("18.00"), "Eagle Scales Corp", 7, 10),
            ("SKU-OFF-701", "Heavy Duty Desktop Paper Shredder Cross-Cut", "Office Equipment", Decimal("3100.00"), Decimal("4700.00"), Decimal("18.00"), "OfficeMate Equipments", 16, 8),
            ("SKU-OFF-702", "Electronic Currency Note Counter with UV/MG", "Office Equipment", Decimal("5200.00"), Decimal("7800.00"), Decimal("18.00"), "CashGuard Machines", 10, 6),
            ("SKU-OFF-703", "Wireless Bluetooth Barcode Scanner Pocket", "POS Hardware", Decimal("1850.00"), Decimal("2850.00"), Decimal("18.00"), "TechPrint India", 5, 15),
            ("SKU-STA-801", "Premium A4 Copier Paper 75 GSM (Carton 5 Reams)", "Stationery", Decimal("1050.00"), Decimal("1550.00"), Decimal("12.00"), "ITC Paperboards", 75, 25),
        ]

        products = []
        inventories = []
        for sku, name, cat, cost, sell, tax, supp, qty, reorder in catalog:
            prod = Product(
                company_id=CO_NOVA_ID,
                sku=sku,
                name=name,
                category=cat,
                description=f"Commercial grade {name.lower()} suitable for retail stores, supermarkets and warehousing.",
                cost_price=cost,
                selling_price=sell,
                tax_rate=tax,
                supplier=supp,
                is_active=True
            )
            products.append(prod)
            db.add(prod)
            db.flush()

            inv = Inventory(
                company_id=CO_NOVA_ID,
                product_id=prod.id,
                quantity=Decimal(str(qty)),
                reorder_level=Decimal(str(reorder)),
                warehouse_location=random.choice(["Ahmedabad Central Hub - Bay A", "Ahmedabad Central Hub - Bay B", "Bhiwandi Hub - Section 3", "Surat Regional Depot"]),
                last_restocked_at=datetime.now(timezone.utc) - timedelta(days=random.randint(2, 20))
            )
            inventories.append(inv)

        db.add_all(inventories)
        db.flush()
        print(f"  OK {len(products)} Products & Inventories seeded (5 items flagged with low stock below reorder).")

        # OK 6. SALES & SALE ITEMS OK
        print("  Generating 140 realistic sales spanning past 90 days...")
        now = datetime.now(timezone.utc)
        payment_methods = ["upi", "upi", "card", "bank_transfer", "cash"]
        sales = []
        sale_items = []
        customer_spend = {c.id: Decimal("0.00") for c in customers}

        for i in range(1, 141):
            days_ago = random.randint(0, 89)
            # More sales in recent weeks to simulate positive business momentum
            if random.random() < 0.6:
                days_ago = random.randint(0, 30)
            
            sale_date = now - timedelta(days=days_ago, hours=random.randint(1, 10), minutes=random.randint(1, 55))
            cust = random.choice(customers) if random.random() < 0.85 else None
            
            # Select 1 to 4 products
            num_items = random.randint(1, 4)
            chosen_prods = random.sample(products, num_items)

            subtotal = Decimal("0.00")
            tax_amount = Decimal("0.00")
            discount_amount = Decimal("0.00")
            sale_item_drafts = []

            for p in chosen_prods:
                qty = Decimal(str(random.randint(1, 6)))
                unit_price = p.selling_price
                line_subtotal = qty * unit_price
                disc = Decimal("0.00")
                if random.random() < 0.25:  # 25% chance of promo discount
                    disc = (line_subtotal * Decimal("0.05")).quantize(Decimal("0.01"))
                taxable = line_subtotal - disc
                tax = (taxable * (p.tax_rate / Decimal("100.00"))).quantize(Decimal("0.01"))
                line_total = taxable + tax

                subtotal += line_subtotal
                discount_amount += disc
                tax_amount += tax

                sale_item_drafts.append((p.id, qty, unit_price, disc, tax, line_total))

            total_amount = subtotal - discount_amount + tax_amount

            sale = Sale(
                company_id=CO_NOVA_ID,
                customer_id=cust.id if cust else None,
                invoice_number=f"INV-2025-{i:04d}",
                sale_date=sale_date,
                subtotal=subtotal,
                tax_amount=tax_amount,
                discount_amount=discount_amount,
                total_amount=total_amount,
                payment_method=random.choice(payment_methods),
                status="completed" if random.random() > 0.04 else "pending"
            )
            sales.append(sale)
            db.add(sale)
            db.flush()

            if cust and sale.status == "completed":
                customer_spend[cust.id] += total_amount

            for pid, qty, uprice, disc, tax, ltot in sale_item_drafts:
                si = SaleItem(
                    sale_id=sale.id,
                    product_id=pid,
                    quantity=qty,
                    unit_price=uprice,
                    discount=disc,
                    tax=tax,
                    total_amount=ltot
                )
                sale_items.append(si)

        db.add_all(sale_items)
        db.flush()

        # Update customer cumulative purchase figures
        for cust in customers:
            if customer_spend[cust.id] > Decimal("0.00"):
                cust.total_purchases = customer_spend[cust.id]
                cust.last_purchase_date = now - timedelta(days=random.randint(1, 45))
        db.flush()
        print(f"  OK {len(sales)} Sales & {len(sale_items)} SaleItems seeded. Customer totals synchronized.")

        # OK 7. EXPENSES OK
        print("  Generating realistic operating expenses...")
        expense_templates = [
            ("salaries", "Monthly Staff Salaries & Payroll Disbursal", Decimal("480000.00"), 30),
            ("salaries", "Monthly Staff Salaries & Payroll Disbursal", Decimal("485000.00"), 60),
            ("salaries", "Monthly Staff Salaries & Payroll Disbursal", Decimal("475000.00"), 90),
            ("rent", "Office & Central Warehouse Lease - Titanium City", Decimal("85000.00"), 28),
            ("rent", "Office & Central Warehouse Lease - Titanium City", Decimal("85000.00"), 58),
            ("rent", "Office & Central Warehouse Lease - Titanium City", Decimal("85000.00"), 88),
            ("utilities", "Torrent Power Commercial Electricity Bill", Decimal("18450.00"), 15),
            ("utilities", "Torrent Power Commercial Electricity Bill", Decimal("19200.00"), 45),
            ("utilities", "Torrent Power Commercial Electricity Bill", Decimal("17800.00"), 75),
            ("marketing", "Google Ads & Meta Regional SME Campaign", Decimal("32000.00"), 12),
            ("marketing", "Print Flyers & B2B Trade Directory Listing", Decimal("14500.00"), 25),
            ("marketing", "Google Ads Campaign - Gujarat SME Reach", Decimal("28500.00"), 42),
            ("marketing", "B2B Expo Stall Advance Registration", Decimal("45000.00"), 65),
            ("transportation", "BluePeak Logistics Inter-City Cargo Delivery", Decimal("24800.00"), 8),
            ("transportation", "Delhivery Surface Freight Dispatches", Decimal("19400.00"), 22),
            ("transportation", "Local Tempo & Courier Charges", Decimal("8200.00"), 35),
            ("technology", "AWS Cloud Infrastructure & Database Hosting", Decimal("16500.00"), 14),
            ("technology", "Tally Cloud Multi-User License Renewal", Decimal("12400.00"), 40),
            ("technology", "Jio Fiber Commercial Dedicated Internet", Decimal("4999.00"), 10),
            ("maintenance", "Air Conditioning & Generator Maintenance", Decimal("8500.00"), 18),
            ("maintenance", "Warehouse Forklift & Pallet Jack Servicing", Decimal("12000.00"), 52),
            ("taxes", "GST Output Reconciliation Fee & Filing", Decimal("7500.00"), 20),
            ("other", "Staff Welfare, Pantry & Drinking Water", Decimal("6200.00"), 11),
            ("other", "Office Stationery & Printing Supplies", Decimal("4300.00"), 29),
        ]

        expenses = []
        for cat, desc, amt, days_ago in expense_templates:
            exp_date = (now - timedelta(days=days_ago)).date()
            expenses.append(Expense(
                company_id=CO_NOVA_ID,
                category=cat,
                description=desc,
                amount=amt,
                expense_date=exp_date,
                payment_method="bank_transfer" if amt > Decimal("20000.00") else "upi",
                vendor="Regional Vendors Ltd",
                status="paid"
            ))

        # Add 30 additional procedural operational expenses
        categories = ["utilities", "transportation", "technology", "maintenance", "other", "marketing"]
        for j in range(1, 31):
            cat = random.choice(categories)
            amt = Decimal(str(random.randint(15, 350) * 100))
            d_ago = random.randint(2, 88)
            expenses.append(Expense(
                company_id=CO_NOVA_ID,
                category=cat,
                description=f"Operational {cat} disbursal #{j:02d}",
                amount=amt,
                expense_date=(now - timedelta(days=d_ago)).date(),
                payment_method=random.choice(["upi", "bank_transfer", "card"]),
                vendor="Gujarat SME Services",
                status="paid"
            ))

        db.add_all(expenses)
        db.flush()
        print(f"  OK {len(expenses)} Expenses seeded.")

        # OK 8. BUSINESS METRICS OK
        metrics = []
        metric_types = [
            ("daily_revenue", Decimal("38500.00"), "sales"),
            ("average_order_value", Decimal("4850.00"), "sales"),
            ("gross_margin_pct", Decimal("34.50"), "profitability"),
            ("net_profit_margin_pct", Decimal("18.20"), "profitability"),
            ("inventory_turnover_ratio", Decimal("4.20"), "inventory"),
            ("customer_retention_rate", Decimal("92.50"), "customers"),
            ("active_client_count", Decimal("48.00"), "customers"),
            ("monthly_burn_rate", Decimal("620000.00"), "finance"),
        ]
        for mname, mval, cat in metric_types:
            for d in [1, 7, 14, 30]:
                mdate = (now - timedelta(days=d)).date()
                variance = Decimal(str(round(random.uniform(-0.08, 0.12), 4)))
                val = (mval * (Decimal("1.00") + variance)).quantize(Decimal("0.01"))
                metrics.append(BusinessMetric(
                    company_id=CO_NOVA_ID,
                    metric_name=mname,
                    metric_value=val,
                    metric_date=mdate,
                    category=cat,
                    metadata_={"source": "automated_analytics", "period": f"{d}d_lag"}
                ))
        db.add_all(metrics)
        db.flush()
        print(f"  OK {len(metrics)} Business Metrics seeded.")

        # OK 9. REPORTS OK
        reports = [
            Report(
                company_id=CO_NOVA_ID,
                name="Q1 Financial & Operational Health Report",
                report_type="financial_summary",
                description="Comprehensive audit of revenue, operating costs, gross margins and EBITDA.",
                status="completed",
                parameters={"period": "Q1-FY25", "currency": "INR", "include_tax": True},
                completed_at=now - timedelta(days=5),
            ),
            Report(
                company_id=CO_NOVA_ID,
                name="Inventory Turnover & Critical Stock Alert",
                report_type="inventory_valuation",
                description="Analysis of fast-moving versus stagnant inventory lines across all regional warehouses.",
                status="completed",
                parameters={"location": "all", "threshold_days": 30},
                completed_at=now - timedelta(days=2),
            ),
            Report(
                company_id=CO_NOVA_ID,
                name="Monthly GST GSTR-3B Tax Reconciliation",
                report_type="tax_audit",
                description="Reconciled input tax credit against output GST liability for preceding tax period.",
                status="completed",
                parameters={"tax_month": "August-2025", "jurisdiction": "Gujarat"},
                completed_at=now - timedelta(days=12),
            ),
        ]
        db.add_all(reports)
        db.flush()
        print(f"  OK {len(reports)} Reports seeded.")

        # OK 10. AI INSIGHTS & RECOMMENDATIONS OK
        insights_data = [
            (
                "Significant Revenue Growth in Western Region Hub",
                "Monthly revenue grew 16.4% to OK24.8L, driven primarily by retail reorders in Mumbai and Pune hubs.",
                "Detailed transactional analysis reveals Average Order Value increased from OK4,100 to OK5,400 with retail partners restocking ahead of the seasonal peak. Sales concentration is strongest in POS hardware lines.",
                "revenue",
                "info",
                Decimal("94.50"),
                now - timedelta(days=30),
                now,
                "Pre-allocate 20% additional buffer inventory in Bhiwandi and confirm logistics transit schedules with BluePeak Logistics.",
                "high"
            ),
            (
                "Critical Stockout Warning for POS Thermal Printers",
                "POS Thermal Receipt Printers have fallen to 8 units (reorder threshold: 25 units) with lead time of 10 days.",
                "Current sales velocity is averaging 3.2 units per day. At the current consumption rate, warehouse stock will be fully exhausted within 2.5 business days, risking OK48,000 in unfulfilled orders.",
                "inventory",
                "critical",
                Decimal("96.00"),
                now - timedelta(days=14),
                now,
                "Dispatch immediate purchase order for 40 units to TechPrint India with expedited road freight courier.",
                "critical"
            ),
            (
                "Marketing Spend Increased 21% with Deferred Sales Impact",
                "Marketing outlays rose to OK45,000 this month, representing a 21.3% increase relative to preceding 30-day baseline.",
                "Paid search acquisition for SME hardware generated top-of-funnel inquiries with a 14-day sales conversion cycle. Initial customer acquisition cost (CAC) rose temporarily to OK1,450.",
                "expenses",
                "medium",
                Decimal("88.20"),
                now - timedelta(days=30),
                now,
                "Consolidate marketing spend toward high-converting Gujarat regional trade directories and pause broad generic search keywords.",
                "medium"
            ),
            (
                "Top Enterprise Accounts Generating 41% of Total Volume",
                "Sales concentration in top 4 enterprise accounts (Shree Balaji, Surat Diamond Tools, Vadodara Mega) accounts for 41.2% of revenue.",
                "While customer lifetime value is exceptionally strong, account concentration exposes receivables to working capital friction if payment cycles stretch past 30 days.",
                "customers",
                "medium",
                Decimal("91.00"),
                now - timedelta(days=60),
                now,
                "Introduce 1.5% early-settlement incentive for payments remitted within 10 days to stabilize cash flow.",
                "high"
            ),
        ]

        insights = []
        recommendations = []
        for title, summary, analysis, cat, sev, conf, pstart, pend, rec_title, rec_pri in insights_data:
            insight = AIInsight(
                company_id=CO_NOVA_ID,
                title=title,
                summary=summary,
                detailed_analysis=analysis,
                category=cat,
                severity=sev,
                confidence_score=conf,
                data_period_start=pstart.date(),
                data_period_end=pend.date(),
                is_read=False
            )
            insights.append(insight)
            db.add(insight)
            db.flush()

            rec = AIRecommendation(
                company_id=CO_NOVA_ID,
                insight_id=insight.id,
                title=rec_title,
                description=f"Actionable advisory associated with '{title}'. Execute to maintain target margins.",
                priority=rec_pri,
                status="pending",
                expected_impact="Estimated margin protection / cost savings of OK35,000 - OK65,000."
            )
            recommendations.append(rec)

        db.add_all(recommendations)
        db.flush()
        print(f"  OK {len(insights)} AI Insights & {len(recommendations)} AI Recommendations seeded.")

        db.commit()
        print("OK SUCCESS: Development seed completed cleanly and committed to PostgreSQL!")

    except Exception as e:
        db.rollback()
        print(f"OK Error during database seed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    run_seed()
