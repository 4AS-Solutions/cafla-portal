# Supabase Grants and Privileges

## Purpose

Capture the PostgreSQL privileges currently granted on CAFLA database objects.

This audit complements Row Level Security by documenting which PostgreSQL roles are allowed to interact with tables, views, and functions.

RLS and privileges must be evaluated together to understand the effective database access model.

---

## Scope

Schemas included:

- `public`
- `tournaments`
- `development`

Privileges audited:

- Table and view privileges
- Function/routine privileges

---

# Part 1 — Table and View Privileges

## Query

```sql
select
  table_schema,
  table_name,
  grantee,
  privilege_type,
  is_grantable
from information_schema.role_table_grants
where table_schema in ('public', 'tournaments', 'development')
order by
  table_schema,
  table_name,
  grantee,
  privilege_type;
```

## Result

```json
[
  {
    "table_schema": "development",
    "table_name": "attendance_records",
    "grantee": "postgres",
    "privilege_type": "DELETE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "attendance_records",
    "grantee": "postgres",
    "privilege_type": "INSERT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "attendance_records",
    "grantee": "postgres",
    "privilege_type": "REFERENCES",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "attendance_records",
    "grantee": "postgres",
    "privilege_type": "SELECT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "attendance_records",
    "grantee": "postgres",
    "privilege_type": "TRIGGER",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "attendance_records",
    "grantee": "postgres",
    "privilege_type": "TRUNCATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "attendance_records",
    "grantee": "postgres",
    "privilege_type": "UPDATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "attendance_records",
    "grantee": "service_role",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "attendance_records",
    "grantee": "service_role",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "attendance_records",
    "grantee": "service_role",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "attendance_records",
    "grantee": "service_role",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "attendance_scoring_rules",
    "grantee": "postgres",
    "privilege_type": "DELETE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "attendance_scoring_rules",
    "grantee": "postgres",
    "privilege_type": "INSERT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "attendance_scoring_rules",
    "grantee": "postgres",
    "privilege_type": "REFERENCES",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "attendance_scoring_rules",
    "grantee": "postgres",
    "privilege_type": "SELECT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "attendance_scoring_rules",
    "grantee": "postgres",
    "privilege_type": "TRIGGER",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "attendance_scoring_rules",
    "grantee": "postgres",
    "privilege_type": "TRUNCATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "attendance_scoring_rules",
    "grantee": "postgres",
    "privilege_type": "UPDATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "attendance_scoring_rules",
    "grantee": "service_role",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "attendance_scoring_rules",
    "grantee": "service_role",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "attendance_scoring_rules",
    "grantee": "service_role",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "attendance_scoring_rules",
    "grantee": "service_role",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "attendance_sessions",
    "grantee": "postgres",
    "privilege_type": "DELETE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "attendance_sessions",
    "grantee": "postgres",
    "privilege_type": "INSERT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "attendance_sessions",
    "grantee": "postgres",
    "privilege_type": "REFERENCES",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "attendance_sessions",
    "grantee": "postgres",
    "privilege_type": "SELECT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "attendance_sessions",
    "grantee": "postgres",
    "privilege_type": "TRIGGER",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "attendance_sessions",
    "grantee": "postgres",
    "privilege_type": "TRUNCATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "attendance_sessions",
    "grantee": "postgres",
    "privilege_type": "UPDATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "attendance_sessions",
    "grantee": "service_role",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "attendance_sessions",
    "grantee": "service_role",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "attendance_sessions",
    "grantee": "service_role",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "attendance_sessions",
    "grantee": "service_role",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "current_ranking_snapshot",
    "grantee": "authenticated",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "current_ranking_snapshot",
    "grantee": "postgres",
    "privilege_type": "DELETE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "current_ranking_snapshot",
    "grantee": "postgres",
    "privilege_type": "INSERT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "current_ranking_snapshot",
    "grantee": "postgres",
    "privilege_type": "REFERENCES",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "current_ranking_snapshot",
    "grantee": "postgres",
    "privilege_type": "SELECT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "current_ranking_snapshot",
    "grantee": "postgres",
    "privilege_type": "TRIGGER",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "current_ranking_snapshot",
    "grantee": "postgres",
    "privilege_type": "TRUNCATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "current_ranking_snapshot",
    "grantee": "postgres",
    "privilege_type": "UPDATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "current_ranking_snapshot",
    "grantee": "service_role",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "current_ranking_snapshot",
    "grantee": "service_role",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "current_ranking_snapshot",
    "grantee": "service_role",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "current_ranking_snapshot",
    "grantee": "service_role",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "cycle_members",
    "grantee": "postgres",
    "privilege_type": "DELETE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "cycle_members",
    "grantee": "postgres",
    "privilege_type": "INSERT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "cycle_members",
    "grantee": "postgres",
    "privilege_type": "REFERENCES",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "cycle_members",
    "grantee": "postgres",
    "privilege_type": "SELECT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "cycle_members",
    "grantee": "postgres",
    "privilege_type": "TRIGGER",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "cycle_members",
    "grantee": "postgres",
    "privilege_type": "TRUNCATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "cycle_members",
    "grantee": "postgres",
    "privilege_type": "UPDATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "cycle_members",
    "grantee": "service_role",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "cycle_members",
    "grantee": "service_role",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "cycle_members",
    "grantee": "service_role",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "cycle_members",
    "grantee": "service_role",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "cycle_months_v2",
    "grantee": "postgres",
    "privilege_type": "DELETE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "cycle_months_v2",
    "grantee": "postgres",
    "privilege_type": "INSERT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "cycle_months_v2",
    "grantee": "postgres",
    "privilege_type": "REFERENCES",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "cycle_months_v2",
    "grantee": "postgres",
    "privilege_type": "SELECT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "cycle_months_v2",
    "grantee": "postgres",
    "privilege_type": "TRIGGER",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "cycle_months_v2",
    "grantee": "postgres",
    "privilege_type": "TRUNCATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "cycle_months_v2",
    "grantee": "postgres",
    "privilege_type": "UPDATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "cycle_months_v2",
    "grantee": "service_role",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "cycle_months_v2",
    "grantee": "service_role",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "cycle_months_v2",
    "grantee": "service_role",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "cycle_months_v2",
    "grantee": "service_role",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "cycles",
    "grantee": "postgres",
    "privilege_type": "DELETE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "cycles",
    "grantee": "postgres",
    "privilege_type": "INSERT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "cycles",
    "grantee": "postgres",
    "privilege_type": "REFERENCES",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "cycles",
    "grantee": "postgres",
    "privilege_type": "SELECT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "cycles",
    "grantee": "postgres",
    "privilege_type": "TRIGGER",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "cycles",
    "grantee": "postgres",
    "privilege_type": "TRUNCATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "cycles",
    "grantee": "postgres",
    "privilege_type": "UPDATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "cycles",
    "grantee": "service_role",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "cycles",
    "grantee": "service_role",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "cycles",
    "grantee": "service_role",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "cycles",
    "grantee": "service_role",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "monthly_ranking_snapshots",
    "grantee": "authenticated",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "monthly_ranking_snapshots",
    "grantee": "postgres",
    "privilege_type": "DELETE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "monthly_ranking_snapshots",
    "grantee": "postgres",
    "privilege_type": "INSERT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "monthly_ranking_snapshots",
    "grantee": "postgres",
    "privilege_type": "REFERENCES",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "monthly_ranking_snapshots",
    "grantee": "postgres",
    "privilege_type": "SELECT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "monthly_ranking_snapshots",
    "grantee": "postgres",
    "privilege_type": "TRIGGER",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "monthly_ranking_snapshots",
    "grantee": "postgres",
    "privilege_type": "TRUNCATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "monthly_ranking_snapshots",
    "grantee": "postgres",
    "privilege_type": "UPDATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "monthly_ranking_snapshots",
    "grantee": "service_role",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "monthly_ranking_snapshots",
    "grantee": "service_role",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "monthly_ranking_snapshots",
    "grantee": "service_role",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "monthly_ranking_snapshots",
    "grantee": "service_role",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_access_grants",
    "grantee": "postgres",
    "privilege_type": "DELETE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_access_grants",
    "grantee": "postgres",
    "privilege_type": "INSERT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_access_grants",
    "grantee": "postgres",
    "privilege_type": "REFERENCES",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_access_grants",
    "grantee": "postgres",
    "privilege_type": "SELECT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_access_grants",
    "grantee": "postgres",
    "privilege_type": "TRIGGER",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_access_grants",
    "grantee": "postgres",
    "privilege_type": "TRUNCATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_access_grants",
    "grantee": "postgres",
    "privilege_type": "UPDATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_access_grants",
    "grantee": "service_role",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_access_grants",
    "grantee": "service_role",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_access_grants",
    "grantee": "service_role",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_access_grants",
    "grantee": "service_role",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_answers",
    "grantee": "postgres",
    "privilege_type": "DELETE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_answers",
    "grantee": "postgres",
    "privilege_type": "INSERT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_answers",
    "grantee": "postgres",
    "privilege_type": "REFERENCES",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_answers",
    "grantee": "postgres",
    "privilege_type": "SELECT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_answers",
    "grantee": "postgres",
    "privilege_type": "TRIGGER",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_answers",
    "grantee": "postgres",
    "privilege_type": "TRUNCATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_answers",
    "grantee": "postgres",
    "privilege_type": "UPDATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_answers",
    "grantee": "service_role",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_answers",
    "grantee": "service_role",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_answers",
    "grantee": "service_role",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_answers",
    "grantee": "service_role",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_assessments",
    "grantee": "postgres",
    "privilege_type": "DELETE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_assessments",
    "grantee": "postgres",
    "privilege_type": "INSERT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_assessments",
    "grantee": "postgres",
    "privilege_type": "REFERENCES",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_assessments",
    "grantee": "postgres",
    "privilege_type": "SELECT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_assessments",
    "grantee": "postgres",
    "privilege_type": "TRIGGER",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_assessments",
    "grantee": "postgres",
    "privilege_type": "TRUNCATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_assessments",
    "grantee": "postgres",
    "privilege_type": "UPDATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_assessments",
    "grantee": "service_role",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_assessments",
    "grantee": "service_role",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_assessments",
    "grantee": "service_role",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_assessments",
    "grantee": "service_role",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_attempt_questions",
    "grantee": "postgres",
    "privilege_type": "DELETE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_attempt_questions",
    "grantee": "postgres",
    "privilege_type": "INSERT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_attempt_questions",
    "grantee": "postgres",
    "privilege_type": "REFERENCES",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_attempt_questions",
    "grantee": "postgres",
    "privilege_type": "SELECT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_attempt_questions",
    "grantee": "postgres",
    "privilege_type": "TRIGGER",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_attempt_questions",
    "grantee": "postgres",
    "privilege_type": "TRUNCATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_attempt_questions",
    "grantee": "postgres",
    "privilege_type": "UPDATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_attempt_questions",
    "grantee": "service_role",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_attempt_questions",
    "grantee": "service_role",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_attempt_questions",
    "grantee": "service_role",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_attempt_questions",
    "grantee": "service_role",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_attempts",
    "grantee": "postgres",
    "privilege_type": "DELETE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_attempts",
    "grantee": "postgres",
    "privilege_type": "INSERT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_attempts",
    "grantee": "postgres",
    "privilege_type": "REFERENCES",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_attempts",
    "grantee": "postgres",
    "privilege_type": "SELECT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_attempts",
    "grantee": "postgres",
    "privilege_type": "TRIGGER",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_attempts",
    "grantee": "postgres",
    "privilege_type": "TRUNCATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_attempts",
    "grantee": "postgres",
    "privilege_type": "UPDATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_attempts",
    "grantee": "service_role",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_attempts",
    "grantee": "service_role",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_attempts",
    "grantee": "service_role",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_attempts",
    "grantee": "service_role",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_member_best_results",
    "grantee": "postgres",
    "privilege_type": "DELETE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_member_best_results",
    "grantee": "postgres",
    "privilege_type": "INSERT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_member_best_results",
    "grantee": "postgres",
    "privilege_type": "REFERENCES",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_member_best_results",
    "grantee": "postgres",
    "privilege_type": "SELECT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_member_best_results",
    "grantee": "postgres",
    "privilege_type": "TRIGGER",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_member_best_results",
    "grantee": "postgres",
    "privilege_type": "TRUNCATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_member_best_results",
    "grantee": "postgres",
    "privilege_type": "UPDATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_member_best_results",
    "grantee": "service_role",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_member_best_results",
    "grantee": "service_role",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_member_best_results",
    "grantee": "service_role",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_member_best_results",
    "grantee": "service_role",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_question_groups",
    "grantee": "postgres",
    "privilege_type": "DELETE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_question_groups",
    "grantee": "postgres",
    "privilege_type": "INSERT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_question_groups",
    "grantee": "postgres",
    "privilege_type": "REFERENCES",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_question_groups",
    "grantee": "postgres",
    "privilege_type": "SELECT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_question_groups",
    "grantee": "postgres",
    "privilege_type": "TRIGGER",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_question_groups",
    "grantee": "postgres",
    "privilege_type": "TRUNCATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_question_groups",
    "grantee": "postgres",
    "privilege_type": "UPDATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_question_groups",
    "grantee": "service_role",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_question_groups",
    "grantee": "service_role",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_question_groups",
    "grantee": "service_role",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_question_groups",
    "grantee": "service_role",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_question_options",
    "grantee": "postgres",
    "privilege_type": "DELETE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_question_options",
    "grantee": "postgres",
    "privilege_type": "INSERT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_question_options",
    "grantee": "postgres",
    "privilege_type": "REFERENCES",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_question_options",
    "grantee": "postgres",
    "privilege_type": "SELECT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_question_options",
    "grantee": "postgres",
    "privilege_type": "TRIGGER",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_question_options",
    "grantee": "postgres",
    "privilege_type": "TRUNCATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_question_options",
    "grantee": "postgres",
    "privilege_type": "UPDATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_question_options",
    "grantee": "service_role",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_question_options",
    "grantee": "service_role",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_question_options",
    "grantee": "service_role",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_question_options",
    "grantee": "service_role",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_questions",
    "grantee": "postgres",
    "privilege_type": "DELETE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_questions",
    "grantee": "postgres",
    "privilege_type": "INSERT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_questions",
    "grantee": "postgres",
    "privilege_type": "REFERENCES",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_questions",
    "grantee": "postgres",
    "privilege_type": "SELECT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_questions",
    "grantee": "postgres",
    "privilege_type": "TRIGGER",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_questions",
    "grantee": "postgres",
    "privilege_type": "TRUNCATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_questions",
    "grantee": "postgres",
    "privilege_type": "UPDATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_questions",
    "grantee": "service_role",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_questions",
    "grantee": "service_role",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_questions",
    "grantee": "service_role",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_questions",
    "grantee": "service_role",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_versions",
    "grantee": "postgres",
    "privilege_type": "DELETE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_versions",
    "grantee": "postgres",
    "privilege_type": "INSERT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_versions",
    "grantee": "postgres",
    "privilege_type": "REFERENCES",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_versions",
    "grantee": "postgres",
    "privilege_type": "SELECT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_versions",
    "grantee": "postgres",
    "privilege_type": "TRIGGER",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_versions",
    "grantee": "postgres",
    "privilege_type": "TRUNCATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_versions",
    "grantee": "postgres",
    "privilege_type": "UPDATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_versions",
    "grantee": "service_role",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_versions",
    "grantee": "service_role",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_versions",
    "grantee": "service_role",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "quiz_versions",
    "grantee": "service_role",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "referee_attendance",
    "grantee": "postgres",
    "privilege_type": "DELETE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_attendance",
    "grantee": "postgres",
    "privilege_type": "INSERT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_attendance",
    "grantee": "postgres",
    "privilege_type": "REFERENCES",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_attendance",
    "grantee": "postgres",
    "privilege_type": "SELECT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_attendance",
    "grantee": "postgres",
    "privilege_type": "TRIGGER",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_attendance",
    "grantee": "postgres",
    "privilege_type": "TRUNCATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_attendance",
    "grantee": "postgres",
    "privilege_type": "UPDATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_attendance",
    "grantee": "service_role",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "referee_attendance",
    "grantee": "service_role",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "referee_attendance",
    "grantee": "service_role",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "referee_attendance",
    "grantee": "service_role",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "referee_attendance_detail",
    "grantee": "postgres",
    "privilege_type": "DELETE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_attendance_detail",
    "grantee": "postgres",
    "privilege_type": "INSERT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_attendance_detail",
    "grantee": "postgres",
    "privilege_type": "REFERENCES",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_attendance_detail",
    "grantee": "postgres",
    "privilege_type": "SELECT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_attendance_detail",
    "grantee": "postgres",
    "privilege_type": "TRIGGER",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_attendance_detail",
    "grantee": "postgres",
    "privilege_type": "TRUNCATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_attendance_detail",
    "grantee": "postgres",
    "privilege_type": "UPDATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_attendance_detail",
    "grantee": "service_role",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "referee_attendance_detail",
    "grantee": "service_role",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "referee_attendance_detail",
    "grantee": "service_role",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "referee_attendance_detail",
    "grantee": "service_role",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "referee_current_ranking_v2",
    "grantee": "postgres",
    "privilege_type": "DELETE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_current_ranking_v2",
    "grantee": "postgres",
    "privilege_type": "INSERT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_current_ranking_v2",
    "grantee": "postgres",
    "privilege_type": "REFERENCES",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_current_ranking_v2",
    "grantee": "postgres",
    "privilege_type": "SELECT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_current_ranking_v2",
    "grantee": "postgres",
    "privilege_type": "TRIGGER",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_current_ranking_v2",
    "grantee": "postgres",
    "privilege_type": "TRUNCATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_current_ranking_v2",
    "grantee": "postgres",
    "privilege_type": "UPDATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_current_ranking_v2",
    "grantee": "service_role",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "referee_current_ranking_v2",
    "grantee": "service_role",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "referee_current_ranking_v2",
    "grantee": "service_role",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "referee_current_ranking_v2",
    "grantee": "service_role",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "referee_cycle_development_score_v2",
    "grantee": "postgres",
    "privilege_type": "DELETE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_cycle_development_score_v2",
    "grantee": "postgres",
    "privilege_type": "INSERT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_cycle_development_score_v2",
    "grantee": "postgres",
    "privilege_type": "REFERENCES",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_cycle_development_score_v2",
    "grantee": "postgres",
    "privilege_type": "SELECT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_cycle_development_score_v2",
    "grantee": "postgres",
    "privilege_type": "TRIGGER",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_cycle_development_score_v2",
    "grantee": "postgres",
    "privilege_type": "TRUNCATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_cycle_development_score_v2",
    "grantee": "postgres",
    "privilege_type": "UPDATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_cycle_development_score_v2",
    "grantee": "service_role",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "referee_cycle_development_score_v2",
    "grantee": "service_role",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "referee_cycle_development_score_v2",
    "grantee": "service_role",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "referee_cycle_development_score_v2",
    "grantee": "service_role",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "referee_cycle_ranking_evidence_v2",
    "grantee": "postgres",
    "privilege_type": "DELETE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_cycle_ranking_evidence_v2",
    "grantee": "postgres",
    "privilege_type": "INSERT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_cycle_ranking_evidence_v2",
    "grantee": "postgres",
    "privilege_type": "REFERENCES",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_cycle_ranking_evidence_v2",
    "grantee": "postgres",
    "privilege_type": "SELECT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_cycle_ranking_evidence_v2",
    "grantee": "postgres",
    "privilege_type": "TRIGGER",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_cycle_ranking_evidence_v2",
    "grantee": "postgres",
    "privilege_type": "TRUNCATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_cycle_ranking_evidence_v2",
    "grantee": "postgres",
    "privilege_type": "UPDATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_cycle_ranking_evidence_v2",
    "grantee": "service_role",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "referee_cycle_ranking_evidence_v2",
    "grantee": "service_role",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "referee_cycle_ranking_evidence_v2",
    "grantee": "service_role",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "referee_cycle_ranking_evidence_v2",
    "grantee": "service_role",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "referee_cycle_ranking_v2",
    "grantee": "postgres",
    "privilege_type": "DELETE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_cycle_ranking_v2",
    "grantee": "postgres",
    "privilege_type": "INSERT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_cycle_ranking_v2",
    "grantee": "postgres",
    "privilege_type": "REFERENCES",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_cycle_ranking_v2",
    "grantee": "postgres",
    "privilege_type": "SELECT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_cycle_ranking_v2",
    "grantee": "postgres",
    "privilege_type": "TRIGGER",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_cycle_ranking_v2",
    "grantee": "postgres",
    "privilege_type": "TRUNCATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_cycle_ranking_v2",
    "grantee": "postgres",
    "privilege_type": "UPDATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_cycle_ranking_v2",
    "grantee": "service_role",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "referee_cycle_ranking_v2",
    "grantee": "service_role",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "referee_cycle_ranking_v2",
    "grantee": "service_role",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "referee_cycle_ranking_v2",
    "grantee": "service_role",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "referee_evaluation_detail",
    "grantee": "postgres",
    "privilege_type": "DELETE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_evaluation_detail",
    "grantee": "postgres",
    "privilege_type": "INSERT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_evaluation_detail",
    "grantee": "postgres",
    "privilege_type": "REFERENCES",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_evaluation_detail",
    "grantee": "postgres",
    "privilege_type": "SELECT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_evaluation_detail",
    "grantee": "postgres",
    "privilege_type": "TRIGGER",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_evaluation_detail",
    "grantee": "postgres",
    "privilege_type": "TRUNCATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_evaluation_detail",
    "grantee": "postgres",
    "privilege_type": "UPDATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_evaluation_detail",
    "grantee": "service_role",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "referee_evaluation_detail",
    "grantee": "service_role",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "referee_evaluation_detail",
    "grantee": "service_role",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "referee_evaluation_detail",
    "grantee": "service_role",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "referee_evaluation_score",
    "grantee": "postgres",
    "privilege_type": "DELETE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_evaluation_score",
    "grantee": "postgres",
    "privilege_type": "INSERT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_evaluation_score",
    "grantee": "postgres",
    "privilege_type": "REFERENCES",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_evaluation_score",
    "grantee": "postgres",
    "privilege_type": "SELECT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_evaluation_score",
    "grantee": "postgres",
    "privilege_type": "TRIGGER",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_evaluation_score",
    "grantee": "postgres",
    "privilege_type": "TRUNCATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_evaluation_score",
    "grantee": "postgres",
    "privilege_type": "UPDATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_evaluation_score",
    "grantee": "service_role",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "referee_evaluation_score",
    "grantee": "service_role",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "referee_evaluation_score",
    "grantee": "service_role",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "referee_evaluation_score",
    "grantee": "service_role",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "referee_monthly_development_score_v2",
    "grantee": "postgres",
    "privilege_type": "DELETE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_monthly_development_score_v2",
    "grantee": "postgres",
    "privilege_type": "INSERT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_monthly_development_score_v2",
    "grantee": "postgres",
    "privilege_type": "REFERENCES",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_monthly_development_score_v2",
    "grantee": "postgres",
    "privilege_type": "SELECT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_monthly_development_score_v2",
    "grantee": "postgres",
    "privilege_type": "TRIGGER",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_monthly_development_score_v2",
    "grantee": "postgres",
    "privilege_type": "TRUNCATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_monthly_development_score_v2",
    "grantee": "postgres",
    "privilege_type": "UPDATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_monthly_development_score_v2",
    "grantee": "service_role",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "referee_monthly_development_score_v2",
    "grantee": "service_role",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "referee_monthly_development_score_v2",
    "grantee": "service_role",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "referee_monthly_development_score_v2",
    "grantee": "service_role",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "referee_monthly_period_metric_scores_v2",
    "grantee": "postgres",
    "privilege_type": "DELETE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_monthly_period_metric_scores_v2",
    "grantee": "postgres",
    "privilege_type": "INSERT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_monthly_period_metric_scores_v2",
    "grantee": "postgres",
    "privilege_type": "REFERENCES",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_monthly_period_metric_scores_v2",
    "grantee": "postgres",
    "privilege_type": "SELECT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_monthly_period_metric_scores_v2",
    "grantee": "postgres",
    "privilege_type": "TRIGGER",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_monthly_period_metric_scores_v2",
    "grantee": "postgres",
    "privilege_type": "TRUNCATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_monthly_period_metric_scores_v2",
    "grantee": "postgres",
    "privilege_type": "UPDATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_monthly_period_metric_scores_v2",
    "grantee": "service_role",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "referee_monthly_period_metric_scores_v2",
    "grantee": "service_role",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "referee_monthly_period_metric_scores_v2",
    "grantee": "service_role",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "referee_monthly_period_metric_scores_v2",
    "grantee": "service_role",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "referee_monthly_ranking_evidence_v2",
    "grantee": "postgres",
    "privilege_type": "DELETE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_monthly_ranking_evidence_v2",
    "grantee": "postgres",
    "privilege_type": "INSERT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_monthly_ranking_evidence_v2",
    "grantee": "postgres",
    "privilege_type": "REFERENCES",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_monthly_ranking_evidence_v2",
    "grantee": "postgres",
    "privilege_type": "SELECT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_monthly_ranking_evidence_v2",
    "grantee": "postgres",
    "privilege_type": "TRIGGER",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_monthly_ranking_evidence_v2",
    "grantee": "postgres",
    "privilege_type": "TRUNCATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_monthly_ranking_evidence_v2",
    "grantee": "postgres",
    "privilege_type": "UPDATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_monthly_ranking_evidence_v2",
    "grantee": "service_role",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "referee_monthly_ranking_evidence_v2",
    "grantee": "service_role",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "referee_monthly_ranking_evidence_v2",
    "grantee": "service_role",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "referee_monthly_ranking_evidence_v2",
    "grantee": "service_role",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "referee_monthly_ranking_history_v2",
    "grantee": "postgres",
    "privilege_type": "DELETE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_monthly_ranking_history_v2",
    "grantee": "postgres",
    "privilege_type": "INSERT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_monthly_ranking_history_v2",
    "grantee": "postgres",
    "privilege_type": "REFERENCES",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_monthly_ranking_history_v2",
    "grantee": "postgres",
    "privilege_type": "SELECT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_monthly_ranking_history_v2",
    "grantee": "postgres",
    "privilege_type": "TRIGGER",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_monthly_ranking_history_v2",
    "grantee": "postgres",
    "privilege_type": "TRUNCATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_monthly_ranking_history_v2",
    "grantee": "postgres",
    "privilege_type": "UPDATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_monthly_ranking_history_v2",
    "grantee": "service_role",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "referee_monthly_ranking_history_v2",
    "grantee": "service_role",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "referee_monthly_ranking_history_v2",
    "grantee": "service_role",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "referee_monthly_ranking_history_v2",
    "grantee": "service_role",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "referee_period_development_score",
    "grantee": "postgres",
    "privilege_type": "DELETE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_period_development_score",
    "grantee": "postgres",
    "privilege_type": "INSERT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_period_development_score",
    "grantee": "postgres",
    "privilege_type": "REFERENCES",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_period_development_score",
    "grantee": "postgres",
    "privilege_type": "SELECT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_period_development_score",
    "grantee": "postgres",
    "privilege_type": "TRIGGER",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_period_development_score",
    "grantee": "postgres",
    "privilege_type": "TRUNCATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_period_development_score",
    "grantee": "postgres",
    "privilege_type": "UPDATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_period_development_score",
    "grantee": "service_role",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "referee_period_development_score",
    "grantee": "service_role",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "referee_period_development_score",
    "grantee": "service_role",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "referee_period_development_score",
    "grantee": "service_role",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "referee_period_metric_scores",
    "grantee": "postgres",
    "privilege_type": "DELETE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_period_metric_scores",
    "grantee": "postgres",
    "privilege_type": "INSERT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_period_metric_scores",
    "grantee": "postgres",
    "privilege_type": "REFERENCES",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_period_metric_scores",
    "grantee": "postgres",
    "privilege_type": "SELECT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_period_metric_scores",
    "grantee": "postgres",
    "privilege_type": "TRIGGER",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_period_metric_scores",
    "grantee": "postgres",
    "privilege_type": "TRUNCATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_period_metric_scores",
    "grantee": "postgres",
    "privilege_type": "UPDATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_period_metric_scores",
    "grantee": "service_role",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "referee_period_metric_scores",
    "grantee": "service_role",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "referee_period_metric_scores",
    "grantee": "service_role",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "referee_period_metric_scores",
    "grantee": "service_role",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "referee_quiz_score",
    "grantee": "postgres",
    "privilege_type": "DELETE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_quiz_score",
    "grantee": "postgres",
    "privilege_type": "INSERT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_quiz_score",
    "grantee": "postgres",
    "privilege_type": "REFERENCES",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_quiz_score",
    "grantee": "postgres",
    "privilege_type": "SELECT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_quiz_score",
    "grantee": "postgres",
    "privilege_type": "TRIGGER",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_quiz_score",
    "grantee": "postgres",
    "privilege_type": "TRUNCATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_quiz_score",
    "grantee": "postgres",
    "privilege_type": "UPDATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_quiz_score",
    "grantee": "service_role",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "referee_quiz_score",
    "grantee": "service_role",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "referee_quiz_score",
    "grantee": "service_role",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "referee_quiz_score",
    "grantee": "service_role",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "referee_ranking_evidence",
    "grantee": "postgres",
    "privilege_type": "DELETE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_ranking_evidence",
    "grantee": "postgres",
    "privilege_type": "INSERT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_ranking_evidence",
    "grantee": "postgres",
    "privilege_type": "REFERENCES",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_ranking_evidence",
    "grantee": "postgres",
    "privilege_type": "SELECT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_ranking_evidence",
    "grantee": "postgres",
    "privilege_type": "TRIGGER",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_ranking_evidence",
    "grantee": "postgres",
    "privilege_type": "TRUNCATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_ranking_evidence",
    "grantee": "postgres",
    "privilege_type": "UPDATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_ranking_evidence",
    "grantee": "service_role",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "referee_ranking_evidence",
    "grantee": "service_role",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "referee_ranking_evidence",
    "grantee": "service_role",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "referee_ranking_evidence",
    "grantee": "service_role",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "referee_ranking_v2",
    "grantee": "postgres",
    "privilege_type": "DELETE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_ranking_v2",
    "grantee": "postgres",
    "privilege_type": "INSERT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_ranking_v2",
    "grantee": "postgres",
    "privilege_type": "REFERENCES",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_ranking_v2",
    "grantee": "postgres",
    "privilege_type": "SELECT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_ranking_v2",
    "grantee": "postgres",
    "privilege_type": "TRIGGER",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_ranking_v2",
    "grantee": "postgres",
    "privilege_type": "TRUNCATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_ranking_v2",
    "grantee": "postgres",
    "privilege_type": "UPDATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_ranking_v2",
    "grantee": "service_role",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "referee_ranking_v2",
    "grantee": "service_role",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "referee_ranking_v2",
    "grantee": "service_role",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "referee_ranking_v2",
    "grantee": "service_role",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "referee_report_detail",
    "grantee": "postgres",
    "privilege_type": "DELETE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_report_detail",
    "grantee": "postgres",
    "privilege_type": "INSERT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_report_detail",
    "grantee": "postgres",
    "privilege_type": "REFERENCES",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_report_detail",
    "grantee": "postgres",
    "privilege_type": "SELECT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_report_detail",
    "grantee": "postgres",
    "privilege_type": "TRIGGER",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_report_detail",
    "grantee": "postgres",
    "privilege_type": "TRUNCATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_report_detail",
    "grantee": "postgres",
    "privilege_type": "UPDATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_report_detail",
    "grantee": "service_role",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "referee_report_detail",
    "grantee": "service_role",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "referee_report_detail",
    "grantee": "service_role",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "referee_report_detail",
    "grantee": "service_role",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "referee_report_score",
    "grantee": "postgres",
    "privilege_type": "DELETE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_report_score",
    "grantee": "postgres",
    "privilege_type": "INSERT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_report_score",
    "grantee": "postgres",
    "privilege_type": "REFERENCES",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_report_score",
    "grantee": "postgres",
    "privilege_type": "SELECT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_report_score",
    "grantee": "postgres",
    "privilege_type": "TRIGGER",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_report_score",
    "grantee": "postgres",
    "privilege_type": "TRUNCATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_report_score",
    "grantee": "postgres",
    "privilege_type": "UPDATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "referee_report_score",
    "grantee": "service_role",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "referee_report_score",
    "grantee": "service_role",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "referee_report_score",
    "grantee": "service_role",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "referee_report_score",
    "grantee": "service_role",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "scoring_periods",
    "grantee": "postgres",
    "privilege_type": "DELETE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "scoring_periods",
    "grantee": "postgres",
    "privilege_type": "INSERT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "scoring_periods",
    "grantee": "postgres",
    "privilege_type": "REFERENCES",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "scoring_periods",
    "grantee": "postgres",
    "privilege_type": "SELECT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "scoring_periods",
    "grantee": "postgres",
    "privilege_type": "TRIGGER",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "scoring_periods",
    "grantee": "postgres",
    "privilege_type": "TRUNCATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "scoring_periods",
    "grantee": "postgres",
    "privilege_type": "UPDATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "development",
    "table_name": "scoring_periods",
    "grantee": "service_role",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "scoring_periods",
    "grantee": "service_role",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "scoring_periods",
    "grantee": "service_role",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "development",
    "table_name": "scoring_periods",
    "grantee": "service_role",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "arbiter_referees",
    "grantee": "anon",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "arbiter_referees",
    "grantee": "anon",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "arbiter_referees",
    "grantee": "anon",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "arbiter_referees",
    "grantee": "anon",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "arbiter_referees",
    "grantee": "anon",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "arbiter_referees",
    "grantee": "anon",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "arbiter_referees",
    "grantee": "anon",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "arbiter_referees",
    "grantee": "authenticated",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "arbiter_referees",
    "grantee": "authenticated",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "arbiter_referees",
    "grantee": "authenticated",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "arbiter_referees",
    "grantee": "authenticated",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "arbiter_referees",
    "grantee": "authenticated",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "arbiter_referees",
    "grantee": "authenticated",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "arbiter_referees",
    "grantee": "authenticated",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "arbiter_referees",
    "grantee": "postgres",
    "privilege_type": "DELETE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "arbiter_referees",
    "grantee": "postgres",
    "privilege_type": "INSERT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "arbiter_referees",
    "grantee": "postgres",
    "privilege_type": "REFERENCES",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "arbiter_referees",
    "grantee": "postgres",
    "privilege_type": "SELECT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "arbiter_referees",
    "grantee": "postgres",
    "privilege_type": "TRIGGER",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "arbiter_referees",
    "grantee": "postgres",
    "privilege_type": "TRUNCATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "arbiter_referees",
    "grantee": "postgres",
    "privilege_type": "UPDATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "arbiter_referees",
    "grantee": "service_role",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "arbiter_referees",
    "grantee": "service_role",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "arbiter_referees",
    "grantee": "service_role",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "arbiter_referees",
    "grantee": "service_role",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "arbiter_referees",
    "grantee": "service_role",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "arbiter_referees",
    "grantee": "service_role",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "arbiter_referees",
    "grantee": "service_role",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "attendance_records",
    "grantee": "anon",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "attendance_records",
    "grantee": "anon",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "attendance_records",
    "grantee": "anon",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "attendance_records",
    "grantee": "anon",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "attendance_records",
    "grantee": "anon",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "attendance_records",
    "grantee": "anon",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "attendance_records",
    "grantee": "anon",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "attendance_records",
    "grantee": "authenticated",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "attendance_records",
    "grantee": "authenticated",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "attendance_records",
    "grantee": "authenticated",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "attendance_records",
    "grantee": "authenticated",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "attendance_records",
    "grantee": "authenticated",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "attendance_records",
    "grantee": "authenticated",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "attendance_records",
    "grantee": "authenticated",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "attendance_records",
    "grantee": "postgres",
    "privilege_type": "DELETE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "attendance_records",
    "grantee": "postgres",
    "privilege_type": "INSERT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "attendance_records",
    "grantee": "postgres",
    "privilege_type": "REFERENCES",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "attendance_records",
    "grantee": "postgres",
    "privilege_type": "SELECT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "attendance_records",
    "grantee": "postgres",
    "privilege_type": "TRIGGER",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "attendance_records",
    "grantee": "postgres",
    "privilege_type": "TRUNCATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "attendance_records",
    "grantee": "postgres",
    "privilege_type": "UPDATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "attendance_records",
    "grantee": "service_role",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "attendance_records",
    "grantee": "service_role",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "attendance_records",
    "grantee": "service_role",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "attendance_records",
    "grantee": "service_role",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "attendance_records",
    "grantee": "service_role",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "attendance_records",
    "grantee": "service_role",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "attendance_records",
    "grantee": "service_role",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "attendance_sessions",
    "grantee": "anon",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "attendance_sessions",
    "grantee": "anon",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "attendance_sessions",
    "grantee": "anon",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "attendance_sessions",
    "grantee": "anon",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "attendance_sessions",
    "grantee": "anon",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "attendance_sessions",
    "grantee": "anon",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "attendance_sessions",
    "grantee": "anon",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "attendance_sessions",
    "grantee": "authenticated",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "attendance_sessions",
    "grantee": "authenticated",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "attendance_sessions",
    "grantee": "authenticated",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "attendance_sessions",
    "grantee": "authenticated",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "attendance_sessions",
    "grantee": "authenticated",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "attendance_sessions",
    "grantee": "authenticated",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "attendance_sessions",
    "grantee": "authenticated",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "attendance_sessions",
    "grantee": "postgres",
    "privilege_type": "DELETE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "attendance_sessions",
    "grantee": "postgres",
    "privilege_type": "INSERT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "attendance_sessions",
    "grantee": "postgres",
    "privilege_type": "REFERENCES",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "attendance_sessions",
    "grantee": "postgres",
    "privilege_type": "SELECT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "attendance_sessions",
    "grantee": "postgres",
    "privilege_type": "TRIGGER",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "attendance_sessions",
    "grantee": "postgres",
    "privilege_type": "TRUNCATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "attendance_sessions",
    "grantee": "postgres",
    "privilege_type": "UPDATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "attendance_sessions",
    "grantee": "service_role",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "attendance_sessions",
    "grantee": "service_role",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "attendance_sessions",
    "grantee": "service_role",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "attendance_sessions",
    "grantee": "service_role",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "attendance_sessions",
    "grantee": "service_role",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "attendance_sessions",
    "grantee": "service_role",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "attendance_sessions",
    "grantee": "service_role",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "card_reasons",
    "grantee": "anon",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "card_reasons",
    "grantee": "anon",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "card_reasons",
    "grantee": "anon",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "card_reasons",
    "grantee": "anon",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "card_reasons",
    "grantee": "anon",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "card_reasons",
    "grantee": "anon",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "card_reasons",
    "grantee": "anon",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "card_reasons",
    "grantee": "authenticated",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "card_reasons",
    "grantee": "authenticated",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "card_reasons",
    "grantee": "authenticated",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "card_reasons",
    "grantee": "authenticated",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "card_reasons",
    "grantee": "authenticated",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "card_reasons",
    "grantee": "authenticated",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "card_reasons",
    "grantee": "authenticated",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "card_reasons",
    "grantee": "postgres",
    "privilege_type": "DELETE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "card_reasons",
    "grantee": "postgres",
    "privilege_type": "INSERT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "card_reasons",
    "grantee": "postgres",
    "privilege_type": "REFERENCES",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "card_reasons",
    "grantee": "postgres",
    "privilege_type": "SELECT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "card_reasons",
    "grantee": "postgres",
    "privilege_type": "TRIGGER",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "card_reasons",
    "grantee": "postgres",
    "privilege_type": "TRUNCATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "card_reasons",
    "grantee": "postgres",
    "privilege_type": "UPDATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "card_reasons",
    "grantee": "service_role",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "card_reasons",
    "grantee": "service_role",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "card_reasons",
    "grantee": "service_role",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "card_reasons",
    "grantee": "service_role",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "card_reasons",
    "grantee": "service_role",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "card_reasons",
    "grantee": "service_role",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "card_reasons",
    "grantee": "service_role",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_peer_feedback_score",
    "grantee": "anon",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_peer_feedback_score",
    "grantee": "anon",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_peer_feedback_score",
    "grantee": "anon",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_peer_feedback_score",
    "grantee": "anon",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_peer_feedback_score",
    "grantee": "anon",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_peer_feedback_score",
    "grantee": "anon",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_peer_feedback_score",
    "grantee": "anon",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_peer_feedback_score",
    "grantee": "authenticated",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_peer_feedback_score",
    "grantee": "authenticated",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_peer_feedback_score",
    "grantee": "authenticated",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_peer_feedback_score",
    "grantee": "authenticated",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_peer_feedback_score",
    "grantee": "authenticated",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_peer_feedback_score",
    "grantee": "authenticated",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_peer_feedback_score",
    "grantee": "authenticated",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_peer_feedback_score",
    "grantee": "postgres",
    "privilege_type": "DELETE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_peer_feedback_score",
    "grantee": "postgres",
    "privilege_type": "INSERT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_peer_feedback_score",
    "grantee": "postgres",
    "privilege_type": "REFERENCES",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_peer_feedback_score",
    "grantee": "postgres",
    "privilege_type": "SELECT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_peer_feedback_score",
    "grantee": "postgres",
    "privilege_type": "TRIGGER",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_peer_feedback_score",
    "grantee": "postgres",
    "privilege_type": "TRUNCATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_peer_feedback_score",
    "grantee": "postgres",
    "privilege_type": "UPDATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_peer_feedback_score",
    "grantee": "service_role",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_peer_feedback_score",
    "grantee": "service_role",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_peer_feedback_score",
    "grantee": "service_role",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_peer_feedback_score",
    "grantee": "service_role",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_peer_feedback_score",
    "grantee": "service_role",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_peer_feedback_score",
    "grantee": "service_role",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_peer_feedback_score",
    "grantee": "service_role",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_pending_evaluations",
    "grantee": "anon",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_pending_evaluations",
    "grantee": "anon",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_pending_evaluations",
    "grantee": "anon",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_pending_evaluations",
    "grantee": "anon",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_pending_evaluations",
    "grantee": "anon",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_pending_evaluations",
    "grantee": "anon",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_pending_evaluations",
    "grantee": "anon",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_pending_evaluations",
    "grantee": "authenticated",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_pending_evaluations",
    "grantee": "authenticated",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_pending_evaluations",
    "grantee": "authenticated",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_pending_evaluations",
    "grantee": "authenticated",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_pending_evaluations",
    "grantee": "authenticated",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_pending_evaluations",
    "grantee": "authenticated",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_pending_evaluations",
    "grantee": "authenticated",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_pending_evaluations",
    "grantee": "postgres",
    "privilege_type": "DELETE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_pending_evaluations",
    "grantee": "postgres",
    "privilege_type": "INSERT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_pending_evaluations",
    "grantee": "postgres",
    "privilege_type": "REFERENCES",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_pending_evaluations",
    "grantee": "postgres",
    "privilege_type": "SELECT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_pending_evaluations",
    "grantee": "postgres",
    "privilege_type": "TRIGGER",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_pending_evaluations",
    "grantee": "postgres",
    "privilege_type": "TRUNCATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_pending_evaluations",
    "grantee": "postgres",
    "privilege_type": "UPDATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_pending_evaluations",
    "grantee": "service_role",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_pending_evaluations",
    "grantee": "service_role",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_pending_evaluations",
    "grantee": "service_role",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_pending_evaluations",
    "grantee": "service_role",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_pending_evaluations",
    "grantee": "service_role",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_pending_evaluations",
    "grantee": "service_role",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_pending_evaluations",
    "grantee": "service_role",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_pending_reports",
    "grantee": "anon",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_pending_reports",
    "grantee": "anon",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_pending_reports",
    "grantee": "anon",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_pending_reports",
    "grantee": "anon",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_pending_reports",
    "grantee": "anon",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_pending_reports",
    "grantee": "anon",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_pending_reports",
    "grantee": "anon",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_pending_reports",
    "grantee": "authenticated",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_pending_reports",
    "grantee": "authenticated",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_pending_reports",
    "grantee": "authenticated",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_pending_reports",
    "grantee": "authenticated",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_pending_reports",
    "grantee": "authenticated",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_pending_reports",
    "grantee": "authenticated",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_pending_reports",
    "grantee": "authenticated",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_pending_reports",
    "grantee": "postgres",
    "privilege_type": "DELETE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_pending_reports",
    "grantee": "postgres",
    "privilege_type": "INSERT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_pending_reports",
    "grantee": "postgres",
    "privilege_type": "REFERENCES",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_pending_reports",
    "grantee": "postgres",
    "privilege_type": "SELECT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_pending_reports",
    "grantee": "postgres",
    "privilege_type": "TRIGGER",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_pending_reports",
    "grantee": "postgres",
    "privilege_type": "TRUNCATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_pending_reports",
    "grantee": "postgres",
    "privilege_type": "UPDATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_pending_reports",
    "grantee": "service_role",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_pending_reports",
    "grantee": "service_role",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_pending_reports",
    "grantee": "service_role",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_pending_reports",
    "grantee": "service_role",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_pending_reports",
    "grantee": "service_role",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_pending_reports",
    "grantee": "service_role",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_pending_reports",
    "grantee": "service_role",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_quiz_scores",
    "grantee": "anon",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_quiz_scores",
    "grantee": "anon",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_quiz_scores",
    "grantee": "anon",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_quiz_scores",
    "grantee": "anon",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_quiz_scores",
    "grantee": "anon",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_quiz_scores",
    "grantee": "anon",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_quiz_scores",
    "grantee": "anon",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_quiz_scores",
    "grantee": "authenticated",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_quiz_scores",
    "grantee": "authenticated",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_quiz_scores",
    "grantee": "authenticated",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_quiz_scores",
    "grantee": "authenticated",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_quiz_scores",
    "grantee": "authenticated",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_quiz_scores",
    "grantee": "authenticated",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_quiz_scores",
    "grantee": "authenticated",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_quiz_scores",
    "grantee": "postgres",
    "privilege_type": "DELETE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_quiz_scores",
    "grantee": "postgres",
    "privilege_type": "INSERT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_quiz_scores",
    "grantee": "postgres",
    "privilege_type": "REFERENCES",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_quiz_scores",
    "grantee": "postgres",
    "privilege_type": "SELECT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_quiz_scores",
    "grantee": "postgres",
    "privilege_type": "TRIGGER",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_quiz_scores",
    "grantee": "postgres",
    "privilege_type": "TRUNCATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_quiz_scores",
    "grantee": "postgres",
    "privilege_type": "UPDATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_quiz_scores",
    "grantee": "service_role",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_quiz_scores",
    "grantee": "service_role",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_quiz_scores",
    "grantee": "service_role",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_quiz_scores",
    "grantee": "service_role",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_quiz_scores",
    "grantee": "service_role",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_quiz_scores",
    "grantee": "service_role",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_quiz_scores",
    "grantee": "service_role",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_activity",
    "grantee": "anon",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_activity",
    "grantee": "anon",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_activity",
    "grantee": "anon",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_activity",
    "grantee": "anon",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_activity",
    "grantee": "anon",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_activity",
    "grantee": "anon",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_activity",
    "grantee": "anon",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_activity",
    "grantee": "authenticated",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_activity",
    "grantee": "authenticated",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_activity",
    "grantee": "authenticated",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_activity",
    "grantee": "authenticated",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_activity",
    "grantee": "authenticated",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_activity",
    "grantee": "authenticated",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_activity",
    "grantee": "authenticated",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_activity",
    "grantee": "postgres",
    "privilege_type": "DELETE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_activity",
    "grantee": "postgres",
    "privilege_type": "INSERT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_activity",
    "grantee": "postgres",
    "privilege_type": "REFERENCES",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_activity",
    "grantee": "postgres",
    "privilege_type": "SELECT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_activity",
    "grantee": "postgres",
    "privilege_type": "TRIGGER",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_activity",
    "grantee": "postgres",
    "privilege_type": "TRUNCATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_activity",
    "grantee": "postgres",
    "privilege_type": "UPDATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_activity",
    "grantee": "service_role",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_activity",
    "grantee": "service_role",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_activity",
    "grantee": "service_role",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_activity",
    "grantee": "service_role",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_activity",
    "grantee": "service_role",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_activity",
    "grantee": "service_role",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_activity",
    "grantee": "service_role",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_attendance",
    "grantee": "anon",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_attendance",
    "grantee": "anon",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_attendance",
    "grantee": "anon",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_attendance",
    "grantee": "anon",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_attendance",
    "grantee": "anon",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_attendance",
    "grantee": "anon",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_attendance",
    "grantee": "anon",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_attendance",
    "grantee": "authenticated",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_attendance",
    "grantee": "authenticated",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_attendance",
    "grantee": "authenticated",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_attendance",
    "grantee": "authenticated",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_attendance",
    "grantee": "authenticated",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_attendance",
    "grantee": "authenticated",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_attendance",
    "grantee": "authenticated",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_attendance",
    "grantee": "postgres",
    "privilege_type": "DELETE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_attendance",
    "grantee": "postgres",
    "privilege_type": "INSERT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_attendance",
    "grantee": "postgres",
    "privilege_type": "REFERENCES",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_attendance",
    "grantee": "postgres",
    "privilege_type": "SELECT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_attendance",
    "grantee": "postgres",
    "privilege_type": "TRIGGER",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_attendance",
    "grantee": "postgres",
    "privilege_type": "TRUNCATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_attendance",
    "grantee": "postgres",
    "privilege_type": "UPDATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_attendance",
    "grantee": "service_role",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_attendance",
    "grantee": "service_role",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_attendance",
    "grantee": "service_role",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_attendance",
    "grantee": "service_role",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_attendance",
    "grantee": "service_role",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_attendance",
    "grantee": "service_role",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_attendance",
    "grantee": "service_role",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_development_score",
    "grantee": "anon",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_development_score",
    "grantee": "anon",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_development_score",
    "grantee": "anon",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_development_score",
    "grantee": "anon",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_development_score",
    "grantee": "anon",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_development_score",
    "grantee": "anon",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_development_score",
    "grantee": "anon",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_development_score",
    "grantee": "authenticated",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_development_score",
    "grantee": "authenticated",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_development_score",
    "grantee": "authenticated",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_development_score",
    "grantee": "authenticated",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_development_score",
    "grantee": "authenticated",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_development_score",
    "grantee": "authenticated",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_development_score",
    "grantee": "authenticated",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_development_score",
    "grantee": "postgres",
    "privilege_type": "DELETE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_development_score",
    "grantee": "postgres",
    "privilege_type": "INSERT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_development_score",
    "grantee": "postgres",
    "privilege_type": "REFERENCES",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_development_score",
    "grantee": "postgres",
    "privilege_type": "SELECT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_development_score",
    "grantee": "postgres",
    "privilege_type": "TRIGGER",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_development_score",
    "grantee": "postgres",
    "privilege_type": "TRUNCATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_development_score",
    "grantee": "postgres",
    "privilege_type": "UPDATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_development_score",
    "grantee": "service_role",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_development_score",
    "grantee": "service_role",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_development_score",
    "grantee": "service_role",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_development_score",
    "grantee": "service_role",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_development_score",
    "grantee": "service_role",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_development_score",
    "grantee": "service_role",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_development_score",
    "grantee": "service_role",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_matches",
    "grantee": "anon",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_matches",
    "grantee": "anon",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_matches",
    "grantee": "anon",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_matches",
    "grantee": "anon",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_matches",
    "grantee": "anon",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_matches",
    "grantee": "anon",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_matches",
    "grantee": "anon",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_matches",
    "grantee": "authenticated",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_matches",
    "grantee": "authenticated",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_matches",
    "grantee": "authenticated",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_matches",
    "grantee": "authenticated",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_matches",
    "grantee": "authenticated",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_matches",
    "grantee": "authenticated",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_matches",
    "grantee": "authenticated",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_matches",
    "grantee": "postgres",
    "privilege_type": "DELETE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_matches",
    "grantee": "postgres",
    "privilege_type": "INSERT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_matches",
    "grantee": "postgres",
    "privilege_type": "REFERENCES",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_matches",
    "grantee": "postgres",
    "privilege_type": "SELECT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_matches",
    "grantee": "postgres",
    "privilege_type": "TRIGGER",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_matches",
    "grantee": "postgres",
    "privilege_type": "TRUNCATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_matches",
    "grantee": "postgres",
    "privilege_type": "UPDATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_matches",
    "grantee": "service_role",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_matches",
    "grantee": "service_role",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_matches",
    "grantee": "service_role",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_matches",
    "grantee": "service_role",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_matches",
    "grantee": "service_role",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_matches",
    "grantee": "service_role",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_matches",
    "grantee": "service_role",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_ranking",
    "grantee": "anon",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_ranking",
    "grantee": "anon",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_ranking",
    "grantee": "anon",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_ranking",
    "grantee": "anon",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_ranking",
    "grantee": "anon",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_ranking",
    "grantee": "anon",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_ranking",
    "grantee": "anon",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_ranking",
    "grantee": "authenticated",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_ranking",
    "grantee": "authenticated",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_ranking",
    "grantee": "authenticated",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_ranking",
    "grantee": "authenticated",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_ranking",
    "grantee": "authenticated",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_ranking",
    "grantee": "authenticated",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_ranking",
    "grantee": "authenticated",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_ranking",
    "grantee": "postgres",
    "privilege_type": "DELETE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_ranking",
    "grantee": "postgres",
    "privilege_type": "INSERT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_ranking",
    "grantee": "postgres",
    "privilege_type": "REFERENCES",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_ranking",
    "grantee": "postgres",
    "privilege_type": "SELECT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_ranking",
    "grantee": "postgres",
    "privilege_type": "TRIGGER",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_ranking",
    "grantee": "postgres",
    "privilege_type": "TRUNCATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_ranking",
    "grantee": "postgres",
    "privilege_type": "UPDATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_ranking",
    "grantee": "service_role",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_ranking",
    "grantee": "service_role",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_ranking",
    "grantee": "service_role",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_ranking",
    "grantee": "service_role",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_ranking",
    "grantee": "service_role",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_ranking",
    "grantee": "service_role",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_ranking",
    "grantee": "service_role",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_ranking_v2",
    "grantee": "anon",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_ranking_v2",
    "grantee": "anon",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_ranking_v2",
    "grantee": "anon",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_ranking_v2",
    "grantee": "anon",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_ranking_v2",
    "grantee": "anon",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_ranking_v2",
    "grantee": "anon",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_ranking_v2",
    "grantee": "anon",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_ranking_v2",
    "grantee": "authenticated",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_ranking_v2",
    "grantee": "authenticated",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_ranking_v2",
    "grantee": "authenticated",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_ranking_v2",
    "grantee": "authenticated",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_ranking_v2",
    "grantee": "authenticated",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_ranking_v2",
    "grantee": "authenticated",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_ranking_v2",
    "grantee": "authenticated",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_ranking_v2",
    "grantee": "postgres",
    "privilege_type": "DELETE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_ranking_v2",
    "grantee": "postgres",
    "privilege_type": "INSERT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_ranking_v2",
    "grantee": "postgres",
    "privilege_type": "REFERENCES",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_ranking_v2",
    "grantee": "postgres",
    "privilege_type": "SELECT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_ranking_v2",
    "grantee": "postgres",
    "privilege_type": "TRIGGER",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_ranking_v2",
    "grantee": "postgres",
    "privilege_type": "TRUNCATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_ranking_v2",
    "grantee": "postgres",
    "privilege_type": "UPDATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_ranking_v2",
    "grantee": "service_role",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_ranking_v2",
    "grantee": "service_role",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_ranking_v2",
    "grantee": "service_role",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_ranking_v2",
    "grantee": "service_role",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_ranking_v2",
    "grantee": "service_role",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_ranking_v2",
    "grantee": "service_role",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_ranking_v2",
    "grantee": "service_role",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_report_score",
    "grantee": "anon",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_report_score",
    "grantee": "anon",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_report_score",
    "grantee": "anon",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_report_score",
    "grantee": "anon",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_report_score",
    "grantee": "anon",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_report_score",
    "grantee": "anon",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_report_score",
    "grantee": "anon",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_report_score",
    "grantee": "authenticated",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_report_score",
    "grantee": "authenticated",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_report_score",
    "grantee": "authenticated",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_report_score",
    "grantee": "authenticated",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_report_score",
    "grantee": "authenticated",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_report_score",
    "grantee": "authenticated",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_report_score",
    "grantee": "authenticated",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_report_score",
    "grantee": "postgres",
    "privilege_type": "DELETE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_report_score",
    "grantee": "postgres",
    "privilege_type": "INSERT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_report_score",
    "grantee": "postgres",
    "privilege_type": "REFERENCES",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_report_score",
    "grantee": "postgres",
    "privilege_type": "SELECT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_report_score",
    "grantee": "postgres",
    "privilege_type": "TRIGGER",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_report_score",
    "grantee": "postgres",
    "privilege_type": "TRUNCATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_report_score",
    "grantee": "postgres",
    "privilege_type": "UPDATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_report_score",
    "grantee": "service_role",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_report_score",
    "grantee": "service_role",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_report_score",
    "grantee": "service_role",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_report_score",
    "grantee": "service_role",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_report_score",
    "grantee": "service_role",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_report_score",
    "grantee": "service_role",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_referee_report_score",
    "grantee": "service_role",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_upcoming_matches",
    "grantee": "anon",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_upcoming_matches",
    "grantee": "anon",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_upcoming_matches",
    "grantee": "anon",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_upcoming_matches",
    "grantee": "anon",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_upcoming_matches",
    "grantee": "anon",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_upcoming_matches",
    "grantee": "anon",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_upcoming_matches",
    "grantee": "anon",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_upcoming_matches",
    "grantee": "authenticated",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_upcoming_matches",
    "grantee": "authenticated",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_upcoming_matches",
    "grantee": "authenticated",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_upcoming_matches",
    "grantee": "authenticated",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_upcoming_matches",
    "grantee": "authenticated",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_upcoming_matches",
    "grantee": "authenticated",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_upcoming_matches",
    "grantee": "authenticated",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_upcoming_matches",
    "grantee": "postgres",
    "privilege_type": "DELETE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_upcoming_matches",
    "grantee": "postgres",
    "privilege_type": "INSERT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_upcoming_matches",
    "grantee": "postgres",
    "privilege_type": "REFERENCES",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_upcoming_matches",
    "grantee": "postgres",
    "privilege_type": "SELECT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_upcoming_matches",
    "grantee": "postgres",
    "privilege_type": "TRIGGER",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_upcoming_matches",
    "grantee": "postgres",
    "privilege_type": "TRUNCATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_upcoming_matches",
    "grantee": "postgres",
    "privilege_type": "UPDATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_upcoming_matches",
    "grantee": "service_role",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_upcoming_matches",
    "grantee": "service_role",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_upcoming_matches",
    "grantee": "service_role",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_upcoming_matches",
    "grantee": "service_role",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_upcoming_matches",
    "grantee": "service_role",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_upcoming_matches",
    "grantee": "service_role",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "dashboard_upcoming_matches",
    "grantee": "service_role",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "evaluations",
    "grantee": "anon",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "evaluations",
    "grantee": "anon",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "evaluations",
    "grantee": "anon",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "evaluations",
    "grantee": "anon",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "evaluations",
    "grantee": "anon",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "evaluations",
    "grantee": "anon",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "evaluations",
    "grantee": "anon",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "evaluations",
    "grantee": "authenticated",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "evaluations",
    "grantee": "authenticated",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "evaluations",
    "grantee": "authenticated",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "evaluations",
    "grantee": "authenticated",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "evaluations",
    "grantee": "authenticated",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "evaluations",
    "grantee": "authenticated",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "evaluations",
    "grantee": "authenticated",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "evaluations",
    "grantee": "postgres",
    "privilege_type": "DELETE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "evaluations",
    "grantee": "postgres",
    "privilege_type": "INSERT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "evaluations",
    "grantee": "postgres",
    "privilege_type": "REFERENCES",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "evaluations",
    "grantee": "postgres",
    "privilege_type": "SELECT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "evaluations",
    "grantee": "postgres",
    "privilege_type": "TRIGGER",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "evaluations",
    "grantee": "postgres",
    "privilege_type": "TRUNCATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "evaluations",
    "grantee": "postgres",
    "privilege_type": "UPDATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "evaluations",
    "grantee": "service_role",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "evaluations",
    "grantee": "service_role",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "evaluations",
    "grantee": "service_role",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "evaluations",
    "grantee": "service_role",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "evaluations",
    "grantee": "service_role",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "evaluations",
    "grantee": "service_role",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "evaluations",
    "grantee": "service_role",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "match_reports",
    "grantee": "anon",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "match_reports",
    "grantee": "anon",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "match_reports",
    "grantee": "anon",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "match_reports",
    "grantee": "anon",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "match_reports",
    "grantee": "anon",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "match_reports",
    "grantee": "anon",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "match_reports",
    "grantee": "anon",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "match_reports",
    "grantee": "authenticated",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "match_reports",
    "grantee": "authenticated",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "match_reports",
    "grantee": "authenticated",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "match_reports",
    "grantee": "authenticated",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "match_reports",
    "grantee": "authenticated",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "match_reports",
    "grantee": "authenticated",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "match_reports",
    "grantee": "authenticated",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "match_reports",
    "grantee": "postgres",
    "privilege_type": "DELETE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "match_reports",
    "grantee": "postgres",
    "privilege_type": "INSERT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "match_reports",
    "grantee": "postgres",
    "privilege_type": "REFERENCES",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "match_reports",
    "grantee": "postgres",
    "privilege_type": "SELECT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "match_reports",
    "grantee": "postgres",
    "privilege_type": "TRIGGER",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "match_reports",
    "grantee": "postgres",
    "privilege_type": "TRUNCATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "match_reports",
    "grantee": "postgres",
    "privilege_type": "UPDATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "match_reports",
    "grantee": "service_role",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "match_reports",
    "grantee": "service_role",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "match_reports",
    "grantee": "service_role",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "match_reports",
    "grantee": "service_role",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "match_reports",
    "grantee": "service_role",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "match_reports",
    "grantee": "service_role",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "match_reports",
    "grantee": "service_role",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "matches",
    "grantee": "anon",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "matches",
    "grantee": "anon",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "matches",
    "grantee": "anon",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "matches",
    "grantee": "anon",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "matches",
    "grantee": "anon",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "matches",
    "grantee": "anon",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "matches",
    "grantee": "anon",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "matches",
    "grantee": "authenticated",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "matches",
    "grantee": "authenticated",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "matches",
    "grantee": "authenticated",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "matches",
    "grantee": "authenticated",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "matches",
    "grantee": "authenticated",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "matches",
    "grantee": "authenticated",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "matches",
    "grantee": "authenticated",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "matches",
    "grantee": "postgres",
    "privilege_type": "DELETE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "matches",
    "grantee": "postgres",
    "privilege_type": "INSERT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "matches",
    "grantee": "postgres",
    "privilege_type": "REFERENCES",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "matches",
    "grantee": "postgres",
    "privilege_type": "SELECT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "matches",
    "grantee": "postgres",
    "privilege_type": "TRIGGER",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "matches",
    "grantee": "postgres",
    "privilege_type": "TRUNCATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "matches",
    "grantee": "postgres",
    "privilege_type": "UPDATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "matches",
    "grantee": "service_role",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "matches",
    "grantee": "service_role",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "matches",
    "grantee": "service_role",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "matches",
    "grantee": "service_role",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "matches",
    "grantee": "service_role",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "matches",
    "grantee": "service_role",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "matches",
    "grantee": "service_role",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "members",
    "grantee": "anon",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "members",
    "grantee": "anon",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "members",
    "grantee": "anon",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "members",
    "grantee": "anon",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "members",
    "grantee": "anon",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "members",
    "grantee": "anon",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "members",
    "grantee": "anon",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "members",
    "grantee": "authenticated",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "members",
    "grantee": "authenticated",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "members",
    "grantee": "authenticated",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "members",
    "grantee": "authenticated",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "members",
    "grantee": "authenticated",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "members",
    "grantee": "authenticated",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "members",
    "grantee": "authenticated",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "members",
    "grantee": "postgres",
    "privilege_type": "DELETE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "members",
    "grantee": "postgres",
    "privilege_type": "INSERT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "members",
    "grantee": "postgres",
    "privilege_type": "REFERENCES",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "members",
    "grantee": "postgres",
    "privilege_type": "SELECT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "members",
    "grantee": "postgres",
    "privilege_type": "TRIGGER",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "members",
    "grantee": "postgres",
    "privilege_type": "TRUNCATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "members",
    "grantee": "postgres",
    "privilege_type": "UPDATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "members",
    "grantee": "service_role",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "members",
    "grantee": "service_role",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "members",
    "grantee": "service_role",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "members",
    "grantee": "service_role",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "members",
    "grantee": "service_role",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "members",
    "grantee": "service_role",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "members",
    "grantee": "service_role",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_answers",
    "grantee": "anon",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_answers",
    "grantee": "anon",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_answers",
    "grantee": "anon",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_answers",
    "grantee": "anon",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_answers",
    "grantee": "anon",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_answers",
    "grantee": "anon",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_answers",
    "grantee": "anon",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_answers",
    "grantee": "authenticated",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_answers",
    "grantee": "authenticated",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_answers",
    "grantee": "authenticated",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_answers",
    "grantee": "authenticated",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_answers",
    "grantee": "authenticated",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_answers",
    "grantee": "authenticated",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_answers",
    "grantee": "authenticated",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_answers",
    "grantee": "postgres",
    "privilege_type": "DELETE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_answers",
    "grantee": "postgres",
    "privilege_type": "INSERT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_answers",
    "grantee": "postgres",
    "privilege_type": "REFERENCES",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_answers",
    "grantee": "postgres",
    "privilege_type": "SELECT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_answers",
    "grantee": "postgres",
    "privilege_type": "TRIGGER",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_answers",
    "grantee": "postgres",
    "privilege_type": "TRUNCATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_answers",
    "grantee": "postgres",
    "privilege_type": "UPDATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_answers",
    "grantee": "service_role",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_answers",
    "grantee": "service_role",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_answers",
    "grantee": "service_role",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_answers",
    "grantee": "service_role",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_answers",
    "grantee": "service_role",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_answers",
    "grantee": "service_role",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_answers",
    "grantee": "service_role",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_attempts",
    "grantee": "anon",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_attempts",
    "grantee": "anon",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_attempts",
    "grantee": "anon",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_attempts",
    "grantee": "anon",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_attempts",
    "grantee": "anon",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_attempts",
    "grantee": "anon",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_attempts",
    "grantee": "anon",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_attempts",
    "grantee": "authenticated",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_attempts",
    "grantee": "authenticated",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_attempts",
    "grantee": "authenticated",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_attempts",
    "grantee": "authenticated",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_attempts",
    "grantee": "authenticated",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_attempts",
    "grantee": "authenticated",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_attempts",
    "grantee": "authenticated",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_attempts",
    "grantee": "postgres",
    "privilege_type": "DELETE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_attempts",
    "grantee": "postgres",
    "privilege_type": "INSERT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_attempts",
    "grantee": "postgres",
    "privilege_type": "REFERENCES",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_attempts",
    "grantee": "postgres",
    "privilege_type": "SELECT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_attempts",
    "grantee": "postgres",
    "privilege_type": "TRIGGER",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_attempts",
    "grantee": "postgres",
    "privilege_type": "TRUNCATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_attempts",
    "grantee": "postgres",
    "privilege_type": "UPDATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_attempts",
    "grantee": "service_role",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_attempts",
    "grantee": "service_role",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_attempts",
    "grantee": "service_role",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_attempts",
    "grantee": "service_role",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_attempts",
    "grantee": "service_role",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_attempts",
    "grantee": "service_role",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_attempts",
    "grantee": "service_role",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_questions",
    "grantee": "anon",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_questions",
    "grantee": "anon",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_questions",
    "grantee": "anon",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_questions",
    "grantee": "anon",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_questions",
    "grantee": "anon",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_questions",
    "grantee": "anon",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_questions",
    "grantee": "anon",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_questions",
    "grantee": "authenticated",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_questions",
    "grantee": "authenticated",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_questions",
    "grantee": "authenticated",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_questions",
    "grantee": "authenticated",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_questions",
    "grantee": "authenticated",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_questions",
    "grantee": "authenticated",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_questions",
    "grantee": "authenticated",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_questions",
    "grantee": "postgres",
    "privilege_type": "DELETE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_questions",
    "grantee": "postgres",
    "privilege_type": "INSERT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_questions",
    "grantee": "postgres",
    "privilege_type": "REFERENCES",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_questions",
    "grantee": "postgres",
    "privilege_type": "SELECT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_questions",
    "grantee": "postgres",
    "privilege_type": "TRIGGER",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_questions",
    "grantee": "postgres",
    "privilege_type": "TRUNCATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_questions",
    "grantee": "postgres",
    "privilege_type": "UPDATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_questions",
    "grantee": "service_role",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_questions",
    "grantee": "service_role",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_questions",
    "grantee": "service_role",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_questions",
    "grantee": "service_role",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_questions",
    "grantee": "service_role",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_questions",
    "grantee": "service_role",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "quiz_questions",
    "grantee": "service_role",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "quizzes",
    "grantee": "anon",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "quizzes",
    "grantee": "anon",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "quizzes",
    "grantee": "anon",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "quizzes",
    "grantee": "anon",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "quizzes",
    "grantee": "anon",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "quizzes",
    "grantee": "anon",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "quizzes",
    "grantee": "anon",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "quizzes",
    "grantee": "authenticated",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "quizzes",
    "grantee": "authenticated",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "quizzes",
    "grantee": "authenticated",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "quizzes",
    "grantee": "authenticated",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "quizzes",
    "grantee": "authenticated",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "quizzes",
    "grantee": "authenticated",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "quizzes",
    "grantee": "authenticated",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "quizzes",
    "grantee": "postgres",
    "privilege_type": "DELETE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "quizzes",
    "grantee": "postgres",
    "privilege_type": "INSERT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "quizzes",
    "grantee": "postgres",
    "privilege_type": "REFERENCES",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "quizzes",
    "grantee": "postgres",
    "privilege_type": "SELECT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "quizzes",
    "grantee": "postgres",
    "privilege_type": "TRIGGER",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "quizzes",
    "grantee": "postgres",
    "privilege_type": "TRUNCATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "quizzes",
    "grantee": "postgres",
    "privilege_type": "UPDATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "quizzes",
    "grantee": "service_role",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "quizzes",
    "grantee": "service_role",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "quizzes",
    "grantee": "service_role",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "quizzes",
    "grantee": "service_role",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "quizzes",
    "grantee": "service_role",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "quizzes",
    "grantee": "service_role",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "quizzes",
    "grantee": "service_role",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_config",
    "grantee": "anon",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_config",
    "grantee": "anon",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_config",
    "grantee": "anon",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_config",
    "grantee": "anon",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_config",
    "grantee": "anon",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_config",
    "grantee": "anon",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_config",
    "grantee": "anon",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_config",
    "grantee": "authenticated",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_config",
    "grantee": "authenticated",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_config",
    "grantee": "authenticated",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_config",
    "grantee": "authenticated",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_config",
    "grantee": "authenticated",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_config",
    "grantee": "authenticated",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_config",
    "grantee": "authenticated",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_config",
    "grantee": "postgres",
    "privilege_type": "DELETE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_config",
    "grantee": "postgres",
    "privilege_type": "INSERT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_config",
    "grantee": "postgres",
    "privilege_type": "REFERENCES",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_config",
    "grantee": "postgres",
    "privilege_type": "SELECT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_config",
    "grantee": "postgres",
    "privilege_type": "TRIGGER",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_config",
    "grantee": "postgres",
    "privilege_type": "TRUNCATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_config",
    "grantee": "postgres",
    "privilege_type": "UPDATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_config",
    "grantee": "service_role",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_config",
    "grantee": "service_role",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_config",
    "grantee": "service_role",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_config",
    "grantee": "service_role",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_config",
    "grantee": "service_role",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_config",
    "grantee": "service_role",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_config",
    "grantee": "service_role",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_history",
    "grantee": "anon",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_history",
    "grantee": "anon",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_history",
    "grantee": "anon",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_history",
    "grantee": "anon",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_history",
    "grantee": "anon",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_history",
    "grantee": "anon",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_history",
    "grantee": "anon",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_history",
    "grantee": "authenticated",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_history",
    "grantee": "authenticated",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_history",
    "grantee": "authenticated",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_history",
    "grantee": "authenticated",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_history",
    "grantee": "authenticated",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_history",
    "grantee": "authenticated",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_history",
    "grantee": "authenticated",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_history",
    "grantee": "postgres",
    "privilege_type": "DELETE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_history",
    "grantee": "postgres",
    "privilege_type": "INSERT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_history",
    "grantee": "postgres",
    "privilege_type": "REFERENCES",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_history",
    "grantee": "postgres",
    "privilege_type": "SELECT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_history",
    "grantee": "postgres",
    "privilege_type": "TRIGGER",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_history",
    "grantee": "postgres",
    "privilege_type": "TRUNCATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_history",
    "grantee": "postgres",
    "privilege_type": "UPDATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_history",
    "grantee": "service_role",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_history",
    "grantee": "service_role",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_history",
    "grantee": "service_role",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_history",
    "grantee": "service_role",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_history",
    "grantee": "service_role",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_history",
    "grantee": "service_role",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_history",
    "grantee": "service_role",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_levels",
    "grantee": "anon",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_levels",
    "grantee": "anon",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_levels",
    "grantee": "anon",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_levels",
    "grantee": "anon",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_levels",
    "grantee": "anon",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_levels",
    "grantee": "anon",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_levels",
    "grantee": "anon",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_levels",
    "grantee": "authenticated",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_levels",
    "grantee": "authenticated",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_levels",
    "grantee": "authenticated",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_levels",
    "grantee": "authenticated",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_levels",
    "grantee": "authenticated",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_levels",
    "grantee": "authenticated",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_levels",
    "grantee": "authenticated",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_levels",
    "grantee": "postgres",
    "privilege_type": "DELETE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_levels",
    "grantee": "postgres",
    "privilege_type": "INSERT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_levels",
    "grantee": "postgres",
    "privilege_type": "REFERENCES",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_levels",
    "grantee": "postgres",
    "privilege_type": "SELECT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_levels",
    "grantee": "postgres",
    "privilege_type": "TRIGGER",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_levels",
    "grantee": "postgres",
    "privilege_type": "TRUNCATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_levels",
    "grantee": "postgres",
    "privilege_type": "UPDATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_levels",
    "grantee": "service_role",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_levels",
    "grantee": "service_role",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_levels",
    "grantee": "service_role",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_levels",
    "grantee": "service_role",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_levels",
    "grantee": "service_role",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_levels",
    "grantee": "service_role",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "ranking_levels",
    "grantee": "service_role",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "report_assets",
    "grantee": "anon",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "report_assets",
    "grantee": "anon",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "report_assets",
    "grantee": "anon",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "report_assets",
    "grantee": "anon",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "report_assets",
    "grantee": "anon",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "report_assets",
    "grantee": "anon",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "report_assets",
    "grantee": "anon",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "report_assets",
    "grantee": "authenticated",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "report_assets",
    "grantee": "authenticated",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "report_assets",
    "grantee": "authenticated",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "report_assets",
    "grantee": "authenticated",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "report_assets",
    "grantee": "authenticated",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "report_assets",
    "grantee": "authenticated",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "report_assets",
    "grantee": "authenticated",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "report_assets",
    "grantee": "postgres",
    "privilege_type": "DELETE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "report_assets",
    "grantee": "postgres",
    "privilege_type": "INSERT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "report_assets",
    "grantee": "postgres",
    "privilege_type": "REFERENCES",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "report_assets",
    "grantee": "postgres",
    "privilege_type": "SELECT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "report_assets",
    "grantee": "postgres",
    "privilege_type": "TRIGGER",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "report_assets",
    "grantee": "postgres",
    "privilege_type": "TRUNCATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "report_assets",
    "grantee": "postgres",
    "privilege_type": "UPDATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "report_assets",
    "grantee": "service_role",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "report_assets",
    "grantee": "service_role",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "report_assets",
    "grantee": "service_role",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "report_assets",
    "grantee": "service_role",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "report_assets",
    "grantee": "service_role",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "report_assets",
    "grantee": "service_role",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "report_assets",
    "grantee": "service_role",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "report_cards",
    "grantee": "anon",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "report_cards",
    "grantee": "anon",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "report_cards",
    "grantee": "anon",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "report_cards",
    "grantee": "anon",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "report_cards",
    "grantee": "anon",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "report_cards",
    "grantee": "anon",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "report_cards",
    "grantee": "anon",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "report_cards",
    "grantee": "authenticated",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "report_cards",
    "grantee": "authenticated",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "report_cards",
    "grantee": "authenticated",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "report_cards",
    "grantee": "authenticated",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "report_cards",
    "grantee": "authenticated",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "report_cards",
    "grantee": "authenticated",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "report_cards",
    "grantee": "authenticated",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "report_cards",
    "grantee": "postgres",
    "privilege_type": "DELETE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "report_cards",
    "grantee": "postgres",
    "privilege_type": "INSERT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "report_cards",
    "grantee": "postgres",
    "privilege_type": "REFERENCES",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "report_cards",
    "grantee": "postgres",
    "privilege_type": "SELECT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "report_cards",
    "grantee": "postgres",
    "privilege_type": "TRIGGER",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "report_cards",
    "grantee": "postgres",
    "privilege_type": "TRUNCATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "report_cards",
    "grantee": "postgres",
    "privilege_type": "UPDATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "report_cards",
    "grantee": "service_role",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "report_cards",
    "grantee": "service_role",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "report_cards",
    "grantee": "service_role",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "report_cards",
    "grantee": "service_role",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "report_cards",
    "grantee": "service_role",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "report_cards",
    "grantee": "service_role",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "report_cards",
    "grantee": "service_role",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "report_goals",
    "grantee": "anon",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "report_goals",
    "grantee": "anon",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "report_goals",
    "grantee": "anon",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "report_goals",
    "grantee": "anon",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "report_goals",
    "grantee": "anon",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "report_goals",
    "grantee": "anon",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "report_goals",
    "grantee": "anon",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "report_goals",
    "grantee": "authenticated",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "report_goals",
    "grantee": "authenticated",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "report_goals",
    "grantee": "authenticated",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "report_goals",
    "grantee": "authenticated",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "report_goals",
    "grantee": "authenticated",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "report_goals",
    "grantee": "authenticated",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "report_goals",
    "grantee": "authenticated",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "report_goals",
    "grantee": "postgres",
    "privilege_type": "DELETE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "report_goals",
    "grantee": "postgres",
    "privilege_type": "INSERT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "report_goals",
    "grantee": "postgres",
    "privilege_type": "REFERENCES",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "report_goals",
    "grantee": "postgres",
    "privilege_type": "SELECT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "report_goals",
    "grantee": "postgres",
    "privilege_type": "TRIGGER",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "report_goals",
    "grantee": "postgres",
    "privilege_type": "TRUNCATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "report_goals",
    "grantee": "postgres",
    "privilege_type": "UPDATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "report_goals",
    "grantee": "service_role",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "report_goals",
    "grantee": "service_role",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "report_goals",
    "grantee": "service_role",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "report_goals",
    "grantee": "service_role",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "report_goals",
    "grantee": "service_role",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "report_goals",
    "grantee": "service_role",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "report_goals",
    "grantee": "service_role",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "report_injuries",
    "grantee": "anon",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "report_injuries",
    "grantee": "anon",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "report_injuries",
    "grantee": "anon",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "report_injuries",
    "grantee": "anon",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "report_injuries",
    "grantee": "anon",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "report_injuries",
    "grantee": "anon",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "report_injuries",
    "grantee": "anon",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "report_injuries",
    "grantee": "authenticated",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "report_injuries",
    "grantee": "authenticated",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "report_injuries",
    "grantee": "authenticated",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "report_injuries",
    "grantee": "authenticated",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "report_injuries",
    "grantee": "authenticated",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "report_injuries",
    "grantee": "authenticated",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "report_injuries",
    "grantee": "authenticated",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "report_injuries",
    "grantee": "postgres",
    "privilege_type": "DELETE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "report_injuries",
    "grantee": "postgres",
    "privilege_type": "INSERT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "report_injuries",
    "grantee": "postgres",
    "privilege_type": "REFERENCES",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "report_injuries",
    "grantee": "postgres",
    "privilege_type": "SELECT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "report_injuries",
    "grantee": "postgres",
    "privilege_type": "TRIGGER",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "report_injuries",
    "grantee": "postgres",
    "privilege_type": "TRUNCATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "report_injuries",
    "grantee": "postgres",
    "privilege_type": "UPDATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "public",
    "table_name": "report_injuries",
    "grantee": "service_role",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "report_injuries",
    "grantee": "service_role",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "report_injuries",
    "grantee": "service_role",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "report_injuries",
    "grantee": "service_role",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "report_injuries",
    "grantee": "service_role",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "report_injuries",
    "grantee": "service_role",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "public",
    "table_name": "report_injuries",
    "grantee": "service_role",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "division_seasons",
    "grantee": "postgres",
    "privilege_type": "DELETE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "division_seasons",
    "grantee": "postgres",
    "privilege_type": "INSERT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "division_seasons",
    "grantee": "postgres",
    "privilege_type": "REFERENCES",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "division_seasons",
    "grantee": "postgres",
    "privilege_type": "SELECT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "division_seasons",
    "grantee": "postgres",
    "privilege_type": "TRIGGER",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "division_seasons",
    "grantee": "postgres",
    "privilege_type": "TRUNCATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "division_seasons",
    "grantee": "postgres",
    "privilege_type": "UPDATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "division_seasons",
    "grantee": "service_role",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "division_seasons",
    "grantee": "service_role",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "division_seasons",
    "grantee": "service_role",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "division_seasons",
    "grantee": "service_role",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "divisions",
    "grantee": "anon",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "divisions",
    "grantee": "anon",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "divisions",
    "grantee": "anon",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "divisions",
    "grantee": "anon",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "divisions",
    "grantee": "anon",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "divisions",
    "grantee": "anon",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "divisions",
    "grantee": "anon",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "divisions",
    "grantee": "authenticated",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "divisions",
    "grantee": "authenticated",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "divisions",
    "grantee": "authenticated",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "divisions",
    "grantee": "authenticated",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "divisions",
    "grantee": "authenticated",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "divisions",
    "grantee": "authenticated",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "divisions",
    "grantee": "authenticated",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "divisions",
    "grantee": "postgres",
    "privilege_type": "DELETE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "divisions",
    "grantee": "postgres",
    "privilege_type": "INSERT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "divisions",
    "grantee": "postgres",
    "privilege_type": "REFERENCES",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "divisions",
    "grantee": "postgres",
    "privilege_type": "SELECT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "divisions",
    "grantee": "postgres",
    "privilege_type": "TRIGGER",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "divisions",
    "grantee": "postgres",
    "privilege_type": "TRUNCATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "divisions",
    "grantee": "postgres",
    "privilege_type": "UPDATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "divisions",
    "grantee": "service_role",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "divisions",
    "grantee": "service_role",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "divisions",
    "grantee": "service_role",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "divisions",
    "grantee": "service_role",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "divisions",
    "grantee": "service_role",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "divisions",
    "grantee": "service_role",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "divisions",
    "grantee": "service_role",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_context",
    "grantee": "postgres",
    "privilege_type": "DELETE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_context",
    "grantee": "postgres",
    "privilege_type": "INSERT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_context",
    "grantee": "postgres",
    "privilege_type": "REFERENCES",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_context",
    "grantee": "postgres",
    "privilege_type": "SELECT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_context",
    "grantee": "postgres",
    "privilege_type": "TRIGGER",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_context",
    "grantee": "postgres",
    "privilege_type": "TRUNCATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_context",
    "grantee": "postgres",
    "privilege_type": "UPDATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_context",
    "grantee": "service_role",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_context",
    "grantee": "service_role",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_context",
    "grantee": "service_role",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_context",
    "grantee": "service_role",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_context_logs",
    "grantee": "postgres",
    "privilege_type": "DELETE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_context_logs",
    "grantee": "postgres",
    "privilege_type": "INSERT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_context_logs",
    "grantee": "postgres",
    "privilege_type": "REFERENCES",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_context_logs",
    "grantee": "postgres",
    "privilege_type": "SELECT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_context_logs",
    "grantee": "postgres",
    "privilege_type": "TRIGGER",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_context_logs",
    "grantee": "postgres",
    "privilege_type": "TRUNCATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_context_logs",
    "grantee": "postgres",
    "privilege_type": "UPDATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_context_logs",
    "grantee": "service_role",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_context_logs",
    "grantee": "service_role",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_context_logs",
    "grantee": "service_role",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_context_logs",
    "grantee": "service_role",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_roster_view",
    "grantee": "anon",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_roster_view",
    "grantee": "anon",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_roster_view",
    "grantee": "anon",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_roster_view",
    "grantee": "anon",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_roster_view",
    "grantee": "anon",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_roster_view",
    "grantee": "anon",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_roster_view",
    "grantee": "anon",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_roster_view",
    "grantee": "authenticated",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_roster_view",
    "grantee": "authenticated",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_roster_view",
    "grantee": "authenticated",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_roster_view",
    "grantee": "authenticated",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_roster_view",
    "grantee": "authenticated",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_roster_view",
    "grantee": "authenticated",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_roster_view",
    "grantee": "authenticated",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_roster_view",
    "grantee": "postgres",
    "privilege_type": "DELETE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_roster_view",
    "grantee": "postgres",
    "privilege_type": "INSERT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_roster_view",
    "grantee": "postgres",
    "privilege_type": "REFERENCES",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_roster_view",
    "grantee": "postgres",
    "privilege_type": "SELECT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_roster_view",
    "grantee": "postgres",
    "privilege_type": "TRIGGER",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_roster_view",
    "grantee": "postgres",
    "privilege_type": "TRUNCATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_roster_view",
    "grantee": "postgres",
    "privilege_type": "UPDATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_roster_view",
    "grantee": "service_role",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_roster_view",
    "grantee": "service_role",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_roster_view",
    "grantee": "service_role",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_roster_view",
    "grantee": "service_role",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_roster_view",
    "grantee": "service_role",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_roster_view",
    "grantee": "service_role",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_roster_view",
    "grantee": "service_role",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_rosters",
    "grantee": "anon",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_rosters",
    "grantee": "anon",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_rosters",
    "grantee": "anon",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_rosters",
    "grantee": "anon",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_rosters",
    "grantee": "anon",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_rosters",
    "grantee": "anon",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_rosters",
    "grantee": "anon",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_rosters",
    "grantee": "authenticated",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_rosters",
    "grantee": "authenticated",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_rosters",
    "grantee": "authenticated",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_rosters",
    "grantee": "authenticated",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_rosters",
    "grantee": "authenticated",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_rosters",
    "grantee": "authenticated",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_rosters",
    "grantee": "authenticated",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_rosters",
    "grantee": "postgres",
    "privilege_type": "DELETE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_rosters",
    "grantee": "postgres",
    "privilege_type": "INSERT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_rosters",
    "grantee": "postgres",
    "privilege_type": "REFERENCES",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_rosters",
    "grantee": "postgres",
    "privilege_type": "SELECT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_rosters",
    "grantee": "postgres",
    "privilege_type": "TRIGGER",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_rosters",
    "grantee": "postgres",
    "privilege_type": "TRUNCATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_rosters",
    "grantee": "postgres",
    "privilege_type": "UPDATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_rosters",
    "grantee": "service_role",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_rosters",
    "grantee": "service_role",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_rosters",
    "grantee": "service_role",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_rosters",
    "grantee": "service_role",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_rosters",
    "grantee": "service_role",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_rosters",
    "grantee": "service_role",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "match_rosters",
    "grantee": "service_role",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "organizations",
    "grantee": "anon",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "organizations",
    "grantee": "anon",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "organizations",
    "grantee": "anon",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "organizations",
    "grantee": "anon",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "organizations",
    "grantee": "anon",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "organizations",
    "grantee": "anon",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "organizations",
    "grantee": "anon",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "organizations",
    "grantee": "authenticated",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "organizations",
    "grantee": "authenticated",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "organizations",
    "grantee": "authenticated",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "organizations",
    "grantee": "authenticated",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "organizations",
    "grantee": "authenticated",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "organizations",
    "grantee": "authenticated",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "organizations",
    "grantee": "authenticated",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "organizations",
    "grantee": "postgres",
    "privilege_type": "DELETE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "organizations",
    "grantee": "postgres",
    "privilege_type": "INSERT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "organizations",
    "grantee": "postgres",
    "privilege_type": "REFERENCES",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "organizations",
    "grantee": "postgres",
    "privilege_type": "SELECT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "organizations",
    "grantee": "postgres",
    "privilege_type": "TRIGGER",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "organizations",
    "grantee": "postgres",
    "privilege_type": "TRUNCATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "organizations",
    "grantee": "postgres",
    "privilege_type": "UPDATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "organizations",
    "grantee": "service_role",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "organizations",
    "grantee": "service_role",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "organizations",
    "grantee": "service_role",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "organizations",
    "grantee": "service_role",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "organizations",
    "grantee": "service_role",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "organizations",
    "grantee": "service_role",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "organizations",
    "grantee": "service_role",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "player_card_reason_stats",
    "grantee": "postgres",
    "privilege_type": "DELETE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "player_card_reason_stats",
    "grantee": "postgres",
    "privilege_type": "INSERT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "player_card_reason_stats",
    "grantee": "postgres",
    "privilege_type": "REFERENCES",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "player_card_reason_stats",
    "grantee": "postgres",
    "privilege_type": "SELECT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "player_card_reason_stats",
    "grantee": "postgres",
    "privilege_type": "TRIGGER",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "player_card_reason_stats",
    "grantee": "postgres",
    "privilege_type": "TRUNCATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "player_card_reason_stats",
    "grantee": "postgres",
    "privilege_type": "UPDATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "player_card_reason_stats",
    "grantee": "service_role",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "player_card_reason_stats",
    "grantee": "service_role",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "player_card_reason_stats",
    "grantee": "service_role",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "player_card_reason_stats",
    "grantee": "service_role",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "player_registrations",
    "grantee": "postgres",
    "privilege_type": "DELETE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "player_registrations",
    "grantee": "postgres",
    "privilege_type": "INSERT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "player_registrations",
    "grantee": "postgres",
    "privilege_type": "REFERENCES",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "player_registrations",
    "grantee": "postgres",
    "privilege_type": "SELECT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "player_registrations",
    "grantee": "postgres",
    "privilege_type": "TRIGGER",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "player_registrations",
    "grantee": "postgres",
    "privilege_type": "TRUNCATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "player_registrations",
    "grantee": "postgres",
    "privilege_type": "UPDATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "player_registrations",
    "grantee": "service_role",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "player_registrations",
    "grantee": "service_role",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "player_registrations",
    "grantee": "service_role",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "player_registrations",
    "grantee": "service_role",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "player_team_season_stats",
    "grantee": "postgres",
    "privilege_type": "DELETE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "player_team_season_stats",
    "grantee": "postgres",
    "privilege_type": "INSERT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "player_team_season_stats",
    "grantee": "postgres",
    "privilege_type": "REFERENCES",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "player_team_season_stats",
    "grantee": "postgres",
    "privilege_type": "SELECT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "player_team_season_stats",
    "grantee": "postgres",
    "privilege_type": "TRIGGER",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "player_team_season_stats",
    "grantee": "postgres",
    "privilege_type": "TRUNCATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "player_team_season_stats",
    "grantee": "postgres",
    "privilege_type": "UPDATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "player_team_season_stats",
    "grantee": "service_role",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "player_team_season_stats",
    "grantee": "service_role",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "player_team_season_stats",
    "grantee": "service_role",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "player_team_season_stats",
    "grantee": "service_role",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "players",
    "grantee": "anon",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "players",
    "grantee": "anon",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "players",
    "grantee": "anon",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "players",
    "grantee": "anon",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "players",
    "grantee": "anon",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "players",
    "grantee": "anon",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "players",
    "grantee": "anon",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "players",
    "grantee": "authenticated",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "players",
    "grantee": "authenticated",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "players",
    "grantee": "authenticated",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "players",
    "grantee": "authenticated",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "players",
    "grantee": "authenticated",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "players",
    "grantee": "authenticated",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "players",
    "grantee": "authenticated",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "players",
    "grantee": "postgres",
    "privilege_type": "DELETE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "players",
    "grantee": "postgres",
    "privilege_type": "INSERT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "players",
    "grantee": "postgres",
    "privilege_type": "REFERENCES",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "players",
    "grantee": "postgres",
    "privilege_type": "SELECT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "players",
    "grantee": "postgres",
    "privilege_type": "TRIGGER",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "players",
    "grantee": "postgres",
    "privilege_type": "TRUNCATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "players",
    "grantee": "postgres",
    "privilege_type": "UPDATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "players",
    "grantee": "service_role",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "players",
    "grantee": "service_role",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "players",
    "grantee": "service_role",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "players",
    "grantee": "service_role",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "players",
    "grantee": "service_role",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "players",
    "grantee": "service_role",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "players",
    "grantee": "service_role",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "seasons",
    "grantee": "postgres",
    "privilege_type": "DELETE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "seasons",
    "grantee": "postgres",
    "privilege_type": "INSERT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "seasons",
    "grantee": "postgres",
    "privilege_type": "REFERENCES",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "seasons",
    "grantee": "postgres",
    "privilege_type": "SELECT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "seasons",
    "grantee": "postgres",
    "privilege_type": "TRIGGER",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "seasons",
    "grantee": "postgres",
    "privilege_type": "TRUNCATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "seasons",
    "grantee": "postgres",
    "privilege_type": "UPDATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "seasons",
    "grantee": "service_role",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "seasons",
    "grantee": "service_role",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "seasons",
    "grantee": "service_role",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "seasons",
    "grantee": "service_role",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "team_registrations",
    "grantee": "postgres",
    "privilege_type": "DELETE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "team_registrations",
    "grantee": "postgres",
    "privilege_type": "INSERT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "team_registrations",
    "grantee": "postgres",
    "privilege_type": "REFERENCES",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "team_registrations",
    "grantee": "postgres",
    "privilege_type": "SELECT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "team_registrations",
    "grantee": "postgres",
    "privilege_type": "TRIGGER",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "team_registrations",
    "grantee": "postgres",
    "privilege_type": "TRUNCATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "team_registrations",
    "grantee": "postgres",
    "privilege_type": "UPDATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "team_registrations",
    "grantee": "service_role",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "team_registrations",
    "grantee": "service_role",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "team_registrations",
    "grantee": "service_role",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "team_registrations",
    "grantee": "service_role",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "team_season_standings",
    "grantee": "postgres",
    "privilege_type": "DELETE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "team_season_standings",
    "grantee": "postgres",
    "privilege_type": "INSERT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "team_season_standings",
    "grantee": "postgres",
    "privilege_type": "REFERENCES",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "team_season_standings",
    "grantee": "postgres",
    "privilege_type": "SELECT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "team_season_standings",
    "grantee": "postgres",
    "privilege_type": "TRIGGER",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "team_season_standings",
    "grantee": "postgres",
    "privilege_type": "TRUNCATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "team_season_standings",
    "grantee": "postgres",
    "privilege_type": "UPDATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "team_season_standings",
    "grantee": "service_role",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "team_season_standings",
    "grantee": "service_role",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "team_season_standings",
    "grantee": "service_role",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "team_season_standings",
    "grantee": "service_role",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "teams",
    "grantee": "anon",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "teams",
    "grantee": "anon",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "teams",
    "grantee": "anon",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "teams",
    "grantee": "anon",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "teams",
    "grantee": "anon",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "teams",
    "grantee": "anon",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "teams",
    "grantee": "anon",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "teams",
    "grantee": "authenticated",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "teams",
    "grantee": "authenticated",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "teams",
    "grantee": "authenticated",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "teams",
    "grantee": "authenticated",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "teams",
    "grantee": "authenticated",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "teams",
    "grantee": "authenticated",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "teams",
    "grantee": "authenticated",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "teams",
    "grantee": "postgres",
    "privilege_type": "DELETE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "teams",
    "grantee": "postgres",
    "privilege_type": "INSERT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "teams",
    "grantee": "postgres",
    "privilege_type": "REFERENCES",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "teams",
    "grantee": "postgres",
    "privilege_type": "SELECT",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "teams",
    "grantee": "postgres",
    "privilege_type": "TRIGGER",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "teams",
    "grantee": "postgres",
    "privilege_type": "TRUNCATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "teams",
    "grantee": "postgres",
    "privilege_type": "UPDATE",
    "is_grantable": "YES"
  },
  {
    "table_schema": "tournaments",
    "table_name": "teams",
    "grantee": "service_role",
    "privilege_type": "DELETE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "teams",
    "grantee": "service_role",
    "privilege_type": "INSERT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "teams",
    "grantee": "service_role",
    "privilege_type": "REFERENCES",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "teams",
    "grantee": "service_role",
    "privilege_type": "SELECT",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "teams",
    "grantee": "service_role",
    "privilege_type": "TRIGGER",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "teams",
    "grantee": "service_role",
    "privilege_type": "TRUNCATE",
    "is_grantable": "NO"
  },
  {
    "table_schema": "tournaments",
    "table_name": "teams",
    "grantee": "service_role",
    "privilege_type": "UPDATE",
    "is_grantable": "NO"
  }
]
```

