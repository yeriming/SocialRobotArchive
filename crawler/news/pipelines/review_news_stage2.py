#!/usr/bin/env python3
from __future__ import annotations

import csv
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
NEWS_CSV = ROOT / "data" / "06_news.csv"

INCLUDE_UPDATES = {
    "NEWS-0006": {
        "primary_category": "소아·교육",
        "tags": "소아|교육|실증",
        "summary_ko": "국립어린이과학관이 여름방학 프로그램으로 AI 로봇 체험 공간을 운영한다. 아동 대상 상호작용형 로봇 활용 확산을 보여주는 교육 현장 사례로 분류했다.",
        "archive_candidate": "FALSE",
        "pediatric_relevance": "HIGH",
        "clinical_relevance": "LOW",
        "relevance_reason": "아동 대상 상호작용형 로봇 교육/체험 사례",
    },
    "NEWS-0069": {
        "primary_category": "상호작용 기술",
        "tags": "음성|감정 인식|상용화|시장",
        "summary_ko": "Amazon Astro 사례를 통해 로봇의 음성/정서적 상호작용 설계 요소를 다룬 기사다. 소셜 상호작용 품질이 제품 수용성에 미치는 영향을 보여주는 동향으로 분류했다.",
        "archive_candidate": "TRUE",
        "pediatric_relevance": "LOW",
        "clinical_relevance": "LOW",
        "relevance_reason": "소셜 상호작용 중심의 상용 로봇 사례",
    },
    "NEWS-0071": {
        "primary_category": "상호작용 기술",
        "tags": "LLM|컴퓨터 비전|감정 인식|연구",
        "summary_ko": "시각-언어 모델을 이용해 로봇이 인간 감정을 해석하도록 학습시키는 연구를 다룬다. HRI 핵심 영역인 감정 인식 기반 상호작용 기술 동향으로 포함했다.",
        "archive_candidate": "FALSE",
        "pediatric_relevance": "LOW",
        "clinical_relevance": "LOW",
        "relevance_reason": "감정 인식 기반 HRI 기술 연구",
    },
    "NEWS-0074": {
        "primary_category": "의료·돌봄",
        "tags": "노인|돌봄|임상|상용화",
        "summary_ko": "시니어 케어 맥락에서 웰니스 로봇 자율성 정의를 제시한 기사다. 돌봄 현장 적용성과 운영 모델을 다루는 의료·돌봄 동향으로 분류했다.",
        "archive_candidate": "FALSE",
        "pediatric_relevance": "NONE",
        "clinical_relevance": "HIGH",
        "relevance_reason": "돌봄/케어 환경의 사회적 상호작용 로봇 적용",
    },
}

EXCLUDE_IDS = {
    "NEWS-0001",
    "NEWS-0007",
    "NEWS-0008",
    "NEWS-0009",
    "NEWS-0010",
    "NEWS-0011",
    "NEWS-0013",
    "NEWS-0015",
    "NEWS-0018",
    "NEWS-0020",
    "NEWS-0021",
    "NEWS-0024",
    "NEWS-0025",
    "NEWS-0028",
    "NEWS-0030",
    "NEWS-0032",
    "NEWS-0034",
    "NEWS-0037",
    "NEWS-0039",
    "NEWS-0042",
    "NEWS-0058",
    "NEWS-0059",
    "NEWS-0060",
    "NEWS-0062",
    "NEWS-0064",
    "NEWS-0066",
    "NEWS-0068",
    "NEWS-0072",
    "NEWS-0073",
    "NEWS-0076",
}

REVIEW_IDS = {
    "NEWS-0002",
    "NEWS-0017",
    "NEWS-0019",
    "NEWS-0040",
}


def main() -> int:
    rows = list(csv.DictReader(NEWS_CSV.open("r", encoding="utf-8-sig", newline="")))

    for row in rows:
        news_id = row["news_id"]

        if news_id in INCLUDE_UPDATES:
            row["screening_status"] = "INCLUDE"
            row.update(INCLUDE_UPDATES[news_id])
            continue

        if news_id in EXCLUDE_IDS:
            row["screening_status"] = "EXCLUDE"
            row["relevance_reason"] = "2차 검토: 소셜로봇/HRI 핵심 범위와 직접 관련성 낮음"
            row["summary_ko"] = ""
            row["archive_candidate"] = "FALSE"
            row["pediatric_relevance"] = "NONE"
            row["clinical_relevance"] = "NONE"
            continue

        if news_id in REVIEW_IDS:
            row["screening_status"] = "REVIEW"
            row["relevance_reason"] = "2차 검토: 소셜로봇/HRI 연관 가능성이 있어 수동 판정 필요"
            row["summary_ko"] = ""
            continue

    with NEWS_CSV.open("w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=rows[0].keys())
        writer.writeheader()
        writer.writerows(rows)

    print("stage2_review_applied")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
