from __future__ import annotations

CATEGORY_RULES = [
    ("소아·교육", ["pediatric", "child", "children", "school", "education", "소아", "아동", "교육"]),
    ("의료·돌봄", ["hospital", "patient", "clinical", "care", "rehabilitation", "병원", "환자", "임상", "돌봄", "재활"]),
    ("상호작용 기술", ["llm", "voice", "multimodal", "gesture", "emotion", "interaction", "대화", "음성", "멀티모달", "제스처", "감정", "상호작용"]),
    ("연구·HRI", ["hri", "study", "research", "trial", "실험", "연구"]),
    ("산업·정책", ["policy", "regulation", "ban", "market", "policy", "정책", "규제", "시장"]),
]

TAG_RULES = [
    ("소아", ["pediatric", "child", "children", "소아", "아동"]),
    ("병원", ["hospital", "clinic", "병원", "임상"]),
    ("자폐 스펙트럼", ["autism", "asd", "자폐"]),
    ("정신건강", ["mental health", "정신건강"]),
    ("교육", ["education", "school", "교육"]),
    ("노인", ["elderly", "senior", "노인"]),
    ("재활", ["rehabilitation", "재활"]),
    ("돌봄", ["care", "caregiver", "돌봄"]),
    ("음성", ["voice", "speech", "음성", "대화"]),
    ("LLM", ["llm", "large language model"]),
    ("컴퓨터 비전", ["vision", "computer vision", "비전", "영상"]),
    ("감정 인식", ["emotion", "affect", "감정"]),
    ("시선", ["gaze", "eye contact", "시선"]),
    ("제스처", ["gesture", "제스처"]),
    ("터치", ["touch", "haptic", "터치"]),
    ("촉각", ["tactile", "촉각"]),
    ("멀티모달", ["multimodal", "멀티모달"]),
    ("신제품", ["launch", "new robot", "신제품", "출시"]),
    ("상용화", ["commercial", "deployment", "상용화"]),
    ("연구", ["research", "study", "연구"]),
    ("임상", ["clinical", "trial", "임상"]),
    ("실증", ["pilot", "field test", "실증"]),
    ("정책", ["policy", "regulation", "ban", "정책", "규제"]),
    ("시장", ["market", "industry", "시장"]),
]


def classify_primary_category(text: str) -> str:
    lowered = text.lower()
    for category, keywords in CATEGORY_RULES:
        if any(keyword in lowered for keyword in keywords):
            return category
    return "제품·출시"


def classify_tags(text: str) -> list[str]:
    lowered = text.lower()
    tags: list[str] = []
    for tag, keywords in TAG_RULES:
        if any(keyword in lowered for keyword in keywords):
            tags.append(tag)
    return tags


def classify_relevance_levels(text: str) -> tuple[str, str]:
    lowered = text.lower()
    pediatric = "NONE"
    clinical = "NONE"

    if any(k in lowered for k in ["pediatric", "child", "children", "소아", "아동", "자폐"]):
        pediatric = "HIGH"
    elif "education" in lowered or "교육" in lowered:
        pediatric = "MEDIUM"

    if any(k in lowered for k in ["clinical", "hospital", "patient", "rehabilitation", "임상", "병원", "환자", "재활"]):
        clinical = "HIGH"
    elif "care" in lowered or "돌봄" in lowered:
        clinical = "MEDIUM"

    return pediatric, clinical
