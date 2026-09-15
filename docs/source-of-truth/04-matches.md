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

### CURRENT ownership

`public.matches` is the CURRENT CAFLA match record and canonical internal match
identity.

The CURRENT CAFLA Matches implementation is operationally focused on matches
from Los Angeles Municipal Soccer League that are covered by CAFLA. The fact
that the schema can technically persist a match without complete relational
Competition context does not establish a general CAFLA business rule for
managing unrelated competitions.

`public.matches` currently owns or stores:

- canonical internal match identity;
- imported external Arbiter identity;
- kickoff;
- current referee assignment slots;
- source/display team information;
- source/display venue information;
- report-status signal; and
- selected division-season input used to build Competition context.

`tournaments.match_context` owns the CURRENT resolved relational Competition
context and registered home/away team relationships.

`tournaments.match_rosters` owns the CURRENT database player roster associated
with the resolved Competition context.

Reports own match results, incidents, report assets, submission/review state,
and related Report workflow data.

Evaluations own referee peer-evaluation submissions.

### Referee-assignment ownership

**CONFIRMED BUSINESS RULE:** CAFLA owns the referee-assignment domain for the
matches it covers.

Arbiter is the CURRENT external operational tool used to create and distribute
those assignments, but Arbiter is not the conceptual owner of CAFLA referee
assignment history.

The CURRENT implementation imports Arbiter assignment data into mutable referee
slots on `public.matches`.

CAFLA intends to remain responsible for referee assignments even if the
external assignment mechanism changes in the future.

### Competition ownership direction

**ARCHITECTURAL DIRECTION:** a future Match Core integration may become the
authoritative owner of Los Angeles Municipal Soccer League Competition data,
including match identity/schedule, teams, players, rosters, results, and
competition rules.

If that architecture is approved and implemented, CAFLA may consume the
Competition Match rather than remain its authoritative Competition owner, while
CAFLA continues to own referee-assignment and referee-development concerns.

This future ownership boundary is not implemented in CURRENT runtime and must
not be treated as an existing Match Core integration contract.

Until that transition is explicitly implemented, `public.matches` remains the
CURRENT canonical application/FK match identity inside CAFLA.

### External source fields

Text and relational fields currently coexist because the Arbiter import
preserves source/display values while the Tournament context builder resolves
them against internal Competition registrations.

`arbiter_match_id` remains an external reconciliation identifier and must not
replace `public.matches.id` as CAFLA's CURRENT internal relational identity.

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

### Confirmed Arbiter operational boundary

**CONFIRMED BUSINESS RULE:** Arbiter is the CURRENT operational source used by
CAFLA to prepare and update referee assignments before a match.

Before the match is played, re-imported Arbiter information may legitimately
update the expected referee crew and other imported scheduling information.

After the match is played, CAFLA must preserve the referee crew that actually
worked the match as historical truth for Reports, Evaluations, Development, and
other referee-history consumers.

A later Arbiter import must not silently rewrite that historical actual crew.

Operationally, last-minute assignment changes may be recorded in CAFLA after
the match has already occurred. Therefore, kickoff time alone cannot be used as
an automatic irreversible assignment-freeze boundary.

The CURRENT implementation does not distinguish scheduled assignments from the
actual historical crew and does not yet enforce this business rule.

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

### Match lifecycle versus Report lifecycle

**CONFIRMED BUSINESS RULE:** Match lifecycle and Report lifecycle are separate
domain concepts.

`public.matches.report_status` and `public.match_reports.status` describe the
Match Report workflow. They do not establish whether the Match itself was
played normally, postponed, cancelled, abandoned, or resolved through a
forfeit.

The CURRENT assumption that a Match becomes effectively played/past merely
because `kickoff_at` has passed is insufficient.

CAFLA needs a Match-level lifecycle/outcome distinction capable of representing
at least the following business situations:

- scheduled;
- completed;
- postponed;
- cancelled;
- abandoned;
- forfeit.

The exact database enum, transition matrix, and distinction between lifecycle
status and Match outcome are **PLANNED** and must be approved before
implementation.

At minimum:

- a postponed Match must not be treated as completed merely because the
  original kickoff passed;
- a cancelled Match must not generate ordinary completed-Match obligations;
- a Match that was actually played must be distinguishable from one that did
  not occur;
