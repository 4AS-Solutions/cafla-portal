-- Finance V1: auditable, assignment-level Arbiter fee imports.
--
-- This migration intentionally does not import files, seed data, or post fees.
-- Match status is not present in the supported Arbiter export and is not inferred.

alter table public.arbiter_referees
  add column finance_verified_at timestamptz,
  add column finance_verified_by uuid references public.members(id) on delete restrict;

alter table public.arbiter_referees
  add constraint arbiter_referees_finance_verification_shape check (
    (finance_verified_at is null and finance_verified_by is null)
    or (finance_verified_at is not null and finance_verified_by is not null)
  );

alter table public.arbiter_referees enable row level security;

-- Hosted Development inventory on 2026-09-14 confirmed that this table had
-- no RLS policies and that anon/authenticated held broad table privileges.
-- Revoke both table-level and any independently granted column privileges so
-- the final authenticated surface is explicit and deterministic.
revoke all on public.arbiter_referees from public, anon, authenticated;
revoke all (
  id,
  arbiter_name,
  member_id,
  created_at,
  finance_verified_at,
  finance_verified_by
) on public.arbiter_referees from public, anon, authenticated;

grant all on public.arbiter_referees to service_role;
grant select on public.arbiter_referees to authenticated;
grant insert (arbiter_name, member_id) on public.arbiter_referees to authenticated;
grant update (arbiter_name, member_id) on public.arbiter_referees to authenticated;

create policy arbiter_referees_board_select
on public.arbiter_referees for select to authenticated
using (public.is_board());

create policy arbiter_referees_board_insert
on public.arbiter_referees for insert to authenticated
with check (public.is_board());

create policy arbiter_referees_board_update
on public.arbiter_referees for update to authenticated
using (public.is_board())
with check (public.is_board());

create or replace function public.confirm_arbiter_referee_mapping(
  p_arbiter_name text,
  p_member_id uuid
)
returns public.arbiter_referees
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  v_actor uuid := auth.uid();
  v_result public.arbiter_referees;
begin
  if v_actor is null or not public.is_board() then
    raise exception 'Board authorization required' using errcode = '42501';
  end if;

  if nullif(btrim(p_arbiter_name), '') is null then
    raise exception 'A non-empty Arbiter referee name is required';
  end if;

  if not exists (select 1 from public.members where id = p_member_id) then
    raise exception 'Member does not exist' using errcode = '23503';
  end if;

  insert into public.arbiter_referees (
    arbiter_name,
    member_id,
    finance_verified_at,
    finance_verified_by
  ) values (
    btrim(p_arbiter_name),
    p_member_id,
    clock_timestamp(),
    v_actor
  )
  on conflict (arbiter_name) do update
    set member_id = excluded.member_id,
        finance_verified_at = excluded.finance_verified_at,
        finance_verified_by = excluded.finance_verified_by
  returning * into v_result;

  return v_result;
end;
$$;

revoke all on function public.confirm_arbiter_referee_mapping(text, uuid)
from public, anon, authenticated;
grant execute on function public.confirm_arbiter_referee_mapping(text, uuid)
to authenticated, service_role;

create table finance.arbiter_fee_imports (
  id uuid primary key default extensions.uuid_generate_v4(),
  original_filename text not null,
  file_sha256 text not null,
  status text not null default 'draft',
  period_start date,
  period_end date,
  summary_metadata jsonb not null default '{}'::jsonb,
  uploaded_by uuid not null references public.members(id) on delete restrict,
  uploaded_at timestamptz not null default now(),
  posted_by uuid references public.members(id) on delete restrict,
  posted_at timestamptz,
  constraint arbiter_fee_imports_filename_nonempty check (btrim(original_filename) <> ''),
  constraint arbiter_fee_imports_sha256 check (file_sha256 ~ '^[0-9a-f]{64}$'),
  constraint arbiter_fee_imports_status check (status in ('draft', 'ready', 'posted', 'failed')),
  constraint arbiter_fee_imports_period check (
    (period_start is null and period_end is null)
    or (period_start is not null and period_end is not null and period_start <= period_end)
  ),
  constraint arbiter_fee_imports_summary_object check (jsonb_typeof(summary_metadata) = 'object'),
  constraint arbiter_fee_imports_posting_shape check (
    (status = 'posted' and posted_by is not null and posted_at is not null)
    or (status <> 'posted' and posted_by is null and posted_at is null)
  )
);

