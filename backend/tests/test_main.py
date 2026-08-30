from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings

client = TestClient(app)


def test_read_root():
    """
    Test the root endpoint returns the application details and running status.
    """
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {
        "message": settings.APP_NAME,
        "status": "running"
    }


def test_read_health():
    """
    Test the API v1 health check endpoint.
    """
    response = client.get(f"{settings.API_V1_PREFIX}/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}
