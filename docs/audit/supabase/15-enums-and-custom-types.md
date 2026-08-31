# Supabase Enums and Custom Types

## Purpose

Capture PostgreSQL enum and custom/domain types currently defined within the CAFLA application schemas.

Database types may encode important domain rules such as statuses, lifecycle states, enrollment classifications, roles, or other constrained values.

These types may also remain referenced by tables even when they are not directly visible in application code.

---

## Scope

Schemas included:

- `public`
- `tournaments`
- `development`

Type categories investigated:

- ENUM
- DOMAIN
- RANGE
- MULTIRANGE

---

# Part 1 — Enum Definitions

## Query

```sql
select
  n.nspname as type_schema,
  t.typname as type_name,
  e.enumsortorder as sort_order,
  e.enumlabel as enum_value
from pg_type t
join pg_namespace n
  on n.oid = t.typnamespace
join pg_enum e
  on e.enumtypid = t.oid
where n.nspname in ('public', 'tournaments', 'development')
order by
  n.nspname,
  t.typname,
  e.enumsortorder;
```

---

## Result

```json
[
  {
    "type_schema": "development",
    "type_name": "attendance_session_status",
    "sort_order": 1,
    "enum_value": "scheduled"
  },
  {
    "type_schema": "development",
    "type_name": "attendance_session_status",
    "sort_order": 1.5,
    "enum_value": "open"
  },
  {
    "type_schema": "development",
    "type_name": "attendance_session_status",
    "sort_order": 2,
    "enum_value": "completed"
  },
  {
    "type_schema": "development",
    "type_name": "attendance_session_status",
    "sort_order": 3,
    "enum_value": "cancelled"
  },
  {
    "type_schema": "development",
    "type_name": "attendance_session_type",
    "sort_order": 1,
    "enum_value": "class"
  },
  {
    "type_schema": "development",
    "type_name": "attendance_session_type",
    "sort_order": 2,
    "enum_value": "training"
  },
  {
    "type_schema": "development",
    "type_name": "attendance_session_type",
    "sort_order": 3,
    "enum_value": "meeting"
  },
  {
    "type_schema": "development",
    "type_name": "attendance_session_type",
    "sort_order": 4,
    "enum_value": "special"
  },
  {
    "type_schema": "development",
    "type_name": "attendance_session_type",
    "sort_order": 5,
    "enum_value": "other"
  },
  {
    "type_schema": "development",
    "type_name": "attendance_status",
    "sort_order": 1,
    "enum_value": "present"
  },
  {
    "type_schema": "development",
    "type_name": "attendance_status",
    "sort_order": 2,
    "enum_value": "late"
  },
  {
    "type_schema": "development",
    "type_name": "attendance_status",
    "sort_order": 3,
    "enum_value": "excused"
  },
  {
    "type_schema": "development",
    "type_name": "attendance_status",
    "sort_order": 4,
    "enum_value": "absent"
  },
  {
    "type_schema": "development",
    "type_name": "cycle_member_status",
    "sort_order": 1,
    "enum_value": "active"
  },
  {
    "type_schema": "development",
    "type_name": "cycle_member_status",
    "sort_order": 2,
    "enum_value": "withdrawn"
  },
  {
    "type_schema": "development",
    "type_name": "cycle_member_status",
    "sort_order": 3,
    "enum_value": "ineligible"
  },
  {
    "type_schema": "development",
    "type_name": "cycle_status",
    "sort_order": 1,
    "enum_value": "draft"
  },
  {
    "type_schema": "development",
    "type_name": "cycle_status",
    "sort_order": 2,
    "enum_value": "active"
  },
  {
    "type_schema": "development",
    "type_name": "cycle_status",
    "sort_order": 3,
    "enum_value": "closed"
  },
  {
    "type_schema": "development",
    "type_name": "cycle_status",
    "sort_order": 4,
    "enum_value": "archived"
  },
  {
    "type_schema": "development",
    "type_name": "enrollment_type",
    "sort_order": 1,
    "enum_value": "existing_member"
  },
  {
    "type_schema": "development",
    "type_name": "enrollment_type",
    "sort_order": 2,
    "enum_value": "new_member"
  },
  {
    "type_schema": "development",
    "type_name": "enrollment_type",
    "sort_order": 3,
    "enum_value": "manual_adjustment"
  },
  {
    "type_schema": "development",
    "type_name": "quiz_assessment_status",
    "sort_order": 1,
    "enum_value": "draft"
  },
  {
    "type_schema": "development",
    "type_name": "quiz_assessment_status",
    "sort_order": 2,
    "enum_value": "published"
  },
  {
    "type_schema": "development",
    "type_name": "quiz_assessment_status",
    "sort_order": 3,
    "enum_value": "closed"
  },
  {
    "type_schema": "development",
    "type_name": "quiz_assessment_status",
    "sort_order": 4,
    "enum_value": "archived"
  },
  {
    "type_schema": "development",
    "type_name": "quiz_attempt_status",
    "sort_order": 1,
    "enum_value": "in_progress"
  },
  {
    "type_schema": "development",
    "type_name": "quiz_attempt_status",
    "sort_order": 2,
    "enum_value": "submitted"
  },
  {
    "type_schema": "development",
    "type_name": "quiz_attempt_status",
    "sort_order": 3,
    "enum_value": "expired"
  },
  {
    "type_schema": "development",
    "type_name": "quiz_attempt_status",
    "sort_order": 4,
    "enum_value": "voided"
  },
  {
    "type_schema": "development",
    "type_name": "quiz_category",
    "sort_order": 1,
    "enum_value": "laws_of_the_game"
  },
  {
    "type_schema": "development",
    "type_name": "quiz_category",
    "sort_order": 2,
    "enum_value": "competition_rules"
  },
  {
    "type_schema": "development",
    "type_name": "quiz_category",
    "sort_order": 3,
    "enum_value": "class_review"
  },
  {
    "type_schema": "development",
    "type_name": "quiz_category",
    "sort_order": 4,
    "enum_value": "other"
  },
  {
    "type_schema": "development",
    "type_name": "quiz_language",
    "sort_order": 1,
    "enum_value": "es"
  },
  {
    "type_schema": "development",
    "type_name": "quiz_language",
    "sort_order": 2,
    "enum_value": "en"
  },
  {
    "type_schema": "development",
    "type_name": "quiz_question_type",
    "sort_order": 1,
    "enum_value": "true_false"
  },
  {
    "type_schema": "development",
    "type_name": "quiz_question_type",
    "sort_order": 2,
    "enum_value": "multiple_choice"
  },
  {
    "type_schema": "public",
    "type_name": "attendance_status",
    "sort_order": 1,
    "enum_value": "present"
  },
  {
    "type_schema": "public",
    "type_name": "attendance_status",
    "sort_order": 2,
    "enum_value": "absent"
  },
  {
    "type_schema": "public",
    "type_name": "attendance_status",
    "sort_order": 3,
    "enum_value": "excused"
  },
  {
    "type_schema": "public",
    "type_name": "attendance_status",
    "sort_order": 4,
    "enum_value": "late"
  },
  {
    "type_schema": "public",
    "type_name": "card_type",
    "sort_order": 1,
    "enum_value": "yellow"
  },
  {
    "type_schema": "public",
    "type_name": "card_type",
    "sort_order": 2,
    "enum_value": "red"
  },
  {
    "type_schema": "public",
    "type_name": "goal_type",
    "sort_order": 1,
    "enum_value": "normal"
  },
  {
    "type_schema": "public",
    "type_name": "goal_type",
    "sort_order": 2,
    "enum_value": "penalty"
  },
  {
    "type_schema": "public",
    "type_name": "goal_type",
    "sort_order": 3,
    "enum_value": "own_goal"
  },
  {
    "type_schema": "public",
    "type_name": "member_role",
    "sort_order": 1,
    "enum_value": "board"
  },
  {
    "type_schema": "public",
    "type_name": "member_role",
    "sort_order": 2,
    "enum_value": "member"
  },
  {
    "type_schema": "public",
    "type_name": "member_status",
    "sort_order": 1,
    "enum_value": "invited"
  },
  {
    "type_schema": "public",
    "type_name": "member_status",
    "sort_order": 2,
    "enum_value": "active"
  },
  {
    "type_schema": "public",
    "type_name": "member_status",
    "sort_order": 3,
    "enum_value": "inactive"
  },
  {
    "type_schema": "public",
    "type_name": "member_status",
    "sort_order": 4,
    "enum_value": "suspended"
  },
  {
    "type_schema": "public",
    "type_name": "report_status",
    "sort_order": 1,
    "enum_value": "pending"
  },
  {
    "type_schema": "public",
    "type_name": "report_status",
    "sort_order": 2,
    "enum_value": "submitted"
  },
  {
    "type_schema": "public",
    "type_name": "report_status",
    "sort_order": 3,
    "enum_value": "revision_required"
  },
  {
    "type_schema": "public",
    "type_name": "report_status",
    "sort_order": 4,
    "enum_value": "approved"
  },
  {
    "type_schema": "public",
    "type_name": "session_type",
    "sort_order": 1,
    "enum_value": "Class"
  },
  {
    "type_schema": "public",
    "type_name": "session_type",
    "sort_order": 2,
    "enum_value": "Training"
  },
  {
    "type_schema": "public",
    "type_name": "session_type",
    "sort_order": 3,
    "enum_value": "Meeting"
  },
  {
    "type_schema": "public",
    "type_name": "session_type",
    "sort_order": 4,
    "enum_value": "Special"
  },
  {
    "type_schema": "public",
    "type_name": "session_type",
    "sort_order": 5,
    "enum_value": "Other"
  }
]
```

