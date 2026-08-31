# Supabase Foreign Keys

## Purpose

Capture all foreign key relationships currently defined across the CAFLA application schemas.

Foreign keys are critical for understanding database dependencies before any cleanup, migration, or object removal is attempted.

---

## Scope

Schemas included:

- `public`
- `tournaments`
- `development`

Objects included:

- Foreign key constraints defined on tables in the audited schemas.

The referenced table may exist in the same schema or in another schema.

---

## Query

```sql
select
  tc.constraint_schema,
  tc.table_schema,
  tc.table_name,
  tc.constraint_name,
  kcu.column_name,
  ccu.table_schema as referenced_table_schema,
  ccu.table_name as referenced_table_name,
  ccu.column_name as referenced_column_name,
  rc.update_rule,
  rc.delete_rule
from information_schema.table_constraints tc
join information_schema.key_column_usage kcu
  on tc.constraint_name = kcu.constraint_name
 and tc.constraint_schema = kcu.constraint_schema
join information_schema.constraint_column_usage ccu
  on tc.constraint_name = ccu.constraint_name
 and tc.constraint_schema = ccu.constraint_schema
join information_schema.referential_constraints rc
  on tc.constraint_name = rc.constraint_name
 and tc.constraint_schema = rc.constraint_schema
where tc.constraint_type = 'FOREIGN KEY'
  and tc.table_schema in ('public', 'tournaments', 'development')
order by
  tc.table_schema,
  tc.table_name,
  tc.constraint_name,
  kcu.ordinal_position;
```

---

## Result

