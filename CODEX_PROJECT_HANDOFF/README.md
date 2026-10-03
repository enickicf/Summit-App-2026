# Not Alone Summit Platform

An owner-controlled digital platform for Inspiring Children Foundation's Not Alone Summit and Not Alone Awards: a native iOS attendee app, staff Event Control Portal, and public Summit/Awards website.

## North Star

Build a reliable, calm, event-ready system that lets attendees access essential event information and lets authorized staff safely manage approved content, publishing, and communications. The native app, public web experience, and staff portal remain distinct products while sharing one canonical published event model.

The platform serves attendees, event staff, and the public. It preserves original 2025 ICF material as a historical archive while using reviewed 2026 source data for the current event. Unknown facts remain unconfirmed; the system must never invent event details.

## Direction and Milestones

1. Verify staging/service configuration and access boundaries.
2. Reconcile, approve, and publish canonical 2026 content.
3. Prove staff edit-to-publish-to-mobile/web behavior, rollback, and offline recovery.
4. Finish owned public RSVP/contact workflows and final website content.
5. Activate and physically test push/AI only when authorized credentials are available.
6. Complete Apple/TestFlight/App Store release work and final acceptance.

## Where We Are

The native attendee app, staff portal/API, public Summit site, public Awards site, shared data contracts, Supabase migration foundation, published-snapshot architecture, offline cache, and notification/AI foundations are implemented. The principal remaining work is verified cloud operations, final content, push/AI activation, public workflow ownership, and App Store readiness. See the detailed status before treating any service as live or release-ready.

Important direction changes: native remains native; staff controls stay outside the app; attendees see the event-wide schedule rather than personal schedules; demo mode and retired submission flows stay removed; Airtable is read-only; and no collaborator updates are imported automatically.

## Technology

- Expo / React Native / Expo Router / TypeScript for the iOS-first attendee app
- Next.js / React / TypeScript for staff portal/API and public web
- pnpm workspaces with shared Zod contracts and domain logic
- Supabase Postgres, Auth, RLS, revisions, audit, and future server-side operations

## Run Locally

```bash
pnpm install
pnpm dev:mobile
pnpm dev:admin
pnpm dev:web
pnpm lint
pnpm typecheck
pnpm test
```

Read the environment examples and service documentation before connecting any external system. Never place secret values in public/mobile variables or source control.

## Detailed Documentation

- [Project handoff](docs/HANDOFF.md)
- [Current project state](docs/PROJECT_STATE.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Data and services](docs/DATA_AND_SERVICES.md)
- [Key decisions](docs/DECISIONS.md)
- [Known issues](docs/KNOWN_ISSUES.md)
- [Prioritized next tasks](docs/NEXT_TASKS.md)
- [Ownership and collaboration boundary](docs/PROJECT_OWNERSHIP.md)

Update this README only when the objective, roadmap, major milestone, or high-level direction materially changes.
