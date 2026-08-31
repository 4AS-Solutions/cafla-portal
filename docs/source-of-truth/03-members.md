# Members

## 1. Purpose

Members owns the CAFLA application profile and the shared application identity
used by Portal, Admin, matches, attendance, quizzes, reports, evaluations,
Development, and Ranking. Credentials and sessions remain owned by Supabase
Auth.

## 2. Status

**CURRENT**

`public.members` is the authoritative application member table used by current
runtime. `development.cycle_members` represents a member's participation and
eligibility within a Development cycle; it does not replace the member profile.

## 3. User-Facing Surfaces

### Member/onboarding

- `/complete-profile` collects password, phone, USSF ID, and grade for an
  authenticated invited user.
- Portal layout reads the member profile to determine onboarding/access state.
- Current runtime has no general self-service profile editing page beyond the
  invitation completion flow.

### Board/Admin

- `/admin/members` — paginated/searchable/filterable directory and invite UI.
- `/admin/members/[member_id]` — identity/referee details, V2 metric summary,
  and activity.
- `/admin/members/[member_id]/edit` — profile, role, and status editor.
- `/api/admin/members/invite` — Auth invitation plus Development enrollment.
- `/api/admin/members/update` — member and cycle-membership update.

## 4. Application Implementation

- `getProfile()` resolves the current Auth user and their member profile.
- `getMembers()` provides Board directory search, role/status filters,
  pagination, and newest-first ordering through the user-scoped server client.
- `getAllMembers()` returns active member IDs/names for selectors.
- `getMemberById()` returns a full member row for detail/edit pages.
- `getMemberDashboard()` composes Development V2 metrics and current activity
  for Admin Member Detail; detailed scoring belongs to later modules.
- `InviteMemberDialog` submits email, full name, and enrollment type.
- `EditMemberForm` submits profile, role, and status changes.

Evidence:
- `src/lib/queries/get-profile.ts` — `getProfile()`
- `src/lib/queries/get-members.ts` — `getMembers()`
- `src/lib/queries/getAllMembers.ts` — `getAllMembers()`
- `src/lib/queries/get-member-by-id.ts` — `getMemberById()`
- `src/lib/queries/get-member-dashboard.ts` — `getMemberDashboard()`
- `src/components/members/InviteMemberDialog.tsx`
- `src/components/members/EditMemberForm.tsx`

## 5. Data Model

### `public.members`

Architecturally significant fields verified in runtime and historical schema
evidence include:

- `id` — UUID primary key and application identity;
- `full_name`, `email` — required identity/display fields; email is unique;
- `role` — `member_role`, default `member` in historical evidence;
- `status` — `member_status`, default `invited` in historical evidence;
- `phone`, `ussf_id`, `grade`, `category`, `years_in_cafla` — referee/profile
  attributes used by onboarding/Admin;
- `created_at` — directory/detail chronology;
- `notes` — operational notes, including profile-completion text in current
  onboarding code.

The application validates roles `member` and `board`. It validates statuses
`invited`, `active`, `inactive`, and `suspended`. Historical enum evidence
contains the same values.

### `development.cycle_members`

This table links `member_id` to `cycle_id` and records:

- effective date range;
- enrollment type (`existing_member`, `new_member`, or historically
  `manual_adjustment`);
- cycle-member status (`active`, `withdrawn`, `ineligible`);
- `eligible_for_ranking`;
- audit/notes fields.

Historical constraints enforce one row per `(cycle_id, member_id)` and an
effective end date not earlier than the start date.

Database evidence:
- `docs/audit/supabase/04-columns.md`
- `docs/audit/supabase/05-constraints.md`
- `docs/audit/supabase/06-foreign-keys.md`
- `docs/audit/supabase/15-enums-and-custom-types.md`

## 6. Data Ownership

Members owns:

- the CAFLA application profile;
- application role and account/member status;
- referee identity/profile attributes.

Members consumes:

- Supabase Auth UUID/email/session during onboarding and access checks;
- active Development cycle context when inviting or editing members.

Downstream modules consume `members.id` and display identity. Historical FK
evidence shows member references from current Development cycle/attendance/
quiz/snapshot infrastructure, public matches, reports, evaluations, and other
operational tables. Exact lifecycle behavior belongs to the owning modules.

## 7. Business Rules

No member role limit or status-transition policy is independently confirmed as
a BUSINESS RULE in this phase.

The following are IMPLEMENTATION FACTS:

- Admin update accepts only `member`/`board` and the four member statuses.
- Admin update refuses promotion to Board when five other Board rows exist.
- Admin invite requires an active Development cycle and one of
  `existing_member`/`new_member`.
- Invite enrolls the member as active and ranking-eligible in that cycle.
- Portal access requires member status `active`; `invited` routes to profile
  completion, while other statuses route to login.

These behaviors must not be promoted to approved business policy without CAFLA
confirmation.

## 8. Runtime Flow

### Board invitation

1. Board submits email, full name, and enrollment type.
2. The API verifies Board access and resolves the most recent active cycle.
3. Service-role calls `inviteUserByEmail()` with `full_name` metadata.
4. Runtime expects database-side behavior to create `public.members` with the
   same UUID.
5. The API inserts `development.cycle_members` with CAFLA local effective date,
   active status, and ranking eligibility.
6. If enrollment fails after Auth invitation, the endpoint returns the partial
   state; it does not claim full success.

### Profile completion

1. Auth callback establishes the invited user's session.
2. `/complete-profile` posts password and referee profile fields.
3. The API validates the Auth user, updates their password, and updates the
   member row where `id = user.id` to `status = active`.
