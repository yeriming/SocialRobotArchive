# Phase 0C Baseline (2026-08-11)

## 완료 사항

- `01_candidate_robots.csv`의 `INCLUDE` 48개 항목에 `robot_id`를 부여해 `02_robots.csv` 생성
- 각 로봇에 대한 provenance를 `05_sources.csv`에 `robot_database` 출처로 연결
- `verification_status`는 전 항목 `UNVERIFIED`로 명시
- 검증 스크립트 통과

## 현황 요약

- Robot 수: 48
- status 분포:
  - `판매중`: 23
  - `개발중`: 21
  - `판매중단`: 1
  - `정보확인필요`: 3
- `official_url` 미기입: 48/48
- `manufacturer_country` 미기입: 48/48
- `UNVERIFIED`: 48/48

## 다음 단계 (Phase 0D)

- 로봇별 공식 제품 페이지 URL 수집
- 공식 spec/manual/SDK 문서 URL 연결
- 공식 출처 기반으로 주요 사양 필드 보강
- `verification_status`를 `PARTIALLY_VERIFIED` 또는 `VERIFIED`로 단계적 갱신

## Phase 0D Batch 1 진행 결과 (2026-08-11)

- 대상: `ROBOT-0001` ~ `ROBOT-0010` (10개)
- 반영:
  - `02_robots.csv`에 `official_url`, `spec_source_url`, `last_verified` 업데이트
  - 해당 10개 `verification_status`를 `PARTIALLY_VERIFIED`로 갱신
  - `05_sources.csv`에 공식 출처 20건(`official_product`, `official_spec`/`official_manual`) 추가
- 누적 현황:
  - `PARTIALLY_VERIFIED`: 10/48
  - `UNVERIFIED`: 38/48
  - `official_url` 채움: 10/48

## Phase 0D Batch 2 진행 결과 (2026-08-11)

- 대상: `ROBOT-0011` ~ `ROBOT-0020`
- 반영:
  - 공식 도메인 확인이 된 9개 로봇 반영 (`ROBOT-0018` 제외)
  - `02_robots.csv`에 공식 URL 및 검증일 갱신
  - `05_sources.csv`에 공식 출처 18건 추가
- 보류:
  - `ROBOT-0018 (INU)`는 공식 제품 상세 페이지를 확인하지 못해 `UNVERIFIED` 유지
- 누적 현황:
  - `PARTIALLY_VERIFIED`: 19/48
  - `UNVERIFIED`: 29/48
  - `official_url` 채움: 19/48

## Phase 0D Batch 3 진행 결과 (2026-08-11)

- 대상: `ROBOT-0021` ~ `ROBOT-0030`
- 반영:
  - 10개 로봇 모두 공식 도메인/공식 문서 기반으로 `PARTIALLY_VERIFIED` 반영
  - `02_robots.csv`에 공식 URL, spec URL, 검증일 갱신
  - `05_sources.csv`에 공식 출처 20건 추가
- 참고:
  - 일부 공식 사이트는 fetch 타임아웃이 있었으나, 동일 도메인의 공식 공개 자료(제품 페이지/문서/공식 보도자료) 교차 확인 후 반영
- 누적 현황:
  - `PARTIALLY_VERIFIED`: 29/48
  - `UNVERIFIED`: 19/48
  - `official_url` 채움: 29/48

## Phase 0D Batch 4 진행 결과 (2026-08-11)

- 대상: `ROBOT-0031` ~ `ROBOT-0040`
- 반영:
  - 10개 로봇 모두 공식 도메인/공식 공개 자료(제품 페이지, 회사 페이지, 공식 보도자료, 공식 매뉴얼) 기준으로 `PARTIALLY_VERIFIED` 반영
  - `02_robots.csv`에 `official_url`, `spec_source_url`, `manufacturer_country`, `last_verified` 갱신
  - `05_sources.csv`에 공식 출처 20건 추가 (`SRC-0107` ~ `SRC-0126`)
- 참고:
  - 일부 페이지(예: Samsung News 특정 문서)는 직접 fetch 타임아웃이 있었으나, 동일 공식 도메인에서 확인 가능한 공개 자료를 교차 검토해 출처를 반영
- 누적 현황:
  - `PARTIALLY_VERIFIED`: 39/48
  - `UNVERIFIED`: 9/48
  - `official_url` 채움: 39/48

