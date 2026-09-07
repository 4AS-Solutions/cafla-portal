# Matches

## 1. Purpose and Status

Matches owns the scheduled game record used across CAFLA: imported identity,
teams and venue text, kickoff, assigned referee crew, and the match-side report
workflow signal. The CURRENT record is `public.matches`.

**Status: CURRENT.** Portal, Dashboard, Admin, Reports, Evaluations,
Development, and Competition consume it. The `tournaments` schema adds
competition context and roster snapshots; it does not replace the match.

## 2. User-Facing Surfaces

| Audience | Surface | Current responsibility |
|---|---|---|
| Member | `/portal` | Identity-filtered upcoming matches and pending reports through dashboard views. |
| Member | `/portal/matches` | Matches where the member occupies one of three assignment columns. |
| Member | `/portal/matches/[match_id]` | Match, officials, report score/timeline/assets/comments. |
| Member | Report/evaluation routes | Match supplies report responsibility and crew obligations. |
| Board | `/admin/matches`, `/admin/matches/[id]` | List and inspect matches; no edit action is exposed by the detail component. |
| Board | `/admin/import-arbiter` | Preview a spreadsheet, select tournament context, resolve referees, and import/upsert matches. |

## 3. Application Implementation

- `src/lib/matches/get-user-matches.ts` — `getUserMatches()` performs the
  assignment query and applies derived status filters.
- `src/lib/matches/get-match-status.ts` — `getMatchStatus()` derives UI labels;
  these are not a match lifecycle enum.
- `src/lib/queries/get-match-details.ts` — `getMatchDetails()` loads match,
  referee names, report, goals, cards, and assets.
- `src/lib/queries/dashboard.ts` — consumes identity-filtered match views.
- `src/app/api/admin/matches/route.ts` — lists all matches without a
  handler-local Board guard.
- `src/lib/importers/arbiter-parser.ts` — `parseArbiterFile()` accepts XLS/XLSX.
- `src/lib/importers/referee-matcher.ts` — `matchReferee()` resolves or creates
  a `public.arbiter_referees` name mapping.
- `src/app/api/admin/import-arbiter/preview/route.ts` — parses uploads and marks
  duplicate external IDs; it has no handler-local Board guard.
- `src/app/api/admin/import-arbiter/import/route.ts` — verifies Board, requires
  division-season context, resolves officials, and upserts on
  `arbiter_match_id`.
- `src/lib/utils/format-date.ts` — `parseKickoff()` produces a timezone-less SQL
  timestamp string from Arbiter wall-clock text.

## 4. Data and Identity Model

### `public.matches`

| Field | Category | Current semantics |
|---|---|---|
| `id uuid` | Internal identity | Generated primary key and canonical application/FK identity. |
| `arbiter_match_id text` | External identity | Nullable; uniquely indexed; import preview/upsert key and roster Storage-path dependency. |
| `match_number text` | Human/source identity | Nullable; no material current application caller was found. |
| `home_team`, `away_team` | Display/integration | Required source text, also used to resolve tournament registrations. |
| `league`, `division` | Display/integration | Nullable source values, distinct from relational tournament IDs. |
| `location`, `field` | Scheduling/display | Nullable venue components parsed from Arbiter `site`. |
| `kickoff_at` | Scheduling | Nullable `timestamp without time zone`. |
| `center_referee_id` | Assignment | Nullable FK to `public.members.id`; establishes report ownership. |
| `assistant_referee_1_id`, `assistant_referee_2_id` | Assignment | Nullable member FKs; all slots feed visibility and evaluation crews. |
| `report_status` | Workflow signal | Enum, default `pending`; synchronized from `public.match_reports.status`. |
| `arbiter_comments` | Integration | Nullable source comments. |
| `tournament_division_season_id` | Relational context input | Nullable FK to `tournaments.division_seasons.id`, `ON DELETE SET NULL`. |
| `created_at` | Audit metadata | `timestamp without time zone`, default `now()`; no match `updated_at` exists. |

Indexes cover kickoff, unique `arbiter_match_id`, and division-season.
Assignment FKs use the default restrictive delete behavior.

| Identifier | Responsibility |
|---|---|
| `public.matches.id` | Portal/Admin URLs; reports; evaluations; context, logs, rosters, and downstream views. |
| `arbiter_match_id` | External reconciliation and compatibility, not internal identity. |
| `match_number` | Optional human/source number; not currently authoritative in runtime. |
| `tournaments.match_context.match_id` | PK/FK to match UUID, yielding zero-or-one context row. |
| Team registration IDs | Home/away entries within one division-season; do not replace match identity. |

## 5. Data Ownership

