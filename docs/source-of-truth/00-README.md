# CAFLA Portal Source of Truth

## Purpose

This directory is the durable, evidence-based description of the CAFLA Portal
as it actually operates. It should answer:

> What is the CURRENT system, how does it work, what implements it, what data
> does it own or consume, and what is retired, planned, or unresolved?

The Source of Truth is not a marketing document, changelog, raw database dump,
speculative design, copy of the repository `README.md`, or replacement for
`AGENTS.md`.

## Scope

Module documents will describe verified user-facing surfaces, application
implementation, data ownership, database dependencies, authorization,
business rules, runtime flows, historical boundaries, known limitations, and
open questions.

This initial framework does not document the complete architecture. Files
marked `NOT YET DOCUMENTED` must be audited before substantive content is added.

## Document Control

- **Repository AS-IS baseline:** `develop@5b47f15d8580687e66b0f9b6eeaccbe3bf3e19f4`.
- **Baseline date:** 2026-08-31.
- **Git relationship at review:** local and tracked `main` at `fd705240` is an
  ancestor of `develop`; `develop` contains 40 additional commits, including
  substantial V2 application work absent from that `main` revision.
- **Production deployment revision:** **UNCERTAIN / EXTERNAL VERIFICATION
  REQUIRED**. Owner-supplied Vercel evidence associates a Production deployment
  with merge commit `904d950` on 2026-08-30, but the available Git refs do not
  reconcile that commit with current `main@fd705240`.
- **Database evidence:**
  `supabase/migrations/20260831185011_remote_schema.sql` is the repository
  Production schema baseline for this pass. `docs/audit/supabase/` remains
  point-in-time supporting evidence, not guaranteed live post-recovery state.

The untracked `supabase/seed.sql` and `supabase/seeds/` files are Development
fixtures outside this repository baseline. They are not Production architecture
and must not be used to infer Production behavior.

## How to Use This Source of Truth

Before changing a module:

1. Read its module document and the relevant cross-cutting documents.
2. Verify that cited runtime and database evidence still matches the current
   system.
3. Distinguish current implementation from intended business rules.
4. Record conflicts and uncertainty instead of resolving them by assumption.
5. Update affected Source of Truth documents when an approved change alters
   architecture, ownership, business behavior, or status.

## Evidence Hierarchy

Use evidence in this order:

1. **CURRENT runtime implementation** — active routes, query helpers, API
   handlers, relevant components, and authentication/authorization paths.
2. **CURRENT database architecture evidence** — tables, views, functions/RPCs,
   constraints, foreign keys, indexes, triggers, RLS, grants, cron jobs, and
   internal dependencies.
3. **Confirmed business rules** — rules explicitly approved or established by
   CAFLA, kept distinct from implementation details.
4. **Historical database evidence** — backups, audit snapshots, and prior
   architecture records.
5. **Existing general documentation** — repository README files, older notes,
   and code comments.

Lower-priority evidence must not override contradictory higher-priority current
evidence. Code alone is not sufficient to classify a database object as
legacy: application references and database-internal dependencies must both be
considered.

When evidence conflicts, record the conflict in the module document and in
`16-open-questions-and-known-gaps.md` when it affects broader work. Do not
silently select the most convenient interpretation.

## Status Classification

Use exactly one primary status for each classified capability or object:

- **CURRENT** — actively participates in the verified system. CURRENT does not
  mean perfect, complete, or free of technical debt.
- **TRANSITIONAL** — verified current runtime still depends on an older
  implementation that has an approved replacement direction. Use only when
  both the live dependency and transition are evidenced; it is not a synonym
  for uncertainty.
- **LEGACY** — older or superseded architecture that may still exist or remain
  referenced but is not the preferred architecture. LEGACY does not mean safe
  to delete.
- **RETIRED** — intentionally removed or replaced and not part of the current
  system. RETIRED does not mean it should be restored from historical evidence.
- **PLANNED** — approved future functionality or architecture not currently
  implemented. PLANNED does not mean partially implemented unless evidence
  explicitly establishes that state.
- **UNCERTAIN** — evidence is insufficient, unavailable, contradictory, or not
  current enough to classify safely.

Classification rules:

- Schema location does not determine status; an object in `public` may be
  CURRENT.
- Names such as V1/V2 do not independently determine status.
- Zero rows do not determine status.
- Absence of an application caller does not independently determine status.
- A newer-looking replacement does not independently prove retirement.
- Database objects must be classified individually, including similarly named
  or prefixed objects.

## Fact Types

Label statements when the distinction materially improves clarity:

- **IMPLEMENTATION FACT** — what the verified system currently does.
- **BUSINESS RULE** — what CAFLA requires or intends the system to do.
- **ARCHITECTURAL DECISION** — a deliberate structural or ownership choice.
- **KNOWN LIMITATION / TECHNICAL DEBT** — a verified limitation of the current
  system.
- **HISTORICAL NOTE** — context explaining why an object or design exists.
- **PLANNED DECISION** — an approved direction that is not implemented yet.
- **OPEN QUESTION** — a fact or rule requiring confirmation.

Implementation and business intent may differ. Document both and identify the
mismatch; do not rewrite one as the other.

## Evidence Citation Format

Prefer stable file paths and symbols over brittle line numbers.

Repository evidence:

```text
Evidence:
- `src/lib/queries/example.ts` — `getExample()`
- `src/app/api/example/route.ts` — `POST`
```

Database evidence:

```text
Database:
- `development.example_object` — table — CURRENT
  Evidence: current catalog output or named audit source
```

