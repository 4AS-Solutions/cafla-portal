-- Finance V1: Board-only holding ledger for people not yet in public.members.
-- No data is seeded and the registered-member ledger remains unchanged.

create table finance.unregistered_referees (
  id uuid primary key default extensions.uuid_generate_v4(),
  display_name text not null,
  normalized_name text not null,
  created_by uuid not null references public.members(id) on delete restrict,
  created_at timestamptz not null default now(),
  constraint unregistered_referees_name_nonempty check (btrim(display_name) <> '' and btrim(normalized_name) <> '')
);

create index unregistered_referees_normalized_name_idx on finance.unregistered_referees(normalized_name);

create table finance.unregistered_referee_links (
  id uuid primary key default extensions.uuid_generate_v4(),
  unregistered_referee_id uuid not null unique references finance.unregistered_referees(id) on delete restrict,
  member_id uuid not null unique references public.members(id) on delete restrict,
  idempotency_key text not null unique,
  linked_by uuid not null references public.members(id) on delete restrict,
  linked_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  constraint unregistered_referee_links_key_nonempty check (btrim(idempotency_key) <> ''),
  constraint unregistered_referee_links_metadata_object check (jsonb_typeof(metadata) = 'object')
);

create table finance.unregistered_transactions (
  id uuid primary key default extensions.uuid_generate_v4(),
  unregistered_referee_id uuid not null references finance.unregistered_referees(id) on delete restrict,
  transaction_date date not null,
  transaction_type finance.transaction_type not null,
  amount_cents bigint not null,
  currency text not null default 'USD',
  description text not null,
  internal_notes text,
  payment_method finance.payment_method,
  source_type text,
  source_id text,
  idempotency_key text,
  reversal_of_transaction_id uuid references finance.unregistered_transactions(id) on delete restrict,
  reversal_reason text,
  created_by uuid not null references public.members(id) on delete restrict,
  created_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  constraint unregistered_transactions_amount_nonzero check (amount_cents <> 0),
  constraint unregistered_transactions_currency_usd check (currency = 'USD'),
  constraint unregistered_transactions_description_nonempty check (btrim(description) <> ''),
  constraint unregistered_transactions_source_pair check ((source_type is null and source_id is null) or (nullif(btrim(source_type),'') is not null and nullif(btrim(source_id),'') is not null)),
  constraint unregistered_transactions_payment_method check ((transaction_type = 'payment' and payment_method is not null) or (transaction_type <> 'payment' and payment_method is null)),
  constraint unregistered_transactions_sign check ((transaction_type in ('match_fee','annual_membership_fee','manual_charge') and amount_cents < 0) or (transaction_type in ('payment','manual_credit') and amount_cents > 0) or transaction_type in ('opening_balance','adjustment','reversal')),
  constraint unregistered_transactions_reversal_shape check ((transaction_type = 'reversal' and reversal_of_transaction_id is not null and nullif(btrim(reversal_reason),'') is not null) or (transaction_type <> 'reversal' and reversal_of_transaction_id is null and reversal_reason is null)),
  constraint unregistered_transactions_metadata_object check (jsonb_typeof(metadata) = 'object')
);

create unique index unregistered_transactions_idempotency_uidx on finance.unregistered_transactions(idempotency_key) where idempotency_key is not null;
create unique index unregistered_transactions_opening_uidx on finance.unregistered_transactions(unregistered_referee_id,currency) where transaction_type = 'opening_balance';
create unique index unregistered_transactions_reversal_uidx on finance.unregistered_transactions(reversal_of_transaction_id) where reversal_of_transaction_id is not null;
create index unregistered_transactions_account_date_idx on finance.unregistered_transactions(unregistered_referee_id,transaction_date,created_at,id);

