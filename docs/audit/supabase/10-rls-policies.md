# Supabase RLS Policies

## Purpose

Capture the current Row Level Security configuration of the CAFLA Supabase database.

This audit documents both:

1. Whether RLS is enabled or forced on each base table.
2. The policies currently defined for those tables.

RLS is a critical part of the CAFLA authorization model and must be reviewed before any database cleanup or architectural change.

---

## Scope

Schemas included:

- `public`
- `tournaments`
- `development`

Objects included:

- Base tables
- Row Level Security state
- RLS policies
- Policy roles
- Commands
- `USING` expressions
- `WITH CHECK` expressions

---

# Part 1 — RLS State

## Query

```sql
select
  n.nspname as table_schema,
  c.relname as table_name,
  c.relrowsecurity as rls_enabled,
  c.relforcerowsecurity as rls_forced
from pg_class c
join pg_namespace n
  on n.oid = c.relnamespace
where n.nspname in ('public', 'tournaments', 'development')
  and c.relkind = 'r'
order by
  n.nspname,
  c.relname;
```

## Result

```json
[
  {
    "table_schema": "development",
    "table_name": "attendance_records",
    "rls_enabled": true,
    "rls_forced": false
  },
  {
    "table_schema": "development",
    "table_name": "attendance_scoring_rules",
    "rls_enabled": true,
    "rls_forced": false
  },
  {
    "table_schema": "development",
    "table_name": "attendance_sessions",
    "rls_enabled": true,
    "rls_forced": false
  },
  {
    "table_schema": "development",
    "table_name": "current_ranking_snapshot",
    "rls_enabled": true,
    "rls_forced": false
  },
  {
    "table_schema": "development",
    "table_name": "cycle_members",
    "rls_enabled": true,
    "rls_forced": false
  },
  {
    "table_schema": "development",
    "table_name": "cycles",
    "rls_enabled": true,
    "rls_forced": false
  },
  {
    "table_schema": "development",
    "table_name": "monthly_ranking_snapshots",
    "rls_enabled": true,
    "rls_forced": false
  },
  {
    "table_schema": "development",
    "table_name": "quiz_access_grants",
    "rls_enabled": true,
    "rls_forced": false
  },
  {
    "table_schema": "development",
    "table_name": "quiz_answers",
    "rls_enabled": true,
    "rls_forced": false
  },
  {
    "table_schema": "development",
    "table_name": "quiz_assessments",
    "rls_enabled": true,
    "rls_forced": false
  },
  {
    "table_schema": "development",
    "table_name": "quiz_attempt_questions",
    "rls_enabled": true,
    "rls_forced": false
  },
  {
    "table_schema": "development",
    "table_name": "quiz_attempts",
    "rls_enabled": true,
    "rls_forced": false
  },
  {
    "table_schema": "development",
    "table_name": "quiz_question_groups",
    "rls_enabled": true,
    "rls_forced": false
  },
  {
    "table_schema": "development",
    "table_name": "quiz_question_options",
    "rls_enabled": true,
    "rls_forced": false
  },
  {
    "table_schema": "development",
    "table_name": "quiz_questions",
    "rls_enabled": true,
    "rls_forced": false
  },
  {
    "table_schema": "development",
    "table_name": "quiz_versions",
    "rls_enabled": true,
    "rls_forced": false
  },
  {
    "table_schema": "development",
    "table_name": "scoring_periods",
    "rls_enabled": true,
    "rls_forced": false
  },
  {
    "table_schema": "public",
    "table_name": "arbiter_referees",
    "rls_enabled": false,
    "rls_forced": false
  },
  {
    "table_schema": "public",
    "table_name": "attendance_records",
    "rls_enabled": true,
    "rls_forced": false
  },
  {
    "table_schema": "public",
    "table_name": "attendance_sessions",
    "rls_enabled": true,
    "rls_forced": false
  },
  {
    "table_schema": "public",
    "table_name": "card_reasons",
    "rls_enabled": false,
    "rls_forced": false
  },
  {
    "table_schema": "public",
    "table_name": "evaluations",
    "rls_enabled": true,
    "rls_forced": false
  },
  {
    "table_schema": "public",
    "table_name": "match_reports",
    "rls_enabled": true,
    "rls_forced": false
  },
  {
    "table_schema": "public",
    "table_name": "matches",
    "rls_enabled": true,
    "rls_forced": false
  },
  {
    "table_schema": "public",
    "table_name": "members",
    "rls_enabled": true,
    "rls_forced": false
  },
  {
    "table_schema": "public",
    "table_name": "quiz_answers",
    "rls_enabled": false,
    "rls_forced": false
  },
  {
    "table_schema": "public",
    "table_name": "quiz_attempts",
    "rls_enabled": true,
    "rls_forced": false
  },
  {
    "table_schema": "public",
    "table_name": "quiz_questions",
    "rls_enabled": true,
    "rls_forced": false
  },
  {
    "table_schema": "public",
    "table_name": "quizzes",
    "rls_enabled": true,
    "rls_forced": false
  },
  {
    "table_schema": "public",
    "table_name": "ranking_config",
    "rls_enabled": false,
    "rls_forced": false
  },
  {
    "table_schema": "public",
    "table_name": "ranking_history",
    "rls_enabled": false,
    "rls_forced": false
  },
  {
    "table_schema": "public",
    "table_name": "ranking_levels",
    "rls_enabled": false,
    "rls_forced": false
  },
  {
    "table_schema": "public",
    "table_name": "report_assets",
    "rls_enabled": true,
    "rls_forced": false
  },
  {
    "table_schema": "public",
    "table_name": "report_cards",
    "rls_enabled": true,
    "rls_forced": false
  },
  {
    "table_schema": "public",
    "table_name": "report_goals",
    "rls_enabled": true,
    "rls_forced": false
  },
  {
    "table_schema": "public",
    "table_name": "report_injuries",
    "rls_enabled": true,
    "rls_forced": false
  },
  {
    "table_schema": "tournaments",
    "table_name": "division_seasons",
    "rls_enabled": true,
    "rls_forced": false
  },
  {
    "table_schema": "tournaments",
    "table_name": "divisions",
    "rls_enabled": true,
    "rls_forced": false
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_context",
    "rls_enabled": true,
    "rls_forced": false
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_context_logs",
    "rls_enabled": true,
    "rls_forced": false
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_rosters",
    "rls_enabled": true,
    "rls_forced": false
  },
  {
    "table_schema": "tournaments",
    "table_name": "organizations",
    "rls_enabled": true,
    "rls_forced": false
  },
  {
    "table_schema": "tournaments",
    "table_name": "player_registrations",
    "rls_enabled": true,
    "rls_forced": false
  },
  {
    "table_schema": "tournaments",
    "table_name": "players",
    "rls_enabled": true,
    "rls_forced": false
  },
  {
    "table_schema": "tournaments",
    "table_name": "seasons",
    "rls_enabled": true,
    "rls_forced": false
  },
  {
    "table_schema": "tournaments",
    "table_name": "team_registrations",
    "rls_enabled": true,
    "rls_forced": false
  },
  {
    "table_schema": "tournaments",
    "table_name": "teams",
    "rls_enabled": true,
    "rls_forced": false
  }
]
```

