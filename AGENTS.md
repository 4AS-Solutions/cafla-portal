# CAFLA Portal — Codex Development Guidelines

This file defines the working rules for AI coding agents operating on the CAFLA Portal repository.

These instructions apply to the entire repository unless a more specific `AGENTS.md` exists inside a subdirectory.

---

# 1. Communication

- Respond to the developer in Spanish.
- Keep source code, variable names, function names, database objects, file names, API routes, commit messages, and technical identifiers in English.
- Explain important architectural decisions in Spanish.
- When something is uncertain, say so instead of guessing.
- Ask for clarification when a business rule cannot be determined safely from the repository.
- Do not invent database tables, columns, relationships, views, enums, triggers, functions, or policies.

---

# 2. Project Overview

CAFLA Portal is an internal referee management and development platform for CAFLA.

The application includes functionality related to:

- Authentication and member onboarding
- Members
- Attendance
- Quizzes
- Match assignments
- Match reports
- Peer evaluations
- Referee development
- Rankings
- Competition data
- Teams and rosters
- Administrative tools

The application is currently undergoing a progressive migration from legacy/V1 functionality toward a cycle-based V2 architecture.

Do not assume that every module has already been migrated.

---

# 3. Main Technology Stack

The repository currently uses technologies including:

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Supabase
- PostgreSQL
- Supabase Auth
- Resend
- shadcn/ui / Radix-based components

Before introducing a new dependency, verify whether the project already contains functionality that solves the same problem.

Do not install new packages unless explicitly necessary and approved.

---

# 4. Application Structure

The application primarily uses route groups such as:

- `src/app/(public)`
- `src/app/(auth)`
- `src/app/(portal)`
- `src/app/(admin)`
- `src/app/api`

Important areas include:

- `/portal`
- `/portal/attendance`
- `/portal/development`
- `/portal/evaluations`
- `/portal/matches`
- `/portal/quizzes`
- `/portal/reports`
- `/portal/competition`

Administrative areas include:

- `/admin/attendance`
- `/admin/matches`
- `/admin/members`
- `/admin/quizzes`
- `/admin/ranking`
- `/admin/reports`

Always inspect the existing implementation before creating new routes, components, services, or queries.

---

# 5. Supabase Architecture

CAFLA uses Supabase/PostgreSQL with multiple schemas.

Known schemas include:

- `public`
- `development`
- `tournaments`

There may be additional schemas.

Never assume that the repository contains the complete database definition.

The production Supabase database may contain tables, views, functions, triggers, enums, RLS policies, constraints, and relationships that are not represented in this repository.

If database structure cannot be verified from code or supplied SQL output, ask the developer for the relevant Supabase query/result.

---

# 6. DEVELOPMENT Schema

The PostgreSQL schema named `development` is real and is part of the V2 architecture.

Known objects include, but are not necessarily limited to:

## Development cycles

- `development.cycles`
- `development.cycle_members`

## Attendance V2

- `development.attendance_sessions`
- `development.attendance_records`
- `development.attendance_scoring_rules`
- `development.referee_attendance`
- `development.referee_attendance_detail`

## Quiz V2

Known Quiz V2 objects include tables/views related to:

- `quiz_assessments`
- `quiz_versions`
- `quiz_question_groups`
- `quiz_questions`
- `quiz_question_options`
- `quiz_attempts`
- `quiz_attempt_questions`
- `quiz_answers`
- `quiz_access_grants`
- `quiz_member_best_results`
- `referee_quiz_score`

Do not assume columns or relationships solely from these names.

Inspect repository usage or request database information before making database-dependent decisions.

---

# 7. TOURNAMENTS Schema

Competition functionality uses the PostgreSQL schema:

`tournaments`

Known concepts include:

- organizations/tournaments
- divisions
- seasons
- division seasons
- teams
- team registrations
- players
- rosters
- competition standings

Do not assume the exact schema structure.

Inspect existing queries and API routes first.

---

# 8. V1 vs V2 Architecture

CAFLA is being migrated incrementally.

## V2 / New Architecture

Attendance V2 is based on:

- `development.cycles`
- `development.cycle_members`
- `development.attendance_sessions`
- `development.attendance_records`

Quiz V2 also belongs to the cycle-based `development` architecture.

Reports V2 is functionally advanced but its Development scoring integration may still require formalization.

Evaluations V2 and Development V2 are still being defined/migrated.

## Legacy / V1

The existing `/portal/development` implementation is considered Development V1 unless explicitly stated otherwise.

Views and logic using names such as:

- `dashboard_referee_*`
- `dashboard_quiz_scores`
- `dashboard_peer_feedback_score`
- `dashboard_referee_ranking`
- `dashboard_referee_ranking_v2`

may belong to legacy or transitional architecture.

Do not automatically build new V2 functionality on top of legacy dashboard views.

If legacy code must be reused, explain why before doing so.

---

# 9. Target Development V2 Architecture

The intended long-term conceptual architecture is:

Attendance V2
+
Quiz V2
+
Reports V2
+
Evaluations V2
↓
Development V2
↓
Ranking V2

The exact weighting and business rules must NOT be invented by Codex.

These rules will be defined by the developer before implementation.

---

# 10. Database Safety — CRITICAL

Database safety takes priority over speed.

## ABSOLUTELY FORBIDDEN

Codex must NEVER execute or authorize destructive database operations.

This includes, but is not limited to:

- `DELETE`
- `TRUNCATE`
- `DROP`
- `DROP TABLE`
- `DROP VIEW`
- `DROP SCHEMA`
- `DROP FUNCTION`
- `DROP POLICY`
- destructive `ALTER TABLE`
- destructive migrations
- removing columns
- removing constraints
- disabling RLS
- deleting Supabase Auth users
- deleting Storage objects
- deleting production records
- resetting the database
- wiping development or production data

Codex must NEVER execute a database command whose purpose is to remove existing data.

This restriction applies even if Codex believes deletion would fix a bug.

There are NO automatic exceptions.

---

# 11. No Database Writes Without Explicit Approval

By default, Codex must treat Supabase as READ-ONLY.

Codex may:

- inspect application code
- inspect existing SQL files
- write SELECT queries for the developer to run manually
- analyze query results supplied by the developer
- propose database changes
- explain migrations
- generate SQL for review

Codex must NOT independently execute:

- INSERT
- UPDATE
- UPSERT
- DELETE
- ALTER
- CREATE TABLE
- CREATE VIEW
- CREATE FUNCTION
- CREATE POLICY
- migrations
- RPC calls that modify data

If a database write is necessary:

1. Explain why.
2. Show the proposed SQL.
3. Explain what records/objects it affects.
4. Wait for explicit developer approval.
5. Prefer having the developer execute the SQL manually in Supabase.

DELETE operations remain forbidden even after general database-write approval unless the developer explicitly changes this repository policy.

---

# 12. Production Database Protection

Never assume a Supabase connection is a disposable development database.

Treat every Supabase database as production-capable unless explicitly proven otherwise.

Never:

- test destructive SQL
- seed arbitrary data
- clean tables
- reset schemas
- modify RLS experimentally
- modify production data for testing

Testing must prefer:

- local code
- mocks
- read-only queries
- controlled application flows
- explicitly designated test environments

---

# 13. SQL Queries

When database information is needed, prefer giving the developer diagnostic SQL queries.

Diagnostic queries should normally use:

`SELECT`

Examples:

- inspect table columns
- inspect constraints
- inspect foreign keys
- inspect views
- inspect view definitions
- count records
- compare records
- inspect enums

Do not fabricate results.

Wait for the developer to provide the actual Supabase output.

---

# 14. Git Safety

Codex works on the local repository unless explicitly instructed otherwise.

By default:

- Do NOT commit.
- Do NOT push.
- Do NOT merge.
- Do NOT rebase.
- Do NOT force push.
- Do NOT create pull requests.
- Do NOT modify remote branches.
- Do NOT reset branches.
- Do NOT discard developer changes.

Codex may inspect:

- `git status`
- `git diff`
- `git log`

when useful.

The developer decides when code is ready to commit.

---

# 15. Local File Safety

Do not delete files unless the developer explicitly approves the deletion.

If a file appears obsolete:

1. Explain why it appears obsolete.
2. Identify references to it.
3. Recommend deletion if appropriate.
4. Wait for approval.

Prefer modifying existing architecture over creating unnecessary duplicate files.

Never overwrite unrelated developer work.

---

# 16. Before Modifying Code

For substantial tasks, first inspect the relevant implementation.

Before coding, identify:

- relevant routes
- components
- queries
- API routes
- types
- database dependencies
- authentication requirements
- legacy dependencies
- reusable utilities

For large V2 migrations, provide a short implementation plan before making changes.

For small and obvious changes, implementation may proceed directly unless the developer requested analysis first.

---

# 17. Scope Discipline

Only modify code related to the requested task.

Do NOT perform unrelated refactors.

Do NOT:

- redesign unrelated pages
- rename unrelated files
- reorganize the entire project
- migrate unrelated legacy modules
- replace working architecture merely because another pattern is preferred
- introduce abstractions without a concrete need

If technical debt is discovered outside the requested scope, report it separately.

---

# 18. Technical Debt Strategy

CAFLA intentionally prioritizes completing the V2 migration while controlling technical debt.

Do not attempt a repository-wide rewrite.

Use incremental cleanup.

When working on a module:

1. Understand existing behavior.
2. Implement or migrate the required functionality.
3. Verify functionality.
4. Identify technical debt directly related to the module.
5. Perform small safe cleanup where beneficial.
6. Report larger architectural debt separately.

Technical debt should not silently expand.

---

# 19. Current Known Technical Debt

Known or suspected technical debt includes:

- legacy `dashboard_*` views
- Development V1
- transitional ranking logic
- coexistence of V1 and V2 modules
- incomplete Supabase TypeScript database types
- possible `Database = any`
- database definitions not fully versioned inside the repository
- potentially duplicated queries/helpers
- historical code that may no longer be used

Do not fix all of these automatically.

Address them when they become relevant to the module being worked on.

---

# 20. TypeScript

Avoid introducing new `any` types.

Prefer explicit types.

Do not perform a repository-wide type rewrite unless requested.

When Supabase-generated types are incomplete, acknowledge the limitation rather than inventing database types.

Maintain compatibility with the project's existing TypeScript configuration.

---

# 21. Authentication and Authorization

Respect existing authentication helpers and authorization boundaries.

Known concepts include:

- authenticated users
- members
- board/admin users
- `requireUser`
- `requireBoard`

Do not weaken authorization to solve development problems.

Never bypass authentication or RLS as a shortcut.

Administrative functionality must remain protected.

---

# 22. API Routes

Before creating a new API route:

1. Search for an existing route that performs the same responsibility.
2. Inspect existing authentication patterns.
3. Inspect error-handling conventions.
4. Reuse existing utilities where appropriate.

Do not expose service-role credentials to client components.

Sensitive Supabase administrative operations must remain server-side.

---

# 23. Supabase Service Role

The Supabase service-role key is highly privileged.

Never expose it to:

- browser code
- client components
- public environment variables
- logs
- API responses

Administrative Supabase clients must remain server-side.

Do not print secrets.

Do not inspect or expose `.env` values unless explicitly required.

---

# 24. UI / UX

Preserve the established CAFLA visual system unless the developer requests a redesign.

Prefer:

- responsive layouts
- existing components
- existing spacing patterns
- existing dark theme
- consistent cards/dialogs/buttons
- accessible interactions

Do not redesign unrelated UI while implementing backend functionality.

For responsive interfaces, consider both desktop and mobile behavior.

---

# 25. Attendance V2

Attendance V2 is considered an important reference implementation for the cycle-based architecture.

Important concepts include:

- active development cycle
- cycle membership
- `effective_from`
- `effective_until`
- enrollment type
- ranking eligibility
- completed sessions
- sessions that count for score
- attendance status
- attendance scoring rules

Do not change Attendance V2 business rules while working on another module.

If another module needs attendance data, prefer consuming established Attendance V2 aggregates rather than recreating attendance calculations.

---

# 26. Quiz V2

Quiz V2 belongs to the `development` architecture.

It includes concepts such as:

- assessments
- versions
- question groups
- questions
- options
- attempts
- answers
- availability
- lifecycle
- publishing
- closing
- archiving
- member access
- best results

Quiz V2 may still have unfinished functionality.

Do not assume unfinished behavior represents the final business rule.

Ask before making architectural decisions that affect quiz scoring or Development V2.

---

# 27. Reports V2

Reports V2 should eventually provide a reliable metric to Development V2.

Do not invent Report Score rules.

Report scoring must account for business rules explicitly approved by the developer.

When analyzing Reports V2, distinguish between:

- match assignment
- report requirement
- report submission
- report timing
- report review
- report approval
- disciplinary information
- attachments

Do not alter existing report email behavior unless requested.

---

# 28. Evaluations V2

Evaluations / peer feedback will eventually feed Development V2.

The V2 evaluation model is not assumed complete.

Do not build Development V2 evaluation scoring from legacy peer-feedback views unless explicitly approved.

Before implementing Evaluations V2, inspect:

- evaluator
- evaluated referee
- match relationship
- eligibility
- scoring
- submission
- duplicate prevention
- timing
- visibility

Business rules must be approved before implementation.