create table finance.arbiter_fee_import_items (
  id uuid primary key default extensions.uuid_generate_v4(),
  import_id uuid not null references finance.arbiter_fee_imports(id) on delete restrict,
  source_row_number integer not null,
  arbiter_game_id text not null,
  role text not null,
  canonical_assignment_key text generated always as (
    'arbiter-match-fee:' || btrim(arbiter_game_id) || ':' || role
  ) stored,
  arbiter_referee_name text not null,
  normalized_referee_name text not null,
  member_id uuid references public.members(id) on delete restrict,
  match_date date,
  kickoff_time time,
  sport text,
  division text,
  league text,
  site text,
  home_team text,
  away_team text,
  arbiter_comments text,
  gross_earnings_cents bigint not null,
  fee_cents bigint not null,
  initial_match_state text not null,
  match_reason text not null,
  resolution_confirmed boolean not null default false,
  resolution_method text not null,
  resolved_by uuid references public.members(id) on delete restrict,
  resolved_at timestamptz,
  item_status text not null default 'new',
  duplicate_of_item_id uuid references finance.arbiter_fee_import_items(id) on delete restrict,
  resulting_transaction_id uuid references finance.transactions(id) on delete restrict,
  posted_at timestamptz,
  correction_sequence integer not null default 0,
  supersedes_import_item_id uuid references finance.arbiter_fee_import_items(id) on delete restrict,
  created_at timestamptz not null default now(),
  constraint arbiter_fee_import_items_source_row_positive check (source_row_number > 1),
  constraint arbiter_fee_import_items_game_id_nonempty check (btrim(arbiter_game_id) <> ''),
  constraint arbiter_fee_import_items_role check (role in ('center', 'ar1', 'ar2')),
  constraint arbiter_fee_import_items_referee_nonempty check (btrim(arbiter_referee_name) <> ''),
  constraint arbiter_fee_import_items_normalized_name_nonempty check (btrim(normalized_referee_name) <> ''),
  constraint arbiter_fee_import_items_fee_rule check (
    (role = 'center' and gross_earnings_cents = 8000 and fee_cents = 800)
    or (role in ('ar1', 'ar2') and gross_earnings_cents = 6000 and fee_cents = 600)
  ),
  constraint arbiter_fee_import_items_match_state check (
    initial_match_state in ('exact', 'suggested', 'ambiguous', 'unmatched')
  ),
  constraint arbiter_fee_import_items_resolution_method check (
    resolution_method in ('exact_full_name', 'trusted_alias', 'pending', 'board_confirmed')
  ),
  constraint arbiter_fee_import_items_resolution_shape check (
    (resolution_confirmed and member_id is not null)
    or (not resolution_confirmed)
  ),
  constraint arbiter_fee_import_items_manual_resolution_audit check (
    (resolution_method = 'board_confirmed' and resolved_by is not null and resolved_at is not null)
    or (resolution_method <> 'board_confirmed' and resolved_by is null and resolved_at is null)
  ),
  constraint arbiter_fee_import_items_status check (
    item_status in ('new', 'already_imported', 'duplicate_in_file', 'malformed', 'posted')
  ),
  constraint arbiter_fee_import_items_duplicate_shape check (
    (item_status in ('already_imported', 'duplicate_in_file') and duplicate_of_item_id is not null)
    or (item_status not in ('already_imported', 'duplicate_in_file') and duplicate_of_item_id is null)
  ),
  constraint arbiter_fee_import_items_posting_shape check (
    (item_status = 'posted' and resulting_transaction_id is not null and posted_at is not null)
    or (item_status <> 'posted' and resulting_transaction_id is null and posted_at is null)
  ),
  constraint arbiter_fee_import_items_correction_sequence check (correction_sequence >= 0),
  constraint arbiter_fee_import_items_correction_shape check (
    (correction_sequence = 0 and supersedes_import_item_id is null)
    or (correction_sequence > 0 and supersedes_import_item_id is not null)
  )
);

create index arbiter_fee_imports_uploaded_at_idx
  on finance.arbiter_fee_imports (uploaded_at desc, id desc);

