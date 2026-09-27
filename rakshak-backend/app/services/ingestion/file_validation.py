"""
Validates uploaded files before they enter the processing pipeline:
extension/type whitelist, size limits, and empty-file rejection.
"""
from app.core.config import settings

ALLOWED_EXTENSIONS = {
    "pdf": "PDF",
    "docx": "DOCX",
    "txt": "TXT",
    "csv": "CSV",
    "json": "JSON",
}


class FileValidationError(ValueError):
    pass


def validate_upload(filename: str, file_bytes: bytes) -> str:
    """Returns the canonical FileType string, or raises FileValidationError."""
    if "." not in filename:
        raise FileValidationError("File has no extension.")

    ext = filename.rsplit(".", 1)[-1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise FileValidationError(
            f"Unsupported file extension '.{ext}'. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    if not file_bytes:
        raise FileValidationError("Uploaded file is empty.")

    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if len(file_bytes) > max_bytes:
        raise FileValidationError(
            f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE_MB}MB."
        )

    return ALLOWED_EXTENSIONS[ext]
