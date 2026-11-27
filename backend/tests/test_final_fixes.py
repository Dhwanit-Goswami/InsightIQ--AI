"""
Comprehensive tests for InsightIQ Final Phase:
- Task 1: Reports preview attribute fixes (expense, inventory, customer, sales, empty)
- Task 2: Router deduplication & route integrity
- Task 3: ML Forecasting TTL cache (hit, miss, invalidation, tenant isolation, expiry, error safety, concurrency)
- Task 4: CSV Validation 15-minute TTL cache (hit, expiry, cleanup, concurrency)
- Phase 3: AI Chatbot (14 scenarios: business/revenue/expense/inventory/customer/trend/follow-up, empty, invalid, missing key, timeout, error, 401, tenant isolation)
"""
import sys
import types
import uuid
import time
from concurrent.futures import ThreadPoolExecutor
from decimal import Decimal
from unittest.mock import MagicMock

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.core.database import SessionLocal
from app.models.company import Company
from app.models.user import User
from app.models.report import Report
from app.core.security import hash_password
from app.services import forecasting as forecasting_svc
from app.services.csv_importer import CSVImportService

client = TestClient(app)

DEMO_EMAIL = "demo@insightiq.ai"
DEMO_PASSWORD = "Password@123"


def _login(email=DEMO_EMAIL, password=DEMO_PASSWORD):
    res = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    assert res.status_code == 200, f"Login failed: {res.text}"
    return res.json()["access_token"]


# ─── TASK 1: REPORTS PREVIEW ATTRIBUTE FIXES ──────────────────────────────────

@pytest.mark.parametrize("report_type", ["sales", "expense", "inventory", "customer", "general"])
def test_report_preview_all_types(report_type):
    token = _login()
    headers = {"Authorization": f"Bearer {token}"}

    create_res = client.post(
        "/api/v1/reports",
        json={
            "name": f"Test {report_type.title()} Report",
            "report_type": report_type,
            "description": "Automated verification report",
            "parameters": {"days": 90},
        },
        headers=headers,
    )
    assert create_res.status_code == 201, create_res.text
    report_id = create_res.json()["id"]

    prev_res = client.get(f"/api/v1/reports/{report_id}/preview", headers=headers)
    assert prev_res.status_code == 200, f"{report_type} preview failed: {prev_res.text}"
    body = prev_res.json()
    assert body["report_id"] == report_id
    assert isinstance(body["columns"], list) and len(body["columns"]) > 0
    assert isinstance(body["rows"], list)
    assert isinstance(body["summary"], dict)


def test_report_preview_empty_company_dataset():
    """Verify report previews work cleanly on a brand-new company with zero records."""
    db = SessionLocal()
    company_id = uuid.uuid4()
    user_id = uuid.uuid4()
    email = f"empty_{company_id.hex[:8]}@insightiq.ai"
    try:
        comp = Company(id=company_id, name="Empty Audit Co", industry="Retail")
        db.add(comp)
        db.flush()
        user = User(
            id=user_id,
            company_id=company_id,
            email=email,
            password_hash=hash_password("TestPass@123"),
            name="Empty Tester",
            role="owner",
            is_active=True,
        )
        db.add(user)
        db.commit()

        token = _login(email, "TestPass@123")
        headers = {"Authorization": f"Bearer {token}"}

        for rtype in ("expense", "inventory", "customer", "sales"):
            cr = client.post(
                "/api/v1/reports",
                json={"name": f"Empty {rtype}", "report_type": rtype, "parameters": {"days": 90}},
                headers=headers,
            )
            assert cr.status_code == 201
            pr = client.get(f"/api/v1/reports/{cr.json()['id']}/preview", headers=headers)
            assert pr.status_code == 200
            assert pr.json()["rows"] == []
            assert pr.json()["total_rows"] == 0
    finally:
        db.query(Report).filter(Report.company_id == company_id).delete()
        db.query(User).filter(User.id == user_id).delete()
        db.query(Company).filter(Company.id == company_id).delete()
        db.commit()
        db.close()


# ─── TASK 2: ROUTER DEDUPLICATION ─────────────────────────────────────────────

def _collect_routes(routes, prefix=""):
    collected = []
    for route in routes:
        if hasattr(route, "router") and hasattr(route, "prefix"):
            collected.extend(_collect_routes(route.router.routes, prefix + (route.prefix or "")))
        elif hasattr(route, "path"):
            methods = tuple(sorted(getattr(route, "methods", set()) or []))
            collected.append((prefix + route.path, methods))
    return collected


