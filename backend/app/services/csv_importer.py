import copy
import csv
import hashlib
import io
import re
import threading
import time
import uuid
from datetime import datetime, date, timezone
from decimal import Decimal, InvalidOperation
from typing import List, Dict, Any, Optional, Tuple, Set, Union

from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.customer import Customer
from app.models.product import Product
from app.models.inventory import Inventory
from app.models.sale import Sale
from app.models.sale_item import SaleItem
from app.models.expense import Expense
from app.services.insights import InsightService


# ─── TEMPLATES AND DOCUMENTED SCHEMAS ─────────────────────────────

CATEGORY_CONFIGS = {
    "customers": {
        "title": "Customers",
        "description": "Enterprise and retail customer directory with contact information and tiering.",
        "headers": ["name", "email", "phone", "city", "state", "pincode", "address", "segment"],
        "required_headers": ["name"],
        "sample_rows": [
            {
                "name": "Apex Industrial Supplies",
                "email": "procurement@apexind.in",
                "phone": "+91 98200 12345",
                "city": "Mumbai",
                "state": "Maharashtra",
                "pincode": "400001",
                "address": "Unit 402, Nariman Point",
                "segment": "enterprise"
            },
            {
                "name": "Bharat Electronics & Retail",
                "email": "accounts@bharatretail.com",
                "phone": "+91 98111 67890",
                "city": "Bengaluru",
                "state": "Karnataka",
                "pincode": "560001",
                "address": "88 MG Road",
                "segment": "mid_market"
            }
        ]
    },
    "products": {
        "title": "Products and Inventory",
        "description": "Product catalog and initial warehouse stock allocation.",
        "headers": [
            "sku", "name", "category", "cost_price", "selling_price",
            "tax_rate", "unit", "initial_stock", "reorder_level",
            "warehouse_location", "supplier", "description"
        ],
        "required_headers": ["sku", "name", "cost_price", "selling_price"],
        "sample_rows": [
            {
                "sku": "POS-TERM-X1",
                "name": "Smart POS Terminal X1",
                "category": "POS Hardware",
                "cost_price": "14500.00",
                "selling_price": "22000.00",
                "tax_rate": "18.0",
                "unit": "pcs",
                "initial_stock": "50",
                "reorder_level": "10",
                "warehouse_location": "Bhiwandi Hub A1",
                "supplier": "PayTech Electronics Ltd",
                "description": "High-performance handheld Android POS terminal with thermal printer"
            },
            {
                "sku": "RFID-SCAN-PRO",
                "name": "Industrial RFID Scanner Pro",
                "category": "Logistics Hardware",
                "cost_price": "8500.00",
                "selling_price": "14000.00",
                "tax_rate": "18.0",
                "unit": "pcs",
                "initial_stock": "35",
                "reorder_level": "8",
                "warehouse_location": "Pune Depot B3",
                "supplier": "OptiScan Solutions",
                "description": "Long-range rugged handheld wireless barcode and RFID reader"
            }
        ]
    },
    "sales": {
        "title": "Sales Transactions",
        "description": "Customer invoices, multi-item commercial orders, and settlement records.",
        "headers": [
            "invoice_number", "sale_date", "customer", "sku",
            "quantity", "unit_price", "discount", "tax",
            "payment_method", "status", "notes"
        ],
        "required_headers": ["invoice_number", "sku", "quantity"],
        "sample_rows": [
            {
                "invoice_number": "INV-2026-0801",
                "sale_date": "2026-11-20",
                "customer": "Apex Industrial Supplies",
                "sku": "POS-TERM-X1",
                "quantity": "2",
                "unit_price": "22000.00",
                "discount": "1000.00",
                "tax": "7740.00",
                "payment_method": "bank_transfer",
                "status": "completed",
                "notes": "Annual corporate hardware refresh order"
            },
            {
                "invoice_number": "INV-2026-0802",
                "sale_date": "2026-11-21",
                "customer": "Bharat Electronics & Retail",
                "sku": "RFID-SCAN-PRO",
                "quantity": "4",
                "unit_price": "14000.00",
                "discount": "0.00",
                "tax": "10080.00",
                "payment_method": "upi",
                "status": "completed",
                "notes": "Retail expansion batch dispatch"
            }
        ]
    },
    "expenses": {
        "title": "Operating Expenses",
        "description": "Corporate operational expenditures, logistics, salaries, and utility outlays.",
        "headers": [
            "expense_date", "category", "description", "amount",
            "payment_method", "vendor", "status", "notes"
        ],
        "required_headers": ["expense_date", "category", "description", "amount"],
        "sample_rows": [
            {
                "expense_date": "2026-11-15",
                "category": "Cloud & Infrastructure",
                "description": "Primary AWS VPC & RDS PostgreSQL Hosting",
                "amount": "45000.00",
                "payment_method": "card",
                "vendor": "Amazon Web Services India",
                "status": "paid",
                "notes": "Monthly production compute and database cluster bill"
            },
            {
                "expense_date": "2026-11-18",
                "category": "Logistics & Freight",
                "description": "Inter-state freight transfer to Western Distribution Hub",
                "amount": "28500.00",
                "payment_method": "bank_transfer",
                "vendor": "BluePeak Logistics Express",
                "status": "paid",
                "notes": "Batch transit shipping manifest 88921"
            }
        ]
    }
}


