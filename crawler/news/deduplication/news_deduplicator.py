from __future__ import annotations

import hashlib
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

TRACKING_PREFIXES = ("utm_",)
TRACKING_KEYS = {"fbclid", "gclid"}


def canonicalize_url(url: str) -> str:
    parts = urlsplit(url.strip())
    clean_query = []
    for key, value in parse_qsl(parts.query, keep_blank_values=True):
        key_lower = key.lower()
        if key_lower in TRACKING_KEYS or any(key_lower.startswith(prefix) for prefix in TRACKING_PREFIXES):
            continue
        clean_query.append((key, value))
    clean_parts = (
        parts.scheme.lower(),
        parts.netloc.lower(),
        parts.path,
        urlencode(clean_query, doseq=True),
        "",
    )
    return urlunsplit(clean_parts)


def content_hash(source_id: str, title: str, canonical_url: str, published_at: str) -> str:
    payload = "|".join([source_id.strip(), title.strip().lower(), canonical_url.strip(), published_at.strip()])
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()
