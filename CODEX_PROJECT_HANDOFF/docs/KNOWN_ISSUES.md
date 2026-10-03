# Known Issues and Uncertainties

Status labels distinguish a known defect/risk from work that is merely not yet verified.

## Release Blockers

1. **PARTIAL - Production mobile publishing path:** A staff publish must be proven through deployed API/Supabase to a physical iPhone or production-like development build, including offline recovery and rollback.
2. **PARTIAL - Push delivery:** APNs, EAS credentials, opt-in/registration, scheduled delivery, retry behavior, receipts, and notification-opening flows are not physically verified.
3. **PLANNED - Apple release path:** Apple Developer access/enrollment, signing, EAS build credentials, TestFlight, App Store privacy/reviewer content, and submission are incomplete.
4. **UNKNOWN - Production configuration:** This handoff did not query Vercel, Supabase, Expo, Apple, or DNS. Environment presence, migration state, deployed commit, custom domain, and auth behavior must be inspected directly before a live claim.

## Data and Content Risks

1. **PARTIAL - 2026 schedule completeness:** Several reviewed ROS records lack complete times. Do not create end times, rooms, assignments, or eligibility rules without approved source data.
2. **PARTIAL - Canonical pre-show correction:** Local Awards presentation says 7:00 PM; an older documented canonical cloud value may be 7:30 PM. Reconcile and publish a verified canonical revision before treating it as synchronized.
3. **UNKNOWN - 2026 Awards people/media:** Cheryl identity/role/image, final iHeart stream URL, and remaining talent/headshots need approved source data. Confirmed attendance is not enough.
4. **PARTIAL - Awards RSVP:** The independent Netlify RSVP site was not developed in this repository. Phone requirement, exact RSVP statuses, owner/admin access, sharing workflow, privacy notice, and data retention are unresolved.
5. **PARTIAL - Ticket reservations:** A Supabase table/migration exists. Do not assume it is an approved or live public ticket flow; treat any records as potentially real data.

## Security and Operational Risks

1. **UNKNOWN - Shared GitHub credential revocation:** The owner reported sharing a GitHub token with a former collaborator. Account access removal alone is insufficient; revoke that token and verify no other owner credential was shared. Never paste it into chat or code.
2. **PARTIAL - Staff policy:** The current portal policy auto-activates invited staff identity as `ADMIN` at sign-in. This is broad authority and should receive an explicit production policy review.
3. **PARTIAL - AI provider state:** The server-side OpenAI adapter/config exists, but current key, billing/credits, feature flags, model, evaluation quality, and actual production use remain unverified.
4. **UNKNOWN - Database deployment/RLS:** Migrations include RLS and guarded functions, but deployed policy state and realistic-role testing need review before staging/production changes.
5. **PARTIAL - Local adapter data:** `work/live-ops-store.json` is operational local state. It may not match Supabase; never replace or seed it without an explicit revision-aware migration/backup procedure.

## Presentation and QA Follow-Up

- Latest website design/content adjustments are local work until the deployed site and target viewport are inspected.
- Some historical documentation contains older test counts, dates, and launch conclusions. Prefer code, checked service state, and current test output over old reports.
- Native asset changes may not be visible in an already-installed Simulator bundle; rebuild/reload the correct development build before judging assets.
