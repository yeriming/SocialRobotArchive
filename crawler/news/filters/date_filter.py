from __future__ import annotations

from datetime import datetime, timezone

PERIOD_START = datetime(2026, 6, 1, 0, 0, 0, tzinfo=timezone.utc)
PERIOD_END = datetime(2026, 8, 31, 23, 59, 59, tzinfo=timezone.utc)


def is_in_news_period(published_at: datetime) -> bool:
    return PERIOD_START <= published_at <= PERIOD_END
