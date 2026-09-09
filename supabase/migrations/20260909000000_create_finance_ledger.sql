-- CAFLA Finance V1 foundation.
--
-- This migration creates an append-only financial ledger and versioned,
-- auditable monthly closings. It intentionally does not seed financial data,
-- integrate match fees, or create application APIs/UI.

create schema if not exists finance;

create type finance.transaction_type as enum (
  'opening_balance',
  'match_fee',
  'annual_membership_fee',
  'payment',
  'manual_charge',
  'manual_credit',
  'adjustment',
  'reversal'
);

create type finance.payment_method as enum (
  'zelle',
  'cash',
  'check',
  'other'
);

create type finance.closing_status as enum (
  'draft',
  'finalized',
  'superseded'
);

create table finance.transactions (
  id uuid primary key default extensions.uuid_generate_v4(),
  member_id uuid not null references public.members(id) on delete restrict,
  transaction_date date not null,
  transaction_type finance.transaction_type not null,
  amount_cents bigint not null,
  currency text not null default 'USD',
  description text not null,
  internal_notes text,
  payment_method finance.payment_method,
  match_id uuid references public.matches(id) on delete restrict,
  source_type text,
  source_id text,
  idempotency_key text,
  reversal_of_transaction_id uuid references finance.transactions(id) on delete restrict,
  reversal_reason text,
  created_by uuid not null references public.members(id) on delete restrict,
  created_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  constraint transactions_amount_nonzero check (amount_cents <> 0),
  constraint transactions_currency_usd check (currency = 'USD'),
  constraint transactions_description_nonempty check (btrim(description) <> ''),
  constraint transactions_idempotency_key_nonempty check (
    idempotency_key is null or btrim(idempotency_key) <> ''
  ),
  constraint transactions_metadata_object check (jsonb_typeof(metadata) = 'object'),
  constraint transactions_source_pair check (
    (source_type is null and source_id is null)
    or (nullif(btrim(source_type), '') is not null and nullif(btrim(source_id), '') is not null)
  ),
  constraint transactions_payment_method check (
    (transaction_type = 'payment' and payment_method is not null)
    or (transaction_type <> 'payment' and payment_method is null)
  ),
  constraint transactions_sign check (
    (transaction_type in ('match_fee', 'annual_membership_fee', 'manual_charge') and amount_cents < 0)
    or (transaction_type in ('payment', 'manual_credit') and amount_cents > 0)
    or (transaction_type in ('opening_balance', 'adjustment', 'reversal'))
  ),
  constraint transactions_reversal_shape check (
    (transaction_type = 'reversal'
      and reversal_of_transaction_id is not null
      and nullif(btrim(reversal_reason), '') is not null)
    or (transaction_type <> 'reversal'
      and reversal_of_transaction_id is null
      and reversal_reason is null)
  )
);

create unique index transactions_idempotency_key_uidx
  on finance.transactions (idempotency_key)
  where idempotency_key is not null;

create unique index transactions_single_opening_balance_uidx
  on finance.transactions (member_id, currency)
  where transaction_type = 'opening_balance';

create unique index transactions_single_reversal_uidx
  on finance.transactions (reversal_of_transaction_id)
  where reversal_of_transaction_id is not null;

create index transactions_member_date_idx
  on finance.transactions (member_id, transaction_date, created_at, id);

create index transactions_period_cutoff_idx
  on finance.transactions (transaction_date, created_at);

create index transactions_match_id_idx
  on finance.transactions (match_id)
  where match_id is not null;

