# 이어봄 프로토타입

공선출하회의 출하 예정, 입고, 선별, 배분, 정산 데이터를 하나의 흐름으로 보여주는 운영 대시보드 프로토타입입니다.

## 실행

별도 빌드나 패키지 설치 없이 `index.html`을 브라우저에서 열 수 있습니다.

로컬 서버를 사용하려면:

```bash
python3 -m http.server 4173
```

이후 `http://localhost:4173`에서 확인합니다.

## Supabase / Vercel 연결

- DB 스키마: [supabase/schema.sql](/Users/anminju/Documents/스온실/supabase/schema.sql)
- 샘플 데이터: [supabase/seed.sql](/Users/anminju/Documents/스온실/supabase/seed.sql)
- 연결 가이드: [docs/vercel-supabase.md](/Users/anminju/Documents/스온실/docs/vercel-supabase.md)

현재 프로토타입은 정적 HTML 구조이므로 Vercel 환경변수를 바로 읽지 못합니다. Supabase 운영 연결 전에는 Vite 또는 Next.js로 전환하는 것을 권장합니다.

## 포함된 상호작용

- 확인 필요 데이터 상태별 필터 및 농가/품목 검색
- 이슈 상세 확인과 완료 처리
- 입고 및 선별 결과 등록 모달
- 선별 결과 합계 자동 계산
- 확인 필요 데이터 CSV 내보내기
- 농가 전용 출하 예정 데이터 제출 화면
- 등급별 합계 자동 검증과 입고 방식 선택
- 농가 제출 데이터를 관리자 표에 즉시 반영
- 엑셀 형태의 관리자 출하 데이터표
- 표 셀 직접 수정, 상태 변경, 검색과 필터
- 관리자 데이터표 CSV 내보내기
- 사이드바 화면 전환 및 모바일 레이아웃
