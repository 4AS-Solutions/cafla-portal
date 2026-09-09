# Ranking V2

## 1. Purpose and Boundary

Ranking V2 turns a monthly Development Score plus the quantity of supporting
evidence into qualification, Ranking Score, position, percentile, current
ranking, and persisted serving snapshots. This document describes the verified
implementation at `develop@f236021`.

Ranking begins at:

```text
development.referee_monthly_development_score_v2
  -> development.referee_monthly_ranking_evidence_v2
```

Development owns performance aggregation. Ranking owns evidence sufficiency,
the evidence factor, Ranking Score, position, percentile, and snapshots. No
CURRENT ranking-level or promotion/demotion subsystem was found.

## 2. Status and Ownership Layers

| Layer | Canonical object | Type | Grain | Status |
|---|---|---|---|---|
| Development input | `development.referee_monthly_development_score_v2` | Live view | Cycle member + month | CURRENT; upstream |
| Ranking evidence | `development.referee_monthly_ranking_evidence_v2` | Live view | Cycle member + month | CURRENT; population TRANSITIONAL |
| Monthly position/history calculation | `development.referee_monthly_ranking_history_v2` | Live view | Cycle member + month | CURRENT |
| Current calculation | `development.referee_current_ranking_v2` | Live view | Cycle member at latest snapshot date per cycle | CURRENT |
| Current serving | `development.current_ranking_snapshot` | Persisted table | Cycle + member | CURRENT |
| Historical serving | `development.monthly_ranking_snapshots` | Persisted table | Cycle + member + month | CURRENT |
| Exact-set reconciliation | None | — | — | PLANNED |
| Canonical population | `development.cycle_member_population` | Planned relation | Cycle member applicability | PLANNED |
| Public Ranking V1 | Retired public views/tables/functions | Historical | — | RETIRED |

The live views calculate; the snapshot tables serve application pages. A
snapshot is not the same object as the live calculation and may lag it.

## 3. Evidence Population and Inputs

`referee_monthly_ranking_evidence_v2` reads
`referee_monthly_period_metric_scores_v2`, calculates evidence within each
scoring-period slice, combines slices into a month, and joins the matching
`referee_monthly_development_score_v2` row.

The input population already requires cycle-member status `active` or
`withdrawn`, applicable stored effective dates, and
`eligible_for_ranking = true`. `public.members.status` is not checked. Ranking
therefore inherits `DEV-POP-001`: Ranking eligibility is applied upstream
before a Development Score exists and must not be described as a second,
independent filter at this layer.

Evidence availability is period-specific:

| Metric | Available when |
|---|---|
| Attendance | Weight > 0 and at least one Attendance session exists |
| Quiz | Weight > 0 and at least one required, `counts_for_score=true` assessment opened in the period activity/cutoff interval |
| Reports | Weight > 0 and `reports_required > 0` |
| Evaluations | Weight > 0 and either a required Evaluation obligation or an Evaluation received exists |

Quiz availability is narrower than the monthly Development Quiz input. The
latter can count a result from a non-scoring assessment (`DEV-QUIZ-001`), while
Ranking evidence availability searches required scoring assessments. This can
produce mismatched score/evidence semantics (`RNK-EVID-001`).

## 4. Exact Minimum-Evidence Requirements

Minimums qualify evidence; they do not calculate the underlying metric score.
An unavailable metric passes the minimum predicate and is omitted from the
evidence denominator.

| Metric | Minimum when available | Evidence quantity |
|---|---:|---|
| Attendance | 5 | `present + late + excused`; absences do not count |
| Quiz | 1 | Counted assessments |
| Reports | 1 | Required Reports, regardless of submission outcome |
| Evaluations | At least 1 due **and** at least 1 received | The lesser-performing of due and received evidence controls the evidence contribution |

For each quantity, the implementation calculates a 90th-percentile benchmark
among eligible input rows in the same cycle, month, and scoring period. Once
the minimum is met, evidence is normally:

```text
0.25 + 0.75 * (quantity - minimum) / (p90_benchmark - minimum)
```

clamped to 0–1. If the benchmark is at or below the minimum, a member meeting
the minimum receives 1. Evaluation calculates separate due and received
values and takes their minimum. Below a required minimum produces zero.

Per period:

```text
evidence_weight = sum(configured weights of available metrics)
evidence_points = sum(metric evidence * metric weight for available metrics)
period_evidence_index = evidence_points / evidence_weight
```