create table finance.monthly_closings (
  id uuid primary key default extensions.uuid_generate_v4(),
  period_end date not null,
  version integer not null,
  status finance.closing_status not null default 'draft',
  supersedes_closing_id uuid references finance.monthly_closings(id) on delete restrict,
  restatement_reason text,
  ledger_cutoff_at timestamptz not null,
  created_by uuid not null references public.members(id) on delete restrict,
  created_at timestamptz not null default now(),
  finalized_by uuid references public.members(id) on delete restrict,
  finalized_at timestamptz,
  constraint monthly_closings_period_month_end check (
    period_end = ((date_trunc('month', period_end::timestamp) + interval '1 month - 1 day')::date)
  ),
  constraint monthly_closings_version_positive check (version > 0),
  constraint monthly_closings_restatement_shape check (
    (version = 1 and supersedes_closing_id is null and restatement_reason is null)
    or (version > 1 and supersedes_closing_id is not null
      and nullif(btrim(restatement_reason), '') is not null)
  ),
  constraint monthly_closings_finalization_shape check (
    (status = 'draft' and finalized_by is null and finalized_at is null)
    or (status in ('finalized', 'superseded')
      and finalized_by is not null and finalized_at is not null)
  ),
  unique (period_end, version)
);

create unique index monthly_closings_one_finalized_uidx
  on finance.monthly_closings (period_end)
  where status = 'finalized';

create unique index monthly_closings_one_draft_uidx
  on finance.monthly_closings (period_end)
  where status = 'draft';

create unique index monthly_closings_supersedes_uidx
  on finance.monthly_closings (supersedes_closing_id)
  where supersedes_closing_id is not null;

create table finance.monthly_balance_snapshots (
  id uuid primary key default extensions.uuid_generate_v4(),
  closing_id uuid not null references finance.monthly_closings(id) on delete restrict,
  member_id uuid not null references public.members(id) on delete restrict,
  balance_cents bigint not null,
  currency text not null default 'USD',
  created_at timestamptz not null default now(),
  constraint monthly_balance_snapshots_currency_usd check (currency = 'USD'),
  unique (closing_id, member_id, currency)
);

create index monthly_balance_snapshots_member_idx
  on finance.monthly_balance_snapshots (member_id, closing_id);

create or replace function finance.reject_transaction_mutation()
returns trigger
language plpgsql
set search_path = pg_catalog, finance
as $$
begin
  raise exception 'finance.transactions is append-only; use a reversal and a corrected transaction';
end;
$$;

create or replace function finance.validate_transaction_insert()
returns trigger
language plpgsql
set search_path = pg_catalog, finance
as $$
declare
  v_original finance.transactions%rowtype;
begin
  if new.transaction_type <> 'reversal' then
    return new;
  end if;

  select *
    into v_original
    from finance.transactions
   where id = new.reversal_of_transaction_id
   for key share;

  if not found then
    raise exception 'Original transaction does not exist';
  end if;

  if v_original.transaction_type = 'reversal' then
    raise exception 'A reversal cannot reverse another reversal';
  end if;

  if new.member_id <> v_original.member_id
     or new.currency <> v_original.currency
     or new.amount_cents <> -v_original.amount_cents then
    raise exception 'A reversal must match the original member/currency and use the exact opposite amount';
  end if;

  return new;
end;
$$;

create trigger transactions_validate_insert
before insert on finance.transactions
for each row execute function finance.validate_transaction_insert();

create trigger transactions_reject_update
before update on finance.transactions
for each row execute function finance.reject_transaction_mutation();

create trigger transactions_reject_delete
before delete on finance.transactions
for each row execute function finance.reject_transaction_mutation();

create or replace function finance.protect_monthly_closing()
returns trigger
language plpgsql
set search_path = pg_catalog, finance
as $$
declare
  v_parent finance.monthly_closings%rowtype;
