# Supabase Database Dependencies

## Purpose

Capture database-level dependencies between CAFLA objects.

This audit is particularly important for identifying objects that may appear unused by application code but remain required by other database objects.

Database dependencies must be evaluated before any table, view, or function is considered safe to remove.

---

## Scope

Schemas included:

- `public`
- `tournaments`
- `development`

Dependency categories captured:

1. View / materialized view dependencies on tables and views.
2. PostgreSQL catalog-visible function dependencies on tables, views, and sequences.

Foreign key relationships are documented separately in `06-foreign-keys.md`.

Trigger-to-function relationships are documented separately in `09-triggers.md`.

---

# Part 1 — View Dependencies

## Purpose

Identify the tables and views referenced by standard PostgreSQL views and materialized views.

---

## Query

```sql
select distinct
  dependent_ns.nspname as dependent_schema,
  dependent_view.relname as dependent_object,
  case dependent_view.relkind
    when 'v' then 'VIEW'
    when 'm' then 'MATERIALIZED VIEW'
    else dependent_view.relkind::text
  end as dependent_type,
  source_ns.nspname as source_schema,
  source_table.relname as source_object,
  case source_table.relkind
    when 'r' then 'TABLE'
    when 'v' then 'VIEW'
    when 'm' then 'MATERIALIZED VIEW'
    when 'p' then 'PARTITIONED TABLE'
    when 'f' then 'FOREIGN TABLE'
    else source_table.relkind::text
  end as source_type
from pg_depend d
join pg_rewrite r
  on r.oid = d.objid
join pg_class dependent_view
  on dependent_view.oid = r.ev_class
join pg_namespace dependent_ns
  on dependent_ns.oid = dependent_view.relnamespace
join pg_class source_table
  on source_table.oid = d.refobjid
join pg_namespace source_ns
  on source_ns.oid = source_table.relnamespace
where dependent_ns.nspname in ('public', 'tournaments', 'development')
  and source_ns.nspname in ('public', 'tournaments', 'development')
  and dependent_view.relkind in ('v', 'm')
  and source_table.oid <> dependent_view.oid
order by
  dependent_ns.nspname,
  dependent_view.relname,
  source_ns.nspname,
  source_table.relname;
```

---

## Result