create table finance.unregistered_transaction_links (
  unregistered_transaction_id uuid primary key references finance.unregistered_transactions(id) on delete restrict,
  transaction_id uuid not null unique references finance.transactions(id) on delete restrict,
  unregistered_referee_link_id uuid not null references finance.unregistered_referee_links(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table finance.unregistered_arbiter_aliases (
  id uuid primary key default extensions.uuid_generate_v4(),
  arbiter_name text not null,
  normalized_arbiter_name text not null unique,
  unregistered_referee_id uuid not null references finance.unregistered_referees(id) on delete restrict,
  confirmed_by uuid not null references public.members(id) on delete restrict,
  confirmed_at timestamptz not null default now(),
  constraint unregistered_arbiter_aliases_name_nonempty check (btrim(arbiter_name) <> '' and btrim(normalized_arbiter_name) <> '')
);

create table finance.monthly_unregistered_balance_snapshots (
  id uuid primary key default extensions.uuid_generate_v4(),
  closing_id uuid not null references finance.monthly_closings(id) on delete restrict,
  unregistered_referee_id uuid not null references finance.unregistered_referees(id) on delete restrict,
  balance_cents bigint not null,
  currency text not null default 'USD',
  created_at timestamptz not null default now(),
  constraint monthly_unregistered_snapshots_currency check (currency = 'USD'),
  unique(closing_id,unregistered_referee_id,currency)
);

create or replace function finance.reject_unregistered_transaction_mutation() returns trigger language plpgsql set search_path=pg_catalog as $$ begin raise exception 'finance.unregistered_transactions is append-only; use a reversal'; end $$;
create trigger unregistered_transactions_reject_update before update on finance.unregistered_transactions for each row execute function finance.reject_unregistered_transaction_mutation();
create trigger unregistered_transactions_reject_delete before delete on finance.unregistered_transactions for each row execute function finance.reject_unregistered_transaction_mutation();

create or replace function finance.validate_unregistered_transaction_insert() returns trigger language plpgsql set search_path=pg_catalog as $$
declare v_original finance.unregistered_transactions%rowtype;
begin
  if exists(select 1 from finance.unregistered_referee_links where unregistered_referee_id=new.unregistered_referee_id) then raise exception 'Linked unregistered identities cannot receive new transactions'; end if;
  if new.transaction_type <> 'reversal' then return new; end if;
  select * into v_original from finance.unregistered_transactions where id=new.reversal_of_transaction_id for key share;
  if not found or v_original.transaction_type='reversal' then raise exception 'Invalid unregistered transaction reversal'; end if;
  if new.unregistered_referee_id<>v_original.unregistered_referee_id or new.currency<>v_original.currency or new.amount_cents<>-v_original.amount_cents then raise exception 'A reversal must exactly offset its original unregistered transaction'; end if;
  return new;
end $$;
create trigger unregistered_transactions_validate_insert before insert on finance.unregistered_transactions for each row execute function finance.validate_unregistered_transaction_insert();

create or replace function finance.create_unregistered_referee(p_display_name text,p_normalized_name text,p_arbiter_name text default null,p_normalized_arbiter_name text default null) returns finance.unregistered_referees language plpgsql security definer set search_path=pg_catalog as $$
declare v_actor uuid:=auth.uid(); v_result finance.unregistered_referees;
begin
  if v_actor is null or not public.is_board() then raise exception 'Board authorization required' using errcode='42501'; end if;
  if nullif(btrim(p_display_name),'') is null or nullif(btrim(p_normalized_name),'') is null then raise exception 'Unregistered referee name is required'; end if;
  if (p_arbiter_name is null and p_normalized_arbiter_name is not null)
     or (p_arbiter_name is not null and p_normalized_arbiter_name is null)
     or (p_arbiter_name is not null and (nullif(btrim(p_arbiter_name),'') is null or nullif(btrim(p_normalized_arbiter_name),'') is null)) then
    raise exception 'Arbiter alias name and normalized name must both be non-empty or both be null';
  end if;
  insert into finance.unregistered_referees(display_name,normalized_name,created_by) values(btrim(p_display_name),btrim(p_normalized_name),v_actor) returning * into v_result;
  if p_arbiter_name is not null then
    insert into finance.unregistered_arbiter_aliases(arbiter_name,normalized_arbiter_name,unregistered_referee_id,confirmed_by) values(btrim(p_arbiter_name),btrim(p_normalized_arbiter_name),v_result.id,v_actor);
  end if;
  return v_result;
end $$;

create or replace function finance.record_unregistered_transaction(p_unregistered_referee_id uuid,p_transaction_date date,p_transaction_type finance.transaction_type,p_amount_cents bigint,p_description text,p_payment_method finance.payment_method default null,p_internal_notes text default null,p_source_type text default null,p_source_id text default null,p_idempotency_key text default null,p_metadata jsonb default '{}'::jsonb) returns finance.unregistered_transactions language plpgsql security definer set search_path=pg_catalog as $$
declare v_actor uuid:=auth.uid(); v_result finance.unregistered_transactions;
begin
  if v_actor is null or not public.is_board() then raise exception 'Board authorization required' using errcode='42501'; end if;
  if p_transaction_type='reversal' then raise exception 'Use finance.reverse_unregistered_transaction()'; end if;
  if nullif(btrim(p_idempotency_key),'') is null then raise exception 'An idempotency key is required for unregistered transactions'; end if;
  perform pg_advisory_xact_lock(hashtextextended('finance.unregistered:'||p_unregistered_referee_id::text,0));
  if exists(select 1 from finance.unregistered_referee_links where unregistered_referee_id=p_unregistered_referee_id) then raise exception 'Linked unregistered identities cannot receive new transactions'; end if;
  insert into finance.unregistered_transactions(unregistered_referee_id,transaction_date,transaction_type,amount_cents,currency,description,internal_notes,payment_method,source_type,source_id,idempotency_key,created_by,metadata)
  values(p_unregistered_referee_id,p_transaction_date,p_transaction_type,p_amount_cents,'USD',p_description,p_internal_notes,p_payment_method,p_source_type,p_source_id,nullif(btrim(p_idempotency_key),''),v_actor,coalesce(p_metadata,'{}'::jsonb)) returning * into v_result;
  return v_result;
end $$;

create or replace function finance.reverse_unregistered_transaction(p_original_transaction_id uuid,p_transaction_date date,p_description text,p_reversal_reason text,p_idempotency_key text,p_internal_notes text default null) returns finance.unregistered_transactions language plpgsql security definer set search_path=pg_catalog as $$
declare v_actor uuid:=auth.uid(); v_unregistered_referee_id uuid; v_original finance.unregistered_transactions%rowtype; v_result finance.unregistered_transactions;
begin
  if v_actor is null or not public.is_board() then raise exception 'Board authorization required' using errcode='42501'; end if;
  if nullif(btrim(p_idempotency_key),'') is null then raise exception 'An idempotency key is required for reversals'; end if;
  if nullif(btrim(p_reversal_reason),'') is null then raise exception 'A non-empty reversal reason is required'; end if;
  select unregistered_referee_id into v_unregistered_referee_id from finance.unregistered_transactions where id=p_original_transaction_id;
  if not found then raise exception 'Original unregistered transaction cannot be reversed'; end if;
  perform pg_advisory_xact_lock(hashtextextended('finance.unregistered:'||v_unregistered_referee_id::text,0));
  if exists(select 1 from finance.unregistered_referee_links where unregistered_referee_id=v_unregistered_referee_id) then raise exception 'Linked unregistered identities cannot receive new reversals'; end if;
  select * into v_original from finance.unregistered_transactions where id=p_original_transaction_id for update;
  if not found or v_original.transaction_type='reversal' then raise exception 'Original unregistered transaction cannot be reversed'; end if;
  insert into finance.unregistered_transactions(unregistered_referee_id,transaction_date,transaction_type,amount_cents,currency,description,internal_notes,source_type,source_id,idempotency_key,reversal_of_transaction_id,reversal_reason,created_by,metadata)
  values(v_original.unregistered_referee_id,p_transaction_date,'reversal',-v_original.amount_cents,'USD',p_description,p_internal_notes,'unregistered_transaction_reversal',v_original.id::text,btrim(p_idempotency_key),v_original.id,btrim(p_reversal_reason),v_actor,jsonb_build_object('original_unregistered_transaction_id',v_original.id)) returning * into v_result;
  return v_result;
end $$;

create or replace function finance.link_unregistered_referee(p_unregistered_referee_id uuid,p_member_id uuid,p_idempotency_key text) returns jsonb language plpgsql security definer set search_path=pg_catalog as $$
declare v_actor uuid:=auth.uid(); v_link finance.unregistered_referee_links; v_source finance.unregistered_transactions%rowtype; v_target finance.transactions; v_original_target uuid; v_count integer:=0; v_balance bigint:=0;
begin
  if v_actor is null or not public.is_board() then raise exception 'Board authorization required' using errcode='42501'; end if;
  perform pg_advisory_xact_lock(hashtextextended('finance.unregistered-representation-snapshot',0));
  perform pg_advisory_xact_lock(hashtextextended('finance.unregistered:'||p_unregistered_referee_id::text,0));
  perform pg_advisory_xact_lock(hashtextextended('finance.member:'||p_member_id::text,0));
  select * into v_link from finance.unregistered_referee_links where idempotency_key=p_idempotency_key;
  if found then
    if v_link.unregistered_referee_id<>p_unregistered_referee_id or v_link.member_id<>p_member_id then raise exception 'Link idempotency key conflicts with another request'; end if;
    return jsonb_build_object('link_id',v_link.id,'transaction_count',(select count(*) from finance.unregistered_transaction_links where unregistered_referee_link_id=v_link.id),'balance_cents',(select coalesce(sum(t.amount_cents),0) from finance.unregistered_transactions t where t.unregistered_referee_id=p_unregistered_referee_id));
  end if;
  if not exists(select 1 from finance.unregistered_referees where id=p_unregistered_referee_id) or not exists(select 1 from public.members where id=p_member_id) then raise exception 'Unregistered identity or member does not exist'; end if;
  insert into finance.unregistered_referee_links(unregistered_referee_id,member_id,idempotency_key,linked_by) values(p_unregistered_referee_id,p_member_id,btrim(p_idempotency_key),v_actor) returning * into v_link;
  for v_source in select * from finance.unregistered_transactions where unregistered_referee_id=p_unregistered_referee_id and transaction_type<>'reversal' order by created_at,id loop
    insert into finance.transactions(member_id,transaction_date,transaction_type,amount_cents,currency,description,internal_notes,payment_method,source_type,source_id,idempotency_key,created_by,metadata)
    values(p_member_id,v_source.transaction_date,case when v_source.transaction_type='opening_balance' and exists(select 1 from finance.transactions t where t.member_id=p_member_id and t.currency=v_source.currency and t.transaction_type='opening_balance') then 'adjustment'::finance.transaction_type else v_source.transaction_type end,v_source.amount_cents,v_source.currency,v_source.description,v_source.internal_notes,v_source.payment_method,'unregistered_transaction_link',v_source.id::text,'unregistered-link:'||p_unregistered_referee_id||':'||v_source.id,v_actor,v_source.metadata||jsonb_build_object('unregistered_referee_id',p_unregistered_referee_id,'unregistered_transaction_id',v_source.id,'original_transaction_type',v_source.transaction_type)) returning * into v_target;
    insert into finance.unregistered_transaction_links values(v_source.id,v_target.id,v_link.id,now()); v_count:=v_count+1; v_balance:=v_balance+v_source.amount_cents;
  end loop;
  for v_source in select * from finance.unregistered_transactions where unregistered_referee_id=p_unregistered_referee_id and transaction_type='reversal' order by created_at,id loop
    select transaction_id into v_original_target from finance.unregistered_transaction_links where unregistered_transaction_id=v_source.reversal_of_transaction_id;
    insert into finance.transactions(member_id,transaction_date,transaction_type,amount_cents,currency,description,internal_notes,source_type,source_id,idempotency_key,reversal_of_transaction_id,reversal_reason,created_by,metadata)
    values(p_member_id,v_source.transaction_date,'reversal',v_source.amount_cents,v_source.currency,v_source.description,v_source.internal_notes,'unregistered_transaction_link',v_source.id::text,'unregistered-link:'||p_unregistered_referee_id||':'||v_source.id,v_original_target,v_source.reversal_reason,v_actor,v_source.metadata||jsonb_build_object('unregistered_referee_id',p_unregistered_referee_id,'unregistered_transaction_id',v_source.id)) returning * into v_target;
    insert into finance.unregistered_transaction_links values(v_source.id,v_target.id,v_link.id,now()); v_count:=v_count+1; v_balance:=v_balance+v_source.amount_cents;
  end loop;
  if exists(select 1 from finance.unregistered_arbiter_aliases a join public.arbiter_referees p on p.arbiter_name=a.arbiter_name where a.unregistered_referee_id=p_unregistered_referee_id and p.member_id is distinct from p_member_id) then raise exception 'An Arbiter alias is already mapped to another member'; end if;
  insert into public.arbiter_referees(arbiter_name,member_id,finance_verified_at,finance_verified_by)
    select a.arbiter_name,p_member_id,clock_timestamp(),v_actor from finance.unregistered_arbiter_aliases a where a.unregistered_referee_id=p_unregistered_referee_id
    on conflict(arbiter_name) do update set member_id=excluded.member_id,finance_verified_at=excluded.finance_verified_at,finance_verified_by=excluded.finance_verified_by;
  return jsonb_build_object('link_id',v_link.id,'transaction_count',v_count,'balance_cents',v_balance);
end $$;

alter table finance.arbiter_fee_import_items add column unregistered_referee_id uuid references finance.unregistered_referees(id) on delete restrict;
alter table finance.arbiter_fee_import_items add column resulting_unregistered_transaction_id uuid references finance.unregistered_transactions(id) on delete restrict;
alter table finance.arbiter_fee_import_items drop constraint arbiter_fee_import_items_resolution_method;
alter table finance.arbiter_fee_import_items add constraint arbiter_fee_import_items_resolution_method check(resolution_method in ('exact_full_name','trusted_alias','pending','board_confirmed','unregistered_confirmed','unregistered_alias'));
alter table finance.arbiter_fee_import_items drop constraint arbiter_fee_import_items_resolution_shape;
alter table finance.arbiter_fee_import_items add constraint arbiter_fee_import_items_resolution_shape check((resolution_confirmed and num_nonnulls(member_id,unregistered_referee_id)=1) or (not resolution_confirmed and unregistered_referee_id is null));
alter table finance.arbiter_fee_import_items drop constraint arbiter_fee_import_items_manual_resolution_audit;
alter table finance.arbiter_fee_import_items add constraint arbiter_fee_import_items_manual_resolution_audit check((resolution_method in ('board_confirmed','unregistered_confirmed') and resolved_by is not null and resolved_at is not null) or (resolution_method not in ('board_confirmed','unregistered_confirmed') and resolved_by is null and resolved_at is null));
alter table finance.arbiter_fee_import_items drop constraint arbiter_fee_import_items_posting_shape;
alter table finance.arbiter_fee_import_items add constraint arbiter_fee_import_items_posting_shape check((item_status='posted' and num_nonnulls(resulting_transaction_id,resulting_unregistered_transaction_id)=1 and posted_at is not null) or (item_status<>'posted' and resulting_transaction_id is null and resulting_unregistered_transaction_id is null and posted_at is null));

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
  if exists(select 1 from finance.arbiter_fee_import_items i where i.import_id=p_import_id and i.item_status='new' and (i.match_date is null or i.gross_earnings_cents is distinct from case when i.role='center' and upper(btrim(coalesce(i.division,''))) like '7 V 7%' then 7000 when i.role='center' then 8000 else 6000 end or i.fee_cents is distinct from case when i.role='center' and upper(btrim(coalesce(i.division,''))) like '7 V 7%' then 700 when i.role='center' then 800 else 600 end)) then raise exception 'One or more Arbiter assignments have invalid dates or fee rates'; end if;
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
    with rated as(select i.*,case when role='center' and upper(btrim(coalesce(division,''))) like '7 V 7%' then 7000 when role='center' then 8000 else 6000 end::bigint gross,case when role='center' and upper(btrim(coalesce(division,''))) like '7 V 7%' then 700 when role='center' then 800 else 600 end::bigint fee from finance.arbiter_fee_import_items i where import_id=p_import_id and item_status='new')
    select member_id,unregistered_referee_id,count(*) filter(where role='center')::integer centers,count(*) filter(where role in('ar1','ar2'))::integer ars,sum(gross)::bigint gross,sum(fee)::bigint fee,sum(fee) filter(where role='center')::bigint center_fee,sum(fee) filter(where role in('ar1','ar2'))::bigint ar_fee,jsonb_agg(jsonb_build_object('assignment_key',canonical_assignment_key,'arbiter_game_id',arbiter_game_id,'role',role,'division',division,'match_date',match_date,'gross_earnings_cents',gross,'fee_cents',fee) order by match_date,arbiter_game_id,role) assignments from rated group by member_id,unregistered_referee_id order by member_id nulls last,unregistered_referee_id
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

create or replace function finance.populate_monthly_closing_snapshots(p_closing_id uuid) returns bigint language plpgsql security definer set search_path=pg_catalog as $$
declare v_closing finance.monthly_closings%rowtype; v_registered bigint; v_unregistered bigint;
begin
  select * into v_closing from finance.monthly_closings where id=p_closing_id for update;
  if not found or v_closing.status<>'draft' then raise exception 'Snapshots can only be populated for an existing draft closing'; end if;
  perform pg_advisory_xact_lock(hashtextextended('finance.unregistered-representation-snapshot',0));
  delete from finance.monthly_balance_snapshots where closing_id=p_closing_id;
  delete from finance.monthly_unregistered_balance_snapshots where closing_id=p_closing_id;
  insert into finance.monthly_balance_snapshots(closing_id,member_id,balance_cents,currency)
    select v_closing.id,t.member_id,sum(t.amount_cents),t.currency from finance.transactions t where t.transaction_date<=v_closing.period_end and t.created_at<=v_closing.ledger_cutoff_at group by t.member_id,t.currency;
  get diagnostics v_registered=row_count;
  insert into finance.monthly_unregistered_balance_snapshots(closing_id,unregistered_referee_id,balance_cents,currency)
    select v_closing.id,t.unregistered_referee_id,sum(t.amount_cents),t.currency from finance.unregistered_transactions t
    where t.transaction_date<=v_closing.period_end and t.created_at<=v_closing.ledger_cutoff_at
      and not exists(select 1 from finance.unregistered_referee_links l where l.unregistered_referee_id=t.unregistered_referee_id and l.linked_at<=v_closing.ledger_cutoff_at)
    group by t.unregistered_referee_id,t.currency;
  get diagnostics v_unregistered=row_count; return v_registered+v_unregistered;
end $$;

create or replace function finance.protect_monthly_unregistered_snapshot() returns trigger language plpgsql set search_path=pg_catalog as $$ declare v_status finance.closing_status; begin select status into v_status from finance.monthly_closings where id=case when tg_op='DELETE' then old.closing_id else new.closing_id end; if v_status is distinct from 'draft'::finance.closing_status then raise exception 'Snapshots belonging to finalized or superseded closings are immutable'; end if; if tg_op='DELETE' then return old; end if; return new; end $$;
create trigger monthly_unregistered_snapshots_protect before insert or update or delete on finance.monthly_unregistered_balance_snapshots for each row execute function finance.protect_monthly_unregistered_snapshot();

alter table finance.unregistered_referees enable row level security;
alter table finance.unregistered_referee_links enable row level security;
alter table finance.unregistered_transactions enable row level security;
alter table finance.unregistered_transaction_links enable row level security;
alter table finance.unregistered_arbiter_aliases enable row level security;
alter table finance.monthly_unregistered_balance_snapshots enable row level security;
create policy unregistered_referees_board_select on finance.unregistered_referees for select to authenticated using(public.is_board());
create policy unregistered_links_board_select on finance.unregistered_referee_links for select to authenticated using(public.is_board());
create policy unregistered_transactions_board_select on finance.unregistered_transactions for select to authenticated using(public.is_board());
create policy unregistered_transaction_links_board_select on finance.unregistered_transaction_links for select to authenticated using(public.is_board());
create policy unregistered_aliases_board_select on finance.unregistered_arbiter_aliases for select to authenticated using(public.is_board());
create policy unregistered_snapshots_board_select on finance.monthly_unregistered_balance_snapshots for select to authenticated using(public.is_board());
revoke all on finance.unregistered_referees,finance.unregistered_referee_links,finance.unregistered_transactions,finance.unregistered_transaction_links,finance.unregistered_arbiter_aliases,finance.monthly_unregistered_balance_snapshots from public,anon,authenticated;
grant all on finance.unregistered_referees,finance.unregistered_referee_links,finance.unregistered_transactions,finance.unregistered_transaction_links,finance.unregistered_arbiter_aliases,finance.monthly_unregistered_balance_snapshots to service_role;
grant select on finance.unregistered_referees,finance.unregistered_referee_links,finance.unregistered_transactions,finance.unregistered_transaction_links,finance.unregistered_arbiter_aliases,finance.monthly_unregistered_balance_snapshots to authenticated;
revoke all on function finance.create_unregistered_referee(text,text,text,text),finance.record_unregistered_transaction(uuid,date,finance.transaction_type,bigint,text,finance.payment_method,text,text,text,text,jsonb),finance.reverse_unregistered_transaction(uuid,date,text,text,text,text),finance.link_unregistered_referee(uuid,uuid,text) from public,anon,authenticated;
grant execute on function finance.create_unregistered_referee(text,text,text,text),finance.record_unregistered_transaction(uuid,date,finance.transaction_type,bigint,text,finance.payment_method,text,text,text,text,jsonb),finance.reverse_unregistered_transaction(uuid,date,text,text,text,text),finance.link_unregistered_referee(uuid,uuid,text) to authenticated,service_role;

revoke all on function finance.post_arbiter_fee_import(uuid)
from public, anon, authenticated;
grant execute on function finance.post_arbiter_fee_import(uuid)
to authenticated, service_role;
