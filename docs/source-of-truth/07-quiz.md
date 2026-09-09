# Quiz V2

## 1. Purpose and Scope

Quiz V2 owns cycle-scoped assessments, bilingual content, randomized timed
attempts, answer persistence, scoring, member history/review, Board lifecycle
management, and the Quiz metric consumed by Development V2. Assessment
definition and member attempt are separate: content/configuration is shared,
while every attempt belongs to one member and one language version.

This document describes CURRENT implementation at `develop@f236021`. It does
not turn schema defaults or Development fixtures into Production business
rules, and it does not resolve the known participant-population mismatch.

## 2. Status and Boundaries

- Quiz V2 in `development`: **CURRENT**.
- Quiz population enforcement: **TRANSITIONAL**; list visibility, attempt start,
  Quiz aggregation, and downstream monthly scoring use different predicates.
- `development.quiz_access_grants`: **CURRENT database capability**, read during
  attempt start and member listing; no current grant-management UI/API was
  found, so its operational administration is **UNCERTAIN**.
- Public-schema Quiz V1: **RETIRED**. No current runtime reference or current
  baseline object was found for `public.quizzes`, `public.quiz_questions`,
  `public.quiz_attempts`, or `public.quiz_answers`.

Context: [`03a-development-cycles-and-participation.md`](./03a-development-cycles-and-participation.md).
The database artifact is
`supabase/migrations/20260831185011_remote_schema.sql`; historical material
under `docs/audit/supabase/` is supporting point-in-time evidence only.

## 3. User-Facing and Administrative Surfaces

### Member

- `/portal/quizzes` lists assessments for the active cycle.
- `/portal/quizzes/[quiz_id]` starts or resumes an attempt and renders
  `QuizRunner`.
- `/portal/quizzes/history` groups the authenticated member's non-voided
  attempts by assessment.
- `/portal/quizzes/history/[assessment_id]` shows attempt-level history.
- `/portal/quizzes/review/[attempt_id]` exposes detailed answers only after the
  review gate is unlocked.

### Board

- `/admin/quizzes`, `/admin/quizzes/new`, and
  `/admin/quizzes/[assessment_id]` provide list, creation, and overview.
- `/edit`, `/manage`, `/questions`, `/publish`, and `/results` provide the
  implemented management workflow.
- Every Quiz admin API calls `requireBoard()`. The Admin route-group layout also
  calls `requireBoard()`, including the `manage` page that has no duplicate
  page-local guard.

## 4. Ownership and Data Model

| Object | Cardinality and ownership | Responsibility |
|---|---|---|
| `development.quiz_assessments` | Many per `development.cycles`; one cycle per assessment | Canonical assessment identity, lifecycle, rules, availability, and audit metadata. |
| `development.quiz_versions` | At most one per assessment/language | Localized title, description, and instructions for `es` or `en`. |
| `development.quiz_question_groups` | Many per assessment | Language-neutral logical question identity, type, position, and invalidation state. |
| `development.quiz_questions` | One localized question per group/version | Question text and explanation. |
| `development.quiz_question_options` | Many per localized question | Localized option text, correctness flag, and order. |
| `development.quiz_attempts` | Many per assessment/member, uniquely numbered | Member attempt state, selected version, timing, and final result. |
| `development.quiz_attempt_questions` | Many per attempt | Selected group/question IDs, display position, and option-ID order. |
| `development.quiz_answers` | At most one per attempt question | Selected option and finalized correctness. |
| `development.quiz_access_grants` | Many per assessment/member over time | Exceptional member-specific availability window with grant/revoke audit. |
| `development.quiz_member_best_results` | Derived view | Per assessment/member attempt totals, best result, and review gate. |
| `development.referee_quiz_score` | Derived view | Per cycle/member effective Quiz percentage. |

Important constraints include unique `(assessment_id, language)`, unique
`(assessment_id, member_id, attempt_number)`, a partial unique index allowing
only one `in_progress` attempt per assessment/member, unique attempt-question
positions/groups, and one answer per attempt question. Assessment numeric
constraints require positive limits; the application additionally caps
attempts at 10, minutes at 240, and questions at 200.

The schema defaults `required = true`, `counts_for_score = true`,
`max_attempts = 1`, and both randomization flags to true. Those are defaults,
not universal configured values. No passing-threshold field or pass/fail model
was found.

## 5. Lifecycle

