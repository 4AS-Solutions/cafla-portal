# Supabase Table Row Counts

## Purpose

Capture the number of rows currently stored in each CAFLA base table.

This inventory provides data-presence evidence without exporting production records or personal information.

Row counts are particularly useful during cleanup analysis because an apparently obsolete table may still contain historical or operational data that requires preservation, migration, or explicit retention decisions.

---

## Scope

Schemas included:

- `public`
- `tournaments`
- `development`

Objects included:

- Base tables only.

Excluded:

- Views
- Materialized views
- Individual production records
- Row contents
- Personal/member information

Counts were calculated using exact `COUNT(*)` queries against each base table.

---

## Query

```sql
create temporary table audit_row_counts (
  table_schema text,
  table_name text,
  row_count bigint
);

do $$
declare
  r record;
begin
  for r in
    select
      table_schema,
      table_name
    from information_schema.tables
    where table_schema in ('public', 'tournaments', 'development')
      and table_type = 'BASE TABLE'
    order by table_schema, table_name
  loop
    execute format(
      'insert into audit_row_counts (table_schema, table_name, row_count)
       select %L, %L, count(*) from %I.%I',
      r.table_schema,
      r.table_name,
      r.table_schema,
      r.table_name
    );
  end loop;
end $$;

select
  table_schema,
  table_name,
  row_count
from audit_row_counts
order by
  table_schema,
  table_name;
```

---

## Result

```json
[
  {
    "table_schema": "development",
    "table_name": "attendance_records",
    "row_count": 436
  },
  {
    "table_schema": "development",
    "table_name": "attendance_scoring_rules",
    "row_count": 1
  },
  {
    "table_schema": "development",
    "table_name": "attendance_sessions",
    "row_count": 27
  },
  {
    "table_schema": "development",
    "table_name": "current_ranking_snapshot",
    "row_count": 47
  },
  {
    "table_schema": "development",
    "table_name": "cycle_members",
    "row_count": 48
  },
  {
    "table_schema": "development",
    "table_name": "cycles",
    "row_count": 1
  },
  {
    "table_schema": "development",
    "table_name": "monthly_ranking_snapshots",
    "row_count": 45
  },
  {
    "table_schema": "development",
    "table_name": "quiz_access_grants",
    "row_count": 0
  },
  {
    "table_schema": "development",
    "table_name": "quiz_answers",
    "row_count": 0
  },
  {
    "table_schema": "development",
    "table_name": "quiz_assessments",
    "row_count": 0
  },
  {
    "table_schema": "development",
    "table_name": "quiz_attempt_questions",
    "row_count": 0
  },
  {
    "table_schema": "development",
    "table_name": "quiz_attempts",
    "row_count": 0
  },
  {
    "table_schema": "development",
    "table_name": "quiz_question_groups",
    "row_count": 0
  },
  {
    "table_schema": "development",
    "table_name": "quiz_question_options",
    "row_count": 0
  },
  {
    "table_schema": "development",
    "table_name": "quiz_questions",
    "row_count": 0
  },
  {
    "table_schema": "development",
    "table_name": "quiz_versions",
    "row_count": 0
  },
  {
    "table_schema": "development",
    "table_name": "scoring_periods",
    "row_count": 2
  },
  {
    "table_schema": "public",
    "table_name": "arbiter_referees",
    "row_count": 53
  },
  {
    "table_schema": "public",
    "table_name": "attendance_records",
    "row_count": 57
  },
  {
    "table_schema": "public",
    "table_name": "attendance_sessions",
    "row_count": 81
  },
  {
    "table_schema": "public",
    "table_name": "card_reasons",
    "row_count": 20
  },
  {
    "table_schema": "public",
    "table_name": "evaluations",
    "row_count": 0
  },
  {
    "table_schema": "public",
    "table_name": "match_reports",
    "row_count": 65
  },
  {
    "table_schema": "public",
    "table_name": "matches",
    "row_count": 92
  },
  {
    "table_schema": "public",
    "table_name": "members",
    "row_count": 50
  },
  {
    "table_schema": "public",
    "table_name": "quiz_answers",
    "row_count": 6
  },
  {
    "table_schema": "public",
    "table_name": "quiz_attempts",
    "row_count": 2
  },
  {
    "table_schema": "public",
    "table_name": "quiz_questions",
    "row_count": 11
  },
  {
    "table_schema": "public",
    "table_name": "quizzes",
    "row_count": 4
  },
  {
    "table_schema": "public",
    "table_name": "ranking_config",
    "row_count": 1
  },
  {
    "table_schema": "public",
    "table_name": "ranking_history",
    "row_count": 0
  },
  {
    "table_schema": "public",
    "table_name": "ranking_levels",
    "row_count": 4
  },
  {
    "table_schema": "public",
    "table_name": "report_assets",
    "row_count": 103
  },
  {
    "table_schema": "public",
    "table_name": "report_cards",
    "row_count": 113
  },
  {
    "table_schema": "public",
    "table_name": "report_goals",
    "row_count": 255
  },
  {
    "table_schema": "public",
    "table_name": "report_injuries",
    "row_count": 0
  },
  {
    "table_schema": "tournaments",
    "table_name": "division_seasons",
    "row_count": 15
  },
  {
    "table_schema": "tournaments",
    "table_name": "divisions",
    "row_count": 15
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_context",
    "row_count": 88
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_context_logs",
    "row_count": 92
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_rosters",
    "row_count": 3469
  },
  {
    "table_schema": "tournaments",
    "table_name": "organizations",
    "row_count": 1
  },
  {
    "table_schema": "tournaments",
    "table_name": "player_registrations",
    "row_count": 949
  },
  {
    "table_schema": "tournaments",
    "table_name": "players",
    "row_count": 961
  },
  {
    "table_schema": "tournaments",
    "table_name": "seasons",
    "row_count": 1
  },
  {
    "table_schema": "tournaments",
    "table_name": "team_registrations",
    "row_count": 107
  },
  {
    "table_schema": "tournaments",
    "table_name": "teams",
    "row_count": 100
  }
]
```

---

## Result Interpretation

Each row represents one physical base table.

Important fields:

- `table_schema` — schema containing the table.
- `table_name` — physical table.
- `row_count` — exact number of records present when this audit snapshot was captured.

A result such as:

```text
public.some_table → 0
```

means the table existed but contained no records at audit time.

A non-zero result establishes that data was present, but does not establish whether that data is:

- Current
- Historical
- Legacy
- Duplicated
- Migrated elsewhere
- Safe to remove

---

## Cleanup Significance

Row count is evidence, not a removal criterion.

For example:

```text
Legacy candidate
+ 0 application references
+ 0 database dependencies
+ 0 rows
```

would provide substantially stronger evidence for eventual removal than:

```text
Legacy candidate
+ 0 application references
+ 5,000 historical rows
```

The second case may require archival, migration, or an explicit historical-retention decision.

---

## Audit Notes

No production row contents were exported.

No personal information is intentionally captured by this inventory.

An empty table must not automatically be classified as obsolete.

A non-empty table must not automatically be classified as active.

Row counts must later be evaluated alongside:

- Application references
- Foreign keys
- Views
- Functions
- Triggers
- Cron jobs
- RLS
- Replacement architecture
- Historical retention requirements

---

## Preliminary Observation

This inventory provides a data-presence layer for the cleanup analysis.

It will be particularly useful when evaluating potentially superseded objects in `public`, including older Attendance, Quiz, Ranking, and dashboard-related architecture.

No table is classified based solely on its row count.

---

## Audit Status

**Base-table row counts captured — data classification pending.**

No persistent database structure or production data was modified as part of this audit.