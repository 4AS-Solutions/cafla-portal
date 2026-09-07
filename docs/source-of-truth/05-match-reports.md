# Match Reports

## 1. Purpose and boundary

Match Reports record the Center referee's account of a completed Match: result,
goals, cards, comments and roster-file references. Board users review that
record. Approved results feed Competition standings; report existence and
timeliness feed Development V2.

The canonical Match remains `public.matches`. The canonical Report is the
single optional `public.match_reports` row whose `match_id` points to that
Match. A Match without a Report is not a `pending` Report row in the normal
application flow.

Storage bytes and relational Competition rosters are separate contracts; see
[`12a-storage-and-rosters.md`](./12a-storage-and-rosters.md).

## 2. Status

**CURRENT**, with **TRANSITIONAL** Development-population behavior and known
security/consistency gaps.

Current Portal, Admin, Dashboard, Development and Competition runtime all use
the objects documented here. CURRENT does not mean that every implemented
behavior is an approved business rule.

## 3. User-facing surfaces

| Audience | Surface | Responsibility |
|---|---|---|
| Member | `/portal/reports` | Past Center assignments, derived pending state and submitted reports |
| Center | `/portal/reports/[match_id]` | Create, read, or correct a revision-required Report |
| Member | `/portal/matches` and Match detail | Show Report state/result/timeline |
| Member | `/portal` | Show Report Development score and pending-report dashboard data |
| Member | `/portal/development` | Report metric detail and contribution |
| Board | `/admin/reports` | List past matches and Report state |
| Board | `/admin/reports/[match_id]` | Inspect Report, assets and events; approve or request revision |
| Board | `/admin/members/[member_id]` | Show current-cycle Report percentage |
| Competition | Competition standings/team surfaces | Consume approved result and player event aggregates |

## 4. Ownership and data model

### 4.1 Match versus Match Report

| Concern | Owner | Important fields / constraints |
|---|---|---|
| Assignment and scheduled event | `public.matches` | `id`, teams, officials, `kickoff_at`, `report_status` |
| Submitted account | `public.match_reports` | UUID `id`; nullable FK `match_id`; nullable FK `submitted_by`; `UNIQUE(match_id)` |
| Result | `public.match_reports` | nullable integer `home_score`, `away_score` |
| Narrative | `public.match_reports` | nullable `comments` |
| Workflow | `public.match_reports` | `status public.report_status`, `revision_notes` |
| Time | `public.match_reports` | timezone-less `submitted_at`, `created_at` |
| Goals | `public.report_goals` | FK `report_id ON DELETE CASCADE` |
| Cards | `public.report_cards` | FK `report_id ON DELETE CASCADE`; `reason_code` FK to `public.card_reasons.code` |
| Injuries | `public.report_injuries` | FK `report_id ON DELETE CASCADE`; DB/PATCH support but no current form input |
| Roster references | `public.report_assets` | FK `report_id ON DELETE CASCADE`; `asset_type`, `storage_path` |

The FK from `match_reports.match_id` uses `ON DELETE CASCADE`; deleting a Match
therefore removes its Report and child metadata rows through their own cascade.
That database cascade does not remove Storage objects.

The schema permits nullable `match_id`, `submitted_by`, scores, child
`report_id` values and many event fields. The current create API supplies the
central relationships and calculated scores, but schema nullability is broader
than the application contract.

### 4.2 Status enum

`public.report_status` contains `pending`, `submitted`, `revision_required` and
`approved`. `public.matches.report_status` defaults to `pending`.
`public.match_reports.status` defaults to `submitted`. The current create API
also explicitly inserts `submitted`; it does not create a draft/pending Report.

## 5. Current lifecycle

| From | Action | To | Current enforcement |
|---|---|---|---|
| Match with no Report | Center submits form | `submitted` | API authenticates and revalidates current Center; unique match constraint prevents a second Report |
| `submitted` | Board approves | `approved` | Board API guard; no source-state restriction except duplicate approved request handling |
| `submitted` | Board requests revision with notes | `revision_required` | Board API guard; notes required |
| `revision_required` | current Center corrects/resubmits | `submitted` | PATCH requires visible Report with this status; RLS/current assignment govern child/report writes |
| `revision_required` | Board approves directly | `approved` | Technically supported by the Board API |
| `approved` | Board requests revision | `revision_required` | Technically supported; API does not restrict the source state |

The member page uses `create` when no Report exists, `edit` only for
`revision_required`, and `read` for every other state. Submitted and approved
Reports are therefore read-only to the member. No Report DELETE endpoint,
reopen endpoint, draft-save flow or general Board data editor was found.
`UNIQUE(match_id)` prevents multiple Reports per Match.

