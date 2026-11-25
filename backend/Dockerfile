# ─── Backend Dockerfile ───────────────────────────────────────────────────────
# Multi-stage build: Python 3.12 slim base for minimal image size
FROM python:3.12-slim AS base

WORKDIR /app

# Install system dependencies required for psycopg (PostgreSQL adapter)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies first (layer caching)
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source
COPY . .

# Expose FastAPI port
EXPOSE 8000

# Default startup: run Alembic upgrade then start Uvicorn
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
