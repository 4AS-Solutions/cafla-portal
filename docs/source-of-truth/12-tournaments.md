# Tournaments & Competition

## 1. Purpose and Status

The Competition module owns CAFLA's relational league structure: organizations,
seasons, divisions, seasonal division participation, permanent teams, seasonal
team registrations, permanent players, seasonal roster registrations, match
competition context, database match rosters, standings, and player statistics.

**Status: CURRENT.** The member Competition Center and Arbiter match import use
the `tournaments` schema. `public.matches` remains the canonical Match owner;
Competition contextualizes it rather than replacing it.

## 2. Ownership Map

| Concept | Canonical owner | Contextual/derived representation |
|---|---|---|
| Organization | `tournaments.organizations` | Organization IDs propagate to seasons, divisions, teams, and players. |
| Season | `tournaments.seasons` | Labels such as `Fall 2026` are derived. |
| Division | `tournaments.divisions` | Its participation in a season is a separate `division_seasons` row. |
| Division in season | `tournaments.division_seasons` | Selected by matches and team registrations. |
| Team identity | `tournaments.teams` | `public.matches.home_team/away_team` retain denormalized source/display names. |
| Team in division-season | `tournaments.team_registrations` | Referenced by match context and standings. |
| Player identity | `tournaments.players` | Report events may retain player name/number text when no identity resolves. |
| Player on seasonal team | `tournaments.player_registrations` | Active roster for team profile/context building. |
| Match | `public.matches` | `tournaments.match_context` adds relational competition identity. |
| Database match roster | `tournaments.match_rosters` | Snapshot-like rows derived from active player registrations. |
| Uploaded roster file | Supabase Storage/report asset records | Separate from the database match roster; deferred to Storage/Reports docs. |
| Result | Approved `public.match_reports` score | Aggregated by `team_season_standings`. |
| Goal/card events | `public.report_goals` / `public.report_cards` | Aggregated into Competition player-stat views. |
| Standings | `tournaments.team_season_standings` | Non-materialized calculated view. |
| Player statistics | `player_team_season_stats`, `player_card_reason_stats` | Non-materialized calculated views. |

## 3. Organization, Season, and Division Model

```text
organizations 1 -> many seasons
organizations 1 -> many divisions
divisions many <-> many seasons through division_seasons
division_seasons 1 -> many team_registrations
```

| Object | Important fields and constraints | Current semantics |
|---|---|---|
| `organizations` | UUID PK; unique `name`; unique `slug`; nullable/default-true `active` | Permanent competition organization identity. |
| `seasons` | Organization FK; `term`, `year`; optional dates; `upcoming/active/archived`; unique `(organization_id, term, year)` | Seasonal identity. One partial unique index permits at most one `active` season per organization. Terms are constrained to `Spring`, `Winter`, or `Fall`. |
| `divisions` | Organization FK; name; active; unique `(organization_id, name)` | Permanent organization-scoped division. |
| `division_seasons` | Division FK; season FK; active; unique `(division_id, season_id)` | Associates a division with multiple seasons over time. |

The schema structurally supports multiple organizations. The baseline does not
enforce that a `division_seasons` row's division and season belong to the same
organization; correctness currently depends on writers. Historical audit
counts showed one organization and one season, but those counts are not live
Production evidence.

The Portal API returns active division-season rows, then filters them through a
hard-coded set of seven Sunday division names. It selects the first `active`
season, otherwise the first sorted season. Admin import options return every
active division-season. Neither endpoint filters by organization.

`active`/`status` flags are not enforced uniformly. The option APIs filter
`division_seasons.active` but not organization/division active flags. The
builder requires active division-season, team registration, and team, but not
active organization, season status, or player identity. Standings require
active team registrations but do not filter team/division/season/organization
status. Team Profile requires active player registrations but does not filter
`players.active`. These are implementation facts; no single canonical
competition-visibility rule was found (`COMP-ACT-001`).

## 4. Team and Team-Registration Model

`tournaments.teams` is permanent organization-scoped identity: UUID, required
name, `active`, and unique `(organization_id, name)`. No team logo/asset column
exists in the baseline.

