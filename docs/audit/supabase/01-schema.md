# Supabase Schemas

## Scope

Current CAFLA schemas included in this audit:

- `public`
- `tournaments`
- `development`

## Query

```sql
select
  nspname as schema_name
from pg_namespace
where nspname in ('public', 'tournaments', 'development')
order by nspname;
```

## Result

[
  {
    "schema_name": "development"
  },
  {
    "schema_name": "public"
  },
  {
    "schema_name": "tournaments"
  }
]

## Audit Note

Three application schemas were found.