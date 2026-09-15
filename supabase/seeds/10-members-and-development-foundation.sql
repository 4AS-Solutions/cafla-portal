begin;

-- This phase intentionally does not create or modify Supabase Auth users.
-- It verifies the manually-created Development identities before inserting
-- their application profiles and Development-cycle state.

do $seed_preflight$
declare
  issue_details text;
begin
  with expected_auth_users (id, email) as (
    values
      ('96137b5d-35c9-43cb-8ca9-dbf3364fa462'::uuid, 'bea.board@cafla.test'),
      ('11618245-4136-4040-b647-84ce2b1a654b'::uuid, 'elena.excellent@cafla.test'),
      ('e1db1342-8d44-42a4-b7b5-96cc4fff7078'::uuid, 'iris.ineligible@cafla.test'),
      ('bd6357e5-c607-45a1-964b-64546aed38b5'::uuid, 'ivan.invited@cafla.test'),
      ('8bda8a8a-d254-4a4a-8767-6904ec866636'::uuid, 'lina.learning@cafla.test'),
      ('f731c4f5-8981-43bd-aeb3-430403f51ae7'::uuid, 'mateo.delay@cafla.test'),
      ('47176af6-2bc9-4e7b-accc-f20cc55e1355'::uuid, 'milo.missing@cafla.test'),
      ('31c572b5-d612-4d1b-bf37-82951e169847'::uuid, 'nora.newcomer@cafla.test'),
      ('a96a8562-86b3-4ff5-b359-af7cd6455b3b'::uuid, 'petra.pending@cafla.test'),
      ('f9699565-c01a-44ab-becb-245b1eea1947'::uuid, 'sam.suspended@cafla.test'),
      ('8a5416c2-a850-48df-9275-5843853bf58d'::uuid, 'wendy.withdrawn@cafla.test')
  )
  select string_agg(
    expected.id::text || ' expected ' || expected.email ||
    ', found ' || coalesce(auth_user.email, '<missing>'),
    '; '
    order by expected.email
  )
  into issue_details
  from expected_auth_users expected
  left join auth.users auth_user on auth_user.id = expected.id
  where auth_user.id is null
     or lower(auth_user.email) is distinct from expected.email;

  if issue_details is not null then
    raise exception
      'Development Auth preflight failed. Phase 1 did not modify Auth. Conflicts: %',
      issue_details;
  end if;

  with expected_members (id, full_name, email) as (
    values
      ('96137b5d-35c9-43cb-8ca9-dbf3364fa462'::uuid, 'Bea Board', 'bea.board@cafla.test'),
      ('11618245-4136-4040-b647-84ce2b1a654b'::uuid, 'Elena Excellent', 'elena.excellent@cafla.test'),
      ('e1db1342-8d44-42a4-b7b5-96cc4fff7078'::uuid, 'Iris Ineligible', 'iris.ineligible@cafla.test'),
      ('bd6357e5-c607-45a1-964b-64546aed38b5'::uuid, 'Ivan Invited', 'ivan.invited@cafla.test'),
      ('8bda8a8a-d254-4a4a-8767-6904ec866636'::uuid, 'Lina Learning', 'lina.learning@cafla.test'),
      ('f731c4f5-8981-43bd-aeb3-430403f51ae7'::uuid, 'Mateo Delay', 'mateo.delay@cafla.test'),
      ('47176af6-2bc9-4e7b-accc-f20cc55e1355'::uuid, 'Milo Missing', 'milo.missing@cafla.test'),
      ('31c572b5-d612-4d1b-bf37-82951e169847'::uuid, 'Nora Newcomer', 'nora.newcomer@cafla.test'),
      ('a96a8562-86b3-4ff5-b359-af7cd6455b3b'::uuid, 'Petra Pending', 'petra.pending@cafla.test'),
      ('f9699565-c01a-44ab-becb-245b1eea1947'::uuid, 'Sam Suspended', 'sam.suspended@cafla.test'),
      ('8a5416c2-a850-48df-9275-5843853bf58d'::uuid, 'Wendy Withdrawn', 'wendy.withdrawn@cafla.test')
  )
  select string_agg(
    existing.id::text || ' has identity ' || existing.full_name ||
    ' <' || existing.email || '>, expected ' || expected.full_name ||
    ' <' || expected.email || '>',
    '; '
    order by expected.email
  )
  into issue_details
  from expected_members expected
  join public.members existing on existing.id = expected.id
  where existing.full_name <> expected.full_name
     or lower(existing.email) <> expected.email;

  if issue_details is not null then
    raise exception
      'Existing public.members rows conflict with deterministic seed identities: %',
      issue_details;
  end if;

  with expected_members (id, email) as (
    values
      ('96137b5d-35c9-43cb-8ca9-dbf3364fa462'::uuid, 'bea.board@cafla.test'),
      ('11618245-4136-4040-b647-84ce2b1a654b'::uuid, 'elena.excellent@cafla.test'),
      ('e1db1342-8d44-42a4-b7b5-96cc4fff7078'::uuid, 'iris.ineligible@cafla.test'),
      ('bd6357e5-c607-45a1-964b-64546aed38b5'::uuid, 'ivan.invited@cafla.test'),
      ('8bda8a8a-d254-4a4a-8767-6904ec866636'::uuid, 'lina.learning@cafla.test'),
      ('f731c4f5-8981-43bd-aeb3-430403f51ae7'::uuid, 'mateo.delay@cafla.test'),
      ('47176af6-2bc9-4e7b-accc-f20cc55e1355'::uuid, 'milo.missing@cafla.test'),
      ('31c572b5-d612-4d1b-bf37-82951e169847'::uuid, 'nora.newcomer@cafla.test'),
      ('a96a8562-86b3-4ff5-b359-af7cd6455b3b'::uuid, 'petra.pending@cafla.test'),
      ('f9699565-c01a-44ab-becb-245b1eea1947'::uuid, 'sam.suspended@cafla.test'),
      ('8a5416c2-a850-48df-9275-5843853bf58d'::uuid, 'wendy.withdrawn@cafla.test')
  )
  select string_agg(
    existing.email || ' belongs to ' || existing.id::text ||
    ', expected ' || expected.id::text,
    '; '
    order by expected.email
  )
  into issue_details
  from expected_members expected
  join public.members existing on lower(existing.email) = expected.email
  where existing.id <> expected.id;

  if issue_details is not null then
    raise exception
      'Seed email addresses are already assigned to different member IDs: %',
      issue_details;
  end if;

  if exists (
    select 1
    from development.cycles
    where id = 'cafe2026-0710-4f01-8000-000000000001'::uuid
      and name <> 'Fall 2026 Development'
  ) then
    raise exception 'The seed cycle UUID is already owned by a different cycle.';
  end if;

  if exists (
    select 1
    from development.cycles
    where name = 'Fall 2026 Development'
      and id <> 'cafe2026-0710-4f01-8000-000000000001'::uuid
  ) then
    raise exception 'The seed cycle name is already owned by a different UUID.';
  end if;

  if exists (
    select 1
    from development.cycles
    where status = 'active'
      and id <> 'cafe2026-0710-4f01-8000-000000000001'::uuid
  ) then
    raise exception 'Another active Development cycle exists; the seed will not replace it.';
  end if;

  if exists (
    select 1
    from development.attendance_scoring_rules
    where cycle_id = 'cafe2026-0710-4f01-8000-000000000001'::uuid
      and id <> 'cafe2026-0710-4f01-8000-000000000002'::uuid
  ) then
    raise exception 'The seed cycle already has attendance rules owned by a different UUID.';
  end if;

  with expected_periods (
    id,
    name,
    effective_from,
    effective_until,
    attendance_weight,
    quiz_weight,
    report_weight,
    evaluation_weight
  ) as (
    values
      (
        'cafe2026-0710-4f01-8000-000000000003'::uuid,
        'Fall 2026 Period 1',
        '2026-07-10'::date,
        '2026-09-02'::date,
        45,
        20,
        35,
        0
      ),
      (
        'cafe2026-0710-4f01-8000-000000000004'::uuid,
        'Fall 2026 Period 2',
        '2026-09-03'::date,
        '2026-12-15'::date,
        40,
        15,
        25,
        20
      )
  )
  select string_agg(existing.id::text, ', ' order by existing.id)
  into issue_details
  from expected_periods expected
  join development.scoring_periods existing on existing.id = expected.id
  where existing.name <> expected.name
     or existing.attendance_weight <> expected.attendance_weight
     or existing.quiz_weight <> expected.quiz_weight
     or existing.report_weight <> expected.report_weight
     or existing.evaluation_weight <> expected.evaluation_weight
     or not (
       (
         existing.id = 'cafe2026-0710-4f01-8000-000000000003'::uuid
         and existing.effective_from = '2026-07-10'::date
         and existing.effective_until in ('2026-09-02'::date, '2026-09-17'::date)
       )
       or
       (
         existing.id = 'cafe2026-0710-4f01-8000-000000000004'::uuid
         and existing.effective_from in ('2026-09-03'::date, '2026-09-18'::date)
         and existing.effective_until = '2026-12-15'::date
       )
     );

  if issue_details is not null then
    raise exception
      'Existing seed-owned scoring periods are neither the original nor accelerated Development test configuration: %',
      issue_details;
  end if;

  if exists (
    select 1
    from development.scoring_periods
    where name in ('Fall 2026 Period 1', 'Fall 2026 Period 2')
      and id not in (
        'cafe2026-0710-4f01-8000-000000000003'::uuid,
        'cafe2026-0710-4f01-8000-000000000004'::uuid
      )
  ) then
    raise exception 'A seed scoring-period name is already owned by a different UUID.';
  end if;

  with expected_periods (id, effective_from, effective_until) as (
    values
      (
        'cafe2026-0710-4f01-8000-000000000003'::uuid,
        '2026-07-10'::date,
        '2026-09-02'::date
      ),
      (
        'cafe2026-0710-4f01-8000-000000000004'::uuid,
        '2026-09-03'::date,
        '2026-12-15'::date
      )
  )
  select string_agg(
    existing.id::text || ' (' || existing.effective_from::text ||
    ' to ' || coalesce(existing.effective_until::text, 'infinity') || ')',
    '; '
    order by existing.effective_from
  )
  into issue_details
  from expected_periods expected
  join development.scoring_periods existing
    on existing.id not in (
      'cafe2026-0710-4f01-8000-000000000003'::uuid,
      'cafe2026-0710-4f01-8000-000000000004'::uuid
    )
   and daterange(
     existing.effective_from,
     coalesce(existing.effective_until, 'infinity'::date),
     '[]'
   ) && daterange(expected.effective_from, expected.effective_until, '[]');

  if issue_details is not null then
    raise exception
      'Existing non-seed scoring periods overlap the Fall 2026 seed periods: %',
      issue_details;
  end if;

  with expected_cycle_members (id, member_id) as (
    values
      ('cafe2026-0710-4c01-8100-000000000001'::uuid, '96137b5d-35c9-43cb-8ca9-dbf3364fa462'::uuid),
      ('cafe2026-0710-4c01-8100-000000000002'::uuid, '11618245-4136-4040-b647-84ce2b1a654b'::uuid),
      ('cafe2026-0710-4c01-8100-000000000003'::uuid, 'e1db1342-8d44-42a4-b7b5-96cc4fff7078'::uuid),
      ('cafe2026-0710-4c01-8100-000000000004'::uuid, 'bd6357e5-c607-45a1-964b-64546aed38b5'::uuid),
      ('cafe2026-0710-4c01-8100-000000000005'::uuid, '8bda8a8a-d254-4a4a-8767-6904ec866636'::uuid),
      ('cafe2026-0710-4c01-8100-000000000006'::uuid, 'f731c4f5-8981-43bd-aeb3-430403f51ae7'::uuid),
      ('cafe2026-0710-4c01-8100-000000000007'::uuid, '47176af6-2bc9-4e7b-accc-f20cc55e1355'::uuid),
      ('cafe2026-0710-4c01-8100-000000000008'::uuid, '31c572b5-d612-4d1b-bf37-82951e169847'::uuid),
      ('cafe2026-0710-4c01-8100-000000000009'::uuid, 'a96a8562-86b3-4ff5-b359-af7cd6455b3b'::uuid),
      ('cafe2026-0710-4c01-8100-000000000010'::uuid, 'f9699565-c01a-44ab-becb-245b1eea1947'::uuid),
      ('cafe2026-0710-4c01-8100-000000000011'::uuid, '8a5416c2-a850-48df-9275-5843853bf58d'::uuid)
  )
  select string_agg(existing.id::text, ', ' order by existing.id)
  into issue_details
  from expected_cycle_members expected
  join development.cycle_members existing on existing.id = expected.id
  where existing.cycle_id <> 'cafe2026-0710-4f01-8000-000000000001'::uuid
     or existing.member_id <> expected.member_id;

  if issue_details is not null then
    raise exception
      'Seed cycle-member UUIDs are already owned by different relationships: %',
      issue_details;
  end if;

  with expected_cycle_members (id, member_id) as (
    values
      ('cafe2026-0710-4c01-8100-000000000001'::uuid, '96137b5d-35c9-43cb-8ca9-dbf3364fa462'::uuid),
      ('cafe2026-0710-4c01-8100-000000000002'::uuid, '11618245-4136-4040-b647-84ce2b1a654b'::uuid),
      ('cafe2026-0710-4c01-8100-000000000003'::uuid, 'e1db1342-8d44-42a4-b7b5-96cc4fff7078'::uuid),
      ('cafe2026-0710-4c01-8100-000000000004'::uuid, 'bd6357e5-c607-45a1-964b-64546aed38b5'::uuid),
      ('cafe2026-0710-4c01-8100-000000000005'::uuid, '8bda8a8a-d254-4a4a-8767-6904ec866636'::uuid),
      ('cafe2026-0710-4c01-8100-000000000006'::uuid, 'f731c4f5-8981-43bd-aeb3-430403f51ae7'::uuid),
      ('cafe2026-0710-4c01-8100-000000000007'::uuid, '47176af6-2bc9-4e7b-accc-f20cc55e1355'::uuid),
      ('cafe2026-0710-4c01-8100-000000000008'::uuid, '31c572b5-d612-4d1b-bf37-82951e169847'::uuid),
      ('cafe2026-0710-4c01-8100-000000000009'::uuid, 'a96a8562-86b3-4ff5-b359-af7cd6455b3b'::uuid),
      ('cafe2026-0710-4c01-8100-000000000010'::uuid, 'f9699565-c01a-44ab-becb-245b1eea1947'::uuid),
      ('cafe2026-0710-4c01-8100-000000000011'::uuid, '8a5416c2-a850-48df-9275-5843853bf58d'::uuid)
  )
  select string_agg(
    existing.member_id::text || ' already uses cycle-member ID ' || existing.id::text,
    '; '
    order by existing.member_id
  )
  into issue_details
  from expected_cycle_members expected
  join development.cycle_members existing
    on existing.cycle_id = 'cafe2026-0710-4f01-8000-000000000001'::uuid
   and existing.member_id = expected.member_id
  where existing.id <> expected.id;

  if issue_details is not null then
    raise exception
      'Seed cycle-member relationships already exist with different UUIDs: %',
      issue_details;
  end if;