`tournaments.team_registrations` places a team in one division-season. It has
its own UUID, optional `external_team_id`, `active`, timestamps, and unique
`(team_id, division_season_id)`. The external ID belongs to the seasonal
registration, not the permanent team.

The schema does not itself constrain the team organization to equal the
division/season organization. `build_match_context()` preserves this invariant
for its own path by resolving active teams within the selected season's
organization and registrations within the selected division-season.

`public.matches.home_team/away_team` coexist with registrations because Arbiter
source text is displayed and used for normalized name resolution, while
`match_context` stores stable relational identities.

## 5. Player and Registration Model

`tournaments.players` is permanent organization-scoped identity. It stores an
optional external player ID, names, optional birth date/photo URL, `active`, and
timestamps. The baseline contains two equivalently scoped unique constraints
on `(organization_id, external_player_id)`.

`tournaments.player_registrations` links a player to a team registration. It
stores `active`, `registered_at`, and timestamps, with unique
`(player_id, team_registration_id)`. Jersey number and check-in are not
registration fields; they exist on `match_rosters`.

Rows can be retained and marked inactive, preserving that a link existed, but
there is no end timestamp or transfer event. A player can technically have
multiple registrations, including simultaneous active registrations, because
uniqueness is per player/team-registration pair. The schema does not enforce
that player and team registration belong to the same organization.

`tournaments.import_team_roster()` is a service-role-only SECURITY DEFINER RPC
in the baseline. It resolves organization and seasonal team by external ID,
upserts permanent players by organization/external ID, activates their
registrations, and can deactivate missing registrations. No current repository
caller was found; a live/external operational caller is UNCERTAIN.

## 6. Match Context

`tournaments.match_context` has one row at most per match because `match_id` is
both PK and an `ON DELETE CASCADE` FK to `public.matches.id`. It requires:

- `division_season_id`;
- distinct `home_team_registration_id` and `away_team_registration_id`;
- FKs to the division-season and registrations with restrictive deletion.

`public.matches.tournament_division_season_id` is the requested context and is
nullable. On match insert or relevant team/context update, the AFTER trigger
calls `build_match_context(match_id)`. The function resolves active registered
teams by normalized source names, upserts context, reconciles the match roster,
and appends a diagnostic log.

Context is **conditionally required**: core Match, Report, and Evaluation flows
can operate without it, but relational standings, player statistics, roster
selection, and team profiles require it. Builder failures are caught/logged and
do not reject the match write (`MATCH-CTX-001`). The FKs do not independently
ensure that both registrations belong to the stored division-season; the
current builder does.

## 7. Database Match Rosters

`tournaments.match_rosters` contains UUID, match, player, team, optional jersey
number, `checked_in`, and creation time. `(match_id, player_id)` is unique.
Match/player/team FKs cascade on deletion.

The context builder copies active players from each selected team registration.
Before a report exists, it removes and rebuilds all roster rows. Once a report
exists, it preserves rows and inserts only missing players. Therefore it acts
as a match-specific snapshot after reporting begins, but before then relevant
match updates or registration changes can replace it. `team_id` represents the
side; there is no explicit home/away column, so side is inferred by comparison
with context registrations.

The report form reads `tournaments.match_roster_view` directly from the browser
with the authenticated Supabase client. The unused `getMatchRoster()` helper
queries unqualified `match_rosters` from the default schema and has no caller;
it is residue, not the active roster path.

## 8. Standings

```text
approved public.match_reports with non-null scores
  -> tournaments.match_context
  -> home and away result rows
  -> active team_registrations (including zero-match teams)
  -> tournaments.team_season_standings
  -> authenticated standings API
  -> CompetitionCenter
```

`team_season_standings` is a calculated view, not a table/materialized view.
Only `approved` reports with both scores participate. Each match contributes a
home and away row. Current implementation facts:

- win = 3 points;
- draw = 1 point;
- loss = 0 points;
- played/won/drawn/lost and goals for/against are summed;
- goal difference is goals for minus goals against;
- forfeits is hard-coded to `0`;
- ordering is points DESC, goal difference DESC, goals for DESC, then team name;
- position uses `row_number()`, so tied teams still receive distinct positions;
- only active team registrations appear, including zero-result teams;
- reports without context and non-approved reports do not count.

