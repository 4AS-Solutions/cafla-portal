# Development V2 / Development Score

## 1. Purpose and Scope

Development V2 aggregates Attendance, Quiz, Reports, and Evaluations into a
monthly performance score. This document defines the CURRENT calculation and
its application consumers at `develop@f236021`. Ranking evidence, ranking
score, placement, levels, and snapshot lifecycle are only described at the
handoff boundary; their complete contract belongs in `10-ranking.md`.

The central calculation is live and derived. The member UI ordinarily serves
its current/history values from Ranking snapshot tables rather than querying
the heavy calculation views directly.

## 2. Status and Ownership Layers

| Layer | Canonical objects | Status |
|---|---|---|
| Raw evidence | Attendance records/sessions, Quiz attempts, Match Reports, Evaluations and Matches | CURRENT; owned by source modules |
| Metric detail/aggregate | `referee_attendance_detail`, `referee_report_detail`, `quiz_member_best_results`, `referee_evaluation_detail`, and module score views | CURRENT with TRANSITIONAL population |
| Monthly metric boundary | `development.referee_monthly_period_metric_scores_v2` | CURRENT |
| Development Score | `development.referee_monthly_development_score_v2` | CURRENT with TRANSITIONAL population |
| Ranking interpretation | `referee_monthly_ranking_evidence_v2` and downstream Ranking views | CURRENT; Ranking-owned boundary |
| Frontend serving | `current_ranking_snapshot`, `monthly_ranking_snapshots` | CURRENT Ranking serving layer |
| Canonical population | `development.cycle_member_population` | PLANNED, not CURRENT |

Development owns the normalized metric combination and
`monthly_development_score`. It does not own raw source evidence, Ranking's
evidence factor/eligibility/position, or snapshot persistence.

## 3. Scoring-Period Model

The actual table is `development.scoring_periods`; no
`development.development_scoring_periods` object was found.

| Field | Contract |
|---|---|
| `id`, `name` | Period identity; trimmed name must be nonblank. |
| `effective_from`, `effective_until` | Inclusive global date range; end may be null. |
| Four metric weights | Integers 0–100 whose total must equal 100. |
| `notes`, `created_by`, `created_at` | Configuration metadata/audit. |

The table has **no `cycle_id` or status field**. Periods are global and join
any overlapping cycle/member/month. A trigger rejects overlapping period date
ranges globally, so a date belongs to at most one period. Gaps are allowed.
A calendar month may intersect multiple consecutive periods and therefore
produce multiple period rows before monthly aggregation.

For a period whose `effective_from <= current_date`, a trigger prevents changes
to `effective_from` and all weights. It does not prevent updates to
`effective_until`, name, notes, or deletion. No current Admin UI/API for scoring
periods was found; operational configuration appears to be direct privileged
database work. Untracked seed values are Development/test fixtures, not
Production rules.

## 4. Month/Period Population and Grain

`referee_monthly_period_metric_scores_v2` begins with:

```text
cycle_members
× cycle_months_v2
× every scoring_period intersecting the cycle/member/month
```

Its grain is:

```text
cycle_id + cycle_member_id + member_id + month_start + scoring_period_id
```

The schema does not declare a key because it is a view. `period_activity_from`
is the greatest of period start, stored member effective start, and cycle
start. `period_cutoff` is the least of period end, month end, stored member
effective end, cycle end, and current Los Angeles date. Future months and empty
intersections are excluded.

The starting population requires cycle-member status active/withdrawn and
`eligible_for_ranking = true`; it joins `public.members` only for the name and
does not inspect `public.members.status`.

## 5. Normalized Four-Metric Contract

| Metric | Raw/detail source | Monthly score and evidence | Missing behavior | Date attribution |
|---|---|---|---|---|
| Attendance | Sessions/records -> `referee_attendance_detail` | `avg(attendance_points) * 100`; session count and status counts | No detail rows -> score null; completed applicable missing record is an implicit absence/zero point | Session `scheduled_at` converted to Los Angeles date |
| Quiz | Assessments/attempts -> `quiz_member_best_results` | Average non-null effective scores; count and zero count | Required+scoring closed/expired-window assessment without result -> zero; otherwise null | Assessment `open_from` converted to Los Angeles date |
| Reports | Match assignment/report -> `referee_report_detail` | `sum(report_points) / reports_required * 100`; required/submitted/on-time/late/missing counts | Missing obligation row -> null; existing missing/late obligation contributes zero point | Match `match_date_la`, not submission date |
| Evaluations | Current crew/evaluation -> `referee_evaluation_detail` | Quality × Compliance; due/received and state counts | No on-time received Quality or no due Compliance -> score null | Match `match_date_la`, not submission/deadline date |