```json
[
  {
    "dependent_schema": "development",
    "dependent_object": "cycle_months_v2",
    "dependent_type": "VIEW",
    "source_schema": "development",
    "source_object": "cycles",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "development",
    "dependent_object": "quiz_member_best_results",
    "dependent_type": "VIEW",
    "source_schema": "development",
    "source_object": "cycle_members",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "development",
    "dependent_object": "quiz_member_best_results",
    "dependent_type": "VIEW",
    "source_schema": "development",
    "source_object": "quiz_assessments",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "development",
    "dependent_object": "quiz_member_best_results",
    "dependent_type": "VIEW",
    "source_schema": "development",
    "source_object": "quiz_attempts",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "development",
    "dependent_object": "quiz_member_best_results",
    "dependent_type": "VIEW",
    "source_schema": "public",
    "source_object": "members",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "development",
    "dependent_object": "referee_attendance",
    "dependent_type": "VIEW",
    "source_schema": "development",
    "source_object": "cycle_members",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "development",
    "dependent_object": "referee_attendance",
    "dependent_type": "VIEW",
    "source_schema": "development",
    "source_object": "cycles",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "development",
    "dependent_object": "referee_attendance",
    "dependent_type": "VIEW",
    "source_schema": "development",
    "source_object": "referee_attendance_detail",
    "source_type": "VIEW"
  },
  {
    "dependent_schema": "development",
    "dependent_object": "referee_attendance",
    "dependent_type": "VIEW",
    "source_schema": "public",
    "source_object": "members",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "development",
    "dependent_object": "referee_attendance_detail",
    "dependent_type": "VIEW",
    "source_schema": "development",
    "source_object": "attendance_records",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "development",
    "dependent_object": "referee_attendance_detail",
    "dependent_type": "VIEW",
    "source_schema": "development",
    "source_object": "attendance_scoring_rules",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "development",
    "dependent_object": "referee_attendance_detail",
    "dependent_type": "VIEW",
    "source_schema": "development",
    "source_object": "attendance_sessions",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "development",
    "dependent_object": "referee_attendance_detail",
    "dependent_type": "VIEW",
    "source_schema": "development",
    "source_object": "cycle_members",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "development",
    "dependent_object": "referee_attendance_detail",
    "dependent_type": "VIEW",
    "source_schema": "development",
    "source_object": "cycles",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "development",
    "dependent_object": "referee_attendance_detail",
    "dependent_type": "VIEW",
    "source_schema": "public",
    "source_object": "members",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "development",
    "dependent_object": "referee_current_ranking_v2",
    "dependent_type": "VIEW",
    "source_schema": "development",
    "source_object": "referee_monthly_ranking_history_v2",
    "source_type": "VIEW"
  },
  {
    "dependent_schema": "development",
    "dependent_object": "referee_cycle_development_score_v2",
    "dependent_type": "VIEW",
    "source_schema": "development",
    "source_object": "referee_period_development_score",
    "source_type": "VIEW"
  },
  {
    "dependent_schema": "development",
    "dependent_object": "referee_cycle_ranking_evidence_v2",
    "dependent_type": "VIEW",
    "source_schema": "development",
    "source_object": "referee_cycle_development_score_v2",
    "source_type": "VIEW"
  },
  {
    "dependent_schema": "development",
    "dependent_object": "referee_cycle_ranking_evidence_v2",
    "dependent_type": "VIEW",
    "source_schema": "development",
    "source_object": "referee_ranking_evidence",
    "source_type": "VIEW"
  },
  {
    "dependent_schema": "development",
    "dependent_object": "referee_cycle_ranking_v2",
    "dependent_type": "VIEW",
    "source_schema": "development",
    "source_object": "referee_cycle_ranking_evidence_v2",
    "source_type": "VIEW"
  },
  {
    "dependent_schema": "development",
    "dependent_object": "referee_evaluation_detail",
    "dependent_type": "VIEW",
    "source_schema": "development",
    "source_object": "cycle_members",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "development",
    "dependent_object": "referee_evaluation_detail",
    "dependent_type": "VIEW",
    "source_schema": "development",
    "source_object": "cycles",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "development",
    "dependent_object": "referee_evaluation_detail",
    "dependent_type": "VIEW",
    "source_schema": "public",
    "source_object": "evaluations",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "development",
    "dependent_object": "referee_evaluation_detail",
    "dependent_type": "VIEW",
    "source_schema": "public",
    "source_object": "matches",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "development",
    "dependent_object": "referee_evaluation_detail",
    "dependent_type": "VIEW",
    "source_schema": "public",
    "source_object": "members",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "development",
    "dependent_object": "referee_evaluation_score",
    "dependent_type": "VIEW",
    "source_schema": "development",
    "source_object": "cycle_members",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "development",
    "dependent_object": "referee_evaluation_score",
    "dependent_type": "VIEW",
    "source_schema": "development",
    "source_object": "cycles",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "development",
    "dependent_object": "referee_evaluation_score",
    "dependent_type": "VIEW",
    "source_schema": "development",
    "source_object": "referee_evaluation_detail",
    "source_type": "VIEW"
  },
  {
    "dependent_schema": "development",
    "dependent_object": "referee_evaluation_score",
    "dependent_type": "VIEW",
    "source_schema": "public",
    "source_object": "members",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "development",
    "dependent_object": "referee_monthly_development_score_v2",
    "dependent_type": "VIEW",
    "source_schema": "development",
    "source_object": "referee_monthly_period_metric_scores_v2",
    "source_type": "VIEW"
  },
  {
    "dependent_schema": "development",
    "dependent_object": "referee_monthly_period_metric_scores_v2",
    "dependent_type": "VIEW",
    "source_schema": "development",
    "source_object": "cycle_members",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "development",
    "dependent_object": "referee_monthly_period_metric_scores_v2",
    "dependent_type": "VIEW",
    "source_schema": "development",
    "source_object": "cycle_months_v2",
    "source_type": "VIEW"
  },
  {
    "dependent_schema": "development",
    "dependent_object": "referee_monthly_period_metric_scores_v2",
    "dependent_type": "VIEW",
    "source_schema": "development",
    "source_object": "cycles",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "development",
    "dependent_object": "referee_monthly_period_metric_scores_v2",
    "dependent_type": "VIEW",
    "source_schema": "development",
    "source_object": "quiz_assessments",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "development",
    "dependent_object": "referee_monthly_period_metric_scores_v2",
    "dependent_type": "VIEW",
    "source_schema": "development",
    "source_object": "quiz_member_best_results",
    "source_type": "VIEW"
  },
  {
    "dependent_schema": "development",
    "dependent_object": "referee_monthly_period_metric_scores_v2",
    "dependent_type": "VIEW",
    "source_schema": "development",
    "source_object": "referee_attendance_detail",
    "source_type": "VIEW"
  },
  {
    "dependent_schema": "development",
    "dependent_object": "referee_monthly_period_metric_scores_v2",
    "dependent_type": "VIEW",
    "source_schema": "development",
    "source_object": "referee_evaluation_detail",
    "source_type": "VIEW"
  },
  {
    "dependent_schema": "development",
    "dependent_object": "referee_monthly_period_metric_scores_v2",
    "dependent_type": "VIEW",
    "source_schema": "development",
    "source_object": "referee_report_detail",
    "source_type": "VIEW"
  },
  {
    "dependent_schema": "development",
    "dependent_object": "referee_monthly_period_metric_scores_v2",
    "dependent_type": "VIEW",
    "source_schema": "development",
    "source_object": "scoring_periods",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "development",
    "dependent_object": "referee_monthly_period_metric_scores_v2",
    "dependent_type": "VIEW",
    "source_schema": "public",
    "source_object": "members",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "development",
    "dependent_object": "referee_monthly_ranking_evidence_v2",
    "dependent_type": "VIEW",
    "source_schema": "development",
    "source_object": "quiz_assessments",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "development",
    "dependent_object": "referee_monthly_ranking_evidence_v2",
    "dependent_type": "VIEW",
    "source_schema": "development",
    "source_object": "referee_monthly_development_score_v2",
    "source_type": "VIEW"
  },
  {
    "dependent_schema": "development",
    "dependent_object": "referee_monthly_ranking_evidence_v2",
    "dependent_type": "VIEW",
    "source_schema": "development",
    "source_object": "referee_monthly_period_metric_scores_v2",
    "source_type": "VIEW"
  },
  {
    "dependent_schema": "development",
    "dependent_object": "referee_monthly_ranking_history_v2",
    "dependent_type": "VIEW",
    "source_schema": "development",
    "source_object": "referee_monthly_ranking_evidence_v2",
    "source_type": "VIEW"
  },
  {
    "dependent_schema": "development",
    "dependent_object": "referee_period_development_score",
    "dependent_type": "VIEW",
    "source_schema": "development",
    "source_object": "referee_period_metric_scores",
    "source_type": "VIEW"
  },
  {
    "dependent_schema": "development",
    "dependent_object": "referee_period_metric_scores",
    "dependent_type": "VIEW",
    "source_schema": "development",
    "source_object": "cycle_members",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "development",
    "dependent_object": "referee_period_metric_scores",
    "dependent_type": "VIEW",
    "source_schema": "development",
    "source_object": "cycles",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "development",
    "dependent_object": "referee_period_metric_scores",
    "dependent_type": "VIEW",
    "source_schema": "development",
    "source_object": "quiz_assessments",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "development",
    "dependent_object": "referee_period_metric_scores",
    "dependent_type": "VIEW",
    "source_schema": "development",
    "source_object": "quiz_member_best_results",
    "source_type": "VIEW"
  },
  {
    "dependent_schema": "development",
    "dependent_object": "referee_period_metric_scores",
    "dependent_type": "VIEW",
    "source_schema": "development",
    "source_object": "referee_attendance_detail",
    "source_type": "VIEW"
  },
  {
    "dependent_schema": "development",
    "dependent_object": "referee_period_metric_scores",
    "dependent_type": "VIEW",
    "source_schema": "development",
    "source_object": "referee_evaluation_detail",
    "source_type": "VIEW"
  },
  {
    "dependent_schema": "development",
    "dependent_object": "referee_period_metric_scores",
    "dependent_type": "VIEW",
    "source_schema": "development",
    "source_object": "referee_report_detail",
    "source_type": "VIEW"
  },
  {
    "dependent_schema": "development",
    "dependent_object": "referee_period_metric_scores",
    "dependent_type": "VIEW",
    "source_schema": "development",
    "source_object": "scoring_periods",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "development",
    "dependent_object": "referee_period_metric_scores",
    "dependent_type": "VIEW",
    "source_schema": "public",
    "source_object": "members",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "development",
    "dependent_object": "referee_quiz_score",
    "dependent_type": "VIEW",
    "source_schema": "development",
    "source_object": "quiz_assessments",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "development",
    "dependent_object": "referee_quiz_score",
    "dependent_type": "VIEW",
    "source_schema": "development",
    "source_object": "quiz_member_best_results",
    "source_type": "VIEW"
  },
  {
    "dependent_schema": "development",
    "dependent_object": "referee_ranking_evidence",
    "dependent_type": "VIEW",
    "source_schema": "development",
    "source_object": "referee_period_development_score",
    "source_type": "VIEW"
  },
  {
    "dependent_schema": "development",
    "dependent_object": "referee_ranking_v2",
    "dependent_type": "VIEW",
    "source_schema": "development",
    "source_object": "referee_ranking_evidence",
    "source_type": "VIEW"
  },
  {
    "dependent_schema": "development",
    "dependent_object": "referee_report_detail",
    "dependent_type": "VIEW",
    "source_schema": "development",
    "source_object": "cycle_members",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "development",
    "dependent_object": "referee_report_detail",
    "dependent_type": "VIEW",
    "source_schema": "development",
    "source_object": "cycles",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "development",
    "dependent_object": "referee_report_detail",
    "dependent_type": "VIEW",
    "source_schema": "public",
    "source_object": "match_reports",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "development",
    "dependent_object": "referee_report_detail",
    "dependent_type": "VIEW",
    "source_schema": "public",
    "source_object": "matches",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "development",
    "dependent_object": "referee_report_detail",
    "dependent_type": "VIEW",
    "source_schema": "public",
    "source_object": "members",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "development",
    "dependent_object": "referee_report_score",
    "dependent_type": "VIEW",
    "source_schema": "development",
    "source_object": "referee_report_detail",
    "source_type": "VIEW"
  },
  {
    "dependent_schema": "public",
    "dependent_object": "dashboard_peer_feedback_score",
    "dependent_type": "VIEW",
    "source_schema": "public",
    "source_object": "evaluations",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "public",
    "dependent_object": "dashboard_peer_feedback_score",
    "dependent_type": "VIEW",
    "source_schema": "public",
    "source_object": "members",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "public",
    "dependent_object": "dashboard_pending_evaluations",
    "dependent_type": "VIEW",
    "source_schema": "public",
    "source_object": "evaluations",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "public",
    "dependent_object": "dashboard_pending_evaluations",
    "dependent_type": "VIEW",
    "source_schema": "public",
    "source_object": "matches",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "public",
    "dependent_object": "dashboard_pending_evaluations",
    "dependent_type": "VIEW",
    "source_schema": "public",
    "source_object": "members",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "public",
    "dependent_object": "dashboard_pending_reports",
    "dependent_type": "VIEW",
    "source_schema": "public",
    "source_object": "match_reports",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "public",
    "dependent_object": "dashboard_pending_reports",
    "dependent_type": "VIEW",
    "source_schema": "public",
    "source_object": "matches",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "public",
    "dependent_object": "dashboard_pending_reports",
    "dependent_type": "VIEW",
    "source_schema": "public",
    "source_object": "members",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "public",
    "dependent_object": "dashboard_quiz_scores",
    "dependent_type": "VIEW",
    "source_schema": "public",
    "source_object": "members",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "public",
    "dependent_object": "dashboard_quiz_scores",
    "dependent_type": "VIEW",
    "source_schema": "public",
    "source_object": "quiz_attempts",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "public",
    "dependent_object": "dashboard_referee_activity",
    "dependent_type": "VIEW",
    "source_schema": "public",
    "source_object": "evaluations",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "public",
    "dependent_object": "dashboard_referee_activity",
    "dependent_type": "VIEW",
    "source_schema": "public",
    "source_object": "match_reports",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "public",
    "dependent_object": "dashboard_referee_activity",
    "dependent_type": "VIEW",
    "source_schema": "public",
    "source_object": "matches",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "public",
    "dependent_object": "dashboard_referee_activity",
    "dependent_type": "VIEW",
    "source_schema": "public",
    "source_object": "members",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "public",
    "dependent_object": "dashboard_referee_attendance",
    "dependent_type": "VIEW",
    "source_schema": "public",
    "source_object": "attendance_records",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "public",
    "dependent_object": "dashboard_referee_attendance",
    "dependent_type": "VIEW",
    "source_schema": "public",
    "source_object": "attendance_sessions",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "public",
    "dependent_object": "dashboard_referee_attendance",
    "dependent_type": "VIEW",
    "source_schema": "public",
    "source_object": "members",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "public",
    "dependent_object": "dashboard_referee_development_score",
    "dependent_type": "VIEW",
    "source_schema": "public",
    "source_object": "dashboard_peer_feedback_score",
    "source_type": "VIEW"
  },
  {
    "dependent_schema": "public",
    "dependent_object": "dashboard_referee_development_score",
    "dependent_type": "VIEW",
    "source_schema": "public",
    "source_object": "dashboard_quiz_scores",
    "source_type": "VIEW"
  },
  {
    "dependent_schema": "public",
    "dependent_object": "dashboard_referee_development_score",
    "dependent_type": "VIEW",
    "source_schema": "public",
    "source_object": "dashboard_referee_attendance",
    "source_type": "VIEW"
  },
  {
    "dependent_schema": "public",
    "dependent_object": "dashboard_referee_development_score",
    "dependent_type": "VIEW",
    "source_schema": "public",
    "source_object": "dashboard_referee_report_score",
    "source_type": "VIEW"
  },
  {
    "dependent_schema": "public",
    "dependent_object": "dashboard_referee_development_score",
    "dependent_type": "VIEW",
    "source_schema": "public",
    "source_object": "members",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "public",
    "dependent_object": "dashboard_referee_matches",
    "dependent_type": "VIEW",
    "source_schema": "public",
    "source_object": "matches",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "public",
    "dependent_object": "dashboard_referee_matches",
    "dependent_type": "VIEW",
    "source_schema": "public",
    "source_object": "members",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "public",
    "dependent_object": "dashboard_referee_ranking",
    "dependent_type": "VIEW",
    "source_schema": "public",
    "source_object": "dashboard_referee_development_score",
    "source_type": "VIEW"
  },
  {
    "dependent_schema": "public",
    "dependent_object": "dashboard_referee_ranking_v2",
    "dependent_type": "VIEW",
    "source_schema": "public",
    "source_object": "dashboard_referee_ranking",
    "source_type": "VIEW"
  },
  {
    "dependent_schema": "public",
    "dependent_object": "dashboard_referee_ranking_v2",
    "dependent_type": "VIEW",
    "source_schema": "public",
    "source_object": "members",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "public",
    "dependent_object": "dashboard_referee_ranking_v2",
    "dependent_type": "VIEW",
    "source_schema": "public",
    "source_object": "ranking_config",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "public",
    "dependent_object": "dashboard_referee_ranking_v2",
    "dependent_type": "VIEW",
    "source_schema": "public",
    "source_object": "ranking_levels",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "public",
    "dependent_object": "dashboard_referee_report_score",
    "dependent_type": "VIEW",
    "source_schema": "public",
    "source_object": "match_reports",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "public",
    "dependent_object": "dashboard_referee_report_score",
    "dependent_type": "VIEW",
    "source_schema": "public",
    "source_object": "matches",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "public",
    "dependent_object": "dashboard_referee_report_score",
    "dependent_type": "VIEW",
    "source_schema": "public",
    "source_object": "members",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "public",
    "dependent_object": "dashboard_upcoming_matches",
    "dependent_type": "VIEW",
    "source_schema": "public",
    "source_object": "matches",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "public",
    "dependent_object": "dashboard_upcoming_matches",
    "dependent_type": "VIEW",
    "source_schema": "public",
    "source_object": "members",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "tournaments",
    "dependent_object": "match_roster_view",
    "dependent_type": "VIEW",
    "source_schema": "tournaments",
    "source_object": "match_rosters",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "tournaments",
    "dependent_object": "match_roster_view",
    "dependent_type": "VIEW",
    "source_schema": "tournaments",
    "source_object": "players",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "tournaments",
    "dependent_object": "match_roster_view",
    "dependent_type": "VIEW",
    "source_schema": "tournaments",
    "source_object": "teams",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "tournaments",
    "dependent_object": "player_card_reason_stats",
    "dependent_type": "VIEW",
    "source_schema": "public",
    "source_object": "match_reports",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "tournaments",
    "dependent_object": "player_card_reason_stats",
    "dependent_type": "VIEW",
    "source_schema": "public",
    "source_object": "report_cards",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "tournaments",
    "dependent_object": "player_card_reason_stats",
    "dependent_type": "VIEW",
    "source_schema": "tournaments",
    "source_object": "division_seasons",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "tournaments",
    "dependent_object": "player_card_reason_stats",
    "dependent_type": "VIEW",
    "source_schema": "tournaments",
    "source_object": "divisions",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "tournaments",
    "dependent_object": "player_card_reason_stats",
    "dependent_type": "VIEW",
    "source_schema": "tournaments",
    "source_object": "match_context",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "tournaments",
    "dependent_object": "player_card_reason_stats",
    "dependent_type": "VIEW",
    "source_schema": "tournaments",
    "source_object": "players",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "tournaments",
    "dependent_object": "player_card_reason_stats",
    "dependent_type": "VIEW",
    "source_schema": "tournaments",
    "source_object": "seasons",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "tournaments",
    "dependent_object": "player_card_reason_stats",
    "dependent_type": "VIEW",
    "source_schema": "tournaments",
    "source_object": "team_registrations",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "tournaments",
    "dependent_object": "player_card_reason_stats",
    "dependent_type": "VIEW",
    "source_schema": "tournaments",
    "source_object": "teams",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "tournaments",
    "dependent_object": "player_team_season_stats",
    "dependent_type": "VIEW",
    "source_schema": "public",
    "source_object": "match_reports",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "tournaments",
    "dependent_object": "player_team_season_stats",
    "dependent_type": "VIEW",
    "source_schema": "public",
    "source_object": "report_cards",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "tournaments",
    "dependent_object": "player_team_season_stats",
    "dependent_type": "VIEW",
    "source_schema": "public",
    "source_object": "report_goals",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "tournaments",
    "dependent_object": "player_team_season_stats",
    "dependent_type": "VIEW",
    "source_schema": "tournaments",
    "source_object": "division_seasons",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "tournaments",
    "dependent_object": "player_team_season_stats",
    "dependent_type": "VIEW",
    "source_schema": "tournaments",
    "source_object": "divisions",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "tournaments",
    "dependent_object": "player_team_season_stats",
    "dependent_type": "VIEW",
    "source_schema": "tournaments",
    "source_object": "match_context",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "tournaments",
    "dependent_object": "player_team_season_stats",
    "dependent_type": "VIEW",
    "source_schema": "tournaments",
    "source_object": "players",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "tournaments",
    "dependent_object": "player_team_season_stats",
    "dependent_type": "VIEW",
    "source_schema": "tournaments",
    "source_object": "seasons",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "tournaments",
    "dependent_object": "player_team_season_stats",
    "dependent_type": "VIEW",
    "source_schema": "tournaments",
    "source_object": "team_registrations",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "tournaments",
    "dependent_object": "player_team_season_stats",
    "dependent_type": "VIEW",
    "source_schema": "tournaments",
    "source_object": "teams",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "tournaments",
    "dependent_object": "team_season_standings",
    "dependent_type": "VIEW",
    "source_schema": "public",
    "source_object": "match_reports",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "tournaments",
    "dependent_object": "team_season_standings",
    "dependent_type": "VIEW",
    "source_schema": "tournaments",
    "source_object": "division_seasons",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "tournaments",
    "dependent_object": "team_season_standings",
    "dependent_type": "VIEW",
    "source_schema": "tournaments",
    "source_object": "divisions",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "tournaments",
    "dependent_object": "team_season_standings",
    "dependent_type": "VIEW",
    "source_schema": "tournaments",
    "source_object": "match_context",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "tournaments",
    "dependent_object": "team_season_standings",
    "dependent_type": "VIEW",
    "source_schema": "tournaments",
    "source_object": "seasons",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "tournaments",
    "dependent_object": "team_season_standings",
    "dependent_type": "VIEW",
    "source_schema": "tournaments",
    "source_object": "team_registrations",
    "source_type": "TABLE"
  },
  {
    "dependent_schema": "tournaments",
    "dependent_object": "team_season_standings",
    "dependent_type": "VIEW",
    "source_schema": "tournaments",
    "source_object": "teams",
    "source_type": "TABLE"
  }
]
```

