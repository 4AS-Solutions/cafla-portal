# Attendance

## 1. Purpose and Scope

Attendance records CAFLA referee participation in classes, training, meetings,
and other Development-cycle activities. This module documents session and
record management, roster construction, point calculation, member-facing
reads, authorization, and the path into Development Score and Ranking.

It documents CURRENT implementation separately from confirmed participation
rules and PLANNED population architecture. It does not redefine attendance
weights or implement corrections.

## 2. Status

- Attendance V2 in `development`: **CURRENT**.
- Attendance population enforcement: **TRANSITIONAL** because database detail,
  Admin roster, and write validation use different rules.
- Public-schema Attendance V1: **RETIRED** by confirmed project history.
- Canonical population consumption: **PLANNED**.

## 3. Repository and Database Baseline

- Repository: `develop@5b47f15d8580687e66b0f9b6eeaccbe3bf3e19f4`.
- Baseline date: 2026-08-31.
- Database artifact:
  `supabase/migrations/20260831185011_remote_schema.sql`.
- Context: [`03a-development-cycles-and-participation.md`](./03a-development-cycles-and-participation.md).
- Historical evidence: `docs/audit/supabase/`, which is not guaranteed to equal
  the live post-recovery database.

Live configured scoring values, policies, grants, and row counts require
**EXTERNAL VERIFICATION**. Untracked Development seeds are excluded from this
Production architecture description.

## 4. Domain Terminology

| Term | CURRENT meaning |
|---|---|
| Session | A dated activity belonging to one Development cycle. |
| Roster | Members selected for one session by cycle membership and date logic. |
| Record | An explicit status written for one session/member pair. |
| Implicit absence | For completed scoring sessions, an applicable roster member without a record is treated as absent by the detail view. |
| Scoring rule | One per-cycle set of numeric weights for attendance statuses. |
| Attendance percentage | Average detail-row points multiplied by 100. |
| Evidence count | Present + late + excused occurrences used by Ranking evidence, excluding absences. |

## 5. Attendance Data Model

| Object | Type | Role |
|---|---|---|
| `development.attendance_sessions` | Table | Session identity, cycle, type, schedule, status, scoring flag, location, and lifecycle audit fields. |
| `development.attendance_records` | Table | Explicit member status for a session and recorder metadata. |
| `development.attendance_scoring_rules` | Table | Per-cycle point weights. |
| `development.referee_attendance_detail` | View | Applicable completed scoring sessions expanded per member, including implicit absence and points. |
| `development.referee_attendance` | View | Per-cycle member counts, total points, and percentage. |
| `development.referee_monthly_period_metric_scores_v2` | View | Monthly Attendance aggregation consumed by Development Score. |

### Constraints and relationships

- `attendance_sessions.cycle_id` references `development.cycles`.
- `attendance_records.session_id` references the session; `member_id` and
  `recorded_by` reference `public.members`.
- `(session_id, member_id)` is unique, enabling deterministic upsert.
- `attendance_scoring_rules.cycle_id` is unique: one rule row per cycle.
- All four weights are constrained to `[0, 1]`.
- Session title must remain non-empty after trimming.
- Baseline indexes support cycle/date and cycle/status session queries,
  session/status record queries, and member record lookup.
- No Attendance-specific trigger or database transition constraint was found in
  the baseline.

The historical snapshot recorded 27 V2 sessions, 436 V2 records, and one rule
row. These are historical counts, not assertions about live Production.

## 6. Session Types and Lifecycle

`development.attendance_session_type` supports `class`, `training`, `meeting`,
`special`, and `other`.

`development.attendance_session_status` supports `scheduled`, `open`,
`completed`, and `cancelled`.

| Transition/operation | CURRENT enforcement |
|---|---|
| Create | Board API only; requires active cycle, non-empty title, supported type, valid future timestamp, and Los Angeles local date within cycle. Inserts `scheduled`. |
| `scheduled -> open` | Board API only; conditional update requires scheduled status. Application first checks that no other session in the cycle is open. |
| `open -> completed` | Board API only; conditional update records completion actor/time. |
| Correct completed records | Allowed by the record endpoint and Admin UI. |
| Cancel | Enum/UI read state exists, but no current application mutation path was found. |
| Delete | No current Attendance deletion path was found. |
| Reopen | No current application transition exists. |

