#!/usr/bin/env python3
from __future__ import annotations

import csv
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
NEWS_CSV = ROOT / "data" / "06_news.csv"

INCLUDE_UPDATES = {
    "NEWS-0002": {
        "primary_category": "산업·정책",
        "tags": "LLM|연구|정책|시장",
        "summary_ko": "국내외 전문가가 휴머노이드와 피지컬 AI의 기술·산업 방향을 논의하는 포럼 소식이다. 소셜로봇 상호작용 기술의 중장기 생태계 변화와 연관된 정책/산업 동향으로 포함했다.",
        "archive_candidate": "FALSE",
        "pediatric_relevance": "LOW",
        "clinical_relevance": "LOW",
        "relevance_reason": "피지컬 AI·휴머노이드의 상호작용 기술 로드맵 논의",
    },
    "NEWS-0040": {
        "primary_category": "상호작용 기술",
        "tags": "컴퓨터 비전|감정 인식|멀티모달|신제품|연구",
        "summary_ko": "로봇 후각 센서 기술 공개 예고 기사로, 로봇의 환경 인식 채널 확장을 다룬다. 멀티모달 상호작용 기반 확장 가능성이 있어 상호작용 기술 동향으로 포함했다.",
        "archive_candidate": "FALSE",
        "pediatric_relevance": "LOW",
        "clinical_relevance": "LOW",
        "relevance_reason": "로봇 멀티모달 인식(후각) 기술 확장",
    },
    "NEWS-0055": {
        "primary_category": "상호작용 기술",
        "tags": "촉각|터치|연구",
        "summary_ko": "고해상도 촉각 센싱을 통해 로봇이 표면 정보를 실시간으로 인지하는 연구 동향이다. 신체 접촉 기반 HRI의 핵심 기술로 판단해 포함했다.",
        "archive_candidate": "FALSE",
        "pediatric_relevance": "LOW",
        "clinical_relevance": "LOW",
        "relevance_reason": "촉각 기반 HRI 상호작용 기술 연구",
    },
    "NEWS-0061": {
        "primary_category": "연구·HRI",
        "tags": "LLM|멀티모달|상용화|연구",
        "summary_ko": "범용 로봇을 위한 통합 embodied AI 스택 접근을 설명한 기사다. LLM·행동 모델 연계를 통한 차세대 상호작용 연구 플랫폼 관점에서 포함했다.",
        "archive_candidate": "FALSE",
        "pediatric_relevance": "LOW",
        "clinical_relevance": "LOW",
        "relevance_reason": "LLM 기반 embodied interaction 연구 플랫폼 동향",
    },
}

EXCLUDE_IDS = {
    "NEWS-0017",
    "NEWS-0019",
    "NEWS-0043",
    "NEWS-0044",
    "NEWS-0047",
    "NEWS-0057",
    "NEWS-0067",
    "NEWS-0070",
    "NEWS-0077",
}

REVIEW_IDS = {
    "NEWS-0049",
    "NEWS-0056",
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
            row["relevance_reason"] = "3차 검토: 소셜로봇/HRI 조사 목적과 직접 관련성 낮음"
            row["summary_ko"] = ""
            row["archive_candidate"] = "FALSE"
            row["pediatric_relevance"] = "NONE"
            row["clinical_relevance"] = "NONE"
            continue
        if news_id in REVIEW_IDS:
            row["screening_status"] = "REVIEW"
            row["relevance_reason"] = "3차 검토: 기술 소개는 있으나 소셜/HRI 맥락 추가 확인 필요"
            row["summary_ko"] = ""

    with NEWS_CSV.open("w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=rows[0].keys())
        writer.writeheader()
        writer.writerows(rows)

    print("stage3_review_applied")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
