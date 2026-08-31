# Supabase Tables and Views

## Purpose

Inventory all base tables and standard views currently present in the CAFLA application schemas.

This file represents the **actual objects found in Supabase at the time of the audit**.

The existence of an object in this inventory does **not** mean that the object is currently used by the CAFLA application.

Usage, dependencies, legacy status, and removal eligibility must be determined separately.

---

## Scope

Schemas included:

- `public`
- `tournaments`
- `development`

Objects included:

- Base tables
- Standard views

Materialized views are audited separately.

---

## Query

```sql
select
  table_schema,
  table_name,
  table_type
from information_schema.tables
where table_schema in ('public', 'tournaments', 'development')
order by table_schema, table_type, table_name;
```

---

## Result

```json
[
  {
    "table_schema": "development",
    "table_name": "attendance_records",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "development",
    "table_name": "attendance_scoring_rules",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "development",
    "table_name": "attendance_sessions",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "development",
    "table_name": "current_ranking_snapshot",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "development",
    "table_name": "cycle_members",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "development",
    "table_name": "cycles",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "development",
    "table_name": "monthly_ranking_snapshots",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_access_grants",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_answers",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_assessments",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_attempt_questions",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_attempts",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_question_groups",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_question_options",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_questions",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_versions",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "development",
    "table_name": "scoring_periods",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "development",
    "table_name": "cycle_months_v2",
    "table_type": "VIEW"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_member_best_results",
    "table_type": "VIEW"
  },
  {
    "table_schema": "development",
    "table_name": "referee_attendance",
    "table_type": "VIEW"
  },
  {
    "table_schema": "development",
    "table_name": "referee_attendance_detail",
    "table_type": "VIEW"
  },
  {
    "table_schema": "development",
    "table_name": "referee_current_ranking_v2",
    "table_type": "VIEW"
  },
  {
    "table_schema": "development",
    "table_name": "referee_cycle_development_score_v2",
    "table_type": "VIEW"
  },
  {
    "table_schema": "development",
    "table_name": "referee_cycle_ranking_evidence_v2",
    "table_type": "VIEW"
  },
  {
    "table_schema": "development",
    "table_name": "referee_cycle_ranking_v2",
    "table_type": "VIEW"
  },
  {
    "table_schema": "development",
    "table_name": "referee_evaluation_detail",
    "table_type": "VIEW"
  },
  {
    "table_schema": "development",
    "table_name": "referee_evaluation_score",
    "table_type": "VIEW"
  },
  {
    "table_schema": "development",
    "table_name": "referee_monthly_development_score_v2",
    "table_type": "VIEW"
  },
  {
    "table_schema": "development",
    "table_name": "referee_monthly_period_metric_scores_v2",
    "table_type": "VIEW"
  },
  {
    "table_schema": "development",
    "table_name": "referee_monthly_ranking_evidence_v2",
    "table_type": "VIEW"
  },
  {
    "table_schema": "development",
    "table_name": "referee_monthly_ranking_history_v2",
    "table_type": "VIEW"
  },
  {
    "table_schema": "development",
    "table_name": "referee_period_development_score",
    "table_type": "VIEW"
  },
  {
    "table_schema": "development",
    "table_name": "referee_period_metric_scores",
    "table_type": "VIEW"
  },
  {
    "table_schema": "development",
    "table_name": "referee_quiz_score",
    "table_type": "VIEW"
  },
  {
    "table_schema": "development",
    "table_name": "referee_ranking_evidence",
    "table_type": "VIEW"
  },
  {
    "table_schema": "development",
    "table_name": "referee_ranking_v2",
    "table_type": "VIEW"
  },
  {
    "table_schema": "development",
    "table_name": "referee_report_detail",
    "table_type": "VIEW"
  },
  {
    "table_schema": "development",
    "table_name": "referee_report_score",
    "table_type": "VIEW"
  },
  {
    "table_schema": "public",
    "table_name": "arbiter_referees",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "attendance_records",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "attendance_sessions",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "card_reasons",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "evaluations",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "match_reports",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "matches",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "members",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_answers",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_attempts",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_questions",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "quizzes",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_config",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_history",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_levels",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "report_assets",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "report_cards",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "report_goals",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "report_injuries",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_peer_feedback_score",
    "table_type": "VIEW"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_pending_evaluations",
    "table_type": "VIEW"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_pending_reports",
    "table_type": "VIEW"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_quiz_scores",
    "table_type": "VIEW"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_activity",
    "table_type": "VIEW"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_attendance",
    "table_type": "VIEW"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_development_score",
    "table_type": "VIEW"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_matches",
    "table_type": "VIEW"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_ranking",
    "table_type": "VIEW"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_ranking_v2",
    "table_type": "VIEW"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_report_score",
    "table_type": "VIEW"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_upcoming_matches",
    "table_type": "VIEW"
  },
  {
    "table_schema": "tournaments",
    "table_name": "division_seasons",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "tournaments",
    "table_name": "divisions",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_context",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_context_logs",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_rosters",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "tournaments",
    "table_name": "organizations",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "tournaments",
    "table_name": "player_registrations",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "tournaments",
    "table_name": "players",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "tournaments",
    "table_name": "seasons",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "tournaments",
    "table_name": "team_registrations",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "tournaments",
    "table_name": "teams",
    "table_type": "BASE TABLE"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_roster_view",
    "table_type": "VIEW"
  },
  {
    "table_schema": "tournaments",
    "table_name": "player_card_reason_stats",
    "table_type": "VIEW"
  },
  {
    "table_schema": "tournaments",
    "table_name": "player_team_season_stats",
    "table_type": "VIEW"
  },
  {
    "table_schema": "tournaments",
    "table_name": "team_season_standings",
    "table_type": "VIEW"
  }
]
```

---

## Result Interpretation

The `table_type` field identifies the PostgreSQL object type:

- `BASE TABLE` = physical table storing data.
- `VIEW` = standard PostgreSQL view whose result is derived from a query.

Materialized views are not represented by this audit file and are inventoried separately in `03-materialized-views.md`.

---

## Audit Notes

This inventory is **descriptive only**.

No object in this file should be classified as active, legacy, deprecated, or safe to remove based solely on its presence here.

Before removing any object, the audit must verify:

1. Application code references.
2. Database dependencies.
3. Foreign key dependencies where applicable.
4. Functions/RPCs referencing the object.
5. Triggers referencing the object.
6. Views depending on the object.
7. RLS policies and grants.
8. Whether the object contains production or historical data.
9. Whether a newer object has replaced its responsibility.

---

## Preliminary Observation

The database currently contains objects with overlapping functional responsibilities across schemas, particularly between `public` and `development`.

Examples visible from the inventory include:

- Attendance objects in both `public` and `development`.
- Quiz objects in both `public` and `development`.
- Ranking-related objects in both `public` and `development`.

These overlaps are **not yet classified as legacy**.

They require dependency and application-reference analysis before any cleanup decision is made.

---

## Audit Status

**Inventory captured — classification pending.**

No database changes were performed as part of this audit.