4. Portal layout then admits the active member.

### Board directory/detail/edit

1. Admin pages require Board access.
2. Directory reads `public.members`; detail also composes V2 metric/activity
   sources.
3. Edit API validates Board access, role/status inputs, active cycle, and
   existing cycle enrollment.
4. It first maps member status to cycle-member state, then updates the member
   profile.

Current implementation mapping:

| Member status | Cycle-member status | Ranking eligible | Effective end |
|---|---|---:|---|
| `active` | `active` | true | cleared |
| `inactive` | `withdrawn` | false | current Los Angeles date |
| `suspended` | `ineligible` | false | unchanged/open |

`invited` skips cycle-state synchronization in the update route. This table is
an IMPLEMENTATION FACT, not a confirmed BUSINESS RULE.

## 9. Authorization & Security

- Admin member pages use `requireBoard()` and also inherit the Admin layout.
- Invite/update handlers call `requireBoard()` before service-role access.
- The profile-completion handler uses a user-scoped server client and restricts
  the update target to `id = authenticated user.id`.
- `GET /api/admin/members` and `/api/admin/members/all` do not call a Board
  guard and rely on current-session RLS behavior.
- Historical evidence shows `public.members` RLS enabled with self-select,
  self-update, Board-select-all, and Board-update-all policies.

**UNCERTAIN SECURITY RISK:** if the historical self-update policy and broad
authenticated UPDATE grant remain live without column restrictions, sensitive
fields such as role/status may be self-modifiable through direct Data API use.
Live post-recovery verification is required.

## 10. Time & Timezone Rules

Invitation and inactive-status cycle updates derive `effective_from` or
`effective_until` using `America/Los_Angeles`. This is an IMPLEMENTATION FACT.
The governing business policy and boundary-time semantics belong to the future
Development audit.

## 11. Dependencies

- Supabase Auth user UUID -> `public.members.id`.
- `public.members.id` -> `development.cycle_members.member_id`.
- Cycle membership -> Attendance, Quiz, Development, and Ranking eligibility
  context.
- Member IDs -> match referee assignments, report submitters, evaluation
  evaluator/evaluated identity, and ranking snapshots.
- Admin Member Detail consumes `development.current_ranking_snapshot`, current
  metric views, and `public.dashboard_referee_activity` but does not own them.

## 12. CURRENT vs Historical/Retired

No separate member architecture is confirmed RETIRED by this phase. Historical
FK evidence includes objects retired after the audit snapshot; their presence
does not make those objects current and does not change `public.members` status.

Comments referring to “Members V2” describe the current invite/cycle enrollment
path, but naming alone is not a separate status classification.

## 13. Known Limitations / Technical Debt

- **KNOWN LIMITATION:** invitation can leave an Auth invitation/member state
  without Development enrollment; the handler reports this partial result but
  does not provide a transaction across Auth and PostgreSQL.
- **KNOWN LIMITATION:** Admin update writes `cycle_members` before `members` in
  separate operations. A later member update failure can leave cross-table
  state partially synchronized.
- **KNOWN LIMITATION:** any Admin member edit requires an active Development
  cycle, including edits to profile fields, role, or status.
- **KNOWN LIMITATION:** the current directory UI omits `suspended` from its
  rendered filter options and `MembersTable` has no suspended-status badge,
  although the edit route/runtime enum supports it.
- **KNOWN LIMITATION:** member/query/component types use `any` or local partial
  contracts because generated Supabase typing is incomplete.
- **KNOWN LIMITATION:** there is no general self-service profile editor in
  current routes; only invitation completion is implemented.

## 14. Open Questions

- Is five Board members an approved CAFLA BUSINESS RULE or only current endpoint
  behavior? No matching DB constraint was identified in the historical evidence.
- Is automatic `public.members` creation from `auth.users` currently backed by
  the expected live trigger?
- Should all member profile edits require an active Development cycle?
- Are member-status-to-cycle-status mappings approved business policy?
- Should an invited user's cycle enrollment become active/ranking-eligible
  before profile completion?
- Are self-update RLS policies column-restricted in the live database?
- Are the two unguarded member-list API endpoints intentionally reusable outside
  Board UI?

## 15. Evidence

Evidence:
- `src/app/api/admin/members/invite/route.ts` — `POST`
- `src/app/api/admin/members/update/route.ts` — `POST`
- `src/app/api/auth/complete-profile/route.ts` — `POST`
- `src/app/(admin)/admin/members/page.tsx` — `MembersPage`
- `src/app/(admin)/admin/members/[member_id]/page.tsx`
- `src/app/(admin)/admin/members/[member_id]/edit/page.tsx`
- `src/components/members/MembersTable.tsx`
- `src/components/members/EditMemberForm.tsx`
- `src/app/(portal)/portal/layout.tsx`

Database:
- `public.members` — table — CURRENT
- `public.member_role` — enum — CURRENT in runtime; historical DB evidence
- `public.member_status` — enum — CURRENT in runtime; historical DB evidence
- `development.cycle_members` — table — CURRENT
- `development.enrollment_type` — enum — CURRENT in invite/runtime
- `development.cycle_member_status` — enum — CURRENT in update/runtime
- `public.handle_new_user()` — function — current trigger caller UNCERTAIN

## 16. Change Impact Checklist

Before changing Members, review Auth identity/profile creation, invitation
partial states, Portal status gating, Board-role authorization, RLS/grants,
active-cycle assumptions, cycle-member mapping and eligibility, Los Angeles
date boundaries, match/report/evaluation foreign keys, Development/Ranking
consumers, and Admin list/detail/edit behavior.