The monthly index is the evidence-weighted combination of period indexes.
Zero total evidence weight yields null. Thus configured weight zero or an
unavailable metric imposes no minimum; a score of zero with sufficient
quantity remains performance evidence and does not fail the quantity minimum.

## 5. Eligibility Model

CURRENT eligibility is a combination of stored and derived state:

1. The stored `development.cycle_members.eligible_for_ranking` predicate has
   already admitted the row into the upstream monthly Development population.
2. A matching non-null monthly Development Score must exist.
3. Every metric that is available must meet its metric minimum.
4. Only rows satisfying all of the above receive
   `monthly_ranking_eligible = true` and a Ranking Score.
5. Only eligible rows with non-null Ranking Score participate in position and
   percentile calculations.

The live history view retains its input rows when monthly qualification fails,
but position, percentile, and eligible-referee count are null. Because the
upstream population already removes `eligible_for_ranking=false`, the
`not_eligible` evidence-status branch is ordinarily unreachable for Iris-like
members under CURRENT calculation (`RNK-POP-001`).

A member may have a Development Score yet fail Ranking qualification because
an available metric minimum is unmet. Conversely, unavailable weighted metrics
are omitted rather than blocking qualification.

## 6. Evidence Status

The ordered status branches are:

```text
not_eligible
needs_attendance
needs_quiz
needs_report
needs_evaluation
insufficient_performance_data
limited_evidence       (< 25%)
developing_evidence    (< 60%)
strong_evidence        (< 90%)
mature_evidence        (>= 90%)
```

The first unmet available metric wins in the order above. These are evidence
states, not referee levels.

## 7. Ranking Score

The monthly evidence factor is:

```text
monthly_evidence_percentage = round(monthly_evidence_index * 100, 2)
monthly_evidence_factor_percentage =
  round((0.60 + monthly_evidence_index * 0.40) * 100, 2)
```

For a qualifying row:

```text
monthly_ranking_score = round(
  monthly_development_score * monthly_evidence_factor_percentage / 100,
  2
)
```

It is therefore neither identical to Development Score nor a historical
average. Evidence scales the monthly Development Score by 60%–100%. If the row
does not qualify or the factor is null, Ranking Score is null.

## 8. Monthly Ranking History and Position

`referee_monthly_ranking_history_v2` is a live-derived history, not persisted
history. It ranks eligible, non-null scores per `cycle_id + month_start` using:

```text
rank() over (
  partition by cycle_id, month_start
  order by monthly_ranking_score desc
)
```

Equal scores share a position and the next position has the corresponding gap.
There is no UUID/name fallback because `RANK`, unlike `ROW_NUMBER`, intentionally
preserves exact-score ties. `eligible_referees` counts only ranked rows.
Percentile is 100 for a one-person field; otherwise it is
`round((1 - percent_rank()) * 100, 2)`, giving the top row 100 and the last row
0 when scores differ.

Because this is a live view, upstream corrections and configuration changes
can retroactively change monthly evidence, score, eligibility, position, and
percentile.

## 9. Current Ranking Selection

`referee_current_ranking_v2` finds the maximum `snapshot_date` separately for
each cycle and returns all live-history rows for that date. It does **not**:

- select the latest eligible month per member;
- independently require an active cycle;
- prefer a completed month over a partial current month; or
- carry forward a previous valid position.

During a partial month, that month normally has the latest snapshot date. A
member with insufficient evidence remains in the calculated current row with
null rank, rather than falling back to the prior valid month. In UI terms the
member can become “Not Ranked” for the current month despite a prior valid
month (`RNK-CURRENT-001`).

Active-cycle selection happens in refresh functions and application queries,
not in this view itself.

## 10. Ranking Levels and Promotion/Demotion

No CURRENT ranking configuration/level table, level column, score threshold,
effective-dated level, level history, or verified `Beginner` / `Advanced` /
`Elite` model was found in the baseline or runtime callers. Snapshot tables and
application contracts contain no ranking level.

No automatic threshold transition, streak/minimum-month rule, manual Board
level decision, promotion/demotion endpoint, or persisted transition history
was found. The Admin UI's “Ranked” badge and evidence status labels are display
states, not levels. Ranking level and promotion/demotion are therefore
**UNCERTAIN / NOT IMPLEMENTED IN VERIFIED CURRENT ARCHITECTURE**, not inferred
product capabilities.

