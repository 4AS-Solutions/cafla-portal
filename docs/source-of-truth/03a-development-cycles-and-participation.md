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
| Current participation | Whether a member belongs to and may participate in the current Development cycle according to cycle-member status and the applicable date interval. `public.members.status` may control account/Portal access but does not redefine cycle membership or historical applicability. |
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

### Confirmed Lifecycle Business Rules

**CONFIRMED BUSINESS RULE:** the intended Development-cycle lifecycle is
`draft -> active -> closed -> archived`.

At most one cycle may be `active` at a time.

An active cycle must not be closed unless a valid subsequent Development cycle
has already been created in `draft` status and is prepared to succeed it. The
successor must represent a chronologically later cycle with coherent dates; the
mere existence of an unrelated or obsolete draft does not satisfy this rule.

Closing or archiving a cycle must never delete, invalidate, reset, or detach
legitimate historical Attendance, Quiz, Report, Evaluation, Development,
Ranking, or snapshot data belonging to that cycle.

`closed` means the cycle no longer accepts new ordinary cycle activity.

`archived` is a historical lifecycle state and must not alter or erase the
cycle's preserved records.

The CURRENT repository does not yet enforce this complete lifecycle contract in
an application workflow. These are **BUSINESS RULES**, not claims about current
runtime enforcement.

## 8. Cycle Membership Lifecycle and Application Writes

### Invitation

`POST /api/admin/members/invite` requires Board authorization, selects the most
recent active cycle, invites through Supabase Auth, and inserts a cycle-member
row when one does not already exist. It permits only `existing_member` or
`new_member`, writes the current Los Angeles date as `effective_from`, sets
`status = active`, `eligible_for_ranking = true`, and leaves
`effective_until = NULL`.

This means an invited profile can have an active/ranking-eligible cycle row
before profile completion. This is both a CURRENT implementation fact and a
valid cycle-membership state under the confirmed business rules.

Account activation is independent from Development-cycle membership. A member
does not need to complete Portal account activation in order to belong to the
cycle.

The member's `enrollment_type` and applicable date interval determine when
Development participation and evidence begin:

- `existing_member`: applicability begins at `development.cycles.start_date`.
- `new_member`: applicability begins at `development.cycle_members.effective_from`.

Portal/account access remains a separate concern from cycle membership and
historical applicability.

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
### Confirmed update semantics

**CONFIRMED BUSINESS RULE:** changing a member to `inactive` ends that member's
current participation in the cycle. The corresponding cycle membership becomes
`withdrawn`, and `effective_until` records the end of the applicable
participation interval.

Changing a member to `inactive` must not delete, invalidate, or exclude
legitimate historical evidence generated before or on the applicable
participation end date.

**CONFIRMED BUSINESS RULE:** `eligible_for_ranking` is an independent
Board-controlled setting. A member's ordinary active participation does not
imply that Ranking eligibility must be true.

**KNOWN IMPLEMENTATION MISMATCH:** the CURRENT Admin update behavior forces
`eligible_for_ranking = true` when the member is changed to `active`. This does
not match the confirmed business rule and must eventually be separated from
ordinary member/cycle activation.

The precise historical semantics of `suspended` remain **UNCERTAIN** in this
phase. No additional suspension interval or restoration behavior is defined
here.

The precise semantics of `manual_adjustment` also remain **UNCERTAIN** and are
left unchanged in this phase.

### Transition to a new cycle

**CONFIRMED BUSINESS RULE:** when a new Development cycle becomes active,
members who continue participating with CAFLA must be enrolled automatically
into that cycle as `existing_member`.

Their applicability in the new cycle begins at the new cycle's `start_date`.

Members who ended participation as inactive/withdrawn are not automatically
re-enrolled into the new cycle.

For each continuing member, the previous cycle's `eligible_for_ranking` setting
is inherited into the new cycle. Ranking eligibility remains a Board-controlled
administrative decision and may subsequently be changed by Board.

Development and Ranking calculation values are not inherited into the new
cycle. Development Score, Ranking Score, position, percentile, and
current-cycle evidence are calculated again from the new cycle's own evidence.

Historical monthly snapshots and other legitimate records from previous cycles
must remain preserved and associated with their original cycles.

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

### Cycle membership and current participation

Development-cycle membership is independent from Portal account activation.

A member may belong to and participate in a Development cycle while
`public.members.status = 'invited'`, provided the cycle-member state and
applicable date interval permit participation.

`development.cycle_members.status` represents the member's participation state
within that specific Development cycle. A cycle member with `status = 'active'`
is a current Development participant within the member's applicable date
interval.

`public.members.status` describes the member/account state and may control
Portal access, but it does not redefine cycle membership or the historical
beginning of Development applicability.

