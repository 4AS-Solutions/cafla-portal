# Module Name

> Copy this template into the relevant module document. Remove instructional
> text only after the section has been populated from verified evidence.

## 1. Purpose

What responsibility does this module own? Define its boundaries without
claiming behavior that has not been verified.

## 2. Status

Use one primary status from `00-README.md`:

`CURRENT | TRANSITIONAL | LEGACY | RETIRED | PLANNED | UNCERTAIN`

Explain the evidence supporting the classification. CURRENT does not imply
functional completeness.

## 3. User-Facing Surfaces

List verified member/admin routes, pages, and relevant components.

## 4. Application Implementation

List current queries, services, API routes, actions, and helpers by stable path
and symbol.

## 5. Data Model

List verified tables, views, functions/RPCs, constraints, and other relevant
database objects. Identify object type, schema, status, and evidence source.

## 6. Data Ownership

Distinguish data owned by this module from data consumed from another module.

## 7. Business Rules

Record confirmed CAFLA rules only. Label implementation behavior separately
when it is not established as an approved business rule.

## 8. Runtime Flow

Trace the verified flow through UI, server code, database objects, and relevant
downstream consumers.

## 9. Authorization & Security

Document authentication, member/board boundaries, ownership checks, RLS,
service-role use, and security-sensitive functions where verified.

## 10. Time & Timezone Rules

Document confirmed time windows, deadlines, date boundaries, and timezone
handling when applicable.

## 11. Dependencies

Identify upstream/downstream modules and application/database dependencies.
Include functions, triggers, foreign keys, policies, grants, and cron callers
where relevant.

## 12. CURRENT vs Historical/Retired

Describe important replaced architecture only when it clarifies the current
boundary or prevents reintroduction. Do not present retired objects as current.

## 13. Known Limitations / Technical Debt

Record verified limitations only, with evidence and impact.

## 14. Open Questions

Record unresolved facts, evidence conflicts, and business-rule questions. Link
cross-module issues to `16-open-questions-and-known-gaps.md`.

## 15. Evidence

Use stable paths and symbols:

```text
Evidence:
- `src/path/file.ts` — `symbolName()`

Database:
- `schema.object` — object type — STATUS
  Evidence: named current output or historical audit source with its boundary
```

## 16. Change Impact Checklist

Before changing this module, verify as applicable:

- user and admin surfaces;
- API/server behavior;
- authentication and authorization;
- data ownership and current callers;
- database-internal dependencies;
- business rules, nullability, and empty/error states;
- timezone and lifecycle boundaries;
- upstream and downstream module effects;
- Source of Truth and status-matrix updates;
- validation and rollback requirements.

