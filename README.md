# Social Robot Archive

소아-소셜로봇 상호작용 연구를 위한 데이터셋 기반 아카이브 프로젝트입니다.

## 프로젝트 개요

- 목적: 소셜로봇 정보를 연구 관점에서 구조화하고 탐색 가능한 형태로 제공합니다.
- 원칙: 웹 UI보다 데이터 품질을 우선하는 Dataset-first 접근을 따릅니다.
- 구성: CSV 마스터 데이터 + 검증 스크립트 + Next.js 웹 인터페이스.

## 디렉터리 구조

- `data/`: 로봇, 가격, 연구, 출처 데이터 CSV 및 원문 수집 텍스트
- `scripts/`: 데이터 생성/검증/리포트 스크립트
- `lib/`: taxonomy 및 공통 리소스
- `web/`: Next.js 기반 웹 애플리케이션

## 데이터 파일

- `data/01_candidate_robots.csv`: 후보 로봇 스크리닝 목록
- `data/02_robots.csv`: 로봇 마스터
- `data/03_prices.csv`: 가격/조달 정보
- `data/04_studies.csv`: 연구 근거 정보
- `data/05_sources.csv`: 데이터 출처(provenance) 기록

## 웹 실행 방법

```bash
cd web
npm install
npm run dev -- --hostname 127.0.0.1 --port 3000
```

브라우저에서 `http://127.0.0.1:3000`으로 접속합니다.

## 검증

데이터 검증은 아래 명령으로 실행합니다.

```bash
python3 scripts/validate_data.py
```

## 문서

- `DATA_PROTOCOL.md`: 데이터 수집/관리 원칙
- `PHASE0C_BASELINE.md`: Phase 0C 기준선 기록
- `PHASE0G_VALIDATION_REPORT.md`: Phase 0G 검증 리포트
- `PHASE1_WEB_FOUNDATION.md`: Phase 1 웹 기반 구축 기록
