import uuid
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.models.user import User
from app.services.csv_importer import CSVImportService, CATEGORY_CONFIGS
from app.schemas.data_import import (
    ValidateCsvRequest,
    ImportValidationResponse,
    ImportCommitRequest,
    ImportCommitResponse,
    CategoryInfo,
    ErrorCsvExportRequest,
)

router = APIRouter()


@router.get("/categories", response_model=List[CategoryInfo])
def get_supported_categories(
    current_user: User = Depends(get_current_user)
):
    """Retrieve metadata and documented schemas for all supported CSV import categories."""
    result = []
    for key, cfg in CATEGORY_CONFIGS.items():
        result.append(CategoryInfo(
            key=key,
            title=cfg["title"],
            description=cfg["description"],
            headers=cfg["headers"],
            required_headers=cfg["required_headers"]
        ))
    return result


@router.get("/template/{category}")
def download_template(
    category: str,
    current_user: User = Depends(get_current_user)
):
    """Download standard sample CSV template for a specific business entity."""
    try:
        csv_text = CSVImportService.get_template_csv(category)
        filename = f"insightiq_{category.lower()}_template.csv"
        return Response(
            content=csv_text.encode("utf-8"),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/validate", response_model=ImportValidationResponse)
def validate_import_file(
    payload: ValidateCsvRequest,
    current_user: User = Depends(require_role(["owner", "admin", "manager"])),
    db: Session = Depends(get_db)
):
    """
    Parse and validate uploaded CSV content without committing to database.
    Provides preview rows, row-level error breakdown, and validation metrics.
    """
    if not payload.csv_content or not payload.csv_content.strip():
        raise HTTPException(status_code=400, detail="The uploaded CSV file is empty (0 bytes).")

    try:
        validation_result = CSVImportService.validate_file(
            db=db,
            company_id=current_user.company_id,
            category=payload.category,
            file_input=payload.csv_content,
            filename=payload.filename or "upload.csv"
        )
        return validation_result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error validating CSV: {str(e)}")


@router.post("/commit", response_model=ImportCommitResponse)
def commit_imported_records(
    payload: ImportCommitRequest,
    current_user: User = Depends(require_role(["owner", "admin", "manager"])),
    db: Session = Depends(get_db)
):
    """
    Commit validated business records into PostgreSQL within a single safe transaction.
    Maintains inventory consistency, customer statistics, and triggers AI insight recalculation.
    """
    if not payload.valid_records:
        raise HTTPException(status_code=400, detail="No records provided to commit.")

    try:
        summary = CSVImportService.commit_import(
            db=db,
            company_id=current_user.company_id,
            category=payload.category,
            valid_records=payload.valid_records,
            mode=payload.mode
        )
        return summary
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=409, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to commit import records: {str(e)}")


@router.post("/error-csv")
def download_error_csv(
    payload: ErrorCsvExportRequest,
    current_user: User = Depends(get_current_user)
):
    """Generate and download a CSV file containing all rejected rows with their error explanations."""
    csv_text = CSVImportService.generate_error_csv(payload.headers, payload.errors)
    filename = f"insightiq_import_errors_{uuid.uuid4().hex[:8]}.csv"
    return Response(
        content=csv_text.encode("utf-8"),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
