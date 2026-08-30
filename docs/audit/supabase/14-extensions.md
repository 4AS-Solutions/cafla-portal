# Supabase PostgreSQL Extensions

## Purpose

Capture the PostgreSQL extensions currently installed in the CAFLA Supabase project.

Extensions provide database capabilities beyond core PostgreSQL and may introduce functions, schemas, scheduled jobs, data types, or other infrastructure used by the application.

This inventory helps identify infrastructure dependencies that must be preserved during database cleanup.

---

## Scope

This inventory includes all PostgreSQL extensions currently installed in the Supabase database.

Unlike most previous audit files, this query is intentionally not restricted to:

- `public`
- `tournaments`
- `development`

Extensions may be installed into system or extension-specific schemas while still providing functionality required by CAFLA.

---

## Query

```sql
select
  e.extname as extension_name,
  e.extversion as extension_version,
  n.nspname as installed_schema
from pg_extension e
join pg_namespace n
  on n.oid = e.extnamespace
order by
  e.extname;
```

---

## Result

```json
[
  {
    "extension_name": "pg_cron",
    "extension_version": "1.6.4",
    "installed_schema": "pg_catalog"
  },
  {
    "extension_name": "pg_stat_statements",
    "extension_version": "1.11",
    "installed_schema": "extensions"
  },
  {
    "extension_name": "pgcrypto",
    "extension_version": "1.3",
    "installed_schema": "extensions"
  },
  {
    "extension_name": "plpgsql",
    "extension_version": "1.0",
    "installed_schema": "pg_catalog"
  },
  {
    "extension_name": "supabase_vault",
    "extension_version": "0.3.1",
    "installed_schema": "vault"
  },
  {
    "extension_name": "uuid-ossp",
    "extension_version": "1.1",
    "installed_schema": "extensions"
  }
]
```

---

## Result Interpretation

Each row represents one PostgreSQL extension installed in the database.

Important fields:

- `extension_name` — PostgreSQL extension identifier.
- `extension_version` — currently installed version.
- `installed_schema` — schema containing the extension's database objects.

Extensions may provide capabilities such as:

- Scheduled database jobs.
- Cryptographic functions.
- UUID generation.
- HTTP/network functionality.
- Statistics or monitoring.
- Specialized indexing or data types.

---

## Audit Notes

An extension must not be considered unused merely because its name does not appear in the CAFLA application repository.

Extensions may be used indirectly through:

- PostgreSQL functions.
- Default expressions.
- Cron jobs.
- Triggers.
- Supabase infrastructure.
- Other installed extensions.

Removing PostgreSQL extensions is outside the scope of the initial cleanup process unless a separate dependency analysis proves that removal is safe.

Supabase-managed or platform-related extensions require additional caution.

---

## Preliminary Observation

Installed extensions establish part of the infrastructure baseline of the current CAFLA database.

Extension usage will later be cross-referenced with other audit evidence where relevant.

No extension is classified as obsolete or safe to remove from this inventory alone.

---

## Audit Status

**PostgreSQL extension inventory captured — classification pending.**

No database changes were performed as part of this audit.