---

## Result Interpretation

Each row represents a database object dependency of the form:

`dependent object → source object`

For example:

`development.some_view → public.members`

means that the view depends on `public.members`.

Important fields:

- `dependent_schema` — schema containing the dependent object.
- `dependent_object` — view or materialized view relying on another object.
- `dependent_type` — dependent object type.
- `source_schema` — schema containing the referenced object.
- `source_object` — referenced table/view.
- `source_type` — PostgreSQL object type of the dependency.

---

# Part 2 — Function Catalog Dependencies

## Purpose

Capture PostgreSQL catalog-visible dependencies between functions and relation objects.

---

## Query

```sql
select distinct
  function_ns.nspname as function_schema,
  p.proname as function_name,
  pg_get_function_identity_arguments(p.oid) as identity_arguments,
  source_ns.nspname as source_schema,
  source_object.relname as source_object,
  case source_object.relkind
    when 'r' then 'TABLE'
    when 'v' then 'VIEW'
    when 'm' then 'MATERIALIZED VIEW'
    when 'p' then 'PARTITIONED TABLE'
    when 'S' then 'SEQUENCE'
    else source_object.relkind::text
  end as source_type
from pg_depend d
join pg_proc p
  on p.oid = d.objid
join pg_namespace function_ns
  on function_ns.oid = p.pronamespace
join pg_class source_object
  on source_object.oid = d.refobjid
join pg_namespace source_ns
  on source_ns.oid = source_object.relnamespace
where d.classid = 'pg_proc'::regclass
  and function_ns.nspname in ('public', 'tournaments', 'development')
  and source_ns.nspname in ('public', 'tournaments', 'development')
order by
  function_ns.nspname,
  p.proname,
  source_ns.nspname,
  source_object.relname;
```

