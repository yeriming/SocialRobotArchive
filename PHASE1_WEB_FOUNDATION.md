# Phase 1 Web Foundation (2026-08-11)

## 완료

- `web/` 하위에 Next.js(App Router) + TypeScript + Tailwind 기반 웹 프로젝트 초기화
- Apple 디자인 토큰에 맞춘 기본 스타일/레이아웃 적용
  - 단일 액션 블루, 라이트/다크 타일, pill 버튼, 얇은 글로벌 네비게이션
- 홈 페이지 스켈레톤 생성
  - Hero 섹션
  - Phase 0 KPI 스냅샷 카드

## 생성/수정 파일

- `web/package.json`
- `web/tsconfig.json`
- `web/next.config.ts`
- `web/eslint.config.mjs`
- `web/tailwind.config.ts`
- `web/postcss.config.mjs`
- `web/next-env.d.ts`
- `web/.gitignore`
- `web/app/layout.tsx`
- `web/app/page.tsx`
- `web/app/globals.css`

## 검증

- `cd web && npm run lint` 통과
- `cd web && npm run build` 통과

## 다음 작업

1. CSV(`data/*.csv`) 기반 로더 유틸 작성 (`web/lib/data/*`)
2. `/robots` 목록 페이지 및 기본 필터(국가/제조사/판매상태) 연결
3. `/robots/[id]` 상세 페이지에 가격/연구/출처 섹션 연결