---

## RLS State Interpretation

Important fields:

- `table_schema` — schema containing the table.
- `table_name` — base table being evaluated.
- `rls_enabled` — whether Row Level Security is enabled.
- `rls_forced` — whether Row Level Security is forced even for the table owner in applicable PostgreSQL contexts.

Possible values:

- `true`
- `false`

A table with `rls_enabled = true` does not automatically mean access is correctly secured. The actual policies must also be reviewed.

---

# Part 2 — RLS Policies

## Query

```sql
select
  schemaname as table_schema,
  tablename as table_name,
  policyname as policy_name,
  permissive,
  roles,
  cmd as command,
  qual as using_expression,
  with_check as with_check_expression
from pg_policies
where schemaname in ('public', 'tournaments', 'development')
order by
  schemaname,
  tablename,
  policyname;
```

## Result

```json
[
  {
    "table_schema": "development",
    "table_name": "current_ranking_snapshot",
    "policy_name": "Authenticated members can read current ranking",
    "permissive": "PERMISSIVE",
    "roles": "{authenticated}",
    "command": "SELECT",
    "using_expression": "true",
    "with_check_expression": null
  },
  {
    "table_schema": "development",
    "table_name": "monthly_ranking_snapshots",
    "policy_name": "Members can read own monthly ranking history",
    "permissive": "PERMISSIVE",
    "roles": "{authenticated}",
    "command": "SELECT",
    "using_expression": "(member_id = auth.uid())",
    "with_check_expression": null
  },
  {
    "table_schema": "public",
    "table_name": "attendance_records",
    "policy_name": "attendance_records_insert_board_only",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "command": "INSERT",
    "using_expression": null,
    "with_check_expression": "is_board()"
  },
  {
    "table_schema": "public",
    "table_name": "attendance_records",
    "policy_name": "attendance_records_select_board_all",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "command": "SELECT",
    "using_expression": "is_board()",
    "with_check_expression": null
  },
  {
    "table_schema": "public",
    "table_name": "attendance_records",
    "policy_name": "attendance_records_select_self",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "command": "SELECT",
    "using_expression": "(member_id = auth.uid())",
    "with_check_expression": null
  },
  {
    "table_schema": "public",
    "table_name": "attendance_records",
    "policy_name": "attendance_records_update_board_only",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "command": "UPDATE",
    "using_expression": "is_board()",
    "with_check_expression": "is_board()"
  },
  {
    "table_schema": "public",
    "table_name": "attendance_sessions",
    "policy_name": "Public read sessions",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "command": "SELECT",
    "using_expression": "true",
    "with_check_expression": null
  },
  {
    "table_schema": "public",
    "table_name": "attendance_sessions",
    "policy_name": "attendance_sessions_insert_board_only",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "command": "INSERT",
    "using_expression": null,
    "with_check_expression": "is_board()"
  },
  {
    "table_schema": "public",
    "table_name": "attendance_sessions",
    "policy_name": "attendance_sessions_select_board_all",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "command": "SELECT",
    "using_expression": "is_board()",
    "with_check_expression": null
  },
  {
    "table_schema": "public",
    "table_name": "attendance_sessions",
    "policy_name": "attendance_sessions_select_members",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "command": "SELECT",
    "using_expression": "(auth.uid() IS NOT NULL)",
    "with_check_expression": null
  },
  {
    "table_schema": "public",
    "table_name": "attendance_sessions",
    "policy_name": "attendance_sessions_update_board_only",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "command": "UPDATE",
    "using_expression": "is_board()",
    "with_check_expression": "is_board()"
  },
  {
    "table_schema": "public",
    "table_name": "evaluations",
    "policy_name": "evaluations_insert_evaluator_only",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "command": "INSERT",
    "using_expression": null,
    "with_check_expression": "((evaluator_id = auth.uid()) AND (EXISTS ( SELECT 1\n   FROM matches m\n  WHERE ((m.id = evaluations.match_id) AND (((auth.uid() = m.center_referee_id) OR (auth.uid() = m.assistant_referee_1_id)) OR (auth.uid() = m.assistant_referee_2_id)) AND (((evaluations.evaluated_id = m.center_referee_id) OR (evaluations.evaluated_id = m.assistant_referee_1_id)) OR (evaluations.evaluated_id = m.assistant_referee_2_id))))))"
  },
  {
    "table_schema": "public",
    "table_name": "evaluations",
    "policy_name": "evaluations_select_board_all",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "command": "SELECT",
    "using_expression": "is_board()",
    "with_check_expression": null
  },
  {
    "table_schema": "public",
    "table_name": "evaluations",
    "policy_name": "evaluations_select_participant",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "command": "SELECT",
    "using_expression": "((evaluator_id = auth.uid()) OR (evaluated_id = auth.uid()))",
    "with_check_expression": null
  },
  {
    "table_schema": "public",
    "table_name": "evaluations",
    "policy_name": "evaluations_update_board_only",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "command": "UPDATE",
    "using_expression": "is_board()",
    "with_check_expression": "is_board()"
  },
  {
    "table_schema": "public",
    "table_name": "evaluations",
    "policy_name": "evaluations_update_evaluator_only",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "command": "UPDATE",
    "using_expression": "(evaluator_id = auth.uid())",
    "with_check_expression": "(evaluator_id = auth.uid())"
  },
  {
    "table_schema": "public",
    "table_name": "match_reports",
    "policy_name": "Allow select own match reports",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "command": "SELECT",
    "using_expression": "(submitted_by = auth.uid())",
    "with_check_expression": null
  },
  {
    "table_schema": "public",
    "table_name": "match_reports",
    "policy_name": "Allow update own match reports",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "command": "UPDATE",
    "using_expression": "(submitted_by = auth.uid())",
    "with_check_expression": "(submitted_by = auth.uid())"
  },
  {
    "table_schema": "public",
    "table_name": "match_reports",
    "policy_name": "Board can view all reports",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "command": "SELECT",
    "using_expression": "(EXISTS ( SELECT 1\n   FROM members\n  WHERE ((members.id = auth.uid()) AND (members.role = 'board'::member_role))))",
    "with_check_expression": null
  },
  {
    "table_schema": "public",
    "table_name": "match_reports",
    "policy_name": "match_reports_insert_center_referee_only",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "command": "INSERT",
    "using_expression": null,
    "with_check_expression": "((submitted_by = auth.uid()) AND (EXISTS ( SELECT 1\n   FROM matches m\n  WHERE ((m.id = match_reports.match_id) AND (m.center_referee_id = auth.uid())))))"
  },
  {
    "table_schema": "public",
    "table_name": "match_reports",
    "policy_name": "match_reports_select_board_all",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "command": "SELECT",
    "using_expression": "is_board()",
    "with_check_expression": null
  },
  {
    "table_schema": "public",
    "table_name": "match_reports",
    "policy_name": "match_reports_select_safe",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "command": "SELECT",
    "using_expression": "((submitted_by = auth.uid()) OR is_board())",
    "with_check_expression": null
  },
  {
    "table_schema": "public",
    "table_name": "match_reports",
    "policy_name": "match_reports_update_board_only",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "command": "UPDATE",
    "using_expression": "is_board()",
    "with_check_expression": "is_board()"
  },
  {
    "table_schema": "public",
    "table_name": "matches",
    "policy_name": "Board can view all matches",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "command": "SELECT",
    "using_expression": "(EXISTS ( SELECT 1\n   FROM members\n  WHERE ((members.id = auth.uid()) AND (members.role = 'board'::member_role))))",
    "with_check_expression": null
  },
  {
    "table_schema": "public",
    "table_name": "matches",
    "policy_name": "Members can read matches",
    "permissive": "PERMISSIVE",
    "roles": "{authenticated}",
    "command": "SELECT",
    "using_expression": "true",
    "with_check_expression": null
  },
  {
    "table_schema": "public",
    "table_name": "matches",
    "policy_name": "board_insert_matches",
    "permissive": "PERMISSIVE",
    "roles": "{authenticated}",
    "command": "INSERT",
    "using_expression": null,
    "with_check_expression": "is_board()"
  },
  {
    "table_schema": "public",
    "table_name": "members",
    "policy_name": "members_insert_board_only",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "command": "INSERT",
    "using_expression": null,
    "with_check_expression": "is_board()"
  },
  {
    "table_schema": "public",
    "table_name": "members",
    "policy_name": "members_select_board_all",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "command": "SELECT",
    "using_expression": "is_board()",
    "with_check_expression": null
  },
  {
    "table_schema": "public",
    "table_name": "members",
    "policy_name": "members_select_self",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "command": "SELECT",
    "using_expression": "(auth.uid() = id)",
    "with_check_expression": null
  },
  {
    "table_schema": "public",
    "table_name": "members",
    "policy_name": "members_update_board_all",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "command": "UPDATE",
    "using_expression": "is_board()",
    "with_check_expression": "is_board()"
  },
  {
    "table_schema": "public",
    "table_name": "members",
    "policy_name": "members_update_self",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "command": "UPDATE",
    "using_expression": "(auth.uid() = id)",
    "with_check_expression": "(auth.uid() = id)"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_attempts",
    "policy_name": "quiz_attempts_insert_self",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "command": "INSERT",
    "using_expression": null,
    "with_check_expression": "(member_id = auth.uid())"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_attempts",
    "policy_name": "quiz_attempts_select_board_all",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "command": "SELECT",
    "using_expression": "is_board()",
    "with_check_expression": null
  },
  {
    "table_schema": "public",
    "table_name": "quiz_attempts",
    "policy_name": "quiz_attempts_select_self",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "command": "SELECT",
    "using_expression": "(member_id = auth.uid())",
    "with_check_expression": null
  },
  {
    "table_schema": "public",
    "table_name": "quiz_attempts",
    "policy_name": "quiz_attempts_update_board_only",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "command": "UPDATE",
    "using_expression": "is_board()",
    "with_check_expression": "is_board()"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_questions",
    "policy_name": "quiz_questions_insert_board_only",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "command": "INSERT",
    "using_expression": null,
    "with_check_expression": "is_board()"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_questions",
    "policy_name": "quiz_questions_select_authenticated_users",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "command": "SELECT",
    "using_expression": "(auth.uid() IS NOT NULL)",
    "with_check_expression": null
  },
  {
    "table_schema": "public",
    "table_name": "quiz_questions",
    "policy_name": "quiz_questions_update_board_only",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "command": "UPDATE",
    "using_expression": "is_board()",
    "with_check_expression": "is_board()"
  },
  {
    "table_schema": "public",
    "table_name": "quizzes",
    "policy_name": "quizzes_insert_board_only",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "command": "INSERT",
    "using_expression": null,
    "with_check_expression": "is_board()"
  },
  {
    "table_schema": "public",
    "table_name": "quizzes",
    "policy_name": "quizzes_select_authenticated_users",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "command": "SELECT",
    "using_expression": "(auth.uid() IS NOT NULL)",
    "with_check_expression": null
  },
  {
    "table_schema": "public",
    "table_name": "quizzes",
    "policy_name": "quizzes_update_board_only",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "command": "UPDATE",
    "using_expression": "is_board()",
    "with_check_expression": "is_board()"
  },
  {
    "table_schema": "public",
    "table_name": "report_assets",
    "policy_name": "Allow delete report assets",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "command": "DELETE",
    "using_expression": "true",
    "with_check_expression": null
  },
  {
    "table_schema": "public",
    "table_name": "report_assets",
    "policy_name": "report_assets_insert_center_referee_only",
    "permissive": "PERMISSIVE",
    "roles": "{authenticated}",
    "command": "INSERT",
    "using_expression": null,
    "with_check_expression": "(EXISTS ( SELECT 1\n   FROM (matches m\n     JOIN match_reports mr ON ((mr.match_id = m.id)))\n  WHERE ((mr.id = report_assets.report_id) AND (m.center_referee_id = auth.uid()))))"
  },
  {
    "table_schema": "public",
    "table_name": "report_assets",
    "policy_name": "report_assets_select_board_all",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "command": "SELECT",
    "using_expression": "is_board()",
    "with_check_expression": null
  },
  {
    "table_schema": "public",
    "table_name": "report_assets",
    "policy_name": "report_assets_select_safe",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "command": "SELECT",
    "using_expression": "((report_id IN ( SELECT match_reports.id\n   FROM match_reports\n  WHERE (match_reports.submitted_by = auth.uid()))) OR is_board())",
    "with_check_expression": null
  },
  {
    "table_schema": "public",
    "table_name": "report_assets",
    "policy_name": "report_assets_update_board_only",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "command": "UPDATE",
    "using_expression": "is_board()",
    "with_check_expression": "is_board()"
  },
  {
    "table_schema": "public",
    "table_name": "report_assets",
    "policy_name": "report_assets_update_center_referee_only",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "command": "UPDATE",
    "using_expression": "(EXISTS ( SELECT 1\n   FROM (match_reports mr\n     JOIN matches m ON ((m.id = mr.match_id)))\n  WHERE ((mr.id = report_assets.report_id) AND (m.center_referee_id = auth.uid()) AND (mr.submitted_by = auth.uid()) AND (mr.status = ANY (ARRAY['pending'::report_status, 'submitted'::report_status])))))",
    "with_check_expression": "(EXISTS ( SELECT 1\n   FROM (match_reports mr\n     JOIN matches m ON ((m.id = mr.match_id)))\n  WHERE ((mr.id = report_assets.report_id) AND (m.center_referee_id = auth.uid()) AND (mr.submitted_by = auth.uid()) AND (mr.status = ANY (ARRAY['pending'::report_status, 'submitted'::report_status])))))"
  },
  {
    "table_schema": "public",
    "table_name": "report_cards",
    "policy_name": "Allow delete report cards",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "command": "DELETE",
    "using_expression": "true",
    "with_check_expression": null
  },
  {
    "table_schema": "public",
    "table_name": "report_cards",
    "policy_name": "report_cards_insert_center_referee_only",
    "permissive": "PERMISSIVE",
    "roles": "{authenticated}",
    "command": "INSERT",
    "using_expression": null,
    "with_check_expression": "(EXISTS ( SELECT 1\n   FROM (matches m\n     JOIN match_reports mr ON ((mr.match_id = m.id)))\n  WHERE ((mr.id = report_cards.report_id) AND (m.center_referee_id = auth.uid()))))"
  },
  {
    "table_schema": "public",
    "table_name": "report_cards",
    "policy_name": "report_cards_select_board_all",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "command": "SELECT",
    "using_expression": "is_board()",
    "with_check_expression": null
  },
  {
    "table_schema": "public",
    "table_name": "report_cards",
    "policy_name": "report_cards_select_safe",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "command": "SELECT",
    "using_expression": "((report_id IN ( SELECT match_reports.id\n   FROM match_reports\n  WHERE (match_reports.submitted_by = auth.uid()))) OR is_board())",
    "with_check_expression": null
  },
  {
    "table_schema": "public",
    "table_name": "report_cards",
    "policy_name": "report_cards_update_board_only",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "command": "UPDATE",
    "using_expression": "is_board()",
    "with_check_expression": "is_board()"
  },
  {
    "table_schema": "public",
    "table_name": "report_cards",
    "policy_name": "report_cards_update_center_referee_only",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "command": "UPDATE",
    "using_expression": "(EXISTS ( SELECT 1\n   FROM (match_reports mr\n     JOIN matches m ON ((m.id = mr.match_id)))\n  WHERE ((mr.id = report_cards.report_id) AND (m.center_referee_id = auth.uid()) AND (mr.submitted_by = auth.uid()) AND (mr.status = ANY (ARRAY['pending'::report_status, 'submitted'::report_status])))))",
    "with_check_expression": "(EXISTS ( SELECT 1\n   FROM (match_reports mr\n     JOIN matches m ON ((m.id = mr.match_id)))\n  WHERE ((mr.id = report_cards.report_id) AND (m.center_referee_id = auth.uid()) AND (mr.submitted_by = auth.uid()) AND (mr.status = ANY (ARRAY['pending'::report_status, 'submitted'::report_status])))))"
  },
  {
    "table_schema": "public",
    "table_name": "report_goals",
    "policy_name": "Allow delete report goals",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "command": "DELETE",
    "using_expression": "true",
    "with_check_expression": null
  },
  {
    "table_schema": "public",
    "table_name": "report_goals",
    "policy_name": "report_goals_insert_center_referee_only",
    "permissive": "PERMISSIVE",
    "roles": "{authenticated}",
    "command": "INSERT",
    "using_expression": null,
    "with_check_expression": "(EXISTS ( SELECT 1\n   FROM (matches m\n     JOIN match_reports mr ON ((mr.match_id = m.id)))\n  WHERE ((mr.id = report_goals.report_id) AND (m.center_referee_id = auth.uid()))))"
  },
  {
    "table_schema": "public",
    "table_name": "report_goals",
    "policy_name": "report_goals_select_board_all",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "command": "SELECT",
    "using_expression": "is_board()",
    "with_check_expression": null
  },
  {
    "table_schema": "public",
    "table_name": "report_goals",
    "policy_name": "report_goals_select_safe",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "command": "SELECT",
    "using_expression": "((report_id IN ( SELECT match_reports.id\n   FROM match_reports\n  WHERE (match_reports.submitted_by = auth.uid()))) OR is_board())",
    "with_check_expression": null
  },
  {
    "table_schema": "public",
    "table_name": "report_goals",
    "policy_name": "report_goals_update_board_only",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "command": "UPDATE",
    "using_expression": "is_board()",
    "with_check_expression": "is_board()"
  },
  {
    "table_schema": "public",
    "table_name": "report_goals",
    "policy_name": "report_goals_update_center_referee_only",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "command": "UPDATE",
    "using_expression": "(EXISTS ( SELECT 1\n   FROM (match_reports mr\n     JOIN matches m ON ((m.id = mr.match_id)))\n  WHERE ((mr.id = report_goals.report_id) AND (m.center_referee_id = auth.uid()) AND (mr.submitted_by = auth.uid()) AND (mr.status = ANY (ARRAY['pending'::report_status, 'submitted'::report_status])))))",
    "with_check_expression": "(EXISTS ( SELECT 1\n   FROM (match_reports mr\n     JOIN matches m ON ((m.id = mr.match_id)))\n  WHERE ((mr.id = report_goals.report_id) AND (m.center_referee_id = auth.uid()) AND (mr.submitted_by = auth.uid()) AND (mr.status = ANY (ARRAY['pending'::report_status, 'submitted'::report_status])))))"
  },
  {
    "table_schema": "public",
    "table_name": "report_injuries",
    "policy_name": "Allow delete report injuries",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "command": "DELETE",
    "using_expression": "true",
    "with_check_expression": null
  },
  {
    "table_schema": "public",
    "table_name": "report_injuries",
    "policy_name": "report_injuries_insert_center_referee_only",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "command": "INSERT",
    "using_expression": null,
    "with_check_expression": "(EXISTS ( SELECT 1\n   FROM (match_reports mr\n     JOIN matches m ON ((m.id = mr.match_id)))\n  WHERE ((mr.id = report_injuries.report_id) AND (m.center_referee_id = auth.uid()) AND (mr.submitted_by = auth.uid()) AND (mr.status = ANY (ARRAY['pending'::report_status, 'submitted'::report_status])))))"
  },
  {
    "table_schema": "public",
    "table_name": "report_injuries",
    "policy_name": "report_injuries_select_assigned_member",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "command": "SELECT",
    "using_expression": "(EXISTS ( SELECT 1\n   FROM (match_reports mr\n     JOIN matches m ON ((m.id = mr.match_id)))\n  WHERE ((mr.id = report_injuries.report_id) AND ((auth.uid() = m.center_referee_id) OR (auth.uid() = m.assistant_referee_1_id) OR (auth.uid() = m.assistant_referee_2_id)))))",
    "with_check_expression": null
  },
  {
    "table_schema": "public",
    "table_name": "report_injuries",
    "policy_name": "report_injuries_select_board_all",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "command": "SELECT",
    "using_expression": "is_board()",
    "with_check_expression": null
  },
  {
    "table_schema": "public",
    "table_name": "report_injuries",
    "policy_name": "report_injuries_update_board_only",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "command": "UPDATE",
    "using_expression": "is_board()",
    "with_check_expression": "is_board()"
  },
  {
    "table_schema": "public",
    "table_name": "report_injuries",
    "policy_name": "report_injuries_update_center_referee_only",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "command": "UPDATE",
    "using_expression": "(EXISTS ( SELECT 1\n   FROM (match_reports mr\n     JOIN matches m ON ((m.id = mr.match_id)))\n  WHERE ((mr.id = report_injuries.report_id) AND (m.center_referee_id = auth.uid()) AND (mr.submitted_by = auth.uid()) AND (mr.status = ANY (ARRAY['pending'::report_status, 'submitted'::report_status])))))",
    "with_check_expression": "(EXISTS ( SELECT 1\n   FROM (match_reports mr\n     JOIN matches m ON ((m.id = mr.match_id)))\n  WHERE ((mr.id = report_injuries.report_id) AND (m.center_referee_id = auth.uid()) AND (mr.submitted_by = auth.uid()) AND (mr.status = ANY (ARRAY['pending'::report_status, 'submitted'::report_status])))))"
  },
  {
    "table_schema": "tournaments",
    "table_name": "divisions",
    "policy_name": "Allow authenticated users to read divisions",
    "permissive": "PERMISSIVE",
    "roles": "{authenticated}",
    "command": "SELECT",
    "using_expression": "true",
    "with_check_expression": null
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_rosters",
    "policy_name": "Allow authenticated users to read match rosters",
    "permissive": "PERMISSIVE",
    "roles": "{authenticated}",
    "command": "SELECT",
    "using_expression": "true",
    "with_check_expression": null
  },
  {
    "table_schema": "tournaments",
    "table_name": "organizations",
    "policy_name": "Allow authenticated users to read organizations",
    "permissive": "PERMISSIVE",
    "roles": "{authenticated}",
    "command": "SELECT",
    "using_expression": "true",
    "with_check_expression": null
  },
  {
    "table_schema": "tournaments",
    "table_name": "players",
    "policy_name": "Allow authenticated users to read players",
    "permissive": "PERMISSIVE",
    "roles": "{authenticated}",
    "command": "SELECT",
    "using_expression": "true",
    "with_check_expression": null
  },
  {
    "table_schema": "tournaments",
    "table_name": "teams",
    "policy_name": "Allow authenticated users to read teams",
    "permissive": "PERMISSIVE",
    "roles": "{authenticated}",
    "command": "SELECT",
    "using_expression": "true",
    "with_check_expression": null
  }
]
```

