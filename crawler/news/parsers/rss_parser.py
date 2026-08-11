from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
import xml.etree.ElementTree as ET


@dataclass
class FeedItem:
    source_id: str
    region: str
    title: str
    link: str
    author: str
    source_category: str
    published_at: datetime
    description: str


def _parse_published_at(value: str) -> datetime | None:
    if not value:
        return None
    clean = value.strip()
    for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%d %H:%M"):
        try:
            dt = datetime.strptime(clean, fmt)
            return dt.replace(tzinfo=timezone.utc)
        except ValueError:
            pass
    try:
        dt = parsedate_to_datetime(clean)
        if not dt.tzinfo:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.astimezone(timezone.utc)
    except (TypeError, ValueError):
        return None


def parse_rss_items(
    xml_text: str,
    source_id: str,
    region: str,
) -> list[FeedItem]:
    root = ET.fromstring(xml_text)
    items: list[FeedItem] = []

    channel = root.find("channel")
    if channel is None:
        return items

    for item in channel.findall("item"):
        title = (item.findtext("title") or "").strip()
        link = (item.findtext("link") or "").strip()
        category = (item.findtext("category") or "").strip()
        author = (
            (item.findtext("{http://purl.org/dc/elements/1.1/creator") or "").strip()
            or (item.findtext("author") or "").strip()
        )
        description = (item.findtext("description") or "").strip()
        published_raw = (item.findtext("pubDate") or "").strip()
        published_at = _parse_published_at(published_raw)
        if not title or not link or published_at is None:
            continue
        items.append(
            FeedItem(
                source_id=source_id,
                region=region,
                title=title,
                link=link,
                author=author,
                source_category=category,
                published_at=published_at,
                description=description,
            )
        )

    return items
