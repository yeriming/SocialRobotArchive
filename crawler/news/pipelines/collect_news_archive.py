#!/usr/bin/env python3
from __future__ import annotations

import argparse
import csv
from dataclasses import dataclass
from datetime import datetime, timezone
import ssl
import sys
from pathlib import Path
from typing import Iterable
import urllib.request

ROOT = Path(__file__).resolve().parents[3]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from crawler.news.classification.news_classifier import (
    classify_primary_category,
    classify_relevance_levels,
    classify_tags,
)
from crawler.news.deduplication.news_deduplicator import canonicalize_url, content_hash
from crawler.news.entities.robot_linker import load_robot_entities, link_entities
from crawler.news.filters.date_filter import is_in_news_period
from crawler.news.filters.social_robot_filter import screen_article
from crawler.news.parsers.rss_parser import FeedItem, parse_rss_items
from crawler.news.security.response_guard import MAX_RESPONSE_BYTES, validate_response_headers
from crawler.news.security.url_validator import validate_allowed_url

OUTPUT_CSV = ROOT / "data" / "06_news.csv"
DATE_TODAY = datetime.now(timezone.utc).strftime("%Y-%m-%d")

SOURCE_FEEDS = [
    ("IROBOTNEWS", "KR", "https://www.irobotnews.com/rss/allArticle.xml"),
    ("IROBOTNEWS", "KR", "https://www.irobotnews.com/rss/S1N1.xml"),
    ("IEEE_SPECTRUM", "GLOBAL", "https://spectrum.ieee.org/feeds/topic/robotics.rss"),
]

CSV_HEADERS = [
    "news_id",
    "source_id",
    "region",
    "title",
    "author",
    "published_at",
    "source_category",
    "source_url",
    "primary_category",
    "tags",
    "summary_ko",
    "robot_ids",
    "manufacturer_ids",
    "archive_candidate",
    "pediatric_relevance",
    "clinical_relevance",
    "screening_status",
    "relevance_reason",
    "collected_at",
    "last_verified",
    "content_hash",
]


@dataclass
class FetchStats:
    requested_pages: int = 0
    successful_requests: int = 0
    failed_requests: int = 0
    security_blocks: int = 0


def fetch_url(url: str, allow_insecure_ssl: bool, stats: FetchStats) -> str:
    stats.requested_pages += 1
    is_allowed, reason = validate_allowed_url(url)
    if not is_allowed:
        stats.security_blocks += 1
        raise RuntimeError(f"blocked_url:{reason}:{url}")

    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 (compatible; SocialRobotArchiveBot/1.0; +https://github.com/yeriming/SocialRobotArchive)"
        },
        method="GET",
    )
    ctx = ssl._create_unverified_context() if allow_insecure_ssl else ssl.create_default_context()

    try:
        with urllib.request.urlopen(req, context=ctx, timeout=20) as response:
            header_check = validate_response_headers(dict(response.headers.items()))
            if not header_check.allowed:
                stats.security_blocks += 1
                raise RuntimeError(f"blocked_response:{header_check.reason}:{url}")
            payload = response.read(MAX_RESPONSE_BYTES + 1)
            if len(payload) > MAX_RESPONSE_BYTES:
                stats.security_blocks += 1
                raise RuntimeError(f"blocked_response:response_too_large:{url}")
            stats.successful_requests += 1
            return payload.decode("utf-8", errors="replace")
    except Exception as exc:
        stats.failed_requests += 1
        raise RuntimeError(f"request_failed:{url}:{exc}") from exc


def build_summary(
    source_id: str,
    title: str,
    primary_category: str,
    linked_robot_ids: list[str],
    screening_status: str,
) -> str:
    if screening_status != "INCLUDE":
        return ""
    if linked_robot_ids:
        return (
            f"{source_id} 기사에서 '{title}' 이슈를 다루며, "
            f"기존 아카이브 로봇({', '.join(linked_robot_ids)})과 연관된 {primary_category} 동향으로 분류했다."
        )
    return f"{source_id} 기사 '{title}'를 {primary_category} 동향으로 분류했으며, 신규 후보 여부를 검토 대상으로 기록했다."