---

## Policy Interpretation

Each row represents one Row Level Security policy.

Important fields:

- `table_schema` — schema containing the protected table.
- `table_name` — table protected by the policy.
- `policy_name` — policy identifier.
- `permissive` — whether the policy is permissive or restrictive.
- `roles` — PostgreSQL roles to which the policy applies.
- `command` — operation controlled by the policy.
- `using_expression` — expression controlling which existing rows can be accessed.
- `with_check_expression` — expression controlling which rows may be inserted or updated.

Common command values include:

- `SELECT`
- `INSERT`
- `UPDATE`
- `DELETE`
- `ALL`

---

## Audit Notes

RLS must be evaluated as a combination of:

```text
Table
  +
RLS enabled state
  +
Policies
  +
Roles
  +
USING / WITH CHECK expressions
  +
Application authentication model
```

A table with RLS enabled but no appropriate policy may become inaccessible to normal application users.

A table with overly broad policies may expose data unintentionally.

A table with RLS disabled may still be protected by server-side access patterns, but that must not be assumed without verification.

Service-role access is not equivalent to normal authenticated-user access and must be considered separately.

---

## Preliminary Observation

This inventory will later help identify:

- Tables with RLS enabled but no policies.
- Tables with policies but RLS disabled.
- Broad policies such as `true`.
- Member-scoped policies.
- Board/admin-scoped policies.
- Potential legacy policies attached to obsolete tables.
- Security differences between `public`, `development`, and `tournaments`.
- Tables that depend on server-only/service-role access.

No policy or table is classified as secure, insecure, active, or legacy from this inventory alone.

---

## Audit Status

**RLS inventory captured — security classification pending.**

No database changes were performed as part of this audit.