end
$seed_preflight$;

insert into public.members (
  id,
  full_name,
  email,
  role,
  status,
  notes,
  created_at
)
values
  ('96137b5d-35c9-43cb-8ca9-dbf3364fa462', 'Bea Board', 'bea.board@cafla.test', 'board', 'active', 'Development Seed V1 persona: Board', '2026-07-10 09:00:00'),
  ('11618245-4136-4040-b647-84ce2b1a654b', 'Elena Excellent', 'elena.excellent@cafla.test', 'member', 'active', 'Development Seed V1 persona: Excellent', '2026-07-10 09:00:00'),
  ('e1db1342-8d44-42a4-b7b5-96cc4fff7078', 'Iris Ineligible', 'iris.ineligible@cafla.test', 'member', 'active', 'Development Seed V1 persona: Ranking ineligible', '2026-07-10 09:00:00'),
  ('bd6357e5-c607-45a1-964b-64546aed38b5', 'Ivan Invited', 'ivan.invited@cafla.test', 'member', 'invited', 'Development Seed V1 persona: Invited', '2026-07-10 09:00:00'),
  ('8bda8a8a-d254-4a4a-8767-6904ec866636', 'Lina Learning', 'lina.learning@cafla.test', 'member', 'active', 'Development Seed V1 persona: Learning', '2026-07-10 09:00:00'),
  ('f731c4f5-8981-43bd-aeb3-430403f51ae7', 'Mateo Delay', 'mateo.delay@cafla.test', 'member', 'active', 'Development Seed V1 persona: Delayed submissions', '2026-07-10 09:00:00'),
  ('47176af6-2bc9-4e7b-accc-f20cc55e1355', 'Milo Missing', 'milo.missing@cafla.test', 'member', 'active', 'Development Seed V1 persona: Missing obligations', '2026-07-10 09:00:00'),
  ('31c572b5-d612-4d1b-bf37-82951e169847', 'Nora Newcomer', 'nora.newcomer@cafla.test', 'member', 'active', 'Development Seed V1 persona: New member', '2026-09-18 09:00:00'),
  ('a96a8562-86b3-4ff5-b359-af7cd6455b3b', 'Petra Pending', 'petra.pending@cafla.test', 'member', 'active', 'Development Seed V1 persona: Pending obligations', '2026-07-10 09:00:00'),
  ('f9699565-c01a-44ab-becb-245b1eea1947', 'Sam Suspended', 'sam.suspended@cafla.test', 'member', 'suspended', 'Development Seed V1 persona: Suspended', '2026-07-10 09:00:00'),
  ('8a5416c2-a850-48df-9275-5843853bf58d', 'Wendy Withdrawn', 'wendy.withdrawn@cafla.test', 'member', 'inactive', 'Development Seed V1 persona: Withdrawn', '2026-07-10 09:00:00')