The single-open-session rule is implemented as a read followed by an update,
not by a database uniqueness constraint; concurrent requests are not proven to
be serialized. Completion does not materialize absent records or freeze rules.

Admin list behavior prioritizes an open session, otherwise the earliest
scheduled session (including overdue scheduled rows). Upcoming shows future
scheduled rows and avoids duplicating the next card. Past lists completed and
cancelled rows for the active cycle.

## 7. Attendance Record Lifecycle

The Board record endpoint accepts only `present`, `late`, or `excused`. It
upserts on `(session_id, member_id)`, replacing status and recorder timestamps.
It permits writes while the session is `open` or `completed`; scheduled and
cancelled sessions reject updates.

`absent` exists in the database enum but is not accepted by this endpoint.
Instead, completion leaves unmarked members without physical records, and
`referee_attendance_detail` converts missing records to `absent`. A historical
or externally written explicit `absent` row is also supported by the view.

Session completion changes only session status/audit fields. It does not insert
absences, snapshot the roster, snapshot weights, or invoke an Attendance
function/trigger.

## 8. Attendance Status and Point Semantics

| Status | Physical write from current endpoint | Detail behavior | Weight source |
|---|---:|---|---|
| `present` | Yes | Explicit status | `present_weight` |
| `late` | Yes | Explicit status | `late_weight` |
| `excused` | Yes | Explicit status | `excused_weight` |
| `absent` | No | Explicit DB value or implicit missing record | `absent_weight` |

The schema defaults are a capability/default, not proof of live values:

| Weight | Schema default |
|---|---:|
| Present | 1.0000 |
| Late | 0.5000 |
| Excused | 0.7500 |
| Absent | 0.0000 |

The database view reads the current per-cycle rule row. The Admin page legend
instead displays hard-coded `1.0 / 0.6 / 0.5 / 0.0`; it neither loads the rule
row nor matches the schema defaults for late/excused. The actual live configured
values are **EXTERNAL VERIFICATION REQUIRED**.

## 9. Attendance Rule/Configuration Model

There is exactly one rule row per cycle, with no `effective_from`, version, or
session snapshot. `referee_attendance_detail` inner-joins the rule table:

- if the cycle has no rule row, it produces no detail rows for that cycle;
- changing a weight changes recalculated points for all applicable completed
  sessions in that cycle, including historical ones;
- no current application screen/API for editing scoring rules was found.

The separate `scoring_periods.attendance_weight` controls Attendance's share of
Development Score; it does not replace status point weights.

## 10. Administrative Roster Construction

`getSessionAttendance()`:

1. loads the session and its cycle;
2. converts `scheduled_at` to an `America/Los_Angeles` date;
3. selects cycle members with status active or withdrawn;
4. includes existing members from cycle start by ignoring `effective_from`;
5. includes other runtime enrollment values from `effective_from`;
6. applies `effective_until`;
7. loads names from `public.members` without filtering member status;
8. overlays explicit records and presents missing statuses as absent.

Before completion, missing values are summarized as unmarked. After completion,
the same missing values are summarized as absent.

## 11. Detail vs Roster vs Write Validation

| Rule | DB detail view | Admin roster query | Record write endpoint |
|---|---|---|---|
| `public.members.status = active` | No | No | No |
| Cycle-member status | active or withdrawn | active or withdrawn | Not checked |
| Existing member start | cycle start | cycle start | cycle start |
| New member start | `effective_from` | `effective_from` | `effective_from` |
| `effective_until` | Yes | Yes | Yes |
| Cycle date bounds | Explicit start/end | Uses session's cycle but does not independently recheck bounds | Uses membership dates; does not independently recheck cycle bounds |
| Ranking eligibility | Exposed, ignored | Loaded, ignored | Not loaded |
| `manual_adjustment` | No matching branch: excluded | Treated as new/effective-from at runtime, omitted from TS type | Treated as new/effective-from |
| Invited member with active cycle row | Included | Included | Writable |
| Withdrawn | Historical dates included | Historical dates included | Writable if dates pass |
| Suspended/ineligible | Excluded if synchronized | Excluded | Writable if dates pass |

