# Not Alone Summit Engineering Rules

## Start Here

This existing project can move between coding providers. Start with `00_START_HERE.md` and `README.md`, then the order below plus `docs/CURRENT_WORK.md`, `docs/PRODUCTION_GUARDRAILS.md`, `docs/DEPLOYMENTS_AND_PORTALS.md` and `docs/ACCESS_AND_AUTH.md`. Durable memory and actual files replace old conversations. Update current work/state/tasks and decisions after substantial work; never require a retired Codex or Claude conversation.

Read, in order:

1. `docs/HANDOFF.md`
2. `docs/PROJECT_STATE.md`
3. `docs/ARCHITECTURE.md`
4. `docs/DATA_AND_SERVICES.md`
5. `docs/DECISIONS.md`, `docs/KNOWN_ISSUES.md`, and `docs/NEXT_TASKS.md`
6. `docs/PROJECT_OWNERSHIP.md` before any collaborator, deployment, or credential work.

This is one owner-controlled monorepo:

- `apps/mobile`: native Expo/React Native attendee app.
- `apps/admin`: Next.js staff Event Control Portal and owner-controlled API.
- `apps/web`: independently deployed public Summit/Awards website and browser companion.
- `packages/*`: shared configuration, contracts, domain logic, tokens, and fixtures.
- `supabase/*`: database migrations and local seed material.

## Non-Negotiables

- Keep the attendee product native; do not replace it with a website, PWA, WebView, Capacitor app, or desktop-first app.
- Keep staff controls outside the attendee app.
- Mobile, public web, and staff must use one canonical published event model. Do not create parallel schedules for AI, notifications, previews, or "Now".
- Store event instants as UTC and render with an IANA event timezone.
- Draft changes stay invisible to attendees until an authorized atomic publish. A failed AI, notification, analytics, or realtime service must not break cached essential event information.
- Keep privileged credentials server-side. Never expose Supabase service role, OpenAI, Apple, Expo, or push secrets in browser/mobile bundles or docs.
- Supabase RLS and server-side transactional functions are the production authorization and publishing path.
- Airtable is read-only. Attendance is not a speaking role, award, or staff authorization. Do not infer missing facts.
- Historical 2025 content comes from original ICF sources; current 2026 facts come only from reviewed Airtable records or explicit owner direction. Keep years distinct.
- Producer credits are restricted to the original ICF allowlist in `packages/config/src/producer-credits.ts`.
- Do not import, merge, restore, or deploy collaborator code automatically. Preserve owner-approved changes and inspect provenance before reverting.
- Removed demo mode, personal schedules, retired native navigation, and retired public submission flows stay removed unless the owner explicitly restores them.
- Do not seed, delete, reset, or overwrite Supabase, Airtable, RSVP, local live-ops, or user/device data without specific authorization and a reviewed scope.

## Live Data Protection

This project may contain real production and user-submitted data. Preserve it exactly as it exists. If it is unclear whether data is live, assume that it is live and do not modify it.

Never automatically reset or reseed databases, truncate tables, delete records or users, clear storage, remove uploads, recreate production databases, overwrite production data, destructively migrate data, disconnect existing services, or replace live data with sample data. Each requires explicit owner authorization and a reviewed scope.

## Quality and Release Gates

Run the applicable gates before calling a code change release-ready:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm --filter @not-alone/web build
pnpm --filter @not-alone/admin build
```

Also inspect the native iOS Simulator/development build, the staff portal in a browser, and migrations/RLS before staging or production data work. Release readiness requires zero known P0/P1 defects, verified behavior, auditability, and documented limitations.

## Documentation Rule

Keep the files listed above current when architecture, data source, services, decisions, or launch risk changes. Mark statements as `IMPLEMENTED`, `PARTIAL`, `PLANNED`, `BROKEN`, or `UNKNOWN`; never convert an unverified claim into a fact.
