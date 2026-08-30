# Supabase Indexes

## Purpose

Capture the indexes currently defined on CAFLA database tables.

Indexes are part of the physical database architecture and may support:

- Primary keys
- Unique constraints
- Foreign key access patterns
- Query performance
- Filtering and sorting
- Partial or expression-based query optimization

This inventory will help distinguish structural indexes from performance-oriented indexes during the database cleanup audit.

---

## Scope

Schemas included:

- `public`
- `tournaments`
- `development`

Index metadata captured:

- Schema
- Table
- Index name
- Full PostgreSQL index definition

---

## Query

```sql
select
  schemaname as table_schema,
  tablename as table_name,
  indexname as index_name,
  indexdef as index_definition
from pg_indexes
where schemaname in ('public', 'tournaments', 'development')
order by
  schemaname,
  tablename,
  indexname;
```

---

## Result

```json
[
  {
    "table_schema": "development",
    "table_name": "attendance_records",
    "index_name": "attendance_records_pkey",
    "index_definition": "CREATE UNIQUE INDEX attendance_records_pkey ON development.attendance_records USING btree (id)"
  },
  {
    "table_schema": "development",
    "table_name": "attendance_records",
    "index_name": "development_attendance_records_member_idx",
    "index_definition": "CREATE INDEX development_attendance_records_member_idx ON development.attendance_records USING btree (member_id)"
  },
  {
    "table_schema": "development",
    "table_name": "attendance_records",
    "index_name": "development_attendance_records_session_status_idx",
    "index_definition": "CREATE INDEX development_attendance_records_session_status_idx ON development.attendance_records USING btree (session_id, status)"
  },
  {
    "table_schema": "development",
    "table_name": "attendance_records",
    "index_name": "development_attendance_session_member_unique",
    "index_definition": "CREATE UNIQUE INDEX development_attendance_session_member_unique ON development.attendance_records USING btree (session_id, member_id)"
  },
  {
    "table_schema": "development",
    "table_name": "attendance_scoring_rules",
    "index_name": "attendance_scoring_rules_cycle_idx",
    "index_definition": "CREATE INDEX attendance_scoring_rules_cycle_idx ON development.attendance_scoring_rules USING btree (cycle_id)"
  },
  {
    "table_schema": "development",
    "table_name": "attendance_scoring_rules",
    "index_name": "attendance_scoring_rules_cycle_unique",
    "index_definition": "CREATE UNIQUE INDEX attendance_scoring_rules_cycle_unique ON development.attendance_scoring_rules USING btree (cycle_id)"
  },
  {
    "table_schema": "development",
    "table_name": "attendance_scoring_rules",
    "index_name": "attendance_scoring_rules_pkey",
    "index_definition": "CREATE UNIQUE INDEX attendance_scoring_rules_pkey ON development.attendance_scoring_rules USING btree (id)"
  },
  {
    "table_schema": "development",
    "table_name": "attendance_sessions",
    "index_name": "attendance_sessions_pkey",
    "index_definition": "CREATE UNIQUE INDEX attendance_sessions_pkey ON development.attendance_sessions USING btree (id)"
  },
  {
    "table_schema": "development",
    "table_name": "attendance_sessions",
    "index_name": "development_attendance_sessions_cycle_date_idx",
    "index_definition": "CREATE INDEX development_attendance_sessions_cycle_date_idx ON development.attendance_sessions USING btree (cycle_id, scheduled_at)"
  },
  {
    "table_schema": "development",
    "table_name": "attendance_sessions",
    "index_name": "development_attendance_sessions_status_idx",
    "index_definition": "CREATE INDEX development_attendance_sessions_status_idx ON development.attendance_sessions USING btree (cycle_id, status, counts_for_score)"
  },
  {
    "table_schema": "development",
    "table_name": "current_ranking_snapshot",
    "index_name": "current_ranking_snapshot_member_idx",
    "index_definition": "CREATE INDEX current_ranking_snapshot_member_idx ON development.current_ranking_snapshot USING btree (member_id)"
  },
  {
    "table_schema": "development",
    "table_name": "current_ranking_snapshot",
    "index_name": "current_ranking_snapshot_pkey",
    "index_definition": "CREATE UNIQUE INDEX current_ranking_snapshot_pkey ON development.current_ranking_snapshot USING btree (cycle_id, member_id)"
  },
  {
    "table_schema": "development",
    "table_name": "current_ranking_snapshot",
    "index_name": "current_ranking_snapshot_rank_idx",
    "index_definition": "CREATE INDEX current_ranking_snapshot_rank_idx ON development.current_ranking_snapshot USING btree (cycle_id, ranking_position)"
  },
  {
    "table_schema": "development",
    "table_name": "current_ranking_snapshot",
    "index_name": "current_ranking_snapshot_refreshed_idx",
    "index_definition": "CREATE INDEX current_ranking_snapshot_refreshed_idx ON development.current_ranking_snapshot USING btree (cycle_id, refreshed_at)"
  },
  {
    "table_schema": "development",
    "table_name": "cycle_members",
    "index_name": "cycle_members_pkey",
    "index_definition": "CREATE UNIQUE INDEX cycle_members_pkey ON development.cycle_members USING btree (id)"
  },
  {
    "table_schema": "development",
    "table_name": "cycle_members",
    "index_name": "development_cycle_member_unique",
    "index_definition": "CREATE UNIQUE INDEX development_cycle_member_unique ON development.cycle_members USING btree (cycle_id, member_id)"
  },
  {
    "table_schema": "development",
    "table_name": "cycle_members",
    "index_name": "development_cycle_members_cycle_idx",
    "index_definition": "CREATE INDEX development_cycle_members_cycle_idx ON development.cycle_members USING btree (cycle_id, status)"
  },
  {
    "table_schema": "development",
    "table_name": "cycle_members",
    "index_name": "development_cycle_members_member_idx",
    "index_definition": "CREATE INDEX development_cycle_members_member_idx ON development.cycle_members USING btree (member_id, cycle_id)"
  },
  {
    "table_schema": "development",
    "table_name": "cycles",
    "index_name": "cycles_pkey",
    "index_definition": "CREATE UNIQUE INDEX cycles_pkey ON development.cycles USING btree (id)"
  },
  {
    "table_schema": "development",
    "table_name": "cycles",
    "index_name": "development_cycles_name_unique",
    "index_definition": "CREATE UNIQUE INDEX development_cycles_name_unique ON development.cycles USING btree (name)"
  },
  {
    "table_schema": "development",
    "table_name": "cycles",
    "index_name": "development_cycles_status_dates_idx",
    "index_definition": "CREATE INDEX development_cycles_status_dates_idx ON development.cycles USING btree (status, start_date, end_date)"
  },
  {
    "table_schema": "development",
    "table_name": "cycles",
    "index_name": "development_one_active_cycle_unique",
    "index_definition": "CREATE UNIQUE INDEX development_one_active_cycle_unique ON development.cycles USING btree (status) WHERE (status = 'active'::development.cycle_status)"
  },
  {
    "table_schema": "development",
    "table_name": "monthly_ranking_snapshots",
    "index_name": "monthly_ranking_snapshots_cycle_member_month_unique",
    "index_definition": "CREATE UNIQUE INDEX monthly_ranking_snapshots_cycle_member_month_unique ON development.monthly_ranking_snapshots USING btree (cycle_id, member_id, month_start)"
  },
  {
    "table_schema": "development",
    "table_name": "monthly_ranking_snapshots",
    "index_name": "monthly_ranking_snapshots_cycle_rank_idx",
    "index_definition": "CREATE INDEX monthly_ranking_snapshots_cycle_rank_idx ON development.monthly_ranking_snapshots USING btree (cycle_id, month_start, ranking_position)"
  },
  {
    "table_schema": "development",
    "table_name": "monthly_ranking_snapshots",
    "index_name": "monthly_ranking_snapshots_cycle_snapshot_idx",
    "index_definition": "CREATE INDEX monthly_ranking_snapshots_cycle_snapshot_idx ON development.monthly_ranking_snapshots USING btree (cycle_id, snapshot_date)"
  },
  {
    "table_schema": "development",
    "table_name": "monthly_ranking_snapshots",
    "index_name": "monthly_ranking_snapshots_member_idx",
    "index_definition": "CREATE INDEX monthly_ranking_snapshots_member_idx ON development.monthly_ranking_snapshots USING btree (member_id, month_start)"
  },
  {
    "table_schema": "development",
    "table_name": "monthly_ranking_snapshots",
    "index_name": "monthly_ranking_snapshots_pkey",
    "index_definition": "CREATE UNIQUE INDEX monthly_ranking_snapshots_pkey ON development.monthly_ranking_snapshots USING btree (id)"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_access_grants",
    "index_name": "quiz_access_grants_lookup_idx",
    "index_definition": "CREATE INDEX quiz_access_grants_lookup_idx ON development.quiz_access_grants USING btree (assessment_id, member_id, available_until)"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_access_grants",
    "index_name": "quiz_access_grants_pkey",
    "index_definition": "CREATE UNIQUE INDEX quiz_access_grants_pkey ON development.quiz_access_grants USING btree (id)"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_answers",
    "index_name": "quiz_answers_attempt_idx",
    "index_definition": "CREATE INDEX quiz_answers_attempt_idx ON development.quiz_answers USING btree (attempt_id)"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_answers",
    "index_name": "quiz_answers_attempt_question_unique",
    "index_definition": "CREATE UNIQUE INDEX quiz_answers_attempt_question_unique ON development.quiz_answers USING btree (attempt_id, attempt_question_id)"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_answers",
    "index_name": "quiz_answers_pkey",
    "index_definition": "CREATE UNIQUE INDEX quiz_answers_pkey ON development.quiz_answers USING btree (id)"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_assessments",
    "index_name": "quiz_assessments_cycle_idx",
    "index_definition": "CREATE INDEX quiz_assessments_cycle_idx ON development.quiz_assessments USING btree (cycle_id)"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_assessments",
    "index_name": "quiz_assessments_pkey",
    "index_definition": "CREATE UNIQUE INDEX quiz_assessments_pkey ON development.quiz_assessments USING btree (id)"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_assessments",
    "index_name": "quiz_assessments_status_idx",
    "index_definition": "CREATE INDEX quiz_assessments_status_idx ON development.quiz_assessments USING btree (status)"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_assessments",
    "index_name": "quiz_assessments_window_idx",
    "index_definition": "CREATE INDEX quiz_assessments_window_idx ON development.quiz_assessments USING btree (open_from, open_until)"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_attempt_questions",
    "index_name": "quiz_attempt_questions_attempt_idx",
    "index_definition": "CREATE INDEX quiz_attempt_questions_attempt_idx ON development.quiz_attempt_questions USING btree (attempt_id)"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_attempt_questions",
    "index_name": "quiz_attempt_questions_group_unique",
    "index_definition": "CREATE UNIQUE INDEX quiz_attempt_questions_group_unique ON development.quiz_attempt_questions USING btree (attempt_id, question_group_id)"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_attempt_questions",
    "index_name": "quiz_attempt_questions_pkey",
    "index_definition": "CREATE UNIQUE INDEX quiz_attempt_questions_pkey ON development.quiz_attempt_questions USING btree (id)"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_attempt_questions",
    "index_name": "quiz_attempt_questions_position_unique",
    "index_definition": "CREATE UNIQUE INDEX quiz_attempt_questions_position_unique ON development.quiz_attempt_questions USING btree (attempt_id, display_position)"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_attempts",
    "index_name": "quiz_attempts_active_lookup_idx",
    "index_definition": "CREATE INDEX quiz_attempts_active_lookup_idx ON development.quiz_attempts USING btree (assessment_id, member_id) WHERE (status = 'in_progress'::development.quiz_attempt_status)"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_attempts",
    "index_name": "quiz_attempts_assessment_idx",
    "index_definition": "CREATE INDEX quiz_attempts_assessment_idx ON development.quiz_attempts USING btree (assessment_id)"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_attempts",
    "index_name": "quiz_attempts_assessment_member_status_idx",
    "index_definition": "CREATE INDEX quiz_attempts_assessment_member_status_idx ON development.quiz_attempts USING btree (assessment_id, member_id, status)"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_attempts",
    "index_name": "quiz_attempts_member_idx",
    "index_definition": "CREATE INDEX quiz_attempts_member_idx ON development.quiz_attempts USING btree (member_id)"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_attempts",
    "index_name": "quiz_attempts_member_number_unique",
    "index_definition": "CREATE UNIQUE INDEX quiz_attempts_member_number_unique ON development.quiz_attempts USING btree (assessment_id, member_id, attempt_number)"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_attempts",
    "index_name": "quiz_attempts_one_active_per_member_idx",
    "index_definition": "CREATE UNIQUE INDEX quiz_attempts_one_active_per_member_idx ON development.quiz_attempts USING btree (assessment_id, member_id) WHERE (status = 'in_progress'::development.quiz_attempt_status)"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_attempts",
    "index_name": "quiz_attempts_pkey",
    "index_definition": "CREATE UNIQUE INDEX quiz_attempts_pkey ON development.quiz_attempts USING btree (id)"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_attempts",
    "index_name": "quiz_attempts_status_idx",
    "index_definition": "CREATE INDEX quiz_attempts_status_idx ON development.quiz_attempts USING btree (status)"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_question_groups",
    "index_name": "quiz_question_groups_assessment_idx",
    "index_definition": "CREATE INDEX quiz_question_groups_assessment_idx ON development.quiz_question_groups USING btree (assessment_id)"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_question_groups",
    "index_name": "quiz_question_groups_pkey",
    "index_definition": "CREATE UNIQUE INDEX quiz_question_groups_pkey ON development.quiz_question_groups USING btree (id)"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_question_options",
    "index_name": "quiz_options_correct_lookup_idx",
    "index_definition": "CREATE INDEX quiz_options_correct_lookup_idx ON development.quiz_question_options USING btree (question_id, is_correct)"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_question_options",
    "index_name": "quiz_question_options_pkey",
    "index_definition": "CREATE UNIQUE INDEX quiz_question_options_pkey ON development.quiz_question_options USING btree (id)"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_question_options",
    "index_name": "quiz_question_options_position_unique",
    "index_definition": "CREATE UNIQUE INDEX quiz_question_options_position_unique ON development.quiz_question_options USING btree (question_id, \"position\")"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_question_options",
    "index_name": "quiz_question_options_question_idx",
    "index_definition": "CREATE INDEX quiz_question_options_question_idx ON development.quiz_question_options USING btree (question_id)"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_questions",
    "index_name": "quiz_questions_group_idx",
    "index_definition": "CREATE INDEX quiz_questions_group_idx ON development.quiz_questions USING btree (question_group_id)"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_questions",
    "index_name": "quiz_questions_group_version_unique",
    "index_definition": "CREATE UNIQUE INDEX quiz_questions_group_version_unique ON development.quiz_questions USING btree (question_group_id, version_id)"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_questions",
    "index_name": "quiz_questions_pkey",
    "index_definition": "CREATE UNIQUE INDEX quiz_questions_pkey ON development.quiz_questions USING btree (id)"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_questions",
    "index_name": "quiz_questions_version_group_idx",
    "index_definition": "CREATE INDEX quiz_questions_version_group_idx ON development.quiz_questions USING btree (version_id, question_group_id)"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_questions",
    "index_name": "quiz_questions_version_idx",
    "index_definition": "CREATE INDEX quiz_questions_version_idx ON development.quiz_questions USING btree (version_id)"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_versions",
    "index_name": "quiz_versions_assessment_idx",
    "index_definition": "CREATE INDEX quiz_versions_assessment_idx ON development.quiz_versions USING btree (assessment_id)"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_versions",
    "index_name": "quiz_versions_assessment_language_unique",
    "index_definition": "CREATE UNIQUE INDEX quiz_versions_assessment_language_unique ON development.quiz_versions USING btree (assessment_id, language)"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_versions",
    "index_name": "quiz_versions_pkey",
    "index_definition": "CREATE UNIQUE INDEX quiz_versions_pkey ON development.quiz_versions USING btree (id)"
  },
  {
    "table_schema": "development",
    "table_name": "scoring_periods",
    "index_name": "scoring_periods_pkey",
    "index_definition": "CREATE UNIQUE INDEX scoring_periods_pkey ON development.scoring_periods USING btree (id)"
  },
  {
    "table_schema": "public",
    "table_name": "arbiter_referees",
    "index_name": "arbiter_referees_arbiter_name_key",
    "index_definition": "CREATE UNIQUE INDEX arbiter_referees_arbiter_name_key ON public.arbiter_referees USING btree (arbiter_name)"
  },
  {
    "table_schema": "public",
    "table_name": "arbiter_referees",
    "index_name": "arbiter_referees_name_idx",
    "index_definition": "CREATE INDEX arbiter_referees_name_idx ON public.arbiter_referees USING btree (arbiter_name)"
  },
  {
    "table_schema": "public",
    "table_name": "arbiter_referees",
    "index_name": "arbiter_referees_pkey",
    "index_definition": "CREATE UNIQUE INDEX arbiter_referees_pkey ON public.arbiter_referees USING btree (id)"
  },
  {
    "table_schema": "public",
    "table_name": "attendance_records",
    "index_name": "attendance_records_pkey",
    "index_definition": "CREATE UNIQUE INDEX attendance_records_pkey ON public.attendance_records USING btree (id)"
  },
  {
    "table_schema": "public",
    "table_name": "attendance_records",
    "index_name": "attendance_session_member_unique",
    "index_definition": "CREATE UNIQUE INDEX attendance_session_member_unique ON public.attendance_records USING btree (session_id, member_id)"
  },
  {
    "table_schema": "public",
    "table_name": "attendance_records",
    "index_name": "idx_attendance_member",
    "index_definition": "CREATE INDEX idx_attendance_member ON public.attendance_records USING btree (member_id)"
  },
  {
    "table_schema": "public",
    "table_name": "attendance_sessions",
    "index_name": "attendance_sessions_pkey",
    "index_definition": "CREATE UNIQUE INDEX attendance_sessions_pkey ON public.attendance_sessions USING btree (id)"
  },
  {
    "table_schema": "public",
    "table_name": "card_reasons",
    "index_name": "card_reasons_code_key",
    "index_definition": "CREATE UNIQUE INDEX card_reasons_code_key ON public.card_reasons USING btree (code)"
  },
  {
    "table_schema": "public",
    "table_name": "card_reasons",
    "index_name": "card_reasons_pkey",
    "index_definition": "CREATE UNIQUE INDEX card_reasons_pkey ON public.card_reasons USING btree (id)"
  },
  {
    "table_schema": "public",
    "table_name": "evaluations",
    "index_name": "evaluations_pkey",
    "index_definition": "CREATE UNIQUE INDEX evaluations_pkey ON public.evaluations USING btree (id)"
  },
  {
    "table_schema": "public",
    "table_name": "evaluations",
    "index_name": "idx_evaluations_match",
    "index_definition": "CREATE INDEX idx_evaluations_match ON public.evaluations USING btree (match_id)"
  },
  {
    "table_schema": "public",
    "table_name": "evaluations",
    "index_name": "unique_match_evaluation",
    "index_definition": "CREATE UNIQUE INDEX unique_match_evaluation ON public.evaluations USING btree (match_id, evaluator_id, evaluated_id)"
  },
  {
    "table_schema": "public",
    "table_name": "match_reports",
    "index_name": "idx_reports_match",
    "index_definition": "CREATE INDEX idx_reports_match ON public.match_reports USING btree (match_id)"
  },
  {
    "table_schema": "public",
    "table_name": "match_reports",
    "index_name": "match_reports_match_id_key",
    "index_definition": "CREATE UNIQUE INDEX match_reports_match_id_key ON public.match_reports USING btree (match_id)"
  },
  {
    "table_schema": "public",
    "table_name": "match_reports",
    "index_name": "match_reports_pkey",
    "index_definition": "CREATE UNIQUE INDEX match_reports_pkey ON public.match_reports USING btree (id)"
  },
  {
    "table_schema": "public",
    "table_name": "matches",
    "index_name": "idx_matches_kickoff",
    "index_definition": "CREATE INDEX idx_matches_kickoff ON public.matches USING btree (kickoff_at)"
  },
  {
    "table_schema": "public",
    "table_name": "matches",
    "index_name": "matches_arbiter_match_id_idx",
    "index_definition": "CREATE UNIQUE INDEX matches_arbiter_match_id_idx ON public.matches USING btree (arbiter_match_id)"
  },
  {
    "table_schema": "public",
    "table_name": "matches",
    "index_name": "matches_pkey",
    "index_definition": "CREATE UNIQUE INDEX matches_pkey ON public.matches USING btree (id)"
  },
  {
    "table_schema": "public",
    "table_name": "matches",
    "index_name": "matches_tournament_division_season_id_idx",
    "index_definition": "CREATE INDEX matches_tournament_division_season_id_idx ON public.matches USING btree (tournament_division_season_id)"
  },
  {
    "table_schema": "public",
    "table_name": "members",
    "index_name": "members_email_key",
    "index_definition": "CREATE UNIQUE INDEX members_email_key ON public.members USING btree (email)"
  },
  {
    "table_schema": "public",
    "table_name": "members",
    "index_name": "members_pkey",
    "index_definition": "CREATE UNIQUE INDEX members_pkey ON public.members USING btree (id)"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_answers",
    "index_name": "quiz_answers_pkey",
    "index_definition": "CREATE UNIQUE INDEX quiz_answers_pkey ON public.quiz_answers USING btree (id)"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_attempts",
    "index_name": "idx_quiz_attempt_member",
    "index_definition": "CREATE INDEX idx_quiz_attempt_member ON public.quiz_attempts USING btree (member_id)"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_attempts",
    "index_name": "quiz_attempts_pkey",
    "index_definition": "CREATE UNIQUE INDEX quiz_attempts_pkey ON public.quiz_attempts USING btree (id)"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_questions",
    "index_name": "quiz_questions_pkey",
    "index_definition": "CREATE UNIQUE INDEX quiz_questions_pkey ON public.quiz_questions USING btree (id)"
  },
  {
    "table_schema": "public",
    "table_name": "quizzes",
    "index_name": "quizzes_pkey",
    "index_definition": "CREATE UNIQUE INDEX quizzes_pkey ON public.quizzes USING btree (id)"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_config",
    "index_name": "ranking_config_pkey",
    "index_definition": "CREATE UNIQUE INDEX ranking_config_pkey ON public.ranking_config USING btree (id)"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_history",
    "index_name": "ranking_history_pkey",
    "index_definition": "CREATE UNIQUE INDEX ranking_history_pkey ON public.ranking_history USING btree (id)"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_history",
    "index_name": "unique_member_month",
    "index_definition": "CREATE UNIQUE INDEX unique_member_month ON public.ranking_history USING btree (member_id, year, month)"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_levels",
    "index_name": "ranking_levels_pkey",
    "index_definition": "CREATE UNIQUE INDEX ranking_levels_pkey ON public.ranking_levels USING btree (id)"
  },
  {
    "table_schema": "public",
    "table_name": "report_assets",
    "index_name": "report_assets_pkey",
    "index_definition": "CREATE UNIQUE INDEX report_assets_pkey ON public.report_assets USING btree (id)"
  },
  {
    "table_schema": "public",
    "table_name": "report_cards",
    "index_name": "idx_report_cards_reason_code",
    "index_definition": "CREATE INDEX idx_report_cards_reason_code ON public.report_cards USING btree (reason_code)"
  },
  {
    "table_schema": "public",
    "table_name": "report_cards",
    "index_name": "report_cards_pkey",
    "index_definition": "CREATE UNIQUE INDEX report_cards_pkey ON public.report_cards USING btree (id)"
  },
  {
    "table_schema": "public",
    "table_name": "report_goals",
    "index_name": "report_goals_pkey",
    "index_definition": "CREATE UNIQUE INDEX report_goals_pkey ON public.report_goals USING btree (id)"
  },
  {
    "table_schema": "public",
    "table_name": "report_injuries",
    "index_name": "report_injuries_pkey",
    "index_definition": "CREATE UNIQUE INDEX report_injuries_pkey ON public.report_injuries USING btree (id)"
  },
  {
    "table_schema": "tournaments",
    "table_name": "division_seasons",
    "index_name": "division_seasons_division_id_idx",
    "index_definition": "CREATE INDEX division_seasons_division_id_idx ON tournaments.division_seasons USING btree (division_id)"
  },
  {
    "table_schema": "tournaments",
    "table_name": "division_seasons",
    "index_name": "division_seasons_division_season_unique",
    "index_definition": "CREATE UNIQUE INDEX division_seasons_division_season_unique ON tournaments.division_seasons USING btree (division_id, season_id)"
  },
  {
    "table_schema": "tournaments",
    "table_name": "division_seasons",
    "index_name": "division_seasons_pkey",
    "index_definition": "CREATE UNIQUE INDEX division_seasons_pkey ON tournaments.division_seasons USING btree (id)"
  },
  {
    "table_schema": "tournaments",
    "table_name": "division_seasons",
    "index_name": "division_seasons_season_id_idx",
    "index_definition": "CREATE INDEX division_seasons_season_id_idx ON tournaments.division_seasons USING btree (season_id)"
  },
  {
    "table_schema": "tournaments",
    "table_name": "divisions",
    "index_name": "divisions_organization_name_unique",
    "index_definition": "CREATE UNIQUE INDEX divisions_organization_name_unique ON tournaments.divisions USING btree (organization_id, name)"
  },
  {
    "table_schema": "tournaments",
    "table_name": "divisions",
    "index_name": "divisions_pkey",
    "index_definition": "CREATE UNIQUE INDEX divisions_pkey ON tournaments.divisions USING btree (id)"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_context",
    "index_name": "match_context_away_team_registration_id_idx",
    "index_definition": "CREATE INDEX match_context_away_team_registration_id_idx ON tournaments.match_context USING btree (away_team_registration_id)"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_context",
    "index_name": "match_context_division_season_id_idx",
    "index_definition": "CREATE INDEX match_context_division_season_id_idx ON tournaments.match_context USING btree (division_season_id)"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_context",
    "index_name": "match_context_home_team_registration_id_idx",
    "index_definition": "CREATE INDEX match_context_home_team_registration_id_idx ON tournaments.match_context USING btree (home_team_registration_id)"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_context",
    "index_name": "match_context_pkey",
    "index_definition": "CREATE UNIQUE INDEX match_context_pkey ON tournaments.match_context USING btree (match_id)"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_context_logs",
    "index_name": "match_context_logs_match_id_idx",
    "index_definition": "CREATE INDEX match_context_logs_match_id_idx ON tournaments.match_context_logs USING btree (match_id)"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_context_logs",
    "index_name": "match_context_logs_pkey",
    "index_definition": "CREATE UNIQUE INDEX match_context_logs_pkey ON tournaments.match_context_logs USING btree (id)"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_context_logs",
    "index_name": "match_context_logs_status_idx",
    "index_definition": "CREATE INDEX match_context_logs_status_idx ON tournaments.match_context_logs USING btree (status)"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_rosters",
    "index_name": "match_rosters_match_id_player_id_key",
    "index_definition": "CREATE UNIQUE INDEX match_rosters_match_id_player_id_key ON tournaments.match_rosters USING btree (match_id, player_id)"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_rosters",
    "index_name": "match_rosters_pkey",
    "index_definition": "CREATE UNIQUE INDEX match_rosters_pkey ON tournaments.match_rosters USING btree (id)"
  },
  {
    "table_schema": "tournaments",
    "table_name": "organizations",
    "index_name": "organizations_name_key",
    "index_definition": "CREATE UNIQUE INDEX organizations_name_key ON tournaments.organizations USING btree (name)"
  },
  {
    "table_schema": "tournaments",
    "table_name": "organizations",
    "index_name": "organizations_pkey",
    "index_definition": "CREATE UNIQUE INDEX organizations_pkey ON tournaments.organizations USING btree (id)"
  },
  {
    "table_schema": "tournaments",
    "table_name": "organizations",
    "index_name": "organizations_slug_key",
    "index_definition": "CREATE UNIQUE INDEX organizations_slug_key ON tournaments.organizations USING btree (slug)"
  },
  {
    "table_schema": "tournaments",
    "table_name": "player_registrations",
    "index_name": "player_registrations_pkey",
    "index_definition": "CREATE UNIQUE INDEX player_registrations_pkey ON tournaments.player_registrations USING btree (id)"
  },
  {
    "table_schema": "tournaments",
    "table_name": "player_registrations",
    "index_name": "player_registrations_player_id_idx",
    "index_definition": "CREATE INDEX player_registrations_player_id_idx ON tournaments.player_registrations USING btree (player_id)"
  },
  {
    "table_schema": "tournaments",
    "table_name": "player_registrations",
    "index_name": "player_registrations_player_team_registration_unique",
    "index_definition": "CREATE UNIQUE INDEX player_registrations_player_team_registration_unique ON tournaments.player_registrations USING btree (player_id, team_registration_id)"
  },
  {
    "table_schema": "tournaments",
    "table_name": "player_registrations",
    "index_name": "player_registrations_team_registration_id_idx",
    "index_definition": "CREATE INDEX player_registrations_team_registration_id_idx ON tournaments.player_registrations USING btree (team_registration_id)"
  },
  {
    "table_schema": "tournaments",
    "table_name": "players",
    "index_name": "players_org_external_player_unique",
    "index_definition": "CREATE UNIQUE INDEX players_org_external_player_unique ON tournaments.players USING btree (organization_id, external_player_id)"
  },
  {
    "table_schema": "tournaments",
    "table_name": "players",
    "index_name": "players_organization_external_id_unique",
    "index_definition": "CREATE UNIQUE INDEX players_organization_external_id_unique ON tournaments.players USING btree (organization_id, external_player_id)"
  },
  {
    "table_schema": "tournaments",
    "table_name": "players",
    "index_name": "players_pkey",
    "index_definition": "CREATE UNIQUE INDEX players_pkey ON tournaments.players USING btree (id)"
  },
  {
    "table_schema": "tournaments",
    "table_name": "seasons",
    "index_name": "seasons_one_active_per_organization_idx",
    "index_definition": "CREATE UNIQUE INDEX seasons_one_active_per_organization_idx ON tournaments.seasons USING btree (organization_id) WHERE (status = 'active'::text)"
  },
  {
    "table_schema": "tournaments",
    "table_name": "seasons",
    "index_name": "seasons_organization_id_idx",
    "index_definition": "CREATE INDEX seasons_organization_id_idx ON tournaments.seasons USING btree (organization_id)"
  },
  {
    "table_schema": "tournaments",
    "table_name": "seasons",
    "index_name": "seasons_organization_term_year_unique",
    "index_definition": "CREATE UNIQUE INDEX seasons_organization_term_year_unique ON tournaments.seasons USING btree (organization_id, term, year)"
  },
  {
    "table_schema": "tournaments",
    "table_name": "seasons",
    "index_name": "seasons_pkey",
    "index_definition": "CREATE UNIQUE INDEX seasons_pkey ON tournaments.seasons USING btree (id)"
  },
  {
    "table_schema": "tournaments",
    "table_name": "seasons",
    "index_name": "seasons_status_idx",
    "index_definition": "CREATE INDEX seasons_status_idx ON tournaments.seasons USING btree (status)"
  },
  {
    "table_schema": "tournaments",
    "table_name": "team_registrations",
    "index_name": "team_registrations_division_season_id_idx",
    "index_definition": "CREATE INDEX team_registrations_division_season_id_idx ON tournaments.team_registrations USING btree (division_season_id)"
  },
  {
    "table_schema": "tournaments",
    "table_name": "team_registrations",
    "index_name": "team_registrations_pkey",
    "index_definition": "CREATE UNIQUE INDEX team_registrations_pkey ON tournaments.team_registrations USING btree (id)"
  },
  {
    "table_schema": "tournaments",
    "table_name": "team_registrations",
    "index_name": "team_registrations_team_division_season_unique",
    "index_definition": "CREATE UNIQUE INDEX team_registrations_team_division_season_unique ON tournaments.team_registrations USING btree (team_id, division_season_id)"
  },
  {
    "table_schema": "tournaments",
    "table_name": "team_registrations",
    "index_name": "team_registrations_team_id_idx",
    "index_definition": "CREATE INDEX team_registrations_team_id_idx ON tournaments.team_registrations USING btree (team_id)"
  },
  {
    "table_schema": "tournaments",
    "table_name": "teams",
    "index_name": "teams_organization_name_unique",
    "index_definition": "CREATE UNIQUE INDEX teams_organization_name_unique ON tournaments.teams USING btree (organization_id, name)"
  },
  {
    "table_schema": "tournaments",
    "table_name": "teams",
    "index_name": "teams_pkey",
    "index_definition": "CREATE UNIQUE INDEX teams_pkey ON tournaments.teams USING btree (id)"
  }
]
```