The API additionally filters by both caller-supplied season ID and
division-season ID and orders by the view position, agreeing with database
ordering. It does not verify that the two parameters correspond before querying;
inconsistent parameters normally yield no rows.

The UI says “Top 4 advance to playoffs.” No supporting DB rule or approved
business-rule source was found, so this is presentation behavior, not an
established Competition rule (`COMP-RULE-001`).

## 9. Player Statistics

`player_team_season_stats` aggregates identified report goals and cards by
player, team, and division-season. It exposes goals, yellow cards, direct reds,
second-yellow reds (`reason_code = '2CT'`), and total reds.

`player_card_reason_stats` groups identified cards by player, team,
division-season, card type, and reason code. Both views require non-null
`player_id`, a match report, and match context. Unresolved/manual text events
remain in Reports but disappear from relational Competition statistics.

Unlike standings, neither player-stat view filters `match_reports.status`.
Submitted, revision-required, and approved reports—and any other report row
containing events—can affect player leaders and disciplinary totals. This
contract mismatch is `COMP-STAT-001`.

Appearances, minutes, assists, clean sheets, and injuries are not calculated.
The Team Profile displays team performance, top five scorers, most cautioned,
most sent off, disciplinary reasons, and the current active registered roster.

## 10. Competition-Facing Report Contract

| Competition output | Report source | Required status |
|---|---|---|
| Standings/result | `match_reports.home_score/away_score` | `approved` only, both scores non-null |
| Goals/player leaders | `report_goals.player_id` | No report-status filter in current view |
| Card totals/leaders | `report_cards.player_id`, card type/reason | No report-status filter in current views |
| Unresolved text-only event | Report remains source | Excluded from relational player stats when `player_id` is null |

Full submission/review behavior remains owned by Match Reports documentation.

## 11. Portal Competition Flow

```text
/portal/competition -> requireUser()
  -> CompetitionCenter client component
  -> GET /api/competition/division-seasons
  -> select season/division
  -> GET /api/competition/standings
  -> click team_registration_id
  -> /portal/competition/teams/[teamRegistrationId]
  -> GET /api/competition/teams/[teamRegistrationId]
  -> standing + player stats + card reasons + active roster
```

All three APIs authenticate, then use service role to read `tournaments`.
Competition Center has loading, error, and empty states. Team Profile has
loading and error states plus empty states for leaders/roster. The standings
Refresh button sets state to its existing value, so React normally performs no
new fetch (`COMP-UI-001`).

## 12. Admin and Import Capabilities

The current application does not provide complete CRUD interfaces for
organizations, seasons, divisions, teams, registrations, or players.

- The Board-only division-seasons API is a read endpoint used by Arbiter
  import.
- Arbiter import writes `public.matches` and selects context; the trigger builds
  match context/rosters.
- `import_team_roster()` supports database-side roster ingestion, but no
  repository UI/API caller exists.
- No current application writer for structural Tournament entities was found.

How Production structural data and team rosters are operationally loaded is
therefore externally unresolved.

## 13. Authorization and Security

- Portal pages and all Competition APIs require an authenticated user.
- APIs use service role after authentication, bypassing RLS by design. They do
  not enforce Board or organization scope; any authenticated member can request
  arbitrary season/division/team-registration IDs and see available standings,
  player identity/statistics, birth-date-excluded active rosters, and team data.
  This matches an internal member-wide surface but provides no tenant isolation
  (`COMP-SEC-001`).
- The Admin division-season endpoint correctly uses `requireBoardApi()`.
- Baseline RLS enables authenticated SELECT on organizations, divisions,
  teams, players, and match rosters. Other base tables have RLS enabled without
  represented authenticated policies and are reached through service-role APIs.
- `match_roster_view` is queried directly by authenticated browser code and was
  historically flagged as SECURITY DEFINER. It exposes roster/player names for
  any known match ID and contains no identity predicate (`COMP-SEC-002`).
- `build_match_context(uuid)` is SECURITY DEFINER and baseline grants EXECUTE
  to `authenticated`. A direct RPC caller could cause context/roster
  reconciliation and append logs for a chosen match, including roster deletion
  before a report exists (`COMP-SEC-003`). Live grants require verification.