begin
  if tg_op = 'DELETE' then
    raise exception 'Monthly closings cannot be deleted';
  end if;

  if new.ledger_cutoff_at > clock_timestamp() then
    raise exception 'ledger_cutoff_at cannot be in the future';
  end if;

  if tg_op = 'INSERT' and new.supersedes_closing_id is not null then
    select * into v_parent
      from finance.monthly_closings
     where id = new.supersedes_closing_id;

    if not found
       or v_parent.period_end <> new.period_end
       or v_parent.version <> new.version - 1
       or v_parent.status <> 'finalized' then
      raise exception 'A restatement must supersede the current finalized previous version for the same period';
    end if;
  end if;

  if tg_op = 'UPDATE' then
    if old.status = 'superseded' then
      raise exception 'Superseded closings are immutable';
    end if;

    if old.status = 'finalized' then
      if new.status <> 'superseded'
         or new.id is distinct from old.id
         or new.period_end is distinct from old.period_end
         or new.version is distinct from old.version
         or new.supersedes_closing_id is distinct from old.supersedes_closing_id
         or new.restatement_reason is distinct from old.restatement_reason
         or new.ledger_cutoff_at is distinct from old.ledger_cutoff_at
         or new.created_by is distinct from old.created_by
         or new.created_at is distinct from old.created_at
         or new.finalized_by is distinct from old.finalized_by
         or new.finalized_at is distinct from old.finalized_at then
        raise exception 'Finalized closings may only transition to superseded';
      end if;
    elsif old.status = 'draft' and new.status not in ('draft', 'finalized') then
      raise exception 'Draft closings may only remain draft or become finalized';
    end if;
  end if;

  return new;
end;
$$;

create trigger monthly_closings_protect_insert
before insert on finance.monthly_closings
for each row execute function finance.protect_monthly_closing();

create trigger monthly_closings_protect_update_delete
before update or delete on finance.monthly_closings
for each row execute function finance.protect_monthly_closing();

create or replace function finance.protect_monthly_snapshot()
returns trigger
language plpgsql
set search_path = pg_catalog, finance
as $$
declare
  v_closing_id uuid;
  v_status finance.closing_status;
begin
  v_closing_id := case when tg_op = 'DELETE' then old.closing_id else new.closing_id end;

  select status into v_status
    from finance.monthly_closings
   where id = v_closing_id;

  if v_status is distinct from 'draft'::finance.closing_status then
    raise exception 'Snapshots belonging to finalized or superseded closings are immutable';
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create trigger monthly_balance_snapshots_protect
before insert or update or delete on finance.monthly_balance_snapshots
for each row execute function finance.protect_monthly_snapshot();

create or replace function finance.record_transaction(
  p_member_id uuid,
  p_transaction_date date,
  p_transaction_type finance.transaction_type,
  p_amount_cents bigint,
  p_description text,
  p_payment_method finance.payment_method default null,
  p_internal_notes text default null,
  p_match_id uuid default null,
  p_source_type text default null,
  p_source_id text default null,
  p_idempotency_key text default null,
  p_metadata jsonb default '{}'::jsonb
)
returns finance.transactions
language plpgsql
security definer
set search_path = pg_catalog, finance
as $$
declare
  v_result finance.transactions;
  v_actor uuid := auth.uid();
begin
  if v_actor is null or not public.is_board() then
    raise exception 'Board authorization required' using errcode = '42501';
  end if;

  if p_transaction_type = 'reversal' then
    raise exception 'Use finance.reverse_transaction() to create reversals';
  end if;

  insert into finance.transactions (
    member_id, transaction_date, transaction_type, amount_cents, currency,
    description, internal_notes, payment_method, match_id, source_type,
    source_id, idempotency_key, created_by, metadata
  ) values (
    p_member_id, p_transaction_date, p_transaction_type, p_amount_cents, 'USD',
    p_description, p_internal_notes, p_payment_method, p_match_id, p_source_type,
    p_source_id, nullif(btrim(p_idempotency_key), ''), v_actor, coalesce(p_metadata, '{}'::jsonb)
  ) returning * into v_result;

  return v_result;
end;
$$;

create or replace function finance.reverse_transaction(
  p_original_transaction_id uuid,
  p_transaction_date date,
  p_description text,
  p_reversal_reason text,
  p_idempotency_key text,
  p_internal_notes text default null,
  p_metadata jsonb default '{}'::jsonb
)
returns finance.transactions
language plpgsql
security definer
set search_path = pg_catalog, finance
as $$
declare
  v_original finance.transactions%rowtype;
  v_result finance.transactions;
  v_actor uuid := auth.uid();