HEADER_ALIASES = {
    "customer_name": "customer",
    "client": "customer",
    "client_name": "customer",
    "customer_email": "customer",
    "invoice": "invoice_number",
    "inv_number": "invoice_number",
    "inv_no": "invoice_number",
    "invoiceno": "invoice_number",
    "bill_no": "invoice_number",
    "product_sku": "sku",
    "product": "sku",
    "item_sku": "sku",
    "qty": "quantity",
    "rate": "unit_price",
    "price": "unit_price",
    "unitprice": "unit_price",
    "sellingprice": "selling_price",
    "costprice": "cost_price",
    "stock": "initial_stock",
    "initialstock": "initial_stock",
    "qty_on_hand": "initial_stock",
    "reorderlevel": "reorder_level",
    "min_stock": "reorder_level",
    "exp_date": "expense_date",
    "date": "sale_date",
    "saledate": "sale_date",
    "expensedate": "expense_date",
    "desc": "description",
    "amt": "amount",
    "total": "amount",
    "method": "payment_method",
    "paymentmethod": "payment_method",
    "pay_method": "payment_method",
    "location": "warehouse_location",
}


def normalize_header(header: str) -> str:
    cleaned = re.sub(r'[^a-zA-Z0-9_]', '_', header.strip().lower())
    cleaned = re.sub(r'_+', '_', cleaned).strip('_')
    return HEADER_ALIASES.get(cleaned, cleaned)


def parse_date_safely(val: Any) -> Optional[datetime]:
    if not val:
        return None
    val_str = str(val).strip()
    if not val_str:
        return None

    # Common date formats in Indian and international business CSVs
    formats = [
        "%Y-%m-%d",
        "%d/%m/%Y",
        "%m/%d/%Y",
        "%d-%m-%Y",
        "%Y/%m/%d",
        "%Y-%m-%dT%H:%M:%S",
        "%Y-%m-%dT%H:%M:%S%z",
        "%Y-%m-%d %H:%M:%S",
        "%d %b %Y",
        "%d %B %Y",
    ]
    for fmt in formats:
        try:
            dt = datetime.strptime(val_str, fmt)
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            return dt
        except ValueError:
            continue
    # Try ISO fromisoformat fallback
    try:
        dt = datetime.fromisoformat(val_str.replace("Z", "+00:00"))
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt
    except Exception:
        return None


def parse_decimal_safely(val: Any, default: Optional[Decimal] = None) -> Optional[Decimal]:
    if val is None:
        return default
    val_str = str(val).strip()
    if not val_str:
        return default
    # Clean currency symbols, commas, spaces
    val_str = re.sub(r'[₹$,\s]', '', val_str)
    try:
        dec = Decimal(val_str)
        if dec.is_nan() or dec.is_infinite():
            return None
        return dec
    except (InvalidOperation, TypeError):
        return None


