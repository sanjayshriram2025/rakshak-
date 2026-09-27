import pytest

from app.services.evidence_integrity.hash_chain import GENESIS_HASH, _compute_current_hash
from app.services.evidence_integrity.hashing import sha256_hex
from app.services.ingestion.file_validation import FileValidationError, validate_upload
from app.services.ingestion.text_extraction import TextExtractionError, extract_text


def test_sha256_is_deterministic():
    data = b"hello world"
    assert sha256_hex(data) == sha256_hex(data)
    assert len(sha256_hex(data)) == 64


def test_hash_chain_block_hash_changes_if_any_field_changes():
    h1 = _compute_current_hash("0", GENESIS_HASH, "abc123", "FIR_UPLOAD", "2024-01-01T00:00:00")
    h2 = _compute_current_hash("0", GENESIS_HASH, "abc124", "FIR_UPLOAD", "2024-01-01T00:00:00")
    assert h1 != h2


def test_validate_upload_rejects_bad_extension():
    with pytest.raises(FileValidationError):
        validate_upload("evidence.exe", b"some bytes")


def test_validate_upload_rejects_empty_file():
    with pytest.raises(FileValidationError):
        validate_upload("evidence.txt", b"")


def test_validate_upload_accepts_txt():
    file_type = validate_upload("evidence.txt", b"some content")
    assert file_type == "TXT"


def test_extract_text_txt():
    text = extract_text(b"hello investigator", "TXT")
    assert "hello investigator" in text


def test_extract_text_csv():
    csv_bytes = b"name,phone\nRajesh Kumar,9000010001\n"
    text = extract_text(csv_bytes, "CSV")
    assert "name=Rajesh Kumar" in text
    assert "9000010001" in text


def test_extract_text_json():
    json_bytes = b'{"person": "Rajesh Kumar", "phone": "9000010001"}'
    text = extract_text(json_bytes, "JSON")
    assert "Rajesh Kumar" in text
    assert "9000010001" in text


def test_extract_text_unsupported_type_raises():
    with pytest.raises(TextExtractionError):
        extract_text(b"data", "EXE")


def test_extract_text_empty_csv_raises():
    with pytest.raises(TextExtractionError):
        extract_text(b"", "CSV")
