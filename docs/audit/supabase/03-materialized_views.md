# Supabase Materialized Views

## Query

```sql
select
  schemaname,
  matviewname
from pg_matviews
where schemaname in ('public', 'tournaments', 'development')
order by schemaname, matviewname;
```

## Result

No rows returned.

## Audit Note

No materialized views currently exist in the audited schemas.