### Historical applicability

The confirmed applicability rules are:

- For `existing_member`, `applicable_from` is
  `development.cycles.start_date`.
- For `new_member`, `applicable_from` is
  `development.cycle_members.effective_from`.
- `applicable_until` is `development.cycle_members.effective_until` when
  present and is always bounded by the cycle end date.
- All applicability is bounded by the Development cycle's own date range.

Account invitation acceptance or profile completion does not create a new
Development applicability boundary and does not redefine the applicable start
date.

An `activated_at` field is not required for these confirmed semantics.

### Invited members

An invited member may already belong to the active Development cycle.

For an invited `existing_member`, legitimate cycle applicability begins at the
cycle start even if Portal account activation or profile completion occurs
later.

For an invited `new_member`, legitimate cycle applicability begins at the
stored `effective_from`.

Portal/account access and Development-cycle participation are separate
concerns.

### Withdrawn and inactive members

When a member becomes `inactive`, current participation in the Development
cycle ends.

The corresponding cycle membership becomes `withdrawn`, and
`effective_until` records the end of the applicable participation interval.

A withdrawn member does not generate new ordinary Development obligations or
evidence after the applicable end date.

All legitimate Attendance, Quiz, Report, Evaluation, Development, Ranking, and
snapshot history generated inside the member's applicable interval must remain
preserved.

A later current-status change must not erase or invalidate legitimate
historical evidence.

### Ranking eligibility

Development participation and Ranking eligibility are independent.

A Development participant with `eligible_for_ranking = false` may still
generate and retain all otherwise applicable:

- Attendance evidence;
- Quiz evidence;
- Report evidence;
- Evaluation evidence; and
- Development Score.

`eligible_for_ranking = false` prevents Ranking qualification and Ranking
position only. It must not exclude the member from Development or from the
underlying Development metrics.

Ranking eligibility is a Board-controlled administrative setting. Ordinary
active participation does not imply `eligible_for_ranking = true`.

### Cycle lifecycle

The intended Development-cycle lifecycle is:

`draft -> active -> closed -> archived`

At most one Development cycle may be `active` at a time.

An active cycle must not be closed unless a valid chronologically subsequent
Development cycle has already been created in `draft` status and is prepared
to succeed it.

Closing or archiving a cycle must never delete, invalidate, reset, or detach
legitimate historical Attendance, Quiz, Report, Evaluation, Development,
Ranking, or snapshot data belonging to that cycle.

A `closed` cycle no longer accepts new ordinary cycle activity.

An `archived` cycle remains historical and must preserve its records.

### Transition to a new cycle

When a new Development cycle becomes active, members who continue participating
with CAFLA must be enrolled automatically into the new cycle as
`existing_member`.

Their applicability in the new cycle begins at the new cycle's `start_date`.

Members who ended participation as inactive/withdrawn are not automatically
re-enrolled into the new cycle.

Each continuing member inherits the previous cycle's
`eligible_for_ranking` setting. Ranking eligibility remains Board-controlled
and may subsequently be changed by Board.

### Development and Ranking reset between cycles

Each Development cycle starts a new Development and Ranking calculation.

The following calculation values are not carried forward from the preceding
cycle:

- Development Score;
- Ranking Score;
- Ranking position;
- percentile; and
- current-cycle evidence quantities.

The new cycle builds these values from evidence belonging to that new cycle.

Historical monthly snapshots from prior cycles must remain preserved and
associated with their original cycle. Starting a new cycle must not delete,
overwrite, or repurpose prior-cycle snapshots.

Current-cycle Ranking and historical Ranking are therefore separate concepts:
the current calculation restarts with each cycle, while historical snapshots
preserve prior-cycle performance.

### Suspended members

Precise historical participation semantics for `suspended` members remain
**UNCERTAIN**.

The CURRENT data model does not establish a reliable suspension interval, and
CAFLA does not require a more complex suspension-history model as part of this
phase.

No additional suspension semantics are introduced here.

### Manual adjustment

The precise applicability semantics of `manual_adjustment` remain
**UNCERTAIN**.

The existing behavior is left unchanged in this phase. No new
`manual_adjustment` business semantics are introduced here.

## 13. Representative Regression Cases

These names are test personas, not Production identities.

