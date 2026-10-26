## October 26 wellness branch — local implementation, no publication

**IMPLEMENTED locally:** wellness-only authenticated feed/STOP port, shared companion build, canonical 30-session mapping, and an atomic capacity/waitlist/cancellation engine with disabled placeholder settings. **PARTIAL:** public booking/cancellation UI binding, existing-record migration and production rollout are not complete. Staff approval/confirmation code and all live data/settings remain unchanged. This dated update supersedes the historical migration-only task statement for this branch; historical records below are retained. See `docs/WELLNESS_REMINDER_REVIEW.txt`.

# Project State

Recorded September 18, 2026 during migration (capture 11:30 UTC). CURRENTLY VERIFIED locally: Git branch/HEAD/status and safe source inventory. Runtime results are LAST KNOWN, not rerun in migration. Latest 421 web tests passed following the September 18 cleanliness pass (around 00:26 America/New_York in preceding session); web TypeScript passed before final CSS/copy pass, isolated web build before final portrait/cleanliness refinements. Full September 17 baseline passed 649 workspace + 27 script tests, lint/typecheck and both builds. Exact dates/scopes matter: no fresh full-current-state build claim. Public endpoints LAST KNOWN inspected September 17 22:02 UTC. External auth/config/deployed commits/migrations/RLS and physical release remain unverified.

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
- Live API revision 9 was checked on September 17 around 22:02 UTC: 26 timed activities, 53 guest records, and five incomplete entries represented in pending-program notes. The preserved local operational store also has revision 9, 26 sessions, and 53 guests.
- Current local reviewed config/fixtures contain 51 guests, excluding Steven Cohen and Alexandra Cohen from attendance while retaining the foundation credit. This follows an existing recorded source review, not a new Airtable inspection in this task. Local filtering and live publication are not synchronized; reconcile approved source data through the staff workflow before making a cross-platform count claim.
- The local Awards UI uses the approved 7:00 PM pre-show correction; the inspected live Awards page and API still say 7:30 PM. No publication occurred in this baseline task.
- Incomplete 2026 details must stay "to be confirmed" rather than receiving invented ends, rooms, speakers, roles, access rules, or biographies.
- Producer/chair credits follow the original ICF allowlist, not Airtable attendance or collaborator lists.
- **IMPLEMENTED locally:** Cherrial Odell's co-chair credit now appears on both current Awards and Summit pages under explicit owner approval on September 17. Her existing original ICF portrait and "Inspiring Children Alumna" credit are reused. Guest counts, canonical API data and the 2025 archive are unchanged; no deployment or mobile/staff roster mutation was performed. Those apps have no separate co-chair presentation to update.

## Local Worktree

**IMPLEMENTED locally / PARTIAL content (September 18):** Summit centered navigation (Awards tab added Sept 18), short 9-18s video loop/direct full-film link, reference-site periwinkle/lavender/pink palette with heart-hands header logo (Sept 18, replaced plum/pearl/mint), simplified categorized gallery, Partners/Venue pages and final cleanliness pass. Awards approved layout retained. Both current contexts share Wolfington and Springer couple cards/photos/profiles; Caroline face crop, Lexi full portrait and distinct Bryan photos implemented. Additional partner logos blocked by interface-only Airtable access. See CURRENT_WORK and SUMMIT_REFRESH. No deploy/publication.

The worktree is intentionally dirty with accumulated owner-authorized changes across mobile, admin, web, shared packages, scripts, tests, documentation, and assets. Do not clean, reset, or bulk-revert it. Inspect provenance before changing files; no claim of collaborator removal should erase later owner-authorized reliability, security, or 2026 work.

CURRENTLY VERIFIED HEAD `a60ba26ce4cc70e11f54cb150d5777bcaebdb03f`, branch `codex/awards-2026-polish`; origin https://github.com/porterthevibecodegoat/Summit-App-2026.git. Migration start: 68 modified tracked, 135 individual untracked, zero staged. Migration adds/updates documentation only; exact final file lists in MIGRATION_STATE.json and transfer integrity/GIT_STATE.json. Existing modifications span mobile/admin/web/packages/scripts/tests/docs/assets and appear intended; next-env.d.ts is generated but tracked and byte-preserved, not cleaned. Frozen CODEX_PROJECT_HANDOFF is duplicate historical provenance, retained/superseded. Known local upstream origin/codex/awards-2026-polish shows 0 ahead/0 behind; no fetch so actual remote freshness UNKNOWN. No checkpoint commit.

Protected earlier recovery checkpoint exists at the active task outputs/Summit-App-2026-recovery-20260917T224459Z, with a tar.gz and dated offline verification. It predates later UI changes and is not imported because it includes operational recovery data. Migration is a newer safe-source transfer, not a sensitive-data/full-history backup.

## Recent Local Verification

Fresh September 17 checks passed in an isolated copy of the exact current source: `pnpm lint`, `pnpm typecheck`, 649 workspace tests, 27 additional HTTP-audit script tests, and both web/admin production builds using default Turbopack. Node 24.19.0 and pnpm 11.19.0 were used. Lint currently runs TypeScript checks, not a separate lint engine. No failures or repairs occurred. Original source, private configuration, and local operational data were preserved. This is local verification, not production or physical-device release approval.