on conflict (id) do update
set
  full_name = excluded.full_name,
  email = excluded.email,
  role = excluded.role,
  status = excluded.status,
  notes = excluded.notes,
  created_at = excluded.created_at;

insert into development.cycles (
  id,
  name,
  start_date,
  end_date,
  status,
  description,
  created_by,
  closed_by,
  created_at,
  closed_at,
  updated_at
)
values (
  'cafe2026-0710-4f01-8000-000000000001',
  'Fall 2026 Development',
  '2026-07-10',
  '2026-12-15',
  'active',
  'Deterministic CAFLA Development Seed V1 cycle.',
  '96137b5d-35c9-43cb-8ca9-dbf3364fa462',
  null,
  '2026-07-01 16:00:00+00',
  null,
  '2026-07-01 16:00:00+00'
)
on conflict (id) do update
set
  name = excluded.name,
  start_date = excluded.start_date,
  end_date = excluded.end_date,
  status = excluded.status,
  description = excluded.description,
  created_by = excluded.created_by,
  closed_by = null,
  created_at = excluded.created_at,
  closed_at = null,
  updated_at = excluded.updated_at;

insert into development.cycle_members (
  id,
  cycle_id,
  member_id,
  effective_from,
  effective_until,
  enrollment_type,
  status,
  eligible_for_ranking,
  notes,
  created_by,
  created_at,
  updated_at
)
values
  ('cafe2026-0710-4c01-8100-000000000001', 'cafe2026-0710-4f01-8000-000000000001', '96137b5d-35c9-43cb-8ca9-dbf3364fa462', '2026-07-10', null, 'existing_member', 'active', true, 'Development Seed V1: Board', '96137b5d-35c9-43cb-8ca9-dbf3364fa462', '2026-07-10 16:00:00+00', '2026-07-10 16:00:00+00'),
  ('cafe2026-0710-4c01-8100-000000000002', 'cafe2026-0710-4f01-8000-000000000001', '11618245-4136-4040-b647-84ce2b1a654b', '2026-07-10', null, 'existing_member', 'active', true, 'Development Seed V1: Excellent', '96137b5d-35c9-43cb-8ca9-dbf3364fa462', '2026-07-10 16:00:00+00', '2026-07-10 16:00:00+00'),
  ('cafe2026-0710-4c01-8100-000000000003', 'cafe2026-0710-4f01-8000-000000000001', 'e1db1342-8d44-42a4-b7b5-96cc4fff7078', '2026-07-10', null, 'existing_member', 'active', false, 'Development Seed V1: Ranking ineligible', '96137b5d-35c9-43cb-8ca9-dbf3364fa462', '2026-07-10 16:00:00+00', '2026-07-10 16:00:00+00'),
  ('cafe2026-0710-4c01-8100-000000000004', 'cafe2026-0710-4f01-8000-000000000001', 'bd6357e5-c607-45a1-964b-64546aed38b5', '2026-07-10', null, 'existing_member', 'active', true, 'Development Seed V1: Invited; mirrors current invitation enrollment', '96137b5d-35c9-43cb-8ca9-dbf3364fa462', '2026-07-10 16:00:00+00', '2026-07-10 16:00:00+00'),
  ('cafe2026-0710-4c01-8100-000000000005', 'cafe2026-0710-4f01-8000-000000000001', '8bda8a8a-d254-4a4a-8767-6904ec866636', '2026-07-10', null, 'existing_member', 'active', true, 'Development Seed V1: Learning', '96137b5d-35c9-43cb-8ca9-dbf3364fa462', '2026-07-10 16:00:00+00', '2026-07-10 16:00:00+00'),
  ('cafe2026-0710-4c01-8100-000000000006', 'cafe2026-0710-4f01-8000-000000000001', 'f731c4f5-8981-43bd-aeb3-430403f51ae7', '2026-07-10', null, 'existing_member', 'active', true, 'Development Seed V1: Delayed submissions', '96137b5d-35c9-43cb-8ca9-dbf3364fa462', '2026-07-10 16:00:00+00', '2026-07-10 16:00:00+00'),
  ('cafe2026-0710-4c01-8100-000000000007', 'cafe2026-0710-4f01-8000-000000000001', '47176af6-2bc9-4e7b-accc-f20cc55e1355', '2026-07-10', null, 'existing_member', 'active', true, 'Development Seed V1: Missing obligations', '96137b5d-35c9-43cb-8ca9-dbf3364fa462', '2026-07-10 16:00:00+00', '2026-07-10 16:00:00+00'),
  ('cafe2026-0710-4c01-8100-000000000008', 'cafe2026-0710-4f01-8000-000000000001', '31c572b5-d612-4d1b-bf37-82951e169847', '2026-09-03', null, 'new_member', 'active', true, 'Development Seed V1: New member effective at accelerated Development test Period 2 start; not a Production business date', '96137b5d-35c9-43cb-8ca9-dbf3364fa462', '2026-09-18 16:00:00+00', '2026-09-18 16:00:00+00'),
  ('cafe2026-0710-4c01-8100-000000000009', 'cafe2026-0710-4f01-8000-000000000001', 'a96a8562-86b3-4ff5-b359-af7cd6455b3b', '2026-07-10', null, 'existing_member', 'active', true, 'Development Seed V1: Pending obligations', '96137b5d-35c9-43cb-8ca9-dbf3364fa462', '2026-07-10 16:00:00+00', '2026-07-10 16:00:00+00'),
  ('cafe2026-0710-4c01-8100-000000000010', 'cafe2026-0710-4f01-8000-000000000001', 'f9699565-c01a-44ab-becb-245b1eea1947', '2026-07-10', null, 'existing_member', 'ineligible', false, 'Development Seed V1: Suspended; mirrors current member update mapping', '96137b5d-35c9-43cb-8ca9-dbf3364fa462', '2026-07-10 16:00:00+00', '2026-07-10 16:00:00+00'),
  ('cafe2026-0710-4c01-8100-000000000011', 'cafe2026-0710-4f01-8000-000000000001', '8a5416c2-a850-48df-9275-5843853bf58d', '2026-07-10', '2026-09-02', 'existing_member', 'withdrawn', false, 'Development Seed V1: Withdrawn at accelerated Development test Period 1 end; not a Production business rule', '96137b5d-35c9-43cb-8ca9-dbf3364fa462', '2026-07-10 16:00:00+00', '2026-09-18 16:00:00+00')