---

## Result

```json
Success. No rows returned
```

---

## Result Interpretation

Each row represents a PostgreSQL catalog-visible relationship of the form:

`function → database relation`

Potential referenced object types include:

- Tables
- Views
- Materialized views
- Partitioned tables
- Sequences

---

## Important Limitation

PostgreSQL does not necessarily expose every relation referenced inside SQL or PL/pgSQL function bodies through `pg_depend`.

Therefore, the absence of a function dependency in this result must **not** be interpreted as proof that the function does not use a table or view.

Function source code captured in `08-functions-and-rpcs.md` must also be analyzed.

Application repository references must be analyzed separately.

---

## Audit Notes

A reliable removal decision requires combining multiple dependency sources:

```text
Application references
        +
View dependencies
        +
Function definitions
        +
Trigger dependencies
        +
Foreign keys
        +
Cron callers
        +
RLS/security configuration
        +
Production/historical data
```

A database object with zero application references can still be required internally by PostgreSQL.

---

## Preliminary Observation

This inventory will later be used to build dependency chains such as:

`application → view → view → table`

and:

`cron → function → table`

These chains are especially important when evaluating potential legacy objects in `public`.

No object is classified as removable from dependency information alone.

---

## Audit Status

**Database dependency inventory captured — classification pending.**

No database changes were performed as part of this audit.