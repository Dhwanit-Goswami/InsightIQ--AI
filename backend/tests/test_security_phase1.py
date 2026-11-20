import uuid
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.core.database import SessionLocal
from app.models.user import User
from app.models.company import Company
from app.core.security import create_access_token

client = TestClient(app)


@pytest.fixture(scope="module")
def db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(scope="module")
def company_users(db_session: Session):
    """
    Retrieve two distinct companies and their owner users for cross-company testing.
    """
    user_a = db_session.query(User).filter(User.email == "demo@insightiq.ai").first()
    assert user_a is not None, "Seed user demo@insightiq.ai must exist"

    user_b = db_session.query(User).filter(User.email == "ketan@freshfoods.in").first()
    assert user_b is not None, "Seed user ketan@freshfoods.in must exist"

    assert user_a.company_id != user_b.company_id, "Users must belong to different companies"

    token_a = create_access_token({
        "sub": str(user_a.id),
        "company_id": str(user_a.company_id),
        "role": user_a.role
    })
    token_b = create_access_token({
        "sub": str(user_b.id),
        "company_id": str(user_b.company_id),
        "role": user_b.role
    })

    return {
        "user_a": user_a,
        "token_a": token_a,
        "company_a_id": str(user_a.company_id),
        "user_b": user_b,
        "token_b": token_b,
        "company_b_id": str(user_b.company_id),
    }


def test_user_can_access_own_company(company_users):
    """User should successfully access their own company details via ID."""
    token = company_users["token_a"]
    company_id = company_users["company_a_id"]

    response = client.get(
        f"/api/v1/companies/{company_id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == company_id


def test_user_can_access_current_company(company_users):
    """User should retrieve their own company via /companies/current."""
    token = company_users["token_a"]
    company_id = company_users["company_a_id"]

    response = client.get(
        "/api/v1/companies/current",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == company_id


def test_owner_cross_company_access_prohibited(company_users):
    """
    CRITICAL SECURITY CHECK:
    An owner of Company A MUST NOT be permitted to access Company B's records.
    The endpoint must return HTTP 403 Forbidden.
    """
    token_a = company_users["token_a"]
    company_b_id = company_users["company_b_id"]

    response = client.get(
        f"/api/v1/companies/{company_b_id}",
        headers={"Authorization": f"Bearer {token_a}"}
    )
    assert response.status_code == 403
    assert response.json() == {"detail": "Cross-company access is prohibited."}


def test_owner_cross_company_update_prohibited(company_users):
    """
    An owner of Company A MUST NOT be permitted to update Company B's settings.
    The endpoint must return HTTP 403 Forbidden.
    """
    token_a = company_users["token_a"]
    company_b_id = company_users["company_b_id"]

    response = client.put(
        f"/api/v1/companies/{company_b_id}",
        json={"name": "Malicious Modification Attempt"},
        headers={"Authorization": f"Bearer {token_a}"}
    )
    assert response.status_code == 403
    assert response.json() == {"detail": "Cross-company access is prohibited."}


def test_unauthenticated_request_returns_401():
    """Accessing protected company endpoint without token must return 401."""
    random_id = str(uuid.uuid4())
    response = client.get(f"/api/v1/companies/{random_id}")
    assert response.status_code == 401
    assert "detail" in response.json()


def test_cors_configured_origin_accepted_localhost():
    """CORS preflight request from localhost:5173 must be allowed."""
    response = client.options(
        "/api/v1/health",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "GET"
        }
    )
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "http://localhost:5173"
    assert response.headers.get("access-control-allow-credentials") == "true"


def test_cors_configured_origin_accepted_127():
    """CORS preflight request from 127.0.0.1:5173 must be allowed."""
    response = client.options(
        "/api/v1/health",
        headers={
            "Origin": "http://127.0.0.1:5173",
            "Access-Control-Request-Method": "GET"
        }
    )
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "http://127.0.0.1:5173"
    assert response.headers.get("access-control-allow-credentials") == "true"


def test_cors_unconfigured_origin_rejected():
    """CORS preflight request from an unapproved origin must not return allow-origin header."""
    response = client.options(
        "/api/v1/health",
        headers={
            "Origin": "http://unapproved-malicious-domain.com",
            "Access-Control-Request-Method": "GET"
        }
    )
    # Starlette CORSMiddleware rejects unapproved preflight requests with 400 or omits CORS headers
    assert response.headers.get("access-control-allow-origin") is None
