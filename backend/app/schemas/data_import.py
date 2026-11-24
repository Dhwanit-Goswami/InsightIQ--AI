from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class ValidateCsvRequest(BaseModel):
    category: str
    csv_content: str
    filename: Optional[str] = "upload.csv"


class ImportValidationError(BaseModel):
    row: int
    field: str
    message: str
    data: Optional[Dict[str, Any]] = None


class ImportValidationResponse(BaseModel):
    category: str
    filename: str
    headers: List[str]
    total_rows: int
    valid_count: int
    invalid_count: int
    errors_count: int
    is_valid: bool
    preview_rows: List[Dict[str, Any]]
    errors: List[ImportValidationError]
    valid_records: List[Dict[str, Any]]


class ImportCommitRequest(BaseModel):
    category: str
    valid_records: List[Dict[str, Any]]
    mode: str = Field(default="all_or_nothing", description="'all_or_nothing' or 'skip_errors'")


class ImportCommitResponse(BaseModel):
    category: str
    status: str
    message: str
    total_processed: int
    imported: int
    rejected: int


class CategoryInfo(BaseModel):
    key: str
    title: str
    description: str
    headers: List[str]
    required_headers: List[str]


class ErrorCsvExportRequest(BaseModel):
    headers: List[str]
    errors: List[Dict[str, Any]]
