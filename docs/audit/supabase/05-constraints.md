# Supabase Constraints

## Purpose

Capture the current structural constraints defined on CAFLA database tables.

This inventory focuses on:

- Primary key constraints
- Unique constraints
- Check constraints

Foreign key relationships are intentionally audited separately.

---

## Scope

Schemas included:

- `public`
- `tournaments`
- `development`

Constraint types included:

- `PRIMARY KEY`
- `UNIQUE`
- `CHECK`

---

## Query

```sql
select
  tc.table_schema,
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  kcu.ordinal_position,
  cc.check_clause
from information_schema.table_constraints tc
left join information_schema.key_column_usage kcu
  on tc.constraint_name = kcu.constraint_name
 and tc.constraint_schema = kcu.constraint_schema
 and tc.table_name = kcu.table_name
left join information_schema.check_constraints cc
  on tc.constraint_name = cc.constraint_name
 and tc.constraint_schema = cc.constraint_schema
where tc.table_schema in ('public', 'tournaments', 'development')
  and tc.constraint_type in ('PRIMARY KEY', 'UNIQUE', 'CHECK')
order by
  tc.table_schema,
  tc.table_name,
  tc.constraint_type,
  tc.constraint_name,
  kcu.ordinal_position;
```

---

## Result

```json
[
  {
    "table_schema": "development",
    "table_name": "attendance_records",
    "constraint_name": "52108_52288_1_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "id IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "attendance_records",
    "constraint_name": "52108_52288_2_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "session_id IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "attendance_records",
    "constraint_name": "52108_52288_3_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "member_id IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "attendance_records",
    "constraint_name": "52108_52288_4_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "status IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "attendance_records",
    "constraint_name": "52108_52288_7_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "recorded_at IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "attendance_records",
    "constraint_name": "52108_52288_8_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "created_at IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "attendance_records",
    "constraint_name": "52108_52288_9_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "updated_at IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "attendance_records",
    "constraint_name": "attendance_records_pkey",
    "constraint_type": "PRIMARY KEY",
    "column_name": "id",
    "ordinal_position": 1,
    "check_clause": null
  },
  {
    "table_schema": "development",
    "table_name": "attendance_records",
    "constraint_name": "development_attendance_session_member_unique",
    "constraint_type": "UNIQUE",
    "column_name": "session_id",
    "ordinal_position": 1,
    "check_clause": null
  },
  {
    "table_schema": "development",
    "table_name": "attendance_records",
    "constraint_name": "development_attendance_session_member_unique",
    "constraint_type": "UNIQUE",
    "column_name": "member_id",
    "ordinal_position": 2,
    "check_clause": null
  },
  {
    "table_schema": "development",
    "table_name": "attendance_scoring_rules",
    "constraint_name": "52108_52320_1_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "id IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "attendance_scoring_rules",
    "constraint_name": "52108_52320_2_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "cycle_id IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "attendance_scoring_rules",
    "constraint_name": "52108_52320_3_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "present_weight IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "attendance_scoring_rules",
    "constraint_name": "52108_52320_4_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "late_weight IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "attendance_scoring_rules",
    "constraint_name": "52108_52320_5_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "excused_weight IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "attendance_scoring_rules",
    "constraint_name": "52108_52320_6_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "absent_weight IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "attendance_scoring_rules",
    "constraint_name": "52108_52320_7_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "created_at IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "attendance_scoring_rules",
    "constraint_name": "52108_52320_8_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "updated_at IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "attendance_scoring_rules",
    "constraint_name": "attendance_absent_weight_check",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "((absent_weight >= (0)::numeric) AND (absent_weight <= (1)::numeric))"
  },
  {
    "table_schema": "development",
    "table_name": "attendance_scoring_rules",
    "constraint_name": "attendance_excused_weight_check",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "((excused_weight >= (0)::numeric) AND (excused_weight <= (1)::numeric))"
  },
  {
    "table_schema": "development",
    "table_name": "attendance_scoring_rules",
    "constraint_name": "attendance_late_weight_check",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "((late_weight >= (0)::numeric) AND (late_weight <= (1)::numeric))"
  },
  {
    "table_schema": "development",
    "table_name": "attendance_scoring_rules",
    "constraint_name": "attendance_present_weight_check",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "((present_weight >= (0)::numeric) AND (present_weight <= (1)::numeric))"
  },
  {
    "table_schema": "development",
    "table_name": "attendance_scoring_rules",
    "constraint_name": "attendance_scoring_rules_pkey",
    "constraint_type": "PRIMARY KEY",
    "column_name": "id",
    "ordinal_position": 1,
    "check_clause": null
  },
  {
    "table_schema": "development",
    "table_name": "attendance_scoring_rules",
    "constraint_name": "attendance_scoring_rules_cycle_unique",
    "constraint_type": "UNIQUE",
    "column_name": "cycle_id",
    "ordinal_position": 1,
    "check_clause": null
  },
  {
    "table_schema": "development",
    "table_name": "attendance_sessions",
    "constraint_name": "52108_52263_11_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "created_at IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "attendance_sessions",
    "constraint_name": "52108_52263_12_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "updated_at IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "attendance_sessions",
    "constraint_name": "52108_52263_1_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "id IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "attendance_sessions",
    "constraint_name": "52108_52263_2_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "cycle_id IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "attendance_sessions",
    "constraint_name": "52108_52263_3_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "title IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "attendance_sessions",
    "constraint_name": "52108_52263_4_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "session_type IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "attendance_sessions",
    "constraint_name": "52108_52263_5_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "scheduled_at IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "attendance_sessions",
    "constraint_name": "52108_52263_7_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "status IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "attendance_sessions",
    "constraint_name": "52108_52263_8_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "counts_for_score IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "attendance_sessions",
    "constraint_name": "development_attendance_session_title_check",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "(length(TRIM(BOTH FROM title)) > 0)"
  },
  {
    "table_schema": "development",
    "table_name": "attendance_sessions",
    "constraint_name": "attendance_sessions_pkey",
    "constraint_type": "PRIMARY KEY",
    "column_name": "id",
    "ordinal_position": 1,
    "check_clause": null
  },
  {
    "table_schema": "development",
    "table_name": "current_ranking_snapshot",
    "constraint_name": "52108_53208_12_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "ranking_eligible IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "current_ranking_snapshot",
    "constraint_name": "52108_53208_13_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "evidence_status IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "current_ranking_snapshot",
    "constraint_name": "52108_53208_19_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "refreshed_at IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "current_ranking_snapshot",
    "constraint_name": "52108_53208_1_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "cycle_id IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "current_ranking_snapshot",
    "constraint_name": "52108_53208_2_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "cycle_member_id IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "current_ranking_snapshot",
    "constraint_name": "52108_53208_3_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "member_id IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "current_ranking_snapshot",
    "constraint_name": "52108_53208_4_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "snapshot_date IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "current_ranking_snapshot",
    "constraint_name": "current_ranking_snapshot_development_check",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "((development_score IS NULL) OR ((development_score >= (0)::numeric) AND (development_score <= (100)::numeric)))"
  },
  {
    "table_schema": "development",
    "table_name": "current_ranking_snapshot",
    "constraint_name": "current_ranking_snapshot_eligibility_check",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "((ranking_eligible = false) OR ((ranking_score IS NOT NULL) AND (ranking_position IS NOT NULL)))"
  },
  {
    "table_schema": "development",
    "table_name": "current_ranking_snapshot",
    "constraint_name": "current_ranking_snapshot_evidence_check",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "((evidence_percentage IS NULL) OR ((evidence_percentage >= (0)::numeric) AND (evidence_percentage <= (100)::numeric)))"
  },
  {
    "table_schema": "development",
    "table_name": "current_ranking_snapshot",
    "constraint_name": "current_ranking_snapshot_factor_check",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "((evidence_factor_percentage IS NULL) OR ((evidence_factor_percentage >= (0)::numeric) AND (evidence_factor_percentage <= (100)::numeric)))"
  },
  {
    "table_schema": "development",
    "table_name": "current_ranking_snapshot",
    "constraint_name": "current_ranking_snapshot_percentile_check",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "((ranking_percentile IS NULL) OR ((ranking_percentile >= (0)::numeric) AND (ranking_percentile <= (100)::numeric)))"
  },
  {
    "table_schema": "development",
    "table_name": "current_ranking_snapshot",
    "constraint_name": "current_ranking_snapshot_position_check",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "((ranking_position IS NULL) OR (ranking_position >= 1))"
  },
  {
    "table_schema": "development",
    "table_name": "current_ranking_snapshot",
    "constraint_name": "current_ranking_snapshot_score_check",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "((ranking_score IS NULL) OR ((ranking_score >= (0)::numeric) AND (ranking_score <= (100)::numeric)))"
  },
  {
    "table_schema": "development",
    "table_name": "current_ranking_snapshot",
    "constraint_name": "current_ranking_snapshot_pkey",
    "constraint_type": "PRIMARY KEY",
    "column_name": "cycle_id",
    "ordinal_position": 1,
    "check_clause": null
  },
  {
    "table_schema": "development",
    "table_name": "current_ranking_snapshot",
    "constraint_name": "current_ranking_snapshot_pkey",
    "constraint_type": "PRIMARY KEY",
    "column_name": "member_id",
    "ordinal_position": 2,
    "check_clause": null
  },
  {
    "table_schema": "development",
    "table_name": "cycle_members",
    "constraint_name": "52108_52161_11_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "created_at IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "cycle_members",
    "constraint_name": "52108_52161_12_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "updated_at IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "cycle_members",
    "constraint_name": "52108_52161_1_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "id IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "cycle_members",
    "constraint_name": "52108_52161_2_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "cycle_id IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "cycle_members",
    "constraint_name": "52108_52161_3_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "member_id IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "cycle_members",
    "constraint_name": "52108_52161_4_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "effective_from IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "cycle_members",
    "constraint_name": "52108_52161_6_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "enrollment_type IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "cycle_members",
    "constraint_name": "52108_52161_7_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "status IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "cycle_members",
    "constraint_name": "52108_52161_8_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "eligible_for_ranking IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "cycle_members",
    "constraint_name": "development_cycle_member_dates_check",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "((effective_until IS NULL) OR (effective_until >= effective_from))"
  },
  {
    "table_schema": "development",
    "table_name": "cycle_members",
    "constraint_name": "cycle_members_pkey",
    "constraint_type": "PRIMARY KEY",
    "column_name": "id",
    "ordinal_position": 1,
    "check_clause": null
  },
  {
    "table_schema": "development",
    "table_name": "cycle_members",
    "constraint_name": "development_cycle_member_unique",
    "constraint_type": "UNIQUE",
    "column_name": "cycle_id",
    "ordinal_position": 1,
    "check_clause": null
  },
  {
    "table_schema": "development",
    "table_name": "cycle_members",
    "constraint_name": "development_cycle_member_unique",
    "constraint_type": "UNIQUE",
    "column_name": "member_id",
    "ordinal_position": 2,
    "check_clause": null
  },
  {
    "table_schema": "development",
    "table_name": "cycles",
    "constraint_name": "52108_52135_10_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "updated_at IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "cycles",
    "constraint_name": "52108_52135_1_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "id IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "cycles",
    "constraint_name": "52108_52135_2_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "name IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "cycles",
    "constraint_name": "52108_52135_3_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "start_date IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "cycles",
    "constraint_name": "52108_52135_4_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "end_date IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "cycles",
    "constraint_name": "52108_52135_5_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "status IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "cycles",
    "constraint_name": "52108_52135_9_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "created_at IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "cycles",
    "constraint_name": "development_cycles_dates_check",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "(end_date >= start_date)"
  },
  {
    "table_schema": "development",
    "table_name": "cycles",
    "constraint_name": "cycles_pkey",
    "constraint_type": "PRIMARY KEY",
    "column_name": "id",
    "ordinal_position": 1,
    "check_clause": null
  },
  {
    "table_schema": "development",
    "table_name": "cycles",
    "constraint_name": "development_cycles_name_unique",
    "constraint_type": "UNIQUE",
    "column_name": "name",
    "ordinal_position": 1,
    "check_clause": null
  },
  {
    "table_schema": "development",
    "table_name": "monthly_ranking_snapshots",
    "constraint_name": "52108_53170_14_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "ranking_eligible IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "monthly_ranking_snapshots",
    "constraint_name": "52108_53170_15_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "evidence_status IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "monthly_ranking_snapshots",
    "constraint_name": "52108_53170_16_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "captured_at IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "monthly_ranking_snapshots",
    "constraint_name": "52108_53170_1_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "id IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "monthly_ranking_snapshots",
    "constraint_name": "52108_53170_2_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "cycle_id IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "monthly_ranking_snapshots",
    "constraint_name": "52108_53170_3_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "cycle_member_id IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "monthly_ranking_snapshots",
    "constraint_name": "52108_53170_4_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "member_id IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "monthly_ranking_snapshots",
    "constraint_name": "52108_53170_5_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "month_start IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "monthly_ranking_snapshots",
    "constraint_name": "52108_53170_6_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "snapshot_date IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "monthly_ranking_snapshots",
    "constraint_name": "monthly_ranking_snapshots_development_score_check",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "((development_score IS NULL) OR ((development_score >= (0)::numeric) AND (development_score <= (100)::numeric)))"
  },
  {
    "table_schema": "development",
    "table_name": "monthly_ranking_snapshots",
    "constraint_name": "monthly_ranking_snapshots_eligible_consistency",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "((ranking_eligible = false) OR ((ranking_score IS NOT NULL) AND (ranking_position IS NOT NULL)))"
  },
  {
    "table_schema": "development",
    "table_name": "monthly_ranking_snapshots",
    "constraint_name": "monthly_ranking_snapshots_evidence_factor_check",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "((evidence_factor_percentage IS NULL) OR ((evidence_factor_percentage >= (0)::numeric) AND (evidence_factor_percentage <= (100)::numeric)))"
  },
  {
    "table_schema": "development",
    "table_name": "monthly_ranking_snapshots",
    "constraint_name": "monthly_ranking_snapshots_evidence_percentage_check",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "((evidence_percentage IS NULL) OR ((evidence_percentage >= (0)::numeric) AND (evidence_percentage <= (100)::numeric)))"
  },
  {
    "table_schema": "development",
    "table_name": "monthly_ranking_snapshots",
    "constraint_name": "monthly_ranking_snapshots_percentile_check",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "((ranking_percentile IS NULL) OR ((ranking_percentile >= (0)::numeric) AND (ranking_percentile <= (100)::numeric)))"
  },
  {
    "table_schema": "development",
    "table_name": "monthly_ranking_snapshots",
    "constraint_name": "monthly_ranking_snapshots_position_check",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "((ranking_position IS NULL) OR (ranking_position >= 1))"
  },
  {
    "table_schema": "development",
    "table_name": "monthly_ranking_snapshots",
    "constraint_name": "monthly_ranking_snapshots_ranking_score_check",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "((ranking_score IS NULL) OR ((ranking_score >= (0)::numeric) AND (ranking_score <= (100)::numeric)))"
  },
  {
    "table_schema": "development",
    "table_name": "monthly_ranking_snapshots",
    "constraint_name": "monthly_ranking_snapshots_pkey",
    "constraint_type": "PRIMARY KEY",
    "column_name": "id",
    "ordinal_position": 1,
    "check_clause": null
  },
  {
    "table_schema": "development",
    "table_name": "monthly_ranking_snapshots",
    "constraint_name": "monthly_ranking_snapshots_cycle_member_month_unique",
    "constraint_type": "UNIQUE",
    "column_name": "cycle_id",
    "ordinal_position": 1,
    "check_clause": null
  },
  {
    "table_schema": "development",
    "table_name": "monthly_ranking_snapshots",
    "constraint_name": "monthly_ranking_snapshots_cycle_member_month_unique",
    "constraint_type": "UNIQUE",
    "column_name": "member_id",
    "ordinal_position": 2,
    "check_clause": null
  },
  {
    "table_schema": "development",
    "table_name": "monthly_ranking_snapshots",
    "constraint_name": "monthly_ranking_snapshots_cycle_member_month_unique",
    "constraint_type": "UNIQUE",
    "column_name": "month_start",
    "ordinal_position": 3,
    "check_clause": null
  },
  {
    "table_schema": "development",
    "table_name": "quiz_access_grants",
    "constraint_name": "52108_52640_1_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "id IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_access_grants",
    "constraint_name": "52108_52640_2_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "assessment_id IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_access_grants",
    "constraint_name": "52108_52640_3_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "member_id IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_access_grants",
    "constraint_name": "52108_52640_4_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "available_from IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_access_grants",
    "constraint_name": "52108_52640_5_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "available_until IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_access_grants",
    "constraint_name": "52108_52640_7_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "granted_by IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_access_grants",
    "constraint_name": "52108_52640_8_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "granted_at IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_access_grants",
    "constraint_name": "quiz_access_grants_window_check",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "(available_from < available_until)"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_access_grants",
    "constraint_name": "quiz_access_grants_pkey",
    "constraint_type": "PRIMARY KEY",
    "column_name": "id",
    "ordinal_position": 1,
    "check_clause": null
  },
  {
    "table_schema": "development",
    "table_name": "quiz_answers",
    "constraint_name": "52108_52614_1_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "id IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_answers",
    "constraint_name": "52108_52614_2_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "attempt_id IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_answers",
    "constraint_name": "52108_52614_3_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "attempt_question_id IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_answers",
    "constraint_name": "52108_52614_7_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "created_at IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_answers",
    "constraint_name": "52108_52614_8_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "updated_at IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_answers",
    "constraint_name": "quiz_answers_pkey",
    "constraint_type": "PRIMARY KEY",
    "column_name": "id",
    "ordinal_position": 1,
    "check_clause": null
  },
  {
    "table_schema": "development",
    "table_name": "quiz_answers",
    "constraint_name": "quiz_answers_attempt_question_unique",
    "constraint_type": "UNIQUE",
    "column_name": "attempt_id",
    "ordinal_position": 1,
    "check_clause": null
  },
  {
    "table_schema": "development",
    "table_name": "quiz_answers",
    "constraint_name": "quiz_answers_attempt_question_unique",
    "constraint_type": "UNIQUE",
    "column_name": "attempt_question_id",
    "ordinal_position": 2,
    "check_clause": null
  },
  {
    "table_schema": "development",
    "table_name": "quiz_assessments",
    "constraint_name": "52108_52421_10_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "time_limit_minutes IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_assessments",
    "constraint_name": "52108_52421_11_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "questions_per_attempt IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_assessments",
    "constraint_name": "52108_52421_12_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "randomize_questions IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_assessments",
    "constraint_name": "52108_52421_13_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "randomize_options IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_assessments",
    "constraint_name": "52108_52421_17_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "created_by IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_assessments",
    "constraint_name": "52108_52421_18_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "created_at IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_assessments",
    "constraint_name": "52108_52421_19_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "updated_at IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_assessments",
    "constraint_name": "52108_52421_1_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "id IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_assessments",
    "constraint_name": "52108_52421_2_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "cycle_id IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_assessments",
    "constraint_name": "52108_52421_3_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "title IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_assessments",
    "constraint_name": "52108_52421_5_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "category IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_assessments",
    "constraint_name": "52108_52421_6_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "status IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_assessments",
    "constraint_name": "52108_52421_7_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "required IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_assessments",
    "constraint_name": "52108_52421_8_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "counts_for_score IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_assessments",
    "constraint_name": "52108_52421_9_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "max_attempts IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_assessments",
    "constraint_name": "quiz_assessments_attempts_check",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "(max_attempts >= 1)"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_assessments",
    "constraint_name": "quiz_assessments_questions_per_attempt_check",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "(questions_per_attempt >= 1)"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_assessments",
    "constraint_name": "quiz_assessments_required_score_check",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "((counts_for_score = false) OR (required = true))"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_assessments",
    "constraint_name": "quiz_assessments_time_limit_check",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "(time_limit_minutes >= 1)"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_assessments",
    "constraint_name": "quiz_assessments_window_check",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "((open_from IS NULL) OR (open_until IS NULL) OR (open_from < open_until))"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_assessments",
    "constraint_name": "quiz_assessments_pkey",
    "constraint_type": "PRIMARY KEY",
    "column_name": "id",
    "ordinal_position": 1,
    "check_clause": null
  },
  {
    "table_schema": "development",
    "table_name": "quiz_attempt_questions",
    "constraint_name": "52108_52585_1_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "id IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_attempt_questions",
    "constraint_name": "52108_52585_2_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "attempt_id IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_attempt_questions",
    "constraint_name": "52108_52585_3_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "question_group_id IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_attempt_questions",
    "constraint_name": "52108_52585_4_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "question_id IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_attempt_questions",
    "constraint_name": "52108_52585_5_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "display_position IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_attempt_questions",
    "constraint_name": "52108_52585_6_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "option_order IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_attempt_questions",
    "constraint_name": "52108_52585_7_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "created_at IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_attempt_questions",
    "constraint_name": "quiz_attempt_questions_pkey",
    "constraint_type": "PRIMARY KEY",
    "column_name": "id",
    "ordinal_position": 1,
    "check_clause": null
  },
  {
    "table_schema": "development",
    "table_name": "quiz_attempt_questions",
    "constraint_name": "quiz_attempt_questions_group_unique",
    "constraint_type": "UNIQUE",
    "column_name": "attempt_id",
    "ordinal_position": 1,
    "check_clause": null
  },
  {
    "table_schema": "development",
    "table_name": "quiz_attempt_questions",
    "constraint_name": "quiz_attempt_questions_group_unique",
    "constraint_type": "UNIQUE",
    "column_name": "question_group_id",
    "ordinal_position": 2,
    "check_clause": null
  },
  {
    "table_schema": "development",
    "table_name": "quiz_attempt_questions",
    "constraint_name": "quiz_attempt_questions_position_unique",
    "constraint_type": "UNIQUE",
    "column_name": "attempt_id",
    "ordinal_position": 1,
    "check_clause": null
  },
  {
    "table_schema": "development",
    "table_name": "quiz_attempt_questions",
    "constraint_name": "quiz_attempt_questions_position_unique",
    "constraint_type": "UNIQUE",
    "column_name": "display_position",
    "ordinal_position": 2,
    "check_clause": null
  },
  {
    "table_schema": "development",
    "table_name": "quiz_attempts",
    "constraint_name": "52108_52553_14_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "created_at IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_attempts",
    "constraint_name": "52108_52553_15_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "updated_at IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_attempts",
    "constraint_name": "52108_52553_1_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "id IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_attempts",
    "constraint_name": "52108_52553_2_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "assessment_id IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_attempts",
    "constraint_name": "52108_52553_3_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "version_id IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_attempts",
    "constraint_name": "52108_52553_4_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "member_id IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_attempts",
    "constraint_name": "52108_52553_5_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "attempt_number IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_attempts",
    "constraint_name": "52108_52553_6_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "status IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_attempts",
    "constraint_name": "52108_52553_7_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "started_at IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_attempts",
    "constraint_name": "52108_52553_8_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "expires_at IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_attempts",
    "constraint_name": "quiz_attempts_number_check",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "(attempt_number >= 1)"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_attempts",
    "constraint_name": "quiz_attempts_score_check",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "((score IS NULL) OR ((score >= (0)::numeric) AND (score <= (100)::numeric)))"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_attempts",
    "constraint_name": "quiz_attempts_pkey",
    "constraint_type": "PRIMARY KEY",
    "column_name": "id",
    "ordinal_position": 1,
    "check_clause": null
  },
  {
    "table_schema": "development",
    "table_name": "quiz_attempts",
    "constraint_name": "quiz_attempts_member_number_unique",
    "constraint_type": "UNIQUE",
    "column_name": "assessment_id",
    "ordinal_position": 1,
    "check_clause": null
  },
  {
    "table_schema": "development",
    "table_name": "quiz_attempts",
    "constraint_name": "quiz_attempts_member_number_unique",
    "constraint_type": "UNIQUE",
    "column_name": "member_id",
    "ordinal_position": 2,
    "check_clause": null
  },
  {
    "table_schema": "development",
    "table_name": "quiz_attempts",
    "constraint_name": "quiz_attempts_member_number_unique",
    "constraint_type": "UNIQUE",
    "column_name": "attempt_number",
    "ordinal_position": 3,
    "check_clause": null
  },
  {
    "table_schema": "development",
    "table_name": "quiz_question_groups",
    "constraint_name": "52108_52489_10_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "updated_at IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_question_groups",
    "constraint_name": "52108_52489_1_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "id IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_question_groups",
    "constraint_name": "52108_52489_2_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "assessment_id IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_question_groups",
    "constraint_name": "52108_52489_3_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "question_type IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_question_groups",
    "constraint_name": "52108_52489_5_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "is_invalidated IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_question_groups",
    "constraint_name": "52108_52489_9_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "created_at IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_question_groups",
    "constraint_name": "quiz_question_groups_pkey",
    "constraint_type": "PRIMARY KEY",
    "column_name": "id",
    "ordinal_position": 1,
    "check_clause": null
  },
  {
    "table_schema": "development",
    "table_name": "quiz_question_options",
    "constraint_name": "52108_52535_1_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "id IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_question_options",
    "constraint_name": "52108_52535_2_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "question_id IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_question_options",
    "constraint_name": "52108_52535_3_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "option_text IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_question_options",
    "constraint_name": "52108_52535_4_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "is_correct IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_question_options",
    "constraint_name": "52108_52535_5_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "position IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_question_options",
    "constraint_name": "52108_52535_6_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "created_at IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_question_options",
    "constraint_name": "quiz_question_options_pkey",
    "constraint_type": "PRIMARY KEY",
    "column_name": "id",
    "ordinal_position": 1,
    "check_clause": null
  },
  {
    "table_schema": "development",
    "table_name": "quiz_question_options",
    "constraint_name": "quiz_question_options_position_unique",
    "constraint_type": "UNIQUE",
    "column_name": "question_id",
    "ordinal_position": 1,
    "check_clause": null
  },
  {
    "table_schema": "development",
    "table_name": "quiz_question_options",
    "constraint_name": "quiz_question_options_position_unique",
    "constraint_type": "UNIQUE",
    "column_name": "position",
    "ordinal_position": 2,
    "check_clause": null
  },
  {
    "table_schema": "development",
    "table_name": "quiz_questions",
    "constraint_name": "52108_52511_1_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "id IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_questions",
    "constraint_name": "52108_52511_2_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "question_group_id IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_questions",
    "constraint_name": "52108_52511_3_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "version_id IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_questions",
    "constraint_name": "52108_52511_4_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "question_text IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_questions",
    "constraint_name": "52108_52511_6_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "created_at IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_questions",
    "constraint_name": "52108_52511_7_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "updated_at IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_questions",
    "constraint_name": "quiz_questions_pkey",
    "constraint_type": "PRIMARY KEY",
    "column_name": "id",
    "ordinal_position": 1,
    "check_clause": null
  },
  {
    "table_schema": "development",
    "table_name": "quiz_questions",
    "constraint_name": "quiz_questions_group_version_unique",
    "constraint_type": "UNIQUE",
    "column_name": "question_group_id",
    "ordinal_position": 1,
    "check_clause": null
  },
  {
    "table_schema": "development",
    "table_name": "quiz_questions",
    "constraint_name": "quiz_questions_group_version_unique",
    "constraint_type": "UNIQUE",
    "column_name": "version_id",
    "ordinal_position": 2,
    "check_clause": null
  },
  {
    "table_schema": "development",
    "table_name": "quiz_versions",
    "constraint_name": "52108_52471_1_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "id IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_versions",
    "constraint_name": "52108_52471_2_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "assessment_id IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_versions",
    "constraint_name": "52108_52471_3_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "language IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_versions",
    "constraint_name": "52108_52471_4_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "title IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_versions",
    "constraint_name": "52108_52471_7_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "created_at IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_versions",
    "constraint_name": "52108_52471_8_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "updated_at IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_versions",
    "constraint_name": "quiz_versions_pkey",
    "constraint_type": "PRIMARY KEY",
    "column_name": "id",
    "ordinal_position": 1,
    "check_clause": null
  },
  {
    "table_schema": "development",
    "table_name": "quiz_versions",
    "constraint_name": "quiz_versions_assessment_language_unique",
    "constraint_type": "UNIQUE",
    "column_name": "assessment_id",
    "ordinal_position": 1,
    "check_clause": null
  },
  {
    "table_schema": "development",
    "table_name": "quiz_versions",
    "constraint_name": "quiz_versions_assessment_language_unique",
    "constraint_type": "UNIQUE",
    "column_name": "language",
    "ordinal_position": 2,
    "check_clause": null
  },
  {
    "table_schema": "development",
    "table_name": "scoring_periods",
    "constraint_name": "52108_53056_11_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "created_at IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "scoring_periods",
    "constraint_name": "52108_53056_1_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "id IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "scoring_periods",
    "constraint_name": "52108_53056_2_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "name IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "scoring_periods",
    "constraint_name": "52108_53056_3_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "effective_from IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "scoring_periods",
    "constraint_name": "52108_53056_5_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "attendance_weight IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "scoring_periods",
    "constraint_name": "52108_53056_6_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "quiz_weight IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "scoring_periods",
    "constraint_name": "52108_53056_7_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "report_weight IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "scoring_periods",
    "constraint_name": "52108_53056_8_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "evaluation_weight IS NOT NULL"
  },
  {
    "table_schema": "development",
    "table_name": "scoring_periods",
    "constraint_name": "scoring_periods_attendance_weight_range",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "((attendance_weight >= 0) AND (attendance_weight <= 100))"
  },
  {
    "table_schema": "development",
    "table_name": "scoring_periods",
    "constraint_name": "scoring_periods_evaluation_weight_range",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "((evaluation_weight >= 0) AND (evaluation_weight <= 100))"
  },
  {
    "table_schema": "development",
    "table_name": "scoring_periods",
    "constraint_name": "scoring_periods_name_not_blank",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "(btrim(name) <> ''::text)"
  },
  {
    "table_schema": "development",
    "table_name": "scoring_periods",
    "constraint_name": "scoring_periods_quiz_weight_range",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "((quiz_weight >= 0) AND (quiz_weight <= 100))"
  },
  {
    "table_schema": "development",
    "table_name": "scoring_periods",
    "constraint_name": "scoring_periods_report_weight_range",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "((report_weight >= 0) AND (report_weight <= 100))"
  },
  {
    "table_schema": "development",
    "table_name": "scoring_periods",
    "constraint_name": "scoring_periods_valid_dates",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "((effective_until IS NULL) OR (effective_until >= effective_from))"
  },
  {
    "table_schema": "development",
    "table_name": "scoring_periods",
    "constraint_name": "scoring_periods_weights_total",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "((((attendance_weight + quiz_weight) + report_weight) + evaluation_weight) = 100)"
  },
  {
    "table_schema": "development",
    "table_name": "scoring_periods",
    "constraint_name": "scoring_periods_pkey",
    "constraint_type": "PRIMARY KEY",
    "column_name": "id",
    "ordinal_position": 1,
    "check_clause": null
  },
  {
    "table_schema": "public",
    "table_name": "arbiter_referees",
    "constraint_name": "2200_19394_1_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "id IS NOT NULL"
  },
  {
    "table_schema": "public",
    "table_name": "arbiter_referees",
    "constraint_name": "2200_19394_2_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "arbiter_name IS NOT NULL"
  },
  {
    "table_schema": "public",
    "table_name": "arbiter_referees",
    "constraint_name": "arbiter_referees_pkey",
    "constraint_type": "PRIMARY KEY",
    "column_name": "id",
    "ordinal_position": 1,
    "check_clause": null
  },
  {
    "table_schema": "public",
    "table_name": "arbiter_referees",
    "constraint_name": "arbiter_referees_arbiter_name_key",
    "constraint_type": "UNIQUE",
    "column_name": "arbiter_name",
    "ordinal_position": 1,
    "check_clause": null
  },
  {
    "table_schema": "public",
    "table_name": "attendance_records",
    "constraint_name": "2200_17942_1_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "id IS NOT NULL"
  },
  {
    "table_schema": "public",
    "table_name": "attendance_records",
    "constraint_name": "attendance_records_pkey",
    "constraint_type": "PRIMARY KEY",
    "column_name": "id",
    "ordinal_position": 1,
    "check_clause": null
  },
  {
    "table_schema": "public",
    "table_name": "attendance_records",
    "constraint_name": "attendance_session_member_unique",
    "constraint_type": "UNIQUE",
    "column_name": "session_id",
    "ordinal_position": 1,
    "check_clause": null
  },
  {
    "table_schema": "public",
    "table_name": "attendance_records",
    "constraint_name": "attendance_session_member_unique",
    "constraint_type": "UNIQUE",
    "column_name": "member_id",
    "ordinal_position": 2,
    "check_clause": null
  },
  {
    "table_schema": "public",
    "table_name": "attendance_sessions",
    "constraint_name": "2200_17933_1_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "id IS NOT NULL"
  },
  {
    "table_schema": "public",
    "table_name": "attendance_sessions",
    "constraint_name": "2200_17933_2_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "title IS NOT NULL"
  },
  {
    "table_schema": "public",
    "table_name": "attendance_sessions",
    "constraint_name": "attendance_sessions_pkey",
    "constraint_type": "PRIMARY KEY",
    "column_name": "id",
    "ordinal_position": 1,
    "check_clause": null
  },
  {
    "table_schema": "public",
    "table_name": "card_reasons",
    "constraint_name": "2200_49332_1_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "id IS NOT NULL"
  },
  {
    "table_schema": "public",
    "table_name": "card_reasons",
    "constraint_name": "2200_49332_2_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "code IS NOT NULL"
  },
  {
    "table_schema": "public",
    "table_name": "card_reasons",
    "constraint_name": "2200_49332_3_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "label IS NOT NULL"
  },
  {
    "table_schema": "public",
    "table_name": "card_reasons",
    "constraint_name": "2200_49332_5_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "card_type IS NOT NULL"
  },
  {
    "table_schema": "public",
    "table_name": "card_reasons",
    "constraint_name": "card_reasons_card_type_check",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "(card_type = ANY (ARRAY['yellow'::text, 'red'::text]))"
  },
  {
    "table_schema": "public",
    "table_name": "card_reasons",
    "constraint_name": "card_reasons_pkey",
    "constraint_type": "PRIMARY KEY",
    "column_name": "id",
    "ordinal_position": 1,
    "check_clause": null
  },
  {
    "table_schema": "public",
    "table_name": "card_reasons",
    "constraint_name": "card_reasons_code_key",
    "constraint_type": "UNIQUE",
    "column_name": "code",
    "ordinal_position": 1,
    "check_clause": null
  },
  {
    "table_schema": "public",
    "table_name": "evaluations",
    "constraint_name": "2200_17960_1_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "id IS NOT NULL"
  },
  {
    "table_schema": "public",
    "table_name": "evaluations",
    "constraint_name": "arrival_score_range",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "((arrival_score >= 1) AND (arrival_score <= 5))"
  },
  {
    "table_schema": "public",
    "table_name": "evaluations",
    "constraint_name": "communication_score_range",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "((communication_score >= 1) AND (communication_score <= 5))"
  },
  {
    "table_schema": "public",
    "table_name": "evaluations",
    "constraint_name": "fitness_score_range",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "((fitness_score >= 1) AND (fitness_score <= 5))"
  },
  {
    "table_schema": "public",
    "table_name": "evaluations",
    "constraint_name": "professionalism_score_range",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "((professionalism_score >= 1) AND (professionalism_score <= 5))"
  },
  {
    "table_schema": "public",
    "table_name": "evaluations",
    "constraint_name": "teamwork_score_range",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "((teamwork_score >= 1) AND (teamwork_score <= 5))"
  },
  {
    "table_schema": "public",
    "table_name": "evaluations",
    "constraint_name": "evaluations_pkey",
    "constraint_type": "PRIMARY KEY",
    "column_name": "id",
    "ordinal_position": 1,
    "check_clause": null
  },
  {
    "table_schema": "public",
    "table_name": "evaluations",
    "constraint_name": "unique_match_evaluation",
    "constraint_type": "UNIQUE",
    "column_name": "match_id",
    "ordinal_position": 1,
    "check_clause": null
  },
  {
    "table_schema": "public",
    "table_name": "evaluations",
    "constraint_name": "unique_match_evaluation",
    "constraint_type": "UNIQUE",
    "column_name": "evaluator_id",
    "ordinal_position": 2,
    "check_clause": null
  },
  {
    "table_schema": "public",
    "table_name": "evaluations",
    "constraint_name": "unique_match_evaluation",
    "constraint_type": "UNIQUE",
    "column_name": "evaluated_id",
    "ordinal_position": 3,
    "check_clause": null
  },
  {
    "table_schema": "public",
    "table_name": "match_reports",
    "constraint_name": "2200_17856_1_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "id IS NOT NULL"
  },
  {
    "table_schema": "public",
    "table_name": "match_reports",
    "constraint_name": "match_reports_pkey",
    "constraint_type": "PRIMARY KEY",
    "column_name": "id",
    "ordinal_position": 1,
    "check_clause": null
  },
  {
    "table_schema": "public",
    "table_name": "match_reports",
    "constraint_name": "match_reports_match_id_key",
    "constraint_type": "UNIQUE",
    "column_name": "match_id",
    "ordinal_position": 1,
    "check_clause": null
  },
  {
    "table_schema": "public",
    "table_name": "matches",
    "constraint_name": "2200_17831_1_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "id IS NOT NULL"
  },
  {
    "table_schema": "public",
    "table_name": "matches",
    "constraint_name": "2200_17831_4_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "home_team IS NOT NULL"
  },
  {
    "table_schema": "public",
    "table_name": "matches",
    "constraint_name": "2200_17831_5_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "away_team IS NOT NULL"
  },
  {
    "table_schema": "public",
    "table_name": "matches",
    "constraint_name": "matches_pkey",
    "constraint_type": "PRIMARY KEY",
    "column_name": "id",
    "ordinal_position": 1,
    "check_clause": null
  },
  {
    "table_schema": "public",
    "table_name": "members",
    "constraint_name": "2200_17818_1_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "id IS NOT NULL"
  },
  {
    "table_schema": "public",
    "table_name": "members",
    "constraint_name": "2200_17818_2_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "full_name IS NOT NULL"
  },
  {
    "table_schema": "public",
    "table_name": "members",
    "constraint_name": "2200_17818_3_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "email IS NOT NULL"
  },
  {
    "table_schema": "public",
    "table_name": "members",
    "constraint_name": "members_pkey",
    "constraint_type": "PRIMARY KEY",
    "column_name": "id",
    "ordinal_position": 1,
    "check_clause": null
  },
  {
    "table_schema": "public",
    "table_name": "members",
    "constraint_name": "members_email_key",
    "constraint_type": "UNIQUE",
    "column_name": "email",
    "ordinal_position": 1,
    "check_clause": null
  },
  {
    "table_schema": "public",
    "table_name": "quiz_answers",
    "constraint_name": "2200_21824_1_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "id IS NOT NULL"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_answers",
    "constraint_name": "quiz_answers_pkey",
    "constraint_type": "PRIMARY KEY",
    "column_name": "id",
    "ordinal_position": 1,
    "check_clause": null
  },
  {
    "table_schema": "public",
    "table_name": "quiz_attempts",
    "constraint_name": "2200_18006_1_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "id IS NOT NULL"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_attempts",
    "constraint_name": "quiz_attempts_pkey",
    "constraint_type": "PRIMARY KEY",
    "column_name": "id",
    "ordinal_position": 1,
    "check_clause": null
  },
  {
    "table_schema": "public",
    "table_name": "quiz_questions",
    "constraint_name": "2200_17993_1_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "id IS NOT NULL"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_questions",
    "constraint_name": "2200_17993_3_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "question_text IS NOT NULL"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_questions",
    "constraint_name": "quiz_questions_pkey",
    "constraint_type": "PRIMARY KEY",
    "column_name": "id",
    "ordinal_position": 1,
    "check_clause": null
  },
  {
    "table_schema": "public",
    "table_name": "quizzes",
    "constraint_name": "2200_17984_1_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "id IS NOT NULL"
  },
  {
    "table_schema": "public",
    "table_name": "quizzes",
    "constraint_name": "2200_17984_2_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "title IS NOT NULL"
  },
  {
    "table_schema": "public",
    "table_name": "quizzes",
    "constraint_name": "quizzes_pkey",
    "constraint_type": "PRIMARY KEY",
    "column_name": "id",
    "ordinal_position": 1,
    "check_clause": null
  },
  {
    "table_schema": "public",
    "table_name": "ranking_config",
    "constraint_name": "2200_35714_1_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "id IS NOT NULL"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_config",
    "constraint_name": "2200_35714_2_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "attendance_weight IS NOT NULL"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_config",
    "constraint_name": "2200_35714_3_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "quiz_weight IS NOT NULL"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_config",
    "constraint_name": "2200_35714_4_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "feedback_weight IS NOT NULL"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_config",
    "constraint_name": "2200_35714_5_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "report_weight IS NOT NULL"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_config",
    "constraint_name": "ranking_config_pkey",
    "constraint_type": "PRIMARY KEY",
    "column_name": "id",
    "ordinal_position": 1,
    "check_clause": null
  },
  {
    "table_schema": "public",
    "table_name": "ranking_history",
    "constraint_name": "2200_35749_1_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "id IS NOT NULL"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_history",
    "constraint_name": "2200_35749_2_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "member_id IS NOT NULL"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_history",
    "constraint_name": "2200_35749_3_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "year IS NOT NULL"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_history",
    "constraint_name": "2200_35749_4_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "month IS NOT NULL"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_history",
    "constraint_name": "ranking_history_pkey",
    "constraint_type": "PRIMARY KEY",
    "column_name": "id",
    "ordinal_position": 1,
    "check_clause": null
  },
  {
    "table_schema": "public",
    "table_name": "ranking_history",
    "constraint_name": "unique_member_month",
    "constraint_type": "UNIQUE",
    "column_name": "member_id",
    "ordinal_position": 1,
    "check_clause": null
  },
  {
    "table_schema": "public",
    "table_name": "ranking_history",
    "constraint_name": "unique_member_month",
    "constraint_type": "UNIQUE",
    "column_name": "year",
    "ordinal_position": 2,
    "check_clause": null
  },
  {
    "table_schema": "public",
    "table_name": "ranking_history",
    "constraint_name": "unique_member_month",
    "constraint_type": "UNIQUE",
    "column_name": "month",
    "ordinal_position": 3,
    "check_clause": null
  },
  {
    "table_schema": "public",
    "table_name": "ranking_levels",
    "constraint_name": "2200_35728_1_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "id IS NOT NULL"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_levels",
    "constraint_name": "2200_35728_2_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "name IS NOT NULL"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_levels",
    "constraint_name": "2200_35728_3_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "min_score IS NOT NULL"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_levels",
    "constraint_name": "2200_35728_4_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "max_score IS NOT NULL"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_levels",
    "constraint_name": "ranking_levels_pkey",
    "constraint_type": "PRIMARY KEY",
    "column_name": "id",
    "ordinal_position": 1,
    "check_clause": null
  },
  {
    "table_schema": "public",
    "table_name": "report_assets",
    "constraint_name": "2200_17919_1_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "id IS NOT NULL"
  },
  {
    "table_schema": "public",
    "table_name": "report_assets",
    "constraint_name": "report_assets_pkey",
    "constraint_type": "PRIMARY KEY",
    "column_name": "id",
    "ordinal_position": 1,
    "check_clause": null
  },
  {
    "table_schema": "public",
    "table_name": "report_cards",
    "constraint_name": "2200_17893_11_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "created_at IS NOT NULL"
  },
  {
    "table_schema": "public",
    "table_name": "report_cards",
    "constraint_name": "2200_17893_1_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "id IS NOT NULL"
  },
  {
    "table_schema": "public",
    "table_name": "report_cards",
    "constraint_name": "2200_17893_8_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "reason_code IS NOT NULL"
  },
  {
    "table_schema": "public",
    "table_name": "report_cards",
    "constraint_name": "report_cards_pkey",
    "constraint_type": "PRIMARY KEY",
    "column_name": "id",
    "ordinal_position": 1,
    "check_clause": null
  },
  {
    "table_schema": "public",
    "table_name": "report_goals",
    "constraint_name": "2200_17878_1_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "id IS NOT NULL"
  },
  {
    "table_schema": "public",
    "table_name": "report_goals",
    "constraint_name": "2200_17878_3_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "team IS NOT NULL"
  },
  {
    "table_schema": "public",
    "table_name": "report_goals",
    "constraint_name": "report_goals_pkey",
    "constraint_type": "PRIMARY KEY",
    "column_name": "id",
    "ordinal_position": 1,
    "check_clause": null
  },
  {
    "table_schema": "public",
    "table_name": "report_injuries",
    "constraint_name": "2200_17906_1_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "id IS NOT NULL"
  },
  {
    "table_schema": "public",
    "table_name": "report_injuries",
    "constraint_name": "report_injuries_pkey",
    "constraint_type": "PRIMARY KEY",
    "column_name": "id",
    "ordinal_position": 1,
    "check_clause": null
  },
  {
    "table_schema": "tournaments",
    "table_name": "division_seasons",
    "constraint_name": "50949_51749_1_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "id IS NOT NULL"
  },
  {
    "table_schema": "tournaments",
    "table_name": "division_seasons",
    "constraint_name": "50949_51749_2_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "division_id IS NOT NULL"
  },
  {
    "table_schema": "tournaments",
    "table_name": "division_seasons",
    "constraint_name": "50949_51749_3_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "season_id IS NOT NULL"
  },
  {
    "table_schema": "tournaments",
    "table_name": "division_seasons",
    "constraint_name": "50949_51749_4_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "active IS NOT NULL"
  },
  {
    "table_schema": "tournaments",
    "table_name": "division_seasons",
    "constraint_name": "50949_51749_5_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "created_at IS NOT NULL"
  },
  {
    "table_schema": "tournaments",
    "table_name": "division_seasons",
    "constraint_name": "50949_51749_6_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "updated_at IS NOT NULL"
  },
  {
    "table_schema": "tournaments",
    "table_name": "division_seasons",
    "constraint_name": "division_seasons_pkey",
    "constraint_type": "PRIMARY KEY",
    "column_name": "id",
    "ordinal_position": 1,
    "check_clause": null
  },
  {
    "table_schema": "tournaments",
    "table_name": "division_seasons",
    "constraint_name": "division_seasons_division_season_unique",
    "constraint_type": "UNIQUE",
    "column_name": "division_id",
    "ordinal_position": 1,
    "check_clause": null
  },
  {
    "table_schema": "tournaments",
    "table_name": "division_seasons",
    "constraint_name": "division_seasons_division_season_unique",
    "constraint_type": "UNIQUE",
    "column_name": "season_id",
    "ordinal_position": 2,
    "check_clause": null
  },
  {
    "table_schema": "tournaments",
    "table_name": "divisions",
    "constraint_name": "50949_50966_1_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "id IS NOT NULL"
  },
  {
    "table_schema": "tournaments",
    "table_name": "divisions",
    "constraint_name": "50949_50966_2_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "organization_id IS NOT NULL"
  },
  {
    "table_schema": "tournaments",
    "table_name": "divisions",
    "constraint_name": "50949_50966_3_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "name IS NOT NULL"
  },
  {
    "table_schema": "tournaments",
    "table_name": "divisions",
    "constraint_name": "50949_50966_5_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "active IS NOT NULL"
  },
  {
    "table_schema": "tournaments",
    "table_name": "divisions",
    "constraint_name": "divisions_pkey",
    "constraint_type": "PRIMARY KEY",
    "column_name": "id",
    "ordinal_position": 1,
    "check_clause": null
  },
  {
    "table_schema": "tournaments",
    "table_name": "divisions",
    "constraint_name": "divisions_organization_name_unique",
    "constraint_type": "UNIQUE",
    "column_name": "organization_id",
    "ordinal_position": 1,
    "check_clause": null
  },
  {
    "table_schema": "tournaments",
    "table_name": "divisions",
    "constraint_name": "divisions_organization_name_unique",
    "constraint_type": "UNIQUE",
    "column_name": "name",
    "ordinal_position": 2,
    "check_clause": null
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_context",
    "constraint_name": "50949_51824_1_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "match_id IS NOT NULL"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_context",
    "constraint_name": "50949_51824_2_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "division_season_id IS NOT NULL"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_context",
    "constraint_name": "50949_51824_3_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "home_team_registration_id IS NOT NULL"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_context",
    "constraint_name": "50949_51824_4_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "away_team_registration_id IS NOT NULL"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_context",
    "constraint_name": "50949_51824_5_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "created_at IS NOT NULL"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_context",
    "constraint_name": "50949_51824_6_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "updated_at IS NOT NULL"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_context",
    "constraint_name": "match_context_different_teams_check",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "(home_team_registration_id <> away_team_registration_id)"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_context",
    "constraint_name": "match_context_pkey",
    "constraint_type": "PRIMARY KEY",
    "column_name": "match_id",
    "ordinal_position": 1,
    "check_clause": null
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_context_logs",
    "constraint_name": "50949_51891_1_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "id IS NOT NULL"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_context_logs",
    "constraint_name": "50949_51891_2_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "match_id IS NOT NULL"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_context_logs",
    "constraint_name": "50949_51891_3_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "status IS NOT NULL"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_context_logs",
    "constraint_name": "50949_51891_5_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "message IS NOT NULL"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_context_logs",
    "constraint_name": "50949_51891_7_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "created_at IS NOT NULL"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_context_logs",
    "constraint_name": "match_context_logs_status_check",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "(status = ANY (ARRAY['success'::text, 'warning'::text, 'failed'::text]))"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_context_logs",
    "constraint_name": "match_context_logs_pkey",
    "constraint_type": "PRIMARY KEY",
    "column_name": "id",
    "ordinal_position": 1,
    "check_clause": null
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_rosters",
    "constraint_name": "50949_51027_1_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "id IS NOT NULL"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_rosters",
    "constraint_name": "50949_51027_2_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "match_id IS NOT NULL"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_rosters",
    "constraint_name": "50949_51027_3_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "player_id IS NOT NULL"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_rosters",
    "constraint_name": "50949_51027_4_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "team_id IS NOT NULL"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_rosters",
    "constraint_name": "match_rosters_pkey",
    "constraint_type": "PRIMARY KEY",
    "column_name": "id",
    "ordinal_position": 1,
    "check_clause": null
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_rosters",
    "constraint_name": "match_rosters_match_id_player_id_key",
    "constraint_type": "UNIQUE",
    "column_name": "match_id",
    "ordinal_position": 1,
    "check_clause": null
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_rosters",
    "constraint_name": "match_rosters_match_id_player_id_key",
    "constraint_type": "UNIQUE",
    "column_name": "player_id",
    "ordinal_position": 2,
    "check_clause": null
  },
  {
    "table_schema": "tournaments",
    "table_name": "organizations",
    "constraint_name": "50949_50950_1_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "id IS NOT NULL"
  },
  {
    "table_schema": "tournaments",
    "table_name": "organizations",
    "constraint_name": "50949_50950_2_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "name IS NOT NULL"
  },
  {
    "table_schema": "tournaments",
    "table_name": "organizations",
    "constraint_name": "50949_50950_3_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "slug IS NOT NULL"
  },
  {
    "table_schema": "tournaments",
    "table_name": "organizations",
    "constraint_name": "organizations_pkey",
    "constraint_type": "PRIMARY KEY",
    "column_name": "id",
    "ordinal_position": 1,
    "check_clause": null
  },
  {
    "table_schema": "tournaments",
    "table_name": "organizations",
    "constraint_name": "organizations_name_key",
    "constraint_type": "UNIQUE",
    "column_name": "name",
    "ordinal_position": 1,
    "check_clause": null
  },
  {
    "table_schema": "tournaments",
    "table_name": "organizations",
    "constraint_name": "organizations_slug_key",
    "constraint_type": "UNIQUE",
    "column_name": "slug",
    "ordinal_position": 1,
    "check_clause": null
  },
  {
    "table_schema": "tournaments",
    "table_name": "player_registrations",
    "constraint_name": "50949_51799_1_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "id IS NOT NULL"
  },
  {
    "table_schema": "tournaments",
    "table_name": "player_registrations",
    "constraint_name": "50949_51799_2_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "player_id IS NOT NULL"
  },
  {
    "table_schema": "tournaments",
    "table_name": "player_registrations",
    "constraint_name": "50949_51799_3_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "team_registration_id IS NOT NULL"
  },
  {
    "table_schema": "tournaments",
    "table_name": "player_registrations",
    "constraint_name": "50949_51799_4_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "active IS NOT NULL"
  },
  {
    "table_schema": "tournaments",
    "table_name": "player_registrations",
    "constraint_name": "50949_51799_5_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "registered_at IS NOT NULL"
  },
  {
    "table_schema": "tournaments",
    "table_name": "player_registrations",
    "constraint_name": "50949_51799_6_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "created_at IS NOT NULL"
  },
  {
    "table_schema": "tournaments",
    "table_name": "player_registrations",
    "constraint_name": "50949_51799_7_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "updated_at IS NOT NULL"
  },
  {
    "table_schema": "tournaments",
    "table_name": "player_registrations",
    "constraint_name": "player_registrations_pkey",
    "constraint_type": "PRIMARY KEY",
    "column_name": "id",
    "ordinal_position": 1,
    "check_clause": null
  },
  {
    "table_schema": "tournaments",
    "table_name": "player_registrations",
    "constraint_name": "player_registrations_player_team_registration_unique",
    "constraint_type": "UNIQUE",
    "column_name": "player_id",
    "ordinal_position": 1,
    "check_clause": null
  },
  {
    "table_schema": "tournaments",
    "table_name": "player_registrations",
    "constraint_name": "player_registrations_player_team_registration_unique",
    "constraint_type": "UNIQUE",
    "column_name": "team_registration_id",
    "ordinal_position": 2,
    "check_clause": null
  },
  {
    "table_schema": "tournaments",
    "table_name": "players",
    "constraint_name": "50949_51005_1_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "id IS NOT NULL"
  },
  {
    "table_schema": "tournaments",
    "table_name": "players",
    "constraint_name": "50949_51005_2_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "organization_id IS NOT NULL"
  },
  {
    "table_schema": "tournaments",
    "table_name": "players",
    "constraint_name": "50949_51005_5_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "first_name IS NOT NULL"
  },
  {
    "table_schema": "tournaments",
    "table_name": "players",
    "constraint_name": "50949_51005_6_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "last_name IS NOT NULL"
  },
  {
    "table_schema": "tournaments",
    "table_name": "players",
    "constraint_name": "50949_51005_9_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "active IS NOT NULL"
  },
  {
    "table_schema": "tournaments",
    "table_name": "players",
    "constraint_name": "players_pkey",
    "constraint_type": "PRIMARY KEY",
    "column_name": "id",
    "ordinal_position": 1,
    "check_clause": null
  },
  {
    "table_schema": "tournaments",
    "table_name": "players",
    "constraint_name": "players_org_external_player_unique",
    "constraint_type": "UNIQUE",
    "column_name": "organization_id",
    "ordinal_position": 1,
    "check_clause": null
  },
  {
    "table_schema": "tournaments",
    "table_name": "players",
    "constraint_name": "players_org_external_player_unique",
    "constraint_type": "UNIQUE",
    "column_name": "external_player_id",
    "ordinal_position": 2,
    "check_clause": null
  },
  {
    "table_schema": "tournaments",
    "table_name": "players",
    "constraint_name": "players_organization_external_id_unique",
    "constraint_type": "UNIQUE",
    "column_name": "organization_id",
    "ordinal_position": 1,
    "check_clause": null
  },
  {
    "table_schema": "tournaments",
    "table_name": "players",
    "constraint_name": "players_organization_external_id_unique",
    "constraint_type": "UNIQUE",
    "column_name": "external_player_id",
    "ordinal_position": 2,
    "check_clause": null
  },
  {
    "table_schema": "tournaments",
    "table_name": "seasons",
    "constraint_name": "50949_51723_1_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "id IS NOT NULL"
  },
  {
    "table_schema": "tournaments",
    "table_name": "seasons",
    "constraint_name": "50949_51723_2_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "organization_id IS NOT NULL"
  },
  {
    "table_schema": "tournaments",
    "table_name": "seasons",
    "constraint_name": "50949_51723_3_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "term IS NOT NULL"
  },
  {
    "table_schema": "tournaments",
    "table_name": "seasons",
    "constraint_name": "50949_51723_4_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "year IS NOT NULL"
  },
  {
    "table_schema": "tournaments",
    "table_name": "seasons",
    "constraint_name": "50949_51723_7_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "status IS NOT NULL"
  },
  {
    "table_schema": "tournaments",
    "table_name": "seasons",
    "constraint_name": "50949_51723_8_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "created_at IS NOT NULL"
  },
  {
    "table_schema": "tournaments",
    "table_name": "seasons",
    "constraint_name": "50949_51723_9_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "updated_at IS NOT NULL"
  },
  {
    "table_schema": "tournaments",
    "table_name": "seasons",
    "constraint_name": "seasons_date_range_check",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "((starts_at IS NULL) OR (ends_at IS NULL) OR (starts_at <= ends_at))"
  },
  {
    "table_schema": "tournaments",
    "table_name": "seasons",
    "constraint_name": "seasons_status_check",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "(status = ANY (ARRAY['upcoming'::text, 'active'::text, 'archived'::text]))"
  },
  {
    "table_schema": "tournaments",
    "table_name": "seasons",
    "constraint_name": "seasons_term_check",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "(term = ANY (ARRAY['Spring'::text, 'Winter'::text, 'Fall'::text]))"
  },
  {
    "table_schema": "tournaments",
    "table_name": "seasons",
    "constraint_name": "seasons_year_check",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "((year >= 2000) AND (year <= 2100))"
  },
  {
    "table_schema": "tournaments",
    "table_name": "seasons",
    "constraint_name": "seasons_pkey",
    "constraint_type": "PRIMARY KEY",
    "column_name": "id",
    "ordinal_position": 1,
    "check_clause": null
  },
  {
    "table_schema": "tournaments",
    "table_name": "seasons",
    "constraint_name": "seasons_organization_term_year_unique",
    "constraint_type": "UNIQUE",
    "column_name": "organization_id",
    "ordinal_position": 1,
    "check_clause": null
  },
  {
    "table_schema": "tournaments",
    "table_name": "seasons",
    "constraint_name": "seasons_organization_term_year_unique",
    "constraint_type": "UNIQUE",
    "column_name": "term",
    "ordinal_position": 2,
    "check_clause": null
  },
  {
    "table_schema": "tournaments",
    "table_name": "seasons",
    "constraint_name": "seasons_organization_term_year_unique",
    "constraint_type": "UNIQUE",
    "column_name": "year",
    "ordinal_position": 3,
    "check_clause": null
  },
  {
    "table_schema": "tournaments",
    "table_name": "team_registrations",
    "constraint_name": "50949_51773_1_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "id IS NOT NULL"
  },
  {
    "table_schema": "tournaments",
    "table_name": "team_registrations",
    "constraint_name": "50949_51773_2_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "team_id IS NOT NULL"
  },
  {
    "table_schema": "tournaments",
    "table_name": "team_registrations",
    "constraint_name": "50949_51773_3_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "division_season_id IS NOT NULL"
  },
  {
    "table_schema": "tournaments",
    "table_name": "team_registrations",
    "constraint_name": "50949_51773_5_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "active IS NOT NULL"
  },
  {
    "table_schema": "tournaments",
    "table_name": "team_registrations",
    "constraint_name": "50949_51773_6_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "created_at IS NOT NULL"
  },
  {
    "table_schema": "tournaments",
    "table_name": "team_registrations",
    "constraint_name": "50949_51773_7_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "updated_at IS NOT NULL"
  },
  {
    "table_schema": "tournaments",
    "table_name": "team_registrations",
    "constraint_name": "team_registrations_pkey",
    "constraint_type": "PRIMARY KEY",
    "column_name": "id",
    "ordinal_position": 1,
    "check_clause": null
  },
  {
    "table_schema": "tournaments",
    "table_name": "team_registrations",
    "constraint_name": "team_registrations_team_division_season_unique",
    "constraint_type": "UNIQUE",
    "column_name": "team_id",
    "ordinal_position": 1,
    "check_clause": null
  },
  {
    "table_schema": "tournaments",
    "table_name": "team_registrations",
    "constraint_name": "team_registrations_team_division_season_unique",
    "constraint_type": "UNIQUE",
    "column_name": "division_season_id",
    "ordinal_position": 2,
    "check_clause": null
  },
  {
    "table_schema": "tournaments",
    "table_name": "teams",
    "constraint_name": "50949_50983_1_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "id IS NOT NULL"
  },
  {
    "table_schema": "tournaments",
    "table_name": "teams",
    "constraint_name": "50949_50983_2_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "organization_id IS NOT NULL"
  },
  {
    "table_schema": "tournaments",
    "table_name": "teams",
    "constraint_name": "50949_50983_5_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "name IS NOT NULL"
  },
  {
    "table_schema": "tournaments",
    "table_name": "teams",
    "constraint_name": "50949_50983_6_not_null",
    "constraint_type": "CHECK",
    "column_name": null,
    "ordinal_position": null,
    "check_clause": "active IS NOT NULL"
  },
  {
    "table_schema": "tournaments",
    "table_name": "teams",
    "constraint_name": "teams_pkey",
    "constraint_type": "PRIMARY KEY",
    "column_name": "id",
    "ordinal_position": 1,
    "check_clause": null
  },
  {
    "table_schema": "tournaments",
    "table_name": "teams",
    "constraint_name": "teams_organization_name_unique",
    "constraint_type": "UNIQUE",
    "column_name": "organization_id",
    "ordinal_position": 1,
    "check_clause": null
  },
  {
    "table_schema": "tournaments",
    "table_name": "teams",
    "constraint_name": "teams_organization_name_unique",
    "constraint_type": "UNIQUE",
    "column_name": "name",
    "ordinal_position": 2,
    "check_clause": null
  }
]
```