class CSVImportService:
    MAX_ROWS = 5000
    MAX_FILE_BYTES = 10 * 1024 * 1024  # 10 MB
    VALIDATION_CACHE_TTL_SECONDS = 15 * 60  # 15 minutes
    MAX_VALIDATION_CACHE_ENTRIES = 128
    _validation_cache: Dict[Tuple[str, str, str, str], Tuple[float, Dict[str, Any]]] = {}
    _validation_cache_lock = threading.Lock()

    @staticmethod
    def _now() -> float:
        return time.monotonic()

    @classmethod
    def clear_validation_cache(cls, company_id: Optional[uuid.UUID] = None) -> None:
        """Clear validation cache entries (optionally scoped to a single company)."""
        with cls._validation_cache_lock:
            if company_id is None:
                cls._validation_cache.clear()
            else:
                cid = str(company_id)
                keys = [k for k in cls._validation_cache if k[0] == cid]
                for k in keys:
                    del cls._validation_cache[k]

    @classmethod
    def _purge_expired_cache_locked(cls, now: float) -> None:
        expired = [
            k for k, (ts, _) in cls._validation_cache.items()
            if now - ts >= cls.VALIDATION_CACHE_TTL_SECONDS
        ]
        for k in expired:
            del cls._validation_cache[k]

    @classmethod
    def get_template_csv(cls, category: str) -> str:
        cat = category.lower().strip()
        if cat not in CATEGORY_CONFIGS:
            raise ValueError(f"Unknown category '{category}'. Supported: {list(CATEGORY_CONFIGS.keys())}")

        config = CATEGORY_CONFIGS[cat]
        output = io.StringIO()
        writer = csv.DictWriter(output, fieldnames=config["headers"], lineterminator="\n")
        writer.writeheader()
        for row in config["sample_rows"]:
            writer.writerow(row)
        return output.getvalue()

    @classmethod
    def parse_raw_csv(cls, file_input: Union[bytes, str]) -> Tuple[List[str], List[Dict[str, str]]]:
        if not file_input:
            raise ValueError("The uploaded CSV file is empty (0 bytes).")

        if isinstance(file_input, bytes):
            if len(file_input) > cls.MAX_FILE_BYTES:
                raise ValueError(f"File size exceeds maximum allowable limit of {cls.MAX_FILE_BYTES // (1024 * 1024)} MB.")
            text = ""
            for encoding in ["utf-8-sig", "utf-8", "latin1", "cp1252"]:
                try:
                    text = file_input.decode(encoding)
                    break
                except UnicodeDecodeError:
                    continue
            if not text:
                raise ValueError("Unable to decode CSV file. Please ensure the file is encoded in UTF-8 format.")
        else:
            text = file_input

        reader = csv.reader(io.StringIO(text))
        try:
            raw_header = next(reader)
        except StopIteration:
            raise ValueError("CSV file is empty or contains no readable rows.")

        normalized_headers = [normalize_header(h) for h in raw_header]
        if not any(normalized_headers):
            raise ValueError("No valid column headers found in CSV file.")

        rows: List[Dict[str, str]] = []
        for row_idx, row in enumerate(reader, start=2):
            if not row or all(not cell.strip() for cell in row):
                continue  # skip blank lines
            row_dict = {}
            for i, header in enumerate(normalized_headers):
                if header:
                    val = row[i].strip() if i < len(row) else ""
                    row_dict[header] = val
            rows.append(row_dict)

            if len(rows) > cls.MAX_ROWS:
                raise ValueError(f"Row count exceeds maximum limit of {cls.MAX_ROWS} rows per import batch.")

        if not rows:
            raise ValueError("No data rows found in CSV file (only headers present).")

        return normalized_headers, rows

    @classmethod
    def validate_file(
        cls,
        db: Session,
        company_id: uuid.UUID,
        category: str,
        file_input: Union[bytes, str],
        filename: str
    ) -> Dict[str, Any]:
        cat = category.lower().strip()
        if cat not in CATEGORY_CONFIGS:
            raise ValueError(f"Unknown import category '{category}'. Supported: {list(CATEGORY_CONFIGS.keys())}")

        raw_bytes = file_input if isinstance(file_input, bytes) else (file_input or "").encode("utf-8", errors="replace")
        content_hash = hashlib.sha256(raw_bytes).hexdigest()
        cache_key = (str(company_id), cat, content_hash, filename)

        now = cls._now()
        with cls._validation_cache_lock:
            cls._purge_expired_cache_locked(now)
            cached = cls._validation_cache.get(cache_key)
            if cached is not None:
                return copy.deepcopy(cached[1])

        config = CATEGORY_CONFIGS[cat]
        headers, rows = cls.parse_raw_csv(file_input)

        # 1. Check required headers
        missing_headers = [req for req in config["required_headers"] if req not in headers]
        if missing_headers:
            raise ValueError(f"Missing mandatory column headers for {config['title']}: {', '.join(missing_headers)}")

        # 2. Category-specific row-by-row validation
        if cat == "customers":
            result = cls._validate_customers(db, company_id, headers, rows, filename)
        elif cat == "products":
            result = cls._validate_products(db, company_id, headers, rows, filename)
        elif cat == "sales":
            result = cls._validate_sales(db, company_id, headers, rows, filename)
        elif cat == "expenses":
            result = cls._validate_expenses(db, company_id, headers, rows, filename)
        else:
            raise ValueError(f"Unknown import category '{category}'. Supported: {list(CATEGORY_CONFIGS.keys())}")

        store_now = cls._now()
        with cls._validation_cache_lock:
            cls._purge_expired_cache_locked(store_now)
            if len(cls._validation_cache) >= cls.MAX_VALIDATION_CACHE_ENTRIES:
                oldest_key = min(cls._validation_cache.items(), key=lambda item: item[1][0])[0]
                del cls._validation_cache[oldest_key]
            cls._validation_cache[cache_key] = (store_now, copy.deepcopy(result))

        return result

    # ─── VALIDATION LOGIC FOR CUSTOMERS ─────────────────────────
    @classmethod
    def _validate_customers(
        cls, db: Session, company_id: uuid.UUID, headers: List[str], rows: List[Dict[str, str]], filename: str
    ) -> Dict[str, Any]:
        existing_customers = db.query(Customer).filter(Customer.company_id == company_id).all()
        existing_names = {c.name.strip().lower() for c in existing_customers if c.name}
        existing_emails = {c.email.strip().lower() for c in existing_customers if c.email}

        seen_names: Set[str] = set()
        seen_emails: Set[str] = set()

        valid_rows: List[Dict[str, Any]] = []
        errors: List[Dict[str, Any]] = []

        for idx, r in enumerate(rows, start=2):
            row_errors = []
            name = r.get("name", "").strip()
            email = r.get("email", "").strip() or None
            phone = r.get("phone", "").strip() or None
            city = r.get("city", "").strip() or None
            state = r.get("state", "").strip() or None
            pincode = r.get("pincode", "").strip() or None
            address = r.get("address", "").strip() or None
            segment = (r.get("segment", "").strip().lower()) or "standard"

            if not name:
                row_errors.append({"field": "name", "message": "Customer name is required."})
            elif len(name) > 255:
                row_errors.append({"field": "name", "message": "Name exceeds 255 characters."})

            if email:
                if len(email) > 255:
                    row_errors.append({"field": "email", "message": "Email exceeds 255 characters."})
                elif not re.match(r"[^@]+@[^@]+\.[^@]+", email):
                    row_errors.append({"field": "email", "message": f"Invalid email format: '{email}'."})
                elif email.lower() in seen_emails:
                    row_errors.append({"field": "email", "message": f"Duplicate email '{email}' in uploaded file."})
                elif email.lower() in existing_emails:
                    row_errors.append({"field": "email", "message": f"Customer email '{email}' already exists in company records."})

            if name and name.lower() in seen_names:
                row_errors.append({"field": "name", "message": f"Duplicate customer name '{name}' in uploaded file."})
            elif name and name.lower() in existing_names:
                row_errors.append({"field": "name", "message": f"Customer '{name}' already exists in company records."})

            if row_errors:
                for err in row_errors:
                    errors.append({
                        "row": idx,
                        "field": err["field"],
                        "message": err["message"],
                        "data": r
                    })
            else:
                if name:
                    seen_names.add(name.lower())
                if email:
                    seen_emails.add(email.lower())
                valid_rows.append({
                    "row_index": idx,
                    "name": name,
                    "email": email,
                    "phone": phone,
                    "city": city,
                    "state": state,
                    "pincode": pincode,
                    "address": address,
                    "segment": segment,
                    "raw": r
                })

        return cls._build_validation_response(
            category="customers",
            filename=filename,
            headers=headers,
            total_rows=len(rows),
            valid_rows=valid_rows,
            errors=errors,
            preview_rows=rows[:10]
        )

    # ─── VALIDATION LOGIC FOR PRODUCTS & INVENTORY ───────────────
    @classmethod
    def _validate_products(
        cls, db: Session, company_id: uuid.UUID, headers: List[str], rows: List[Dict[str, str]], filename: str
    ) -> Dict[str, Any]:
        existing_products = db.query(Product).filter(Product.company_id == company_id).all()
        existing_skus = {p.sku.strip().lower() for p in existing_products if p.sku}

        seen_skus: Set[str] = set()
        valid_rows: List[Dict[str, Any]] = []
        errors: List[Dict[str, Any]] = []

        for idx, r in enumerate(rows, start=2):
            row_errors = []
            sku = r.get("sku", "").strip()
            name = r.get("name", "").strip()
            category = r.get("category", "").strip() or "General"
            cost_str = r.get("cost_price", "").strip()
            sell_str = r.get("selling_price", "").strip()
            tax_str = r.get("tax_rate", "").strip()
            unit = r.get("unit", "").strip() or "pcs"
            stock_str = r.get("initial_stock", "").strip()
            reorder_str = r.get("reorder_level", "").strip()
            warehouse = r.get("warehouse_location", "").strip() or None
            supplier = r.get("supplier", "").strip() or None
            description = r.get("description", "").strip() or None

            if not sku:
                row_errors.append({"field": "sku", "message": "SKU code is mandatory."})
            elif len(sku) > 100:
                row_errors.append({"field": "sku", "message": "SKU exceeds 100 characters."})
            elif sku.lower() in seen_skus:
                row_errors.append({"field": "sku", "message": f"Duplicate SKU '{sku}' inside uploaded file."})
            elif sku.lower() in existing_skus:
                row_errors.append({"field": "sku", "message": f"SKU '{sku}' already exists in your company product catalog."})

            if not name:
                row_errors.append({"field": "name", "message": "Product name is mandatory."})
            elif len(name) > 255:
                row_errors.append({"field": "name", "message": "Name exceeds 255 characters."})

            cost_price = parse_decimal_safely(cost_str)
            if cost_price is None or cost_price < Decimal("0.00"):
                row_errors.append({"field": "cost_price", "message": f"Invalid cost price '{cost_str}'. Must be non-negative numeric."})

            selling_price = parse_decimal_safely(sell_str)
            if selling_price is None or selling_price < Decimal("0.00"):
                row_errors.append({"field": "selling_price", "message": f"Invalid selling price '{sell_str}'. Must be non-negative numeric."})

            tax_rate = parse_decimal_safely(tax_str, default=Decimal("18.00"))
            if tax_rate is None or tax_rate < Decimal("0.00") or tax_rate > Decimal("100.00"):
                row_errors.append({"field": "tax_rate", "message": f"Invalid tax rate '{tax_str}'. Must be between 0 and 100%."})

            initial_stock = parse_decimal_safely(stock_str, default=Decimal("0.00"))
            if initial_stock is None or initial_stock < Decimal("0.00"):
                row_errors.append({"field": "initial_stock", "message": f"Invalid initial stock '{stock_str}'. Must be non-negative."})

            reorder_level = parse_decimal_safely(reorder_str, default=Decimal("10.00"))
            if reorder_level is None or reorder_level < Decimal("0.00"):
                row_errors.append({"field": "reorder_level", "message": f"Invalid reorder level '{reorder_str}'. Must be non-negative."})

            if row_errors:
                for err in row_errors:
                    errors.append({
                        "row": idx,
                        "field": err["field"],
                        "message": err["message"],
                        "data": r
                    })
            else:
                seen_skus.add(sku.lower())
                valid_rows.append({
                    "row_index": idx,
                    "sku": sku,
                    "name": name,
                    "category": category,
                    "cost_price": float(cost_price),
                    "selling_price": float(selling_price),
                    "tax_rate": float(tax_rate),
                    "unit": unit,
                    "initial_stock": float(initial_stock),
                    "reorder_level": float(reorder_level),
                    "warehouse_location": warehouse,
                    "supplier": supplier,
                    "description": description,
                    "raw": r
                })

        return cls._build_validation_response(
            category="products",
            filename=filename,
            headers=headers,
            total_rows=len(rows),
            valid_rows=valid_rows,
            errors=errors,
            preview_rows=rows[:10]
        )

    # ─── VALIDATION LOGIC FOR SALES ──────────────────────────────
    @classmethod
    def _validate_sales(
        cls, db: Session, company_id: uuid.UUID, headers: List[str], rows: List[Dict[str, str]], filename: str
    ) -> Dict[str, Any]:
        # Preload catalog and customers for foreign key validation
        existing_products = {p.sku.strip().lower(): p for p in db.query(Product).filter(Product.company_id == company_id).all()}
        existing_customers_list = db.query(Customer).filter(Customer.company_id == company_id).all()
        customer_by_name = {c.name.strip().lower(): c for c in existing_customers_list if c.name}
        customer_by_email = {c.email.strip().lower(): c for c in existing_customers_list if c.email}
        customer_by_id = {str(c.id).lower(): c for c in existing_customers_list}

        existing_sales_invoices = {s.invoice_number.strip().lower() for s in db.query(Sale).filter(Sale.company_id == company_id).all()}

        valid_rows: List[Dict[str, Any]] = []
        errors: List[Dict[str, Any]] = []

        # Multi-item sales grouping: track invoices across the file
        invoice_seen: Set[str] = set()

        for idx, r in enumerate(rows, start=2):
            row_errors = []
            inv = r.get("invoice_number", "").strip()
            date_str = r.get("sale_date", "").strip()
            cust_val = r.get("customer", "").strip()
            sku = r.get("sku", "").strip()
            qty_str = r.get("quantity", "").strip()
            price_str = r.get("unit_price", "").strip()
            disc_str = r.get("discount", "").strip()
            tax_str = r.get("tax", "").strip()
            method = r.get("payment_method", "").strip().lower() or "bank_transfer"
            status = r.get("status", "").strip().lower() or "completed"
            notes = r.get("notes", "").strip() or None

            # 1. Invoice Number
            if not inv:
                row_errors.append({"field": "invoice_number", "message": "Invoice number is required."})
            elif len(inv) > 100:
                row_errors.append({"field": "invoice_number", "message": "Invoice number exceeds 100 characters."})
            elif inv.lower() in existing_sales_invoices:
                row_errors.append({"field": "invoice_number", "message": f"Invoice number '{inv}' already exists in company database."})

            # 2. Date
            sale_date = parse_date_safely(date_str) if date_str else datetime.now(timezone.utc)
            if date_str and not sale_date:
                row_errors.append({"field": "sale_date", "message": f"Unrecognized date format '{date_str}'. Expected YYYY-MM-DD or DD/MM/YYYY."})

            # 3. Product SKU FK
            matched_product = None
            if not sku:
                row_errors.append({"field": "sku", "message": "Product SKU is required."})
            elif sku.lower() not in existing_products:
                row_errors.append({"field": "sku", "message": f"Product with SKU '{sku}' does not exist in your catalog. Please import products first."})
            else:
                matched_product = existing_products[sku.lower()]

            # 4. Quantity & Pricing
            quantity = parse_decimal_safely(qty_str)
            if quantity is None or quantity <= Decimal("0.00"):
                row_errors.append({"field": "quantity", "message": f"Invalid quantity '{qty_str}'. Must be greater than 0."})

            unit_price = parse_decimal_safely(price_str)
            if unit_price is None:
                if matched_product:
                    unit_price = matched_product.selling_price
                else:
                    row_errors.append({"field": "unit_price", "message": "Unit price is missing and could not be inferred."})
            elif unit_price < Decimal("0.00"):
                row_errors.append({"field": "unit_price", "message": f"Unit price '{price_str}' cannot be negative."})

            discount = parse_decimal_safely(disc_str, default=Decimal("0.00"))
            if discount is None or discount < Decimal("0.00"):
                row_errors.append({"field": "discount", "message": f"Invalid discount '{disc_str}'."})

            tax = parse_decimal_safely(tax_str)
            if tax is None:
                if matched_product and unit_price and quantity:
                    taxable = (unit_price * quantity) - discount
                    tax = (taxable * (matched_product.tax_rate / Decimal("100.00"))).quantize(Decimal("0.01"))
                else:
                    tax = Decimal("0.00")
            elif tax < Decimal("0.00"):
                row_errors.append({"field": "tax", "message": f"Tax '{tax_str}' cannot be negative."})

            # 5. Customer FK
            matched_customer = None
            if cust_val:
                cust_lower = cust_val.lower()
                matched_customer = customer_by_id.get(cust_lower) or customer_by_email.get(cust_lower) or customer_by_name.get(cust_lower)
                if not matched_customer:
                    row_errors.append({"field": "customer", "message": f"Customer '{cust_val}' not found in company customer records."})

            # 6. Status & Payment Method
            valid_statuses = {"completed", "pending", "cancelled", "refunded"}
            if status not in valid_statuses:
                row_errors.append({"field": "status", "message": f"Invalid status '{status}'. Must be one of: {', '.join(valid_statuses)}."})

            if row_errors:
                for err in row_errors:
                    errors.append({
                        "row": idx,
                        "field": err["field"],
                        "message": err["message"],
                        "data": r
                    })
            else:
                valid_rows.append({
                    "row_index": idx,
                    "invoice_number": inv,
                    "sale_date": sale_date.isoformat(),
                    "customer_id": str(matched_customer.id) if matched_customer else None,
                    "customer_name": matched_customer.name if matched_customer else (cust_val or "Walk-in"),
                    "product_id": str(matched_product.id),
                    "product_name": matched_product.name,
                    "sku": matched_product.sku,
                    "quantity": float(quantity),
                    "unit_price": float(unit_price),
                    "discount": float(discount),
                    "tax": float(tax),
                    "payment_method": method,
                    "status": status,
                    "notes": notes,
                    "raw": r
                })

        return cls._build_validation_response(
            category="sales",
            filename=filename,
            headers=headers,
            total_rows=len(rows),
            valid_rows=valid_rows,
            errors=errors,
            preview_rows=rows[:10]
        )

    # ─── VALIDATION LOGIC FOR EXPENSES ───────────────────────────
    @classmethod
    def _validate_expenses(
        cls, db: Session, company_id: uuid.UUID, headers: List[str], rows: List[Dict[str, str]], filename: str
    ) -> Dict[str, Any]:
        valid_rows: List[Dict[str, Any]] = []
        errors: List[Dict[str, Any]] = []

        for idx, r in enumerate(rows, start=2):
            row_errors = []
            date_str = r.get("expense_date", "").strip()
            category = r.get("category", "").strip()
            description = r.get("description", "").strip()
            amt_str = r.get("amount", "").strip()
            method = r.get("payment_method", "").strip().lower() or "bank_transfer"
            vendor = r.get("vendor", "").strip() or None
            status = r.get("status", "").strip().lower() or "paid"
            notes = r.get("notes", "").strip() or None

            # 1. Date
            exp_date = parse_date_safely(date_str)
            if not date_str:
                row_errors.append({"field": "expense_date", "message": "Expense date is required."})
            elif not exp_date:
                row_errors.append({"field": "expense_date", "message": f"Invalid date '{date_str}'. Expected YYYY-MM-DD or DD/MM/YYYY."})

            # 2. Category
            if not category:
                row_errors.append({"field": "category", "message": "Expense category is required."})
            elif len(category) > 100:
                row_errors.append({"field": "category", "message": "Category exceeds 100 characters."})

            # 3. Description
            if not description:
                row_errors.append({"field": "description", "message": "Expense description is required."})

            # 4. Amount
            amount = parse_decimal_safely(amt_str)
            if amount is None or amount <= Decimal("0.00"):
                row_errors.append({"field": "amount", "message": f"Invalid amount '{amt_str}'. Must be a positive number."})

            # 5. Status
            valid_statuses = {"paid", "pending", "approved", "rejected"}
            if status not in valid_statuses:
                row_errors.append({"field": "status", "message": f"Invalid status '{status}'. Must be one of: {', '.join(valid_statuses)}."})

            if row_errors:
                for err in row_errors:
                    errors.append({
                        "row": idx,
                        "field": err["field"],
                        "message": err["message"],
                        "data": r
                    })
            else:
                valid_rows.append({
                    "row_index": idx,
                    "expense_date": exp_date.date().isoformat() if exp_date else None,
                    "category": category,
                    "description": description,
                    "amount": float(amount),
                    "payment_method": method,
                    "vendor": vendor,
                    "status": status,
                    "notes": notes,
                    "raw": r
                })

        return cls._build_validation_response(
            category="expenses",
            filename=filename,
            headers=headers,
            total_rows=len(rows),
            valid_rows=valid_rows,
            errors=errors,
            preview_rows=rows[:10]
        )

    @classmethod
    def _build_validation_response(
        cls,
        category: str,
        filename: str,
        headers: List[str],
        total_rows: int,
        valid_rows: List[Dict[str, Any]],
        errors: List[Dict[str, Any]],
        preview_rows: List[Dict[str, str]]
    ) -> Dict[str, Any]:
        unique_error_rows = len({e["row"] for e in errors})
        return {
            "category": category,
            "filename": filename,
            "headers": headers,
            "total_rows": total_rows,
            "valid_count": len(valid_rows),
            "invalid_count": unique_error_rows,
            "errors_count": len(errors),
            "is_valid": len(errors) == 0,
            "preview_rows": preview_rows,
            "errors": errors[:100],  # cap error report for payload efficiency
            "valid_records": valid_rows
        }

    # ─── DATABASE COMMIT IMPLEMENTATION ─────────────────────────
    @classmethod
    def commit_import(
        cls,
        db: Session,
        company_id: uuid.UUID,
        category: str,
        valid_records: List[Dict[str, Any]],
        mode: str = "all_or_nothing"
    ) -> Dict[str, Any]:
        cat = category.lower().strip()
        if not valid_records:
            return {
                "category": category,
                "status": "failed",
                "message": "No valid records available to commit.",
                "total_processed": 0,
                "imported": 0,
                "rejected": 0
            }

        imported_count = 0
        rejected_count = 0

        try:
            if cat == "customers":
                imported_count, rejected_count = cls._commit_customers(db, company_id, valid_records)
            elif cat == "products":
                imported_count, rejected_count = cls._commit_products(db, company_id, valid_records)
            elif cat == "sales":
                imported_count, rejected_count = cls._commit_sales(db, company_id, valid_records)
            elif cat == "expenses":
                imported_count, rejected_count = cls._commit_expenses(db, company_id, valid_records)
            else:
                raise ValueError(f"Unsupported commit category '{category}'")

            db.commit()
            cls.clear_validation_cache(company_id)

            # Refresh business insights via deterministic rule engine
            try:
                InsightService.generate_company_insights(db, company_id)
                db.commit()
            except Exception as e:
                # Insights calculation failure should not fail data commit
                pass

            return {
                "category": category,
                "status": "success",
                "message": f"Successfully imported {imported_count} records into {cat}.",
                "total_processed": len(valid_records),
                "imported": imported_count,
                "rejected": rejected_count
            }

        except Exception as e:
            db.rollback()
            raise RuntimeError(f"Database transaction aborted during {cat} import: {str(e)}")

    @classmethod
    def _commit_customers(
        cls, db: Session, company_id: uuid.UUID, records: List[Dict[str, Any]]
    ) -> Tuple[int, int]:
        imported = 0
        for rec in records:
            cust = Customer(
                company_id=company_id,
                name=rec["name"],
                email=rec["email"],
                phone=rec["phone"],
                city=rec["city"],
                state=rec["state"],
                pincode=rec["pincode"],
                address=rec["address"],
                segment=rec["segment"],
                total_purchases=Decimal("0.00"),
                is_active=True
            )
            db.add(cust)
            imported += 1
        return imported, 0

    @classmethod
    def _commit_products(
        cls, db: Session, company_id: uuid.UUID, records: List[Dict[str, Any]]
    ) -> Tuple[int, int]:
        imported = 0
        for rec in records:
            prod = Product(
                company_id=company_id,
                sku=rec["sku"],
                name=rec["name"],
                category=rec["category"],
                cost_price=Decimal(str(rec["cost_price"])),
                selling_price=Decimal(str(rec["selling_price"])),
                tax_rate=Decimal(str(rec["tax_rate"])),
                unit=rec["unit"],
                supplier=rec["supplier"],
                description=rec["description"],
                is_active=True
            )
            db.add(prod)
            db.flush()

            # Initialize Inventory record
            inv = Inventory(
                company_id=company_id,
                product_id=prod.id,
                quantity=Decimal(str(rec["initial_stock"])),
                reorder_level=Decimal(str(rec["reorder_level"])),
                warehouse_location=rec["warehouse_location"],
                last_restocked_at=datetime.now(timezone.utc) if rec["initial_stock"] > 0 else None
            )
            db.add(inv)
            imported += 1
        return imported, 0

    @classmethod
    def _commit_sales(
        cls, db: Session, company_id: uuid.UUID, records: List[Dict[str, Any]]
    ) -> Tuple[int, int]:
        # Group by invoice_number to support multi-line transactions seamlessly
        invoices: Dict[str, List[Dict[str, Any]]] = {}
        for r in records:
            inv = r["invoice_number"]
            invoices.setdefault(inv, []).append(r)

        imported_invoices = 0

        for inv_num, items in invoices.items():
            first_item = items[0]
            sale_date = datetime.fromisoformat(first_item["sale_date"])
            customer_id = uuid.UUID(first_item["customer_id"]) if first_item["customer_id"] else None

            subtotal = Decimal("0.00")
            tax_amount = Decimal("0.00")
            discount_amount = Decimal("0.00")
            sale_items = []

            for it in items:
                prod_id = uuid.UUID(it["product_id"])
                qty = Decimal(str(it["quantity"]))
                u_price = Decimal(str(it["unit_price"]))
                disc = Decimal(str(it["discount"]))
                tax_val = Decimal(str(it["tax"]))

                line_sub = qty * u_price
                line_total = (line_sub - disc) + tax_val

                subtotal += line_sub
                discount_amount += disc
                tax_amount += tax_val

                sale_items.append(SaleItem(
                    product_id=prod_id,
                    quantity=qty,
                    unit_price=u_price,
                    discount=disc,
                    tax=tax_val,
                    total_amount=line_total
                ))

                # Decrement inventory for completed transactions
                if first_item["status"] == "completed":
                    inv = db.query(Inventory).filter(
                        Inventory.company_id == company_id,
                        Inventory.product_id == prod_id
                    ).first()
                    if inv:
                        inv.quantity = max(Decimal("0.00"), inv.quantity - qty)

            total_amount = subtotal - discount_amount + tax_amount

            sale = Sale(
                company_id=company_id,
                customer_id=customer_id,
                invoice_number=inv_num,
                sale_date=sale_date,
                subtotal=subtotal,
                tax_amount=tax_amount,
                discount_amount=discount_amount,
                total_amount=total_amount,
                payment_method=first_item["payment_method"],
                status=first_item["status"],
                notes=first_item["notes"],
                items=sale_items
            )
            db.add(sale)

            # Update customer total purchases
            if customer_id and first_item["status"] == "completed":
                cust = db.query(Customer).filter(
                    Customer.id == customer_id,
                    Customer.company_id == company_id
                ).first()
                if cust:
                    cust.total_purchases += total_amount
                    cust.last_purchase_date = sale_date

            imported_invoices += 1

        return imported_invoices, 0

    @classmethod
    def _commit_expenses(
        cls, db: Session, company_id: uuid.UUID, records: List[Dict[str, Any]]
    ) -> Tuple[int, int]:
        imported = 0
        for rec in records:
            exp_date = date.fromisoformat(rec["expense_date"]) if rec["expense_date"] else date.today()
            expense = Expense(
                company_id=company_id,
                expense_date=exp_date,
                category=rec["category"],
                description=rec["description"],
                amount=Decimal(str(rec["amount"])),
                payment_method=rec["payment_method"],
                vendor=rec["vendor"],
                status=rec["status"],
                notes=rec["notes"]
            )
            db.add(expense)
            imported += 1
        return imported, 0

    @classmethod
    def generate_error_csv(cls, headers: List[str], errors: List[Dict[str, Any]]) -> str:
        output = io.StringIO()
        fieldnames = ["Row_Number", "Error_Field", "Error_Message"] + headers
        writer = csv.DictWriter(output, fieldnames=fieldnames, lineterminator="\n")
        writer.writeheader()

        for err in errors:
            raw_data = err.get("data", {})
            row_dict = {
                "Row_Number": err.get("row", ""),
                "Error_Field": err.get("field", ""),
                "Error_Message": err.get("message", "")
            }
            for h in headers:
                row_dict[h] = raw_data.get(h, "")
            writer.writerow(row_dict)

        return output.getvalue()
