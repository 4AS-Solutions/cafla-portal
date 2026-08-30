# CAFLA Supabase — AS-IS Audit Evidence

## Purpose

This directory contains a read-only evidence snapshot of the actual Supabase database used by the CAFLA Portal.

The purpose of this evidence package is to support:

1. Reconstruction of the current CAFLA database architecture.
2. Comparison between the live database and the current application repository.
3. Identification of active, legacy, superseded, orphaned, and unknown database objects.
4. Safe removal of confirmed legacy database architecture.
5. Creation of the future CAFLA System Specification / Source of Truth.

These files describe what currently exists in Supabase.

They do **not** by themselves determine what should continue to exist.

---

# Authoritative Context

At the time of this snapshot, CAFLA uses three primary application schemas:

- `public`
- `development`
- `tournaments`

The CAFLA architecture evolved over time.

Originally, most application functionality lived in `public`.

Later generations introduced dedicated schemas such as:

- `development` for referee development functionality.
- `tournaments` for tournament/competition domain functionality.

As a result, objects with similar responsibilities may currently coexist across schemas.

This coexistence must not automatically be interpreted as duplication or proof that an older object is removable.

---

# Evidence Hierarchy

When performing the cleanup audit, use the following evidence hierarchy.

## 1. Current Supabase State

The files in this directory represent direct evidence of what currently exists in the database.

They document:

- schemas
- tables
- views
- columns
- constraints
- foreign keys
- indexes
- functions
- triggers
- RLS
- privileges
- dependencies
- cron jobs
- extensions
- custom types
- storage
- row counts
- sequences

## 2. Current Application Repository

The current CAFLA repository determines how the application actually interacts with Supabase.

Repository analysis should include, where applicable:

- `.from(...)`
- `.schema(...)`
- `.rpc(...)`
- API routes
- server actions
- query modules
- authentication logic
- generated Supabase types
- direct SQL references
- Storage usage
- application constants containing database object names

## 3. Database Internal Dependencies

An object with zero application references may still be active because it is used by:

- another view
- a PostgreSQL function
- a trigger
- a foreign key
- a cron job
- an RLS policy
- another database object

## 4. Historical Documentation

Older CAFLA architecture documents may later be used to understand historical intent.

Historical documentation is **not authoritative evidence of the current implementation** unless verified against the current repository and Supabase state.

---

# Critical Audit Rule

## Existence does not mean active.

An object appearing in this evidence package only proves that it existed in Supabase when the snapshot was captured.

It does not prove that the current CAFLA application uses it.

Likewise:

## Zero application references does not mean removable.

An object may still be required internally by the database or retained for historical data.

---

# Object Classification Model

Objects should eventually be classified using the following categories.

### ACTIVE

Confirmed to participate in the current CAFLA implementation.

Evidence may include application references, database dependencies, cron execution, active data flows, or current architectural responsibility.

### LEGACY_REFERENCED

Belongs to an older architecture but remains referenced by current application or database functionality.

Must not be removed until the dependency is migrated or intentionally retired.

### LEGACY_UNREFERENCED

Appears to belong to superseded architecture and no current application/database dependency has been identified.

This classification still does not authorize deletion.

### REMOVAL_CANDIDATE

Strong evidence indicates that the object is no longer required.

Before removal, dependencies, data retention, replacement architecture, and rollback considerations must still be reviewed.

### UNKNOWN

Available evidence is insufficient or conflicting.

Unknown objects must remain untouched until resolved.

---

# Removal Standard

No database object should be recommended for removal solely because:

- its name looks old;
- it contains `v1`;
- another similarly named object exists;
- the frontend does not directly reference it;
- it contains zero rows;
- it belongs to `public`;
- a newer schema exists.

A strong removal candidate should normally have evidence across several dimensions:

```text
No current application references
        +
No required database dependents
        +
No trigger dependency
        +
No cron dependency
        +
No required function dependency
        +
No unresolved RLS/security dependency
        +
Confirmed replacement or obsolete responsibility
        +
Data retention evaluated
```

Only then should destructive SQL be considered.

---

# Destructive Change Policy

This evidence package is for analysis.

During the initial audit:

**DO NOT modify the database.**

Do not execute or propose automatic execution of:

- `DROP`
- `DELETE`
- `TRUNCATE`
- destructive `ALTER`
- data migrations
- RLS changes
- function replacements
- trigger removal
- cron removal

The initial audit must be read-only.

If removal candidates are later approved, cleanup should occur in small, reviewable batches.

The expected workflow is:

```text
Identify candidate
      ↓
Verify application references
      ↓
Verify database dependencies
      ↓
Verify production/historical data
      ↓
Confirm replacement / obsolescence
      ↓
Preview cleanup
      ↓
Manual approval
      ↓
Backup / rollback consideration
      ↓
Execute targeted cleanup
      ↓
Verify application
```

