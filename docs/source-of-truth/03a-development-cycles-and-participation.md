# Development Cycles and Participation

## 1. Purpose and Scope

This module is the authoritative description of Development cycles, cycle
membership, enrollment, current participation, historical applicability, and
ranking eligibility. It documents the repository AS-IS before stating confirmed
CAFLA business rules and the separately approved PLANNED population design.

Attendance, Quiz, Reports, Evaluations, Development Score, and Ranking own their
domain calculations. This module owns the shared population boundary they are
expected to consume; it does not redefine their formulas.

## 2. Status

- `development.cycles`: **CURRENT**.
- `development.cycle_members`: **CURRENT**.
- Shared participant semantics in current consumers: **TRANSITIONAL** because
  the operational consumers implement different filters.
- `development.cycle_member_population`: **PLANNED**, not present in the
  repository baseline.
- `manual_adjustment` semantics and precise suspension history: **UNCERTAIN**.

## 3. Repository and Database Baseline

- Repository: `develop@5b47f15d8580687e66b0f9b6eeaccbe3bf3e19f4`.
- Baseline date: 2026-08-31.
- Database artifact:
  `supabase/migrations/20260831185011_remote_schema.sql`.
- Supporting evidence: `docs/audit/supabase/`, a point-in-time historical
  snapshot rather than guaranteed live post-recovery state.
- Exact Production deployment revision and live database equivalence are
  **UNCERTAIN / EXTERNAL VERIFICATION REQUIRED**.

Untracked Development seed fixtures are outside this Production architecture
baseline and are not evidence of Production data or behavior.

## 4. Three Required Interpretation Layers

### A. CURRENT IMPLEMENTATION

Current code and database artifacts select cycle participants independently.
No canonical relation supplies all consumers with the same status, enrollment,
date, and ranking-eligibility interpretation.

### B. CONFIRMED BUSINESS RULE

CAFLA has confirmed the intended current-participation and historical-
applicability rules in section 12. These rules describe intent even where the
current implementation differs.

### C. PLANNED ARCHITECTURE

The approved `development.cycle_member_population` design centralizes those
rules. It is not implemented and must not be queried or described as CURRENT.

## 5. Domain Concepts

| Concept | Meaning |
|---|---|
| Development cycle | Bounded period that groups member participation, activities, scoring periods, and ranking snapshots. |
| Cycle membership | One member's enrollment and effective interval in one cycle. |
| Current participation | Whether a member may participate now; at minimum both member and cycle-member statuses must be active. |
| Historical applicability | Which dated activities belong to a member despite later status changes. |
| Ranking eligibility | Independent permission to receive ranking treatment; it is not permission to generate Development evidence. |
| Enrollment type | Context used to derive the beginning of historical applicability. |

## 6. Data Model

### `development.cycles`

Significant columns are `id`, `name`, `start_date`, `end_date`, `status`,
`description`, creator/closer references, timestamps, and `closed_at`.
`development.cycle_status` contains `draft`, `active`, `closed`, and `archived`.

The baseline enforces:

- primary key on `id`;
- unique `name`;
- `end_date >= start_date`;
- an index on `(status, start_date, end_date)`;
- a partial unique index allowing at most one row with `status = 'active'`.

### `development.cycle_members`

Significant columns are `id`, `cycle_id`, `member_id`, `effective_from`,
`effective_until`, `enrollment_type`, `status`, `eligible_for_ranking`, notes,
creator, and timestamps.

The baseline enforces:

- one row per `(cycle_id, member_id)`;
- `effective_until IS NULL OR effective_until >= effective_from`;
- foreign keys to `development.cycles` and `public.members`;
- indexes on `(cycle_id, status)` and `(member_id, cycle_id)`.

Snapshot tables also reference the cycle, cycle-member, and member identities.
RLS is enabled on both base tables in the baseline and historical audit, while
application writes use server-side privileged clients. Live policies and grants
require external verification.

## 7. Cycle Lifecycle

The enum defines `draft -> active -> closed -> archived` as available states,
but the repository does not establish an approved transition state machine or a
current application handler that creates or transitions cycles. Runtime callers
usually resolve the single active cycle; some additionally require the current
date to fall within its bounds.

Examples:

- member invitation/update and Attendance/Quiz queries select `status = active`;
- `development.refresh_active_cycle_ranking_snapshot()` requires active status
  and `current_date` inside the cycle;
