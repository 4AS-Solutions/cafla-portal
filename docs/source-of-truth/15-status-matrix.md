# CAFLA Status Matrix

## Purpose

This matrix records evidence-based status classifications for modules,
capabilities, and architecture/database objects. It is not a deletion list and
does not replace the supporting module documents.

Use the definitions and evidence hierarchy in [`00-README.md`](./00-README.md).

## Instructions

- Add a row only after reviewing current runtime and relevant database
  dependencies.
- Use exactly one primary status: CURRENT, TRANSITIONAL, LEGACY, RETIRED,
  PLANNED, or UNCERTAIN.
- Cite stable repository paths/symbols and named database evidence.
- For RETIRED entries, identify a replacement only when confirmed.
- Record conflicts or insufficient evidence as UNCERTAIN rather than guessing.
- A classification is documentation, not authorization for database or file
  deletion.

## Matrix

| Domain / Module | Object / Capability | Layer | Status | Source of Evidence | Replacement (if retired) | Notes |
|---|---|---|---|---|---|---|
| Attendance | Attendance V2 | Application + database | CURRENT | Confirmed architecture context; current runtime and `development` evidence must be detailed in `06-attendance.md` | — | CURRENT does not assert product completeness. |
| Quiz | Quiz V2 | Application + database | CURRENT | Confirmed architecture context; current runtime and `development` evidence must be detailed in `07-quiz.md` | — | CURRENT does not assert product completeness. |
| Evaluations | `public.evaluations` | Database table | CURRENT | Confirmed post-recovery architecture; current application/database chain must be detailed in `08-evaluations.md` | — | Schema `public` does not make the table legacy. |
| Ranking | Ranking V1 | Historical architecture | RETIRED | Confirmed intentional retirement context | Ranking V2 | Do not infer the status of individual unlisted objects from this aggregate row. |

## Review Metadata

- Last evidence review: Foundation only; module audits pending.
- Review owner: UNCERTAIN
- Next review trigger: Population of the first module document or an approved
  architecture change.