For every important claim, cite enough evidence to distinguish a verified fact
from a conclusion or open question. Never fabricate columns, relationships,
line numbers, query results, or live database state.

## Historical Supabase Audit Boundary

`docs/audit/supabase/` is immutable historical evidence captured at a point in
time. It is valuable for reconstructing database state and dependency chains,
but it is not automatically the current live catalog. Objects may have been
intentionally retired or restored after the snapshot.

- Never rewrite audit files to make them appear current.
- Never use the snapshot alone to authorize deletion or restoration.
- Document the independently verified current status in this directory.
- Treat backups as evidence, not automatic restoration instructions.

## Database Classification and Safety

- `public` does not mean legacy. For example, `public.evaluations` is a
  confirmed CURRENT base table that feeds Development-derived architecture.
- Trace application callers and internal database dependencies before
  classifying an object.
- Relevant dependencies may include views, functions and their bodies,
  triggers, foreign keys, RLS policies, grants, cron jobs, and other function
  callers.
- A zero-row object may still be structurally critical.
- `DROP ... CASCADE` is never a classification or dependency-discovery
  mechanism.
- Retirement requires explicit approval, retention review where applicable,
  and a backup/rollback plan.

## Relationship to Other Repository Documents

- **`AGENTS.md`** defines agent working rules, safety constraints, repository
  conventions, and architecture guardrails. This Source of Truth contains the
  detailed system description. Neither should silently duplicate the other.
- **`README.md`** provides general repository information and may contain
  historical or stale descriptions. It is supporting evidence, not authority
  over verified current implementation.
- **`docs/audit/supabase/`** is immutable historical database evidence, subject
  to the boundary above.

## Update Discipline

- Architecture-changing work should update every affected Source of Truth
  document in the same reviewed change.
- Keep implementation facts separate from intended business rules.
- Mark retired architecture; do not silently erase historical context when it
  explains current boundaries or prevents reintroduction.
- Preserve audit snapshots as immutable historical evidence.
- Record uncertainty rather than guessing.
- Do not duplicate detailed architecture across `README.md`, `AGENTS.md`, and
  this directory.
- Cite current evidence and review existing citations when implementation or
  database architecture changes.
- Use `_MODULE_TEMPLATE.md` when populating a module.

## Module Index

| Document | Scope | Documentation Status |
|---|---|---|
| `01-system-overview.md` | System boundaries and principal runtime flows | SUBSTANTIVELY DOCUMENTED; MODULE REVIEW CONTINUES |
| `02-auth-and-authorization.md` | Authentication, roles, authorization, and privileged access | SUBSTANTIVELY DOCUMENTED; LIVE SECURITY VERIFICATION PENDING |
| `03-members.md` | Member identity, profile, lifecycle, and membership data | SUBSTANTIVELY DOCUMENTED; PARTICIPATION REFACTOR PLANNED |
| `03a-development-cycles-and-participation.md` | Development cycles, enrollment, participation, applicability, and ranking eligibility | SUBSTANTIVELY DOCUMENTED; IMPLEMENTATION TRANSITIONAL |
| `04-matches.md` | Match records, assignments, import, tournament context, and match-facing workflows | SUBSTANTIVELY DOCUMENTED; SECURITY/TIME QUESTIONS OPEN |
| `05-match-reports.md` | Report ownership, events, review, timing, email, Development and Competition integration | CURRENT documented; population and consistency gaps recorded |
| `06-attendance.md` | Attendance lifecycle and Development integration | SUBSTANTIVELY DOCUMENTED; POPULATION/SECURITY GAPS RECORDED |
| `07-quiz.md` | Quiz lifecycle, attempts, results, and Development integration | SUBSTANTIVELY DOCUMENTED; POPULATION/IMMUTABILITY GAPS RECORDED |
| `08-evaluations.md` | Evaluation obligations, submission, scoring, and dependencies | SUBSTANTIVELY DOCUMENTED; POPULATION/HISTORY/SECURITY GAPS RECORDED |
| `09-development.md` | Development aggregation and member progress surfaces | SUBSTANTIVELY DOCUMENTED; POPULATION/QUIZ/TIME GAPS RECORDED |
| `10-ranking.md` | Ranking calculation, evidence, eligibility, position, snapshots, and serving | SUBSTANTIVELY DOCUMENTED; POPULATION/SNAPSHOT/SECURITY GAPS RECORDED |
| `11-dashboard.md` | Member/admin dashboard composition and data sources | NOT YET DOCUMENTED |
| `12-tournaments.md` | Tournament ownership, competition context, standings, rosters, and player statistics | SUBSTANTIVELY DOCUMENTED; SECURITY/STATUS GAPS RECORDED |
| `12a-storage-and-rosters.md` | Database match rosters, uploaded files, report asset references, and Storage access | SUBSTANTIVELY DOCUMENTED; LIVE STORAGE VERIFICATION PENDING |
| `13-admin.md` | Cross-module administrative surfaces and controls | NOT YET DOCUMENTED |
| `14-data-ownership-and-dependencies.md` | Cross-module ownership and dependency map | NOT YET DOCUMENTED |
| `15-status-matrix.md` | Central capability/object classification matrix | SUBSTANTIVELY POPULATED; MODULE REVIEWS CONTINUE |
| `16-open-questions-and-known-gaps.md` | Unresolved evidence, rules, and verified gaps | SUBSTANTIVELY POPULATED; MAINTAIN CONTINUOUSLY |