begin
  if v_actor is null or not public.is_board() then
    raise exception 'Board authorization required' using errcode = '42501';
  end if;

  if nullif(btrim(p_reversal_reason), '') is null then
    raise exception 'A non-empty reversal reason is required';
  end if;

  if nullif(btrim(p_idempotency_key), '') is null then
    raise exception 'An idempotency key is required for reversals';
  end if;

  select * into v_original
    from finance.transactions
   where id = p_original_transaction_id
   for update;

  if not found then
    raise exception 'Original transaction does not exist';
  end if;

  if v_original.transaction_type = 'reversal' then
    raise exception 'A reversal cannot reverse another reversal';
  end if;

  insert into finance.transactions (
    member_id, transaction_date, transaction_type, amount_cents, currency,
    description, internal_notes, payment_method, match_id, source_type,
    source_id, idempotency_key, reversal_of_transaction_id, reversal_reason,
    created_by, metadata
  ) values (
    v_original.member_id, p_transaction_date, 'reversal', -v_original.amount_cents,
    v_original.currency, p_description, p_internal_notes, null, v_original.match_id,
    'transaction_reversal', v_original.id::text, btrim(p_idempotency_key),
    v_original.id, btrim(p_reversal_reason), v_actor, coalesce(p_metadata, '{}'::jsonb)
  ) returning * into v_result;

  return v_result;
end;
$$;

create or replace function finance.populate_monthly_closing_snapshots(p_closing_id uuid)
returns bigint
language plpgsql
security definer
set search_path = pg_catalog, finance
as $$
declare
  v_closing finance.monthly_closings%rowtype;
  v_rows bigint;
begin
  select * into v_closing
    from finance.monthly_closings
   where id = p_closing_id
   for update;

  if not found or v_closing.status <> 'draft' then
    raise exception 'Snapshots can only be populated for an existing draft closing';
  end if;

  delete from finance.monthly_balance_snapshots where closing_id = p_closing_id;

  insert into finance.monthly_balance_snapshots (
    closing_id, member_id, balance_cents, currency
  )
  select v_closing.id, t.member_id, sum(t.amount_cents), t.currency
    from finance.transactions t
   where t.transaction_date <= v_closing.period_end
     and t.created_at <= v_closing.ledger_cutoff_at
   group by t.member_id, t.currency;

  get diagnostics v_rows = row_count;
  return v_rows;
end;
$$;

create or replace function finance.create_monthly_closing(
  p_period_end date,
  p_ledger_cutoff_at timestamptz default now()
)
returns finance.monthly_closings
language plpgsql
security definer
set search_path = pg_catalog, finance
as $$
declare
  v_result finance.monthly_closings;
  v_actor uuid := auth.uid();
  v_version integer;
begin
  if v_actor is null or not public.is_board() then
    raise exception 'Board authorization required' using errcode = '42501';
  end if;

  if p_ledger_cutoff_at > clock_timestamp() then
    raise exception 'ledger_cutoff_at cannot be in the future';
  end if;

  perform pg_advisory_xact_lock(hashtextextended('finance.monthly_closing:' || p_period_end::text, 0));

  if exists (
    select 1 from finance.monthly_closings
     where period_end = p_period_end and status = 'finalized'
  ) then
    raise exception 'A finalized closing exists; use finance.restate_monthly_closing()';
  end if;

  select coalesce(max(version), 0) + 1 into v_version
    from finance.monthly_closings
   where period_end = p_period_end;

  if v_version <> 1 then
    raise exception 'A non-initial version must be created through restatement';
  end if;

  insert into finance.monthly_closings (
    period_end, version, status, ledger_cutoff_at, created_by
  ) values (
    p_period_end, v_version, 'draft', p_ledger_cutoff_at, v_actor
  ) returning * into v_result;

  return v_result;