```json
[
  {
    "constraint_schema": "development",
    "table_schema": "development",
    "table_name": "attendance_records",
    "constraint_name": "attendance_records_member_id_fkey",
    "column_name": "member_id",
    "referenced_table_schema": "public",
    "referenced_table_name": "members",
    "referenced_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "CASCADE"
  },
  {
    "constraint_schema": "development",
    "table_schema": "development",
    "table_name": "attendance_records",
    "constraint_name": "attendance_records_recorded_by_fkey",
    "column_name": "recorded_by",
    "referenced_table_schema": "public",
    "referenced_table_name": "members",
    "referenced_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "SET NULL"
  },
  {
    "constraint_schema": "development",
    "table_schema": "development",
    "table_name": "attendance_records",
    "constraint_name": "attendance_records_session_id_fkey",
    "column_name": "session_id",
    "referenced_table_schema": "development",
    "referenced_table_name": "attendance_sessions",
    "referenced_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "CASCADE"
  },
  {
    "constraint_schema": "development",
    "table_schema": "development",
    "table_name": "attendance_scoring_rules",
    "constraint_name": "attendance_scoring_rules_cycle_id_fkey",
    "column_name": "cycle_id",
    "referenced_table_schema": "development",
    "referenced_table_name": "cycles",
    "referenced_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "CASCADE"
  },
  {
    "constraint_schema": "development",
    "table_schema": "development",
    "table_name": "attendance_sessions",
    "constraint_name": "attendance_sessions_completed_by_fkey",
    "column_name": "completed_by",
    "referenced_table_schema": "public",
    "referenced_table_name": "members",
    "referenced_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "NO ACTION"
  },
  {
    "constraint_schema": "development",
    "table_schema": "development",
    "table_name": "attendance_sessions",
    "constraint_name": "attendance_sessions_created_by_fkey",
    "column_name": "created_by",
    "referenced_table_schema": "public",
    "referenced_table_name": "members",
    "referenced_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "SET NULL"
  },
  {
    "constraint_schema": "development",
    "table_schema": "development",
    "table_name": "attendance_sessions",
    "constraint_name": "attendance_sessions_cycle_id_fkey",
    "column_name": "cycle_id",
    "referenced_table_schema": "development",
    "referenced_table_name": "cycles",
    "referenced_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "CASCADE"
  },
  {
    "constraint_schema": "development",
    "table_schema": "development",
    "table_name": "attendance_sessions",
    "constraint_name": "attendance_sessions_opened_by_fkey",
    "column_name": "opened_by",
    "referenced_table_schema": "public",
    "referenced_table_name": "members",
    "referenced_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "NO ACTION"
  },
  {
    "constraint_schema": "development",
    "table_schema": "development",
    "table_name": "current_ranking_snapshot",
    "constraint_name": "current_ranking_snapshot_cycle_fkey",
    "column_name": "cycle_id",
    "referenced_table_schema": "development",
    "referenced_table_name": "cycles",
    "referenced_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "CASCADE"
  },
  {
    "constraint_schema": "development",
    "table_schema": "development",
    "table_name": "current_ranking_snapshot",
    "constraint_name": "current_ranking_snapshot_cycle_member_fkey",
    "column_name": "cycle_member_id",
    "referenced_table_schema": "development",
    "referenced_table_name": "cycle_members",
    "referenced_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "CASCADE"
  },
  {
    "constraint_schema": "development",
    "table_schema": "development",
    "table_name": "current_ranking_snapshot",
    "constraint_name": "current_ranking_snapshot_member_fkey",
    "column_name": "member_id",
    "referenced_table_schema": "public",
    "referenced_table_name": "members",
    "referenced_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "CASCADE"
  },
  {
    "constraint_schema": "development",
    "table_schema": "development",
    "table_name": "cycle_members",
    "constraint_name": "cycle_members_created_by_fkey",
    "column_name": "created_by",
    "referenced_table_schema": "public",
    "referenced_table_name": "members",
    "referenced_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "SET NULL"
  },
  {
    "constraint_schema": "development",
    "table_schema": "development",
    "table_name": "cycle_members",
    "constraint_name": "cycle_members_cycle_id_fkey",
    "column_name": "cycle_id",
    "referenced_table_schema": "development",
    "referenced_table_name": "cycles",
    "referenced_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "CASCADE"
  },
  {
    "constraint_schema": "development",
    "table_schema": "development",
    "table_name": "cycle_members",
    "constraint_name": "cycle_members_member_id_fkey",
    "column_name": "member_id",
    "referenced_table_schema": "public",
    "referenced_table_name": "members",
    "referenced_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "CASCADE"
  },
  {
    "constraint_schema": "development",
    "table_schema": "development",
    "table_name": "cycles",
    "constraint_name": "cycles_closed_by_fkey",
    "column_name": "closed_by",
    "referenced_table_schema": "public",
    "referenced_table_name": "members",
    "referenced_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "SET NULL"
  },
  {
    "constraint_schema": "development",
    "table_schema": "development",
    "table_name": "cycles",
    "constraint_name": "cycles_created_by_fkey",
    "column_name": "created_by",
    "referenced_table_schema": "public",
    "referenced_table_name": "members",
    "referenced_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "SET NULL"
  },
  {
    "constraint_schema": "development",
    "table_schema": "development",
    "table_name": "monthly_ranking_snapshots",
    "constraint_name": "monthly_ranking_snapshots_cycle_fkey",
    "column_name": "cycle_id",
    "referenced_table_schema": "development",
    "referenced_table_name": "cycles",
    "referenced_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "CASCADE"
  },
  {
    "constraint_schema": "development",
    "table_schema": "development",
    "table_name": "monthly_ranking_snapshots",
    "constraint_name": "monthly_ranking_snapshots_cycle_member_fkey",
    "column_name": "cycle_member_id",
    "referenced_table_schema": "development",
    "referenced_table_name": "cycle_members",
    "referenced_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "CASCADE"
  },
  {
    "constraint_schema": "development",
    "table_schema": "development",
    "table_name": "monthly_ranking_snapshots",
    "constraint_name": "monthly_ranking_snapshots_member_fkey",
    "column_name": "member_id",
    "referenced_table_schema": "public",
    "referenced_table_name": "members",
    "referenced_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "CASCADE"
  },
  {
    "constraint_schema": "development",
    "table_schema": "development",
    "table_name": "quiz_access_grants",
    "constraint_name": "quiz_access_grants_assessment_id_fkey",
    "column_name": "assessment_id",
    "referenced_table_schema": "development",
    "referenced_table_name": "quiz_assessments",
    "referenced_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "CASCADE"
  },
  {
    "constraint_schema": "development",
    "table_schema": "development",
    "table_name": "quiz_access_grants",
    "constraint_name": "quiz_access_grants_granted_by_fkey",
    "column_name": "granted_by",
    "referenced_table_schema": "public",
    "referenced_table_name": "members",
    "referenced_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "NO ACTION"
  },
  {
    "constraint_schema": "development",
    "table_schema": "development",
    "table_name": "quiz_access_grants",
    "constraint_name": "quiz_access_grants_member_id_fkey",
    "column_name": "member_id",
    "referenced_table_schema": "public",
    "referenced_table_name": "members",
    "referenced_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "CASCADE"
  },
  {
    "constraint_schema": "development",
    "table_schema": "development",
    "table_name": "quiz_access_grants",
    "constraint_name": "quiz_access_grants_revoked_by_fkey",
    "column_name": "revoked_by",
    "referenced_table_schema": "public",
    "referenced_table_name": "members",
    "referenced_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "NO ACTION"
  },
  {
    "constraint_schema": "development",
    "table_schema": "development",
    "table_name": "quiz_answers",
    "constraint_name": "quiz_answers_attempt_id_fkey",
    "column_name": "attempt_id",
    "referenced_table_schema": "development",
    "referenced_table_name": "quiz_attempts",
    "referenced_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "CASCADE"
  },
  {
    "constraint_schema": "development",
    "table_schema": "development",
    "table_name": "quiz_answers",
    "constraint_name": "quiz_answers_attempt_question_id_fkey",
    "column_name": "attempt_question_id",
    "referenced_table_schema": "development",
    "referenced_table_name": "quiz_attempt_questions",
    "referenced_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "CASCADE"
  },
  {
    "constraint_schema": "development",
    "table_schema": "development",
    "table_name": "quiz_answers",
    "constraint_name": "quiz_answers_selected_option_id_fkey",
    "column_name": "selected_option_id",
    "referenced_table_schema": "development",
    "referenced_table_name": "quiz_question_options",
    "referenced_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "NO ACTION"
  },
  {
    "constraint_schema": "development",
    "table_schema": "development",
    "table_name": "quiz_assessments",
    "constraint_name": "quiz_assessments_archived_by_fkey",
    "column_name": "archived_by",
    "referenced_table_schema": "public",
    "referenced_table_name": "members",
    "referenced_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "NO ACTION"
  },
  {
    "constraint_schema": "development",
    "table_schema": "development",
    "table_name": "quiz_assessments",
    "constraint_name": "quiz_assessments_closed_by_fkey",
    "column_name": "closed_by",
    "referenced_table_schema": "public",
    "referenced_table_name": "members",
    "referenced_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "NO ACTION"
  },
  {
    "constraint_schema": "development",
    "table_schema": "development",
    "table_name": "quiz_assessments",
    "constraint_name": "quiz_assessments_created_by_fkey",
    "column_name": "created_by",
    "referenced_table_schema": "public",
    "referenced_table_name": "members",
    "referenced_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "NO ACTION"
  },
  {
    "constraint_schema": "development",
    "table_schema": "development",
    "table_name": "quiz_assessments",
    "constraint_name": "quiz_assessments_cycle_id_fkey",
    "column_name": "cycle_id",
    "referenced_table_schema": "development",
    "referenced_table_name": "cycles",
    "referenced_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "CASCADE"
  },
  {
    "constraint_schema": "development",
    "table_schema": "development",
    "table_name": "quiz_assessments",
    "constraint_name": "quiz_assessments_published_by_fkey",
    "column_name": "published_by",
    "referenced_table_schema": "public",
    "referenced_table_name": "members",
    "referenced_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "NO ACTION"
  },
  {
    "constraint_schema": "development",
    "table_schema": "development",
    "table_name": "quiz_attempt_questions",
    "constraint_name": "quiz_attempt_questions_attempt_id_fkey",
    "column_name": "attempt_id",
    "referenced_table_schema": "development",
    "referenced_table_name": "quiz_attempts",
    "referenced_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "CASCADE"
  },
  {
    "constraint_schema": "development",
    "table_schema": "development",
    "table_name": "quiz_attempt_questions",
    "constraint_name": "quiz_attempt_questions_question_group_id_fkey",
    "column_name": "question_group_id",
    "referenced_table_schema": "development",
    "referenced_table_name": "quiz_question_groups",
    "referenced_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "NO ACTION"
  },
  {
    "constraint_schema": "development",
    "table_schema": "development",
    "table_name": "quiz_attempt_questions",
    "constraint_name": "quiz_attempt_questions_question_id_fkey",
    "column_name": "question_id",
    "referenced_table_schema": "development",
    "referenced_table_name": "quiz_questions",
    "referenced_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "NO ACTION"
  },
  {
    "constraint_schema": "development",
    "table_schema": "development",
    "table_name": "quiz_attempts",
    "constraint_name": "quiz_attempts_assessment_id_fkey",
    "column_name": "assessment_id",
    "referenced_table_schema": "development",
    "referenced_table_name": "quiz_assessments",
    "referenced_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "NO ACTION"
  },
  {
    "constraint_schema": "development",
    "table_schema": "development",
    "table_name": "quiz_attempts",
    "constraint_name": "quiz_attempts_member_id_fkey",
    "column_name": "member_id",
    "referenced_table_schema": "public",
    "referenced_table_name": "members",
    "referenced_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "NO ACTION"
  },
  {
    "constraint_schema": "development",
    "table_schema": "development",
    "table_name": "quiz_attempts",
    "constraint_name": "quiz_attempts_version_id_fkey",
    "column_name": "version_id",
    "referenced_table_schema": "development",
    "referenced_table_name": "quiz_versions",
    "referenced_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "NO ACTION"
  },
  {
    "constraint_schema": "development",
    "table_schema": "development",
    "table_name": "quiz_question_groups",
    "constraint_name": "quiz_question_groups_assessment_id_fkey",
    "column_name": "assessment_id",
    "referenced_table_schema": "development",
    "referenced_table_name": "quiz_assessments",
    "referenced_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "CASCADE"
  },
  {
    "constraint_schema": "development",
    "table_schema": "development",
    "table_name": "quiz_question_groups",
    "constraint_name": "quiz_question_groups_invalidated_by_fkey",
    "column_name": "invalidated_by",
    "referenced_table_schema": "public",
    "referenced_table_name": "members",
    "referenced_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "NO ACTION"
  },
  {
    "constraint_schema": "development",
    "table_schema": "development",
    "table_name": "quiz_question_options",
    "constraint_name": "quiz_question_options_question_id_fkey",
    "column_name": "question_id",
    "referenced_table_schema": "development",
    "referenced_table_name": "quiz_questions",
    "referenced_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "CASCADE"
  },
  {
    "constraint_schema": "development",
    "table_schema": "development",
    "table_name": "quiz_questions",
    "constraint_name": "quiz_questions_question_group_id_fkey",
    "column_name": "question_group_id",
    "referenced_table_schema": "development",
    "referenced_table_name": "quiz_question_groups",
    "referenced_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "CASCADE"
  },
  {
    "constraint_schema": "development",
    "table_schema": "development",
    "table_name": "quiz_questions",
    "constraint_name": "quiz_questions_version_id_fkey",
    "column_name": "version_id",
    "referenced_table_schema": "development",
    "referenced_table_name": "quiz_versions",
    "referenced_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "CASCADE"
  },
  {
    "constraint_schema": "development",
    "table_schema": "development",
    "table_name": "quiz_versions",
    "constraint_name": "quiz_versions_assessment_id_fkey",
    "column_name": "assessment_id",
    "referenced_table_schema": "development",
    "referenced_table_name": "quiz_assessments",
    "referenced_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "CASCADE"
  },
  {
    "constraint_schema": "development",
    "table_schema": "development",
    "table_name": "scoring_periods",
    "constraint_name": "scoring_periods_created_by_fkey",
    "column_name": "created_by",
    "referenced_table_schema": "public",
    "referenced_table_name": "members",
    "referenced_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "NO ACTION"
  },
  {
    "constraint_schema": "public",
    "table_schema": "public",
    "table_name": "arbiter_referees",
    "constraint_name": "arbiter_referees_member_id_fkey",
    "column_name": "member_id",
    "referenced_table_schema": "public",
    "referenced_table_name": "members",
    "referenced_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "SET NULL"
  },
  {
    "constraint_schema": "public",
    "table_schema": "public",
    "table_name": "attendance_records",
    "constraint_name": "attendance_records_member_id_fkey",
    "column_name": "member_id",
    "referenced_table_schema": "public",
    "referenced_table_name": "members",
    "referenced_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "CASCADE"
  },
  {
    "constraint_schema": "public",
    "table_schema": "public",
    "table_name": "attendance_records",
    "constraint_name": "attendance_records_session_id_fkey",
    "column_name": "session_id",
    "referenced_table_schema": "public",
    "referenced_table_name": "attendance_sessions",
    "referenced_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "CASCADE"
  },
  {
    "constraint_schema": "public",
    "table_schema": "public",
    "table_name": "attendance_sessions",
    "constraint_name": "attendance_sessions_created_by_fkey",
    "column_name": "created_by",
    "referenced_table_schema": "public",
    "referenced_table_name": "members",
    "referenced_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "NO ACTION"
  },
  {
    "constraint_schema": "public",
    "table_schema": "public",
    "table_name": "evaluations",
    "constraint_name": "evaluations_evaluated_id_fkey",
    "column_name": "evaluated_id",
    "referenced_table_schema": "public",
    "referenced_table_name": "members",
    "referenced_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "NO ACTION"
  },
  {
    "constraint_schema": "public",
    "table_schema": "public",
    "table_name": "evaluations",
    "constraint_name": "evaluations_evaluator_id_fkey",
    "column_name": "evaluator_id",
    "referenced_table_schema": "public",
    "referenced_table_name": "members",
    "referenced_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "NO ACTION"
  },
  {
    "constraint_schema": "public",
    "table_schema": "public",
    "table_name": "evaluations",
    "constraint_name": "evaluations_match_id_fkey",
    "column_name": "match_id",
    "referenced_table_schema": "public",
    "referenced_table_name": "matches",
    "referenced_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "CASCADE"
  },
  {
    "constraint_schema": "public",
    "table_schema": "public",
    "table_name": "match_reports",
    "constraint_name": "match_reports_match_id_fkey",
    "column_name": "match_id",
    "referenced_table_schema": "public",
    "referenced_table_name": "matches",
    "referenced_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "CASCADE"
  },
  {
    "constraint_schema": "public",
    "table_schema": "public",
    "table_name": "match_reports",
    "constraint_name": "match_reports_submitted_by_fkey",
    "column_name": "submitted_by",
    "referenced_table_schema": "public",
    "referenced_table_name": "members",
    "referenced_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "NO ACTION"
  },
  {
    "constraint_schema": "public",
    "table_schema": "public",
    "table_name": "matches",
    "constraint_name": "matches_assistant_referee_1_id_fkey",
    "column_name": "assistant_referee_1_id",
    "referenced_table_schema": "public",
    "referenced_table_name": "members",
    "referenced_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "NO ACTION"
  },
  {
    "constraint_schema": "public",
    "table_schema": "public",
    "table_name": "matches",
    "constraint_name": "matches_assistant_referee_2_id_fkey",
    "column_name": "assistant_referee_2_id",
    "referenced_table_schema": "public",
    "referenced_table_name": "members",
    "referenced_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "NO ACTION"
  },
  {
    "constraint_schema": "public",
    "table_schema": "public",
    "table_name": "matches",
    "constraint_name": "matches_center_referee_id_fkey",
    "column_name": "center_referee_id",
    "referenced_table_schema": "public",
    "referenced_table_name": "members",
    "referenced_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "NO ACTION"
  },
  {
    "constraint_schema": "public",
    "table_schema": "public",
    "table_name": "matches",
    "constraint_name": "matches_tournament_division_season_id_fkey",
    "column_name": "tournament_division_season_id",
    "referenced_table_schema": "tournaments",
    "referenced_table_name": "division_seasons",
    "referenced_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "SET NULL"
  },
  {
    "constraint_schema": "public",
    "table_schema": "public",
    "table_name": "quiz_answers",
    "constraint_name": "quiz_answers_attempt_id_fkey",
    "column_name": "attempt_id",
    "referenced_table_schema": "public",
    "referenced_table_name": "quiz_attempts",
    "referenced_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "CASCADE"
  },
  {
    "constraint_schema": "public",
    "table_schema": "public",
    "table_name": "quiz_answers",
    "constraint_name": "quiz_answers_question_id_fkey",
    "column_name": "question_id",
    "referenced_table_schema": "public",
    "referenced_table_name": "quiz_questions",
    "referenced_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "CASCADE"
  },
  {
    "constraint_schema": "public",
    "table_schema": "public",
    "table_name": "quiz_attempts",
    "constraint_name": "quiz_attempts_member_id_fkey",
    "column_name": "member_id",
    "referenced_table_schema": "public",
    "referenced_table_name": "members",
    "referenced_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "NO ACTION"
  },
  {
    "constraint_schema": "public",
    "table_schema": "public",
    "table_name": "quiz_attempts",
    "constraint_name": "quiz_attempts_quiz_id_fkey",
    "column_name": "quiz_id",
    "referenced_table_schema": "public",
    "referenced_table_name": "quizzes",
    "referenced_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "NO ACTION"
  },
  {
    "constraint_schema": "public",
    "table_schema": "public",
    "table_name": "quiz_questions",
    "constraint_name": "quiz_questions_quiz_id_fkey",
    "column_name": "quiz_id",
    "referenced_table_schema": "public",
    "referenced_table_name": "quizzes",
    "referenced_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "CASCADE"
  },
  {
    "constraint_schema": "public",
    "table_schema": "public",
    "table_name": "quizzes",
    "constraint_name": "quizzes_created_by_fkey",
    "column_name": "created_by",
    "referenced_table_schema": "public",
    "referenced_table_name": "members",
    "referenced_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "NO ACTION"
  },
  {
    "constraint_schema": "public",
    "table_schema": "public",
    "table_name": "ranking_history",
    "constraint_name": "ranking_history_member_id_fkey",
    "column_name": "member_id",
    "referenced_table_schema": "public",
    "referenced_table_name": "members",
    "referenced_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "NO ACTION"
  },
  {
    "constraint_schema": "public",
    "table_schema": "public",
    "table_name": "report_assets",
    "constraint_name": "report_assets_report_id_fkey",
    "column_name": "report_id",
    "referenced_table_schema": "public",
    "referenced_table_name": "match_reports",
    "referenced_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "CASCADE"
  },
  {
    "constraint_schema": "public",
    "table_schema": "public",
    "table_name": "report_cards",
    "constraint_name": "fk_report_cards_reason",
    "column_name": "reason_code",
    "referenced_table_schema": "public",
    "referenced_table_name": "card_reasons",
    "referenced_column_name": "code",
    "update_rule": "NO ACTION",
    "delete_rule": "NO ACTION"
  },
  {
    "constraint_schema": "public",
    "table_schema": "public",
    "table_name": "report_cards",
    "constraint_name": "report_cards_report_id_fkey",
    "column_name": "report_id",
    "referenced_table_schema": "public",
    "referenced_table_name": "match_reports",
    "referenced_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "CASCADE"
  },
  {
    "constraint_schema": "public",
    "table_schema": "public",
    "table_name": "report_goals",
    "constraint_name": "report_goals_report_id_fkey",
    "column_name": "report_id",
    "referenced_table_schema": "public",
    "referenced_table_name": "match_reports",
    "referenced_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "CASCADE"
  },
  {
    "constraint_schema": "public",
    "table_schema": "public",
    "table_name": "report_injuries",
    "constraint_name": "report_injuries_report_id_fkey",
    "column_name": "report_id",
    "referenced_table_schema": "public",
    "referenced_table_name": "match_reports",
    "referenced_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "CASCADE"
  },
  {
    "constraint_schema": "tournaments",
    "table_schema": "tournaments",
    "table_name": "division_seasons",
    "constraint_name": "division_seasons_division_id_fkey",
    "column_name": "division_id",
    "referenced_table_schema": "tournaments",
    "referenced_table_name": "divisions",
    "referenced_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "CASCADE"
  },
  {
    "constraint_schema": "tournaments",
    "table_schema": "tournaments",
    "table_name": "division_seasons",
    "constraint_name": "division_seasons_season_id_fkey",
    "column_name": "season_id",
    "referenced_table_schema": "tournaments",
    "referenced_table_name": "seasons",
    "referenced_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "CASCADE"
  },
  {
    "constraint_schema": "tournaments",
    "table_schema": "tournaments",
    "table_name": "divisions",
    "constraint_name": "divisions_organization_id_fkey",
    "column_name": "organization_id",
    "referenced_table_schema": "tournaments",
    "referenced_table_name": "organizations",
    "referenced_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "CASCADE"
  },
  {
    "constraint_schema": "tournaments",
    "table_schema": "tournaments",
    "table_name": "match_context",
    "constraint_name": "match_context_away_team_registration_id_fkey",
    "column_name": "away_team_registration_id",
    "referenced_table_schema": "tournaments",
    "referenced_table_name": "team_registrations",
    "referenced_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "RESTRICT"
  },
  {
    "constraint_schema": "tournaments",
    "table_schema": "tournaments",
    "table_name": "match_context",
    "constraint_name": "match_context_division_season_id_fkey",
    "column_name": "division_season_id",
    "referenced_table_schema": "tournaments",
    "referenced_table_name": "division_seasons",
    "referenced_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "RESTRICT"
  },
  {
    "constraint_schema": "tournaments",
    "table_schema": "tournaments",
    "table_name": "match_context",
    "constraint_name": "match_context_home_team_registration_id_fkey",
    "column_name": "home_team_registration_id",
    "referenced_table_schema": "tournaments",
    "referenced_table_name": "team_registrations",
    "referenced_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "RESTRICT"
  },
  {
    "constraint_schema": "tournaments",
    "table_schema": "tournaments",
    "table_name": "match_context",
    "constraint_name": "match_context_match_id_fkey",
    "column_name": "match_id",
    "referenced_table_schema": "public",
    "referenced_table_name": "matches",
    "referenced_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "CASCADE"
  },
  {
    "constraint_schema": "tournaments",
    "table_schema": "tournaments",
    "table_name": "match_context_logs",
    "constraint_name": "match_context_logs_match_id_fkey",
    "column_name": "match_id",
    "referenced_table_schema": "public",
    "referenced_table_name": "matches",
    "referenced_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "CASCADE"
  },
  {
    "constraint_schema": "tournaments",
    "table_schema": "tournaments",
    "table_name": "match_rosters",
    "constraint_name": "match_rosters_match_id_fkey",
    "column_name": "match_id",
    "referenced_table_schema": "public",
    "referenced_table_name": "matches",
    "referenced_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "CASCADE"
  },
  {
    "constraint_schema": "tournaments",
    "table_schema": "tournaments",
    "table_name": "match_rosters",
    "constraint_name": "match_rosters_player_id_fkey",
    "column_name": "player_id",
    "referenced_table_schema": "tournaments",
    "referenced_table_name": "players",
    "referenced_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "CASCADE"
  },
  {
    "constraint_schema": "tournaments",
    "table_schema": "tournaments",
    "table_name": "match_rosters",
    "constraint_name": "match_rosters_team_id_fkey",
    "column_name": "team_id",
    "referenced_table_schema": "tournaments",
    "referenced_table_name": "teams",
    "referenced_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "CASCADE"
  },
  {
    "constraint_schema": "tournaments",
    "table_schema": "tournaments",
    "table_name": "player_registrations",
    "constraint_name": "player_registrations_player_id_fkey",
    "column_name": "player_id",
    "referenced_table_schema": "tournaments",
    "referenced_table_name": "players",
    "referenced_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "CASCADE"
  },
  {
    "constraint_schema": "tournaments",
    "table_schema": "tournaments",
    "table_name": "player_registrations",
    "constraint_name": "player_registrations_team_registration_id_fkey",
    "column_name": "team_registration_id",
    "referenced_table_schema": "tournaments",
    "referenced_table_name": "team_registrations",
    "referenced_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "CASCADE"
  },
  {
    "constraint_schema": "tournaments",
    "table_schema": "tournaments",
    "table_name": "players",
    "constraint_name": "players_organization_id_fkey",
    "column_name": "organization_id",
    "referenced_table_schema": "tournaments",
    "referenced_table_name": "organizations",
    "referenced_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "CASCADE"
  },
  {
    "constraint_schema": "tournaments",
    "table_schema": "tournaments",
    "table_name": "seasons",
    "constraint_name": "seasons_organization_id_fkey",
    "column_name": "organization_id",
    "referenced_table_schema": "tournaments",
    "referenced_table_name": "organizations",
    "referenced_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "CASCADE"
  },
  {
    "constraint_schema": "tournaments",
    "table_schema": "tournaments",
    "table_name": "team_registrations",
    "constraint_name": "team_registrations_division_season_id_fkey",
    "column_name": "division_season_id",
    "referenced_table_schema": "tournaments",
    "referenced_table_name": "division_seasons",
    "referenced_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "CASCADE"
  },
  {
    "constraint_schema": "tournaments",
    "table_schema": "tournaments",
    "table_name": "team_registrations",
    "constraint_name": "team_registrations_team_id_fkey",
    "column_name": "team_id",
    "referenced_table_schema": "tournaments",
    "referenced_table_name": "teams",
    "referenced_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "CASCADE"
  },
  {
    "constraint_schema": "tournaments",
    "table_schema": "tournaments",
    "table_name": "teams",
    "constraint_name": "teams_organization_id_fkey",
    "column_name": "organization_id",
    "referenced_table_schema": "tournaments",
    "referenced_table_name": "organizations",
    "referenced_column_name": "id",
    "update_rule": "NO ACTION",
    "delete_rule": "CASCADE"
  }
]
```