---

## Table/View Privilege Interpretation

Important fields:

- `table_schema` — schema containing the object.
- `table_name` — table or view.
- `grantee` — PostgreSQL role receiving the privilege.
- `privilege_type` — allowed database operation.
- `is_grantable` — whether the grantee can grant that privilege to another role.

Common privileges include:

- `SELECT`
- `INSERT`
- `UPDATE`
- `DELETE`
- `TRUNCATE`
- `REFERENCES`
- `TRIGGER`

---

# Part 2 — Function / Routine Privileges

## Query

```sql
select
  routine_schema,
  routine_name,
  grantee,
  privilege_type,
  is_grantable
from information_schema.role_routine_grants
where routine_schema in ('public', 'tournaments', 'development')
order by
  routine_schema,
  routine_name,
  grantee,
  privilege_type;
```

## Result

```json
[
  {
    "routine_schema": "development",
    "routine_name": "capture_monthly_ranking_snapshot",
    "grantee": "postgres",
    "privilege_type": "EXECUTE",
    "is_grantable": "YES"
  },
  {
    "routine_schema": "development",
    "routine_name": "capture_monthly_ranking_snapshot",
    "grantee": "service_role",
    "privilege_type": "EXECUTE",
    "is_grantable": "NO"
  },
  {
    "routine_schema": "development",
    "routine_name": "capture_previous_month_ranking_snapshot",
    "grantee": "postgres",
    "privilege_type": "EXECUTE",
    "is_grantable": "YES"
  },
  {
    "routine_schema": "development",
    "routine_name": "capture_previous_month_ranking_snapshot",
    "grantee": "service_role",
    "privilege_type": "EXECUTE",
    "is_grantable": "NO"
  },
  {
    "routine_schema": "development",
    "routine_name": "finalize_quiz_attempt",
    "grantee": "postgres",
    "privilege_type": "EXECUTE",
    "is_grantable": "YES"
  },
  {
    "routine_schema": "development",
    "routine_name": "finalize_quiz_attempt",
    "grantee": "service_role",
    "privilege_type": "EXECUTE",
    "is_grantable": "NO"
  },
  {
    "routine_schema": "development",
    "routine_name": "prevent_scoring_period_overlap",
    "grantee": "PUBLIC",
    "privilege_type": "EXECUTE",
    "is_grantable": "NO"
  },
  {
    "routine_schema": "development",
    "routine_name": "prevent_scoring_period_overlap",
    "grantee": "postgres",
    "privilege_type": "EXECUTE",
    "is_grantable": "YES"
  },
  {
    "routine_schema": "development",
    "routine_name": "prevent_scoring_period_overlap",
    "grantee": "service_role",
    "privilege_type": "EXECUTE",
    "is_grantable": "NO"
  },
  {
    "routine_schema": "development",
    "routine_name": "protect_started_scoring_period",
    "grantee": "PUBLIC",
    "privilege_type": "EXECUTE",
    "is_grantable": "NO"
  },
  {
    "routine_schema": "development",
    "routine_name": "protect_started_scoring_period",
    "grantee": "postgres",
    "privilege_type": "EXECUTE",
    "is_grantable": "YES"
  },
  {
    "routine_schema": "development",
    "routine_name": "protect_started_scoring_period",
    "grantee": "service_role",
    "privilege_type": "EXECUTE",
    "is_grantable": "NO"
  },
  {
    "routine_schema": "development",
    "routine_name": "publish_quiz_assessment",
    "grantee": "postgres",
    "privilege_type": "EXECUTE",
    "is_grantable": "YES"
  },
  {
    "routine_schema": "development",
    "routine_name": "publish_quiz_assessment",
    "grantee": "service_role",
    "privilege_type": "EXECUTE",
    "is_grantable": "NO"
  },
  {
    "routine_schema": "development",
    "routine_name": "refresh_active_cycle_ranking_snapshot",
    "grantee": "postgres",
    "privilege_type": "EXECUTE",
    "is_grantable": "YES"
  },
  {
    "routine_schema": "development",
    "routine_name": "refresh_active_cycle_ranking_snapshot",
    "grantee": "service_role",
    "privilege_type": "EXECUTE",
    "is_grantable": "NO"
  },
  {
    "routine_schema": "development",
    "routine_name": "refresh_current_ranking_snapshot",
    "grantee": "postgres",
    "privilege_type": "EXECUTE",
    "is_grantable": "YES"
  },
  {
    "routine_schema": "development",
    "routine_name": "refresh_current_ranking_snapshot",
    "grantee": "service_role",
    "privilege_type": "EXECUTE",
    "is_grantable": "NO"
  },
  {
    "routine_schema": "development",
    "routine_name": "save_quiz_answer",
    "grantee": "postgres",
    "privilege_type": "EXECUTE",
    "is_grantable": "YES"
  },
  {
    "routine_schema": "development",
    "routine_name": "save_quiz_answer",
    "grantee": "service_role",
    "privilege_type": "EXECUTE",
    "is_grantable": "NO"
  },
  {
    "routine_schema": "development",
    "routine_name": "start_quiz_attempt",
    "grantee": "postgres",
    "privilege_type": "EXECUTE",
    "is_grantable": "YES"
  },
  {
    "routine_schema": "development",
    "routine_name": "start_quiz_attempt",
    "grantee": "service_role",
    "privilege_type": "EXECUTE",
    "is_grantable": "NO"
  },
  {
    "routine_schema": "public",
    "routine_name": "current_member_role",
    "grantee": "PUBLIC",
    "privilege_type": "EXECUTE",
    "is_grantable": "NO"
  },
  {
    "routine_schema": "public",
    "routine_name": "current_member_role",
    "grantee": "anon",
    "privilege_type": "EXECUTE",
    "is_grantable": "NO"
  },
  {
    "routine_schema": "public",
    "routine_name": "current_member_role",
    "grantee": "authenticated",
    "privilege_type": "EXECUTE",
    "is_grantable": "NO"
  },
  {
    "routine_schema": "public",
    "routine_name": "current_member_role",
    "grantee": "postgres",
    "privilege_type": "EXECUTE",
    "is_grantable": "YES"
  },
  {
    "routine_schema": "public",
    "routine_name": "current_member_role",
    "grantee": "service_role",
    "privilege_type": "EXECUTE",
    "is_grantable": "NO"
  },
  {
    "routine_schema": "public",
    "routine_name": "handle_new_user",
    "grantee": "PUBLIC",
    "privilege_type": "EXECUTE",
    "is_grantable": "NO"
  },
  {
    "routine_schema": "public",
    "routine_name": "handle_new_user",
    "grantee": "anon",
    "privilege_type": "EXECUTE",
    "is_grantable": "NO"
  },
  {
    "routine_schema": "public",
    "routine_name": "handle_new_user",
    "grantee": "authenticated",
    "privilege_type": "EXECUTE",
    "is_grantable": "NO"
  },
  {
    "routine_schema": "public",
    "routine_name": "handle_new_user",
    "grantee": "postgres",
    "privilege_type": "EXECUTE",
    "is_grantable": "YES"
  },
  {
    "routine_schema": "public",
    "routine_name": "handle_new_user",
    "grantee": "service_role",
    "privilege_type": "EXECUTE",
    "is_grantable": "NO"
  },
  {
    "routine_schema": "public",
    "routine_name": "is_board",
    "grantee": "PUBLIC",
    "privilege_type": "EXECUTE",
    "is_grantable": "NO"
  },
  {
    "routine_schema": "public",
    "routine_name": "is_board",
    "grantee": "anon",
    "privilege_type": "EXECUTE",
    "is_grantable": "NO"
  },
  {
    "routine_schema": "public",
    "routine_name": "is_board",
    "grantee": "authenticated",
    "privilege_type": "EXECUTE",
    "is_grantable": "NO"
  },
  {
    "routine_schema": "public",
    "routine_name": "is_board",
    "grantee": "postgres",
    "privilege_type": "EXECUTE",
    "is_grantable": "YES"
  },
  {
    "routine_schema": "public",
    "routine_name": "is_board",
    "grantee": "service_role",
    "privilege_type": "EXECUTE",
    "is_grantable": "NO"
  },
  {
    "routine_schema": "public",
    "routine_name": "run_monthly_ranking_snapshot",
    "grantee": "PUBLIC",
    "privilege_type": "EXECUTE",
    "is_grantable": "NO"
  },
  {
    "routine_schema": "public",
    "routine_name": "run_monthly_ranking_snapshot",
    "grantee": "anon",
    "privilege_type": "EXECUTE",
    "is_grantable": "NO"
  },
  {
    "routine_schema": "public",
    "routine_name": "run_monthly_ranking_snapshot",
    "grantee": "authenticated",
    "privilege_type": "EXECUTE",
    "is_grantable": "NO"
  },
  {
    "routine_schema": "public",
    "routine_name": "run_monthly_ranking_snapshot",
    "grantee": "postgres",
    "privilege_type": "EXECUTE",
    "is_grantable": "YES"
  },
  {
    "routine_schema": "public",
    "routine_name": "run_monthly_ranking_snapshot",
    "grantee": "service_role",
    "privilege_type": "EXECUTE",
    "is_grantable": "NO"
  },
  {
    "routine_schema": "public",
    "routine_name": "sync_match_report_status",
    "grantee": "PUBLIC",
    "privilege_type": "EXECUTE",
    "is_grantable": "NO"
  },
  {
    "routine_schema": "public",
    "routine_name": "sync_match_report_status",
    "grantee": "anon",
    "privilege_type": "EXECUTE",
    "is_grantable": "NO"
  },
  {
    "routine_schema": "public",
    "routine_name": "sync_match_report_status",
    "grantee": "authenticated",
    "privilege_type": "EXECUTE",
    "is_grantable": "NO"
  },
  {
    "routine_schema": "public",
    "routine_name": "sync_match_report_status",
    "grantee": "postgres",
    "privilege_type": "EXECUTE",
    "is_grantable": "YES"
  },
  {
    "routine_schema": "public",
    "routine_name": "sync_match_report_status",
    "grantee": "service_role",
    "privilege_type": "EXECUTE",
    "is_grantable": "NO"
  },
  {
    "routine_schema": "tournaments",
    "routine_name": "build_match_context",
    "grantee": "authenticated",
    "privilege_type": "EXECUTE",
    "is_grantable": "NO"
  },
  {
    "routine_schema": "tournaments",
    "routine_name": "build_match_context",
    "grantee": "postgres",
    "privilege_type": "EXECUTE",
    "is_grantable": "YES"
  },
  {
    "routine_schema": "tournaments",
    "routine_name": "build_match_context",
    "grantee": "service_role",
    "privilege_type": "EXECUTE",
    "is_grantable": "NO"
  },
  {
    "routine_schema": "tournaments",
    "routine_name": "handle_match_context_trigger",
    "grantee": "postgres",
    "privilege_type": "EXECUTE",
    "is_grantable": "YES"
  },
  {
    "routine_schema": "tournaments",
    "routine_name": "handle_match_context_trigger",
    "grantee": "service_role",
    "privilege_type": "EXECUTE",
    "is_grantable": "NO"
  },
  {
    "routine_schema": "tournaments",
    "routine_name": "import_team_roster",
    "grantee": "postgres",
    "privilege_type": "EXECUTE",
    "is_grantable": "YES"
  },
  {
    "routine_schema": "tournaments",
    "routine_name": "import_team_roster",
    "grantee": "service_role",
    "privilege_type": "EXECUTE",
    "is_grantable": "NO"
  },
  {
    "routine_schema": "tournaments",
    "routine_name": "set_updated_at",
    "grantee": "PUBLIC",
    "privilege_type": "EXECUTE",
    "is_grantable": "NO"
  },
  {
    "routine_schema": "tournaments",
    "routine_name": "set_updated_at",
    "grantee": "postgres",
    "privilege_type": "EXECUTE",
    "is_grantable": "YES"
  },
  {
    "routine_schema": "tournaments",
    "routine_name": "set_updated_at",
    "grantee": "service_role",
    "privilege_type": "EXECUTE",
    "is_grantable": "NO"
  }
]
```

