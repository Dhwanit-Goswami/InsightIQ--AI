"""
Automated test suite for the 8 mandatory academic requirements:
1. Real ML Sales Forecasting (/api/v1/analytics/forecast)
2. External LLM Integration + fallback (/api/v1/insights/chat)
3. Docker Containerization files exist
4. Persistent Workspace Settings (/api/v1/settings)
5. Forgot Password & Reset Password (/api/v1/auth/forgot-password, /reset-password)
6. Server-Side Device & Session Revocation (/api/v1/auth/sessions)
7. Secondary Analytics SQL (/api/v1/analytics/customer-growth, /quarterly)
8. Report Content Preview (/api/v1/reports/{id}/preview)
"""
import os
from pathlib import Path
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

DEMO_EMAIL = "demo@insightiq.ai"
DEMO_PASSWORD = "Password@123"


def _login(email=DEMO_EMAIL, password=DEMO_PASSWORD):
    res = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    assert res.status_code == 200, f"Login failed: {res.text}"
    return res.json()["access_token"]


def test_secondary_analytics_sql():
    token = _login()
    headers = {"Authorization": f"Bearer {token}"}

    r1 = client.get("/api/v1/analytics/customer-growth", headers=headers)
    assert r1.status_code == 200
    assert "data" in r1.json()
    assert isinstance(r1.json()["data"], list)

    r2 = client.get("/api/v1/analytics/quarterly", headers=headers)
    assert r2.status_code == 200
    assert "data" in r2.json()
    assert isinstance(r2.json()["data"], list)


def test_ml_sales_forecast():
    token = _login()
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/v1/analytics/forecast?months=6", headers=headers)
    assert res.status_code == 200
    body = res.json()
    assert "model" in body
    assert "metrics" in body
    assert "rmse" in body["metrics"]
    assert "mae" in body["metrics"]
    assert "historical" in body
    assert "forecast" in body
    if body["data_available"]:
        assert len(body["forecast"]) == 6
        assert "lower_bound" in body["forecast"][0]
        assert "upper_bound" in body["forecast"][0]


def test_llm_chat_with_fallback():
    token = _login()
    headers = {"Authorization": f"Bearer {token}"}

    res = client.post(
        "/api/v1/insights/chat",
        json={"message": "What is our current revenue and profit margin?"},
        headers=headers,
    )
    assert res.status_code == 200
    body = res.json()
    assert "response" in body and len(body["response"]) > 10
    assert "source" in body
    assert "powered_by_llm" in body


def test_workspace_settings_persistence():
    token = _login()
    headers = {"Authorization": f"Bearer {token}"}

    res_get = client.get("/api/v1/settings", headers=headers)
    assert res_get.status_code == 200
    orig = res_get.json()

    # Toggle weekly_digest and verify persistence across GET
    toggled = not orig["weekly_digest"]
    res_put = client.put(
        "/api/v1/settings",
        json={"weekly_digest": toggled, "currency": "INR", "timezone": "Asia/Kolkata"},
        headers=headers,
    )
    assert res_put.status_code == 200
    assert res_put.json()["weekly_digest"] == toggled

    res_check = client.get("/api/v1/settings", headers=headers)
    assert res_check.status_code == 200
    assert res_check.json()["weekly_digest"] == toggled

    # Restore original
    client.put("/api/v1/settings", json={"weekly_digest": orig["weekly_digest"]}, headers=headers)


def test_session_tracking_and_revocation():
    # Login creates a tracked session with jti
    token_a = _login()
    token_b = _login()

    res_list = client.get("/api/v1/auth/sessions", headers={"Authorization": f"Bearer {token_a}"})
    assert res_list.status_code == 200
    sessions = res_list.json()
    assert len(sessions) >= 2

    # Revoke the second-most-recent session (or any session) and verify
    # Pick the oldest active session so token_a stays valid first, or revoke token_b's session
    target_id = sessions[-1]["id"]
    res_del = client.delete(f"/api/v1/auth/sessions/{target_id}", headers={"Authorization": f"Bearer {token_a}"})
    assert res_del.status_code == 200

    # Verify token_a still works (unless target_id happened to be token_a's)
    res_after = client.get("/api/v1/auth/sessions", headers={"Authorization": f"Bearer {token_a}"})
    if res_after.status_code == 200:
        remaining_ids = [s["id"] for s in res_after.json()]
        assert target_id not in remaining_ids


def test_forgot_password_endpoint():
    # Should return 200 even for unknown emails (anti-enumeration)
    res = client.post("/api/v1/auth/forgot-password", json={"email": "nonexistent@example.com"})
    assert res.status_code == 200
    assert "message" in res.json()

    # Invalid reset token must return 400
    res_bad = client.post(
        "/api/v1/auth/reset-password",
        json={"token": "invalid-token-123", "new_password": "NewPassword@123"},
    )
    assert res_bad.status_code == 400


def test_report_content_preview():
    token = _login()
    headers = {"Authorization": f"Bearer {token}"}

    # Create or list report
    res_list = client.get("/api/v1/reports", headers=headers)
    assert res_list.status_code == 200
    reports = res_list.json()
    if not reports:
        res_create = client.post(
            "/api/v1/reports",
            json={"name": "Test Sales Preview", "report_type": "sales"},
            headers=headers,
        )
        assert res_create.status_code == 201
        report_id = res_create.json()["id"]
    else:
        report_id = reports[0]["id"]

    res_prev = client.get(f"/api/v1/reports/{report_id}/preview", headers=headers)
    assert res_prev.status_code == 200
    prev = res_prev.json()
    assert "summary" in prev
    assert "columns" in prev
    assert "rows" in prev


def test_docker_files_present():
    root = Path(__file__).resolve().parent.parent.parent
    assert (root / "docker-compose.yml").is_file()
    assert (root / "Dockerfile").is_file()
    assert (root / "nginx.conf").is_file()
    assert (root / "backend" / "Dockerfile").is_file()
    assert (root / ".dockerignore").is_file()
