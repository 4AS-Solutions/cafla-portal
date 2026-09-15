-- Finance V1: add the approved 7 V 7 Center rate.
-- Forward-only follow-up to 20260914000000_create_arbiter_fee_imports.sql.

alter table finance.arbiter_fee_import_items
  drop constraint arbiter_fee_import_items_fee_rule;

alter table finance.arbiter_fee_import_items
  add constraint arbiter_fee_import_items_fee_rule check (
    (
      role = 'center'
      and upper(btrim(coalesce(division, ''))) like '7 V 7%'
      and gross_earnings_cents = 7000
      and fee_cents = 700
    )
    or (
      role = 'center'
      and upper(btrim(coalesce(division, ''))) not like '7 V 7%'
      and gross_earnings_cents = 8000
      and fee_cents = 800
    )
    or (
      role in ('ar1', 'ar2')
      and gross_earnings_cents = 6000
      and fee_cents = 600
    )
  ) not valid;

-- A preview created before this rule existed may contain an immutable 7 V 7
-- Center snapshot at the former 8000/800 rate. The new constraint still
-- governs every new/updated row immediately. Validate it when no such residue
-- exists; otherwise the hardened posting function below rejects that preview
-- and Board must create a fresh import with the corrected application rule.
do $$
begin
  if not exists (
    select 1
      from finance.arbiter_fee_import_items item
     where not (
       (item.role = 'center' and upper(btrim(coalesce(item.division, ''))) like '7 V 7%'
         and item.gross_earnings_cents = 7000 and item.fee_cents = 700)
       or (item.role = 'center' and upper(btrim(coalesce(item.division, ''))) not like '7 V 7%'
         and item.gross_earnings_cents = 8000 and item.fee_cents = 800)
       or (item.role in ('ar1', 'ar2')
         and item.gross_earnings_cents = 6000 and item.fee_cents = 600)
     )
  ) then
    alter table finance.arbiter_fee_import_items
      validate constraint arbiter_fee_import_items_fee_rule;
  end if;