All output scores are on 0–100. Each detail source already embeds its own
population and historical semantics; the monthly view additionally filters its
own population before joining them.

## 6. Attendance Input

Attendance rows are limited to the period activity interval. Explicit statuses
and implicit absences carry `attendance_points` from the current cycle scoring
rule. Monthly score is the average of those points multiplied by 100 and
rounded to two decimals. Zero sessions yields null, not zero.

Because rules and corrections are read live, changing an Attendance record or
rule changes recalculated historical Development Score. See `06-attendance.md`
for the source lifecycle and population mismatch.

## 7. Quiz Input and Aggregate Contradiction

The monthly view independently reconstructs Quiz effective results from
`quiz_member_best_results`; it does **not** consume `referee_quiz_score`.
A best submitted/expired score becomes effective. A missing result becomes zero
only for a required, scoring assessment after close/archive/window expiry.

Critically, the monthly query has no general `counts_for_score = true` filter.
Therefore an optional or `counts_for_score = false` assessment with a best
score can be counted in monthly Development, even though
`referee_quiz_score` excludes non-scoring assessments. This is an aggregate-
specific contradiction recorded as `DEV-QUIZ-001`; the accepted Quiz document
is not silently rewritten here.

Quiz is attributed to the Los Angeles date of assessment `open_from`, not the
attempt or submission date. Zero counted assessments yields null.

## 8. Report Input

Every `referee_report_detail` obligation in the member/period cutoff is counted.
On-time contributes one point; late or missing contributes zero. Any submitted
Report satisfies completion regardless of approval state, while timeliness is
the same-date rule documented in `05-match-reports.md`. Score is rounded to two
decimals.

The metric is attributed by match date. Submitted/resubmitted/approved time
does not move it to another month. Current Report detail excludes withdrawn
cycle members, so legitimate withdrawn history can disappear (`REP-001`).

## 9. Evaluation Input

Compliance counts obligations to submit; pending is excluded from due. Quality
averages only on-time evaluations received. The monthly Evaluation Score is:

```text
round(quality_percentage * compliance_percentage / 100, 2)
```

It is null without both inputs. Evaluation is attributed by Match date inside
the period cutoff. Activation is not controlled by scoring-period weight: the
technical boundary in `referee_evaluation_detail` determines whether
obligations exist, while configured weight only determines whether a non-null
score is applied.

## 10. Exact Development Score Formula

For each metric `m` in a period:

```text
applied_m = weight_m > 0 AND score_m IS NOT NULL
applicable_weight = sum(weight_m where applied_m)
weighted_points = sum(score_m * weight_m where applied_m)
period_snapshot_score =
  NULL if applicable_weight = 0
  else round(weighted_points / applicable_weight, 2)
```

If a month intersects multiple scoring periods:

```text
monthly_development_score =
  round(sum(period_snapshot_score * period_applicable_weight)
        / sum(period_applicable_weight), 2)
```

Only contributing periods enter the monthly denominator. Periods are weighted
by their applicable configured weight, not by number of intersecting days.
Output scale is 0–100.

### Conceptual consequences

- All four available: ordinary configured weighted average.
- Evaluation pre-activation with no score: unavailable; its weight is removed
  and remaining metrics are renormalized.
- No applicable Quiz assessment: Quiz score null; Quiz weight is removed.
- Available metric scoring zero: its full weight remains and zero contributes
  to numerator.
- Metric null from insufficient evidence: treated as unavailable, not as poor
  performance, even if configuration weight is nonzero.
- All metrics null or zero-weight: Development Score is null.

## 11. Availability, Zero, and Missing-Data Semantics

| State | Metric score | Applied? | Development effect |
|---|---:|---:|---|
| No obligation/evidence and no score | `NULL` | No | Weight renormalized out |
| Pending/insufficient evidence producing null | `NULL` | No | Weight renormalized out |
| Required Quiz missing after closure | `0` | Yes if weight > 0 | Full weight with zero contribution |
| Report obligation late/missing | Can produce `0` | Yes if weight > 0 | Penalizes score |
| Attendance obligations all zero-point | `0` | Yes if weight > 0 | Penalizes score |
| Evaluation Quality×Compliance equals zero | `0` | Yes if weight > 0 | Penalizes score |
| Configured weight zero | Any | No | Ignored |