- `development.capture_previous_month_ranking_snapshot()` selects an active
  cycle whose dates overlap the previous month.

How Production operators create, activate, close, or archive cycles is
**UNCERTAIN / EXTERNAL VERIFICATION REQUIRED**.

## 8. Cycle Membership Lifecycle and Application Writes

### Invitation

`POST /api/admin/members/invite` requires Board authorization, selects the most
recent active cycle, invites through Supabase Auth, and inserts a cycle-member
row when one does not already exist. It permits only `existing_member` or
`new_member`, writes the current Los Angeles date as `effective_from`, sets
`status = active`, `eligible_for_ranking = true`, and leaves
`effective_until = NULL`.

This means an invited profile can have an active/ranking-eligible cycle row
before profile completion. That is a CURRENT implementation fact, not the rule
for current participation.

### Admin member update

`POST /api/admin/members/update` requires an active cycle and an existing cycle
row for non-invited members. Its current mapping is:

| `public.members.status` requested | Cycle-member status | Ranking flag | Effective end |
|---|---|---:|---|
| `active` | `active` | true | cleared |
| `inactive` | `withdrawn` | false | current Los Angeles date |
| `suspended` | `ineligible` | false | cleared/open |
| `invited` | no synchronization | unchanged | unchanged |

The cycle row is updated before `public.members`; the operations are not one
transaction. No general application path creates `manual_adjustment`.

## 9. Enrollment Types

`development.enrollment_type` contains:

- `existing_member`;
- `new_member`;
- `manual_adjustment`.

The invite UI/API writes only the first two. Repository-wide runtime search
found no application writer for `manual_adjustment`. Existing consumers do not
agree on its meaning:

- `referee_attendance_detail` has explicit branches only for existing/new, so a
  manual-adjustment row produces no Attendance detail;
- session Attendance code treats every non-`existing_member` value as the
  effective-from case, although its TypeScript type omits `manual_adjustment`;
- Reports, Evaluations, Quiz attempt start, and monthly Development use
  `effective_from` without a distinct manual-adjustment branch;
- Quiz scoring ignores enrollment type and effective dates after establishing
  its member/assessment grid.

There is no sufficient evidence for an intended historical start boundary.
`manual_adjustment` therefore remains **UNCERTAIN**.

## 10. Current Implementation Consumer Matrix

Status abbreviations below refer to current behavior, not approved intent:
`m.status` is `public.members.status`; `cm.status` is cycle-member status.

