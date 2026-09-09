# Storage & Rosters

## 1. Purpose and Status

This module separates three CURRENT concepts:

1. `tournaments.match_rosters`: relational players associated with a match.
2. Files in the private Supabase Storage bucket `match-rosters`.
3. `public.report_assets`: database references from a report to stored files.

They meet in Match Report UI but have different identities, authorization, and
lifecycles. **Status: CURRENT, with security and lifecycle gaps recorded.**
Live Storage configuration requires external read-only verification because
the available bucket/policy inventory is historical.

## 2. Concept and Ownership Boundary

| Concept | Canonical owner | Identity/content | Created by |
|---|---|---|---|
| Database match roster | `tournaments.match_rosters` | UUID row; player/team identity, jersey, check-in | `tournaments.build_match_context()` |
| Uploaded roster file | Storage `match-rosters` bucket | PDF/image bytes at an object path | Authenticated browser upload |
| Report asset reference | `public.report_assets` | Report ID, logical type, Storage path, timestamp | Report submit/resubmit API |

A database roster supports player selection and relational identity. An
uploaded document is evidence attached to a report. Neither proves the other
exists and there is no FK between them.

## 3. Database Match Roster

```text
team_registrations
  -> active player_registrations
  -> build_match_context(match UUID)
  -> tournaments.match_rosters
  -> tournaments.match_roster_view
  -> Report player selectors
```

`match_rosters` stores `id`, `match_id`, `player_id`, `team_id`, nullable
`jersey_number`, `checked_in` (default false), and `created_at`. Match/player/team
FKs cascade on deletion; `(match_id, player_id)` is unique.

There is no explicit home/away field. Side is inferred from `team_id` and the
registrations in `match_context`. `match_roster_view` exposes player/team
identity and name, photo, check-in, and creation time, but not jersey number.

Before any report exists, a successful context build deletes and rebuilds the
roster from currently active registrations. Once a report exists, existing
rows remain and newly active missing players can be inserted. Removed or
deactivated players remain. This is a **partially preserved/reconciled roster**,
not an immutable historical snapshot.

The active caller is browser hook `useMatchRoster()`, which queries
`tournaments.match_roster_view`. Unreferenced `getMatchRoster()` queries an
unqualified `match_rosters` and is not the current path.

## 4. Uploaded Roster File and Path Contract

The center referee uploads directly from the authenticated browser. The form
supports one `combined` file or both a `home` and an `away` file. A match must
have `arbiter_match_id`; without it, file submission is rejected even though a
database roster may exist.

```text
{arbiter_match_id}/{type}/{crypto.randomUUID()}.{extension}
```

| Segment | Values/source | Dependency |
|---|---|---|
| First folder | `public.matches.arbiter_match_id` | Historical policies resolve match and current center from it. |
| Type | `combined`, `home`, `away` | Object organization; logical DB types are separately prefixed `roster_`. |
| Filename | Random UUID | Avoids ordinary collisions; upload uses `upsert: false`. |
| Extension | Original last suffix, or MIME fallback if absent | Preview/email filename classification; not authorization. |

The path does not use canonical `public.matches.id`. Changing Arbiter ID does
not move old objects/references. The helper does not validate Arbiter ID as one
safe folder segment; an imported ID containing `/` would break the policy's
first-folder assumption (`STOR-PATH-001`).

## 5. File Validation

| Layer | Current behavior |
|---|---|
| Combined browser input | Advertises PDF, JPEG, PNG, WEBP. |
| Separate camera inputs | Use broader `image/*`; upload helper remains narrower. |
| Upload helper | MIME allowlist: PDF/JPEG/PNG/WEBP; maximum 10 MiB. |
| Extension | Original suffix takes precedence; no MIME/extension consistency check. |
| Empty file | No explicit rejection. |
| Name | Original base name discarded; random UUID generated. |
| Historical bucket | Private, 10 MiB, same four MIME types. |

The application trusts browser MIME metadata and does not inspect file magic
bytes. Storage may enforce its own configuration, but live equivalence is not
proven.

## 6. Report Asset Reference