| State/transition | CURRENT enforcement |
|---|---|
| Create draft | Board API inserts an assessment for the active cycle. |
| `draft -> published` | `development.publish_quiz_assessment()` validates rules and complete localized content atomically and records `published_by/published_at`. |
| `published -> closed` | Board lifecycle API uses a conditional status update and records `closed_by/closed_at`. Starts are rejected once no longer published. |
| `closed -> archived` | Board lifecycle API uses a conditional update and records `archived_by/archived_at`. |
| Reverse transition | No current route exists. |

Repeated close/archive to the already-target state is treated idempotently.
The application transition matrix is stricter than the enum itself; direct
privileged database writes could construct states the application does not
offer. Archived assessments do not appear as current opportunities, but prior
attempts remain in member history, which is attempt-driven and cross-cycle.

## 6. Publishing and Content Lock

Publication requires an availability window, positive limits, at least one
language version and logical question, enough valid groups for
`questions_per_attempt`, a localized question in every enabled version for
each valid group, non-empty text, two to four options, and exactly one correct
option. True/false questions require exactly two options.

Publication does **not** set `content_locked_at`; the first successful start
sets it. Until then, current APIs can edit published language, question,
option, and rule content. Once set, those changes and question deletion are
blocked. Availability and lifecycle changes remain allowed. Base assessment
title/description editing is not exposed as a distinct post-create endpoint;
localized metadata lives in versions. `content_locked_at` is therefore a
first-attempt content/rule lock, not a publication or complete operational lock.

## 7. Language and Question Content

The supported languages are `es` and `en`; no default-language column was
found. A logical group is shared across translations, while each version owns
localized question text, explanation, and options. Publication enforces a
localized question for every valid group in every enabled version.

Members choose a language at start, and that version must exist. Cards/history
use the base assessment title/description; runner/review use localized version
content. Exactly one option must be correct per localized question at publish
validation; this is not a declarative unique constraint.

Groups have invalidation fields, but no current operational invalidation
workflow was identified. Before locking, content APIs physically delete a
group and its localized question/option dependents.

## 8. Rules and Availability

Rules are `questions_per_attempt`, `time_limit_minutes`, `max_attempts`,
`required`, `counts_for_score`, `randomize_questions`, and
`randomize_options`. The rule API normalizes an optional assessment to
`counts_for_score = false`, matching the DB check that a scoring assessment
must be required.

`open_from` and `open_until` are nullable `timestamptz`, although publication
requires both and the schema requires an ordered pair when present. Board can
change availability on draft, published, or closed assessments, but not
archived ones. This does not change lifecycle state or an existing attempt's
deadline.

Lifecycle and window may contradict: closed rejects starts despite an open
window; published after `open_until` is displayed as closed and rejects starts.
An active individual grant replaces the assessment window for its recipient.
A direct start can use the grant even when the list's independent late-entry
filter hides the assessment.

## 9. Population and Eligibility

| Boundary | Predicate actually used | Important omissions/effects |
|---|---|---|
| Visibility (`getQuizzes`) | Active cycle plus any cycle-member row; non-archived requires `effective_from <=` Los Angeles date of `open_from` | Ignores public member status, cycle-member status, ranking eligibility, enrollment type, and effective end. Archived bypasses date filter. |
| Attempt start RPC | Cycle-member status `active` or `withdrawn`; opening date inside stored effective interval | Ignores public status, ranking eligibility, and enrollment type. Does not require current instant before a withdrawn member's effective end. A grant bypasses the date comparison. |
| Best results / Quiz score | Cycle member status `active` or `withdrawn` | Ignores public status, ranking eligibility, enrollment type, and effective dates. |
| Monthly Development/Ranking | Status `active` or `withdrawn`, `eligible_for_ranking = true`, stored effective dates | Excludes ranking-ineligible participants and has no enrollment-specific derivation. |

This is the Quiz instance of `POP-001`. A ranking-ineligible participant may
have a `referee_quiz_score` while being excluded from downstream monthly
Development/Ranking.

## 10. Attempt Start and Generation

1. The page requires a user; the API passes the authenticated ID rather than a
   client-controlled member ID.
2. `development.start_quiz_attempt()` locks the assessment and validates
   published lifecycle, cycle membership, version, and effective window.
3. It resumes an unexpired `in_progress` attempt, or finalizes an expired one.
4. Submitted and expired attempts consume `max_attempts`; voided ones do not.
5. It inserts attempt and selected question rows, fixes display/option-ID order,
   and sets the first content lock in one database function call.
6. `started_at` is database current time; `expires_at` is the earlier of the
   configured duration and effective availability end.