`public.matches` owns match identity, kickoff, assignments, source/display team
and venue fields, report-status signal, and selected division-season input.
`tournaments.match_context` owns resolved competition context and registered
home/away teams. `tournaments.match_rosters` owns the player snapshot.

Text and relational fields coexist because import preserves Arbiter values
while the trigger resolves them against internal registrations. No approved
alternative “Match Core” ownership contract was found. Reports own scores,
incidents, assets, and review state; Evaluations own peer submissions.

## 6. Runtime Flows

```text
Board /admin/import-arbiter
  -> XLS/XLSX preview and duplicate labels
  -> season/division-season selection
  -> Board-guarded import
  -> public.arbiter_referees name resolution
  -> public.matches UPSERT ON arbiter_match_id
  -> matches_build_tournament_context trigger
  -> tournaments.build_match_context(match UUID)
  -> match_context UPSERT + roster snapshot/rebuild + appended log
```

This is a manual file import. No live Arbiter API, webhook, polling job, or
two-way synchronization was found. Re-import overwrites current imported match
and assignment fields; it is not assignment/event history.

```text
requireUser()
  -> getUserMatches(user.id)
  -> public.matches + public.match_reports
  -> assignment OR filter and role/status mapping
  -> detail URL by public.matches.id
  -> getMatchDetails() loads match/report children
```

The list establishes assignment scope. Detail does not repeat it, and baseline
match RLS allows every authenticated role to select every match.

```text
public.matches
  + current center assignment -> report responsibility
  + three current assignments -> directed evaluation pairs
  + kickoff -> past/future, report timing, evaluation window
```

## 7. Lifecycle and Report Status

There is no canonical match-status enum. Match time state is derived from
`kickoff_at`; `getMatchStatus()` overlays report state.

| Signal | Values/derivation | Owner |
|---|---|---|
| Match time | Future means `upcoming`; otherwise played/past | Derived |
| Report state | `pending`, `submitted`, `revision_required`, `approved` | Reports enum/record |
| Report existence | Row/no row in `public.match_reports` | Reports |
| Tournament context | Context row/no row plus build logs | Tournaments |
| Evaluation state | Obligation + row + kickoff/48-hour deadline | Evaluations |

`trg_sync_match_report_status` copies inserted/updated report status into the
match. Report submission also updates the match to `submitted`, duplicating
synchronization. No report-delete synchronization trigger is present. A unique
constraint limits a match to one report.

## 8. Tournament Context Boundary

The selected `tournament_division_season_id` drives the builder. It verifies an
active division-season, derives its organization, matches normalized team text
to active registrations, and upserts one `tournaments.match_context` row.

Before a report exists it replaces the roster from active registrations.
After a report exists, existing roster rows remain and missing players may be
inserted. Every build appends a log. Because this is an AFTER trigger and the
function catches failures, a match can persist without valid context/rosters.

Competition views join approved reports through context. A context-less match
cannot contribute to those results, though match/report/evaluation flows can
still use it.

## 9. Referee Assignments

The three fields are nullable member FKs. Portal list/dashboard visibility
recognize every slot. Only the center may submit a report; the API revalidates
ownership. Evaluations derive up to six directed pairs, discard null/self
pairs, then apply Development applicability.

Re-import can overwrite any slot. No assignment audit record, effective
timestamp, or crew snapshot was found. Historical views read latest assignment
values, potentially differing from the crew at kickoff.

## 10. Time and Timezone Rules

`kickoff_at` is timezone-less. Import produces bare `YYYY-MM-DD HH:mm:ss`,
suggesting Los Angeles wall-clock intent without encoding it.

- Development views compare with `now() AT TIME ZONE 'America/Los_Angeles'`
  and cast kickoff directly to `date`.
- Dashboard views compare with `now()`, subject to database session timezone.
- Node/browser helpers construct `new Date(kickoff_at)`.
- Date filters send UTC ISO boundaries to a timezone-less column.
- Evaluation deadlines add 48 hours to the timezone-less kickoff.
- UTC ISO report timestamps enter timezone-less columns and Development later
  treats them as UTC.

Los Angeles intent is not enforced end-to-end. DST and runtime/session timezone
can change boundary results (`MATCH-TIME-001`).

## 11. Authorization and Security

- Portal layout/list use `requireUser()`.
- Baseline match RLS permits every authenticated caller to select every match;
  assignment filtering is application-level on the list.
- `/portal/matches/[match_id]` and `getMatchDetails()` do not validate
  assignment before loading match/report details: credible authenticated IDOR
  gap `MATCH-SEC-001`.