end;
$$;

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

  if not found then raise exception 'Arbiter fee import does not exist'; end if;
  if v_import.status not in ('draft', 'ready') then
    raise exception 'Arbiter fee import is not available for posting';
  end if;
  if exists (
    select 1 from finance.arbiter_fee_import_items
     where import_id = p_import_id and item_status = 'new'
       and (not resolution_confirmed or member_id is null)
  ) then raise exception 'Every new assignment must be resolved before posting'; end if;
  if exists (
    select 1 from finance.arbiter_fee_import_items
     where import_id = p_import_id and item_status = 'new' and match_date is null
  ) then raise exception 'Every new assignment must have a valid match date'; end if;
  if not exists (
    select 1 from finance.arbiter_fee_import_items
     where import_id = p_import_id and item_status = 'new'
  ) then raise exception 'Arbiter fee import has no new assignments to post'; end if;

  -- Independently derive and validate every stored rate before posting.
  if exists (
    select 1
      from finance.arbiter_fee_import_items item
     where item.import_id = p_import_id
       and item.item_status = 'new'
       and (
         item.gross_earnings_cents is distinct from case
           when item.role = 'center' and upper(btrim(coalesce(item.division, ''))) like '7 V 7%' then 7000
           when item.role = 'center' then 8000
           else 6000
         end
         or item.fee_cents is distinct from case
           when item.role = 'center' and upper(btrim(coalesce(item.division, ''))) like '7 V 7%' then 700
           when item.role = 'center' then 800
           else 600
         end
       )
  ) then raise exception 'One or more Arbiter assignments have an invalid fee rate'; end if;

  select min(match_date), max(match_date) into v_period_start, v_period_end
    from finance.arbiter_fee_import_items
   where import_id = p_import_id and item_status = 'new';
  if v_import.period_start is distinct from v_period_start
     or v_import.period_end is distinct from v_period_end then
    raise exception 'Arbiter fee import period does not match its new assignments';
  end if;

  v_period_start_label := (array['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'])[extract(month from v_period_start)::integer]
    || ' ' || extract(day from v_period_start)::integer;
  v_period_end_label := (array['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'])[extract(month from v_period_end)::integer]
    || ' ' || extract(day from v_period_end)::integer;
  v_period_label := case
    when v_period_start = v_period_end then v_period_start_label || ', ' || extract(year from v_period_start)::integer
    when extract(year from v_period_start) = extract(year from v_period_end)
     and extract(month from v_period_start) = extract(month from v_period_end)
      then v_period_start_label || chr(8211) || extract(day from v_period_end)::integer || ', ' || extract(year from v_period_end)::integer
    when extract(year from v_period_start) = extract(year from v_period_end)
      then v_period_start_label || chr(8211) || v_period_end_label || ', ' || extract(year from v_period_end)::integer
    else v_period_start_label || ', ' || extract(year from v_period_start)::integer || chr(8211) || v_period_end_label || ', ' || extract(year from v_period_end)::integer
  end;

  if exists (
    select 1 from finance.arbiter_fee_import_items candidate
    join finance.arbiter_fee_import_items posted
      on posted.canonical_assignment_key = candidate.canonical_assignment_key
     and posted.correction_sequence = candidate.correction_sequence
     and posted.item_status = 'posted'
    where candidate.import_id = p_import_id and candidate.item_status = 'new'
  ) then raise exception 'One or more assignments were posted by another import; refresh the preview'; end if;

  for v_group in
    with rated as (
      select item.*,
        case
          when role = 'center' and upper(btrim(coalesce(division, ''))) like '7 V 7%' then 7000
          when role = 'center' then 8000
          else 6000
        end::bigint as expected_gross_cents,
        case
          when role = 'center' and upper(btrim(coalesce(division, ''))) like '7 V 7%' then 700
          when role = 'center' then 800
          else 600
        end::bigint as expected_fee_cents
      from finance.arbiter_fee_import_items item
      where import_id = p_import_id and item_status = 'new'
        and resolution_confirmed and member_id is not null
    )
    select member_id,
      count(*) filter (where role = 'center')::integer as center_count,
      count(*) filter (where role in ('ar1','ar2'))::integer as ar_count,
      sum(expected_gross_cents)::bigint as gross_cents,
      sum(expected_fee_cents)::bigint as fee_cents,
      sum(expected_fee_cents) filter (where role = 'center')::bigint as center_fee_cents,
      sum(expected_fee_cents) filter (where role in ('ar1','ar2'))::bigint as ar_fee_cents,
      jsonb_agg(jsonb_build_object(
        'assignment_key', canonical_assignment_key,
        'arbiter_game_id', arbiter_game_id,
        'role', role,
        'division', division,
        'match_date', match_date,
        'gross_earnings_cents', expected_gross_cents,
        'fee_cents', expected_fee_cents
      ) order by match_date, arbiter_game_id, role) as assignments
    from rated group by member_id order by member_id
  loop
    if v_group.fee_cents <= 0 then raise exception 'Calculated Arbiter fee must be greater than zero'; end if;
    v_description := format(
      'CAFLA match fees %s: %s Center assignment%s ($%s) + %s AR assignment%s ($%s). Total CAFLA fee: $%s.',
      v_period_label, v_group.center_count, case when v_group.center_count = 1 then '' else 's' end,
      to_char(coalesce(v_group.center_fee_cents, 0)::numeric / 100, 'FM999999990.00'),
      v_group.ar_count, case when v_group.ar_count = 1 then '' else 's' end,
      to_char(coalesce(v_group.ar_fee_cents, 0)::numeric / 100, 'FM999999990.00'),
      to_char(v_group.fee_cents::numeric / 100, 'FM999999990.00')
    );

    insert into finance.transactions (
      member_id, transaction_date, transaction_type, amount_cents, currency,
      description, internal_notes, payment_method, match_id, source_type,
      source_id, idempotency_key, created_by, metadata
    ) values (
      v_group.member_id, v_posting_date, 'match_fee', -v_group.fee_cents, 'USD',
      v_description, format('Posted from Arbiter fee import %s (%s).', v_import.id, v_import.original_filename),
      null, null, 'arbiter_fee_import', v_import.id::text,
      format('arbiter-fee-import:%s:%s', v_import.id, v_group.member_id), v_actor,
      jsonb_build_object(
        'source','arbiter_import','import_id',v_import.id,
        'period_start',v_period_start,'period_end',v_period_end,
        'center_count',v_group.center_count,'ar_count',v_group.ar_count,
        'total_assignments',v_group.center_count + v_group.ar_count,
        'gross_earnings_cents',v_group.gross_cents,
        'center_fee_cents',coalesce(v_group.center_fee_cents, 0),
        'ar_fee_cents',coalesce(v_group.ar_fee_cents, 0),
        'total_fee_cents',v_group.fee_cents,'assignments',v_group.assignments
      )
    ) returning * into v_transaction;

    update finance.arbiter_fee_import_items
       set item_status = 'posted', resulting_transaction_id = v_transaction.id, posted_at = clock_timestamp()
     where import_id = p_import_id and item_status = 'new' and member_id = v_group.member_id;
    v_transaction_count := v_transaction_count + 1;
    v_assignment_count := v_assignment_count + v_group.center_count + v_group.ar_count;
    v_total_fee_cents := v_total_fee_cents + v_group.fee_cents;
  end loop;

  update finance.arbiter_fee_imports
     set status = 'posted', posted_by = v_actor, posted_at = clock_timestamp()
   where id = p_import_id;
  return jsonb_build_object(
    'import_id',p_import_id,'transaction_count',v_transaction_count,
    'assignment_count',v_assignment_count,'total_fee_cents',v_total_fee_cents,
    'transaction_date',v_posting_date
  );
exception
  when unique_violation then
    raise exception 'One or more assignments were posted concurrently. Refresh the preview.' using errcode = 'P0001';
end;
$$;

revoke all on function finance.post_arbiter_fee_import(uuid)
from public, anon, authenticated;
grant execute on function finance.post_arbiter_fee_import(uuid)
to authenticated, service_role;

comment on constraint arbiter_fee_import_items_fee_rule on finance.arbiter_fee_import_items is
  'Center is 7000/700 cents when normalized division starts with 7 V 7, otherwise 8000/800; AR is always 6000/600.';
