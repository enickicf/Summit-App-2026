# Project State

Last documented: 2026-09-17. This is a repository handoff, not a fresh inspection of external accounts or deployments.

## Product Status

| Area | Status | Evidence / limitation |
| --- | --- | --- |
| Native iOS attendee app | IMPLEMENTED | Expo/React Native app with schedule, current/next state, map/info, local cache, published-snapshot client, and removed personal schedule/demo mode. Physical-device production path remains unproven. |
| Staff Event Control Portal | IMPLEMENTED | Draft/publish/rollback, content/schedule controls, audit and notification foundations exist. Cloud configuration and staff access must be verified before live operations. |
| Public Summit site | IMPLEMENTED | Historical 2025 and current 2026 routes/content architecture exist. Latest local visual/content work is not evidence of deployment. |
| Public Awards site | IMPLEMENTED | Dark compact awards direction, RSVP and iHeart callouts, historical 2025 material, and 2026 promotional model exist. Some source facts still await approval. |
| Canonical publish model | IMPLEMENTED | Shared validated snapshot, revisions, RLS migrations, and server-side publish functions are present. End-to-end cloud proof still required. |
| Airtable 2026 import | PARTIAL | Reviewed data was used read-only for the active 2026 schedule; incomplete facts are intentionally not invented. |
| Push notifications | PARTIAL | Job/delivery architecture and mobile registration foundation exist. APNs/EAS credentials, physical iPhone delivery, retries/receipts, and opening behavior are unproven. |
| AI | PARTIAL | Server-side adapters and guardrails exist. Current billing/credit, enabled state, production behavior, and evaluations require targeted verification. |
| App Store / TestFlight | PLANNED | Apple enrollment, signing, privacy/reviewer material, EAS credentials, and release proof are incomplete. |
| Public transactions / contact flows | PARTIAL | A separate RSVP deployment exists, but ownership, data sharing, phone requirement, privacy, and lifecycle require confirmation. Retired public submission flows must not be reintroduced casually. |

## Current Content Rules

- 2025 is a historical archive drawn from original ICF material.
- 2026 is current event content drawn only from reviewed Airtable records and explicit owner decisions.
- Current active 2026 schedule work was documented as 26 timed activities, 53 confirmed public guests, and five records with incomplete timing. These counts must be rechecked against the canonical published revision before externally presenting them as current.
- Incomplete 2026 details must stay "to be confirmed" rather than receiving invented ends, rooms, speakers, roles, access rules, or biographies.
- Producer/chair credits follow the original ICF allowlist, not Airtable attendance or collaborator lists.

## Local Worktree

The worktree is intentionally dirty with accumulated owner-authorized changes across mobile, admin, web, shared packages, scripts, tests, documentation, and assets. Do not clean, reset, or bulk-revert it. Inspect provenance before changing files; no claim of collaborator removal should erase later owner-authorized reliability, security, or 2026 work.

## Recent Local Verification

Previous work documented successful `pnpm lint`, `pnpm typecheck`, `pnpm test` (649 tests), and web production build using webpack. These are historical checks, not a substitute for rerunning relevant gates after a future code change or before release.