def test_no_duplicate_api_routes_registered():
    seen = {}
    duplicates = []
    for path, methods in _collect_routes(app.routes):
        if not path.startswith("/api/v1"):
            continue
        key = (path, methods)
        if key in seen:
            duplicates.append(key)
        seen[key] = True

    assert duplicates == [], f"Duplicate API routes found: {duplicates}"

    openapi_paths = set(app.openapi()["paths"].keys())
    expected_prefixes = [
        "/api/v1/health",
        "/api/v1/auth/login",
        "/api/v1/companies",
        "/api/v1/users",
        "/api/v1/employees",
        "/api/v1/customers",
        "/api/v1/products",
        "/api/v1/inventory",
        "/api/v1/sales",
        "/api/v1/expenses",
        "/api/v1/metrics",
        "/api/v1/reports",
        "/api/v1/dashboard",
        "/api/v1/analytics",
        "/api/v1/insights",
        "/api/v1/import",
        "/api/v1/settings",
    ]
    for prefix in expected_prefixes:
        assert any(p.startswith(prefix) for p in openapi_paths), f"Missing route group: {prefix}"


# ─── TASK 3: FORECASTING CACHE ────────────────────────────────────────────────

def test_forecasting_cache_hit_invalidation_expiry_and_isolation(monkeypatch):
    forecasting_svc.clear_forecast_cache()
    db = SessionLocal()
    try:
        demo_user = db.query(User).filter(User.email == DEMO_EMAIL).first()
        assert demo_user is not None
        company_a = demo_user.company_id
        company_b = uuid.uuid4()  # Isolated non-existent company

        fit_calls = {"count": 0}
        orig_hw = forecasting_svc._holt_winters_forecast

        def counting_hw(series, forecast_months=6):
            fit_calls["count"] += 1
            return orig_hw(series, forecast_months)

        monkeypatch.setattr(forecasting_svc, "_holt_winters_forecast", counting_hw)

        fake_clock = {"t": 1000.0}
        monkeypatch.setattr(forecasting_svc, "_now", lambda: fake_clock["t"])

        # 1. First request performs fitting
        t0 = time.perf_counter()
        res1 = forecasting_svc.get_sales_forecast(db, company_a, forecast_months=6)
        first_ms = (time.perf_counter() - t0) * 1000
        assert fit_calls["count"] == 1

        # 2. Second identical request hits cache
        t1 = time.perf_counter()
        res2 = forecasting_svc.get_sales_forecast(db, company_a, forecast_months=6)
        second_ms = (time.perf_counter() - t1) * 1000
        assert fit_calls["count"] == 1
        assert res1 == res2
        assert second_ms <= first_ms + 50  # Cached path avoids model fitting

        # 3. Different company is isolated
        res_b = forecasting_svc.get_sales_forecast(db, company_b, forecast_months=6)
        assert res_b["data_available"] is False
        assert res_b != res1

        # 4. Changed sales data fingerprint triggers recalculation
        monkeypatch.setattr(forecasting_svc, "_get_sales_data_fingerprint", lambda _db, _cid: "999:12345:changed:2026")
        forecasting_svc.get_sales_forecast(db, company_a, forecast_months=6)
        assert fit_calls["count"] == 2

        # 5. Expired entry triggers recalculation
        fake_clock["t"] += forecasting_svc.FORECAST_CACHE_TTL_SECONDS + 1
        forecasting_svc.get_sales_forecast(db, company_a, forecast_months=6)
        assert fit_calls["count"] == 3

        # 6. Error in timeseries loading does not corrupt cache
        monkeypatch.setattr(forecasting_svc, "_get_sales_data_fingerprint", lambda _db, _cid: "err_fp")
        monkeypatch.setattr(
            forecasting_svc,
            "_get_sales_timeseries",
            lambda *_a, **_kw: (_ for _ in ()).throw(RuntimeError("DB timeout")),
        )
        err_res = forecasting_svc.get_sales_forecast(db, company_a, forecast_months=6)
        assert err_res["data_available"] is False
        stats_keys = [k for k in forecasting_svc._forecast_cache.keys() if k[1] == "err_fp"]
        assert stats_keys == []
    finally:
        forecasting_svc.clear_forecast_cache()
        db.close()


def test_forecasting_cache_concurrency():
    forecasting_svc.clear_forecast_cache()

    def worker(_):
        db = SessionLocal()
        try:
            demo_user = db.query(User).filter(User.email == DEMO_EMAIL).first()
            return forecasting_svc.get_sales_forecast(db, demo_user.company_id, forecast_months=6)
        finally:
            db.close()

    with ThreadPoolExecutor(max_workers=4) as pool:
        results = list(pool.map(worker, range(6)))

    assert len(results) == 6
    assert all(r["forecast_months"] == 6 for r in results)
    forecasting_svc.clear_forecast_cache()


# ─── TASK 4: CSV VALIDATION CACHE EXPIRATION ──────────────────────────────────