## Phase 0D Batch 5 진행 결과 (2026-08-11)

- 대상: `ROBOT-0041` ~ `ROBOT-0048`
- 반영:
  - 8개 로봇 모두 공식 도메인/공식 공개 자료(제품 페이지, 공식 발표문, 공식 개발 문서, 공식 저장소) 기준으로 `PARTIALLY_VERIFIED` 반영
  - `02_robots.csv`에 `official_url`, `spec_source_url`, `manufacturer_country`, `last_verified` 갱신
  - `05_sources.csv`에 공식 출처 16건 추가 (`SRC-0127` ~ `SRC-0142`)
- 참고:
  - 일부 공식 페이지는 직접 fetch 타임아웃이 있었으나, 동일 엔터티의 공식 보도자료/공식 스토어/공식 저장소를 교차 검토해 반영
- 누적 현황:
  - `PARTIALLY_VERIFIED`: 47/48
  - `UNVERIFIED`: 1/48 (`ROBOT-0018`)
  - `official_url` 채움: 47/48

## Phase 0D 추가 보강 (ROBOT-0018, 2026-08-11)

- 대상: `ROBOT-0018 (INU)`
- 반영:
  - 공식 Ludens AI 사이트(`ludensai.com`)에서 INU 제품 존재 근거 확인 후 `PARTIALLY_VERIFIED`로 갱신
  - `02_robots.csv`에 `official_url`, `spec_source_url`, `last_verified`, `verification_status` 반영
  - `05_sources.csv`에 공식 출처 2건 추가 (`SRC-0143`, `SRC-0144`)
- 누적 현황:
  - `PARTIALLY_VERIFIED`: 48/48
  - `UNVERIFIED`: 0/48
  - `official_url` 채움: 48/48

## Phase 0E 가격/조달 1차 반영 (2026-08-11)

- 반영:
  - `03_prices.csv`에 공식 판매/공식 스토어 기준 가격 5건 추가 (`PRICE-0001` ~ `PRICE-0005`)
  - `05_sources.csv`에 가격 provenance 5건 추가 (`SRC-0145` ~ `SRC-0149`, `information_type=price`)
- 커버된 로봇:
  - `ROBOT-0033 (KOIBOT ROLA Series)`
  - `ROBOT-0038 (aibo ERS-1000)`
  - `ROBOT-0039 (KATA Friends)`
  - `ROBOT-0046 (Yonbo X1)`
  - `ROBOT-0047 (Mirumi)`
- 원칙:
  - 공식 페이지에서 확인되는 정가/표시가만 반영
  - 국가별/옵션별 편차가 큰 항목은 `notes`에 맥락 기록

## Phase 0E 가격/조달 2차 반영 (2026-08-11)

- 반영:
  - `03_prices.csv`에 7건 추가 (`PRICE-0006` ~ `PRICE-0012`)
  - `05_sources.csv`에 가격 provenance 7건 추가 (`SRC-0150` ~ `SRC-0156`)
- 포함 내용:
  - **공식 표시가 추가:** Fuzozo, Rhem(예약가), Zeroth M1
  - **가격 미공개/문의형 상태화:** INU, Aura, Sweekar, Tombot Jennie
- 누적:
  - `03_prices.csv` 총 12건
  - 가격 provenance 총 12건 (`SRC-0145` ~ `SRC-0156`)

## Phase 0E 가격/조달 3차 반영 (2026-08-11)

- 반영:
  - `03_prices.csv`에 10건 추가 (`PRICE-0013` ~ `PRICE-0022`)
  - `05_sources.csv`에 가격 provenance 10건 추가 (`SRC-0157` ~ `SRC-0166`)
- 주요 보강:
  - **공식 판매가 추가:** EBO X, EBO Max, EBO Mini Sport, Loona DeskMate, Miko 3, Miko Mini, OlloNi, Reachy Mini
  - **문의형 상태화:** PadBot T2, Misty II
  - **배송 여부 보강:** 글로벌 배송 명시 항목은 `shipping_to_korea=TRUE`로 반영
- 누적:
  - `03_prices.csv` 총 22건
  - 가격 provenance 총 22건 (`SRC-0145` ~ `SRC-0166`)

## Phase 0E 가격/조달 4차 반영 (2026-08-11)

- 반영:
  - `03_prices.csv`에 26건 추가 (`PRICE-0023` ~ `PRICE-0048`)
  - `05_sources.csv`에 가격 provenance 26건 추가 (`SRC-0167` ~ `SRC-0192`)
