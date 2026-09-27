from typing import Any, Optional

from pydantic import BaseModel


class ErrorDetail(BaseModel):
    code: str
    message: str


class ErrorResponse(BaseModel):
    success: bool = False
    error: ErrorDetail


class DisclaimerMixin:
    AI_DISCLAIMER: str = (
        "AI-generated intelligence is an investigative aid and requires "
        "verification by authorized personnel."
    )