- `import_team_roster()` is SECURITY DEFINER, has PUBLIC revoked, and is granted
  only to service role in the baseline.

## 14. Multi-Organization Findings

The data model is structurally multi-organization through organization-scoped
seasons, divisions, teams, and players. Names/external player IDs are unique
within their intended scopes, and one active season is allowed per organization.

The application is effectively single-league today:

- the import UI displays “LA Municipal Soccer League” as fixed text;
- division-season APIs do not select/filter an organization;
- Portal exposes a hard-coded allowed-division name set;
- Competition APIs accept globally addressable UUIDs and use service role;
- no tenant membership/organization authorization relation was found.

Therefore schema capability must not be mistaken for enforced multi-tenancy.

## 15. Classification

| Object/capability | Status | Evidence |
|---|---|---|
| Organization/season/division tables | CURRENT | Portal/Admin option APIs and relational consumers. |
| Teams and team registrations | CURRENT | Context, standings, profiles, and import. |
| Players and player registrations | CURRENT | Profile rosters, report selection, and statistics. |
| `match_context`, logs, builder/trigger | CURRENT | Current match import and Competition joins. |
| `match_rosters`, `match_roster_view` | CURRENT | Context builder and report form. |
| Standings/player-stat views | CURRENT | Current Competition APIs. |
| Manual Arbiter tournament mapping | CURRENT | Current Board import. |
| `import_team_roster()` | UNCERTAIN | Current DB capability; no repository caller, external operation unknown. |
| `src/lib/queries/get-match-roster.ts` | LEGACY residue | Zero caller and wrong/unqualified active schema path; do not delete without approval. |
| Full Tournament administration UI | Not implemented | No evidence supports CURRENT or approved PLANNED classification. |
| Multi-tenant application isolation | Not implemented | Schema supports multiple organizations; runtime does not scope tenants. |

## 16. Known Limitations and Open Questions

- Player-stat report-status behavior differs from standings.
- Entity-level active/status flags are applied inconsistently across options,
  context building, standings, statistics, and rosters.
- Tenant isolation is absent from service-role-backed member APIs.
- Direct roster view and context-builder permissions need live verification.
- Cross-organization consistency is writer-enforced, not fully constrained.
- No temporal transfer/end model exists for player registrations.
- Match rosters can change before a report exists.
- Context failure can leave a Competition-incomplete match.
- Refresh control does not issue a refresh.
- The top-four playoff label lacks verified rule evidence.
- Structural data/roster operational loading is unknown.
- Historical audit row counts are not current live counts.

## 17. Evidence

Application:

- `src/app/(portal)/portal/competition/`
- `src/components/competition/CompetitionCenter.tsx`
- `src/components/competition/TeamProfile.tsx`
- `src/app/api/competition/`
- `src/app/api/admin/tournaments/division-seasons/route.ts`
- `src/components/admin/ImportArbiterForm.tsx`
- `src/app/api/admin/import-arbiter/import/route.ts`
- `src/components/reports/components/match-report-form/hooks/useMatchRoster.ts`
- `src/lib/queries/get-match-roster.ts`

Database:

- `supabase/migrations/20260831185011_remote_schema.sql` — repository baseline
  definitions, constraints, FKs, indexes, functions, triggers, RLS, and grants.
- `docs/audit/supabase/17-view-definitions.md`
- `docs/audit/supabase/12-database-dependencies.md`
- `docs/audit/supabase/18-tablet-row-counts.md` — historical data-presence only.
- `docs/audit/supabase/10-rls-policies.md` and
  `11-grant-and-privileges.md` — historical security evidence only.

## 18. Change Impact Checklist

Before changing Competition, verify organization scoping; hierarchy and
cross-organization invariants; permanent versus seasonal team/player identity;
context-trigger failure/retry behavior; pre/post-report roster preservation;
report-status eligibility for results and events; standings formula/order;
unresolved player events; Portal/API authorization and service role; direct
view/RPC grants; Arbiter import; Match/Report/Storage dependencies; and all
affected Source of Truth modules.
