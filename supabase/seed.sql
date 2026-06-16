-- 개발 확인용 샘플 데이터
-- schema.sql 실행 후 Supabase SQL Editor에서 실행하세요.

insert into public.organizations (name, slug)
values ('새봄 공선출하회', 'saebom')
on conflict (slug) do nothing;

with org as (
  select id from public.organizations where slug = 'saebom'
)
insert into public.farms (organization_id, name, phone, village, pickup_address)
select org.id, farm.name, farm.phone, farm.village, farm.pickup_address
from org,
(values
  ('김성호 농가', '010-2481-0324', '새봄리', '새봄리 12-4'),
  ('박영자 농가', '010-3842-1107', '동산리', '동산리 88'),
  ('이재훈 농가', '010-9071-2420', '새봄리', '새봄리 41'),
  ('최은경 농가', '010-6628-1049', '하늘리', '하늘리 23-9'),
  ('정미숙 농가', '010-4410-8325', '하늘리', '하늘리 57')
) as farm(name, phone, village, pickup_address)
on conflict (organization_id, name) do update
set phone = excluded.phone,
    village = excluded.village,
    pickup_address = excluded.pickup_address;

with org as (
  select id from public.organizations where slug = 'saebom'
)
insert into public.crops (organization_id, name, package_unit)
select org.id, crop.name, 'box'
from org,
(values
  ('방울토마토'),
  ('완숙토마토'),
  ('대추방울')
) as crop(name)
on conflict (organization_id, name) do nothing;

insert into public.crop_grade_defs (crop_id, code, label, sort_order)
select c.id, grade.code, grade.label, grade.sort_order
from public.crops c
join public.organizations o on o.id = c.organization_id
cross join (values
  ('special', '특', 1),
  ('high', '상', 2),
  ('normal', '보통', 3),
  ('low', '하품', 4)
) as grade(code, label, sort_order)
where o.slug = 'saebom'
on conflict (crop_id, code) do update
set label = excluded.label,
    sort_order = excluded.sort_order;

-- 관리자 계정 연결은 Supabase Auth에서 사용자를 만든 뒤 해당 user id로 직접 실행하세요.
-- insert into public.profiles (id, organization_id, display_name, role)
-- values (
--   'AUTH_USER_UUID_HERE',
--   (select id from public.organizations where slug = 'saebom'),
--   '이민수 담당자',
--   'admin'
-- );
