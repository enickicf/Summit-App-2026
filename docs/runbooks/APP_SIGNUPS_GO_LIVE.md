# App activation sign-ups: go-live (owner-run)

Owner-authorized Sept 18, 2026 for the iOS app. The website is not touched by any step here.

## 1. Supabase (project svertlbvvhemqiqohzmq, SQL editor)

Read-only precheck (run first; every value should be non-empty and `existing` should be null):

```sql
select
  (select string_agg(id, ', ') from public.events) as event_ids,              -- must include not-alone-summit-2026-prototype
  (select pg_get_function_arguments(oid) from pg_proc where proname = 'current_staff_has_role' limit 1) as role_fn,
  (select string_agg(column_name, ', ') from information_schema.columns
     where table_schema = 'public' and table_name = 'production_audit_entries') as audit_columns,
  (select string_agg(pg_get_constraintdef(oid), ' ; ') from pg_constraint
     where conrelid = 'public.production_audit_entries'::regclass and contype = 'c') as audit_checks,
  to_regclass('public.experience_signups')::text as existing;
```

Then run `supabase/migrations/202609180001_experience_signups.sql` (additive: one new table, two
server-only functions; no existing data changed). Rollback if ever needed:
`drop function public.set_experience_signup_status(text, uuid, text, uuid, text); drop function public.upsert_experience_signup(text, uuid, uuid, text, text); drop table public.experience_signups;`

## 2. Vercel staff portal (project summit-app-2026-admin, team sethporterwintertonmusic-6980s-projects)

Run from the repository root. The explicit IDs matter: the root `.vercel` folder links to a project in
another team that you cannot access. `.vercelignore` keeps `.env`, `work/` and build output out of the upload.

```bash
npx vercel@latest login
VERCEL_ORG_ID=team_CyOPEnkvaOyRJEPYolE2iw24 VERCEL_PROJECT_ID=prj_fJ5qNvU6AmY4kquuHI6E4Y0ASYyX npx vercel@latest deploy
```

This makes a preview. After it is checked (health, snapshot, `/api/signups?installId=<uuid>` returns ok):

```bash
VERCEL_ORG_ID=team_CyOPEnkvaOyRJEPYolE2iw24 VERCEL_PROJECT_ID=prj_fJ5qNvU6AmY4kquuHI6E4Y0ASYyX npx vercel@latest promote <preview-url>
```

Rollback: Vercel dashboard -> summit-app-2026-admin -> Deployments -> promote
`summit-app-2026-admin-e4qmeer0l.vercel.app` (main e79087c, Sept 16), the production before this change.

Note: this deploys the current local staff-portal source, which also carries earlier uncommitted
admin work (Sept 17 security/projection changes: 181 admin tests pass, production build passes).