- an abandoned Match must be distinguishable from a normally completed Match;
- a forfeit must be representable without forcing CAFLA to invent a normal
  played-match Report.

### Competition consequences

**ARCHITECTURAL DIRECTION:** CAFLA needs enough Match state to know that a Match
was resolved through a forfeit or other non-normal outcome, but
Competition-specific consequences should not be redesigned as a full rules
engine inside CAFLA.

Rules such as awarded score, standings-point deductions, sanctions, or
division-specific forfeit consequences belong to the Competition domain and
are expected to be owned eventually by Match Core.

Until that ownership transition exists, CURRENT Competition behavior remains
documented as-is and non-normal Match outcomes remain a known functional gap.

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

### CURRENT assignment model

The three CURRENT assignment fields are nullable member FKs:

- `center_referee_id`;
- `assistant_referee_1_id`;
- `assistant_referee_2_id`.

Portal list/dashboard visibility recognizes every slot.

Only the CURRENT assigned Center may create the Match Report, and the create API
revalidates that ownership.

Evaluations derive directed peer-evaluation relationships from the CURRENT
assignment columns.

Arbiter re-import can overwrite any assignment slot.

No assignment audit record, assignment event history, effective timestamp,
scheduled-versus-actual distinction, or historical crew snapshot was found.

Therefore CURRENT historical consumers can observe the latest assignment values
instead of the crew that actually worked the Match (`MATCH-HIST-001`).

### Scheduled assignment versus actual crew

**CONFIRMED BUSINESS RULE:** scheduled referee assignment and actual Match crew
are separate concepts.

The scheduled assignment represents who was expected to work the Match.

The actual crew represents who actually performed the referee roles.

For example:

Scheduled:

- Center: Luis
- AR1: Roberto
- AR2: Elena

Actual:

- Center: Pedro
- AR1: Roberto
- AR2: Elena

If Pedro replaced Luis at the last minute, the historical Match must recognize
Pedro as the actual Center even when Arbiter still contained Luis at kickoff.

Reports, Evaluations, and Development evidence must ultimately use the actual
crew rather than an obsolete scheduled assignment.

### Timing of actual-crew confirmation

The actual crew does not need to be finalized automatically at the exact
kickoff time.

CAFLA operational staff may be officiating other matches and may record a
last-minute replacement after the Match has already occurred.

The future workflow must therefore permit authorized post-Match correction or
confirmation of the actual crew.

Once actual crew has been established as historical Match truth, later Arbiter
re-imports must not silently replace it.

### Historical preservation

**PLANNED:** CAFLA requires a historical assignment/crew model that can preserve
scheduled assignment information while establishing the actual crew used by
historical consumers.

The exact table structure, audit model, confirmation workflow, correction
permissions, and locking rules are not defined in this document.

Any implementation must consider existing Reports and Evaluations before
allowing a historical actual-crew correction, because those records may already
depend on the prior crew.

This requirement resolves the business semantics of `MATCH-HIST-001`; the
technical preservation model remains PLANNED.

## 10. Time and Timezone Rules

### CURRENT implementation

`public.matches.kickoff_at` is CURRENTLY a nullable
`timestamp without time zone`.

The Arbiter import produces a bare `YYYY-MM-DD HH:mm:ss` value, reflecting Los
Angeles wall-clock intent without encoding a timezone.

CURRENT consumers interpret that value inconsistently:

- Development views compare with
  `now() AT TIME ZONE 'America/Los_Angeles'` and may cast kickoff directly to
  `date`;
- Dashboard views may compare against `now()`, making behavior dependent on
  database/session timezone;
- Node/browser helpers may construct `new Date(kickoff_at)`;
- date filters may send UTC ISO boundaries to a timezone-less column;
- Evaluation deadlines add 48 hours to the timezone-less kickoff;
- Report timestamps and Match timestamps are not interpreted under one
  consistent end-to-end contract.

This is the CURRENT `MATCH-TIME-001` limitation.

### Confirmed timezone contract

**CONFIRMED BUSINESS RULE / ARCHITECTURAL DECISION:** Los Angeles Municipal
Soccer League Match times entered or imported into CAFLA represent
`America/Los_Angeles` local wall-clock time.

The canonical future time model must treat a Match kickoff as one real instant,
not as unrelated date and time fields.

The preferred TO-BE storage model is a timezone-aware timestamp representing
the absolute instant, such as PostgreSQL `timestamptz`.