| Consumer | Current source/path | Population and date behavior | Ranking flag | Status/enrollment consequences and inconsistency |
|---|---|---|---|---|
| Attendance derived detail | `development.referee_attendance_detail` | `cm.status IN (active, withdrawn)`; existing starts at cycle start, new at `effective_from`; applies effective end and cycle bounds | Ignored | Does not inspect `m.status`; invited active-cycle rows accrue default absences; suspended is excluded only if synchronized to `ineligible`; manual adjustment is omitted. |
| Attendance session roster | `getSessionAttendance()` | Loads active/withdrawn; existing starts at cycle start, every other runtime value at `effective_from`; applies effective end | Read but not used | Does not inspect `m.status`; manual adjustment is treated as new despite its local TS type excluding that enum value. |
| Attendance record update | `POST /api/admin/attendance/update-record` | Checks dates; existing gets cycle-start behavior, other values get effective-from behavior | Ignored | Does not require `cm.status` or `m.status`; a direct request can pass date checks for an otherwise ineligible row. |
| Reports | `development.referee_report_detail` -> `referee_report_score` | Requires `cm.status = active`; uses `effective_from` for every enrollment type plus effective end/cycle bounds | **Required true** | Ignores `m.status`; invited may accrue obligations; withdrawn history is excluded; existing members do not receive cycle-start semantics; ineligible Development participants are wrongly excluded. |
| Evaluations | `development.referee_evaluation_detail` -> `referee_evaluation_score` | Requires active/withdrawn and dates every enrollment from `effective_from`; match crew belongs to active cycle | **Required true** | Ignores `m.status`; invited may receive/generate obligations; existing cycle-start semantics are absent; ineligible Development participants are excluded. |
| Quiz availability list | `getQuizzes()` | Requires a cycle row but does not filter its status; normally hides assessments opened before `effective_from`; archived/no-open-date branches differ | Ignored | Ignores `m.status`, effective end, enrollment type, and current participation; invited/ineligible/withdrawn members can receive list results. |
| Quiz attempt start | `POST /api/quizzes/[assessment_id]/start` -> `development.start_quiz_attempt()` | Accepts active/withdrawn; compares effective dates to assessment/access-grant opening; all enrollment types use `effective_from` | Ignored | Uses authenticated UUID but not `m.status`; withdrawn or invited active-cycle rows may start; existing cycle-start semantics are absent. |
| Quiz scoring | `quiz_member_best_results` -> `referee_quiz_score` | Member grid accepts active/withdrawn; does not apply member effective dates or enrollment type | Ignored | Ignores `m.status`; preserves withdrawn grid but may score invited rows and does not enforce historical applicability. |
| Development Score | `referee_monthly_period_metric_scores_v2` -> `referee_monthly_development_score_v2` | Base population accepts active/withdrawn and uses `effective_from` for all enrollment types, bounded by member/cycle/month/period end | **Required true** | Ignores `m.status`; invited can enter; existing cycle-start semantics are absent; ranking-ineligible legitimate participants are excluded from Development aggregation. |
| Ranking evidence/history | `referee_monthly_ranking_evidence_v2` -> `referee_monthly_ranking_history_v2` | Inherits monthly Development population | Used for final eligibility | Ranking eligibility belongs here, but upstream use has already removed legitimate non-ranking Development participants. |
| Current calculation | `referee_current_ranking_v2` | Selects latest snapshot date from monthly ranking history | Inherited | Inherits every upstream population inconsistency. |
| Current serving snapshot | `refresh_current_ranking_snapshot()` -> `current_ranking_snapshot` | Upserts calculation rows by cycle/member | Inherited | Does not remove rows absent from a later calculation; invited/suspended/stale rows can persist after eligibility changes. |
| Admin Member Detail | `getMemberDashboard()` | Loads active cycle, then snapshot plus Attendance/Quiz/Evaluation/Report score rows for the member | Indirect | It does not establish population itself; it exposes the independently filtered downstream results. |

### Explicit status and enrollment comparison

In this table, “invited” means `m.status = invited` with an otherwise accepted
cycle row; “suspended” assumes the Admin update synchronized the cycle row to
`ineligible`. “Effective” means the consumer uses `cm.effective_from`, while
“cycle start” means the confirmed existing-member derivation is implemented.

| Consumer | Active | Invited | Withdrawn | Suspended/ineligible | Existing | New | Manual adjustment |
|---|---|---|---|---|---|---|---|
| Attendance derived detail | Included | Included | Historical rows included | Excluded | Cycle start | Effective | Excluded by missing branch |
| Attendance session roster | Included | Included | Historical roster included | Excluded by query | Cycle start | Effective | Effective at runtime; omitted from local type |
| Attendance record update | Included | Included | Can pass | Can pass | Cycle start | Effective | Effective |
| Reports | Included only if ranking flag true | Included if cycle row active/eligible | Excluded | Excluded | Effective, not cycle start | Effective | Effective |
| Evaluations | Included only if ranking flag true | Included if cycle row active/eligible | Included if ranking flag true | Excluded | Effective, not cycle start | Effective | Effective |
| Quiz availability | Included | Included | Included | Included | Effective/open-date test | Effective/open-date test | Effective/open-date test |
| Quiz attempt start | Included | Included if cycle row active | Included | Excluded | Effective, not cycle start | Effective | Effective |
| Quiz scoring | Included | Included if cycle row active | Included | Excluded | No effective-date distinction | No effective-date distinction | No effective-date distinction |
| Development Score | Included only if ranking flag true | Included if cycle row active/eligible | Included only if ranking flag true | Excluded | Effective, not cycle start | Effective | Effective |
| Ranking calculation/history | Inherits Development, then applies ranking tests | Can inherit incorrect inclusion | Can inherit when still eligible | Excluded upstream | Inherited | Inherited | Inherited |
| Current serving snapshot | Inherits current calculation | May retain an included row | May retain a prior row | May retain a prior row | Inherited | Inherited | Inherited |
| Admin Member Detail | Displays available downstream rows | Displays any rows produced upstream | Displays retained upstream history | Can display stale snapshot data | Inherited | Inherited | Inherited |

