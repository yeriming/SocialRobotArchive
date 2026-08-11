from __future__ import annotations

import csv
import re
from pathlib import Path


def load_robot_entities(repo_root: Path) -> tuple[dict[str, str], dict[str, str]]:
    robots_path = repo_root / "data" / "02_robots.csv"
    robot_name_to_id: dict[str, str] = {}
    manufacturer_lookup: dict[str, str] = {}

    with robots_path.open("r", encoding="utf-8-sig", newline="") as f:
        for row in csv.DictReader(f):
            robot_id = (row.get("robot_id") or "").strip()
            robot_name = (row.get("robot_name") or "").strip()
            manufacturer = (row.get("manufacturer") or "").strip()
            if robot_id and robot_name:
                robot_name_to_id[robot_name.lower()] = robot_id
            if manufacturer:
                manufacturer_lookup[manufacturer.lower()] = manufacturer

    return robot_name_to_id, manufacturer_lookup


def _contains_term(text: str, term: str) -> bool:
    stripped = term.strip()
    if not stripped:
        return False

    escaped = re.escape(stripped)
    if re.fullmatch(r"[a-z0-9 .&+'-]+", stripped, flags=re.IGNORECASE):
        # English-like names use token boundaries to avoid substring false positives.
        pattern = rf"(?<![a-z0-9]){escaped}(?![a-z0-9])"
        return re.search(pattern, text, flags=re.IGNORECASE) is not None
    return stripped in text


def link_entities(
    text: str,
    robot_name_to_id: dict[str, str],
    manufacturer_lookup: dict[str, str],
) -> tuple[list[str], list[str]]:
    lowered = text.lower()
    linked_robot_ids: list[str] = []
    for robot_name, robot_id in robot_name_to_id.items():
        if len(robot_name) < 4:
            continue
        if _contains_term(lowered, robot_name):
            linked_robot_ids.append(robot_id)

    linked_manufacturers: list[str] = []
    for key, original_name in manufacturer_lookup.items():
        if len(key) < 4:
            continue
        if _contains_term(lowered, key):
            linked_manufacturers.append(original_name)

    return sorted(set(linked_robot_ids)), sorted(set(linked_manufacturers))