These are CURRENT differences, not approved reconciliation rules.

## 12. Confirmed Participation Rules

Confirmed business context from the participation module:

- current participation requires active `public.members` and active cycle
  membership at minimum;
- ranking eligibility is independent;
- existing members apply from cycle start;
- new members apply from `effective_from`;
- `effective_until` bounds historical applicability inside cycle dates;
- invited and withdrawn members do not participate currently;
- withdrawn members preserve legitimate historical evidence;
- precise suspension history and `manual_adjustment` remain uncertain.

Attendance's current implementation agrees with some date semantics but does
not enforce the full current-participation rule.

## 13. Representative Regression Cases

| Persona | Confirmed expected Attendance behavior | CURRENT Attendance behavior |
|---|---|---|
| Elena — active existing member | Current roster; applicable sessions from cycle start. | Included from cycle start. |
| Nora — active new member | Included only on/after `effective_from`. | Included on/after `effective_from`. |
| Wendy — withdrawn historical existing member | Not current; preserve completed sessions through effective end. | DB detail/roster preserve dated rows, but the roster can still display her for a historical session and the write endpoint permits corrections. |
| Ivan — invited existing member | No current roster, absence, evidence, or score until active. | Member status is ignored; active cycle membership makes him appear and missing completed records become absences. |
| Iris — active, ranking-ineligible | Full Attendance participation/evidence; no ranking position. | Attendance itself ignores ranking eligibility and includes her; downstream monthly Development may exclude her before applying Attendance. |
| Sam — suspended/ineligible | No current participation; historical result depends on unavailable temporal boundary. | DB detail/roster exclude synchronized `ineligible`; direct record endpoint can still write if dates pass. |
| Synthetic manual adjustment | Requires owner-defined semantics. | DB detail excludes; roster/write treat it as effective-from. |

## 14. Member Portal and Dashboard Reads

`/portal/attendance` requires the authenticated user and calls
`getUserAttendance(user.id)`. The helper uses service-role to query
`referee_attendance` for the active cycle, then its detail rows. No summary row
returns an empty model with numeric zeroes.

The same helper feeds:

- member Dashboard Attendance percentage;
- `/portal/development` Attendance card/radar;
- `/portal/attendance` score and history.

Admin Member Detail independently reads `referee_attendance` through
`getMemberDashboard()`. Admin Attendance ranking reads the same summary view,
restricts cycle-member status to active, and then excludes two hard-coded member
names (`CAFLA Administrator`, `Alfredo Sandoval`) in application code.

## 15. Authorization and Security

### Member reads

Portal member reads derive `user.id` from `requireUser()` and use a server-only
service-role query. Ownership is therefore supplied by application code, not
RLS. Portal layout separately requires an active member profile.

### Board management

Admin pages call `requireBoard()`. Create, open, complete, and update handlers
call `requireBoardApi()` before using service-role. These operations therefore
depend primarily on application authorization.

### Unguarded roster endpoint

`GET /api/attendance/session-list` has no `requireUser()` or Board guard. It
accepts a caller-controlled session ID and calls `getSessionAttendanceList()`,
which uses service-role through `getSessionAttendance()` and returns participant
names/statuses. Its current UI caller is `AttendanceSessionDialog`, but route
location does not restrict external requests. This is a concrete authorization
gap requiring security review; no fix is made here.

### Database security evidence

The repository baseline enables RLS on the three V2 tables and grants their
table access to service-role. No V2 Attendance policies were found in that
baseline. `referee_attendance` is defined with `security_invoker = false`.
Historical public V1 policies/grants do not describe V2 security. Live
post-recovery policy/grant/view security equivalence requires external
verification.