## 11. Snapshot Architecture

### Current serving table

`development.current_ranking_snapshot` has primary key
`(cycle_id, member_id)`. It persists Development Score, evidence percentage and
factor, Ranking Score, position, percentile, eligible population count,
qualification/status, five evidence counts, `snapshot_date`, and
`refreshed_at`. Checks enforce score/range validity and require score/position
when `ranking_eligible=true`.

`refresh_current_ranking_snapshot(p_cycle_id)` inserts live
`referee_current_ranking_v2` rows and upserts on `(cycle_id, member_id)`.
`refresh_active_cycle_ranking_snapshot()` selects the latest active cycle whose
date range contains `current_date`, returns zero without one, and delegates to
that refresh.

### Monthly serving table

`development.monthly_ranking_snapshots` has an ID primary key and unique
`(cycle_id, member_id, month_start)`. It stores the principal Development,
evidence, Ranking, position, qualification/status fields and `captured_at`, but
not the detailed evidence counts in the current snapshot.

`capture_monthly_ranking_snapshot(p_cycle_id, p_month_start)` normalizes the
month, requires live history at that calendar month's final day, and upserts
the persisted row. `capture_previous_month_ranking_snapshot()` selects an
active cycle overlapping the previous calendar month and delegates.

Both tables reference cycles, cycle members, and members with cascading foreign
keys. The baseline grants snapshot functions only to `service_role` after
revoking `PUBLIC` execution.

## 12. Refresh, Scheduling, and Exact-Set Semantics

Historical cron evidence records:

| Job | Schedule | Command | Historical state |
|---|---|---|---|
| `refresh-current-development-ranking` (job 2) | `*/15 * * * *` | `select development.refresh_active_cycle_ranking_snapshot();` | Active |
| `capture-monthly-development-ranking` (job 3) | `10 0 1 * *` | `select development.capture_previous_month_ranking_snapshot();` | Active |

These jobs were also owner-confirmed after recovery, but their current live
catalog state still requires external read-only verification for a security or
operations sign-off. No application mutation hook or refresh API/action was
found; current serving can lag live views until scheduling/manual operation.

Both capture/refresh implementations are upsert-only. They do not remove rows
that are no longer returned by the canonical live query. Consequently refresh
means “insert/update current results,” not “make the snapshot exactly equal to
the current result set.” A member who leaves the calculated population can
remain stale in `current_ranking_snapshot` and continue appearing in member or
Admin serving queries. This is the existing `RNK-001`; exact-set reconciliation
is PLANNED and is not implemented here.

Monthly recapture also updates an existing stored month, including
`captured_at`; it is reproducible, not immutable. It likewise does not remove a
formerly captured row absent from a later live recalculation.

## 13. Transaction and Concurrency Characteristics

Each refresh function executes its single `INSERT ... SELECT ... ON CONFLICT DO
UPDATE` statement atomically within its transaction. Readers do not observe a
partially applied statement. No advisory lock or refresh-generation identifier
was found. Concurrent executions can calculate at different instants and the
last conflicting update wins; non-returned stale rows are unaffected.

Positions are calculated together in the source view, so one successful
statement writes an internally related source result. The serving table does
not prove that all retained rows belong to one generation because old rows are
not reconciled (`RNK-CONC-001`).

## 14. Application Consumers and Freshness

| Surface | Query/helper | Source | Authorization | Display |
|---|---|---|---|---|
| Member Dashboard | `getUserCurrentDevelopmentRanking()` | Current snapshot, active cycle, session member | Authenticated; service-role server client | Position, Development Score, evidence/status; no level |
| `/portal/development` | `getDevelopmentPageRankingData()` | Current + monthly snapshots | Authenticated; session member | Current position, Development/evidence, monthly Development chart with rank tooltip |
| Admin Ranking | `getAdminRanking()` | Current snapshot + `public.members` names | `requireBoard()` | All snapshot rows, top three, scores, position, evidence/status/counts; no level |
| Admin Member Detail | `getMemberDashboard(memberId)` | Current snapshot only for `development_score`; live module aggregates beside it | Board route | Overall Development only; no rank/evidence/level/history |