---

## Function Privilege Interpretation

Each row represents a privilege granted on a PostgreSQL routine.

Important fields:

- `routine_schema` — schema containing the function.
- `routine_name` — function/routine name.
- `grantee` — role receiving the privilege.
- `privilege_type` — commonly `EXECUTE`.
- `is_grantable` — whether the privilege may be granted onward.

---

## Audit Notes

Database access must not be evaluated from RLS alone.

Effective access depends on the combination of:

```text
GRANT / privilege
        +
RLS enabled state
        +
RLS policy
        +
function security mode
        +
application authentication context
```

For example:

- A role may have `SELECT` privilege but still be restricted by RLS.
- A role with no table privilege cannot normally access the table even if an RLS policy exists.
- A `SECURITY DEFINER` function may execute with privileges different from those of the caller.
- `service_role` access should be distinguished from normal authenticated-user access.

---

## Preliminary Observation

This inventory will later help identify:

- Objects broadly granted to `anon`.
- Objects granted to `authenticated`.
- Objects accessible only through privileged/server-side roles.
- Functions executable by broad roles.
- Legacy grants that may remain after application migrations.
- Differences in access patterns across the three CAFLA schemas.

No grant is classified as excessive or obsolete from this inventory alone.

---

## Audit Status

**Privilege inventory captured — security classification pending.**

No database changes were performed as part of this audit.