---

## Enum Result Interpretation

Each row represents one allowed value belonging to a PostgreSQL enum.

Important fields:

- `type_schema` — schema containing the enum.
- `type_name` — enum type name.
- `sort_order` — internal ordering of the enum value.
- `enum_value` — allowed enum value.

Multiple rows with the same `type_name` represent the complete set of values allowed by that enum.

For example, a hypothetical result:

```text
development.attendance_status
    present
    late
    excused
    absent
```

would represent one enum with four allowed values.

---

# Part 2 — Custom / Domain Types

## Query

```sql
select
  n.nspname as type_schema,
  t.typname as type_name,
  case t.typtype
    when 'b' then 'BASE'
    when 'c' then 'COMPOSITE'
    when 'd' then 'DOMAIN'
    when 'e' then 'ENUM'
    when 'p' then 'PSEUDO'
    when 'r' then 'RANGE'
    when 'm' then 'MULTIRANGE'
    else t.typtype::text
  end as type_category,
  pg_catalog.format_type(t.oid, null) as formatted_type
from pg_type t
join pg_namespace n
  on n.oid = t.typnamespace
where n.nspname in ('public', 'tournaments', 'development')
  and t.typtype in ('d', 'e', 'r', 'm')
order by
  n.nspname,
  t.typname;
```