## 16. Date and Timezone Semantics

- Session form input is interpreted as Los Angeles local time and converted to
  UTC by `localLosAngelesDateTimeToUTC()`.
- Creation rejects timestamps not in the future and checks the corresponding
  Los Angeles date against cycle bounds.
- Roster and detail applicability use the Los Angeles calendar date derived from
  `scheduled_at`.
- Stored lifecycle audit fields use current ISO timestamps.

This is implementation behavior, not a newly declared business-time policy.

## 17. Development Score and Ranking Integration

```text
attendance_sessions + attendance_records + attendance_scoring_rules
  + cycles + cycle_members + members
  -> development.referee_attendance_detail
  -> development.referee_attendance
  -> development.referee_monthly_period_metric_scores_v2
  -> development.referee_monthly_development_score_v2
  -> development.referee_monthly_ranking_evidence_v2
  -> development.referee_monthly_ranking_history_v2
  -> development.referee_current_ranking_v2
  -> current/monthly ranking snapshots
```

For each monthly member/period, Attendance score is
`AVG(attendance_points) * 100`. No matching detail rows yields a null Attendance
score in the monthly layer. Development applies Attendance when its scoring-
period weight is greater than zero and the score is non-null, then normalizes
over applicable metric weights.

Ranking evidence counts present + late + excused records, requires five when
Attendance is available, and derives an evidence factor from the population
benchmark. Absence is not evidence. The monthly population currently requires
`eligible_for_ranking = true`, so ranking eligibility incorrectly suppresses
the entire monthly Development/Attendance contribution for Iris-like members
before final ranking eligibility is evaluated.

## 18. CURRENT Application and Database Flows

### Administrative write flow

```text
Board page -> protected API -> service-role
  -> create/open attendance session
  -> upsert explicit present/late/excused records
  -> complete session
  -> implicit absences appear through detail view
```

### Member read flow

```text
Portal layout + requireUser()
  -> getUserAttendance(auth user id)
  -> service-role summary/detail views
  -> Dashboard / Attendance / Development UI
```

## 19. Failure and Edge Cases

- No active cycle: creation fails; Admin list queries return empty/null; member
  summary may be empty depending on derived rows.
- Missing scoring-rule row: detail view silently yields no rows because of its
  inner join.
- No applicable sessions: summary view returns zero percentage for included
  active/withdrawn cycle members, while monthly score may be null.
- Missing explicit record after completion: implicit absence and absent weight.
- Duplicate record submission: upsert updates the unique session/member row.
- Concurrent open requests: application check exists, database guarantee does
  not.
- Concurrent complete requests: conditional update lets one succeed and the
  other receive conflict.
- Completed sessions remain editable; derived metrics recalculate immediately.
- Cancelled state can be rendered but no current application transition was
  identified.

## 20. CURRENT Implementation Inconsistencies

1. Detail, roster, and write endpoint disagree on cycle-member status and
   `manual_adjustment`.
2. None checks `public.members.status`; invited members can accrue absences.
3. The record endpoint can write for an `ineligible` member.
4. UI scoring legend is hard-coded and conflicts with schema defaults/current
   rule-driven calculation.
5. Rule changes are retroactive because no version/effective interval is stored.
6. Single-open enforcement is application-only.
7. Attendance summary uses zero for no sessions; monthly calculation uses null.
8. Admin ranking excludes people by mutable display name.
9. Monthly Development population incorrectly requires ranking eligibility.
10. The roster API is unguarded while reading via service-role.

## 21. Architecture Classification

| Capability/object | Status | Basis |
|---|---|---|
| Development Attendance tables/views | CURRENT | Active Portal/Admin and Development consumers. |
| Attendance roster/population enforcement | TRANSITIONAL | Multiple inconsistent current implementations. |
| Public Attendance V1 tables/views/types | RETIRED | Confirmed project retirement and no current runtime use found. Historical snapshot entries must not be restored. |
| `development.cycle_member_population` consumption | PLANNED | Approved future direction, absent from baseline. |
| Live rule values and live V2 security | UNCERTAIN | Repository/historical evidence cannot prove current Production values. |