create index arbiter_fee_imports_file_sha256_idx
  on finance.arbiter_fee_imports (file_sha256);

create index arbiter_fee_import_items_import_idx
  on finance.arbiter_fee_import_items (import_id, source_row_number, id);

create index arbiter_fee_import_items_member_idx
  on finance.arbiter_fee_import_items (member_id, match_date, id)
  where member_id is not null;

create index arbiter_fee_import_items_assignment_lookup_idx
  on finance.arbiter_fee_import_items (canonical_assignment_key, correction_sequence, item_status);

create unique index arbiter_fee_import_items_posted_assignment_uidx
  on finance.arbiter_fee_import_items (canonical_assignment_key, correction_sequence)
  where item_status = 'posted';

create or replace function finance.protect_arbiter_fee_import_snapshot()
returns trigger
language plpgsql
set search_path = pg_catalog, finance
as $$
declare
  v_import_status text;
begin
  if tg_op = 'DELETE' then
    raise exception 'Arbiter fee import items cannot be deleted';
  end if;

  select status into v_import_status
    from finance.arbiter_fee_imports
   where id = old.import_id;

  if v_import_status = 'posted' then
    raise exception 'Posted Arbiter fee import items are immutable';
  end if;

  if new.import_id is distinct from old.import_id
     or new.source_row_number is distinct from old.source_row_number
     or new.arbiter_game_id is distinct from old.arbiter_game_id
     or new.role is distinct from old.role
     or new.arbiter_referee_name is distinct from old.arbiter_referee_name
     or new.normalized_referee_name is distinct from old.normalized_referee_name
     or new.match_date is distinct from old.match_date
     or new.kickoff_time is distinct from old.kickoff_time
     or new.sport is distinct from old.sport
     or new.division is distinct from old.division
     or new.league is distinct from old.league
     or new.site is distinct from old.site
     or new.home_team is distinct from old.home_team
     or new.away_team is distinct from old.away_team
     or new.arbiter_comments is distinct from old.arbiter_comments
     or new.gross_earnings_cents is distinct from old.gross_earnings_cents
     or new.fee_cents is distinct from old.fee_cents
     or new.initial_match_state is distinct from old.initial_match_state
     or new.match_reason is distinct from old.match_reason
     or new.correction_sequence is distinct from old.correction_sequence
     or new.supersedes_import_item_id is distinct from old.supersedes_import_item_id then
    raise exception 'Parsed Arbiter fee import facts are immutable';
  end if;

  return new;
end;
$$;

create trigger arbiter_fee_import_items_protect_snapshot
before update or delete on finance.arbiter_fee_import_items
for each row execute function finance.protect_arbiter_fee_import_snapshot();

create or replace function finance.protect_posted_arbiter_fee_import()
returns trigger
language plpgsql
set search_path = pg_catalog, finance
as $$
begin
  if tg_op = 'DELETE' then
    raise exception 'Arbiter fee imports cannot be deleted';
  end if;

  if old.status = 'posted' then
    raise exception 'Posted Arbiter fee imports are immutable';
  end if;

  if new.original_filename is distinct from old.original_filename
     or new.file_sha256 is distinct from old.file_sha256
     or new.uploaded_by is distinct from old.uploaded_by
     or new.uploaded_at is distinct from old.uploaded_at then
    raise exception 'Arbiter fee import source evidence is immutable';
  end if;

  return new;
end;
$$;

create trigger arbiter_fee_imports_protect_posted
before update or delete on finance.arbiter_fee_imports
for each row execute function finance.protect_posted_arbiter_fee_import();

