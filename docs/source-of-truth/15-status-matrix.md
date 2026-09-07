# CAFLA Status Matrix

## Purpose

This matrix records evidence-based status classifications for modules,
capabilities, and architecture/database objects. It is not a deletion list and
does not replace the supporting module documents.

Use the definitions and evidence hierarchy in [`00-README.md`](./00-README.md).

## Matrix

| Domain / Module | Object / Capability | Layer | Status | Source of Evidence | Replacement / Direction | Notes |
|---|---|---|---|---|---|---|
| Platform | Next.js Portal, Admin, public and API surfaces | Application | CURRENT | `src/app/`, `src/proxy.ts` | — | Exact Production deployment revision remains externally unverified. |
| Identity | Supabase Auth + `public.members` | Application + database | CURRENT | Auth/member runtime; repository DB baseline | — | Live Auth trigger and post-recovery security catalog require verification. |
| Participation | `development.cycles` and `development.cycle_members` | Database tables | CURRENT | Application callers and repository DB baseline | — | Current base records; consumer interpretation remains TRANSITIONAL. |
| Matches | `public.matches` and assignment workflows | Application + database | CURRENT | `04-matches.md`; Portal/Admin routes and repository DB baseline | — | Canonical match record; authorization, assignment-history, and timezone gaps are recorded. |
| Matches | Arbiter file import, `arbiter_match_id`, and `public.arbiter_referees` | Application + database | CURRENT | `04-matches.md`; import page/API/parser/matcher | — | Manual XLS/XLSX integration; no live Arbiter API synchronization is evidenced. |
| Matches | `tournaments.match_context`, roster snapshot, and build trigger | Database | CURRENT | `04-matches.md`; repository DB baseline | — | Adds competition context; a builder failure does not roll back the match write. |
| Matches | `public.dashboard_referee_matches` | Database view | UNCERTAIN | Repository DB baseline; no repository caller found | External/database caller verification | Absence of an application caller is not retirement evidence. |
| Reports | `public.match_reports`, events, assets, review workflow, and status synchronization | Application + database | CURRENT | `05-match-reports.md`; Portal/Admin APIs and repository DB baseline | — | One Report per Match; creation/resubmission are non-transactional and Board transitions lack a strict source-state matrix. |
| Reports | `development.referee_report_detail` and `development.referee_report_score` | Database calculation views | CURRENT | `05-match-reports.md`; active Dashboard/Development callers | Canonical participation population | Population semantics are TRANSITIONAL. Any Report row satisfies completion; same-date submission supplies timeliness; approval is not required. |
| Reports | `public.report_injuries` | Application + database | TRANSITIONAL | Repository baseline, nested detail query and revision PATCH | Owner/product decision | Persistence exists, but the current create form and material consumers do not implement a complete injury workflow. |
| Reports | Approved-report email pipeline | Server application + Resend + Storage | CURRENT | Board approval API and `src/emails/services/` | — | Approval commits before delivery; no retry queue or durable delivery audit. |
| Attendance | Attendance V2 tables, views, and workflows | Application + `development` database | CURRENT | `06-attendance.md`; current Portal/Admin runtime and repository DB baseline | — | Point calculation is rule-driven; live rule values require verification. |
| Attendance | Roster/detail/write population enforcement | Application + database | TRANSITIONAL | `06-attendance.md` comparison matrix | Canonical population relation | Status and `manual_adjustment` handling disagree. |
| Quiz | Quiz V2 assessment, attempt, result, and Board workflows | Application + `development` database | CURRENT | `07-quiz.md`; current Portal/Admin runtime and repository DB baseline | — | Public Quiz V1 is RETIRED; attempt content is only partially snapshotted. |
| Quiz | Visibility/start/scoring population enforcement | Application + database | TRANSITIONAL | `07-quiz.md`; list query, start RPC, Quiz views, and monthly metric view | Canonical participation population | The four boundaries use different predicates; public member status is ignored. |
| Quiz | `development.quiz_access_grants` operational administration | Database capability | UNCERTAIN | Start RPC and member-list read; no current writer UI/API found | External operational verification | Grant windows affect starts, but management ownership is not established. |
| Evaluations | `public.evaluations` + Development evaluation detail/score | Application + database | CURRENT | `08-evaluations.md`; current evaluation runtime and repository DB baseline | — | Canonical row plus derived Quality/Compliance; `public.evaluations` is not legacy. |
| Evaluations | Crew-derived obligation and participant population | Database calculation | TRANSITIONAL | `08-evaluations.md`; detail/monthly view definitions | Canonical participation plus approved historical crew semantics | Current assignments and ranking-eligible cycle rows dynamically determine obligations. |
| Evaluations | Direct base-table update/participant visibility security | Database policy | UNCERTAIN | Repository baseline RLS/grants; `08-evaluations.md` | Live read-only verification and owner privacy decision | Current app does not expose update or received-detail UI, but baseline policies permit broader direct behavior. |
| Development | `referee_monthly_period_metric_scores_v2` and `referee_monthly_development_score_v2` | Database calculation views | CURRENT | `09-development.md`; repository DB baseline | Ranking evidence handoff | Renormalized weighted monthly score; population is applied before aggregation. |
| Development | Development participant population | Database calculation | TRANSITIONAL | `09-development.md`; monthly/source view definitions | Planned canonical population relation | `eligible_for_ranking` is applied too early and public member status is ignored. |
| Development | Scoring periods and metric weights | Database configuration | CURRENT | `development.scoring_periods`, triggers, and `09-development.md` | — | Global rather than cycle-owned; no current Admin configuration workflow found. |
| Ranking | `development.current_ranking_snapshot` | Serving table | CURRENT | Member/Admin ranking queries; repository DB baseline | — | Current snapshot refresh may retain stale rows. |
| Ranking | `development.monthly_ranking_snapshots` | Historical serving table | CURRENT | Development history query; repository DB baseline | — | Historical participation semantics must be preserved. |
| Ranking | Ranking evidence, monthly history, and current calculation views | Database calculation views | CURRENT | `10-ranking.md`; repository DB baseline | Serving snapshots | Evidence-adjusted monthly score and `RANK()` placement; no CURRENT level model found. |
| Ranking | Participant/qualification population | Database calculation | TRANSITIONAL | `10-ranking.md`; upstream monthly population | Planned canonical population relation | Ranking eligibility is applied before Development and public member status is ignored. |
| Ranking | Ranking levels and promotion/demotion | Product/database capability | UNCERTAIN | Repository and baseline searches found no CURRENT model/workflow | Owner verification | Evidence statuses are not levels. |
| Competition | Organization, season, division, team, and player relational model | Application + database | CURRENT | `12-tournaments.md`; Competition APIs and repository DB baseline | — | Schema is multi-organization; current application is effectively single-league. |
| Competition | `tournaments.match_context`, database match roster, and builder | Application + database | CURRENT | `04-matches.md`; `12-tournaments.md`; match import/report form | — | Context is conditionally required for relational Competition outputs. |
| Competition | Standings and player-statistics views | Database views | CURRENT | Competition APIs and repository DB baseline | — | Standings require approved reports; player event statistics currently do not. |
| Competition | `tournaments.import_team_roster()` | Database function | UNCERTAIN | Repository DB baseline; no repository caller found | External operational verification | Service-role-only roster import capability. |
| Competition | `src/lib/queries/get-match-roster.ts` | Application helper | LEGACY | `12a-storage-and-rosters.md`; zero caller; active path uses schema-qualified browser view | Current `useMatchRoster()` | Do not remove without separately approved cleanup. |
| Storage | Private `match-rosters` bucket and roster-file lifecycle | Supabase Storage | CURRENT | `12a-storage-and-rosters.md`; upload/query/email callers | — | Browser upload/cleanup plus server-side signing/email download; live policies require verification. |
| Storage | `public.report_assets` roster references | Application + database | CURRENT | Report create/edit/read flows and repository DB baseline | — | Metadata and Storage are non-transactional; orphan/missing-object risk is documented. |
| Storage | Public `images` bucket | Supabase Storage | CURRENT | Current absolute email-logo URLs and historical inventory | — | Live bucket configuration remains externally unverified. |
| Storage | Public `system-assets` bucket | Supabase Storage | UNCERTAIN | Historical inventory; no repository object caller found | External caller/live verification | Existence alone does not establish current use or retirement. |
| Storage | `replaceMatchRoster()` and `createMatchRosterSignedUrl()` | Application helpers | LEGACY | `12a-storage-and-rosters.md`; zero callers | Active explicit form/query lifecycle | Do not remove without separately approved cleanup. |
| Dashboard | Selected `public.dashboard_*` sources | Database views | CURRENT | Current Dashboard/Admin callers | — | Classify each view individually; prefix does not imply legacy. |
| Participation | Independently repeated participant filters | Application + database calculation layer | TRANSITIONAL | `03a-development-cycles-and-participation.md`; current view/function/query definitions | Canonical population relation | Attendance, Reports, Evaluations, Quiz, Development, and Ranking do not uniformly encode approved semantics. |
| Documentation | Source of Truth suite | Documentation | TRANSITIONAL | `docs/source-of-truth/` | Complete evidence-based module passes | Foundation and modules 01–10, 12, and 12a are substantive; remaining reviews continue. |
| Participation | `development.cycle_member_population` | Database relation | PLANNED | Approved architectural decision; absent from current baseline | — | Must not be consumed or described as CURRENT yet. |
| Participation | Consumer refactor to canonical population | Database calculation layer | PLANNED | Approved architectural direction | `development.cycle_member_population` | Applies to Attendance, Reports, Evaluations, Quiz, Development, and Ranking. |
| Reports | Withdrawn-member historical preservation correction | Database calculation layer | PLANNED | Confirmed rule versus current report-detail definition | Canonical population refactor | Must preserve evidence only within the applicable interval. |
| Ranking | Exact `current_ranking_snapshot` synchronization | Snapshot refresh | PLANNED | Current upsert-only refresh definition and approved architecture review | Explicit reconciliation semantics | Implementation details require separate approval. |
| Participation | `manual_adjustment` applicability | Business semantics | UNCERTAIN | Enum/schema evidence; no approved behavior | Owner decision | Blocks canonical implementation, not documentation. |
| Participation | Suspended-member historical boundary | Business semantics + data model | UNCERTAIN | Current status/effective-date model lacks a confirmed boundary | Owner decision | Do not invent a suspension start date. |
| Attendance | Public Attendance V1 architecture | Historical database architecture | RETIRED | Confirmed intentional retirement and V2 replacement | Attendance V2 | Do not restore from historical audit evidence. |
| Quiz | Public Quiz V1 architecture | Historical database architecture | RETIRED | Confirmed intentional retirement and V2 replacement | Quiz V2 | Do not restore from historical audit evidence. |
| Ranking | Public Ranking V1 architecture | Historical database architecture | RETIRED | Confirmed intentional retirement and V2 replacement | Ranking V2 | Do not restore from historical audit evidence. |
| Authentication | Implicit-token callback compatibility branch | Application | UNCERTAIN | `src/app/auth/callback/page.tsx` | PKCE is CURRENT | Presence in runtime does not prove active provider configuration needs it. |
| Infrastructure | Production Git/Vercel/Supabase topology | Deployment | UNCERTAIN | Git refs conflict with owner-supplied Vercel revision evidence | External verification | Do not infer deployed revision from local branch names. |
| Security | Live post-recovery RLS/grants/Auth trigger state | Database security | UNCERTAIN | Historical audit plus runtime assumptions | Read-only live verification | Historical evidence is not guaranteed current. |
| Attendance | Live V2 scoring-rule values and security configuration | Database configuration | UNCERTAIN | Schema defaults and historical catalog do not prove live row values/policies | Read-only live verification | Admin legend is not authoritative. |

## Review Metadata

- Repository baseline: `develop@5b47f15d8580687e66b0f9b6eeaccbe3bf3e19f4`.
- Baseline date: 2026-08-31.
- Review scope: foundation, System Overview, Auth/Authorization, Members,
  Development participation, Matches, Match Reports, Attendance, Quiz,
  Evaluations, Development, Ranking,
  Tournaments/Competition, Storage/Rosters, and their cross-module
  classifications.
- Next review trigger: approved module documentation pass or architecture
  change.
