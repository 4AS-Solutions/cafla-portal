-- Finance V1: preserve Arbiter Bill-To and add the approved WHSC 8 V 8 Center rate.
-- Forward-only follow-up to 20260916000000_create_unregistered_finance_ledger.sql.

alter table finance.arbiter_fee_import_items
  add column bill_to text;

comment on column finance.arbiter_fee_import_items.bill_to is
  'Trimmed Arbiter Bill-To snapshot. NULL identifies imports created before Bill-To preservation.';

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
     or new.bill_to is distinct from old.bill_to
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
      and upper(btrim(coalesce(bill_to, ''))) = 'WHSC SOCCER'
      and upper(btrim(coalesce(division, ''))) like '8 V 8%'
      and gross_earnings_cents = 6000
      and fee_cents = 600
    )
    or (
      role = 'center'
      and upper(btrim(coalesce(division, ''))) not like '7 V 7%'
      and not (
        upper(btrim(coalesce(bill_to, ''))) = 'WHSC SOCCER'
        and upper(btrim(coalesce(division, ''))) like '8 V 8%'
      )
      and (
        upper(btrim(coalesce(division, ''))) not like '8 V 8%'
        or bill_to is not null
      )
      and gross_earnings_cents = 8000
      and fee_cents = 800
    )
    or (
      role in ('ar1', 'ar2')
      and gross_earnings_cents = 6000
      and fee_cents = 600
    )
  ) not valid;

-- Existing Center 8 V 8 previews have no Bill-To snapshot and remain readable,
-- but the posting function below rejects them and requires a fresh preview.
do $$
begin
  if not exists (
    select 1
      from finance.arbiter_fee_import_items item
     where not (
       (
         item.role = 'center'
         and upper(btrim(coalesce(item.division, ''))) like '7 V 7%'
         and item.gross_earnings_cents = 7000
         and item.fee_cents = 700
       )
       or (
         item.role = 'center'
         and upper(btrim(coalesce(item.bill_to, ''))) = 'WHSC SOCCER'
         and upper(btrim(coalesce(item.division, ''))) like '8 V 8%'
         and item.gross_earnings_cents = 6000
         and item.fee_cents = 600
       )
       or (
         item.role = 'center'
         and upper(btrim(coalesce(item.division, ''))) not like '7 V 7%'
         and not (
           upper(btrim(coalesce(item.bill_to, ''))) = 'WHSC SOCCER'
           and upper(btrim(coalesce(item.division, ''))) like '8 V 8%'
         )
         and (
           upper(btrim(coalesce(item.division, ''))) not like '8 V 8%'
           or item.bill_to is not null
         )
         and item.gross_earnings_cents = 8000
         and item.fee_cents = 800
       )
       or (
         item.role in ('ar1', 'ar2')
         and item.gross_earnings_cents = 6000
         and item.fee_cents = 600
       )
     )
  ) then
    alter table finance.arbiter_fee_import_items
      validate constraint arbiter_fee_import_items_fee_rule;
  end if;
end;
$$;