---

## Result

```json
[
  {
    "type_schema": "development",
    "type_name": "attendance_session_status",
    "type_category": "ENUM",
    "formatted_type": "development.attendance_session_status"
  },
  {
    "type_schema": "development",
    "type_name": "attendance_session_type",
    "type_category": "ENUM",
    "formatted_type": "development.attendance_session_type"
  },
  {
    "type_schema": "development",
    "type_name": "attendance_status",
    "type_category": "ENUM",
    "formatted_type": "development.attendance_status"
  },
  {
    "type_schema": "development",
    "type_name": "cycle_member_status",
    "type_category": "ENUM",
    "formatted_type": "development.cycle_member_status"
  },
  {
    "type_schema": "development",
    "type_name": "cycle_status",
    "type_category": "ENUM",
    "formatted_type": "development.cycle_status"
  },
  {
    "type_schema": "development",
    "type_name": "enrollment_type",
    "type_category": "ENUM",
    "formatted_type": "development.enrollment_type"
  },
  {
    "type_schema": "development",
    "type_name": "quiz_assessment_status",
    "type_category": "ENUM",
    "formatted_type": "development.quiz_assessment_status"
  },
  {
    "type_schema": "development",
    "type_name": "quiz_attempt_status",
    "type_category": "ENUM",
    "formatted_type": "development.quiz_attempt_status"
  },
  {
    "type_schema": "development",
    "type_name": "quiz_category",
    "type_category": "ENUM",
    "formatted_type": "development.quiz_category"
  },
  {
    "type_schema": "development",
    "type_name": "quiz_language",
    "type_category": "ENUM",
    "formatted_type": "development.quiz_language"
  },
  {
    "type_schema": "development",
    "type_name": "quiz_question_type",
    "type_category": "ENUM",
    "formatted_type": "development.quiz_question_type"
  },
  {
    "type_schema": "public",
    "type_name": "attendance_status",
    "type_category": "ENUM",
    "formatted_type": "attendance_status"
  },
  {
    "type_schema": "public",
    "type_name": "card_type",
    "type_category": "ENUM",
    "formatted_type": "card_type"
  },
  {
    "type_schema": "public",
    "type_name": "goal_type",
    "type_category": "ENUM",
    "formatted_type": "goal_type"
  },
  {
    "type_schema": "public",
    "type_name": "member_role",
    "type_category": "ENUM",
    "formatted_type": "member_role"
  },
  {
    "type_schema": "public",
    "type_name": "member_status",
    "type_category": "ENUM",
    "formatted_type": "member_status"
  },
  {
    "type_schema": "public",
    "type_name": "report_status",
    "type_category": "ENUM",
    "formatted_type": "report_status"
  },
  {
    "type_schema": "public",
    "type_name": "session_type",
    "type_category": "ENUM",
    "formatted_type": "session_type"
  }
]
```

