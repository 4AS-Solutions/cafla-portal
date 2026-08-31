# System Overview

## 1. Purpose

This document is the high-level entry point to the verified CAFLA Portal
implementation. It defines system surfaces, principal layers, schema boundaries,
and module relationships without duplicating detailed module documentation.

## 2. Status

**CURRENT**

**IMPLEMENTATION FACT:** CAFLA Portal is a Next.js App Router application backed
by Supabase Auth, Supabase/PostgreSQL, and Supabase Storage. It contains a public
website, authenticated member Portal, Board/Admin surfaces, and route handlers.
CURRENT does not assert that every workflow is complete or defect-free.

Evidence:
- `package.json` — runtime and library dependencies
- `src/app/layout.tsx` — `RootLayout`
- `src/proxy.ts` — `proxy()`
- `src/app/(portal)/portal/layout.tsx` — Portal layout
- `src/app/(admin)/admin/layout.tsx` — Admin layout

## 3. User-Facing Surfaces

### Public

- `/` renders the public CAFLA landing surface.
- `/join` renders a public introductory-session request form.
- `/login`, `/forgot-password`, `/reset-password`, and `/complete-profile`
  support authentication and onboarding.
- `/auth/callback` establishes invitation/recovery sessions.

### Authenticated member Portal

The persistent Portal shell contains:

- `/portal` — member dashboard;
- `/portal/matches` — assigned matches;
- `/portal/reports` — report obligations/history;
- `/portal/attendance` — Attendance V2;
- `/portal/quizzes` — Quiz V2;
- `/portal/evaluations` — evaluation obligations;
- `/portal/development` — Development V2 and personal ranking/progress;
- `/portal/competition` — competition/tournament data.

`src/app/(portal)/portal/layout.tsx` requires an authenticated user and an
active `public.members` profile before rendering `PortalShell`.

### Board/Admin

The `/admin` route group contains Members, Arbiter Import, Matches, Reports,
Attendance, Quiz, and Ranking management. Its layout calls `requireBoard()`.
Individual pages often repeat the same guard; API handlers remain responsible
for their own authorization because App Router layouts do not protect API
routes.

### API

`src/app/api/` contains public, member, and Board-oriented route handlers for
onboarding, attendance, competition, evaluations, matches, members, quizzes,
reports, and tournament context. The `/api/admin` path is a naming convention,
not an automatic authorization boundary.

## 4. Application Implementation

### UI layer

Pages and layouts under `src/app/` compose components under `src/components/`.
Server Components are the default. Client Components are used where browser
state, Supabase browser Auth, forms, interactive tables, or navigation behavior
is required.

### Server/runtime layer

- Next.js layouts enforce member and Board page access.
- Route handlers validate requests and perform server-side workflows.
- `src/proxy.ts` refreshes/validates Supabase Auth for selected page routes and
  redirects unauthenticated Portal/Admin requests.

### Query/data-access layer

Domain query helpers under `src/lib/queries/` and `src/lib/matches/` access
Supabase. Storage helpers live under `src/lib/storage/`. Some pages load several
independent sources concurrently with `Promise.all`, including the member
Dashboard and Development page.

### External services

- Supabase supplies Auth, PostgreSQL APIs, and Storage.
- Resend is actively used for approved-report notification email.

Evidence:
- `src/lib/supabase/client.ts` — browser singleton
- `src/lib/supabase/server.ts` — `supabaseServer()`
- `src/lib/supabase/admin.ts` — `getSupabaseAdmin()`
- `src/emails/services/send-report-approved-email.tsx`
- `src/lib/storage/match-rosters.ts`

## 5. Data Model

Three application schemas materially participate:

- **`public`** — CURRENT shared identity and match/report infrastructure,
  including `public.members`, `public.matches`, `public.match_reports`, and
  `public.evaluations`. Schema location does not imply legacy status.
- **`development`** — CURRENT cycle-based Attendance, Quiz, Development,
  Evaluations-derived scoring, Reports-derived scoring, Ranking calculations,
  and snapshot serving.
- **`tournaments`** — CURRENT competition context queried by competition API
  handlers, including division-season, standings, team, player, and roster
  projections.

This is a schema-level map only. Every object must be classified individually.
The detailed data model remains NOT YET DOCUMENTED in the corresponding module
files.

Database evidence:
- `docs/audit/supabase/02-tables-and-views.md` — historical object inventory
- `docs/audit/supabase/06-foreign-keys.md` — historical relationship evidence
- `docs/audit/supabase/12-database-dependencies.md` — historical dependency evidence

## 6. Data Ownership

At a high level:

- Supabase Auth owns credentials and authenticated user sessions.
- Members owns the application profile keyed to the Auth user UUID.
- Matches owns match records and referee assignments.
- Reports and Evaluations reference match/member identity and feed Development.
- Attendance and Quiz own cycle-based activity in `development` and feed
  Development.