| Persona | Confirmed expected behavior | Current implementation difference |
|---|---|---|
| Elena — active existing member | Participates in the cycle; applicability begins at cycle start; may receive a Development Score and may rank when `eligible_for_ranking = true`. | Most paths include her, but Reports, Evaluations, and monthly Development currently use stored `effective_from` instead of consistently deriving cycle start for `existing_member`. |
| Nora — active new member | Participates beginning at her later `effective_from`; no Development obligations or evidence before that applicable start. | Most date-aware paths align, but Quiz scoring does not independently enforce the complete effective interval. |
| Wendy — withdrawn historical existing member | Does not generate new ordinary obligations/evidence after `effective_until`; all legitimate history through that date remains preserved. Historical Ranking/snapshots from applicable periods also remain preserved. | Some CURRENT consumers preserve bounded history, while Reports can exclude withdrawn members and upstream Ranking-eligibility behavior can remove legitimate Development history. |
| Ivan — invited existing member | Belongs to the cycle even while the Portal account remains invited. Applicability begins at cycle start. He may generate otherwise-applicable Development obligations/evidence; Ranking depends independently on `eligible_for_ranking`. | Several CURRENT database consumers already include him because they ignore `public.members.status`. This inclusion is not itself an error under the confirmed participation rule; however, individual consumers still apply inconsistent enrollment, date, status, and Ranking-eligibility predicates. Portal access remains a separate account concern. |
| Iris — active, ranking-ineligible | Fully participates in Attendance, Quiz, Reports, Evaluations, and Development. She receives applicable Development scores/evidence but no Ranking qualification or position while `eligible_for_ranking = false`. | CURRENT monthly Development requires `eligible_for_ranking = true`, so legitimate Development evidence can disappear before Ranking is evaluated. |
| Sam — suspended / cycle ineligible | Precise current and historical behavior remains UNCERTAIN until CAFLA defines suspension semantics. Existing legitimate historical data must not be deleted merely because current status changes. | CURRENT synchronized `ineligible` status excludes Sam from several calculations, but no reliable suspension interval exists to determine complete historical applicability. |
| Synthetic manual adjustment | No additional business semantics are defined in this phase; behavior remains UNCERTAIN. | CURRENT consumers interpret `manual_adjustment` inconsistently, including exclusion in some Attendance SQL and effective-from treatment in other paths. |

### Cross-cycle regression case

Assume Elena continues participating with CAFLA when one Development cycle ends
and the next cycle becomes active.

Elena must be enrolled automatically into the new cycle as `existing_member`,
with applicability beginning at the new cycle's `start_date`.

Her previous cycle's `eligible_for_ranking` value is inherited into the new
cycle unless Board explicitly changes it.

Development Score, Ranking Score, Ranking position, percentile, and
current-cycle evidence are not carried forward. They are calculated again from
the new cycle's own evidence.

All legitimate prior-cycle records and monthly snapshots remain preserved and
associated with the preceding cycle.

A member who ended the preceding cycle as inactive/withdrawn is not
automatically enrolled into the new cycle.

### Cycle-close regression case

An active Development cycle must not be closed unless a valid,
chronologically subsequent cycle already exists in `draft` status and is
prepared to succeed it.

Closing or later archiving the prior cycle must not delete, invalidate, reset,
or detach its historical Attendance, Quiz, Report, Evaluation, Development,
Ranking, or snapshot data.

The successor cycle begins its own Development and Ranking calculations while
the preceding cycle remains available as historical data.

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

1. No shared calculation/population source consistently applies the confirmed
   cycle-participation contract across all Development consumers. The canonical
   rules must account for cycle-member status, enrollment type, derived
   `applicable_from`, derived `applicable_until`, and the cycle's own date
   boundaries.
2. Some CURRENT implementation and documentation assumptions conflate
   `public.members.status` with Development-cycle participation. Under the
   confirmed business rules, an invited member may legitimately belong to and
   participate in a Development cycle. Portal/account access and
   Development-cycle applicability are separate concerns.
3. `eligible_for_ranking` is incorrectly used as an upstream Development
   population filter by CURRENT Reports, Evaluations, and monthly Development
   calculations. Under the confirmed business rules, Ranking eligibility must
   not determine whether otherwise-applicable Attendance, Quiz, Report,
   Evaluation, or Development evidence exists. It must affect Ranking only.
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
10. The CURRENT cycle lifecycle does not enforce the confirmed requirement that
a valid chronologically subsequent `draft` cycle exist before the active
cycle may be closed.
11. No CURRENT automated cycle-transition workflow enrolls continuing CAFLA
    members into the successor cycle as `existing_member` while inheriting
    their prior `eligible_for_ranking` setting. This behavior is a confirmed
    business rule but is not yet implemented.
12. CURRENT Development and Ranking architecture is cycle-scoped, but the
    complete member-facing contract for browsing preserved historical snapshots
    across closed or archived cycles is not yet established. Historical
    snapshots must remain preserved even though each new cycle begins new
    Development and Ranking calculations.

## 16. PLANNED Canonical Population

`development.cycle_member_population` is an approved **PLANNED** relation whose
purpose is to centralize Development-cycle participation and historical
applicability without duplicating domain scoring.