## 6. `matches.report_status` synchronization

`public.trg_sync_match_report_status` runs `AFTER INSERT OR UPDATE OF status`
on `public.match_reports`. Its SECURITY DEFINER function
`public.sync_match_report_status()` copies `NEW.status` to the associated
`public.matches.report_status`.

| Event | Report effect | Match effect |
|---|---|---|
| New Match | no Report row | Match defaults to `pending` |
| Report insert | `submitted` | trigger sets Match to `submitted` |
| Board revision | `revision_required` | trigger sets Match likewise |
| Resubmission | `submitted` | trigger sets Match likewise |
| Approval | `approved` | trigger sets Match likewise |

The create API additionally writes `matches.report_status = submitted` after
inserting all children. This is redundant with the trigger and creates another
failure boundary. No DELETE trigger resets `matches.report_status`; deleting a
Report independently could leave a stale Match state. Direct writes can also
create divergence. Live trigger presence requires external verification.

## 7. Creation and result behavior

`POST /api/reports/submit` authenticates, loads the Match with service role,
requires the caller to be the current Center, rejects an existing Report,
counts goal rows by `team`, inserts the Report and children sequentially, then
explicitly updates the Match state.

Payload `home_score` and `away_score` are ignored. The result is one point per
goal row. `own_goal` does not reverse the side automatically; selected `team`
controls the score. Client validation requires minutes 1 through 90. No
corresponding database score/minute check was found.

Revision PATCH recalculates result from the replacement goal array. Result and
events can change while revision is required. Board can first return an
approved Report to revision, making it editable again.

## 8. Goals

`public.report_goals` stores `report_id`, side, optional `player_id`, copied
player name/number, minute, half, `goal_type` (`normal`, `penalty`, `own_goal`)
and creation time. A roster selection supplies UUID plus copied display data;
manual entry produces `player_id = NULL`.

Events are ordered by minute in application mapping; no uniqueness or database
ordering contract exists. Resubmission deletes all existing goals and inserts
the supplied list: this is full replacement, not row-level editing.

## 9. Cards and card reasons

`public.report_cards` stores side, optional player UUID, copied name/number,
minute, `public.card_type`, required `reason_code`, notes and creation time.
`reason_code` references unique `public.card_reasons.code`. The catalog exposes
code, label, optional description and card type; the browser reads it directly.

Client validation requires notes for red cards. `useAutoSecondYellow()` can add
a red representation after two yellows. Competition treats reason `2CT` as a
second-yellow red and other red reasons as direct reds. Exact live catalog rows
are external data. Cards use the same full-replacement lifecycle as goals.

## 10. Player resolution and historical identity

The form reads `tournaments.match_roster_view` through
`useMatchRoster(match.id)`. `player_id` is optional. Unresolved/manual players
remain visible through copied text in Report UI and email, but Competition
statistics exclude them because those views require non-null `player_id` and
successful joins to current Tournament relations.

Events do not FK to `tournaments.match_rosters` or `player_registrations`.
Later roster changes do not rewrite copied text but can affect relational
resolution. Historical identity stability is therefore partial.

## 11. Deadline, timeliness, completion and approval

| Concept | Current implementation |
|---|---|
| Obligation | Past Match where eligible cycle member is Center inside implemented date bounds |
| Completion | Any `match_reports` row; status is not inspected |
| Timeliness | LA-converted `submitted_at` date equals `kickoff_at::date` |
| Points | 1 for same-calendar-date submission; otherwise 0 |
| Approval | Workflow and Competition-standing gate; not required by Development Report score |

There is no implemented N-hour deadline in Development V2.
`dashboard_pending_reports` defines pending as a past Match with no Report.
`getReports()` likewise maps absence of a row to UI status `pending`.

Resubmission does not update `submitted_at`, so timeliness remains based on the
original submission. No `approved_at` exists. Both stored timestamps are
timezone-less; the view treats `submitted_at` as UTC but casts `kickoff_at`
directly to date. This inherits `MATCH-TIME-001`.

## 12. Center authorization

| Capability | Center | AR1/AR2 | Board | Other member |
|---|---:|---:|---:|---:|
| Create | Current assigned Center | No | No member API path | No |
| View member Report | Submitter under RLS | No evidenced access | Yes | No |
| Edit/resubmit | Only revision-required, subject to current RLS/assignment | No | No data editor | No |
| Attach roster | Current Center | No | Historical policy permits; no Board upload UI | No |
| Review state | No | No | Yes | No |