on conflict (id) do update
set
  cycle_id = excluded.cycle_id,
  member_id = excluded.member_id,
  effective_from = excluded.effective_from,
  effective_until = excluded.effective_until,
  enrollment_type = excluded.enrollment_type,
  status = excluded.status,
  eligible_for_ranking = excluded.eligible_for_ranking,
  notes = excluded.notes,
  created_by = excluded.created_by,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at;

insert into development.attendance_scoring_rules (
  id,
  cycle_id,
  present_weight,
  late_weight,
  excused_weight,
  absent_weight,
  created_at,
  updated_at
)
values (
  'cafe2026-0710-4f01-8000-000000000002',
  'cafe2026-0710-4f01-8000-000000000001',
  1.0000,
  0.5000,
  0.7500,
  0.0000,
  '2026-07-01 16:00:00+00',
  '2026-07-01 16:00:00+00'
)
on conflict (cycle_id) do update
set
  present_weight = excluded.present_weight,
  late_weight = excluded.late_weight,
  excused_weight = excluded.excused_weight,
  absent_weight = excluded.absent_weight,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at;

insert into development.scoring_periods (
  id,
  name,
  effective_from,
  effective_until,
  attendance_weight,
  quiz_weight,
  report_weight,
  evaluation_weight,
  notes,
  created_by,
  created_at
)
values
  (
    'cafe2026-0710-4f01-8000-000000000003',
    'Fall 2026 Period 1',
    '2026-07-10',
    '2026-09-02',
    45,
    20,
    35,
    0,
    'Development Seed V1 accelerated test Period 1; not approved Production business configuration.',
    '96137b5d-35c9-43cb-8ca9-dbf3364fa462',
    '2026-07-01 16:00:00+00'
  ),
  (
    'cafe2026-0710-4f01-8000-000000000004',
    'Fall 2026 Period 2',
    '2026-09-03',
    '2026-12-15',
    40,
    15,
    25,
    20,
    'Development Seed V1 accelerated test Period 2; not approved Production business configuration.',
    '96137b5d-35c9-43cb-8ca9-dbf3364fa462',
    '2026-07-01 16:00:00+00'
  )