---

# Evidence Files

## `01-schemas.md`

Schemas included in the CAFLA application audit.

## `02-tables-and-views.md`

Inventory of base tables and standard PostgreSQL views.

## `03-materialized-views.md`

Inventory of materialized views.

## `04-columns.md`

Column-level metadata including data types, nullability, defaults, and underlying PostgreSQL types.

## `05-constraints.md`

Primary key, unique, and check constraints.

## `06-foreign-keys.md`

Foreign key relationships between database tables.

## `07-indexes.md`

Indexes and their PostgreSQL definitions.

## `08-functions-and-rpcs.md`

PostgreSQL functions/RPCs and their complete definitions.

## `09-triggers.md`

Non-internal triggers and their associated functions.

## `10-rls-policies.md`

RLS enabled/forced state and Row Level Security policies.

## `11-grants-and-privileges.md`

Table, view, and routine privileges.

## `12-database-dependencies.md`

Catalog-visible view and function dependencies.

Important limitation:

PostgreSQL does not necessarily expose every relation referenced inside SQL/PLpgSQL function bodies through `pg_depend`.

Function source definitions must therefore also be inspected.

## `13-cron-jobs.md`

Scheduled PostgreSQL jobs configured through `pg_cron`.

Cron jobs must be treated as potential active callers of database functions.

## `14-extensions.md`

Installed PostgreSQL extensions.

## `15-enums-and-custom-types.md`

PostgreSQL enums, domains, ranges, and other audited custom types.

## `16-storage.md`

Supabase Storage bucket configuration and Storage RLS policies.

Individual stored files are intentionally excluded.

## `17-view-definitions.md`

Complete SQL definitions of standard PostgreSQL views.

## `18-table-row-counts.md`

Exact base-table row counts at the time of the snapshot.

No production row contents are included.

## `19-schema-privileges.md`

Schema-level `USAGE` and `CREATE` privileges for principal Supabase roles.

## `20-sequences.md`

PostgreSQL sequences present in the application schemas.

---

# Important Evidence Limitations

This snapshot does not by itself establish:

- whether an application route is currently reachable;
- whether a feature is actively used by users;
- whether historical data must legally or operationally be retained;
- whether every PL/pgSQL dependency appears in `pg_depend`;
- whether a cron job has been executing successfully;
- whether every database object is represented in generated TypeScript types;
- whether external systems depend on CAFLA data;
- whether a zero-row table is obsolete.

Repository analysis and architectural review are still required.

---

# Privacy and Production Data

This evidence package is intended to document architecture, not production records.

Where possible, inventory files contain metadata rather than row contents.

`18-table-row-counts.md` contains counts only.

Individual Storage objects are intentionally excluded.

Future audit files should avoid copying unnecessary member information, authentication information, secrets, credentials, tokens, or other sensitive production data into the repository.

---

# Intended Codex Workflow

When using this evidence package to audit the CAFLA repository:

1. Read this `README.md` first.
2. Inspect the current repository.
3. Search for database object references.
4. Use the individual evidence files only as needed.
5. Construct a map of application → database dependencies.
6. Compare those dependencies with Supabase internal dependencies.
7. Classify objects conservatively.
8. Report uncertainty explicitly.
9. Do not modify code or database during the initial audit.
10. Produce evidence for every proposed removal candidate.

Large evidence files such as `04-columns.md`, `08-functions-and-rpcs.md`, and `17-view-definitions.md` do not need to be read linearly when unnecessary.

Search them for the specific objects being investigated.

---

# Initial Cleanup Focus

The first cleanup audit should pay particular attention to architectural overlap between:

```text
public
    ↕
development
```

especially around functionality such as:

- Attendance
- Quiz
- Development / Ranking
- Dashboard-derived calculations
- Evaluations

However, this is an investigation priority only.

It is **not evidence that the corresponding `public` objects are obsolete**.

The `tournaments` schema must also be audited against current repository usage, but it should not be treated as legacy merely because it was introduced later in CAFLA's evolution.

---

# Expected Audit Output

The initial audit should eventually produce an object matrix similar to:

| Object | Type | App References | DB Dependencies | Data Present | Replacement | Classification | Confidence |
|---|---|---:|---:|---:|---|---|---|
| `schema.object` | TABLE/VIEW/FUNCTION | ... | ... | ... | ... | ACTIVE/LEGACY/UNKNOWN | HIGH/MEDIUM/LOW |

Every `REMOVAL_CANDIDATE` should include a written evidence trail.

---

# Current Status

**Supabase AS-IS evidence snapshot captured.**

**Database cleanup classification has not yet been performed.**

**No database object has been approved for removal based on this evidence package.**