Configured nonzero weight is necessary but not sufficient for availability.
This design distinguishes zero from null, but it also means missing evidence
can increase the relative influence of the metrics that are available.

## 12. Population Comparison

| Layer | Public status | Cycle status | Ranking eligibility | Enrollment/date semantics |
|---|---|---|---|---|
| Attendance detail | Ignored | Module-specific active/withdrawn handling | Not consistently required upstream | Existing/new handled differently; `manual_adjustment` mismatch |
| Quiz attempt/best result | Ignored | Multiple differing rules | Not required for attempt/score view | Stored dates; no complete enrollment semantics |
| Report detail | Ignored | Active only | Required | Stored effective start for every type; withdrawn excluded |
| Evaluation detail/score | Ignored | Active/withdrawn | Required for both parties | Stored dates for every type |
| Monthly metric view | Ignored | Active/withdrawn | **Required before Development aggregation** | Uses stored start/end for every type |
| Development Score | Inherits monthly rows | Inherits | Inherits early filter | Does not repair source differences |

Confirmed business intent instead separates current participation from Ranking
eligibility and derives existing-member applicability from cycle start. CURRENT
Development violates that separation: `eligible_for_ranking = false` prevents
the monthly metric row and Development Score itself, even when legitimate raw
Development evidence exists. This is consolidated under `POP-001` and
aggregate-specific `DEV-POP-001`.

## 13. Representative Personas

| Persona | Raw evidence | Monthly metric/Development row | Ranking handoff |
|---|---|---|---|
| Elena, active existing | Source rules permit evidence | Present when eligible and within stored dates | Can be eligible subject to Ranking evidence |
| Nora, active new | Evidence after module-specific effective boundaries | Present from stored effective date when eligible | Same bounded months |
| Wendy, withdrawn historical | Some sources preserve in-range evidence; Reports currently do not | Monthly row can preserve bounded months when eligible remains true | Later Ranking rules decide eligibility |
| Ivan, public invited but cycle active/eligible | Modules ignoring public status can generate evidence | Present and scored | Can proceed into Ranking, contrary to approved intent |
| Iris, active but ranking-ineligible | Attendance/Quiz raw evidence may exist | **No monthly metric or Development Score row** | Excluded before Ranking; legitimate Development disappears |
| Sam, suspended/cycle ineligible | Historical raw rows may remain | No row under current status | Excluded; history may disappear after status mutation |
| `manual_adjustment` | Depends on each source | Generic stored dates/status only | No approved special semantics |

## 14. Month and Date Attribution

- Attendance: Los Angeles session date.
- Quiz: Los Angeles assessment opening date.
- Reports: `match_date_la`; submission/resubmission month is irrelevant.
- Evaluations: Match date; evaluation submission/deadline month is irrelevant.
- `snapshot_date`: earlier of effective month end and current Los Angeles date.

These are intentionally recorded as implementation facts, not a unified
business rule. Cross-month obligations can be attributed to the Match/opening
month even when completion occurs later. Combined with mixed Match timestamp
handling, this is `DEV-TIME-001`.

## 15. Historical Mutability

`referee_monthly_development_score_v2` is a live view, not an immutable history
table. Historical results can change through:

- Attendance correction or rule changes;
- Quiz attempt/finalization and privileged content/invalidation changes;
- Report creation, resubmission, assignment, or timing reinterpretation;
- Evaluation submission, crew reassignment, or membership changes;
- cycle-member status, ranking eligibility, or effective-date changes;
- scoring-period end-date changes/deletion and any privileged bypass of weight
  protections;
- changing source view definitions.

Monthly snapshot tables preserve captured Ranking-serving rows, while current
snapshots are refreshed. Their reconciliation/immutability contract belongs to
Ranking documentation.

## 16. Application Consumers

`/portal/development` authenticates the member and loads in parallel:

- current/history from `current_ranking_snapshot` and
  `monthly_ranking_snapshots` via `getDevelopmentPageRankingData()`;
- cycle-level Attendance, Quiz, Report, and Evaluation score views for the
  breakdown/radar.

The overview and progress chart therefore use snapshot Development Scores,
while the breakdown uses live cycle-level module aggregates. They can differ in
freshness, scope, or period composition (`DEV-UI-001`). A missing current
snapshot removes the whole overview, while metric cards have module-specific
empty states. Radar retains null and labels it “Not enough data.”