Member helpers derive `member_id` from the authenticated session and do not
accept another member ID. The Development history query loads stored monthly
snapshots and adds the current snapshot only if that month is absent; an
already-captured row wins over current data for the same month. This can show
different freshness within one page (`RNK-UI-001`, also `DEV-UI-001`).

Admin Ranking orders null positions last. It offers client-side mobile
pagination and summaries, but no server filter, refresh control, configuration
editing, rank override, eligibility mutation, level mutation, or
promotion/demotion operation.

## 15. Population and Persona Matrix

This matrix describes what CURRENT predicates allow; it does not assert that
the untracked fixtures exist in Production or contain activity.

| Persona | Raw Development evidence | Development row | Ranking qualification/current | Snapshot consequence |
|---|---|---|---|---|
| Elena, active existing/eligible | Module rules permit | Yes in applicable months | Can qualify after all available minimums | Inserted/upserted when live row exists |
| Nora, active new/eligible | From module/effective boundary | Yes from applicable start | Same minimum rules | Same |
| Wendy, withdrawn historical/eligible | Source-dependent; some history is lost by current Report semantics | Bounded historical months can remain | Can rank historically where row/minimums remain; no special “current withdrawal” fallback | Captured history can remain; current stale-row risk exists |
| Ivan, public invited but cycle active/eligible | Sources ignoring public status can generate | Yes | Can qualify and rank contrary to approved participation intent | Can be persisted and remain stale |
| Iris, active but ranking-ineligible | Some raw module evidence can exist | No, due upstream filter | No calculated monthly/current row; not merely null position | An old row would require exact-set cleanup |
| Sam, suspended/cycle ineligible | Historical source rows may exist | No under current mutable status | Current exclusion; historical live rows may disappear | Persisted history may remain; current can become stale |
| `manual_adjustment` | Source-dependent | Generic status/effective-date handling | No distinct approved semantics | Follows whatever row reaches live calculation |

The desired canonical distinction between participation and Ranking eligibility
is not implemented consistently. `cycle_member_population` is the planned
shared boundary; no persona result above should be generalized into a new rule.

## 16. Historical Mutability and Cycle Lifecycle

Live monthly Ranking can change retroactively through source evidence changes,
cycle-member status/eligibility/effective dates, scoring-period configuration,
or calculation-view changes. Benchmark-relative evidence means another
member's evidence can also change a member's factor, score, and position.

The actual cycle states are `draft`, `active`, `closed`, and `archived`.
Calculation views can produce cycle-scoped history without themselves selecting
only the active cycle. Current application consumers select one active cycle;
`refresh_active_cycle_ranking_snapshot()` additionally requires today's date
inside it. With no active cycle, application ranking is empty/null and refresh
returns zero. Monthly capture also requires an active cycle overlapping the
previous month.

Snapshots remain cycle-scoped after closure, but current member/Admin queries
do not expose closed/archived cycles. No verified UI for historical cycle
selection or an explicit close/final-freeze procedure was found
(`RNK-LIFE-001`).

## 17. Configuration Ownership

Ranking has no separate CURRENT configuration or level administration surface.
Its fixed minimums, p90 benchmark, 25% starting evidence credit, 60%–100%
factor, and evidence-status thresholds are encoded directly in the view
definition. Development weights live in global `development.scoring_periods`.
No Admin UI/API was found for either Ranking formulas or snapshot scheduling.
Who operationally owns formula changes is **UNCERTAIN** and any change requires
separate business approval and database work.

## 18. Authorization and Security

- Member Dashboard/Development require an authenticated user; helpers use a
  server-only service-role client and filter snapshots by session user ID.
- Admin Ranking and Admin Member Detail are guarded with `requireBoard()`.
- No client-exposed service-role credential, arbitrary-member Ranking helper,
  refresh endpoint, or configuration mutation endpoint was found.
- Baseline RLS allows any authenticated role to select all rows from
  `current_ranking_snapshot`; monthly history restricts authenticated reads to
  `member_id = auth.uid()`. Current application paths are narrower, but a direct
  authenticated Supabase client could potentially read the full current
  ranking (`RNK-SEC-001`).
- Baseline function grants revoke `PUBLIC` and grant snapshot functions to
  `service_role`. Calculation views are service-role granted. Live grants,
  policies, view security options, and cron execution identity require
  read-only Production verification (`RNK-SEC-002`).

## 19. CURRENT, TRANSITIONAL, PLANNED, and RETIRED

