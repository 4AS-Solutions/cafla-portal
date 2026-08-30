# Supabase Storage

## Purpose

Capture the current Supabase Storage configuration used by the CAFLA project.

Storage is maintained primarily through Supabase's `storage` schema and is therefore audited separately from the CAFLA application schemas:

- `public`
- `tournaments`
- `development`

This inventory focuses on storage architecture and access control rather than individual uploaded files.

---

## Scope

This audit captures:

1. Storage buckets.
2. Bucket configuration.
3. File size restrictions.
4. MIME type restrictions.
5. Public/private bucket state.
6. RLS policies associated with Storage buckets and objects.

Individual rows from `storage.objects` are intentionally not inventoried in this architectural snapshot.

---

# Part 1 — Storage Buckets

## Query

```sql
select
  id,
  name,
  owner_id,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at,
  updated_at
from storage.buckets
order by name;
```

---

## Result

```json
[
  {
    "id": "images",
    "name": "images",
    "owner_id": null,
    "public": true,
    "file_size_limit": null,
    "allowed_mime_types": null,
    "created_at": "2026-03-17 06:31:08.704557+00",
    "updated_at": "2026-03-17 06:31:08.704557+00"
  },
  {
    "id": "match-rosters",
    "name": "match-rosters",
    "owner_id": null,
    "public": false,
    "file_size_limit": 10485760,
    "allowed_mime_types": [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp"
    ],
    "created_at": "2026-03-08 03:54:03.638874+00",
    "updated_at": "2026-03-08 03:54:03.638874+00"
  },
  {
    "id": "system-assets",
    "name": "system-assets",
    "owner_id": null,
    "public": true,
    "file_size_limit": null,
    "allowed_mime_types": null,
    "created_at": "2026-05-13 21:59:55.796248+00",
    "updated_at": "2026-05-13 21:59:55.796248+00"
  }
]
```

---

## Bucket Result Interpretation

Each row represents one Supabase Storage bucket.

Important fields:

- `id` — bucket identifier.
- `name` — bucket name.
- `owner_id` — bucket owner metadata, when applicable.
- `public` — whether files can be accessed through public Storage URLs.
- `file_size_limit` — bucket-specific maximum file size, when configured.
- `allowed_mime_types` — MIME types permitted by the bucket, when restricted.
- `created_at` — bucket creation timestamp.
- `updated_at` — latest bucket metadata update timestamp.

A `null` restriction does not necessarily indicate a configuration problem. It may mean the bucket inherits/defaults to broader Storage behavior.

---

# Part 2 — Storage RLS Policies

## Query

```sql
select
  schemaname as table_schema,
  tablename as table_name,
  policyname as policy_name,
  permissive,
  roles,
  cmd as command,
  qual as using_expression,
  with_check as with_check_expression
from pg_policies
where schemaname = 'storage'
  and tablename in ('objects', 'buckets')
order by
  tablename,
  policyname;
```

---

## Result