end;
$$;

create or replace function finance.finalize_monthly_closing(p_closing_id uuid)
returns finance.monthly_closings
language plpgsql
security definer
set search_path = pg_catalog, finance
as $$
declare
  v_closing finance.monthly_closings%rowtype;
  v_actor uuid := auth.uid();
begin
  if v_actor is null or not public.is_board() then
    raise exception 'Board authorization required' using errcode = '42501';
  end if;

  select * into v_closing from finance.monthly_closings where id = p_closing_id;
  if not found then
    raise exception 'Closing does not exist';
  end if;

  perform pg_advisory_xact_lock(hashtextextended('finance.monthly_closing:' || v_closing.period_end::text, 0));

  select * into v_closing
    from finance.monthly_closings
   where id = p_closing_id
   for update;

  if v_closing.status <> 'draft' or v_closing.version <> 1 then
    raise exception 'Only the initial draft closing can use first finalization';
  end if;

  if exists (
    select 1 from finance.monthly_closings
     where period_end = v_closing.period_end and status = 'finalized'
  ) then
    raise exception 'A finalized closing already exists for this period';
  end if;

  perform finance.populate_monthly_closing_snapshots(v_closing.id);

  update finance.monthly_closings
     set status = 'finalized', finalized_by = v_actor, finalized_at = now()
   where id = v_closing.id
   returning * into v_closing;

  return v_closing;
end;
$$;

create or replace function finance.restate_monthly_closing(
  p_period_end date,
  p_restatement_reason text,
  p_ledger_cutoff_at timestamptz default now()
)
returns finance.monthly_closings
language plpgsql
security definer
set search_path = pg_catalog, finance
as $$
declare
  v_current finance.monthly_closings%rowtype;
  v_new finance.monthly_closings%rowtype;
  v_actor uuid := auth.uid();
begin
  if v_actor is null or not public.is_board() then
    raise exception 'Board authorization required' using errcode = '42501';
  end if;

  if nullif(btrim(p_restatement_reason), '') is null then
    raise exception 'A non-empty restatement reason is required';
  end if;

  if p_ledger_cutoff_at > clock_timestamp() then
    raise exception 'ledger_cutoff_at cannot be in the future';
  end if;

  perform pg_advisory_xact_lock(hashtextextended('finance.monthly_closing:' || p_period_end::text, 0));

  select * into v_current
    from finance.monthly_closings
   where period_end = p_period_end and status = 'finalized'
   for update;

  if not found then
    raise exception 'No current finalized closing exists for this period';
  end if;

  insert into finance.monthly_closings (
    period_end, version, status, supersedes_closing_id, restatement_reason,
    ledger_cutoff_at, created_by
  ) values (
    v_current.period_end, v_current.version + 1, 'draft', v_current.id,
    btrim(p_restatement_reason), p_ledger_cutoff_at, v_actor
  ) returning * into v_new;

  perform finance.populate_monthly_closing_snapshots(v_new.id);

  update finance.monthly_closings
     set status = 'superseded'
   where id = v_current.id;

  update finance.monthly_closings
     set status = 'finalized', finalized_by = v_actor, finalized_at = now()
   where id = v_new.id
   returning * into v_new;

  return v_new;
end;
$$;

comment on function finance.restate_monthly_closing(date, text, timestamptz) is
  'Executes and finalizes an official atomic restatement. It is not a preview operation.';

create view finance.member_balances
with (security_invoker = true)
as
select
  t.member_id,
  t.currency,
  sum(t.amount_cents)::bigint as balance_cents,
  max(t.created_at) as last_transaction_at
from finance.transactions t
where t.member_id = auth.uid()
group by t.member_id, t.currency;

create view finance.member_transaction_history
with (security_invoker = true)
as
select
  t.id,
  t.member_id,
  t.transaction_date,
  t.transaction_type,
  t.amount_cents,
  t.currency,
  t.description,
  t.payment_method,
  t.match_id,
  t.reversal_of_transaction_id,
  t.created_at
