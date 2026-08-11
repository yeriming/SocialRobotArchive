from __future__ import annotations

import ipaddress
import socket
from urllib.parse import urlparse

ALLOWED_HOSTS = {
    "irobotnews.com",
    "www.irobotnews.com",
    "spectrum.ieee.org",
}

BLOCKED_HOSTS = {"localhost", "0.0.0.0", "::1"}
BLOCKED_SCHEMES = {"file", "ftp", "data", "javascript"}


def _is_private_or_local_ip(hostname: str) -> bool:
    try:
        ip = ipaddress.ip_address(hostname)
    except ValueError:
        ip = None

    if ip is not None:
        return (
            ip.is_private
            or ip.is_loopback
            or ip.is_link_local
            or ip.is_multicast
            or ip.is_reserved
        )

    try:
        addr = socket.gethostbyname(hostname)
    except OSError:
        # DNS lookup failure in restricted environments should not mark an allowlisted
        # host as malicious; runtime fetch layer will still fail closed.
        return False

    ip = ipaddress.ip_address(addr)
    return (
        ip.is_private
        or ip.is_loopback
        or ip.is_link_local
        or ip.is_multicast
        or ip.is_reserved
    )


def validate_allowed_url(url: str) -> tuple[bool, str]:
    if not url:
        return False, "empty_url"

    parsed = urlparse(url.strip())
    if parsed.scheme not in {"http", "https"}:
        return False, "invalid_scheme"
    if parsed.scheme in BLOCKED_SCHEMES:
        return False, "blocked_scheme"
    if not parsed.netloc:
        return False, "missing_host"

    host = parsed.hostname or ""
    if host in BLOCKED_HOSTS:
        return False, "blocked_host"
    if host not in ALLOWED_HOSTS:
        return False, "host_not_allowlisted"
    if _is_private_or_local_ip(host):
        return False, "private_or_local_ip"

    return True, "ok"