| Capability | Classification | Reason |
|---|---|---|
| Evidence formula/view | CURRENT | Active calculation dependency |
| Monthly position/history view | CURRENT | Active calculation/capture dependency |
| Current-ranking view | CURRENT | Active refresh source |
| Current/monthly serving snapshots | CURRENT | Runtime frontend sources |
| Snapshot scheduling | CURRENT / LIVE VERIFICATION REQUIRED | Baseline plus owner recovery confirmation; no live access in this pass |
| Population interpretation | TRANSITIONAL | Inherits early eligibility and ignores public member status |
| Exact-set current refresh | PLANNED | Current function is upsert-only |
| `development.cycle_member_population` | PLANNED | Approved canonical boundary does not exist currently |
| Ranking levels/configuration | UNCERTAIN / not found | No verified CURRENT objects or consumers |
| Promotion/demotion | UNCERTAIN / not found | No verified workflow or persistence |
| Public Ranking V1 | RETIRED | Intentionally retired; must not be restored |

## 20. Future Canonical-Population Boundary

When the planned `development.cycle_member_population` exists, the direct
Ranking consumer boundary is the upstream monthly population feeding
`referee_monthly_period_metric_scores_v2` and thus
`referee_monthly_development_score_v2`. Ranking evidence/history/current views
and both snapshot functions are downstream consumers whose population results
must be regression-tested. Application snapshot readers should not independently
reimplement population rules; stale-row reconciliation remains a separate
planned concern.

## 21. Known Gaps and Open Questions

- `RNK-001`: current refresh is not exact-set.
- `RNK-EVID-001`: Quiz Development-score and Ranking-evidence availability use
  conflicting scoring-assessment predicates.
- `RNK-POP-001`: early Ranking eligibility prevents Development and makes the
  `not_eligible` output state effectively unavailable for Iris-like members.
- `RNK-CURRENT-001`: current selects latest snapshot date, not latest qualifying
  month.
- `RNK-UI-001`: stored month takes precedence over the current snapshot for the
  same month in member history.
- `RNK-CONC-001`: no generation/exact-set marker identifies a coherent retained
  serving set.
- `RNK-LIFE-001`: no verified closed-cycle history/finalization UI or procedure.
- `RNK-SEC-001` / `RNK-SEC-002`: broad baseline current-snapshot read policy and
  live security verification needs.
- Ranking levels, promotion/demotion, formula ownership, intended current-month
  fallback, and immutable-history requirements require owner confirmation.

## 22. Evidence

Repository:

- `src/lib/queries/get-development-ranking-v2.ts` — member current/history
  snapshot queries and same-month merge
- `src/lib/queries/admin-ranking.ts` — Board ranking query
- `src/lib/queries/get-member-dashboard.ts` — Admin Member Detail mixed sources
- `src/app/(portal)/portal/page.tsx` — member Dashboard consumer
- `src/app/(portal)/portal/development/page.tsx` — member Development consumer
- `src/app/(admin)/admin/ranking/page.tsx` — `requireBoard()` and Admin consumer
- `src/components/development/DevelopmentOverview.tsx`
- `src/components/development/DevelopmentSummaryCard.tsx`
- `src/components/development/DevelopmentProgressChart.tsx`
- `src/components/admin/AdminRankingTable.tsx`
- `src/components/admin/ranking/types.ts`

Database baseline:

- `supabase/migrations/20260831185011_remote_schema.sql` — Ranking views,
  snapshot tables/functions, constraints, FKs, grants, policies, and enums
- `docs/audit/supabase/13-cron-jobs.md` — point-in-time scheduler evidence
- `docs/audit/supabase/17-view-definitions.md` — historical supporting view
  definitions; not independently current after recovery

## 23. Change Impact Checklist

Before changing Ranking, verify:

- all four metric availability/minimum calculations and p90 benchmark cohort;
- Development versus Ranking qualification semantics;
- ties, percentile, current-month selection, and closed-cycle history;
- current and monthly snapshot exact-set/immutability/freshness contracts;
- member Dashboard/Development, Admin Ranking, and Admin Member Detail;
- active-cycle and no-active-cycle behavior;
- cron callers, function grants, RLS, and service-role boundaries;
- concurrent refresh and rollback behavior;
- canonical-population impacts and all personas above;
- Source of Truth, status matrix, and gap-register updates.
