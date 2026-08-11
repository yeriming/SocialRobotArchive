#!/usr/bin/env python3
from __future__ import annotations

import csv
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
NEWS_CSV = ROOT / "data" / "06_news.csv"

FINAL_EXCLUDE = {
    "NEWS-0049": "모터 없는 로봇 메커니즘 연구로, 소셜 상호작용/HRI 맥락이 직접적이지 않음",
    "NEWS-0056": "일반 로봇 AI 인프라 기술 기사로, 소셜로봇 상호작용 적용이 본문에서 직접 확인되지 않음",
}


def main() -> int:
    rows = list(csv.DictReader(NEWS_CSV.open("r", encoding="utf-8-sig", newline="")))

    for row in rows:
        news_id = row["news_id"]
        if news_id not in FINAL_EXCLUDE:
            continue
        row["screening_status"] = "EXCLUDE"
        row["relevance_reason"] = f"4차 확정: {FINAL_EXCLUDE[news_id]}"
        row["summary_ko"] = ""
        row["archive_candidate"] = "FALSE"
        row["pediatric_relevance"] = "NONE"
        row["clinical_relevance"] = "NONE"

    with NEWS_CSV.open("w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=rows[0].keys())
        writer.writeheader()
        writer.writerows(rows)

    print("stage4_review_applied")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