```json
[
  {
    "table_schema": "storage",
    "table_name": "objects",
    "policy_name": "Center referee or board can delete match rosters",
    "permissive": "PERMISSIVE",
    "roles": "{authenticated}",
    "command": "DELETE",
    "using_expression": "((bucket_id = 'match-rosters'::text) AND ((EXISTS ( SELECT 1\n   FROM members\n  WHERE ((members.id = auth.uid()) AND (members.role = 'board'::member_role)))) OR (EXISTS ( SELECT 1\n   FROM matches\n  WHERE ((matches.arbiter_match_id = (storage.foldername(objects.name))[1]) AND (matches.center_referee_id = auth.uid()))))))",
    "with_check_expression": null
  },
  {
    "table_schema": "storage",
    "table_name": "objects",
    "policy_name": "Center referee or board can update match rosters",
    "permissive": "PERMISSIVE",
    "roles": "{authenticated}",
    "command": "UPDATE",
    "using_expression": "((bucket_id = 'match-rosters'::text) AND ((EXISTS ( SELECT 1\n   FROM members\n  WHERE ((members.id = auth.uid()) AND (members.role = 'board'::member_role)))) OR (EXISTS ( SELECT 1\n   FROM matches\n  WHERE ((matches.arbiter_match_id = (storage.foldername(objects.name))[1]) AND (matches.center_referee_id = auth.uid()))))))",
    "with_check_expression": "((bucket_id = 'match-rosters'::text) AND ((EXISTS ( SELECT 1\n   FROM members\n  WHERE ((members.id = auth.uid()) AND (members.role = 'board'::member_role)))) OR (EXISTS ( SELECT 1\n   FROM matches\n  WHERE ((matches.arbiter_match_id = (storage.foldername(objects.name))[1]) AND (matches.center_referee_id = auth.uid()))))))"
  },
  {
    "table_schema": "storage",
    "table_name": "objects",
    "policy_name": "Center referee or board can upload match rosters",
    "permissive": "PERMISSIVE",
    "roles": "{authenticated}",
    "command": "INSERT",
    "using_expression": null,
    "with_check_expression": "((bucket_id = 'match-rosters'::text) AND ((EXISTS ( SELECT 1\n   FROM members\n  WHERE ((members.id = auth.uid()) AND (members.role = 'board'::member_role)))) OR (EXISTS ( SELECT 1\n   FROM matches\n  WHERE ((matches.arbiter_match_id = (storage.foldername(objects.name))[1]) AND (matches.center_referee_id = auth.uid()))))))"
  },
  {
    "table_schema": "storage",
    "table_name": "objects",
    "policy_name": "Center referee or board can view match rosters",
    "permissive": "PERMISSIVE",
    "roles": "{authenticated}",
    "command": "SELECT",
    "using_expression": "((bucket_id = 'match-rosters'::text) AND ((EXISTS ( SELECT 1\n   FROM members\n  WHERE ((members.id = auth.uid()) AND (members.role = 'board'::member_role)))) OR (EXISTS ( SELECT 1\n   FROM matches\n  WHERE ((matches.arbiter_match_id = (storage.foldername(objects.name))[1]) AND (matches.center_referee_id = auth.uid()))))))",
    "with_check_expression": null
  }
]
```

---

## Storage Policy Interpretation

Supabase Storage authorization is backed by PostgreSQL Row Level Security.

Policies on `storage.objects` may control operations such as:

- Reading files.
- Uploading files.
- Updating files.
- Deleting files.

Important fields:

- `table_name` — Storage relation protected by the policy.
- `policy_name` — policy identifier.
- `roles` — roles to which the policy applies.
- `command` — operation controlled by the policy.
- `using_expression` — controls access to existing rows.
- `with_check_expression` — controls creation or modification of rows.

Policies may reference properties such as:

- `bucket_id`
- authenticated user identity
- object path/folder structure
- metadata

---

## Audit Notes

A bucket being `public = true` and a Storage RLS policy are related but distinct security concerns.

Storage access must later be evaluated using:

```text
Bucket configuration
        +
Storage RLS
        +
Application upload/download implementation
        +
Authentication context
```

Individual Storage objects are intentionally excluded from this inventory because this document is intended to capture architecture rather than user-generated file contents.

If cleanup of actual stored files is eventually required, it must be performed as a separate data-retention audit.

---

## Preliminary Observation

This inventory will later help determine:

1. Which Storage buckets belong to active CAFLA functionality.
2. Which application modules use each bucket.
3. Whether buckets are public or private.
4. How authenticated access is enforced.
5. Whether any obsolete buckets remain from previous implementations.

No bucket or Storage policy is classified as obsolete or safe to remove from this inventory alone.

---

## Audit Status

**Supabase Storage inventory captured — classification pending.**

No database or Storage changes were performed as part of this audit.