---

## Result Interpretation

Each row represents a structural database constraint or one of the columns participating in that constraint.

Important fields:

- `table_schema` — schema containing the table.
- `table_name` — table protected by the constraint.
- `constraint_name` — PostgreSQL constraint name.
- `constraint_type` — constraint category.
- `column_name` — column participating in a primary key or unique constraint.
- `ordinal_position` — position of the column inside a multi-column constraint.
- `check_clause` — expression enforced by a check constraint.

Constraint types:

### PRIMARY KEY

Defines the primary identifier for a table.

A primary key also implies:

- uniqueness
- non-null values

### UNIQUE

Prevents duplicate values for the constrained column or column combination.

Composite unique constraints may appear as multiple rows sharing the same `constraint_name`.

### CHECK

Enforces a logical condition on inserted or updated data.

Examples may include:

- allowed numeric ranges
- date relationships
- required combinations of fields
- valid status combinations

---

## Audit Notes

This inventory does not include:

- Foreign key relationships
- Indexes that are not represented by constraints
- RLS policies
- Triggers
- Functions
- Application-level validation

A database object must not be considered safe to remove merely because it has few or no constraints.

Primary keys and unique constraints may also be referenced indirectly by foreign keys, application logic, or database functions.

---

## Preliminary Observation

Constraint structure will later help identify:

- Canonical identifiers
- Natural uniqueness rules
- Duplicate-protection mechanisms
- Domain invariants enforced directly by PostgreSQL
- Potential dependencies that must be preserved during cleanup

No constraint is classified as obsolete from this inventory alone.

---

## Audit Status

**Constraint inventory captured — classification pending.**

No database changes were performed as part of this audit.