#!/usr/bin/env python3
"""CSV archive validator for Social Robot Archive dataset."""

from __future__ import annotations

import csv
import json
import re
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
TAXONOMY_PATH = ROOT / "lib" / "taxonomy" / "enums.json"


EXPECTED_HEADERS = {
    "01_candidate_robots.csv": [
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
    ],
    "02_robots.csv": [
        "robot_id",
        "robot_name",
        "model",
        "manufacturer",
        "manufacturer_country",
        "release_year",
        "status",
        "robot_type",
        "height_cm",
        "width_cm",
        "depth_cm",
        "weight_kg",
        "mobility",
        "dof",
        "battery_runtime_min",
        "camera",
        "depth_camera",
        "microphone",
        "microphone_array",
        "speaker",
        "touch_sensor",
        "proximity_sensor",
        "lidar",
        "imu",
        "other_sensors",
        "display",
        "processor",
        "operating_system",
        "speech_input",
        "speech_recognition",
        "speaker_localization",
        "face_recognition",
        "emotion_recognition",
        "gaze_recognition",
        "gesture_recognition",
        "object_recognition",
        "distance_recognition",
        "speech_output",
        "facial_expression",
        "gaze_expression",
        "head_movement",
        "arm_gesture",
        "body_movement",
        "led_expression",
        "screen_expression",
        "touch_interaction",
        "physical_contact",
        "object_manipulation",
        "sdk",
        "api_available",
        "ros_support",
        "programmable",
        "external_api",
        "llm_integration",
        "primary_target",
        "primary_domain",
        "pediatric_relevance",
        "healthcare_relevance",
        "pediatric_study_exists",
        "clinical_study_exists",
        "general_hri_study_exists",
        "source_database",
        "source_database_url",
        "official_url",
        "spec_source_url",
        "verification_status",
        "last_verified",
        "notes",
    ],
    "03_prices.csv": [
        "price_id",
        "robot_id",
        "vendor",
        "vendor_country",
        "vendor_type",
        "offer_type",
        "condition",
        "price_original",
        "currency",
        "price_krw",
        "rental_price",
        "rental_period",
        "academic_discount",
        "availability",
        "shipping_to_korea",
        "source_url",
        "checked_date",
        "notes",
    ],
    "04_studies.csv": [
        "study_id",
        "robot_id",
        "title",
        "authors",
        "year",
        "venue",
        "doi",
        "url",
        "country",
        "institution",
        "study_type",
        "participant_type",
        "condition",
        "age_min",
        "age_max",
        "sample_size",
        "setting",
        "research_purpose",
        "robot_role",
        "interaction_modalities",
        "autonomy_level",
        "session_duration_min",
        "number_of_sessions",
        "individual_or_group",
        "parent_present",
        "clinician_present",
        "outcome_category",
        "result_direction",
        "result_summary_ko",
        "pediatric",
        "clinical",
        "evidence_level",
        "notes",
    ],
    "05_sources.csv": [
        "source_id",
        "robot_id",
        "related_entity_type",
        "related_entity_id",
        "source_type",
        "source_name",
        "source_url",
        "information_type",
        "retrieved_date",
        "verification_status",
        "notes",
    ],
}


@dataclass
class ValidationError:
    filename: str
    row: int
    field: str
    message: str


