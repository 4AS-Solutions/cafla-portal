# Supabase Schema Privileges

## Purpose

Capture schema-level privileges for the principal PostgreSQL roles used by Supabase and the CAFLA application.

Schema privileges determine whether a role can access objects inside a schema and whether it can create new objects there.

These privileges must be evaluated together with table/function grants and Row Level Security.

---

## Scope

Schemas included:

- `public`
- `tournaments`
- `development`

Roles included:

- `anon`
- `authenticated`
- `service_role`
- `postgres`

Privileges evaluated:

- `USAGE`
- `CREATE`

---

## Query

```sql
select
  n.nspname as schema_name,
  r.rolname as grantee,
  has_schema_privilege(r.oid, n.oid, 'USAGE') as has_usage,
  has_schema_privilege(r.oid, n.oid, 'CREATE') as has_create
from pg_namespace n
cross join pg_roles r
where n.nspname in ('public', 'tournaments', 'development')
  and r.rolname in (
    'anon',
    'authenticated',
    'service_role',
    'postgres'
  )
order by
  n.nspname,
  r.rolname;
```

---

## Result

```json
[
  {
    "schema_name": "development",
    "grantee": "anon",
    "has_usage": false,
    "has_create": false
  },
  {
    "schema_name": "development",
    "grantee": "authenticated",
    "has_usage": false,
    "has_create": false
  },
  {
    "schema_name": "development",
    "grantee": "postgres",
    "has_usage": true,
    "has_create": true
  },
  {
    "schema_name": "development",
    "grantee": "service_role",
    "has_usage": true,
    "has_create": false
  },
  {
    "schema_name": "public",
    "grantee": "anon",
    "has_usage": true,
    "has_create": false
  },
  {
    "schema_name": "public",
    "grantee": "authenticated",
    "has_usage": true,
    "has_create": false
  },
  {
    "schema_name": "public",
    "grantee": "postgres",
    "has_usage": true,
    "has_create": true
  },
  {
    "schema_name": "public",
    "grantee": "service_role",
    "has_usage": true,
    "has_create": false
  },
  {
    "schema_name": "tournaments",
    "grantee": "anon",
    "has_usage": true,
    "has_create": false
  },
  {
    "schema_name": "tournaments",
    "grantee": "authenticated",
    "has_usage": true,
    "has_create": false
  },
  {
    "schema_name": "tournaments",
    "grantee": "postgres",
    "has_usage": true,
    "has_create": true
  },
  {
    "schema_name": "tournaments",
    "grantee": "service_role",
    "has_usage": true,
    "has_create": false
  }
]
```

---

## Result Interpretation

Each row represents the effective schema privileges of one PostgreSQL role.

Important fields:

- `schema_name` — PostgreSQL schema being evaluated.
- `grantee` — role whose privileges are being checked.
- `has_usage` — whether the role may access objects inside the schema, subject to object-level grants.
- `has_create` — whether the role may create new objects inside the schema.

### USAGE

`USAGE` allows a role to resolve and access objects inside a schema.

It does not automatically grant access to the tables or functions themselves.

Effective access still depends on object-level privileges.

### CREATE

`CREATE` allows a role to create new objects inside the schema.

For normal application-facing roles such as `anon` or `authenticated`, broad `CREATE` access would generally deserve additional security review.

---

## Security Model

Effective access should be evaluated as:

```text
Schema privilege
        +
Table / function privilege
        +
RLS state
        +
RLS policy
        +
Function security mode
        +
Application authentication context
```

For example:

```text
authenticated
    ↓
USAGE on development
    ↓
SELECT on development.some_table
    ↓
RLS policy
    ↓
Permitted rows
```

---

## Audit Notes

This inventory checks effective privileges for the principal Supabase roles rather than attempting to enumerate every PostgreSQL role in the database.

Internal or platform-managed roles may exist but are outside the initial CAFLA application-access audit unless later analysis identifies a reason to inspect them.

A role having `USAGE` on a schema is not inherently unsafe.

Likewise, a role lacking `USAGE` may explain why an otherwise correctly configured object cannot be reached by the application.

---

## Preliminary Observation

This inventory will later help identify:

- Which schemas are directly reachable by authenticated clients.
- Whether anonymous clients can resolve objects in non-public schemas.
- Whether application roles have unexpected schema creation privileges.
- Whether differences between `public`, `development`, and `tournaments` are intentional.

No schema privilege is classified as incorrect from this inventory alone.

---

## Audit Status

**Schema privilege inventory captured — security classification pending.**

No database changes were performed as part of this audit.