# Architecture

## System Shape

This pnpm workspace operates three separate product surfaces against shared contracts:

| Surface | Location | Purpose | Status |
| --- | --- | --- | --- |
| Native attendee app | `apps/mobile` | Expo Router / React Native iOS-first event experience | IMPLEMENTED |
| Staff portal and API | `apps/admin` | Next.js staff operations, drafts, publishing, notifications, content operations | IMPLEMENTED; production configuration needs verification |
| Public website | `apps/web` | Next.js Summit and Awards marketing site plus responsive browser companion | IMPLEMENTED; latest local changes need deployment verification |

Shared packages are deliberate boundaries, not optional copies:

- `packages/config`: validated configuration and environment access.
- `packages/validation`: Zod schemas and API types.
- `packages/domain`: schedule grouping, visibility, current/upcoming logic, time rendering, and publication rules.
- `packages/api-client`: typed published-snapshot client.
- `packages/design-tokens`: shared design values.
- `packages/test-fixtures`: schema-validated fixtures.
- `supabase`: schema migrations and local seed material.

## Canonical Data Flow

```text
Staff portal -> server-side repository / transactional publish -> Supabase published revision
                                                 |                         |
                                                 v                         v
                                      audit + notification jobs      safe public snapshot
                                                                            |
                                      +-------------------------------------+-------------------+
                                      |                                                         |
                                      v                                                         v
                            native attendee app                                      public website/browser
                            validates + caches snapshot                              reads safe projection
```

`apps/admin/lib/live-ops-repository.ts` selects Supabase only when valid server configuration is available; otherwise it uses the local adapter at `work/live-ops-store.json`. The adapter supports development and preview, but is not the cloud production source of truth.

The mobile app validates remote snapshots before replacing its last valid AsyncStorage cache. The web app reads the safe published projection through the API and has reviewed offline fallback behavior. Neither attendee surface should ever consume a draft or privileged database record.

## Backend and Security Boundaries

Supabase migrations establish events, locations, schedule items, announcements, notification jobs, audit logs, staff profiles, speakers, drafts, proposals, import jobs, revisions, production audit entries, device registrations, notification delivery attempts, and ticket reservations. RLS plus guarded server-side functions are intended to control staff access and atomic publishing.

The authoritative migration sequence is in `supabase/migrations/`. Do not infer deployed schema state solely from the files; verify migrations and policies before operating staging or production.

AI and notification dispatch are server-side adapters. They may enrich operations but must fail independently of core attendee information. Public bundles may use only explicitly public client values.

## Website Boundaries

- Summit is the lighter, richer-information public experience.
- Awards is the darker, compact public promotional experience.
- Awards may link to Summit, but must not become a duplicate of the Summit schedule or staff portal.
- The web browser companion is responsive web, not a replacement for the native attendee app.
- Public UI components are platform-specific; schemas and published data are shared.

## Ownership Boundary

The owner-controlled repository, deployments, backend, and Expo project are independent of collaborator forks. Do not synchronize or merge outside changes without a specific owner request. See `docs/PROJECT_OWNERSHIP.md` and `docs/DECISIONS.md`.