Assessment-row locking serializes starts on that assessment; the partial unique
index also prevents two active attempts for one member/assessment. Question
selection always uses `ORDER BY random()`, so `randomize_questions = false` is
not honored. Options honor their flag; true/false preserves configured order.

## 11. Attempt Immutability

Attempts snapshot selected group/question IDs, display position, and option-ID
order. They do **not** snapshot question text, explanation, option text,
correct-answer flags, or invalidation state; runner/review/finalization read
those live. Final score/counts and answer correctness are stored when finalized.

The first-attempt API lock normally prevents changes, but attempt records are
not self-contained historical snapshots. Privileged out-of-band changes could
alter display or unfinished-attempt scoring. Duration and question selection
are fixed at creation; later availability edits do not move `expires_at`.

## 12. Answer Persistence

`QuizRunner` autosaves selections through the authenticated answer API,
optimistically updating UI and rolling back that selection on failure.
`development.save_quiz_answer()` locks the attempt; validates owner,
in-progress/expiry state, attempt-question membership, and option ownership;
then upserts the answer. A selection can change before finalization, not after.
`is_correct` stays null during the attempt, so save responses do not leak it.

## 13. Submission and Scoring

The submit API passes the authenticated member to
`development.finalize_quiz_attempt()`. It row-locks the attempt and returns an
already-finalized attempt unchanged. Submission after expiry becomes expired.

Finalization compares answers with live correct flags, excludes currently
invalidated groups from the denominator, treats unanswered valid questions as
incorrect, and stores `round(correct_count / total_questions * 100, 2)`, or
zero if no valid question remains. Both submitted and expired finalization set
`submitted_at`; elapsed time is capped at expiry. No pass/fail model exists.
Expiration is finalized lazily by list/start/submit activity; no Quiz expiry
cron was found.

## 14. Results, Retries, and Review

`quiz_member_best_results` selects the highest submitted/expired score and
counts completed attempts. Detailed review unlocks after 100 or exhaustion of
`max_attempts`, then exposes selected/correct answers, options, explanations,
and current invalidation state. The runner never loads correct flags.

History includes all non-voided attempts across cycles, including in-progress.
Its used-attempt count can therefore differ from the list/view count, which
counts only submitted/expired attempts. History does not reapply current member
or cycle status after close, archive, cycle change, or withdrawal.

## 15. Board Workflow

| Capability | CURRENT path |
|---|---|
| Create draft | `/admin/quizzes/new` -> `api/admin/quizzes/create-assessment` |
| Manage versions/content | Edit/questions pages -> versions/questions APIs |
| Edit rules and availability | Manage UI -> rules/availability APIs |
| Publish | Publish page/API -> `publish_quiz_assessment()` |
| Close/archive | Overview/manage UI -> lifecycle API |
| Inspect results/attempts | Results pages and member-attempt/review APIs |

All Quiz admin APIs are Board-guarded and use the server-only service-role
client. No current UI/API was found for access grants, voiding attempts, or
question invalidation.

## 16. Development V2 Consumption

```text
quiz attempts/assessments + cycle members
  -> development.quiz_member_best_results
  -> development.referee_quiz_score
  -> development.referee_monthly_period_metric_scores_v2
  -> development.referee_monthly_development_score_v2
  -> development.referee_monthly_ranking_evidence_v2
  -> development.referee_monthly_ranking_history_v2
  -> development.referee_current_ranking_v2
  -> current/monthly ranking snapshot serving tables
```

The best submitted/expired score is used per scoring assessment. A required
scoring assessment with no result becomes zero when closed/archived, or when
published after its window. Before then it is null. Non-scoring assessments
are excluded; the cycle/member Quiz percentage averages non-null effective
scores.

The monthly layer assigns an assessment by the Los Angeles date of `open_from`
and independently establishes eligible population. It applies stored dates to
all enrollment types, without special `new_member`, `existing_member`, or
`manual_adjustment` behavior.

## 17. Time and Timezone Semantics

Windows and attempt timestamps are `timestamptz`; RPC availability and elapsed
duration use database `now()`. Member list display compares JavaScript instants.
Late-entry filtering and monthly attribution convert `open_from` to an
`America/Los_Angeles` date.

Thus instant availability and date participation are mixed. The intended
`open_until` boundary, DST behavior, and whether participation applies at
opening, attempt start, or throughout the window remain unconfirmed
(`QUIZ-TIME-001`).

## 18. Authorization and Security

- Member APIs require authentication, never trust a client member ID, and RPCs
  revalidate attempt ownership.