def test_csv_validation_cache_ttl_and_cleanup(monkeypatch):
    CSVImportService.clear_validation_cache()
    db = SessionLocal()
    try:
        demo_user = db.query(User).filter(User.email == DEMO_EMAIL).first()
        cid = demo_user.company_id
        csv_text = "name,email,segment\nCache Test Corp,cachetest_unique@example.com,enterprise\n"

        validate_calls = {"count": 0}
        orig_validate = CSVImportService._validate_customers

        def counting_validate(*args, **kwargs):
            validate_calls["count"] += 1
            return orig_validate(*args, **kwargs)

        monkeypatch.setattr(CSVImportService, "_validate_customers", counting_validate)
        fake_clock = {"t": 5000.0}
        monkeypatch.setattr(CSVImportService, "_now", staticmethod(lambda: fake_clock["t"]))

        # 1. Miss -> populates cache
        r1 = CSVImportService.validate_file(db, cid, "customers", csv_text, "cust1.csv")
        assert validate_calls["count"] == 1
        assert r1["valid_count"] == 1

        # 2. Hit before 15 minutes
        fake_clock["t"] += 600.0  # 10 min
        r2 = CSVImportService.validate_file(db, cid, "customers", csv_text, "cust1.csv")
        assert validate_calls["count"] == 1
        assert r2 == r1

        # 3. Independent entry
        CSVImportService.validate_file(db, cid, "customers", csv_text, "cust2.csv")
        assert validate_calls["count"] == 2
        assert len(CSVImportService._validation_cache) == 2

        # 4. Expired after 15 minutes (900s) -> purges stale & revalidates
        fake_clock["t"] += 305.0  # total +905s since cust1, +305s since cust2
        CSVImportService.validate_file(db, cid, "customers", csv_text, "cust1.csv")
        assert validate_calls["count"] == 3
        # Advance another 600s so cust2 is also expired (>900s), then revalidate cust1
        fake_clock["t"] += 600.0
        CSVImportService.validate_file(db, cid, "customers", csv_text, "cust1.csv")
        assert len(CSVImportService._validation_cache) == 1
    finally:
        CSVImportService.clear_validation_cache()
        db.close()


def test_csv_validation_cache_concurrency():
    CSVImportService.clear_validation_cache()
    csv_text = "name,email,segment\nConcurrent Corp,concurrent_unique@example.com,standard\n"

    def worker(idx):
        db = SessionLocal()
        try:
            demo_user = db.query(User).filter(User.email == DEMO_EMAIL).first()
            return CSVImportService.validate_file(db, demo_user.company_id, "customers", csv_text, f"c_{idx % 2}.csv")
        finally:
            db.close()

    with ThreadPoolExecutor(max_workers=4) as pool:
        results = list(pool.map(worker, range(8)))

    assert len(results) == 8
    assert all(r["valid_count"] == 1 for r in results)
    CSVImportService.clear_validation_cache()


# ─── PHASE 3: AI CHATBOT TESTS (14 SCENARIOS) ─────────────────────────────────

def _install_fake_gemini(monkeypatch, reply_text="Mocked Gemini insight", raise_exc=None):
    captured = {"system_instruction": None, "history": None, "message": None}

    class FakeGenConfig:
        def __init__(self, **kwargs):
            self.kwargs = kwargs

    class FakeChat:
        def send_message(self, msg, **kwargs):
            captured["message"] = msg
            if raise_exc:
                raise raise_exc
            return types.SimpleNamespace(text=reply_text)

    class FakeModel:
        def __init__(self, model_name, system_instruction=None):
            captured["system_instruction"] = system_instruction

        def generate_content(self, msg, **kwargs):
            captured["message"] = msg
            if raise_exc:
                raise raise_exc
            return types.SimpleNamespace(text=reply_text)

        def start_chat(self, history=None):
            captured["history"] = history
            return FakeChat()

    fake_genai = types.ModuleType("google.generativeai")
    fake_genai.configure = lambda api_key: None
    fake_genai.GenerativeModel = FakeModel
    fake_genai.types = types.SimpleNamespace(GenerationConfig=FakeGenConfig)

    fake_google = types.ModuleType("google")
    fake_google.generativeai = fake_genai

    monkeypatch.setitem(sys.modules, "google", fake_google)
    monkeypatch.setitem(sys.modules, "google.generativeai", fake_genai)
    return captured