def collect_feed_items(allow_insecure_ssl: bool) -> tuple[list[FeedItem], FetchStats]:
    all_items: list[FeedItem] = []
    stats = FetchStats()
    for source_id, region, url in SOURCE_FEEDS:
        xml_text = fetch_url(url, allow_insecure_ssl=allow_insecure_ssl, stats=stats)
        all_items.extend(parse_rss_items(xml_text, source_id=source_id, region=region))
    return all_items, stats


def write_news_rows(rows: Iterable[dict[str, str]]) -> None:
    OUTPUT_CSV.parent.mkdir(parents=True, exist_ok=True)
    with OUTPUT_CSV.open("w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=CSV_HEADERS)
        writer.writeheader()
        writer.writerows(rows)


def main() -> int:
    parser = argparse.ArgumentParser(description="Collect static news archive for 2026-06 to 2026-08.")
    parser.add_argument(
        "--allow-insecure-ssl",
        action="store_true",
        help="Disable TLS certificate validation (only for restricted local environments).",
    )
    args = parser.parse_args()

    feed_items, fetch_stats = collect_feed_items(allow_insecure_ssl=args.allow_insecure_ssl)
    robot_name_to_id, manufacturers = load_robot_entities(ROOT)

    dedup_seen: set[str] = set()
    rows: list[dict[str, str]] = []
    counts = {"candidate": 0, "INCLUDE": 0, "EXCLUDE": 0, "REVIEW": 0, "duplicates": 0}

    for item in sorted(feed_items, key=lambda x: x.published_at, reverse=True):
        if not is_in_news_period(item.published_at):
            continue

        canonical_url = canonicalize_url(item.link)
        normalized_text = f"{item.title}\n{item.description}"
        linked_robot_ids, linked_manufacturers = link_entities(normalized_text, robot_name_to_id, manufacturers)
        screening = screen_article(
            normalized_text,
            has_robot_link=bool(linked_robot_ids),
            has_manufacturer_link=bool(linked_manufacturers),
        )

        published_at_str = item.published_at.strftime("%Y-%m-%d %H:%M:%S")
        row_hash = content_hash(item.source_id, item.title, canonical_url, published_at_str)
        if row_hash in dedup_seen:
            counts["duplicates"] += 1
            continue
        dedup_seen.add(row_hash)

        primary_category = classify_primary_category(normalized_text)
        tags = classify_tags(normalized_text)
        pediatric_relevance, clinical_relevance = classify_relevance_levels(normalized_text)

        archive_candidate = "FALSE"
        if screening.status == "INCLUDE" and not linked_robot_ids:
            if "social robot" in normalized_text.lower() or "소셜로봇" in normalized_text.lower():
                archive_candidate = "TRUE"

        rows.append(
            {
                "news_id": "",
                "source_id": item.source_id,
                "region": item.region,
                "title": item.title,
                "author": item.author,
                "published_at": published_at_str,
                "source_category": item.source_category,
                "source_url": canonical_url,
                "primary_category": primary_category,
                "tags": "|".join(tags),
                "summary_ko": build_summary(
                    item.source_id, item.title, primary_category, linked_robot_ids, screening.status
                ),
                "robot_ids": "|".join(linked_robot_ids),
                "manufacturer_ids": "|".join(linked_manufacturers),
                "archive_candidate": archive_candidate,
                "pediatric_relevance": pediatric_relevance,
                "clinical_relevance": clinical_relevance,
                "screening_status": screening.status,
                "relevance_reason": screening.reason,
                "collected_at": DATE_TODAY,
                "last_verified": DATE_TODAY,
                "content_hash": row_hash,
            }
        )
        counts["candidate"] += 1
        counts[screening.status] += 1

    for idx, row in enumerate(sorted(rows, key=lambda r: r["published_at"], reverse=True), start=1):
        row["news_id"] = f"NEWS-{idx:04d}"

    write_news_rows(rows)

    print("NEWS COLLECTION COMPLETED")
    print(f"requested_pages={fetch_stats.requested_pages}")
    print(f"successful_requests={fetch_stats.successful_requests}")
    print(f"failed_requests={fetch_stats.failed_requests}")
    print(f"security_blocks={fetch_stats.security_blocks}")
    print(f"candidate_articles={counts['candidate']}")
    print(f"included_articles={counts['INCLUDE']}")
    print(f"excluded_articles={counts['EXCLUDE']}")
    print(f"review_articles={counts['REVIEW']}")
    print(f"duplicate_articles={counts['duplicates']}")
    print(f"output_csv={OUTPUT_CSV}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
