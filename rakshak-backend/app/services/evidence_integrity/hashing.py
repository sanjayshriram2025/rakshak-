"""SHA-256 hashing helpers for evidence integrity."""
import hashlib


def sha256_hex(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()