create or replace function finance.post_arbiter_fee_import(p_import_id uuid) returns jsonb language plpgsql security definer set search_path=pg_catalog as $$
declare v_actor uuid:=auth.uid(); v_import finance.arbiter_fee_imports%rowtype; v_group record; v_tx finance.transactions%rowtype; v_utx finance.unregistered_transactions%rowtype; v_date date:=(clock_timestamp() at time zone 'America/Los_Angeles')::date; v_start date; v_end date; v_start_label text; v_end_label text; v_period_label text; v_description text; v_transactions integer:=0; v_assignments integer:=0; v_fee bigint:=0;
begin
  if v_actor is null or not public.is_board() then raise exception 'Board authorization required' using errcode='42501'; end if;
  select * into v_import from finance.arbiter_fee_imports where id=p_import_id for update;
  if not found then raise exception 'Arbiter fee import does not exist'; end if;
  if v_import.status not in ('draft','ready') then raise exception 'Arbiter fee import is not available for posting'; end if;
  if exists(select 1 from finance.arbiter_fee_import_items where import_id=p_import_id and item_status='new' and (not resolution_confirmed or num_nonnulls(member_id,unregistered_referee_id)<>1)) then raise exception 'Every new assignment must be resolved before posting'; end if;
  if not exists(select 1 from finance.arbiter_fee_import_items where import_id=p_import_id and item_status='new') then raise exception 'Arbiter fee import has no new assignments to post'; end if;
  if exists(select 1 from finance.arbiter_fee_import_items i join finance.unregistered_referee_links l on l.unregistered_referee_id=i.unregistered_referee_id where i.import_id=p_import_id and i.item_status='new') then raise exception 'An unregistered referee in this preview was linked to a member. Refresh or recreate the preview'; end if;
  if exists(select 1 from finance.arbiter_fee_import_items i where i.import_id=p_import_id and i.item_status='new' and i.role='center' and upper(btrim(coalesce(i.division,''))) like '8 V 8%' and i.bill_to is null) then raise exception 'This preview predates Bill-To fee validation. Recreate the import.'; end if;
  if exists(select 1 from finance.arbiter_fee_import_items i where i.import_id=p_import_id and i.item_status='new' and (i.match_date is null or i.gross_earnings_cents is distinct from case when i.role='center' and upper(btrim(coalesce(i.division,''))) like '7 V 7%' then 7000 when i.role='center' and upper(btrim(coalesce(i.bill_to,'')))='WHSC SOCCER' and upper(btrim(coalesce(i.division,''))) like '8 V 8%' then 6000 when i.role='center' then 8000 else 6000 end or i.fee_cents is distinct from case when i.role='center' and upper(btrim(coalesce(i.division,''))) like '7 V 7%' then 700 when i.role='center' and upper(btrim(coalesce(i.bill_to,'')))='WHSC SOCCER' and upper(btrim(coalesce(i.division,''))) like '8 V 8%' then 600 when i.role='center' then 800 else 600 end)) then raise exception 'One or more Arbiter assignments have invalid dates or fee rates'; end if;
  select min(match_date),max(match_date) into v_start,v_end from finance.arbiter_fee_import_items where import_id=p_import_id and item_status='new';
  if v_import.period_start is distinct from v_start or v_import.period_end is distinct from v_end then raise exception 'Arbiter fee import period does not match its new assignments'; end if;
  v_start_label:=(array['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'])[extract(month from v_start)::integer]||' '||extract(day from v_start)::integer;
  v_end_label:=(array['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'])[extract(month from v_end)::integer]||' '||extract(day from v_end)::integer;
  v_period_label:=case
    when v_start=v_end then v_start_label||', '||extract(year from v_start)::integer
    when extract(year from v_start)=extract(year from v_end) and extract(month from v_start)=extract(month from v_end) then v_start_label||chr(8211)||extract(day from v_end)::integer||', '||extract(year from v_end)::integer
    when extract(year from v_start)=extract(year from v_end) then v_start_label||chr(8211)||v_end_label||', '||extract(year from v_end)::integer
    else v_start_label||', '||extract(year from v_start)::integer||chr(8211)||v_end_label||', '||extract(year from v_end)::integer
  end;
  if exists(select 1 from finance.arbiter_fee_import_items c join finance.arbiter_fee_import_items p on p.canonical_assignment_key=c.canonical_assignment_key and p.correction_sequence=c.correction_sequence and p.item_status='posted' where c.import_id=p_import_id and c.item_status='new') then raise exception 'One or more assignments were posted by another import; refresh the preview'; end if;
  for v_group in
    with rated as(select i.*,case when role='center' and upper(btrim(coalesce(division,''))) like '7 V 7%' then 7000 when role='center' and upper(btrim(coalesce(bill_to,'')))='WHSC SOCCER' and upper(btrim(coalesce(division,''))) like '8 V 8%' then 6000 when role='center' then 8000 else 6000 end::bigint gross,case when role='center' and upper(btrim(coalesce(division,''))) like '7 V 7%' then 700 when role='center' and upper(btrim(coalesce(bill_to,'')))='WHSC SOCCER' and upper(btrim(coalesce(division,''))) like '8 V 8%' then 600 when role='center' then 800 else 600 end::bigint fee from finance.arbiter_fee_import_items i where import_id=p_import_id and item_status='new')
    select member_id,unregistered_referee_id,count(*) filter(where role='center')::integer centers,count(*) filter(where role in('ar1','ar2'))::integer ars,sum(gross)::bigint gross,sum(fee)::bigint fee,sum(fee) filter(where role='center')::bigint center_fee,sum(fee) filter(where role in('ar1','ar2'))::bigint ar_fee,jsonb_agg(jsonb_build_object('assignment_key',canonical_assignment_key,'arbiter_game_id',arbiter_game_id,'role',role,'division',division,'bill_to',bill_to,'match_date',match_date,'gross_earnings_cents',gross,'fee_cents',fee) order by match_date,arbiter_game_id,role) assignments from rated group by member_id,unregistered_referee_id order by member_id nulls last,unregistered_referee_id
  loop
    v_description:=format('CAFLA match fees %s: %s Center assignment%s ($%s) + %s AR assignment%s ($%s). Total CAFLA fee: $%s.',v_period_label,v_group.centers,case when v_group.centers=1 then '' else 's' end,to_char(coalesce(v_group.center_fee,0)::numeric/100,'FM999999990.00'),v_group.ars,case when v_group.ars=1 then '' else 's' end,to_char(coalesce(v_group.ar_fee,0)::numeric/100,'FM999999990.00'),to_char(v_group.fee::numeric/100,'FM999999990.00'));
    if v_group.member_id is not null then
      insert into finance.transactions(member_id,transaction_date,transaction_type,amount_cents,currency,description,internal_notes,source_type,source_id,idempotency_key,created_by,metadata) values(v_group.member_id,v_date,'match_fee',-v_group.fee,'USD',v_description,format('Posted from Arbiter fee import %s (%s).',v_import.id,v_import.original_filename),'arbiter_fee_import',v_import.id::text,format('arbiter-fee-import:%s:member:%s',v_import.id,v_group.member_id),v_actor,jsonb_build_object('source','arbiter_import','import_id',v_import.id,'period_start',v_start,'period_end',v_end,'center_count',v_group.centers,'ar_count',v_group.ars,'gross_earnings_cents',v_group.gross,'center_fee_cents',coalesce(v_group.center_fee,0),'ar_fee_cents',coalesce(v_group.ar_fee,0),'total_fee_cents',v_group.fee,'assignments',v_group.assignments)) returning * into v_tx;
      update finance.arbiter_fee_import_items set item_status='posted',resulting_transaction_id=v_tx.id,posted_at=clock_timestamp() where import_id=p_import_id and item_status='new' and member_id=v_group.member_id;
    else
      perform pg_advisory_xact_lock(hashtextextended('finance.unregistered:'||v_group.unregistered_referee_id::text,0));
      if exists(select 1 from finance.unregistered_referee_links where unregistered_referee_id=v_group.unregistered_referee_id) then raise exception 'An unregistered referee in this preview was linked to a member. Refresh or recreate the preview'; end if;
      insert into finance.unregistered_transactions(unregistered_referee_id,transaction_date,transaction_type,amount_cents,currency,description,internal_notes,source_type,source_id,idempotency_key,created_by,metadata) values(v_group.unregistered_referee_id,v_date,'match_fee',-v_group.fee,'USD',v_description,format('Posted from Arbiter fee import %s (%s).',v_import.id,v_import.original_filename),'arbiter_fee_import',v_import.id::text,format('arbiter-fee-import:%s:unregistered:%s',v_import.id,v_group.unregistered_referee_id),v_actor,jsonb_build_object('source','arbiter_import','import_id',v_import.id,'period_start',v_start,'period_end',v_end,'center_count',v_group.centers,'ar_count',v_group.ars,'gross_earnings_cents',v_group.gross,'center_fee_cents',coalesce(v_group.center_fee,0),'ar_fee_cents',coalesce(v_group.ar_fee,0),'total_fee_cents',v_group.fee,'assignments',v_group.assignments)) returning * into v_utx;
      update finance.arbiter_fee_import_items set item_status='posted',resulting_unregistered_transaction_id=v_utx.id,posted_at=clock_timestamp() where import_id=p_import_id and item_status='new' and unregistered_referee_id=v_group.unregistered_referee_id;
    end if;
    v_transactions:=v_transactions+1;v_assignments:=v_assignments+v_group.centers+v_group.ars;v_fee:=v_fee+v_group.fee;
  end loop;
  update finance.arbiter_fee_imports set status='posted',posted_by=v_actor,posted_at=clock_timestamp() where id=p_import_id;
  return jsonb_build_object('import_id',p_import_id,'transaction_count',v_transactions,'assignment_count',v_assignments,'total_fee_cents',v_fee,'transaction_date',v_date);
exception when unique_violation then raise exception 'One or more assignments were posted concurrently. Refresh the preview.' using errcode='P0001';
end $$;

revoke all on function finance.post_arbiter_fee_import(uuid)
from public, anon, authenticated;
grant execute on function finance.post_arbiter_fee_import(uuid)
to authenticated, service_role;

comment on constraint arbiter_fee_import_items_fee_rule on finance.arbiter_fee_import_items is
  'Center is 7000/700 for 7 V 7; 6000/600 for exact WHSC Soccer Bill-To plus 8 V 8; otherwise 8000/800. AR is always 6000/600.';