## 11. Cross-Module Dependency Map

```text
Supabase Auth
  -> public.members
       -> development.cycle_members -> development.cycles
            -> Attendance detail/score
            -> Quiz availability/start/best-result/score
            -> Report detail/score
            -> Evaluation obligations/score
            -> monthly metric periods
                 -> Development Score
                 -> Ranking evidence/history/current calculation
                 -> current/monthly snapshot serving tables
            -> Admin Member Detail (through the serving/metric sources)
```

The arrows show consumption. They do not imply that all consumers implement the
same participant rules.

## 12. Confirmed Business Rules

### Current participation

A member may currently participate only when, at minimum:

```text
public.members.status = active
AND development.cycle_members.status = active
```

`eligible_for_ranking` is independent. False ranking eligibility does not
prevent legitimate Development participation or evidence.

### Historical applicability

- `existing_member`: `applicable_from = development.cycles.start_date`.
- `new_member`: `applicable_from = development.cycle_members.effective_from`.
- `applicable_until`: `cycle_members.effective_until` when present, bounded by
  the cycle end; applicability is also bounded by the cycle start.

### Invited

While `public.members.status = invited`, the member does not currently
participate. If an invited `existing_member` later becomes active, legitimate
historical applicability may extend to cycle start. Do not introduce
`activated_at` and do not rewrite `effective_from` during activation.

### Withdrawn

A withdrawn member does not currently participate. Legitimate evidence inside
the applicable historical interval must remain available.

### Ranking

Development participation/evidence and ranking eligibility are different. A
participant with `eligible_for_ranking = false` may still have Development
scores and evidence but must not receive ranking eligibility or position.

## 13. Representative Regression Cases

These names are test personas, not Production identities.

| Persona | Confirmed expected behavior | Current implementation difference |
|---|---|---|
| Elena — active existing member | Participates now; history begins at cycle start; may rank when eligible. | Most paths include her, but Reports/Evaluations/monthly Development use stored `effective_from` rather than deriving cycle start. |
| Nora — active new member | Participates from her later `effective_from`; no earlier evidence. | Most date-aware paths align; Quiz scoring grid does not independently enforce the effective interval. |
| Wendy — withdrawn historical existing member | No current participation; preserve evidence through `effective_until`; ranking eligibility remains a separate question. | Attendance/Quiz/Evaluations can retain some history; Reports excludes withdrawn; monthly Development also excludes her when the update route sets ranking eligibility false. |
| Ivan — invited existing member | No current obligations/evidence/ranking; if activated, applicable history may begin at cycle start. | Database consumers ignore `m.status`; an active cycle row can generate Attendance, Quiz, Report, Evaluation, Development, and Ranking-derived data despite Portal access being blocked. |
| Iris — active, ranking-ineligible | Participates and keeps Development evidence; no ranking position. | Attendance/Quiz base data can exist, but Reports, Evaluations, and monthly Development require the ranking flag and remove her too early. |
| Sam — suspended/ineligible | No current participation; preserve only history supported by an approved temporal boundary. | Status synchronization makes the cycle row ineligible, but the model cannot derive the precise suspension start; existing snapshot rows may remain stale. |

## 14. Suspended Limitation

Current Admin member update maps `suspended` to cycle-member `ineligible`, false
ranking eligibility, and an open/null effective end. Most calculation views
exclude `ineligible`, while Quiz availability does not check cycle-member status
and the Attendance write endpoint does not enforce it.

Neither `public.members` nor `development.cycle_members` records a confirmed
suspension-start interval. A present `suspended` value cannot establish which
past dates were suspended. Precise historical applicability is therefore
**UNCERTAIN**; no `suspension_started_at` or equivalent is invented here.

## 15. CURRENT Implementation Inconsistencies

1. No shared calculation/population source combines active member status with
   active cycle-member status as one canonical current-participation check;
   Portal layout gating does not protect database calculations or every API.
2. Multiple DB calculations ignore `public.members.status`, so an invited member
   with an active cycle row can accumulate derived obligations/evidence.
3. Ranking eligibility is incorrectly used upstream by Reports, Evaluations,
   and monthly Development, excluding legitimate non-ranking participants.
4. Existing-member cycle-start semantics are present in Attendance but absent
   from Reports, Evaluations, Quiz start, and monthly Development.
