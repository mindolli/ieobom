# 이어봄 프로토타입

공선출하회의 출하 예정, 입고, 선별, 배분, 정산 데이터를 하나의 흐름으로 보여주는 운영 대시보드 프로토타입입니다.

## 실행

Vercel/Supabase 연결을 위해 Vite 앱으로 구성했습니다.

처음 한 번:

```bash
npm install
```

로컬 실행:

```bash
npm run dev
```

이후 터미널에 표시되는 localhost 주소에서 확인합니다.

## Supabase / Vercel 연결

- DB 스키마: [supabase/schema.sql](/Users/anminju/Documents/스온실/supabase/schema.sql)
- 샘플 데이터: [supabase/seed.sql](/Users/anminju/Documents/스온실/supabase/seed.sql)
- 연결 가이드: [docs/vercel-supabase.md](/Users/anminju/Documents/스온실/docs/vercel-supabase.md)

Vercel에서는 Application/Framework Preset을 `Vite`로 선택하세요.

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