- Admin pages/layout call `requireBoard()`, but `GET /api/admin/matches` lacks a
  handler-local guard; authenticated users can read the complete list under
  baseline RLS (`MATCH-SEC-002`).
- The import write endpoint checks Board. Preview lacks a local guard, while
  proxy does not cover `/api/admin`; it parses uploads and ignores duplicate
  query errors (`MATCH-SEC-003`).
- Report submission authenticates first and uses service role only after
  revalidating center ownership.
- Historical security evidence does not prove live post-recovery state;
  `SEC-001` remains applicable.

## 12. Cross-Module Dependencies

| Consumer | Match dependency |
|---|---|
| Dashboard | `dashboard_upcoming_matches` and `dashboard_pending_reports`, filtering assignments with `auth.uid()`. |
| Reports | UUID, center, kickoff, and report-status signal. |
| Storage/Rosters | Upload paths require `arbiter_match_id`; tournament snapshots key by match UUID. |
| Evaluations | Crew, kickoff/cutoff, applicability, and UUID establish obligations/window. |
| Development | Report/evaluation detail views derive scored evidence from matches. |
| Competition | Division-season builds context/rosters; approved reports plus context feed results. |
| Admin Member Detail | `dashboard_referee_activity` counts all assignment slots. |

## 13. Representative Cases

| Case | CURRENT behavior |
|---|---|
| Tournament match with context | Match persists; trigger upserts context/roster and appends success log. |
| Tournament match without report | `pending`; roster may rebuild on relevant updates; center reports after kickoff. |
| Submitted/approved report | Trigger mirrors state; Competition consumes only approved scored reports. |
| Revision-required report | Match signal mirrors it and UI can display it. |
| Three-referee crew | All see it; center reports; applicable crew may produce six obligations. |
| Missing assignments | Match remains valid; null-related evaluation pairs disappear. |
| Legacy/non-tournament match | Works without context outside relational Competition/automatic rosters. |
| Assignment change | Current slots overwrite; visibility and derived history can change. |

## 14. Classification

| Capability/object | Status | Basis |
|---|---|---|
| `public.matches` and assignments | CURRENT | Direct runtime and cross-module dependency. |
| Manual Arbiter import, ID, and mapping | CURRENT | Active route/API/parser/matcher and Storage dependency. |
| Denormalized source/display fields | CURRENT | Display, search, preservation, and context resolution. |
| Tournament context/roster trigger | CURRENT | Current import and Competition flows. |
| Context-less matches | CURRENT-compatible | Schema permits them and non-Competition consumers use them. |
| `public.dashboard_referee_matches` | UNCERTAIN | No repository caller found; external/database callers are not disproven. |
| Separate future Match Core | Not established | No approved CAFLA contract was found. |

## 15. Known Limitations and Open Questions

- Detail authorization is broader than list assignment scope.
- Admin list/preview endpoints lack handler-local Board authorization.
- Kickoff timezone interpretation is inconsistent.
- Mutable assignments lack historical crew (`MATCH-HIST-001`).
- Report-status synchronization is duplicated and lacks delete semantics.
- Filters run after pagination, so filtered counts/pages can be inaccurate;
  summary counts cover only the current page.
- Match detail performs sequential member/report-child queries.
- Import is sequential, non-atomic, and may partially succeed.
- Context failures do not fail match writes (`MATCH-CTX-001`).
- `match_number` purpose and any external caller for
  `dashboard_referee_matches` remain unresolved.

## 16. Evidence

Application: `src/app/(portal)/portal/matches/`,
`src/app/(admin)/admin/matches/`, `src/app/(admin)/admin/import-arbiter/`,
`src/app/api/admin/matches/route.ts`, `src/app/api/admin/import-arbiter/`,
`src/lib/matches/`, `src/lib/queries/get-match-details.ts`,
`src/lib/queries/dashboard.ts`, `src/lib/importers/`,
`src/lib/utils/format-date.ts`, `src/app/api/reports/submit/route.ts`,
`src/app/api/evaluations/submit/route.ts`, and
`src/lib/storage/match-rosters.ts`.

Database: `supabase/migrations/20260831185011_remote_schema.sql` is the
repository baseline. `docs/audit/supabase/17-view-definitions.md`,
`12-database-dependencies.md`, `10-rls-policies.md`, and
`11-grant-and-privileges.md` are historical supporting evidence only.

## 17. Change Impact Checklist

Before changing Matches, verify Portal/Dashboard/Admin surfaces; API guards;
external IDs and Storage paths; current/historical assignments; report status;
evaluation obligations; Development metrics; tournament context, rosters,
logs, and Competition consumers; Los Angeles/DST interpretation; RLS/grants
and service role; partial import/retry; and affected Source of Truth modules.