- Development aggregates authoritative metric sources.
- Ranking consumes Development output and serves current/monthly snapshots.
- Dashboard composes existing member, match, obligation, metric, and ranking
  sources; it is not the owner of those domains.
- Tournaments owns competition context surfaced through Portal competition APIs.

Detailed ownership must be established by later module audits.

## 7. Business Rules

No detailed scoring, eligibility, lifecycle, or membership policy is established
as a BUSINESS RULE by this overview. Runtime checks described here remain
IMPLEMENTATION FACTS unless a module audit cites independently confirmed CAFLA
rules.

## 8. Runtime Flow

```text
Browser
  -> Next.js public/auth/Portal/Admin surface
  -> page layout and server authorization where applicable
  -> Server Component, query helper, or API route
  -> user-scoped Supabase client or server-only service-role client
  -> public / development / tournaments objects and Supabase Storage
  -> rendered UI or JSON response
```

The member Dashboard and Development surfaces aggregate multiple domain
queries. Detailed module flows belong in their respective documents.

## 9. Authorization & Security

- Authentication is provided by Supabase Auth.
- Portal pages are protected by both `proxy()` and the Portal server layout.
- Admin pages are protected by `requireBoard()` in the Admin layout.
- API routes do not inherit page-layout protection; handlers must authorize
  independently.
- User-scoped clients are subject to grants and RLS.
- `getSupabaseAdmin()` uses the service-role key server-side and bypasses normal
  RLS enforcement; callers must establish authorization and ownership before
  privileged access.

Detailed guarantees and verified gaps are documented in
`02-auth-and-authorization.md`.

## 10. Time & Timezone Rules

`America/Los_Angeles` is used by current runtime paths where CAFLA calendar
boundaries matter. Detailed time rules belong to the owning modules.

## 11. Dependencies

Major high-level relationships are:

```text
Supabase Auth -> Members
Members -> Matches / Reports / Attendance / Quiz / Evaluations / Development
Matches -> Reports and Evaluations
Attendance + Quiz + Reports + Evaluations -> Development -> Ranking
Domain sources -> Dashboard
Tournaments -> Competition surface and match/roster context where referenced
```

Arrows express verified high-level consumption, not ownership of every object
or a complete database dependency graph.

## 12. CURRENT vs Historical/Retired

Attendance V1, Quiz V1, and Ranking V1 public database architectures are
confirmed RETIRED and must not be presented as current. Historical audit files
may still contain them because the snapshot predates retirement.

Current public objects must not be classified by schema or prefix. In
particular, `public.members`, `public.evaluations`, and selected
`public.dashboard_*` sources remain CURRENT where runtime/dependency evidence
confirms them.

## 13. Known Limitations / Technical Debt

- **KNOWN LIMITATION / TECHNICAL DEBT:** generated/maintained Supabase typing is
  incomplete; `src/types/database.ts` currently aliases `Database` to `any`.
- Detailed deployment infrastructure is not represented beyond standard
  Next.js configuration and environment-variable integration.
- Authorization patterns are not uniform across all API handlers; see the Auth
  module before changing or exposing a route.
- **KNOWN LIMITATION:** the public `/join` form displays a successful submission
  state when `/api/join` returns success, but the current handler only parses the
  request and returns JSON; persistence and email delivery code is commented
  out.
- Module-level completeness, empty/error behavior, and complete ownership maps
  remain outside this phase.

## 14. Open Questions

- Which deployment platform and environment topology are authoritative? The
  repository does not establish this.
- Which database evidence package will represent the next verified live
  post-recovery catalog rather than the historical snapshot?
- Detailed module status and ownership remain NOT YET DOCUMENTED outside Auth
  and Members.

## 15. Evidence

Evidence:
- `src/app/(public)/page.tsx` — `HomePage`
- `src/app/(portal)/portal/page.tsx` — member Dashboard
- `src/app/(portal)/portal/development/page.tsx` — Development V2 page
- `src/app/(admin)/admin/layout.tsx` — Admin layout
- `src/components/layout/PortalSidebar.tsx` — member/admin navigation map
- `src/app/api/competition/division-seasons/route.ts` — tournaments access
- `src/app/api/competition/standings/route.ts` — tournaments standings access
- `src/components/landing/join/JoinForm.tsx` — public join submission UI
- `src/app/api/join/route.ts` — current join handler
- `src/lib/supabase/client.ts`
- `src/lib/supabase/server.ts`
- `src/lib/supabase/admin.ts`

Database:
- `public` — application schema — CURRENT (object status remains individual)
- `development` — application schema — CURRENT (object status remains individual)
- `tournaments` — application schema — CURRENT (object status remains individual)

## 16. Change Impact Checklist

Before changing system boundaries, verify affected route groups, layouts, API
authorization, Supabase client type, service-role exposure, schema ownership,
RLS/dependencies, downstream modules, external services, and the relevant
Source of Truth documents.
