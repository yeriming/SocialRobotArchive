from __future__ import annotations

from dataclasses import dataclass
from typing import Mapping

MAX_RESPONSE_BYTES = 2_500_000
ALLOWED_CONTENT_TYPES = {
    "application/rss+xml",
    "application/xml",
    "text/xml",
    "text/html",
}


@dataclass
class GuardResult:
    allowed: bool
    reason: str


def validate_response_headers(headers: Mapping[str, str]) -> GuardResult:
    content_type = (headers.get("Content-Type") or headers.get("content-type") or "").lower()
    if not content_type:
        return GuardResult(False, "missing_content_type")
    if not any(content_type.startswith(allowed) for allowed in ALLOWED_CONTENT_TYPES):
        return GuardResult(False, f"blocked_content_type:{content_type}")

    content_length_raw = headers.get("Content-Length") or headers.get("content-length") or ""
    if content_length_raw.isdigit() and int(content_length_raw) > MAX_RESPONSE_BYTES:
        return GuardResult(False, "response_too_large")

    return GuardResult(True, "ok")
