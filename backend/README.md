# AI Decision Intelligence Platform Backend

A clean, scalable FastAPI backend foundation for the AI-Powered Decision Intelligence Platform for SMEs.

## Architecture & Technology Stack
- **Web Framework**: [FastAPI](https://fastapi.tiangolo.com/)
- **ASGI Server**: [Uvicorn](https://www.uvicorn.org/)
- **Settings Management**: [Pydantic Settings](https://docs.pydantic.dev/latest/concepts/pydantic_settings/)
- **Database ORM**: [SQLAlchemy](https://www.sqlalchemy.org/)
- **Database Driver**: [Psycopg 3](https://www.psycopg.org/psycopg3/)
- **Database Migrations**: [Alembic](https://alembic.sqlalchemy.org/)
- **Target Database**: [PostgreSQL](https://www.postgresql.org/)

## Directory Structure
```
backend/
├── app/
│   ├── api/          # Routers and endpoints
│   ├── core/         # Configuration, database setup, and security
│   ├── models/       # SQLAlchemy models
│   ├── schemas/      # Pydantic validation schemas
│   ├── services/     # Business logic layer
│   └── utils/        # Utility helpers
├── tests/            # Automated test suite
└── alembic/          # Database migrations configuration
```

## Setup Instructions

### 1. Create Virtual Environment
Navigate to the `backend/` directory and run:
```bash
python -m venv venv
```

### 2. Activate Virtual Environment
- **Windows (PowerShell)**:
  ```powershell
  .\venv\Scripts\Activate.ps1
  ```
- **Windows (CMD)**:
  ```cmd
  .\venv\Scripts\activate.bat
  ```
- **Linux/macOS**:
  ```bash
  source venv/bin/activate
  ```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Update the settings in `.env` as appropriate, ensuring that `DATABASE_URL` matches your local PostgreSQL configuration.

### 5. Create PostgreSQL Database
Create a database named `decision_intelligence` in your PostgreSQL instance.

### 6. Run Database Migrations
Apply any pending database migrations using Alembic:
```bash
alembic upgrade head
```

### 7. Start FastAPI Application
Start the development server with reload enabled:
```bash
uvicorn app.main:app --reload
```

## API Documentation
Once the server is running, you can explore and test the API using:
- **Swagger UI**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

## Running Tests
Run tests using `pytest`:
```bash
pytest
```