Creation uses service role after explicit authentication and Center validation;
the server controls `submitted_by`. Resubmission uses the session client and
has no explicit `getUser()` or Center comparison, relying on RLS plus its status
precheck. Baseline policies combine submitter, current Center and status.

After Center reassignment, the original submitter may be unable to correct a
revision while the new Center is not `submitted_by`.

## 13. Board workflow

Both Admin pages call `requireBoard()`; the mutation endpoint independently
calls `requireBoardApi()`. Board can list and inspect Reports, view assets,
approve, or request revision with mandatory notes. No Board Report deletion,
direct result/event editor, reopen action or revision-notification email was
found. Status mutation uses the Board session client plus RLS, not service role.

## 14. Roster assets

The form requires one `roster_combined` or both `roster_home` and
`roster_away`. Browser upload precedes the Report API. Revision sends the final
asset list; the route replaces metadata and the browser then best-effort deletes
old objects. Board viewing uses ten-minute signed URLs. Approval email downloads
available assets with service role. Full Storage behavior is authoritative in
`12a-storage-and-rosters.md`.

## 15. Approved-report email

```text
Board PATCH
-> persist approved
-> trigger synchronizes Match
-> sendApprovedReportNotification(reportId)
-> service-role Report lookup and Storage downloads
-> Board-session detail query
-> Resend to REPORT_EMAIL_TO
```

The email includes Match, officials, result, events, comments, resolved card
labels and successfully downloaded roster files. Its recipient is one
environment-configured address, not the submitter.

Approval succeeds even if Storage preparation or Resend fails. Failed
attachments are omitted after logging. No persisted delivery record, retry
queue or resend action exists. Already-approved requests are short-circuited,
which prevents a simple retry after email failure; concurrent approval requests
could both observe a non-approved state and send duplicates.

## 16. Dashboard dependencies

- `src/lib/queries/dashboard.ts` reads `public.dashboard_pending_reports`,
  which returns past assigned matches with no Report. It includes Center, AR1
  and AR2 assignments, though only Center can submit.
- `/portal/reports` directly lists past Center assignments and derives pending
  from missing Report.
- Match lists consume nested Report state/result or `matches.report_status`.
- `/portal` and Admin Member Detail read
  `development.referee_report_score`.

Revision-required is not a missing Report; Report/match queries expose it as a
separate state.

## 17. Development V2 dependency

```text
development.cycle_members
+ public.matches (Center assignments)
+ public.match_reports
-> development.referee_report_detail
-> development.referee_report_score
-> referee_monthly_period_metric_scores_v2
-> monthly Development score
-> ranking evidence/history/current calculation
-> ranking snapshot serving tables
```

Current detail requires active cycle-member status, ranking eligibility, a
Center assignment, date inclusion and past kickoff. It does not inspect
`public.members.status`, Match status, Report status or approval. Any Report row
satisfies completion; missing and late Reports score zero.

This population is TRANSITIONAL under `POP-001`, `POP-002` and `REP-001`:
invited members can accrue obligations, ranking-ineligible Development
participants are excluded, withdrawn members lose history, and existing-member
start semantics are not canonical.

## 18. Competition dependencies

`tournaments.team_season_standings` requires an approved Report with non-null
scores and resolvable `match_context`. By contrast,
`player_team_season_stats` and `player_card_reason_stats` aggregate events
without filtering Report status. Submitted or revision-required events can
therefore affect player statistics before approval (`COMP-STAT-001`). Only
non-null, resolvable player UUIDs participate.

## 19. Representative historical cases

| Case | Current behavior |
|---|---|
| No Report | Match/UI pending; past eligible Center obligation is missing |
| Submitted on time | Match submitted; one point regardless of approval |
| Submitted late | Report exists; zero points; late means different calendar date |
| Revision required | Match synchronized; Center UI editable; Development still counts submitted |
| Resubmitted | Children replaced, status submitted, notes cleared; original submission time retained |
| Approved | Member read-only; standings use result; email separately attempted |
| Roster assets | Metadata belongs to Report; bytes remain separate |
| Unresolved event player | Visible by text; excluded from Competition player aggregates |
| Later-withdrawn Center | Current Development detail excludes all that member's history |
| Center reassigned | Immutable submitter and current assignment diverge; correction may be blocked |

No immutable assignment history, review-event history, approval timestamp or
email-delivery audit was found.

## 20. Transaction boundaries and partial failures