`public.report_assets` stores nullable `report_id`, `asset_type`,
`storage_path`, and `uploaded_at`, plus UUID PK. Its represented FK is
`report_id -> public.match_reports.id ON DELETE CASCADE`.

Roster types are `roster_combined`, `roster_home`, and `roster_away`. The DB has
no type CHECK, uniqueness per report/type, or relation to `storage.objects`.
Current create flow emits at most one of each; resubmission rejects duplicate
types in its payload.

Deleting a report cascades metadata but not Storage. Deleting metadata does not
delete a file, and deleting a file does not remove metadata.

## 7. Upload, Replace, Read, and Cleanup

### Initial report

```text
center selects file -> client validation -> Storage upload
 -> POST /api/reports/submit
 -> authentication + current-center check
 -> service-role report/events/report_assets writes
 -> API failure: browser attempts rollback deletion
```

Upload precedes report creation. DB failure, lost connectivity, tab closure, or
failed rollback can leave orphan objects.

### Revision

```text
new upload -> PATCH /api/reports/[report_id]
 -> replace report_assets rows -> report becomes submitted
 -> browser best-effort deletion of replaced old paths
```

Old deletion failure is logged without reversing the DB update. New-file
rollback after PATCH failure is also best-effort. Child replacements and report
update are sequential, not one demonstrated transaction.

`replaceMatchRoster()` has no caller; active replacement is implemented in
`MatchReportForm`.

### Read

Member and Board report-detail queries filter roster types and create signed
URLs for 600 seconds with the cookie-scoped client. Failed signing removes the
usable preview URL. Approval email instead downloads file bytes server-side
with service role.

The generic match detail reads raw asset rows, while `MatchAssets` expects a
nonexistent `file_path` image field rather than `storage_path` plus signed URL;
it is not the authoritative roster preview (`STOR-UI-001`).

### Cleanup matrix

| Event | Metadata | Storage object |
|---|---|---|
| Successful replacement | Replaced by PATCH | Old path deleted best-effort in browser |
| Failed submit/update | Absent or potentially partially changed | New paths deleted best-effort |
| Report/Match deletion | Metadata cascades | No cleanup found |
| Asset-row deletion | Removed | No cleanup found |
| Arbiter ID change | Unchanged | Remains under old folder |
| Center change | Unchanged | Policy access follows new current center |

No orphan reconciliation job, trigger, or webhook was found.

## 8. Bucket Inventory

| Bucket | Classification | Repository evidence | Historical configuration |
|---|---|---|---|
| `match-rosters` | CURRENT USED BY APPLICATION | Upload, signing, deletion, email download | Private; 10 MiB; PDF/JPEG/PNG/WEBP; center/Board policies |
| `images` | CURRENT USED BY APPLICATION | Public absolute CAFLA logo in two email layouts | Public; no recorded size/MIME limits |
| `system-assets` | UNCERTAIN | No repository object caller found | Public; no recorded size/MIME limits |

Local `/images/...` paths are Next.js public files, not Supabase bucket usage.
The commented example in `supabase/config.toml` does not version live buckets.

## 9. Authorization Matrix

Represented historical intent, not a claim about live Production:

| Operation | Center | AR1/AR2 | Board | Other authenticated | Anonymous | Enforcement |
|---|---|---|---|---|---|---|
| Upload file | Yes, matching Arbiter folder | No | Yes | No | No | Storage INSERT policy |
| View/sign | Yes | No | Yes | No | No | Storage SELECT policy |
| Update/delete file | Yes | No | Yes | No | No | Storage UPDATE/DELETE policies |
| Read DB match roster | Broad authenticated view access | Same | Same | Same | Historical grants uncertain | `match_roster_view` |
| Insert asset metadata | Center for report match | No | Policy-dependent | No | No | DB RLS; create API uses guarded service role |
| Select metadata | Submitter | No | Yes | No | No | `report_assets` RLS |
| Delete metadata | Baseline `USING (true)` | Same | Same | Same | Potentially, subject to grants | Overbroad DB policy |

Storage authorization follows mutable current center assignment and the
external-ID folder, not canonical match/report ownership or report state.

## 10. Signed URLs

`getMatchForReport()` and `getReportDetails()` sign server-side using the
caller's Supabase session for ten minutes. Exported
`createMatchRosterSignedUrl()` has the same default but no caller.

