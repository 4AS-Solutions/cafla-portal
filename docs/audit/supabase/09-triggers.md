# Supabase Triggers

## Purpose

Capture all non-internal PostgreSQL triggers currently defined on CAFLA tables.

Triggers are important database dependencies because application behavior may occur automatically after an INSERT, UPDATE, DELETE, or other database event without being explicitly visible in the frontend or API code.

This inventory also identifies the PostgreSQL function executed by each trigger.

---

## Scope

Schemas included:

- `public`
- `tournaments`
- `development`

Trigger metadata captured:

- Table schema
- Table name
- Trigger name
- Complete trigger definition
- Trigger function schema
- Trigger function name
- Trigger function arguments/signature
- Trigger enabled state

PostgreSQL internal/system-generated triggers are excluded.

---

## Query

```sql
select
  n.nspname as table_schema,
  c.relname as table_name,
  t.tgname as trigger_name,
  pg_get_triggerdef(t.oid, true) as trigger_definition,
  pn.nspname as function_schema,
  p.proname as function_name,
  pg_get_function_identity_arguments(p.oid) as function_arguments,
  t.tgenabled as trigger_enabled
from pg_trigger t
join pg_class c
  on c.oid = t.tgrelid
join pg_namespace n
  on n.oid = c.relnamespace
join pg_proc p
  on p.oid = t.tgfoid
join pg_namespace pn
  on pn.oid = p.pronamespace
where not t.tgisinternal
  and n.nspname in ('public', 'tournaments', 'development')
order by
  n.nspname,
  c.relname,
  t.tgname;
```

---

## Result

```json
[
  {
    "table_schema": "development",
    "table_name": "scoring_periods",
    "trigger_name": "trg_prevent_scoring_period_overlap",
    "trigger_definition": "CREATE TRIGGER trg_prevent_scoring_period_overlap BEFORE INSERT OR UPDATE ON development.scoring_periods FOR EACH ROW EXECUTE FUNCTION development.prevent_scoring_period_overlap()",
    "function_schema": "development",
    "function_name": "prevent_scoring_period_overlap",
    "function_arguments": "",
    "trigger_enabled": "O"
  },
  {
    "table_schema": "development",
    "table_name": "scoring_periods",
    "trigger_name": "trg_protect_started_scoring_period",
    "trigger_definition": "CREATE TRIGGER trg_protect_started_scoring_period BEFORE UPDATE ON development.scoring_periods FOR EACH ROW EXECUTE FUNCTION development.protect_started_scoring_period()",
    "function_schema": "development",
    "function_name": "protect_started_scoring_period",
    "function_arguments": "",
    "trigger_enabled": "O"
  },
  {
    "table_schema": "public",
    "table_name": "match_reports",
    "trigger_name": "trg_sync_match_report_status",
    "trigger_definition": "CREATE TRIGGER trg_sync_match_report_status AFTER INSERT OR UPDATE OF status ON match_reports FOR EACH ROW EXECUTE FUNCTION sync_match_report_status()",
    "function_schema": "public",
    "function_name": "sync_match_report_status",
    "function_arguments": "",
    "trigger_enabled": "O"
  },
  {
    "table_schema": "public",
    "table_name": "matches",
    "trigger_name": "matches_build_tournament_context",
    "trigger_definition": "CREATE TRIGGER matches_build_tournament_context AFTER INSERT OR UPDATE OF league, division, home_team, away_team, tournament_division_season_id ON matches FOR EACH ROW EXECUTE FUNCTION tournaments.handle_match_context_trigger()",
    "function_schema": "tournaments",
    "function_name": "handle_match_context_trigger",
    "function_arguments": "",
    "trigger_enabled": "O"
  },
  {
    "table_schema": "tournaments",
    "table_name": "division_seasons",
    "trigger_name": "division_seasons_set_updated_at",
    "trigger_definition": "CREATE TRIGGER division_seasons_set_updated_at BEFORE UPDATE ON tournaments.division_seasons FOR EACH ROW EXECUTE FUNCTION tournaments.set_updated_at()",
    "function_schema": "tournaments",
    "function_name": "set_updated_at",
    "function_arguments": "",
    "trigger_enabled": "O"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_context",
    "trigger_name": "match_context_set_updated_at",
    "trigger_definition": "CREATE TRIGGER match_context_set_updated_at BEFORE UPDATE ON tournaments.match_context FOR EACH ROW EXECUTE FUNCTION tournaments.set_updated_at()",
    "function_schema": "tournaments",
    "function_name": "set_updated_at",
    "function_arguments": "",
    "trigger_enabled": "O"
  },
  {
    "table_schema": "tournaments",
    "table_name": "player_registrations",
    "trigger_name": "player_registrations_set_updated_at",
    "trigger_definition": "CREATE TRIGGER player_registrations_set_updated_at BEFORE UPDATE ON tournaments.player_registrations FOR EACH ROW EXECUTE FUNCTION tournaments.set_updated_at()",
    "function_schema": "tournaments",
    "function_name": "set_updated_at",
    "function_arguments": "",
    "trigger_enabled": "O"
  },
  {
    "table_schema": "tournaments",
    "table_name": "seasons",
    "trigger_name": "seasons_set_updated_at",
    "trigger_definition": "CREATE TRIGGER seasons_set_updated_at BEFORE UPDATE ON tournaments.seasons FOR EACH ROW EXECUTE FUNCTION tournaments.set_updated_at()",
    "function_schema": "tournaments",
    "function_name": "set_updated_at",
    "function_arguments": "",
    "trigger_enabled": "O"
  },
  {
    "table_schema": "tournaments",
    "table_name": "team_registrations",
    "trigger_name": "team_registrations_set_updated_at",
    "trigger_definition": "CREATE TRIGGER team_registrations_set_updated_at BEFORE UPDATE ON tournaments.team_registrations FOR EACH ROW EXECUTE FUNCTION tournaments.set_updated_at()",
    "function_schema": "tournaments",
    "function_name": "set_updated_at",
    "function_arguments": "",
    "trigger_enabled": "O"
  }
]
```