The surviving `public.attendance_status` enum in the baseline is a historical V1
artifact. Its live post-retirement existence is uncertain, but it is not a
current application dependency and is not a removal authorization.

## 22. Known Limitations and Technical Debt

- Canonical participation is not implemented.
- No rule versioning or historical point snapshot exists.
- Lifecycle invariants are primarily application-enforced.
- No cancellation/deletion/reopen workflow is implemented.
- TypeScript contracts omit `manual_adjustment` in Attendance paths.
- Service-role is used for all V2 Attendance application access.
- Member-facing no-data states collapse some unknown/unavailable conditions to
  numeric zero.
- No dedicated automated Attendance tests were found in the inspected runtime
  tree.

## 23. PLANNED Architecture

Attendance is expected to consume PLANNED
`development.cycle_member_population` for member status, cycle status,
applicable interval, and current participation. That refactor must preserve
withdrawn historical evidence and keep ranking eligibility independent.

No SQL, view change, endpoint change, or migration is defined by this document.
Scoring-rule versioning, lifecycle constraints, and endpoint remediation are
not automatically approved merely because current limitations are recorded.

## 24. External Verification Requirements

Read-only Production verification is needed for:

- current `attendance_scoring_rules` values;
- existence of one rule for every active/historical cycle;
- live table/view definitions, RLS, grants, and policies;
- live row counts and whether explicit absent records exist;
- any operator path outside the repository for cancellation, rule changes, or
  cycle lifecycle;
- deployment/environment topology.

## 25. Evidence and Traceability

| Area | Evidence |
|---|---|
| Schema, enums, defaults, constraints, indexes, FKs, RLS | `supabase/migrations/20260831185011_remote_schema.sql` |
| Historical catalog/dependencies/data presence | `docs/audit/supabase/02-tables-and-views.md`, `04-columns.md`, `05-constraints.md`, `06-foreign-keys.md`, `07-indexes.md`, `09-triggers.md`, `10-rls-policies.md`, `12-database-dependencies.md`, `17-view-definitions.md`, `18-tablet-row-counts.md` |
| Portal page/read | `src/app/(portal)/portal/attendance/page.tsx`; `src/lib/queries/get-user-attendance.ts` — `getUserAttendance()` |
| Admin pages | `src/app/(admin)/admin/attendance/page.tsx`; `src/app/(admin)/admin/attendance/[session_id]/page.tsx` |
| Create | `src/app/api/admin/attendance/create-session/route.ts`; `src/lib/queries/create-attendance-session.ts` |
| Open/complete | `src/app/api/admin/attendance/[session_id]/open/route.ts`; `src/app/api/admin/attendance/[session_id]/complete/route.ts` |
| Roster and records | `src/lib/queries/get-session-attendance.ts`; `src/app/api/admin/attendance/update-record/route.ts` |
| Publicly addressable roster API | `src/app/api/attendance/session-list/route.ts`; `src/lib/queries/get-session-attendance-list.ts`; `src/components/attendance/AttendanceSessionDialog.tsx` |
| Admin summaries | `get-next-attendance-session.ts`, `get-upcoming-attendance-session.ts`, `get-past-attendance-sessions.ts`, `get-attendance-ranking.ts` |
| Dashboard/Development/Admin Member Detail | `src/app/(portal)/portal/page.tsx`; `src/app/(portal)/portal/development/page.tsx`; `src/lib/queries/get-member-dashboard.ts` |
| Participation rules | `docs/source-of-truth/03a-development-cycles-and-participation.md` |

## 26. Change Impact Checklist

Before changing Attendance, review session lifecycle, roster/write/detail
alignment, implicit absences, historical rule effects, Los Angeles dates,
current and historical participation, service-role authorization, member UI,
Development weighting, Ranking evidence, snapshots, and all cited Source of
Truth modules.