@pytest.mark.parametrize(
    "question,expected_context_token",
    [
        ("How is our overall business performing?", "Revenue:"),
        ("What is our current revenue and AOV?", "Average Order Value:"),
        ("Where are our biggest expenses?", "Expense Breakdown (90d):"),
        ("Which products are low on stock?", "Low-Stock Alert Items:"),
        ("Tell me about our customer segments.", "Customer Segments:"),
        ("How did our sales trend over the last 6 months?", "6-Month Trend:"),
    ],
)
def test_chatbot_business_questions_with_mocked_llm(monkeypatch, question, expected_context_token):
    from app.core.config import settings

    monkeypatch.setattr(settings, "GEMINI_API_KEY", "test-fake-key")
    captured = _install_fake_gemini(monkeypatch, reply_text=f"Answer for: {question}")

    token = _login()
    res = client.post(
        "/api/v1/insights/chat",
        json={"message": question},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == 200
    body = res.json()
    assert body["powered_by_llm"] is True
    assert body["response"] == f"Answer for: {question}"
    assert expected_context_token in captured["system_instruction"]


def test_chatbot_follow_up_history(monkeypatch):
    from app.core.config import settings

    monkeypatch.setattr(settings, "GEMINI_API_KEY", "test-fake-key")
    captured = _install_fake_gemini(monkeypatch, reply_text="Follow-up answer")

    token = _login()
    res = client.post(
        "/api/v1/insights/chat",
        json={
            "message": "Can you break that down further?",
            "history": [
                {"role": "user", "content": "Where are our biggest expenses?"},
                {"role": "assistant", "content": "Logistics is your top expense."},
            ],
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == 200
    assert res.json()["powered_by_llm"] is True
    assert captured["history"] is not None
    assert len(captured["history"]) == 2
    assert captured["history"][1]["role"] == "model"


def test_chatbot_empty_and_invalid_requests():
    token = _login()
    headers = {"Authorization": f"Bearer {token}"}

    r_empty = client.post("/api/v1/insights/chat", json={"message": "   "}, headers=headers)
    assert r_empty.status_code == 400

    r_short = client.post("/api/v1/insights/chat", json={"message": "a"}, headers=headers)
    assert r_short.status_code == 400

    r_missing = client.post("/api/v1/insights/chat", json={}, headers=headers)
    assert r_missing.status_code == 422


def test_chatbot_missing_api_key_fallback(monkeypatch):
    from app.core.config import settings

    monkeypatch.setattr(settings, "GEMINI_API_KEY", "")
    token = _login()
    res = client.post(
        "/api/v1/insights/chat",
        json={"message": "Where are our biggest expenses?"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == 200
    body = res.json()
    assert body["powered_by_llm"] is False
    assert body["source"] == "deterministic-fallback"
    assert "Expense Breakdown" in body["response"]


def test_chatbot_provider_timeout_and_error_fallback(monkeypatch):
    from app.core.config import settings

    monkeypatch.setattr(settings, "GEMINI_API_KEY", "secret-never-leak-key")
    _install_fake_gemini(monkeypatch, raise_exc=TimeoutError("Timed out"))

    token = _login()
    res_timeout = client.post(
        "/api/v1/insights/chat",
        json={"message": "What is our revenue?"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res_timeout.status_code == 200
    b1 = res_timeout.json()
    assert b1["powered_by_llm"] is False
    assert "timed out" in b1["fallback_reason"].lower()
    assert "secret-never-leak-key" not in str(b1)

    _install_fake_gemini(monkeypatch, raise_exc=RuntimeError("Upstream 503"))
    res_err = client.post(
        "/api/v1/insights/chat",
        json={"message": "What is our inventory status?"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res_err.status_code == 200
    b2 = res_err.json()
    assert b2["powered_by_llm"] is False
    assert "RuntimeError" in b2["fallback_reason"]


def test_chatbot_unauthorized():
    res = client.post("/api/v1/insights/chat", json={"message": "Hello"})
    assert res.status_code == 401


def test_chatbot_cross_company_isolation(monkeypatch):
    from app.core.config import settings

    monkeypatch.setattr(settings, "GEMINI_API_KEY", "test-fake-key")
    captured = _install_fake_gemini(monkeypatch, reply_text="Isolated answer")

    db = SessionLocal()
    company_id = uuid.uuid4()
    user_id = uuid.uuid4()
    email = f"isolated_{company_id.hex[:8]}@insightiq.ai"
    try:
        comp = Company(id=company_id, name="Isolated Test Ventures", industry="Tech")
        db.add(comp)
        db.flush()
        user = User(
            id=user_id,
            company_id=company_id,
            email=email,
            password_hash=hash_password("TestPass@123"),
            name="Isolated User",
            role="owner",
            is_active=True,
        )
        db.add(user)
        db.commit()

        token = _login(email, "TestPass@123")
        res = client.post(
            "/api/v1/insights/chat",
            json={"message": "Summarize our business"},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert res.status_code == 200
        assert "Isolated Test Ventures" in captured["system_instruction"]
        assert "Revenue: ₹0.00" in captured["system_instruction"]
    finally:
        db.query(User).filter(User.id == user_id).delete()
        db.query(Company).filter(Company.id == company_id).delete()
        db.commit()
        db.close()
