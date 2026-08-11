#!/usr/bin/env python3
"""Generate 01_candidate_robots.csv from saved ui44 companions text."""

from __future__ import annotations

import csv
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE_TXT = ROOT / "data" / "raw" / "ui44" / "companions_page.txt"
OUTPUT_CSV = ROOT / "data" / "01_candidate_robots.csv"
SOURCE_URL = "https://ui44.com/categories/companions"


def parse_table(lines: list[str]) -> dict[str, dict[str, str]]:
    rows: dict[str, dict[str, str]] = {}
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
            cells = [c.strip() for c in line.strip().strip("|").split("|")]
            if len(cells) >= 8:
                rows[cells[0]] = {
                    "manufacturer": cells[1],
                    "status": cells[3],
                }
    return rows


def parse_inventory_names(lines: list[str]) -> list[str]:
    start = next(i for i, v in enumerate(lines) if v.strip() == "### PARO")
    end = next(i for i, v in enumerate(lines) if v.strip() == "Buyer guide")
    return [line[4:].strip() for line in lines[start:end] if line.startswith("### ")]


def screening_decision(name: str) -> tuple[str, str]:
    exclude = {
        "Intelligent Soft-Bodied Bionic Arowana": "사회적 상호작용이 핵심 목적이 아님(수중 전시/연구/촬영 중심)",
        "Beni": "사회적 상호작용보다 촬영/팔로우 주행이 핵심 기능",
        "Flagship Soundwave Auto-Converting Robot": "단순 장난감/엔터테인먼트 성격으로 HRI 연구 적합성 낮음",
    }
    uncertain = {
        "Chess Mini": "사회적 상호작용 중심 소셜로봇 여부 추가 검토 필요",
        "ROVAR X3": "야외 동행 로봇으로 소셜 상호작용 핵심성 추가 검토 필요",
    }
    if name in exclude:
        return "EXCLUDE", exclude[name]
    if name in uncertain:
        return "UNCERTAIN", uncertain[name]
    return "INCLUDE", ""


def main() -> None:
    if not SOURCE_TXT.exists():
        raise FileNotFoundError(f"Source text not found: {SOURCE_TXT}")

    lines = SOURCE_TXT.read_text(encoding="utf-8").splitlines()
    metadata = parse_table(lines)
    names = parse_inventory_names(lines)

    with OUTPUT_CSV.open("w", encoding="utf-8", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(
            [
                "candidate_id",
                "robot_name",
                "model",
                "manufacturer",
                "source_database",
                "source_category",
                "source_url",
                "screening_status",
                "exclusion_reason",
                "duplicate_of",
                "screened_date",
                "notes",
            ]
        )

        for i, name in enumerate(names, start=1):
            status, reason = screening_decision(name)
            writer.writerow(
                [
                    f"CAND-{i:04d}",
                    name,
                    "",
                    metadata.get(name, {}).get("manufacturer", ""),
                    "ui44",
                    "Companions",
                    SOURCE_URL,
                    status,
                    reason,
                    "",
                    "2026-08-11",
                    "Phase 0B 1차 스크리닝",
                ]
            )

    print(f"Wrote {OUTPUT_CSV}")


if __name__ == "__main__":
    main()