---

## Result Interpretation

Each row represents one non-internal PostgreSQL trigger.

Important fields:

- `table_schema` — schema containing the table on which the trigger is installed.
- `table_name` — table monitored by the trigger.
- `trigger_name` — trigger identifier.
- `trigger_definition` — complete PostgreSQL trigger definition, including event and timing.
- `function_schema` — schema containing the function executed by the trigger.
- `function_name` — function executed when the trigger fires.
- `function_arguments` — identity arguments of the trigger function.
- `trigger_enabled` — PostgreSQL trigger enabled state.

### Trigger enabled values

PostgreSQL represents trigger state using:

- `O` — enabled in normal/origin mode.
- `D` — disabled.
- `R` — enabled for replica mode.
- `A` — always enabled.

---

## Audit Notes

Triggers represent implicit database behavior.

An application operation such as:

```text
INSERT / UPDATE / DELETE
        ↓
      TABLE
        ↓
     TRIGGER
        ↓
    FUNCTION
        ↓
Additional database behavior
```

may therefore have effects that are not visible from application code alone.

A table, function, or column must not be classified as unused until trigger dependencies have been reviewed.

Trigger functions may also live in a different schema from the table on which the trigger is defined.

---

## Preliminary Observation

This inventory will later be cross-referenced with `08-functions-and-rpcs.md` to construct relationships such as:

`table → trigger → function`

This will help identify:

- Automatic timestamp maintenance.
- Audit logging.
- Lifecycle automation.
- Data synchronization.
- Business-rule enforcement.
- Cross-schema side effects.
- Legacy functions that remain active through triggers.

No trigger or associated function is classified as obsolete from this inventory alone.

---

## Audit Status

**Trigger inventory captured — classification pending.**

No database changes were performed as part of this audit.