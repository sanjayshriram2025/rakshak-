"""
Extracts raw text (or a text projection of structured data) from
uploaded FIR documents: PDF, DOCX, TXT, CSV, JSON.

Each extractor raises ValueError on malformed input so the ingestion
pipeline can mark the FIR record as FAILED with a clear reason instead
of silently producing garbage text.
"""
from __future__ import annotations

import csv
import io
import json


class TextExtractionError(ValueError):
    pass


def extract_text(file_bytes: bytes, file_type: str) -> str:
    file_type = file_type.upper()
    if file_type == "TXT":
        return _extract_txt(file_bytes)
    if file_type == "PDF":
        return _extract_pdf(file_bytes)
    if file_type == "DOCX":
        return _extract_docx(file_bytes)
    if file_type == "CSV":
        return _extract_csv(file_bytes)
    if file_type == "JSON":
        return _extract_json(file_bytes)
    raise TextExtractionError(f"Unsupported file type: {file_type}")


def _extract_txt(file_bytes: bytes) -> str:
    try:
        return file_bytes.decode("utf-8", errors="replace")
    except Exception as exc:  # pragma: no cover - decode() rarely raises
        raise TextExtractionError(f"Failed to decode TXT file: {exc}") from exc


def _extract_pdf(file_bytes: bytes) -> str:
    try:
        import pdfplumber
    except ImportError as exc:  # pragma: no cover
        raise TextExtractionError("pdfplumber is not installed") from exc

    try:
        text_parts = []
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text() or ""
                text_parts.append(page_text)
        text = "\n".join(text_parts).strip()
        if not text:
            raise TextExtractionError("No extractable text found in PDF (possibly scanned/image-only).")
        return text
    except TextExtractionError:
        raise
    except Exception as exc:
        raise TextExtractionError(f"Failed to parse PDF: {exc}") from exc


def _extract_docx(file_bytes: bytes) -> str:
    try:
        import docx
    except ImportError as exc:  # pragma: no cover
        raise TextExtractionError("python-docx is not installed") from exc

    try:
        document = docx.Document(io.BytesIO(file_bytes))
        parts = [p.text for p in document.paragraphs if p.text.strip()]
        for table in document.tables:
            for row in table.rows:
                parts.append(" | ".join(cell.text for cell in row.cells))
        text = "\n".join(parts).strip()
        if not text:
            raise TextExtractionError("No extractable text found in DOCX.")
        return text
    except TextExtractionError:
        raise
    except Exception as exc:
        raise TextExtractionError(f"Failed to parse DOCX: {exc}") from exc


def _extract_csv(file_bytes: bytes) -> str:
    try:
        decoded = file_bytes.decode("utf-8", errors="replace")
        reader = csv.reader(io.StringIO(decoded))
        rows = list(reader)
        if not rows:
            raise TextExtractionError("CSV file is empty.")
        # Project rows into readable sentences: "col=value, col=value" per row,
        # which reads naturally for NER/regex extraction downstream.
        header = rows[0]
        lines = []
        for row in rows[1:]:
            pairs = [f"{h.strip()}={v.strip()}" for h, v in zip(header, row) if v.strip()]
            if pairs:
                lines.append(", ".join(pairs) + ".")
        return "\n".join(lines)
    except TextExtractionError:
        raise
    except Exception as exc:
        raise TextExtractionError(f"Failed to parse CSV: {exc}") from exc


def _extract_json(file_bytes: bytes) -> str:
    try:
        data = json.loads(file_bytes.decode("utf-8", errors="replace"))
    except Exception as exc:
        raise TextExtractionError(f"Invalid JSON: {exc}") from exc

    lines: list[str] = []

    def _walk(node, prefix=""):
        if isinstance(node, dict):
            for k, v in node.items():
                _walk(v, f"{prefix}{k}.")
        elif isinstance(node, list):
            for item in node:
                _walk(item, prefix)
        else:
            if node is not None and str(node).strip():
                key = prefix.rstrip(".")
                lines.append(f"{key}: {node}." if key else f"{node}.")

    _walk(data)
    if not lines:
        raise TextExtractionError("JSON file contained no usable data.")
    return "\n".join(lines)
