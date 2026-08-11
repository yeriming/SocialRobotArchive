#!/usr/bin/env python3
from __future__ import annotations

import csv
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
NEWS_CSV = ROOT / "data" / "06_news.csv"


def main() -> int:
    if not NEWS_CSV.exists():
        print("06_news.csv 파일이 없습니다.")
        return 1

    rows = list(csv.DictReader(NEWS_CSV.open("r", encoding="utf-8-sig", newline="")))
    status_counts = Counter(row.get("screening_status", "") for row in rows)
    source_counts = Counter(row.get("source_id", "") for row in rows)
    include_rows = [row for row in rows if row.get("screening_status") == "INCLUDE"]

    missing_url = [row["news_id"] for row in include_rows if not row.get("source_url")]
    missing_published_at = [row["news_id"] for row in include_rows if not row.get("published_at")]
    missing_summary = [row["news_id"] for row in include_rows if not row.get("summary_ko")]

    print(f"total_rows={len(rows)}")
    print(f"status_counts={dict(status_counts)}")
    print(f"source_counts={dict(source_counts)}")
    print(f"include_rows={len(include_rows)}")
    print(f"include_missing_source_url={len(missing_url)}")
    print(f"include_missing_published_at={len(missing_published_at)}")
    print(f"include_missing_summary={len(missing_summary)}")

    if missing_url or missing_published_at or missing_summary:
        print("검증 실패: INCLUDE row 필수 필드 누락")
        return 1

    print("NEWS VALIDATION PASSED")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
