from __future__ import annotations

from dataclasses import dataclass

INCLUDE_KEYWORDS = [
    "social robot",
    "socially assistive",
    "companion robot",
    "human-robot interaction",
    "hri",
    "care robot",
    "interactive humanoid",
    "pediatric",
    "child",
    "children",
    "autism",
    "hospital",
    "rehabilitation",
    "mental health",
    "education",
    "embodied",
    "소셜로봇",
    "소셜 로봇",
    "반려로봇",
    "반려 로봇",
    "돌봄로봇",
    "돌봄 로봇",
    "교육로봇",
    "교육 로봇",
    "대화 로봇",
    "상호작용",
    "소아",
    "아동",
    "병원",
    "재활",
    "자폐",
    "정서",
]

EXCLUDE_KEYWORDS = [
    "industrial robot",
    "factory automation",
    "warehouse",
    "logistics",
    "agv",
    "amr",
    "drone",
    "military",
    "stock",
    "investment",
    "robot arm",
    "component market",
    "manufacturing",
    "공장 자동화",
    "창고 자동화",
    "물류",
    "드론",
    "군사용",
    "주식",
    "투자",
    "부품 시장",
    "산업용",
]


@dataclass
class ScreeningResult:
    status: str
    reason: str


def screen_article(
    text: str,
    has_robot_link: bool,
    has_manufacturer_link: bool,
) -> ScreeningResult:
    lowered = text.lower()
    include_hit = any(keyword in lowered for keyword in INCLUDE_KEYWORDS)
    exclude_hit = any(keyword in lowered for keyword in EXCLUDE_KEYWORDS)

    if has_robot_link or has_manufacturer_link:
        return ScreeningResult("INCLUDE", "기존 아카이브 로봇/제조사와 직접 관련")
    if include_hit and not exclude_hit:
        return ScreeningResult("INCLUDE", "소셜로봇/HRI/돌봄/소아 관련 키워드 확인")
    if exclude_hit and not include_hit:
        return ScreeningResult("EXCLUDE", "산업/물류/비상호작용 중심 기사")
    if include_hit and exclude_hit:
        return ScreeningResult("REVIEW", "포함/제외 신호가 혼재되어 수동 검토 필요")
    if "robot" in lowered or "로봇" in lowered:
        return ScreeningResult("REVIEW", "로봇 기사이나 사회적 상호작용 관련성 불명확")
    return ScreeningResult("EXCLUDE", "소셜로봇/HRI 목적과 직접 관련성 낮음")
