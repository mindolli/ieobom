-- 이어봄 공선출하회 운영 데이터 스키마
-- Supabase SQL Editor에서 그대로 실행할 수 있게 작성했습니다.

create extension if not exists pgcrypto;

do $$
begin
  create type public.user_role as enum (
    'admin',
    'manager',
    'arrival_staff',
    'sorting_staff',
    'settlement_staff'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.arrival_method as enum ('self_delivery', 'pickup_request');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.shipment_status as enum (
    'submitted',
    'needs_check',
    'confirmed',
    'arrived',
    'sorted',
    'allocated',
    'settlement_ready',
    'settled',
    'held'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.issue_type as enum (
    'missing',
    'mismatch',
    'duplicate',
    'unassigned',
    'unconfirmed',
    'held'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.flow_stage as enum (
    'shipment_plan',
    'arrival',
    'sorting',
    'allocation',
    'settlement'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.issue_status as enum ('open', 'resolved', 'ignored');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  display_name text not null,
  role public.user_role not null default 'manager',
  created_at timestamptz not null default now()
);

create table if not exists public.farms (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  phone text,
  village text,
  pickup_address text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (organization_id, name)
);

create table if not exists public.crops (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  package_unit text not null default 'box',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (organization_id, name)
);

create table if not exists public.crop_grade_defs (
  id uuid primary key default gen_random_uuid(),
  crop_id uuid not null references public.crops(id) on delete cascade,
  code text not null,
  label text not null,
  sort_order integer not null default 0,
  is_settlement_grade boolean not null default true,
  unique (crop_id, code)
);

create table if not exists public.shipments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  farm_id uuid not null references public.farms(id),
  crop_id uuid not null references public.crops(id),
  shipment_date date not null,
  total_boxes integer not null check (total_boxes > 0),
  arrival_method public.arrival_method not null,
  requested_arrival_time time,
  contact_phone text,
  farmer_memo text,
  manager_memo text,
  status public.shipment_status not null default 'submitted',
  submitted_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.shipment_grade_estimates (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references public.shipments(id) on delete cascade,
  grade_code text not null,
  boxes integer not null default 0 check (boxes >= 0),
  unique (shipment_id, grade_code)
);

create table if not exists public.arrival_records (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null unique references public.shipments(id) on delete cascade,
  actual_boxes integer not null check (actual_boxes >= 0),
  arrived_at timestamptz not null default now(),
  checked_by uuid references auth.users(id),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sorting_results (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null unique references public.shipments(id) on delete cascade,
  loss_boxes integer not null default 0 check (loss_boxes >= 0),
  excluded_boxes integer not null default 0 check (excluded_boxes >= 0),
  completed_at timestamptz,
  checked_by uuid references auth.users(id),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sorting_grade_results (
  id uuid primary key default gen_random_uuid(),
  sorting_result_id uuid not null references public.sorting_results(id) on delete cascade,
  grade_code text not null,
  boxes integer not null default 0 check (boxes >= 0),
  unique (sorting_result_id, grade_code)
);

create table if not exists public.destinations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  contact text,
  is_active boolean not null default true,
  unique (organization_id, name)
);

create table if not exists public.allocations (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references public.shipments(id) on delete cascade,
  destination_id uuid not null references public.destinations(id),
  grade_code text not null,
  boxes integer not null check (boxes > 0),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.settlement_records (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null unique references public.shipments(id) on delete cascade,
  unit_price numeric(12, 2),
  sorting_fee numeric(12, 2) not null default 0,
  transport_fee numeric(12, 2) not null default 0,
  commission_fee numeric(12, 2) not null default 0,
  status public.shipment_status not null default 'settlement_ready',
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.issue_checks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  shipment_id uuid references public.shipments(id) on delete cascade,
  stage public.flow_stage not null,
  issue_type public.issue_type not null,
  title text not null,
  detail jsonb not null default '{}'::jsonb,
  status public.issue_status not null default 'open',
  resolved_by uuid references auth.users(id),
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_farms_org on public.farms(organization_id);
create index if not exists idx_crops_org on public.crops(organization_id);
create index if not exists idx_shipments_org_date on public.shipments(organization_id, shipment_date desc);
create index if not exists idx_shipments_farm_crop_date on public.shipments(farm_id, crop_id, shipment_date);
create index if not exists idx_issue_checks_open on public.issue_checks(organization_id, status, created_at desc);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists touch_shipments_updated_at on public.shipments;
create trigger touch_shipments_updated_at
before update on public.shipments
for each row execute function public.touch_updated_at();

drop trigger if exists touch_arrival_records_updated_at on public.arrival_records;
create trigger touch_arrival_records_updated_at
before update on public.arrival_records
for each row execute function public.touch_updated_at();

drop trigger if exists touch_sorting_results_updated_at on public.sorting_results;
create trigger touch_sorting_results_updated_at
before update on public.sorting_results
for each row execute function public.touch_updated_at();

drop trigger if exists touch_settlement_records_updated_at on public.settlement_records;
create trigger touch_settlement_records_updated_at
before update on public.settlement_records
for each row execute function public.touch_updated_at();

create or replace function public.is_org_staff(target_org uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.organization_id = target_org
      and p.role in ('admin', 'manager', 'arrival_staff', 'sorting_staff', 'settlement_staff')
  );
$$;

create or replace function public.is_org_admin_or_manager(target_org uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.organization_id = target_org
      and p.role in ('admin', 'manager')
  );
$$;

create or replace function public.submit_farmer_shipment(
  p_org_slug text,
  p_farm_id uuid,
  p_crop_id uuid,
  p_shipment_date date,
  p_total_boxes integer,
  p_grade_boxes jsonb,
  p_arrival_method public.arrival_method,
  p_requested_arrival_time time,
  p_contact_phone text default null,
  p_farmer_memo text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  target_org uuid;
  new_shipment_id uuid;
  grade_sum integer;
begin
  select id into target_org
  from public.organizations
  where slug = p_org_slug;

  if target_org is null then
    raise exception 'organization not found';
  end if;

  if p_total_boxes is null or p_total_boxes <= 0 then
    raise exception 'total_boxes must be greater than 0';
  end if;

  if not exists (select 1 from public.farms where id = p_farm_id and organization_id = target_org and is_active) then
    raise exception 'farm not found';
  end if;

  if not exists (select 1 from public.crops where id = p_crop_id and organization_id = target_org and is_active) then
    raise exception 'crop not found';
  end if;

  select coalesce(sum(value::integer), 0)
  into grade_sum
  from jsonb_each_text(coalesce(p_grade_boxes, '{}'::jsonb));

  insert into public.shipments (
    organization_id,
    farm_id,
    crop_id,
    shipment_date,
    total_boxes,
    arrival_method,
    requested_arrival_time,
    contact_phone,
    farmer_memo,
    status,
    submitted_by
  )
  values (
    target_org,
    p_farm_id,
    p_crop_id,
    p_shipment_date,
    p_total_boxes,
    p_arrival_method,
    p_requested_arrival_time,
    nullif(p_contact_phone, ''),
    nullif(p_farmer_memo, ''),
    case when grade_sum = 0 or grade_sum = p_total_boxes then 'submitted'::public.shipment_status else 'needs_check'::public.shipment_status end,
    auth.uid()
  )
  returning id into new_shipment_id;

  insert into public.shipment_grade_estimates (shipment_id, grade_code, boxes)
  select new_shipment_id, key, value::integer
  from jsonb_each_text(coalesce(p_grade_boxes, '{}'::jsonb))
  where value::integer >= 0;

  if grade_sum > 0 and grade_sum <> p_total_boxes then
    insert into public.issue_checks (
      organization_id,
      shipment_id,
      stage,
      issue_type,
      title,
      detail
    )
    values (
      target_org,
      new_shipment_id,
      'shipment_plan',
      'mismatch',
      '등급별 예정 수량 합계가 총 예정 수량과 다릅니다.',
      jsonb_build_object('total_boxes', p_total_boxes, 'grade_sum', grade_sum)
    );
  end if;

  return new_shipment_id;
end;
$$;

create or replace view public.v_shipment_sheet
with (security_invoker = true) as
select
  s.id,
  s.organization_id,
  s.shipment_date,
  f.name as farm_name,
  f.phone as farm_phone,
  c.name as crop_name,
  s.total_boxes,
  coalesce(sum(e.boxes) filter (where e.grade_code = 'special'), 0) as special_boxes,
  coalesce(sum(e.boxes) filter (where e.grade_code = 'high'), 0) as high_boxes,
  coalesce(sum(e.boxes) filter (where e.grade_code = 'normal'), 0) as normal_boxes,
  s.arrival_method,
  s.requested_arrival_time,
  s.contact_phone,
  s.status,
  s.farmer_memo,
  s.manager_memo,
  s.created_at,
  s.updated_at
from public.shipments s
join public.farms f on f.id = s.farm_id
join public.crops c on c.id = s.crop_id
left join public.shipment_grade_estimates e on e.shipment_id = s.id
group by s.id, f.name, f.phone, c.name;

create or replace view public.v_issue_candidates
with (security_invoker = true) as
select
  s.organization_id,
  s.id as shipment_id,
  'shipment_plan'::public.flow_stage as stage,
  'mismatch'::public.issue_type as issue_type,
  '등급별 예정 수량 합계와 총 예정 수량이 다릅니다.' as title,
  jsonb_build_object(
    'total_boxes', s.total_boxes,
    'grade_sum', coalesce(sum(e.boxes), 0)
  ) as detail
from public.shipments s
left join public.shipment_grade_estimates e on e.shipment_id = s.id
group by s.id
having coalesce(sum(e.boxes), 0) > 0
   and coalesce(sum(e.boxes), 0) <> s.total_boxes
union all
select
  s.organization_id,
  s.id,
  'sorting',
  'missing',
  '입고는 완료됐지만 선별 결과가 없습니다.',
  jsonb_build_object('actual_boxes', a.actual_boxes)
from public.shipments s
join public.arrival_records a on a.shipment_id = s.id
left join public.sorting_results r on r.shipment_id = s.id
where r.id is null
union all
select
  s.organization_id,
  s.id,
  'sorting',
  'mismatch',
  '입고량과 선별 결과 합계가 다릅니다.',
  jsonb_build_object(
    'actual_boxes', a.actual_boxes,
    'sorted_sum', coalesce(sum(g.boxes), 0) + r.loss_boxes + r.excluded_boxes
  )
from public.shipments s
join public.arrival_records a on a.shipment_id = s.id
join public.sorting_results r on r.shipment_id = s.id
left join public.sorting_grade_results g on g.sorting_result_id = r.id
group by s.organization_id, s.id, a.actual_boxes, r.loss_boxes, r.excluded_boxes
having a.actual_boxes <> coalesce(sum(g.boxes), 0) + r.loss_boxes + r.excluded_boxes;

grant usage on schema public to anon, authenticated;
grant select on public.organizations to anon, authenticated;
grant select on public.farms to anon, authenticated;
grant select on public.crops to anon, authenticated;
grant select on public.crop_grade_defs to anon, authenticated;
grant select on public.v_shipment_sheet to authenticated;
grant select on public.v_issue_candidates to authenticated;
grant all on public.profiles to authenticated;
grant all on public.farms to authenticated;
grant all on public.crops to authenticated;
grant all on public.crop_grade_defs to authenticated;
grant all on public.shipments to authenticated;
grant all on public.shipment_grade_estimates to authenticated;
grant all on public.arrival_records to authenticated;
grant all on public.sorting_results to authenticated;
grant all on public.sorting_grade_results to authenticated;
grant all on public.destinations to authenticated;
grant all on public.allocations to authenticated;
grant all on public.settlement_records to authenticated;
grant all on public.issue_checks to authenticated;
grant execute on function public.submit_farmer_shipment(
  text,
  uuid,
  uuid,
  date,
  integer,
  jsonb,
  public.arrival_method,
  time,
  text,
  text
) to anon, authenticated;

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.farms enable row level security;
alter table public.crops enable row level security;
alter table public.crop_grade_defs enable row level security;
alter table public.shipments enable row level security;
alter table public.shipment_grade_estimates enable row level security;
alter table public.arrival_records enable row level security;
alter table public.sorting_results enable row level security;
alter table public.sorting_grade_results enable row level security;
alter table public.destinations enable row level security;
alter table public.allocations enable row level security;
alter table public.settlement_records enable row level security;
alter table public.issue_checks enable row level security;

drop policy if exists "public can read organization slugs" on public.organizations;
create policy "public can read organization slugs"
on public.organizations
for select
to anon, authenticated
using (true);

drop policy if exists "users can read own profile" on public.profiles;
create policy "users can read own profile"
on public.profiles
for select
to authenticated
using (id = auth.uid());

drop policy if exists "admins manage profiles" on public.profiles;
create policy "admins manage profiles"
on public.profiles
for all
to authenticated
using (public.is_org_admin_or_manager(organization_id))
with check (public.is_org_admin_or_manager(organization_id));

drop policy if exists "public can read active farms" on public.farms;
create policy "public can read active farms"
on public.farms
for select
to anon, authenticated
using (is_active);

drop policy if exists "staff manage farms" on public.farms;
create policy "staff manage farms"
on public.farms
for all
to authenticated
using (public.is_org_admin_or_manager(organization_id))
with check (public.is_org_admin_or_manager(organization_id));

drop policy if exists "public can read active crops" on public.crops;
create policy "public can read active crops"
on public.crops
for select
to anon, authenticated
using (is_active);

drop policy if exists "staff manage crops" on public.crops;
create policy "staff manage crops"
on public.crops
for all
to authenticated
using (public.is_org_admin_or_manager(organization_id))
with check (public.is_org_admin_or_manager(organization_id));

drop policy if exists "public can read crop grades" on public.crop_grade_defs;
create policy "public can read crop grades"
on public.crop_grade_defs
for select
to anon, authenticated
using (
  exists (
    select 1 from public.crops c
    where c.id = crop_id
      and c.is_active
  )
);

drop policy if exists "staff manage crop grades" on public.crop_grade_defs;
create policy "staff manage crop grades"
on public.crop_grade_defs
for all
to authenticated
using (
  exists (
    select 1 from public.crops c
    where c.id = crop_id
      and public.is_org_admin_or_manager(c.organization_id)
  )
)
with check (
  exists (
    select 1 from public.crops c
    where c.id = crop_id
      and public.is_org_admin_or_manager(c.organization_id)
  )
);

drop policy if exists "staff manage shipments" on public.shipments;
create policy "staff manage shipments"
on public.shipments
for all
to authenticated
using (public.is_org_staff(organization_id))
with check (public.is_org_staff(organization_id));

drop policy if exists "staff manage grade estimates" on public.shipment_grade_estimates;
create policy "staff manage grade estimates"
on public.shipment_grade_estimates
for all
to authenticated
using (
  exists (
    select 1 from public.shipments s
    where s.id = shipment_id
      and public.is_org_staff(s.organization_id)
  )
)
with check (
  exists (
    select 1 from public.shipments s
    where s.id = shipment_id
      and public.is_org_staff(s.organization_id)
  )
);

drop policy if exists "staff manage arrival records" on public.arrival_records;
create policy "staff manage arrival records"
on public.arrival_records
for all
to authenticated
using (
  exists (
    select 1 from public.shipments s
    where s.id = shipment_id
      and public.is_org_staff(s.organization_id)
  )
)
with check (
  exists (
    select 1 from public.shipments s
    where s.id = shipment_id
      and public.is_org_staff(s.organization_id)
  )
);

drop policy if exists "staff manage sorting results" on public.sorting_results;
create policy "staff manage sorting results"
on public.sorting_results
for all
to authenticated
using (
  exists (
    select 1 from public.shipments s
    where s.id = shipment_id
      and public.is_org_staff(s.organization_id)
  )
)
with check (
  exists (
    select 1 from public.shipments s
    where s.id = shipment_id
      and public.is_org_staff(s.organization_id)
  )
);

drop policy if exists "staff manage sorting grade results" on public.sorting_grade_results;
create policy "staff manage sorting grade results"
on public.sorting_grade_results
for all
to authenticated
using (
  exists (
    select 1
    from public.sorting_results r
    join public.shipments s on s.id = r.shipment_id
    where r.id = sorting_result_id
      and public.is_org_staff(s.organization_id)
  )
)
with check (
  exists (
    select 1
    from public.sorting_results r
    join public.shipments s on s.id = r.shipment_id
    where r.id = sorting_result_id
      and public.is_org_staff(s.organization_id)
  )
);

drop policy if exists "staff manage destinations" on public.destinations;
create policy "staff manage destinations"
on public.destinations
for all
to authenticated
using (public.is_org_staff(organization_id))
with check (public.is_org_staff(organization_id));

drop policy if exists "staff manage allocations" on public.allocations;
create policy "staff manage allocations"
on public.allocations
for all
to authenticated
using (
  exists (
    select 1 from public.shipments s
    where s.id = shipment_id
      and public.is_org_staff(s.organization_id)
  )
)
with check (
  exists (
    select 1 from public.shipments s
    where s.id = shipment_id
      and public.is_org_staff(s.organization_id)
  )
);

drop policy if exists "staff manage settlement records" on public.settlement_records;
create policy "staff manage settlement records"
on public.settlement_records
for all
to authenticated
using (
  exists (
    select 1 from public.shipments s
    where s.id = shipment_id
      and public.is_org_staff(s.organization_id)
  )
)
with check (
  exists (
    select 1 from public.shipments s
    where s.id = shipment_id
      and public.is_org_staff(s.organization_id)
  )
);

drop policy if exists "staff manage issue checks" on public.issue_checks;
create policy "staff manage issue checks"
on public.issue_checks
for all
to authenticated
using (public.is_org_staff(organization_id))
with check (public.is_org_staff(organization_id));
