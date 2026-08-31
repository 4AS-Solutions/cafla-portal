# Authentication and Authorization

## 1. Purpose

This module documents current Supabase Auth integration, session handling,
application authorization, database RLS boundaries, privileged access, and the
mapping from Auth identity to CAFLA member identity.

## 2. Status

**CURRENT**

Supabase Auth, cookie-backed server validation, member profile lookup, and the
`member`/`board` application-role model are active runtime dependencies.
CURRENT does not mean every API route has uniform authorization.

## 3. User-Facing Surfaces

- `/login` — email/password sign-in.
- `/forgot-password` — neutral-response recovery request.
- `/auth/callback` — PKCE or implicit-token session establishment.
- `/reset-password` — recovery-session validation and password replacement.
- `/complete-profile` — invited-user password/profile completion.
- Portal/Admin layouts — authenticated and role-gated surfaces.
- `UserMenu` — browser sign-out.

## 4. Application Implementation

### Supabase clients

| Client | Runtime | Credential | Responsibility |
|---|---|---|---|
| `supabase` / `createClient()` | Browser | public URL + anon key | Browser Auth state, login/logout/recovery, and RLS-scoped data access. |
| `supabaseServer()` | Next.js server | public URL + anon key + request cookies | Authenticated server queries under the current user session; cookie refresh/write where supported. |
| `getSupabaseAdmin()` | Server only | service-role key | Privileged Auth/database/Storage operations that bypass normal RLS. |

Evidence:
- `src/lib/supabase/client.ts`
- `src/lib/supabase/server.ts` — `supabaseServer()`
- `src/lib/supabase/admin.ts` — `getSupabaseAdmin()`

### Auth helpers

- `getUser()` calls server-side `auth.getUser()` and returns the verified Auth
  user or `null`.
- `requireUser()` redirects missing users to `/login`; it guarantees an Auth
  user object, not an active member profile or Board role.
- `getProfile()` revalidates the Auth user and selects the matching
  `public.members` row.
- `requireBoard()` calls `requireUser()`, loads the member profile, and redirects
  non-Board users to `/portal`.
- `requireBoardApi()` performs the same role check but throws `Unauthorized` or
  `Forbidden` for API callers to map to HTTP responses.

Evidence:
- `src/lib/auth/get-user.ts` — `getUser()`
- `src/lib/auth/require-user.ts` — `requireUser()`
- `src/lib/auth/require-board.ts` — `requireBoard()`
- `src/lib/auth/require-board-api.ts` — `requireBoardApi()`
- `src/lib/queries/get-profile.ts` — `getProfile()`

### Client Auth context

`AuthProvider` wraps the application, reads the browser session, loads the
matching `members` row, subscribes to Auth state changes, and exposes
`user`, `profile`, and `loading`. It supports UI identity/navigation but is not
a server authorization boundary.

## 5. Data Model

- Supabase `auth.users` owns the Auth UUID, email/credentials, invitation, and
  recovery session state. The `auth` schema is outside the application-schema
  audit snapshot.
- `public.members` owns the application profile. Runtime consistently looks up
  `members.id = auth user.id`.
- `public.member_role` historically enumerates `board` and `member`.
- `public.member_status` historically enumerates `invited`, `active`,
  `inactive`, and `suspended`.
- Historical evidence contains `public.current_member_role()`,
  `public.is_board()`, and SECURITY DEFINER `public.handle_new_user()`.

The supplied trigger inventory covers application schemas and does not prove
that the live `auth.users` trigger invoking `handle_new_user()` exists. The
current invitation flow depends on equivalent automatic profile creation
because it does not insert `public.members` directly.

Database evidence:
- `docs/audit/supabase/04-columns.md` — `public.members`
- `docs/audit/supabase/08-fuctions-rpcs.md` — Auth/member helper functions
- `docs/audit/supabase/15-enums-and-custom-types.md` — role/status enums

## 6. Data Ownership

- Supabase Auth owns credentials, tokens, sessions, and Auth email identity.
- Members owns application role, application status, and referee/member profile
  fields.
- Development cycle membership is separate from Auth and `public.members`.
- Application authorization reads `public.members.role`; authenticated identity
  alone does not confer Board access.

## 7. Business Rules

No role limit, password policy, invitation eligibility rule, or member-status
transition is independently established here as a BUSINESS RULE. The checks
below are IMPLEMENTATION FACTS unless separately approved by CAFLA.

## 8. Runtime Flow

### Login and logout

1. `/login` calls `signInWithPassword()` in the browser.
2. Supabase browser Auth persists/refreshes the session.
3. Navigation to `/portal` is validated by `proxy()` and the Portal layout.
4. `AuthProvider` loads the matching member profile for client UI.
5. `UserMenu` calls browser `signOut()`; the Auth listener clears state and
   replaces the location with `/login`.

### Invitation/onboarding

1. A Board-authenticated handler calls `auth.admin.inviteUserByEmail()` using
   service-role.
2. Current runtime expects the invited Auth UUID to have a matching
   `public.members` row, initialized as `member`/`invited` by database-side
   behavior.
3. The invite handler enrolls that UUID into the active Development cycle.
4. `/auth/callback` exchanges a PKCE code or establishes an implicit-token
   session, then sends invitation flows to `/complete-profile`.
5. `/api/auth/complete-profile` verifies `auth.getUser()`, updates the Auth
   password, and updates the caller's member row to `active` with phone,
   `ussf_id`, grade, and a completion note.
6. The Portal layout permits only `members.status = active`.

### Password recovery

