# Social Robot Archive Data Protocol (Phase 0)

이 저장소는 웹 UI보다 **검증 가능한 CSV 기반 데이터셋**을 우선 구축한다.

## 현재 범위

- Phase 0A: 데이터 구조 고정
  - `data/` 하위 CSV 5종 헤더 생성
  - `lib/taxonomy/enums.json` taxonomy 정의
  - `scripts/validate_data.py` 검증 스크립트 구성
- Phase 0B: 1차 후보 수집
  - `ui44`의 `Companions` 카테고리 후보 수집
  - `robotsguide`의 `Social` 카테고리 후보 수집(범위 확장)
  - `data/01_candidate_robots.csv` 작성
  - 포함/제외/불확실 상태를 유지하고 제외 이유 기록

## 데이터베이스 범위

- 1차 기준 DB: `ui44` (`https://ui44.com/categories/companions`)
- 추가 DB: `robotsguide` (`https://robotsguide.com/robots/category/social`)
- 동일 로봇이 복수 DB에 존재할 경우:
  - `01_candidate_robots.csv`에는 DB별 후보를 보존
  - `05_sources.csv`에는 `robot_database` 출처를 추가로 연결

## 원칙

- 추측 금지: 확인되지 않은 값은 생성하지 않음
- `FALSE`와 `UNKNOWN`을 구분
- `blank`와 `UNKNOWN`을 구분
- provenance 유지: source URL 유지
- 제외된 후보도 삭제하지 않고 `EXCLUDE`로 유지

## 실행

```bash
python3 scripts/validate_data.py
python3 scripts/phase0b_report.py
```