The boundary is:

`Los Angeles wall-clock input -> interpret in America/Los_Angeles -> store absolute instant -> display in America/Los_Angeles`

Business rules that depend on a calendar date must explicitly derive the
`America/Los_Angeles` calendar date rather than relying on database server,
session, Node runtime, browser, or UTC date defaults.

This applies to, among other consumers:

- upcoming/past Match state;
- Match filtering;
- Report timing;
- Evaluation windows;
- Development month attribution;
- Ranking/scoring-period attribution.

Daylight Saving Time must be handled through the named
`America/Los_Angeles` timezone rather than manual fixed UTC offsets.

### Planned remediation

Changing `kickoff_at` from its CURRENT timezone-less representation requires a
separately approved migration and consumer review.

The migration must verify existing stored values before conversion so that
historical wall-clock values are not shifted incorrectly.

Splitting kickoff into independent date and time columns is not the approved
primary remediation.

No time-model migration is performed by this documentation decision.

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

### Historical crew dependency

Reports, Evaluations, and Development currently depend directly or indirectly
on mutable Match assignment columns.

Under the confirmed business rules, these consumers must ultimately depend on
the actual historical crew once that crew has been established.

The exact downstream migration belongs to the owning Report, Evaluation, and
Development module reviews.

### Future Match Core boundary

The CURRENT dependencies above remain authoritative for this repository.

A future Match Core integration may replace CAFLA ownership of Competition
Match data, but it must preserve a stable Match identity/integration contract
for CAFLA referee assignments, Reports, Evaluations, Development, and historical
records.

That integration is PLANNED and is not defined by the CURRENT database model.

## 13. Representative Cases

| Case | Confirmed / CURRENT behavior |
|---|---|
| Normal Municipal League Match with context | CURRENT Match persists; tournament context/roster may be built; scheduled assignments come from Arbiter; normal downstream Report/Evaluation flows apply. |
| Municipal League Match without valid context | CURRENT Match can persist even when Competition context fails. This is CURRENT-compatible behavior, not approval of CAFLA as a universal external-competition Match registry. |
| Three-referee scheduled crew | CURRENT all assigned referees can see the Match; Center owns Report submission; Evaluation obligations derive from current slots. |
| Last-minute referee replacement | Confirmed business rule requires eventual actual-crew correction. The referee who actually worked the role must become historical crew truth for Reports, Evaluations, and Development. CURRENT has no separate actual-crew model. |
| Arbiter re-import before Match | CURRENT operational reconciliation may update scheduled Match/assignment information. |
| Arbiter re-import after actual crew is established | Future behavior must not silently overwrite historical actual crew or dependent evidence. CURRENT does not provide this protection. |
| Normal completed Match | Must be distinguishable from merely having a kickoff in the past. CURRENT has no canonical completed Match state. |
| Postponed Match | Must not become completed merely because the original kickoff passed. Exact lifecycle implementation is PLANNED. |
| Cancelled Match | Must not generate ordinary completed-Match obligations. Exact lifecycle implementation is PLANNED. |
| Abandoned Match | Must be distinguishable from a normal completion; Competition consequences remain outside the approved CAFLA redesign scope. |
| Forfeit | CAFLA needs to represent the non-normal Match outcome. Awarded score, standings deductions, sanctions, and Competition-specific consequences belong to the Competition domain / future Match Core. |
| Submitted/approved Report | CURRENT Report trigger mirrors Report state into `matches.report_status`; this remains Report workflow state, not Match lifecycle. |

## 14. Classification