1. `/forgot-password` invokes `resetPasswordForEmail()` with a callback to
   `/auth/callback?next=/reset-password` and returns a neutral UI result.
2. The callback establishes the recovery session.
3. `/reset-password` verifies a browser session, calls `updateUser()`, signs out
   the temporary session, and redirects to login.

## 9. Authorization & Security

### Page authorization

- `proxy()` matches `/portal`, `/admin`, `/login`, `/complete-profile`, and
  `/auth`; it redirects unauthenticated Portal/Admin page requests.
- The Portal layout independently calls `requireUser()`, requires a matching
  member row, redirects `invited` users to profile completion, and rejects every
  status other than `active`.
- The Admin layout calls `requireBoard()`.
- Client-side Board navigation is presentation only; the server layout/handler
  remains the authorization boundary.

### API authorization

API handlers do not inherit Admin/Portal layouts and are not included in the
`proxy()` matcher. Authorization is handler-specific:

- Member Quiz APIs call `requireUser()`.
- Evaluation/report submission revalidates the authenticated user directly.
- Current Attendance/Admin Quiz/member write handlers call a Board guard before
  privileged operations.
- `GET /api/admin/members` and `GET /api/admin/members/all` do not call a Board
  guard; they use the cookie-scoped SSR client and therefore rely on `members`
  RLS to constrain results.
- Competition standings/team handlers use service-role without an explicit
  application auth guard, although their current UI surfaces are inside the
  authenticated Portal. Whether those APIs are intended to be public is
  UNCERTAIN.

### RLS and service-role

Historical evidence shows RLS enabled on `public.members`, with policies for
self select/update and Board-wide select/update. It also shows broad table
privileges for authenticated/anon roles. These records must be verified against
the live post-recovery database before being treated as current security state.

Service-role bypasses normal RLS and is constructed only in server code. A
service-role handler must not rely on RLS to supply missing ownership or role
checks.

## 10. Time & Timezone Rules

Auth tokens and recovery/invitation expiry are delegated to Supabase Auth.
No CAFLA-specific Auth timezone business rule was established in this audit.
Invitation cycle enrollment uses an `America/Los_Angeles` local date; detailed
cycle semantics belong to Members/Development.

## 11. Dependencies

- Auth depends on Supabase Auth and cookie handling.
- Application roles/status depend on `public.members`.
- Board RLS policies historically depend on `public.is_board()` and
  `auth.uid()`.
- Invitation depends on Auth admin invitation, automatic member-profile
  creation, and an active Development cycle.
- Every member-owned module depends on the shared Auth/member UUID.

## 12. CURRENT vs Historical/Retired

- PKCE callback handling is CURRENT.
- The callback also contains a labeled legacy/implicit token compatibility
  branch. The code is present in current runtime, but whether any active Auth
  configuration still uses it is UNCERTAIN.
- Historical audit definitions describe a point-in-time database state and do
  not prove live Auth triggers or policies after recovery.

## 13. Known Limitations / Technical Debt

- **KNOWN LIMITATION:** application-level API authorization is not uniform;
  route location under `/api/admin` does not itself require Board access.
- **KNOWN LIMITATION:** Auth/profile context types use `any`, reducing compile-time
  guarantees around role and status.
- **KNOWN LIMITATION:** the client complete-profile page enforces a detailed
  password shape, while its API only checks that a password is present before
  delegating to Supabase Auth. This is an implementation-layer mismatch, not a
  confirmed CAFLA password BUSINESS RULE.
- **UNCERTAIN SECURITY RISK:** the historical `members_update_self` policy and
  authenticated UPDATE grant appear row-scoped but not column-scoped. If still
  live unchanged, a user may be able to update sensitive own-row fields such as
  `role` or `status` directly through the Data API. Live policies, grants, and
  any column privileges must be verified before drawing a current conclusion.

## 14. Open Questions

- Does the live Auth schema contain the trigger that invokes
  `public.handle_new_user()` for invited users?
- Are the historical `public.members` RLS policies/grants unchanged after
  recovery, and do they prevent self-modification of `role` and `status`?
- Are service-role competition standings/team APIs intentionally public?
- Is the implicit-token callback branch still required by active Supabase Auth
  configuration?
- Is the client password shape an approved CAFLA rule or only UI validation?

## 15. Evidence

Evidence:
- `src/proxy.ts` — `proxy()` and matcher
- `src/components/providers/AuthProvider.tsx` — `AuthProvider`, `useAuth()`
- `src/app/(auth)/login/page.tsx` — `LoginPage`
- `src/app/(auth)/forgot-password/page.tsx` — `ForgotPasswordPage`
- `src/app/(auth)/reset-password/page.tsx` — `ResetPasswordPage`
- `src/app/auth/callback/page.tsx` — `AuthCallbackPage`
- `src/app/api/auth/complete-profile/route.ts` — `POST`
- `src/app/api/admin/members/invite/route.ts` — `POST`
- `src/app/(portal)/portal/layout.tsx`
- `src/app/(admin)/admin/layout.tsx`

Database:
- `public.members` — table — CURRENT
- `public.member_role` — enum — CURRENT in runtime; historical DB evidence
- `public.member_status` — enum — CURRENT in runtime; historical DB evidence
- `public.is_board()` — function — current RLS dependency status requires live verification
- `public.handle_new_user()` — trigger function — invocation requires live verification

## 16. Change Impact Checklist

Before changing Auth, review browser/server client behavior, cookie refresh,
proxy matching, page layouts, every affected API handler, member role/status,
RLS and grants, service-role callers, invitation/recovery callback variants,
Development enrollment, and rollback for partial onboarding.