---

## Custom Type Interpretation

Important fields:

- `type_schema` — schema containing the custom type.
- `type_name` — PostgreSQL type name.
- `type_category` — category of custom type.
- `formatted_type` — PostgreSQL representation of the type.

Relevant categories include:

- `ENUM` — fixed set of allowed values.
- `DOMAIN` — custom type derived from another PostgreSQL type with optional constraints.
- `RANGE` — range-based custom type.
- `MULTIRANGE` — collection of ranges.

Enums will intentionally appear in both Part 1 and Part 2:

- Part 1 documents their individual allowed values.
- Part 2 inventories them as database types.

---

## Audit Notes

Database types may be dependencies of table columns.

Therefore, a type must not be considered unused solely because its name does not appear in application code.

Type usage must later be cross-referenced with:

- `04-columns.md`
- Table definitions
- Functions
- Application-generated database types
- Potential legacy objects

Removing a table does not necessarily remove a custom enum or domain type automatically.

Unused types may therefore survive previous migrations and become cleanup candidates, but only after dependency verification.

---

## Preliminary Observation

This inventory will help identify:

1. Current domain states enforced by PostgreSQL.
2. Types shared across multiple modules.
3. Legacy enums potentially associated with V1 architecture.
4. Types that remain referenced by active tables.
5. Orphaned custom types that may eventually become cleanup candidates.

No type is classified as active, legacy, or removable from this inventory alone.

---

## Audit Status

**Enum and custom type inventory captured — classification pending.**

No database changes were performed as part of this audit.