---

## Result Interpretation

Each row represents a foreign key relationship between a source column and a referenced column.

Important fields:

- `table_schema` — schema containing the dependent table.
- `table_name` — table containing the foreign key.
- `constraint_name` — PostgreSQL foreign key constraint name.
- `column_name` — dependent column.
- `referenced_table_schema` — schema containing the referenced table.
- `referenced_table_name` — referenced parent table.
- `referenced_column_name` — referenced parent column.
- `update_rule` — behavior when the referenced key changes.
- `delete_rule` — behavior when the referenced row is deleted.

Common delete/update rules may include:

- `NO ACTION`
- `RESTRICT`
- `CASCADE`
- `SET NULL`
- `SET DEFAULT`

---

## Audit Notes

Foreign keys are one of the strongest indicators of database-level dependency.

However, the absence of a foreign key does not mean two objects are unrelated.

Relationships may also exist through:

- Views
- Functions/RPCs
- Triggers
- Application code
- Manually managed identifiers
- External integrations

Before dropping any table, all inbound and outbound dependencies must be reviewed.

---

## Preliminary Observation

This inventory will be used to identify:

- Cross-schema relationships.
- Core identity tables referenced by multiple modules.
- Tables that cannot be removed without migration.
- Legacy tables that are still structurally connected.
- Cascading delete risks.

No foreign key is considered obsolete based on this inventory alone.

---

## Audit Status

**Foreign key inventory captured — classification pending.**

No database changes were performed as part of this audit.