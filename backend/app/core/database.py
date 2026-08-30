from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

# Create SQLAlchemy engine
# By default, postgresql+psycopg is used. No special flags are needed like connect_args for sqlite.
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,  # checks connection liveness before executing queries
)

# Create SessionLocal session class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base declarative class
Base = declarative_base()


# Database dependency to be used in FastAPI endpoints
def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
