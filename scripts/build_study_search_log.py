#!/usr/bin/env python3
from __future__ import annotations

import csv
import json
import urllib.parse
import urllib.request
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ROBOTS_CSV = ROOT / "data" / "02_robots.csv"
OUTPUT_CSV = ROOT / "data" / "07_study_search_log.csv"

PUBMED_ESEARCH_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"


@dataclass
class Robot:
    robot_id: str
    robot_name: str


def read_robots() -> list[Robot]:
    with ROBOTS_CSV.open(encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        return [
            Robot(
                robot_id=(row.get("robot_id") or "").strip(),
                robot_name=(row.get("robot_name") or "").strip(),
            )
            for row in reader
            if (row.get("robot_id") or "").strip() and (row.get("robot_name") or "").strip()
        ]


def pubmed_query(robot_name: str) -> str:
    return (
        f"({robot_name}[Title/Abstract]) AND "
        "(\"social robot\"[Title/Abstract] OR "
        "\"human-robot interaction\"[Title/Abstract] OR "
        "pediatric[Title/Abstract] OR "
        "child[Title/Abstract] OR "
        "clinical[Title/Abstract] OR "
        "therapy[Title/Abstract])"
    )


def generic_query(robot_name: str) -> str:
    return (
        f"\"{robot_name}\" AND "
        "(\"social robot\" OR \"human-robot interaction\" OR pediatric OR child OR clinical OR therapy)"
    )


def fetch_pubmed_count(query: str) -> tuple[str, str]:
    params = urllib.parse.urlencode(
        {
            "db": "pubmed",
            "term": query,
            "retmode": "json",
            "rettype": "count",
        }
    )
    url = f"{PUBMED_ESEARCH_URL}?{params}"
    request = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 (study-search-log-builder)"
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            payload = json.loads(response.read().decode("utf-8", errors="replace"))
        count = payload.get("esearchresult", {}).get("count", "")
        return str(count), "AUTO_COUNTED"
    except Exception as exc:  # pragma: no cover
        return "", f"AUTO_FAILED:{type(exc).__name__}"


def build_db_search_url(db: str, query: str) -> str:
    encoded = urllib.parse.quote(query)
    if db == "IEEE_XPLORE":
        return f"https://ieeexplore.ieee.org/search/searchresult.jsp?queryText={encoded}"
    if db == "ACM_DL":
        return f"https://dl.acm.org/action/doSearch?AllField={encoded}"
    if db == "SCOPUS":
        return f"https://www.scopus.com/results/results.uri?query={encoded}"
    if db == "PUBMED":
        return f"https://pubmed.ncbi.nlm.nih.gov/?term={encoded}"
    raise ValueError(f"Unsupported db: {db}")


def main() -> None:
    robots = read_robots()
    collected_at = datetime.now(timezone.utc).replace(microsecond=0).isoformat()

    rows: list[dict[str, str]] = []
    for robot in robots:
        pm_query = pubmed_query(robot.robot_name)
        pm_count, pm_status = fetch_pubmed_count(pm_query)
        rows.append(
            {
                "collected_at_utc": collected_at,
                "robot_id": robot.robot_id,
                "robot_name": robot.robot_name,
                "db_name": "PUBMED",
                "query": pm_query,
                "search_url": build_db_search_url("PUBMED", pm_query),
                "hit_count": pm_count,
                "status": pm_status,
                "notes": "",
            }
        )

        other_query = generic_query(robot.robot_name)
        for db in ("IEEE_XPLORE", "ACM_DL", "SCOPUS"):
            rows.append(
                {
                    "collected_at_utc": collected_at,
                    "robot_id": robot.robot_id,
                    "robot_name": robot.robot_name,
                    "db_name": db,
                    "query": other_query,
                    "search_url": build_db_search_url(db, other_query),
                    "hit_count": "",
                    "status": "MANUAL_PENDING",
                    "notes": "접근 권한/기관 구독 환경에서 수동 확인 필요",
                }
            )

    OUTPUT_CSV.parent.mkdir(parents=True, exist_ok=True)
    with OUTPUT_CSV.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(
            f,
            fieldnames=[
                "collected_at_utc",
                "robot_id",
                "robot_name",
                "db_name",
                "query",
                "search_url",
                "hit_count",
                "status",
                "notes",
            ],
        )
        writer.writeheader()
        writer.writerows(rows)

    print(f"Wrote {len(rows)} rows to {OUTPUT_CSV}")


if __name__ == "__main__":
    main()