on conflict (id) do update
set
  name = excluded.name,
  effective_from = excluded.effective_from,
  effective_until = excluded.effective_until,
  attendance_weight = excluded.attendance_weight,
  quiz_weight = excluded.quiz_weight,
  report_weight = excluded.report_weight,
  evaluation_weight = excluded.evaluation_weight,
  notes = excluded.notes,
  created_by = excluded.created_by,
  created_at = excluded.created_at;

do $seed_assertions$
declare
  actual_count integer;
begin
  select count(*)
  into actual_count
  from public.members
  where id in (
    '96137b5d-35c9-43cb-8ca9-dbf3364fa462'::uuid,
    '11618245-4136-4040-b647-84ce2b1a654b'::uuid,
    'e1db1342-8d44-42a4-b7b5-96cc4fff7078'::uuid,
    'bd6357e5-c607-45a1-964b-64546aed38b5'::uuid,
    '8bda8a8a-d254-4a4a-8767-6904ec866636'::uuid,
    'f731c4f5-8981-43bd-aeb3-430403f51ae7'::uuid,
    '47176af6-2bc9-4e7b-accc-f20cc55e1355'::uuid,
    '31c572b5-d612-4d1b-bf37-82951e169847'::uuid,
    'a96a8562-86b3-4ff5-b359-af7cd6455b3b'::uuid,
    'f9699565-c01a-44ab-becb-245b1eea1947'::uuid,
    '8a5416c2-a850-48df-9275-5843853bf58d'::uuid
  );

  if actual_count <> 11 then
    raise exception 'Expected 11 seeded members, found %.', actual_count;
  end if;

  if not exists (
    select 1 from public.members
    where id = '96137b5d-35c9-43cb-8ca9-dbf3364fa462'
      and role = 'board'
      and status = 'active'
  ) then
    raise exception 'Bea Board assertion failed.';
  end if;

  if not exists (
    select 1
    from development.cycle_members
    where cycle_id = 'cafe2026-0710-4f01-8000-000000000001'
      and member_id = '96137b5d-35c9-43cb-8ca9-dbf3364fa462'
      and status = 'active'
      and eligible_for_ranking = true
  ) then
    raise exception 'Bea Board cycle assertion failed.';
  end if;

  if not exists (
    select 1 from public.members
    where id = 'bd6357e5-c607-45a1-964b-64546aed38b5'
      and role = 'member'
      and status = 'invited'
  ) then
    raise exception 'Ivan Invited assertion failed.';
  end if;

  if not exists (
    select 1
    from development.cycle_members
    where cycle_id = 'cafe2026-0710-4f01-8000-000000000001'
      and member_id = 'bd6357e5-c607-45a1-964b-64546aed38b5'
      and status = 'active'
      and eligible_for_ranking = true
  ) then
    raise exception 'Ivan Invited cycle assertion failed.';
  end if;

  if not exists (
    select 1 from public.members
    where id = 'f9699565-c01a-44ab-becb-245b1eea1947'
      and role = 'member'
      and status = 'suspended'
  ) then
    raise exception 'Sam Suspended assertion failed.';
  end if;

  if not exists (
    select 1
    from development.cycle_members
    where cycle_id = 'cafe2026-0710-4f01-8000-000000000001'
      and member_id = 'f9699565-c01a-44ab-becb-245b1eea1947'
      and status = 'ineligible'
      and eligible_for_ranking = false
      and effective_until is null
  ) then
    raise exception 'Sam Suspended cycle assertion failed.';
  end if;

  if (
    select count(*)
    from development.cycles
    where id = 'cafe2026-0710-4f01-8000-000000000001'
      and name = 'Fall 2026 Development'
      and start_date = '2026-07-10'
      and end_date = '2026-12-15'
      and status = 'active'
  ) <> 1 then
    raise exception 'Seed Development cycle assertion failed.';
  end if;

  if (
    select count(*)
    from development.cycle_members
    where cycle_id = 'cafe2026-0710-4f01-8000-000000000001'
  ) <> 11 then
    raise exception 'Expected 11 seed cycle memberships.';
  end if;

  if not exists (
    select 1
    from development.cycle_members
    where cycle_id = 'cafe2026-0710-4f01-8000-000000000001'
      and member_id = 'e1db1342-8d44-42a4-b7b5-96cc4fff7078'
      and status = 'active'
      and eligible_for_ranking = false
  ) then
    raise exception 'Iris Ineligible assertion failed.';
  end if;

  if not exists (
    select 1
    from development.cycle_members
    where cycle_id = 'cafe2026-0710-4f01-8000-000000000001'
      and member_id = '8a5416c2-a850-48df-9275-5843853bf58d'
      and status = 'withdrawn'
      and eligible_for_ranking = false
      and effective_until = '2026-09-02'
  ) then
    raise exception 'Wendy Withdrawn assertion failed.';
  end if;

  if not exists (
    select 1
    from development.cycle_members cm
    join development.cycles cycle on cycle.id = cm.cycle_id
    where cm.member_id = '31c572b5-d612-4d1b-bf37-82951e169847'
      and cm.enrollment_type = 'new_member'
      and cm.status = 'active'
      and cm.eligible_for_ranking = true
      and cm.effective_from = '2026-09-03'
  ) then
    raise exception 'Nora Newcomer assertion failed.';
  end if;

  if not exists (
    select 1
    from development.attendance_scoring_rules
    where id = 'cafe2026-0710-4f01-8000-000000000002'
      and cycle_id = 'cafe2026-0710-4f01-8000-000000000001'
      and present_weight = 1.0000
      and late_weight = 0.5000
      and excused_weight = 0.7500
      and absent_weight = 0.0000
  ) then
    raise exception 'Attendance scoring rules assertion failed.';
  end if;

  if (
    select count(*)
    from development.scoring_periods
    where id in (
      'cafe2026-0710-4f01-8000-000000000003'::uuid,
      'cafe2026-0710-4f01-8000-000000000004'::uuid
    )
  ) <> 2 then
    raise exception 'Expected both seed scoring periods.';
  end if;

  if exists (
    select 1
    from development.scoring_periods
    where id in (
      'cafe2026-0710-4f01-8000-000000000003'::uuid,
      'cafe2026-0710-4f01-8000-000000000004'::uuid
    )
      and attendance_weight + quiz_weight + report_weight + evaluation_weight <> 100
  ) then
    raise exception 'A seed scoring period does not total 100 percent.';
  end if;
end
$seed_assertions$;

commit;
