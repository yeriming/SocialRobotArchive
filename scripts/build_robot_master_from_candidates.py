#!/usr/bin/env python3
"""Build 02_robots.csv and 05_sources.csv from screened candidates."""

from __future__ import annotations

import csv
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"

CANDIDATE_CSV = DATA_DIR / "01_candidate_robots.csv"
ROBOTS_CSV = DATA_DIR / "02_robots.csv"
SOURCES_CSV = DATA_DIR / "05_sources.csv"
UI44_RAW = DATA_DIR / "raw" / "ui44" / "companions_page.txt"

UI44_SOURCE_NAME = "ui44 Companions"
UI44_SOURCE_URL = "https://ui44.com/categories/companions"
RETRIEVED_DATE = "2026-08-11"


def parse_ui44_status_table() -> dict[str, str]:
    """Return robot_name -> ui44 status string from the saved markdown table."""
    lines = UI44_RAW.read_text(encoding="utf-8").splitlines()
    status_map: dict[str, str] = {}
    in_table = False
    for line in lines:
        if line.strip().startswith("| Robot | Manufacturer | Price | Status |"):
            in_table = True
            continue
        if in_table:
            if not line.strip().startswith("|"):
                break
            if line.strip().startswith("| ---"):
                continue
            cells = [cell.strip() for cell in line.strip().strip("|").split("|")]
            if len(cells) >= 4:
                status_map[cells[0]] = cells[3]
    return status_map


def map_status(ui44_status: str) -> str:
    """Map ui44 status to project enum without guessing unavailable details."""
    normalized = ui44_status.strip().lower()
    if normalized == "available":
        return "판매중"
    if normalized == "discontinued":
        return "판매중단"
    if normalized in {"prototype", "development", "pre-order"}:
        return "개발중"
    if normalized == "active":
        return "정보확인필요"
    return "정보확인필요"


def main() -> None:
    status_map = parse_ui44_status_table()

    with CANDIDATE_CSV.open("r", encoding="utf-8-sig", newline="") as f:
        candidates = list(csv.DictReader(f))

    include_rows = [row for row in candidates if row["screening_status"] == "INCLUDE"]

    robot_headers = next(csv.reader(ROBOTS_CSV.open("r", encoding="utf-8-sig", newline="")))
    source_headers = next(csv.reader(SOURCES_CSV.open("r", encoding="utf-8-sig", newline="")))

    robot_records: list[dict[str, str]] = []
    source_records: list[dict[str, str]] = []

    for idx, row in enumerate(include_rows, start=1):
        robot_id = f"ROBOT-{idx:04d}"
        robot_name = row["robot_name"]
        status = map_status(status_map.get(robot_name, ""))

        robot_record = {header: "" for header in robot_headers}
        robot_record.update(
            {
                "robot_id": robot_id,
                "robot_name": robot_name,
                "model": row["model"],
                "manufacturer": row["manufacturer"],
                "status": status,
                "source_database": row["source_database"],
                "source_database_url": row["source_url"],
                "verification_status": "UNVERIFIED",
                "notes": "IMPORTED from ui44 Companions candidate screening",
            }
        )
        robot_records.append(robot_record)

        source_record = {header: "" for header in source_headers}
        source_record.update(
            {
                "source_id": f"SRC-{idx:04d}",
                "robot_id": robot_id,
                "related_entity_type": "robot",
                "related_entity_id": robot_id,
                "source_type": "robot_database",
                "source_name": UI44_SOURCE_NAME,
                "source_url": UI44_SOURCE_URL,
                "information_type": "identity",
                "retrieved_date": RETRIEVED_DATE,
                "verification_status": "UNVERIFIED",
                "notes": f"IMPORTED from candidate_id={row['candidate_id']}",
            }
        )
        source_records.append(source_record)

    with ROBOTS_CSV.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=robot_headers)
        writer.writeheader()
        writer.writerows(robot_records)

    with SOURCES_CSV.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=source_headers)
        writer.writeheader()
        writer.writerows(source_records)

    print(f"Built {len(robot_records)} robots into {ROBOTS_CSV.name}")
    print(f"Built {len(source_records)} sources into {SOURCES_CSV.name}")


if __name__ == "__main__":
    main()