| Operation | Atomic? | Partial-failure consequence |
|---|---:|---|
| Report + goals/cards/assets | No | Report can exist with incomplete children |
| Resubmission replacement | No | Deletes can precede failed inserts; child tables can represent different payload versions |
| Children + main resubmission | No | Children can change while Report remains revision-required |
| Report + Match state | Trigger follows Report statement; explicit create update is separate | Redundant update/failure ambiguity or direct-write divergence |
| Storage + metadata | No | Orphan object or missing object reference |
| Approval + email | Deliberately no | Report remains approved after delivery failure |

Creation bypasses RLS with service role after its Center check. Goal/card rows
receive less server validation than the client form and that client validation
can be bypassed.

## 21. Security findings

- **REPORT-SEC-001 — CURRENT:** create uses service role and trusts event
  contents after only partial server mapping/validation.
- **REPORT-SEC-002 — CURRENT:** resubmission has no explicit authentication and
  Center/owner comparison; it depends on RLS and behaves ambiguously after
  reassignment.
- **REPORT-SEC-003 — NEEDS LIVE VERIFICATION:** baseline DELETE policies for
  child tables use `USING (true)` with broad authenticated grants.
- **REPORT-SEC-004 — CURRENT:** arbitrary client-supplied `storage_path` can be
  persisted and later downloaded with service role (`STOR-SEC-001`).
- Report detail authorization depends on session RLS and overlaps the broader
  `MATCH-SEC-001` audience issue. No unguarded Board mutation endpoint was
  found; pages and API have independent guards.

## 22. Classification inventory

| Artifact | Classification | Reason |
|---|---|---|
| `public.match_reports` | CURRENT | Canonical Report record |
| `public.report_goals`, `report_cards`, `report_assets` | CURRENT | Active create/read/edit/email/Competition paths |
| `public.card_reasons` | CURRENT | Active form/email source |
| `public.report_injuries` | TRANSITIONAL | DB/query/PATCH support but no current form input/material consumer |
| Match status sync trigger/function | CURRENT | Active presentation synchronization |
| Development Report views | CURRENT with TRANSITIONAL population | Active metric/ranking path |
| `public.dashboard_pending_reports` | CURRENT | Active Dashboard query |
| Approved-report email services | CURRENT | Called on Board approval |
| Competition result/stat views | CURRENT with known mismatch | Active Competition APIs |
| Withdrawn-history correction | PLANNED | Approved but not implemented |

No Report object is classified for retirement here.

## 23. Known gaps and questions

- `REPORT-TIME-001`: confirm whether same-calendar-day is the approved deadline.
- `REPORT-LIFE-001`: no formal Board source-state transition invariant.
- `REPORT-AUDIT-001`: no approval/review/email timestamps, actors or delivery log.
- `REPORT-TXN-001`: create/resubmit are non-transactional multi-write flows.
- `REPORT-ASSIGN-001`: reassignment makes revision ownership ambiguous.
- `REPORT-INJ-001`: injury persistence exists without a complete current UI flow.
- `REP-001`: withdrawn/ranking-ineligible Development history mismatch.
- `COMP-STAT-001`: events feed statistics before approval.
- `MATCH-TIME-001` and Storage gaps remain cross-module dependencies.

## 24. External verification required

Read-only Production evidence is required for current schema, enum, constraints,
trigger, RLS/grants, card-reason catalog, external Report writers, timestamp
storage convention, view definitions, inconsistent statuses, actual state/row
distributions and orphan/missing Storage references. Historical row counts are
not current Production evidence.

## 25. Evidence

Application:

- `src/app/api/reports/submit/route.ts`
- `src/app/api/reports/[report_id]/route.ts`
- `src/app/api/admin/reports/[id]/route.ts`
- `src/lib/queries/reports.ts`, `get-reports.ts`, `get-reports-admin.ts`
- `src/lib/queries/get-report-details.ts`
- `src/components/reports/MatchReportForm.tsx`
- `src/emails/services/send-approved-report-notification.ts`
- `src/emails/services/get-report-attachments.ts`
- `src/lib/queries/get-user-report-detail.ts`, `get-user-report-score.ts`
- `src/lib/queries/dashboard.ts`

Database:

- `supabase/migrations/20260831185011_remote_schema.sql`
- historical catalog under `docs/audit/supabase/`
- Report tables, `public.sync_match_report_status()`, Development Report views,
  and Tournament standing/player-statistic views identified above

## 26. Change impact checklist

Before changing Match Reports, verify Center reassignment, Board transitions,
database/Storage recovery, status synchronization, original/resubmission time,
LA timezone, Competition approval filters, Development population/history,
email idempotency/audit, RLS/service-role boundaries and Source of Truth updates.