| Capability/object | Status | Basis |
|---|---|---|
| `public.matches` and assignments | CURRENT | Direct runtime and cross-module dependency. |
| Manual Arbiter import, ID, and mapping | CURRENT | Active route/API/parser/matcher and Storage dependency. |
| Denormalized source/display fields | CURRENT | Display, search, preservation, and context resolution. |
| Tournament context/roster trigger | CURRENT | Current import and Competition flows. |
| Context-less matches | CURRENT-compatible | Schema permits them and non-Competition consumers can use them; this does not establish a business rule that CAFLA is a universal registry for unrelated competitions. |
| `public.dashboard_referee_matches` | UNCERTAIN | No repository caller found; external/database callers are not disproven. |
| Future Match Core Competition ownership | PLANNED / ARCHITECTURAL DIRECTION | Match Core may eventually own Municipal League Competition data while CAFLA remains authoritative for referee operations; no integration or ownership transfer is CURRENT. |
| Scheduled assignment versus actual crew | PLANNED | Confirmed business distinction; CURRENT stores only mutable assignment columns. |
| Historical actual-crew preservation | PLANNED | Required so Reports, Evaluations, and Development reflect who actually worked the Match. |
| Canonical Match lifecycle | PLANNED | CURRENT kickoff/report signals cannot represent completed, postponed, cancelled, abandoned, or forfeit semantics correctly. |
| Competition-specific forfeit consequences | PLANNED OUTSIDE CAFLA MATCHES | Expected future Match Core / Competition responsibility; no CAFLA rules engine is approved here. |
| Canonical `timestamptz` kickoff model | PLANNED | Confirmed Los Angeles input/display/business-date contract; CURRENT remains timezone-less. |

## 15. Known Limitations and Open Questions

### Confirmed limitations / implementation mismatches

- Detail authorization is broader than list assignment scope
  (`MATCH-SEC-001`).

- Admin list and Arbiter-preview endpoints lack complete handler-local Board
  authorization (`MATCH-SEC-002`, `MATCH-SEC-003`).

- `kickoff_at` is timezone-less and CURRENT consumers do not share one
  Los Angeles time contract (`MATCH-TIME-001`).

- Referee assignments are mutable columns with no scheduled-versus-actual crew
  distinction, assignment history, or historical crew snapshot
  (`MATCH-HIST-001`).

- A later Arbiter re-import can overwrite assignment fields that historical
  Report/Evaluation/Development consumers may still read.

- CURRENT Match state is inferred primarily from kickoff and Report workflow;
  no canonical Match lifecycle represents completed, postponed, cancelled,
  abandoned, or forfeit behavior.

- CURRENT CAFLA Competition behavior does not provide an approved general model
  for forfeit result consequences or standings-point deductions.

- Report-status synchronization is duplicated and lacks Report-delete
  synchronization semantics.

- Filters run after pagination, so filtered counts/pages can be inaccurate and
  summary counts cover only the current page.

- Match detail performs sequential member/report-child queries.

- Arbiter import is sequential, non-atomic, and may partially succeed.

- Tournament-context failures do not fail the originating Match write
  (`MATCH-CTX-001`).

### Confirmed architectural direction

- Arbiter remains the CURRENT pre-Match operational import mechanism but is not
  the conceptual owner of CAFLA referee assignments.

- CAFLA must eventually preserve actual historical Match crew independently
  from scheduled assignment.

- Los Angeles Match wall-clock values must use an explicit
  `America/Los_Angeles` interpretation and a future timezone-aware absolute
  timestamp model.

- Match Core may eventually become the Competition authority for Municipal
  League Match/result/standings data, while CAFLA remains authoritative for
  referee operations.

- CAFLA should not build a new full Competition rules engine merely to duplicate
  functionality expected to move to Match Core.

### Remaining open questions

- What exact schema and workflow should preserve scheduled assignments and
  actual historical crew?

- At what point, and by which authorized actor, is actual crew considered
  confirmed?

- What correction rules apply when actual crew is changed after a Report or
  Evaluations already exist?

- What exact Match lifecycle enum and transition matrix should implement
  scheduled/completed/postponed/cancelled/abandoned/forfeit semantics?

- Should `forfeit` ultimately be represented as Match lifecycle state, Match
  outcome, result type, or a combination? This belongs to the future
  Competition/Match Core contract.

- What is the intended purpose of `match_number`, and are there external callers
  of `public.dashboard_referee_matches`?

- What exact stable identity/integration contract will connect future Match Core
  Matches to CAFLA referee-operation records?

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
internal and external Match identities; `arbiter_match_id` Storage-path
dependencies; scheduled assignments; actual/historical crew; Report ownership
and status; Evaluation obligations; Development evidence; Match lifecycle and
non-normal outcomes; tournament context, rosters, logs, and Competition
consumers; Los Angeles/DST interpretation; RLS/grants and service-role usage;
partial import/retry behavior; future Match Core integration boundaries; and
affected Source of Truth modules.

Changes to historical crew, Match lifecycle, or kickoff timestamp semantics must
not be implemented as isolated column changes because Reports, Evaluations,
Development, Dashboard, Competition, and historical snapshots depend on these
boundaries.