- 주요 보강:
  - 기존 미수집 26개 로봇에 대해 가격 레코드 전부 생성
  - 공식 MSRP가 없는 항목은 `offer_type=가격문의`, `availability=문의필요`로 표준화
  - 단종 이력(`Kuri`)은 `availability=판매종료`로 상태화
  - 글로벌 배송이 공식 텍스트로 명시된 항목은 `shipping_to_korea=TRUE` 유지/반영
- 누적:
  - `03_prices.csv` 총 48건 (48개 로봇 전수 커버)
  - 가격 provenance 총 48건 (`SRC-0145` ~ `SRC-0192`)

## Phase 0E 배송정보 보강 1차 (2026-08-11)

- 반영:
  - `03_prices.csv`의 `shipping_to_korea`를 공식 문구 기반으로 4건 확정 갱신
  - 대상: `KOIBOT ROLA`, `Yonbo X1`, `Loona DeskMate`, `Reachy Mini`
- 기준:
  - 공식 페이지에 국제 배송 포함/해외 주문 경로가 명시된 경우에만 `TRUE`로 변경
  - 불명확 항목은 `UNKNOWN` 유지
- 누적:
  - `shipping_to_korea=TRUE`: 8건
  - `shipping_to_korea=UNKNOWN`: 40건

## Phase 0E 배송정보 보강 2차 (2026-08-11)

- 반영:
  - 공식 배송정책/판매채널 문구가 명확한 3건을 `shipping_to_korea=FALSE`로 확정
  - 대상: `aibo (Sony Electronics US)`, `Mirumi (JP 스토어)`, `Poketomo (일본 판매채널 중심)`
- 기준:
  - 국제배송 불가/국내(일본) 중심 판매 문구가 공식 페이지에서 확인되는 경우만 `FALSE` 적용
  - 불명확 항목은 `UNKNOWN` 유지
- 누적:
  - `shipping_to_korea=TRUE`: 8건
  - `shipping_to_korea=FALSE`: 3건
  - `shipping_to_korea=UNKNOWN`: 37건

## Phase 0E 배송정보 보강 3차 (2026-08-11)

- 반영:
  - `miko.ai` 공식 배송정책(국제배송/국가별 운임·통관 안내) 근거로 2건 `TRUE` 확정
  - 대상: `Miko 3`, `Miko Mini`
- 누적:
  - `shipping_to_korea=TRUE`: 10건
  - `shipping_to_korea=FALSE`: 3건
  - `shipping_to_korea=UNKNOWN`: 35건

## 조사 범위 확장: robotsguide 추가 (2026-08-11)

- 반영:
  - 조사 DB 범위에 `robotsguide`(`https://robotsguide.com/robots/category/social`) 추가
  - `data/raw/robotsguide/social_category.txt` 원문 스냅샷 저장
  - `01_candidate_robots.csv`에 robotsguide Social 후보 9건 추가 (`CAND-0054` ~ `CAND-0062`)
  - 기존 마스터와 중복 확인된 항목(`Aibo`, `Kuri`)은 `duplicate_of`로 연결
  - `05_sources.csv`에 robotsguide `robot_database` provenance 2건 추가 (`SRC-0193`, `SRC-0194`)
- 메모:
  - 이번 반영은 **조사 범위 확장 및 출처 연결** 단계이며, 신규 robotsguide 후보의 마스터 편입/공식 검증은 후속 배치에서 진행

## robotsguide 중복 정리 및 다음 작업 시작 (2026-08-11)

- 중복 정리:
  - `01_candidate_robots.csv`에서 ui44와 중복되는 robotsguide 후보 2건 제거
  - 제거 항목: `Aibo`(`CAND-0054`), `Kuri`(`CAND-0057`)
- 다음 작업 시작(마스터 편입):
  - robotsguide 신규 후보 7건(`Jibo`, `Keepon`, `Mirokaï`, `Nao`, `Pepper`, `Qoobo`, `Vector`)을 `02_robots.csv`에 신규 편입 (`ROBOT-0049` ~ `ROBOT-0055`)
  - `05_sources.csv`에 대응 `robot_database` provenance 7건 추가 (`SRC-0195` ~ `SRC-0201`)
