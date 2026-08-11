# Study Evidence Search Protocol (Phase 0F+)

## 목적
- 기존에 업로드된 `04_studies.csv` 데이터는 유지한다.
- 별도 검색 로그를 추가해, 로봇별 연구 근거 수집 경로를 재현 가능하게 만든다.

## 조사 범위 (학술 DB)
- PubMed
- IEEE Xplore
- ACM Digital Library
- Scopus

## 검색 대상
- `02_robots.csv`에 있는 전체 로봇 (`robot_id`, `robot_name`)

## 기본 검색식
- PubMed:
  - `({robot_name}[Title/Abstract]) AND ("social robot"[Title/Abstract] OR "human-robot interaction"[Title/Abstract] OR pediatric[Title/Abstract] OR child[Title/Abstract] OR clinical[Title/Abstract] OR therapy[Title/Abstract])`
- IEEE/ACM/Scopus:
  - `"{robot_name}" AND ("social robot" OR "human-robot interaction" OR pediatric OR child OR clinical OR therapy)`

## 출력물
- `data/07_study_search_log.csv`
  - `collected_at_utc, robot_id, robot_name, db_name, query, search_url, hit_count, status, notes`

## 상태값 정의
- `AUTO_COUNTED`: 자동 hit 수 수집 완료 (현재 PubMed만 자동화 대상)
- `AUTO_FAILED:*`: 자동 수집 실패 (네트워크/접근 이슈 등)
- `MANUAL_PENDING`: 수동 확인 필요 (IEEE/ACM/Scopus)

## 실행 방법
```bash
cd "/Users/yeriming/Desktop/SR_Archive"
python3 "scripts/build_study_search_log.py"
```

## 현재 한계
- 기관 구독/로그인/봇 차단 정책 때문에 IEEE/ACM/Scopus는 자동 hit 수를 확정하지 않는다.
- 자동 수집 실패 항목은 `search_url`로 수동 확인 후 `hit_count/status/notes`를 갱신한다.