---

# 29. Development V2

Do not implement Development V2 until its business rules and data sources have been explicitly defined.

Development V2 should consume authoritative V2 sources rather than duplicate their calculations.

For example:

- Attendance score should come from Attendance V2.
- Quiz score should come from Quiz V2.
- Report score should come from Reports V2.
- Evaluation score should come from Evaluations V2.

Development should primarily aggregate these established metrics.

Avoid calculating the same business rule independently in multiple places.

---

# 30. Ranking V2

Ranking V2 should eventually consume Development V2 rather than independently recreating Development calculations.

Do not migrate Ranking until the Development V2 model is sufficiently stable.

Legacy ranking functionality may remain operational during migration.

---

# 31. Time Zones

CAFLA operates primarily in Los Angeles.

When business logic depends on calendar date or time, explicitly consider:

`America/Los_Angeles`

Do not assume UTC calendar dates represent the local CAFLA date.

This is especially important for:

- match kickoff times
- attendance sessions
- report deadlines
- quiz availability
- daily cutoffs
- scheduled events

Prefer explicit timezone handling.

---

# 32. Testing and Validation

After meaningful code changes, use the available project checks when appropriate.

Examples may include:

- TypeScript/typecheck
- ESLint
- build
- targeted tests

Do not automatically run expensive or destructive commands.

Never run database migrations as part of validation.

When finishing a coding task, report:

- files modified
- files created
- tests/checks run
- whether they passed
- warnings
- assumptions
- unresolved issues

---

# 33. Build Errors

Do not hide errors merely to make the build pass.

Avoid:

- disabling TypeScript checks
- disabling ESLint globally
- adding broad `@ts-ignore`
- replacing types with `any`
- swallowing exceptions

Fix the underlying issue when practical.

If the underlying issue is outside scope, explain it.

---

# 34. Error Handling

Server-side failures should be logged with enough context for debugging without exposing secrets.

User-facing errors should be understandable and should not expose:

- database internals
- service-role information
- stack traces
- secrets

Follow existing project conventions.

---

# 35. Performance

Avoid unnecessary repeated Supabase queries.

Before adding queries:

- inspect whether data is already available
- consider server-side aggregation
- avoid N+1 patterns
- reuse established views when they belong to the correct architecture

Do not prematurely optimize without evidence.

Correctness takes priority.

---

# 36. Legacy Code

Legacy code may remain temporarily because CAFLA is being migrated incrementally.

Do not delete legacy functionality merely because a V2 replacement exists.

Before removing legacy functionality, verify:

- no routes use it
- no components use it
- no API routes use it
- no admin workflows depend on it
- no dashboard depends on it

Removal requires explicit developer approval.

---

# 37. Analysis Before V2 Migration

When asked to migrate a module to V2, first determine:

1. Current V1 behavior.
2. Current data sources.
3. Existing UI.
4. Existing API routes.
5. Existing business rules.
6. Legacy dependencies.
7. V2 functionality already implemented.
8. Missing database information.
9. Migration risks.
10. Proposed implementation phases.

Do not immediately rewrite the module.

---

# 38. Business Rules

Business rules belong to CAFLA, not to the coding agent.

Codex must not invent policies such as:

- scoring weights
- ranking weights
- attendance penalties
- report penalties
- quiz penalties
- evaluation eligibility
- member eligibility
- new-member treatment
- suspension treatment
- deadlines

When these rules are not explicitly known, ask.

---

# 39. Preferred Working Method

For significant CAFLA development tasks, follow this workflow:

## Phase 1 — Inspect

Inspect the repository and relevant implementation.

Do not modify anything.

## Phase 2 — Understand

Explain current behavior, dependencies, and risks.

Request missing database information if necessary.

## Phase 3 — Define

Wait for the developer to approve business rules and intended architecture.

## Phase 4 — Plan

Provide a concise implementation plan and identify expected files to modify.

## Phase 5 — Implement

Make focused local code changes.

Do not touch unrelated modules.

## Phase 6 — Validate

Run safe local checks.

Never modify database state as part of validation.

## Phase 7 — Review

Report:

- changed files
- behavior implemented
- checks performed
- technical debt discovered
- remaining issues

## Phase 8 — Developer Approval

The developer manually tests the application.

The developer decides whether to commit and push.

---

# 40. Final Safety Rule

When uncertain between:

A) making a potentially destructive or architectural change automatically

and

B) stopping and asking the developer

always choose B.

Preserving CAFLA data and existing functionality is more important than completing a task automatically.