- 현재 상태:
  - 총 로봇 수: 55
  - `PARTIALLY_VERIFIED`: 48
  - `UNVERIFIED`: 7 (신규 robotsguide 편입분)

## robotsguide 신규 7종 공식 검증 (2026-08-11)

- 대상:
  - `ROBOT-0049` ~ `ROBOT-0055` (`Jibo`, `Keepon`, `Mirokaï`, `Nao`, `Pepper`, `Qoobo`, `Vector`)
- 반영:
  - `02_robots.csv`에 제조사/국가/상태/공식 URL/스펙 URL/검증일 갱신
  - 7개 전부 `PARTIALLY_VERIFIED`로 갱신
  - `05_sources.csv`에 공식 출처 14건 추가 (`SRC-0202` ~ `SRC-0215`)
- 누적 상태:
  - 총 로봇 수: 55
  - `PARTIALLY_VERIFIED`: 55
  - `UNVERIFIED`: 0

## Phase 0E 가격/조달 5차 반영 (robotsguide 신규 7종, 2026-08-11)

- 반영:
  - `03_prices.csv`에 7건 추가 (`PRICE-0049` ~ `PRICE-0055`)
  - `05_sources.csv`에 가격 provenance 7건 추가 (`SRC-0216` ~ `SRC-0222`)
- 주요 보강:
  - robotsguide에서 신규 편입된 7개 로봇(`ROBOT-0049` ~ `ROBOT-0055`) 가격/조달 필드 전수 생성
  - 공식 MSRP가 없는 항목은 `offer_type=가격문의`, `availability=문의필요`로 표준화
  - `Jibo`는 공식 페이지 상태 기반으로 `availability=판매종료` 반영
  - `Qoobo`는 공식 스토어 표시가 `$173.00` 반영
- 누적:
  - `03_prices.csv` 총 55건 (55개 로봇 전수 커버)
  - 가격 provenance 총 55건 (`SRC-0145` ~ `SRC-0222`)

## Phase 0F 연구 근거 수집 1차 (2026-08-11)

- 반영:
  - `04_studies.csv`에 6건 추가 (`STUDY-0001` ~ `STUDY-0006`)
  - `05_sources.csv`에 연구 provenance 6건 추가 (`SRC-0223` ~ `SRC-0228`)
- 대상 로봇:
  - `NAO`, `PARO`, `aibo`, `Pepper`, `Jibo`
- 주요 범위:
  - 소아 대상 연구 우선 반영
  - 병원/외래 기반 임상 파일럿 및 사용자 연구 포함
  - DOI 기반 원문 링크를 `url` 및 `05_sources.csv`에 연결
- 누적:
  - `04_studies.csv` 총 6건
  - 연구 provenance 누적 6건

## Phase 0F 연구 근거 수집 2차 (2026-08-11)

- 반영:
  - `04_studies.csv`에 4건 추가 (`STUDY-0007` ~ `STUDY-0010`)
  - `05_sources.csv`에 연구 provenance 4건 추가 (`SRC-0229` ~ `SRC-0232`)
- 대상 로봇:
  - `Keepon` 2건, `aibo` 1건, `Pepper` 1건
- 주요 범위:
  - 자폐 아동 대상 Keepon 장기/파일럿 연구 보강
  - aibo-실제 동물 비교 기반 소아 상호작용 연구 보강
  - 소아병원 교육 맥락 Pepper 활용 사례 보강
- 누적:
  - `04_studies.csv` 총 10건
  - 연구 provenance 누적 10건

## Phase 0F 연구 근거 수집 3차 (2026-08-11)

- 반영:
  - `04_studies.csv`에 4건 추가 (`STUDY-0011` ~ `STUDY-0014`)
  - `05_sources.csv`에 연구 provenance 4건 추가 (`SRC-0233` ~ `SRC-0236`)
- 대상 로봇:
  - `Vector` 1건, `Misty II` 2건, `Miko 3` 1건
- 주요 범위:
  - Vector 원격 상호작용 배치 사례(HRI) 보강
  - Misty II의 가정 내 부모-아동-로봇 상호작용 및 학습 비교 실험 보강
  - Miko 감정표현/인식 관련 아동 상호작용 근거 보강
- 누적:
  - `04_studies.csv` 총 14건
  - 연구 provenance 누적 14건

## Phase 0F 연구 근거 수집 4차 (2026-08-11)