---

## Result Interpretation

Each row represents one PostgreSQL index.

Important fields:

- `table_schema` — schema containing the indexed table.
- `table_name` — table on which the index is defined.
- `index_name` — PostgreSQL index name.
- `index_definition` — complete SQL definition of the index.

The index definition can reveal:

- Indexed columns.
- Column ordering.
- Unique indexes.
- Composite indexes.
- Partial indexes using `WHERE`.
- Expression-based indexes.
- PostgreSQL index method, such as B-tree.

Some indexes are automatically created to support database constraints such as:

- Primary keys.
- Unique constraints.

Other indexes may have been created specifically for application query performance.

---

## Audit Notes

The existence of an index does not prove that the application currently benefits from or uses that index.

Likewise, an index that appears related to a legacy feature must not be independently removed before determining whether its underlying table is still active.

Constraint-backed indexes require particular care because they may be required by:

- Primary keys.
- Unique constraints.
- Foreign key relationships.

Index usage statistics are not captured by this inventory and may be audited separately if needed.

---

## Preliminary Observation

This inventory will later help identify:

1. Indexes belonging to active database objects.
2. Indexes associated with potential legacy objects.
3. Duplicate or potentially redundant indexes.
4. Performance indexes that should be preserved during migrations.
5. Constraint-backed indexes that must not be removed independently.

No index is classified as redundant or safe to remove from this inventory alone.

---

## Audit Status

**Index inventory captured — classification pending.**

No database changes were performed as part of this audit.