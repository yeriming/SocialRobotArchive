# Phase 0G Validation Report (2026-08-11)

## 1) Dataset Snapshot

- `02_robots.csv`: 55 rows
- `03_prices.csv`: 55 rows
- `04_studies.csv`: 26 rows
- `05_sources.csv`: 248 rows

## 2) Coverage

- 가격 데이터 커버리지: `55/55` robots
- 연구 데이터 커버리지: `10/55` robots

## 3) Distribution Summary

### Robot status (`02_robots.csv`)

- `판매중`: 28
- `개발중`: 21
- `판매중단`: 2
- `연구용`: 1
- `정보확인필요`: 3

### Verification status (`02_robots.csv`)

- `PARTIALLY_VERIFIED`: 55

### Procurement summary (`03_prices.csv`)

- `offer_type`
  - `구매`: 17
  - `가격문의`: 38
- `availability`
  - `구매가능`: 13
  - `문의필요`: 37
  - `재고없음`: 3
  - `판매종료`: 2
- `shipping_to_korea`
  - `TRUE`: 10
  - `FALSE`: 3
  - `UNKNOWN`: 42

### Study flags in robot master (`02_robots.csv`)

- `pediatric_study_exists`: `TRUE` 10 / blank 45
- `clinical_study_exists`: `TRUE` 6 / `FALSE` 4 / blank 45
- `general_hri_study_exists`: `TRUE` 10 / blank 45

## 4) Missing/Unknown Rates (Key Fields)

### Robot master (`02_robots.csv`)

- `manufacturer_country` blank: 24/55
- `robot_type` blank: 55/55
- `release_year` blank: 55/55
- `pediatric_study_exists` blank: 45/55
- `clinical_study_exists` blank: 45/55
- `general_hri_study_exists` blank: 45/55

### Price dataset (`03_prices.csv`)

- `price_original` blank: 38/55
- `currency` blank: 38/55
- `shipping_to_korea=UNKNOWN`: 42/55

## 5) Source Provenance Summary (`05_sources.csv`)

### source_type

- `robot_database`: 57
- `official_product`: 55
- `official_spec`: 54
- `official_manual`: 1
- `official_vendor`: 55
- `paper`: 22
- `other` (registry 등): 4

### information_type

- `identity`: 112
- `spec`: 55
- `price`: 55
- `study`: 26

## 6) QA Notes

- Study duplicate scan (`doi`, `url`, normalized title) 결과:
  - `doi` exact duplicate: 0
  - `url` exact duplicate: 0
  - 의도된 제목 중복(학회판/저널판): 1쌍 (`STUDY-0019`, `STUDY-0023`)
- ClinicalTrials registry 기반 study(빈 DOI) 4건은 의도적으로 `source_type=other`로 분리 관리:
  - `STUDY-0021`, `STUDY-0022`, `STUDY-0025`, `STUDY-0026`

## 7) Manual Review Queue (Phase 0G -> Next)

우선순위 A:

- `status=정보확인필요` 3개 로봇의 상태 확정
  - `ROBOT-0001`, `ROBOT-0021`, `ROBOT-0029`

우선순위 B:

- 연구근거 플래그 공란 45개 로봇
  - 원칙: 근거가 없는 `FALSE` 단정 금지 유지
  - 후속 문헌 수집 시 `TRUE`만 단계적으로 채움

우선순위 C:

- `shipping_to_korea=UNKNOWN` 42건
  - 공식 배송정책 근거를 확보할 수 있을 때만 갱신
