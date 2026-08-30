# Supabase Cron Jobs

## Purpose

Capture the scheduled PostgreSQL jobs currently configured in the CAFLA Supabase project through `pg_cron`.

Cron jobs represent automated database behavior that may invoke functions or SQL commands without any direct call from the CAFLA application repository.

They must therefore be considered when determining whether a database function, table, view, or other object is actively used.

---

## Scope

This inventory captures jobs registered in:

- `cron.job`

Metadata captured:

- Job ID
- Job name
- Schedule
- SQL command
- Database
- Database user
- Node
- Port
- Active state

Unlike previous inventory queries, this query is not restricted by application schema because `pg_cron` stores scheduled jobs centrally in the `cron` schema.

---

## Query

```sql
select
  jobid,
  schedule,
  command,
  nodename,
  nodeport,
  database,
  username,
  active,
  jobname
from cron.job
order by
  jobid;
```

---

## Result

```json
[
  {
    "jobid": 1,
    "schedule": "0 0 1 * *",
    "command": " select run_monthly_ranking_snapshot(); ",
    "nodename": "localhost",
    "nodeport": 5432,
    "database": "postgres",
    "username": "postgres",
    "active": true,
    "jobname": "monthly-ranking-snapshot"
  },
  {
    "jobid": 2,
    "schedule": "*/15 * * * *",
    "command": "\r\n        select development.refresh_active_cycle_ranking_snapshot();\r\n    ",
    "nodename": "localhost",
    "nodeport": 5432,
    "database": "postgres",
    "username": "postgres",
    "active": true,
    "jobname": "refresh-current-development-ranking"
  },
  {
    "jobid": 3,
    "schedule": "10 0 1 * *",
    "command": "\r\n        select development.capture_previous_month_ranking_snapshot();\r\n    ",
    "nodename": "localhost",
    "nodeport": 5432,
    "database": "postgres",
    "username": "postgres",
    "active": true,
    "jobname": "capture-monthly-development-ranking"
  }
]
```

---

## Result Interpretation

Each row represents one scheduled PostgreSQL job.

Important fields:

- `jobid` — internal identifier assigned by `pg_cron`.
- `jobname` — human-readable job identifier, when defined.
- `schedule` — cron expression controlling when the job executes.
- `command` — SQL command executed by the job.
- `database` — PostgreSQL database against which the command runs.
- `username` — database role used to execute the job.
- `nodename` — PostgreSQL host/node configured for execution.
- `nodeport` — PostgreSQL port.
- `active` — whether the scheduled job is currently enabled.

---

## Dependency Significance

Cron jobs create dependencies that may not appear in application code.

For example:

```text
pg_cron
   ↓
scheduled job
   ↓
PostgreSQL function
   ↓
views / tables
```

Therefore, a function with zero references in the Next.js repository may still be an active production dependency if it is invoked by a cron job.

The SQL contained in the `command` field must later be cross-referenced with:

- `08-functions-and-rpcs.md`
- `12-database-dependencies.md`
- Application repository references

---

## Audit Notes

The presence of a cron job does not by itself prove that the job is functioning correctly.

This inventory establishes only its current configuration.

A later audit may separately verify:

- Whether the job is active.
- Whether its referenced function/object still exists.
- Whether executions are succeeding.
- Whether the schedule remains intentional.
- Whether the execution role is appropriate.
- Whether duplicate or obsolete jobs exist.

Job execution history is not included in this inventory.

---

## Preliminary Observation

Scheduled jobs must be treated as active callers until proven otherwise.

Functions or objects referenced by an active cron command must not be classified as unused solely because they have no application-code references.

No cron job is classified as obsolete from this inventory alone.

---

## Audit Status

**Cron job inventory captured — classification pending.**

No database changes were performed as part of this audit.