# Vercel + Supabase 연결 가이드

현재 프로토타입은 Vite 앱입니다. Vercel에서는 `Vite` 프리셋을 선택하면 되고, Supabase 연결값은 Vercel 환경변수로 등록합니다.

## 1. DB 구조 적용

1. Supabase 프로젝트를 생성합니다.
2. Supabase Dashboard의 `SQL Editor`에서 `supabase/schema.sql`을 실행합니다.
3. 개발 테스트용 데이터가 필요하면 `supabase/seed.sql`을 실행합니다.
4. Supabase Auth에서 관리자 사용자를 생성합니다.
5. `seed.sql` 아래쪽의 `profiles` 예시 SQL에 Auth user id를 넣어 관리자 프로필을 생성합니다.

## 2. 핵심 테이블 구조

| 테이블 | 용도 |
| --- | --- |
| `organizations` | 공선출하회 조직 |
| `profiles` | 관리자/입고/선별/정산 담당자 권한 |
| `farms` | 농가 목록 |
| `crops` | 품목 목록 |
| `crop_grade_defs` | 품목별 등급 체계 |
| `shipments` | 농가 출하 예정 기본 데이터 |
| `shipment_grade_estimates` | 등급별 예정 수량 |
| `arrival_records` | 실제 입고 데이터 |
| `sorting_results` | 선별 결과 기본 데이터 |
| `sorting_grade_results` | 등급별 선별 확정 수량 |
| `allocations` | 출하처별 배분 |
| `settlement_records` | 정산 기초자료 |
| `issue_checks` | 담당자가 처리할 확인 필요 항목 |

관리자 엑셀형 화면은 `v_shipment_sheet` 뷰를 조회하면 됩니다. 확인 필요 후보는 `v_issue_candidates` 뷰에서 계산됩니다.

## 3. Vercel 환경변수

Vercel 프로젝트의 `Settings > Environment Variables`에 아래 값을 넣습니다.

Vite를 쓸 때:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
```

Next.js를 쓸 때:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
```

서버 API나 Server Action에서만 쓰는 키:

```env
SUPABASE_SECRET_KEY=sb_secret_xxx
```

`SUPABASE_SECRET_KEY`는 브라우저 코드에 넣으면 안 됩니다.

## 4. Supabase 클라이언트 코드 예시

Vite:

```js
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);
```

Next.js 클라이언트 컴포넌트:

```js
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);
```

## 5. 농가 제출 연결

농가 제출은 테이블에 직접 `insert`하지 말고 `submit_farmer_shipment` RPC를 호출합니다. 이렇게 하면 익명 사용자가 전체 출하 데이터를 조회하지 못하면서 제출만 할 수 있습니다.

```js
const { data: shipmentId, error } = await supabase.rpc("submit_farmer_shipment", {
  p_org_slug: "saebom",
  p_farm_id: selectedFarmId,
  p_crop_id: selectedCropId,
  p_shipment_date: "2026-06-18",
  p_total_boxes: 40,
  p_grade_boxes: {
    special: 10,
    high: 20,
    normal: 10
  },
  p_arrival_method: "self_delivery",
  p_requested_arrival_time: "09:00",
  p_contact_phone: "010-0000-0000",
  p_farmer_memo: "오전 입고 예정"
});

if (error) throw error;
```

## 6. 관리자 데이터표 연결

조회:

```js
const { data, error } = await supabase
  .from("v_shipment_sheet")
  .select("*")
  .eq("shipment_date", "2026-06-18")
  .order("created_at", { ascending: false });
```

셀 수정:

```js
const { error } = await supabase
  .from("shipments")
  .update({
    total_boxes: 44,
    status: "needs_check"
  })
  .eq("id", shipmentId);
```

등급별 수량 수정:

```js
const { error } = await supabase
  .from("shipment_grade_estimates")
  .upsert({
    shipment_id: shipmentId,
    grade_code: "special",
    boxes: 12
  }, {
    onConflict: "shipment_id,grade_code"
  });
```

## 7. Vercel 배포 순서

1. GitHub에 프로젝트를 올립니다.
2. Vercel에서 `New Project`로 GitHub 저장소를 연결합니다.
3. Vite면 Build Command는 `npm run build`, Output Directory는 `dist`입니다.
4. Next.js면 Vercel이 자동 감지합니다.
5. Environment Variables를 등록합니다.
6. `Deploy`를 실행합니다.
7. 배포 후 Supabase Auth의 Site URL과 Redirect URL에 Vercel 도메인을 추가합니다.

## 8. 현재 정적 프로토타입에서 필요한 전환

현재 코드는 `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_ORG_SLUG`를 읽습니다.

환경변수가 없으면 기존 목업 데이터로 동작합니다. 환경변수가 있으면:

- 농가/품목 목록은 Supabase `farms`, `crops`에서 조회
- 농가 제출은 `submit_farmer_shipment` RPC 호출
- 관리자 데이터표는 `v_shipment_sheet` 조회
- 관리자 셀 수정은 `shipments` 또는 `shipment_grade_estimates`에 저장

남은 운영 작업은 관리자 로그인 UI 추가와 RLS 정책 검증입니다.