5. Withdrawn historical preservation differs by module; Reports drops it.
6. `manual_adjustment` is excluded, treated as new, or treated generically from
   `effective_from`, depending on the consumer.
7. Quiz availability, attempt start, and scoring use three different membership
   boundaries.
8. Attendance roster and write authorization apply different status checks.
9. Current snapshot refresh upserts but does not reconcile removed population
   rows.

## 16. PLANNED Canonical Population

`development.cycle_member_population` is an approved **PLANNED** relation whose
purpose is to centralize, without duplicating domain scoring:

- public member status;
- cycle-member status;
- enrollment type;
- derived `applicable_from`;
- derived `applicable_until`;
- `currently_participating`;
- `eligible_for_ranking` as an independent attribute.

Expected future consumers are Attendance, Reports, Evaluations, Quiz,
Development Score, Ranking calculations, and snapshot synchronization. Exact
SQL, security mode, columns beyond the approved concepts, and migration order
belong to a separately authorized implementation task.

## 17. Known Limitations and Technical Debt

- Population rules are duplicated and contradictory.
- Member/cycle updates are not transactional.
- Member profile edits unnecessarily require an active cycle in the current
  endpoint.
- Cycle lifecycle management is not established by current application code.
- `manual_adjustment` lacks approved semantics and consistent typing.
- Suspension lacks a historical temporal boundary.
- Several date comparisons cast timestamps directly to dates instead of
  consistently deriving the Los Angeles calendar date.
- Upsert-only current snapshot refresh can preserve stale population rows.
- Generated Supabase TypeScript types are not authoritative.

## 18. External Verification Requirements

Before claiming live Production equivalence, verify read-only:

- live definitions of cycles, cycle members, dependent views, and ranking
  refresh/capture functions;
- live RLS policies and grants for these tables/views/functions;
- live cron definitions for current/monthly snapshot functions;
- actual cycle lifecycle operator/workflow;
- deployed Git revision and Supabase project/branch topology.

These checks do not block completion of this AS-IS repository document.

## 19. Evidence and Traceability

| Area | Evidence |
|---|---|
| Tables, enums, constraints, indexes, FKs, RLS | `supabase/migrations/20260831185011_remote_schema.sql`; `docs/audit/supabase/04-columns.md`, `05-constraints.md`, `06-foreign-keys.md`, `07-indexes.md`, `10-rls-policies.md`, `15-enums-and-custom-types.md` |
| Database consumers | Repository baseline definitions for `referee_attendance_detail`, `referee_report_detail`, `referee_evaluation_detail`, `quiz_member_best_results`, `referee_monthly_period_metric_scores_v2`, Development/Ranking views, and snapshot functions |
| Invitation enrollment | `src/app/api/admin/members/invite/route.ts` — `POST` |
| Member/cycle synchronization | `src/app/api/admin/members/update/route.ts` — `POST` |
| Attendance roster/write | `src/lib/queries/get-session-attendance.ts` — `getSessionAttendance()`; `src/app/api/admin/attendance/update-record/route.ts` — `POST` |
| Quiz availability/start | `src/lib/queries/get-quizzes.ts` — `getQuizzes()`; `src/app/api/quizzes/[assessment_id]/start/route.ts` — `POST`; `development.start_quiz_attempt()` |
| Member metric reads | `get-user-attendance.ts`, `get-user-report-detail.ts`, `get-user-report-score.ts`, `get-user-evaluation-obligations.ts`, `get-user-evaluation-score.ts`, `get-user-quiz-score.ts` |
| Development/Ranking serving | `src/lib/queries/get-development-ranking-v2.ts`; `src/lib/queries/admin-ranking.ts` |
| Admin Member Detail | `src/lib/queries/get-member-dashboard.ts` — `getMemberDashboard()` |
| Historical supporting evidence | `docs/audit/supabase/08-fuctions-rpcs.md`, `12-database-dependencies.md`, `17-view-definitions.md`, `18-tablet-row-counts.md` |

## 20. Change Impact Checklist

Before changing this boundary, review member onboarding/status synchronization,
all consumer filters above, Los Angeles date conversion, historical evidence,
ranking eligibility, RLS/service-role usage, snapshots and cron, regression
personas, and updates to this document plus each affected module document.