Authorization occurs when the URL is created; possession then grants access
until expiry without another application check, which is expected behavior.
Paths come from DB metadata, but report APIs initially accept those strings
from the client without verifying match folder, uploader, existence, or
path/type agreement (`STOR-SEC-001`).

## 11. Report-State Interaction

- Upload may occur before a report exists because Storage policy checks match
  and center, not report state.
- UI permits create with no report, edit only in `revision_required`, and read
  for submitted/approved states.
- Resubmission replaces metadata and returns report to `submitted`.
- Historical Storage policies do not enforce report lifecycle.
- A center reassignment transfers folder access to the new center while report
  author/reference remain unchanged.

## 12. Security Findings

- `STOR-SEC-001`: create/edit APIs trust client-provided `storage_path`; logical
  type and non-empty text are insufficient to prove ownership/association.
- `STOR-SEC-002`: baseline `report_assets` DELETE policy is `USING (true)`, much
  broader than select/insert/update. Live policy/grants need verification.
- `STOR-SEC-003`: Storage policies depend on mutable `arbiter_match_id` folder
  and current center, not canonical UUID, report ownership, or state.
- `ROSTER-SEC-001`: direct browser `match_roster_view` access has no
  match/assignment predicate; this overlaps `COMP-SEC-002`.

No unauthenticated upload or signed-URL application route was found.

## 13. Cross-Module Map

```text
Relational roster
player_registrations -> build_match_context()
 -> match_rosters -> match_roster_view -> Report player selection

File evidence
match.arbiter_match_id + current center
 -> match-rosters/{Arbiter ID}/{type}/{UUID}.{ext}
 -> report_assets.storage_path
 -> signed URL OR Board approval-email download
```

They share a match-facing UI but no transaction, FK, or reconciliation.

## 14. Classification

| Artifact | Status | Basis |
|---|---|---|
| `match_rosters`, `match_roster_view` | CURRENT | Builder plus report-form caller. |
| Player/team/context inputs | CURRENT | Source of relational roster. |
| `match-rosters` bucket | CURRENT | Active file lifecycle. |
| `report_assets` roster metadata | CURRENT | Create/edit/read/email contract. |
| `images` bucket | CURRENT | Current email-logo URLs. |
| `system-assets` bucket | UNCERTAIN | Historical existence, no repo caller. |
| `getMatchRoster()` | LEGACY residue | Zero caller and unqualified schema path. |
| `replaceMatchRoster()` | LEGACY residue | Zero caller; active form duplicates lifecycle. |
| `createMatchRosterSignedUrl()` | LEGACY/duplicate residue | Zero caller; query helpers sign directly. |
| Historical Storage policies | UNCERTAIN live state | Point-in-time evidence only. |

No deletion is authorized by these classifications.

## 15. Open Questions and External Verification

- Verify live bucket flags, limits, MIME rules, object policies, grants, and
  `match_roster_view` behavior.
- Measure orphan/missing-reference counts without exposing contents.
- Confirm access semantics after center/Arbiter ID changes.
- Confirm approved report-state rules and whether AR1/AR2 may view files.
- Decide whether zero-byte/content validation is required.
- Determine external `system-assets` consumers.
- Resolve obsolete generic Match asset rendering separately.

## 16. Evidence

Application: `src/lib/storage/match-rosters.ts`, `MatchReportForm.tsx`,
`MatchRosterAttachmentSection.tsx`, `useMatchRoster.ts`, report submit/PATCH
routes, `src/lib/queries/reports.ts`, `get-report-details.ts`,
`get-match-roster.ts`, roster display components, and report email services.

Database/Storage: repository baseline migration; historical
`docs/audit/supabase/16-storage.md`, constraints, FKs, RLS policies, grants,
and view definitions.

## 17. Change Impact Checklist

Before changing this module, verify roster reconstruction/preservation;
context triggers; path/policy coupling; center and Arbiter ID changes; report
states; DB/Storage compensation; signed URLs/email delivery; RLS/grants;
orphan retention; validation; crew/Board access; and Matches, Competition,
Reports, and Auth documentation.