The planned population must expose or derive, at minimum:

- public member/account status as contextual identity and access information;
- cycle-member status as the Development-cycle participation state;
- enrollment type;
- derived `applicable_from`;
- derived `applicable_until`;
- `currently_participating`;
- `eligible_for_ranking` as an independent Board-controlled attribute.

The canonical population must preserve the confirmed separation between account
state, Development participation, and Ranking eligibility.

`public.members.status = 'active'` must not be required merely to establish
Development-cycle membership or historical applicability. An invited member may
already belong to the cycle.

For `existing_member`, the canonical `applicable_from` is the Development
cycle's `start_date`.

For `new_member`, the canonical `applicable_from` is
`development.cycle_members.effective_from`.

A present `effective_until` establishes the end of historical applicability,
always bounded by the Development cycle's own date range.

`eligible_for_ranking` must remain available to Ranking as an independent
attribute. It must not be used by the canonical population to remove otherwise
legitimate Attendance, Quiz, Report, Evaluation, or Development evidence.

Expected future consumers are Attendance, Reports, Evaluations, Quiz,
Development Score, Ranking calculations, and snapshot synchronization.

Future cycle-transition architecture must also support:

- automatic enrollment of continuing CAFLA members into the successor cycle as
  `existing_member`;
- applicability from the successor cycle's `start_date`;
- inheritance of the preceding cycle's `eligible_for_ranking` setting;
- exclusion from automatic re-enrollment for members who ended participation as
  inactive/withdrawn;
- preservation of all legitimate prior-cycle historical data and snapshots;
- a new Development and Ranking calculation for the successor cycle without
  carrying forward prior Development Score, Ranking Score, position,
  percentile, or current-cycle evidence.

The exact SQL definition, security mode, additional columns, migration order,
cycle-transition procedure, and consumer migration sequence belong to a
separately authorized implementation task.

This section defines PLANNED architecture only. No
`development.cycle_member_population` relation or automatic cycle-transition
workflow is claimed to exist in CURRENT runtime.

## 17. Known Limitations and Technical Debt

- Population rules are duplicated and contradictory across Attendance, Quiz,
  Reports, Evaluations, Development, and Ranking.

- No CURRENT canonical population relation consistently applies cycle-member
  status, enrollment type, historical applicability, withdrawal boundaries,
  and independent Ranking eligibility.

- Some CURRENT implementation assumptions conflate member/account status with
  Development-cycle participation even though these are separate business
  concepts.

- Ranking eligibility is used too early by some CURRENT Development consumers,
  causing otherwise legitimate Development evidence to be excluded before
  Ranking.

- Member/cycle updates are not transactional.

- Member profile edits unnecessarily require an active Development cycle in the
  current Admin endpoint.

- Changing a member to `active` currently forces
  `eligible_for_ranking = true`, even though Ranking eligibility is an
  independent Board-controlled decision.

- Cycle lifecycle management is not established by current application code.

- The CURRENT lifecycle does not enforce the confirmed requirement that a valid
  chronologically subsequent `draft` cycle exist before the active cycle may be
  closed.

- No CURRENT automated cycle-transition workflow enrolls continuing CAFLA
  members into the successor cycle as `existing_member` while inheriting their
  previous `eligible_for_ranking` setting.

- The complete member-facing workflow for browsing preserved historical
  Development and Ranking snapshots across closed or archived cycles is not yet
  established.

- `manual_adjustment` lacks approved semantics and consistent typing.

- Suspension lacks a confirmed historical temporal boundary.

- Several date comparisons cast timestamps directly to dates instead of
  consistently deriving the Los Angeles calendar date.

- Upsert-only current Ranking snapshot refresh can preserve stale population
  rows after a member leaves the calculated current population.

- Generated Supabase TypeScript types are not authoritative.

## 18. External Verification Requirements

Before claiming live Production equivalence, verify read-only:

- live definitions of `development.cycles`,
  `development.cycle_members`, dependent views, and Ranking
  refresh/capture functions;
- live RLS policies and grants for these tables, views, and functions;
- live cron definitions for current and monthly Ranking snapshot functions;
- the actual Production operator/workflow currently used to create, activate,
  close, or archive Development cycles;
- whether any external/manual process currently enrolls members into a successor
  Development cycle;
- whether any external/manual process currently carries
  `eligible_for_ranking` between cycles;
- deployed Git revision and Supabase project/branch topology.

These checks verify CURRENT Production behavior only. They do not override the
CONFIRMED BUSINESS RULES in this document and do not imply that the PLANNED
canonical population or automatic cycle-transition workflow already exists.

These checks do not block completion of this Source of Truth document.

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