Portal Dashboard uses the current snapshot through
`getUserCurrentDevelopmentRanking()`. Admin Member Detail also uses the current
snapshot for overall Development and live module aggregates for breakdown.
Admin Ranking is Board-guarded and reads `current_ranking_snapshot`.

## 17. Ranking Boundary

The final Development-owned output is:

```text
development.referee_monthly_development_score_v2.monthly_development_score
```

Ranking ownership begins when
`development.referee_monthly_ranking_evidence_v2` interprets metric counts,
minimums, evidence factors, and ranking eligibility. The database dependency is
clear, although frontend contracts combine Development and Ranking fields in
`get-development-ranking-v2.ts` and Development UI displays rank/evidence next
to the Development Score.

## 18. Authorization and Security

- Member Development/Dashboard routes require authentication and derive the
  member ID from the session for snapshot queries.
- Module score helpers use the server-only service-role client and filter by the
  session user, except `getUserAttendance(userId)`, whose caller supplies the ID;
  current member callers pass the authenticated ID and Board Admin detail uses
  its own guarded helper.
- Admin Ranking and Admin Member Detail call `requireBoard()`.
- No public Development Score mutation API was found.
- Baseline grants expose calculation views to service role. Live post-recovery
  RLS/grants/view execution options remain externally unverified (`DEV-SEC-001`).
- Snapshot helper exports do not accept an arbitrary member ID, so no supported
  member-to-member Development IDOR was found.

## 19. Configuration Ownership

`development.scoring_periods` and Attendance scoring rules are database
configuration. No current application UI/API administers scoring periods or
Development weights. Repository migrations establish structure/functions;
the untracked Development seed contains test configuration only. Live values,
creator identity, and operational change procedure require external
verification.

## 20. Classifications and Consolidated Gaps

- Four source detail/score families: **CURRENT**, population **TRANSITIONAL**.
- Monthly period metric and Development Score views: **CURRENT**, population
  **TRANSITIONAL**.
- `development.scoring_periods`: **CURRENT** configuration.
- `development.cycle_member_population`: **PLANNED**.
- Ranking evidence/calculation/snapshots: **CURRENT**, documented here only as
  downstream boundary.

Existing `POP-*`, `ATT-*`, `REP-*`, `QUIZ-*`, `EVAL-*`, `MATCH-TIME-001`, and
`MATCH-HIST-001` remain authoritative. New aggregate-specific gaps:

- **DEV-QUIZ-001:** monthly Quiz includes best scores from non-scoring
  assessments because it bypasses `referee_quiz_score` and lacks a general
  `counts_for_score` filter.
- **DEV-POP-001:** ranking eligibility is applied before Development, removing
  legitimate Development rows for ranking-ineligible participants.
- **DEV-TIME-001:** four metrics use different attribution events and mixed
  timezone/date semantics.
- **DEV-UI-001:** snapshot overview/history and live module breakdown can
  represent different freshness and aggregation scopes.
- **DEV-CONFIG-001:** global scoring periods have no cycle ownership; gaps are
  allowed and started-period protection does not cover end-date edits/deletion.
- **DEV-SEC-001:** live grants/view security needs read-only verification.

## 21. Evidence

- `supabase/migrations/20260831185011_remote_schema.sql` — scoring-period table,
  triggers, metric/Development/Ranking views, snapshot tables/functions, grants.
- `src/app/(portal)/portal/development/page.tsx`.
- `src/lib/queries/get-development-ranking-v2.ts`.
- `src/lib/queries/get-user-attendance.ts`, `get-user-quiz-score.ts`,
  `get-user-report-score.ts`, and `get-user-evaluation-score.ts`.
- `src/components/development/` — overview, radar, progress, and metric cards.
- `src/app/(portal)/portal/page.tsx`, Admin Ranking, Admin Member Detail, and
  `src/lib/queries/get-member-dashboard.ts`.
- Source module contracts `05` through `08`; `docs/audit/supabase/` remains
  historical supporting evidence only.

## 22. External Verification and Change Checklist

Verify live scoring-period rows, rule values, view definitions, grants/RLS,
snapshot freshness, cron/function health, and intended configuration ownership.
Before changing Development, regression-test all four source modules, null/zero
renormalization, period intersections, population personas, timezone/month
boundaries, historical recalculation, Ranking evidence handoff, snapshot
serving, and every affected Source of Truth classification.