- 반영:
  - `04_studies.csv`에 4건 추가 (`STUDY-0015` ~ `STUDY-0018`)
  - `05_sources.csv`에 연구 provenance 4건 추가 (`SRC-0237` ~ `SRC-0240`)
- 대상 로봇:
  - `Loona` 1건, `NAO` 2건, `Pepper` 1건
- 주요 범위:
  - Loona 자폐 중재 예비연구(다중기초선) 반영
  - NAO 소아 재활 상호작용 평가 및 사회인지 연구 보강
  - Pepper 소아 당뇨 교육 무작위 비교 연구 반영
- 누적:
  - `04_studies.csv` 총 18건
  - 연구 provenance 누적 18건

## Phase 0F 연구 근거 수집 5차 (2026-08-11)

- 반영:
  - `04_studies.csv`에 4건 추가 (`STUDY-0019` ~ `STUDY-0022`)
  - `05_sources.csv`에 연구 provenance 4건 추가 (`SRC-0241` ~ `SRC-0244`)
- 대상 로봇:
  - `aibo` 1건, `Jibo` 1건, `PARO` 2건
- 주요 범위:
  - aibo 유아 상호작용 초기 HCI 연구(doi) 보강
  - Jibo 아동-로봇 음성 상호작용 코퍼스 연구(doi) 보강
  - PARO는 DOI 논문이 즉시 확인되지 않은 항목을 임상시험 등록(NCT) 근거로 분리 반영
- 누적:
  - `04_studies.csv` 총 22건
  - 연구 provenance 누적 22건

## Phase 0F 연구 근거 수집 6차 (2026-08-11)

- 반영:
  - `04_studies.csv`에 4건 추가 (`STUDY-0023` ~ `STUDY-0026`)
  - `05_sources.csv`에 연구 provenance 4건 추가 (`SRC-0245` ~ `SRC-0248`)
- 대상 로봇:
  - `aibo` 1건, `Jibo` 1건, `NAO` 1건, `PARO` 1건
- 주요 범위:
  - aibo 저널판(Interaction Studies) DOI 근거 보강
  - Jibo 창의적 문제해결 실험(C&C) DOI 근거 보강
  - NAO/PARO 임상시험 등록(NCT) 근거를 논문 근거와 분리해 추가 기록
- 누적:
  - `04_studies.csv` 총 26건
  - 연구 provenance 누적 26건

## Phase 0G 사전 정합 반영 1차 (2026-08-11)

- 반영:
  - `04_studies.csv` 기준으로 `02_robots.csv`의 연구 플래그 3종 갱신
  - 대상 필드: `pediatric_study_exists`, `clinical_study_exists`, `general_hri_study_exists`
- 적용 원칙:
  - 근거가 있는 항목만 `TRUE` 반영
  - 근거가 없는 항목은 `FALSE`로 단정하지 않고 기존 공란 유지
- 갱신된 로봇:
  - `ROBOT-0001`, `ROBOT-0014`, `ROBOT-0024`, `ROBOT-0027`, `ROBOT-0038`, `ROBOT-0049`, `ROBOT-0050`, `ROBOT-0052`, `ROBOT-0053`, `ROBOT-0055`

## Phase 0G Study QA 1차 (2026-08-11)

- 점검:
  - `04_studies.csv`의 `doi`, `url`, 정규화 `title` 기준 중복 스캔
  - 임상시험 등록(ClinicalTrials) 레코드와 논문 레코드 분리 상태 확인
- 결과:
  - `doi` 완전중복: 0건
  - `url` 완전중복: 0건
  - 제목 중복 후보: 1쌍 (`STUDY-0019`, `STUDY-0023`)
  - 등록시험 기반(빈 `doi`) 레코드: 4건 (`STUDY-0021`, `STUDY-0022`, `STUDY-0025`, `STUDY-0026`)
- 조치:
  - `STUDY-0019`/`STUDY-0023`의 `notes`에 학회판/저널판 관계를 명시하여 의도된 중복임을 문서화

## Phase 0G 최종 검증 리포트 생성 (2026-08-11)

- 생성 파일:
  - `PHASE0G_VALIDATION_REPORT.md`
- 포함 내용:
  - 데이터셋 스냅샷(robots/prices/studies/sources)
  - 가격/연구 커버리지
  - 분포 요약(status, availability, shipping, provenance)
  - 핵심 필드 missing/unknown 비율
  - Study QA 결과 및 수동 검토 큐
