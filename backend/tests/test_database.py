import pytest
from sqlalchemy import text, inspect
from app.core.database import engine, Base
import app.models  # noqa: F401 - ensure models are registered


def test_database_connection():
    """Verify that SQLAlchemy can establish a connection with PostgreSQL."""
    with engine.connect() as conn:
        result = conn.execute(text("SELECT 1")).scalar()
        assert result == 1


def test_metadata_tables_discoverable():
    """Verify that all 13 models are registered on Base.metadata."""
    expected_tables = {
        "companies",
        "users",
        "employees",
        "customers",
        "products",
        "inventory",
        "sales",
        "sale_items",
        "expenses",
        "business_metrics",
        "reports",
        "ai_insights",
        "ai_recommendations",
    }
    registered_tables = set(Base.metadata.tables.keys())
    assert expected_tables.issubset(registered_tables)
    assert len(registered_tables) == 13


def test_database_schema_migrated():
    """Verify that PostgreSQL schema contains all tables and alembic_version."""
    inspector = inspect(engine)
    existing_tables = set(inspector.get_table_names())

    expected_tables = {
        "companies",
        "users",
        "employees",
        "customers",
        "products",
        "inventory",
        "sales",
        "sale_items",
        "expenses",
        "business_metrics",
        "reports",
        "ai_insights",
        "ai_recommendations",
        "alembic_version",
    }

    assert expected_tables.issubset(existing_tables)


def test_alembic_version_applied():
    """Verify that Alembic has stamped the current migration revision."""
    with engine.connect() as conn:
        version = conn.execute(text("SELECT version_num FROM alembic_version")).scalar()
        assert version is not None
        assert len(version) > 0
