#!/usr/bin/env python3
"""Phase 0B quick summary report for candidate robots."""

from __future__ import annotations

import csv
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CSV_PATH = ROOT / "data" / "01_candidate_robots.csv"


def normalize(text: str) -> str:
    return " ".join(text.lower().strip().split())


def main() -> None:
    with CSV_PATH.open("r", encoding="utf-8-sig", newline="") as f:
        rows = list(csv.DictReader(f))

    counts = Counter(row["screening_status"] for row in rows)
    key_map: dict[tuple[str, str, str], list[str]] = defaultdict(list)

    for row in rows:
        key = (
            normalize(row.get("manufacturer", "")),
            normalize(row.get("robot_name", "")),
            normalize(row.get("model", "")),
        )
        key_map[key].append(row["candidate_id"])

    duplicates = {k: v for k, v in key_map.items() if len(v) > 1}

    print("=== Phase 0B Candidate Summary ===")
    print(f"Total candidates: {len(rows)}")
    print(f"INCLUDE: {counts.get('INCLUDE', 0)}")
    print(f"EXCLUDE: {counts.get('EXCLUDE', 0)}")
    print(f"UNCERTAIN: {counts.get('UNCERTAIN', 0)}")
    print(f"UNSCREENED: {counts.get('UNSCREENED', 0)}")
    print(f"Detected duplicate groups: {len(duplicates)}")

    if duplicates:
        print("\nDuplicate groups:")
        for key, ids in duplicates.items():
            print(f"- key={key} ids={','.join(ids)}")


if __name__ == "__main__":
    main()