- Review/history service-role reads filter by authenticated member; detailed
  review also checks its unlock gate.
- Admin pages inherit a Board guard; APIs independently call `requireBoard()`.
- Baseline Quiz table/RPC grants are service-role-only and tables have RLS
  enabled. Live post-recovery security remains externally unverified.
- `quiz_member_best_results` and `referee_quiz_score` are owner-executed
  (`security_invoker = false`) views. Current app reads them with service role,
  but live grants/exposure need verification (`QUIZ-SEC-001`).
- No supported current assessment/attempt IDOR or early correct-answer leak was
  found. Direct privileged DB access can bypass app lifecycle/content guards.

## 19. Transaction and Concurrency Properties

- Publish validation/mutation, attempt creation/question selection/content lock,
  and finalization/scoring are each atomic RPC operations.
- Each answer is an independent validated upsert; a failed final autosave can
  leave the prior database selection.
- Lifecycle updates condition on source state, limiting transition races.
- Content/rule/availability edits are separate requests. Publication and first
  attempt are not one transaction because published content remains mutable
  until that start.
- Assessment locking safely serializes starts but also serializes different
  members starting the same assessment.

## 20. Representative Persona Matrix

Assuming otherwise-valid assessment dates:

| Persona | Visibility | Attempt eligibility | Development effect |
|---|---|---|---|
| Elena, active `existing_member` | Visible after stored start boundary | Allowed when cycle status active | Included downstream only when ranking-eligible. |
| Nora, active `new_member` | Pre-entry opening hidden unless archived | Opening-date test, unless grant | Stored date only; no enrollment-specific branch. |
| Wendy, withdrawn historical | Can remain visible because list ignores status/end | Withdrawn is accepted; a post-end start can pass if window opened before end | Quiz views include withdrawn; monthly dates may preserve bounded history. |
| Ivan, public `invited`, cycle active/eligible | Visible | Allowed | Public status is ignored; he can receive Quiz and downstream Ranking metrics, contrary to approved participation intent. |
| Iris, active ranking-ineligible | Visible | Allowed | Quiz score may exist; monthly Development/Ranking excludes her. |
| Sam, suspended with cycle `ineligible` | May still be visible | Rejected by cycle status | Current Quiz score population excludes him; history remains. |
| `manual_adjustment` | Stored dates/status only | No special branch | No enrollment-specific scoring semantics; owner decision remains open. |

## 21. Known Gaps and Open Questions

- **QUIZ-POP-001 / TRANSITIONAL:** population boundaries disagree and ignore
  public status; tracked under `POP-001`.
- **QUIZ-RAND-001 / CURRENT:** `randomize_questions = false` is ineffective.
- **QUIZ-HIST-001 / CURRENT:** attempts only partially snapshot content.
- **QUIZ-COUNT-001 / CURRENT:** history and best-results count in-progress
  attempts differently.
- **QUIZ-OPS-001 / UNCERTAIN:** access grants lack a discovered admin workflow.
- **QUIZ-LIFE-001 / CURRENT:** expired attempts are lazily finalized.
- **QUIZ-INVALID-001 / UNCERTAIN:** invalidation affects scoring/review but has
  no discovered operational workflow or confirmed retroactive semantics.
- **QUIZ-TIME-001 / UNCERTAIN:** temporal participation boundary is unapproved.
- **QUIZ-SEC-001 / NEEDS LIVE VERIFICATION:** live RLS/grants/view exposure.

## 22. Evidence

- `src/lib/queries/get-quizzes.ts` — `getQuizzes()`.
- `src/lib/queries/get-quiz-attempt.ts`, `get-quiz-history.ts`,
  `get-quiz-assessment-history.ts`, and `get-quiz-review.ts`.
- `src/components/quizzes/QuizRunner.tsx`.
- `src/app/api/quizzes/` and `src/app/api/admin/quizzes/`.
- `src/app/(admin)/admin/layout.tsx` — inherited Board boundary.
- `supabase/migrations/20260831185011_remote_schema.sql` — CURRENT repository
  baseline for tables, enums, constraints, indexes, RLS/grants, views, and the
  four Quiz RPCs.
- `docs/audit/supabase/` — historical supporting evidence only.

## 23. Change Impact Checklist

Before changing Quiz, verify member list/start/history/review, Board surfaces,
RPC contracts, RLS/grants, content-lock/publication invariants, attempt
concurrency and reproducibility, Los Angeles boundaries, canonical population,
Development aggregation, Ranking evidence/snapshots, and related Source of
Truth classifications.