create or replace function finance.post_arbiter_fee_import(p_import_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  v_actor uuid := auth.uid();
  v_import finance.arbiter_fee_imports%rowtype;
  v_group record;
  v_transaction finance.transactions%rowtype;
  v_transaction_count integer := 0;
  v_assignment_count integer := 0;
  v_total_fee_cents bigint := 0;
  v_posting_date date := (clock_timestamp() at time zone 'America/Los_Angeles')::date;
  v_period_start date;
  v_period_end date;
  v_period_start_label text;
  v_period_end_label text;
  v_period_label text;
  v_description text;
begin
  if v_actor is null or not public.is_board() then
    raise exception 'Board authorization required' using errcode = '42501';
  end if;

  select * into v_import
    from finance.arbiter_fee_imports
   where id = p_import_id
   for update;

  if not found then
    raise exception 'Arbiter fee import does not exist';
  end if;

  if v_import.status not in ('draft', 'ready') then
    raise exception 'Arbiter fee import is not available for posting';
  end if;

  if exists (
    select 1
      from finance.arbiter_fee_import_items
     where import_id = p_import_id
       and item_status = 'new'
       and (not resolution_confirmed or member_id is null)
  ) then
    raise exception 'Every new assignment must be resolved before posting';
  end if;

  if exists (
    select 1 from finance.arbiter_fee_import_items
     where import_id = p_import_id
       and item_status = 'new'
       and match_date is null
  ) then
    raise exception 'Every new assignment must have a valid match date';
  end if;

  if not exists (
    select 1 from finance.arbiter_fee_import_items
     where import_id = p_import_id and item_status = 'new'
  ) then
    raise exception 'Arbiter fee import has no new assignments to post';
  end if;

  select min(match_date), max(match_date)
    into v_period_start, v_period_end
    from finance.arbiter_fee_import_items
   where import_id = p_import_id
     and item_status = 'new';

  if v_import.period_start is distinct from v_period_start
     or v_import.period_end is distinct from v_period_end then
    raise exception 'Arbiter fee import period does not match its new assignments';
  end if;

  v_period_start_label :=
    (array['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
           'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'])[
      extract(month from v_period_start)::integer
    ] || ' ' || extract(day from v_period_start)::integer;

  v_period_end_label :=
    (array['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
           'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'])[
      extract(month from v_period_end)::integer
    ] || ' ' || extract(day from v_period_end)::integer;

  v_period_label := case
    when v_period_start = v_period_end then
      v_period_start_label || ', ' || extract(year from v_period_start)::integer
    when extract(year from v_period_start) = extract(year from v_period_end)
         and extract(month from v_period_start) = extract(month from v_period_end) then
      v_period_start_label || chr(8211) || extract(day from v_period_end)::integer ||
      ', ' || extract(year from v_period_end)::integer
    when extract(year from v_period_start) = extract(year from v_period_end) then
      v_period_start_label || chr(8211) || v_period_end_label ||
      ', ' || extract(year from v_period_end)::integer
    else
      v_period_start_label || ', ' || extract(year from v_period_start)::integer ||
      chr(8211) || v_period_end_label || ', ' || extract(year from v_period_end)::integer
  end;

  if exists (
    select 1
      from finance.arbiter_fee_import_items candidate
      join finance.arbiter_fee_import_items posted
        on posted.canonical_assignment_key = candidate.canonical_assignment_key
       and posted.correction_sequence = candidate.correction_sequence
       and posted.item_status = 'posted'
     where candidate.import_id = p_import_id
       and candidate.item_status = 'new'
  ) then
    raise exception 'One or more assignments were posted by another import; refresh the preview';
  end if;

  for v_group in
    select
      member_id,
      count(*) filter (where role = 'center')::integer as center_count,
      count(*) filter (where role in ('ar1', 'ar2'))::integer as ar_count,
      sum(case when role = 'center' then 8000 else 6000 end)::bigint as gross_cents,
      sum(case when role = 'center' then 800 else 600 end)::bigint as fee_cents,
      jsonb_agg(
        jsonb_build_object(
          'assignment_key', canonical_assignment_key,
          'arbiter_game_id', arbiter_game_id,
          'role', role,
          'match_date', match_date,
          'gross_earnings_cents', case when role = 'center' then 8000 else 6000 end,
          'fee_cents', case when role = 'center' then 800 else 600 end
        ) order by match_date, arbiter_game_id, role
      ) as assignments
    from finance.arbiter_fee_import_items
    where import_id = p_import_id
      and item_status = 'new'
      and resolution_confirmed
      and member_id is not null
    group by member_id
    order by member_id
  loop
    if v_group.fee_cents <= 0 then
      raise exception 'Calculated Arbiter fee must be greater than zero';
    end if;

    v_description := format(
      'CAFLA match fees %s: %s Center assignment%s ($%s) + %s AR assignment%s ($%s). Total CAFLA fee: $%s.',
      v_period_label,
      v_group.center_count,
      case when v_group.center_count = 1 then '' else 's' end,
      to_char((v_group.center_count * 800)::numeric / 100, 'FM999999990.00'),
      v_group.ar_count,
      case when v_group.ar_count = 1 then '' else 's' end,
      to_char((v_group.ar_count * 600)::numeric / 100, 'FM999999990.00'),
      to_char(v_group.fee_cents::numeric / 100, 'FM999999990.00')
    );

    insert into finance.transactions (
      member_id,
      transaction_date,
      transaction_type,
      amount_cents,
      currency,
      description,
      internal_notes,
      payment_method,
      match_id,
      source_type,
      source_id,
      idempotency_key,
      created_by,
      metadata
    ) values (
      v_group.member_id,
      v_posting_date,
      'match_fee',
      -v_group.fee_cents,
      'USD',
      v_description,
      format('Posted from Arbiter fee import %s (%s).', v_import.id, v_import.original_filename),
      null,
      null,
      'arbiter_fee_import',
      v_import.id::text,
      format('arbiter-fee-import:%s:%s', v_import.id, v_group.member_id),
      v_actor,
      jsonb_build_object(
        'source', 'arbiter_import',
        'import_id', v_import.id,
        'period_start', v_period_start,
        'period_end', v_period_end,
        'center_count', v_group.center_count,
        'ar_count', v_group.ar_count,
        'total_assignments', v_group.center_count + v_group.ar_count,
        'gross_earnings_cents', v_group.gross_cents,
        'center_fee_cents', v_group.center_count * 800,
        'ar_fee_cents', v_group.ar_count * 600,
        'total_fee_cents', v_group.fee_cents,
        'assignments', v_group.assignments
      )
    ) returning * into v_transaction;

    update finance.arbiter_fee_import_items
       set item_status = 'posted',
           resulting_transaction_id = v_transaction.id,
           posted_at = clock_timestamp()
     where import_id = p_import_id
       and item_status = 'new'
       and member_id = v_group.member_id;

    v_transaction_count := v_transaction_count + 1;
    v_assignment_count := v_assignment_count + v_group.center_count + v_group.ar_count;
    v_total_fee_cents := v_total_fee_cents + v_group.fee_cents;
  end loop;

  update finance.arbiter_fee_imports
     set status = 'posted',
         posted_by = v_actor,
         posted_at = clock_timestamp()
   where id = p_import_id;

  return jsonb_build_object(
    'import_id', p_import_id,
    'transaction_count', v_transaction_count,
    'assignment_count', v_assignment_count,
    'total_fee_cents', v_total_fee_cents,
    'transaction_date', v_posting_date
  );
exception
  when unique_violation then
    -- A competing import may pass the pre-check before its transaction commits.
    -- Raising from this handler rolls back every ledger/item/import write made
    -- by this function invocation while returning a stable domain message.
    raise exception 'One or more assignments were posted concurrently. Refresh the preview.'
      using errcode = 'P0001';
end;
$$;

alter table finance.arbiter_fee_imports enable row level security;
alter table finance.arbiter_fee_import_items enable row level security;

create policy arbiter_fee_imports_board_select
on finance.arbiter_fee_imports for select to authenticated
using (public.is_board());

create policy arbiter_fee_import_items_board_select
on finance.arbiter_fee_import_items for select to authenticated
using (public.is_board());

revoke all on finance.arbiter_fee_imports, finance.arbiter_fee_import_items
from public, anon, authenticated;
grant all on finance.arbiter_fee_imports, finance.arbiter_fee_import_items
to service_role;
grant select on finance.arbiter_fee_imports, finance.arbiter_fee_import_items
to authenticated;

revoke all on function finance.post_arbiter_fee_import(uuid)
from public, anon, authenticated;
grant execute on function finance.post_arbiter_fee_import(uuid)
to authenticated, service_role;

comment on table finance.arbiter_fee_imports is
  'Board-only Arbiter fee import batches. The original spreadsheet is not retained.';
comment on table finance.arbiter_fee_import_items is
  'Immutable parsed assignment evidence and posting lineage for Arbiter match fees.';
comment on column finance.arbiter_fee_import_items.canonical_assignment_key is
  'Stable identity arbiter-match-fee:{arbiter_game_id}:{center|ar1|ar2}; member identity is intentionally excluded.';