from finance.transactions t
where t.member_id = auth.uid();

create view finance.member_monthly_balance_history
with (security_invoker = true)
as
select
  s.member_id,
  c.period_end,
  c.version,
  s.balance_cents,
  s.currency,
  c.finalized_at,
  (c.version > 1) as is_restated
from finance.monthly_balance_snapshots s
join finance.monthly_closings c on c.id = s.closing_id
where s.member_id = auth.uid()
  and c.status = 'finalized';

alter table finance.transactions enable row level security;
alter table finance.monthly_closings enable row level security;
alter table finance.monthly_balance_snapshots enable row level security;

create policy transactions_select_own_or_board
on finance.transactions for select to authenticated
using (member_id = auth.uid() or public.is_board());

create policy monthly_closings_select_current_or_board
on finance.monthly_closings for select to authenticated
using (status = 'finalized' or public.is_board());

create policy monthly_snapshots_select_own_or_board
on finance.monthly_balance_snapshots for select to authenticated
using (
  public.is_board()
  or (
    member_id = auth.uid()
    and exists (
      select 1
      from finance.monthly_closings c
      where c.id = closing_id and c.status = 'finalized'
    )
  )
);

revoke all on schema finance from public;
grant usage on schema finance to authenticated, service_role;

revoke all on type finance.transaction_type, finance.payment_method, finance.closing_status from public;
grant usage on type finance.transaction_type, finance.payment_method, finance.closing_status
to authenticated, service_role;

revoke all on all tables in schema finance from public, anon, authenticated;
grant all on all tables in schema finance to service_role;

-- These column grants are the minimum needed by the SECURITY INVOKER member views.
-- They intentionally exclude internal_notes, reversal_reason, metadata, source
-- identifiers, and created_by. RLS still restricts rows to the member or Board.
grant select (
  id, member_id, transaction_date, transaction_type, amount_cents, currency,
  description, payment_method, match_id, reversal_of_transaction_id, created_at
) on finance.transactions to authenticated;

grant select (
  id, period_end, version, status, ledger_cutoff_at, finalized_at
) on finance.monthly_closings to authenticated;

grant select (
  id, closing_id, member_id, balance_cents, currency, created_at
) on finance.monthly_balance_snapshots to authenticated;

grant select on finance.member_balances,
  finance.member_transaction_history,
  finance.member_monthly_balance_history
to authenticated;

grant select on finance.member_balances,
  finance.member_transaction_history,
  finance.member_monthly_balance_history
to service_role;

revoke all on all functions in schema finance from public, anon, authenticated;

grant execute on function finance.record_transaction(
  uuid, date, finance.transaction_type, bigint, text,
  finance.payment_method, text, uuid, text, text, text, jsonb
) to authenticated, service_role;

grant execute on function finance.reverse_transaction(
  uuid, date, text, text, text, text, jsonb
) to authenticated, service_role;

grant execute on function finance.create_monthly_closing(date, timestamptz)
to authenticated, service_role;

grant execute on function finance.finalize_monthly_closing(uuid)
to authenticated, service_role;

grant execute on function finance.restate_monthly_closing(date, text, timestamptz)
to authenticated, service_role;

-- Ensure future objects do not accidentally inherit broad API privileges.
alter default privileges for role postgres in schema finance revoke all on tables from public, anon, authenticated;
alter default privileges for role postgres in schema finance revoke all on functions from public, anon, authenticated;

comment on schema finance is 'CAFLA append-only financial ledger and versioned monthly closings.';
comment on column finance.transactions.amount_cents is 'Positive: CAFLA owes member. Negative: member owes CAFLA.';
comment on column finance.monthly_closings.ledger_cutoff_at is 'Knowledge cutoff: snapshots include transaction_date <= period_end and created_at <= this timestamp.';