def load_csv(filename: str) -> list[dict[str, str]]:
    path = DATA_DIR / filename
    if not path.exists():
        raise FileNotFoundError(f"Missing dataset file: {filename}")
    with path.open("r", encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        rows = list(reader)
        header = reader.fieldnames or []
    expected = EXPECTED_HEADERS[filename]
    if header != expected:
        raise ValueError(f"{filename} header mismatch.\nExpected: {expected}\nActual:   {header}")
    return rows


def add_enum_errors(
    errors: list[ValidationError],
    filename: str,
    rows: Iterable[dict[str, str]],
    field: str,
    allowed: set[str],
) -> None:
    for idx, row in enumerate(rows, start=2):
        value = row.get(field, "")
        if value and value not in allowed:
            errors.append(ValidationError(filename, idx, field, f"Invalid enum value: {value}"))


def add_date_errors(errors: list[ValidationError], filename: str, rows: Iterable[dict[str, str]], field: str) -> None:
    pattern = re.compile(r"^\d{4}-\d{2}-\d{2}$")
    for idx, row in enumerate(rows, start=2):
        value = row.get(field, "")
        if value and not pattern.match(value):
            errors.append(ValidationError(filename, idx, field, f"Invalid date format (YYYY-MM-DD): {value}"))


def add_url_errors(errors: list[ValidationError], filename: str, rows: Iterable[dict[str, str]], fields: list[str]) -> None:
    for idx, row in enumerate(rows, start=2):
        for field in fields:
            value = row.get(field, "")
            if value and not (value.startswith("http://") or value.startswith("https://")):
                errors.append(ValidationError(filename, idx, field, f"Invalid URL: {value}"))


def add_unique_id_errors(errors: list[ValidationError], filename: str, rows: list[dict[str, str]], field: str) -> None:
    seen: set[str] = set()
    for idx, row in enumerate(rows, start=2):
        value = row.get(field, "")
        if not value:
            errors.append(ValidationError(filename, idx, field, "Missing required ID"))
            continue
        if value in seen:
            errors.append(ValidationError(filename, idx, field, f"Duplicate ID: {value}"))
        seen.add(value)


def main() -> int:
    taxonomy = json.loads(TAXONOMY_PATH.read_text(encoding="utf-8"))
    errors: list[ValidationError] = []

    candidates = load_csv("01_candidate_robots.csv")
    robots = load_csv("02_robots.csv")
    prices = load_csv("03_prices.csv")
    studies = load_csv("04_studies.csv")
    sources = load_csv("05_sources.csv")

    add_unique_id_errors(errors, "01_candidate_robots.csv", candidates, "candidate_id")
    add_unique_id_errors(errors, "02_robots.csv", robots, "robot_id")
    add_unique_id_errors(errors, "03_prices.csv", prices, "price_id")
    add_unique_id_errors(errors, "04_studies.csv", studies, "study_id")
    add_unique_id_errors(errors, "05_sources.csv", sources, "source_id")

    add_enum_errors(errors, "01_candidate_robots.csv", candidates, "screening_status", set(taxonomy["screening_status"]))
    add_enum_errors(errors, "02_robots.csv", robots, "status", set(taxonomy["robot_status"]))
    add_enum_errors(errors, "02_robots.csv", robots, "robot_type", set(taxonomy["robot_type"]))
    add_enum_errors(errors, "02_robots.csv", robots, "verification_status", set(taxonomy["verification_status"]))
    add_enum_errors(errors, "03_prices.csv", prices, "vendor_type", set(taxonomy["vendor_type"]))
    add_enum_errors(errors, "03_prices.csv", prices, "offer_type", set(taxonomy["offer_type"]))
    add_enum_errors(errors, "03_prices.csv", prices, "availability", set(taxonomy["availability"]))
    add_enum_errors(errors, "04_studies.csv", studies, "study_type", set(taxonomy["study_type"]))
    add_enum_errors(errors, "04_studies.csv", studies, "participant_type", set(taxonomy["participant_type"]))
    add_enum_errors(errors, "04_studies.csv", studies, "setting", set(taxonomy["setting"]))
    add_enum_errors(errors, "04_studies.csv", studies, "autonomy_level", set(taxonomy["autonomy_level"]))
    add_enum_errors(errors, "04_studies.csv", studies, "evidence_level", set(taxonomy["evidence_level"]))
    add_enum_errors(errors, "05_sources.csv", sources, "source_type", set(taxonomy["source_type"]))
    add_enum_errors(errors, "05_sources.csv", sources, "information_type", set(taxonomy["information_type"]))
    add_enum_errors(errors, "05_sources.csv", sources, "verification_status", set(taxonomy["verification_status"]))

    add_date_errors(errors, "01_candidate_robots.csv", candidates, "screened_date")
    add_date_errors(errors, "02_robots.csv", robots, "last_verified")
    add_date_errors(errors, "03_prices.csv", prices, "checked_date")
    add_date_errors(errors, "05_sources.csv", sources, "retrieved_date")

    add_url_errors(errors, "01_candidate_robots.csv", candidates, ["source_url"])
    add_url_errors(errors, "02_robots.csv", robots, ["source_database_url", "official_url", "spec_source_url"])
    add_url_errors(errors, "03_prices.csv", prices, ["source_url"])
    add_url_errors(errors, "04_studies.csv", studies, ["url"])
    add_url_errors(errors, "05_sources.csv", sources, ["source_url"])

    robot_ids = {row["robot_id"] for row in robots if row.get("robot_id")}
    for idx, row in enumerate(prices, start=2):
        robot_id = row.get("robot_id", "")
        if robot_id and robot_id not in robot_ids:
            errors.append(ValidationError("03_prices.csv", idx, "robot_id", f"Unknown foreign key: {robot_id}"))
    for idx, row in enumerate(studies, start=2):
        robot_id = row.get("robot_id", "")
        if robot_id and robot_id not in robot_ids:
            errors.append(ValidationError("04_studies.csv", idx, "robot_id", f"Unknown foreign key: {robot_id}"))
    for idx, row in enumerate(sources, start=2):
        robot_id = row.get("robot_id", "")
        if robot_id and robot_id not in robot_ids:
            errors.append(ValidationError("05_sources.csv", idx, "robot_id", f"Unknown foreign key: {robot_id}"))

    if errors:
        print("VALIDATION FAILED")
        for err in errors:
            print(f"{err.filename}:{err.row}:{err.field} - {err.message}")
        return 1

    print("VALIDATION PASSED")
    return 0


if __name__ == "__main__":
    sys.exit(main())
