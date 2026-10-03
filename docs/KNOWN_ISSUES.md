# Known Issues and Uncertainties

September 18 classification: CONFIRMED local/live guest-count/pre-show/projection divergence and missing partner access. UNKNOWN / NEEDS VERIFICATION deployed commit/env/migrations/RLS, physical release, auth/billing, RSVP ownership/privacy and shared token revocation. No new suspected runtime bug investigated in migration. Technical debt: broad all-admin activation and legacy local pre-show correction pending canonical publish. Do not casually refactor cache/publish/security. Latest portrait/couple/cleanliness work is local; checks below are dated LAST KNOWN, not fresh exact-state audit. See CURRENT_WORK.

Status labels distinguish a known defect/risk from work that is merely not yet verified.

## Release Blockers

1. **PARTIAL - Production mobile publishing path:** A staff publish must be proven through deployed API/Supabase to a physical iPhone or production-like development build, including offline recovery and rollback.
2. **PARTIAL - Push delivery:** APNs, EAS credentials, opt-in/registration, scheduled delivery, retry behavior, receipts, and notification-opening flows are not physically verified.
3. **PLANNED - Apple release path:** Apple Developer access/enrollment, signing, EAS build credentials, TestFlight, App Store privacy/reviewer content, and submission are incomplete.
4. **PARTIAL - Production configuration:** September 17 read-only checks confirmed public page/API responses and the custom domain's redirect to the existing ICF Squarespace page. Deployment commit IDs, environment presence, migration/RLS state, and full auth behavior remain unverified. The local baseline does not close these release gates.

## Data and Content Risks

1. **PARTIAL - 2026 schedule completeness:** Several reviewed ROS records lack complete times. Do not create end times, rooms, assignments, or eligibility rules without approved source data.
2. **PARTIAL - Canonical pre-show correction:** Local Awards presentation says 7:00 PM; September 17 inspection confirmed that the live Awards page and revision-9 API still say 7:30 PM. Reconcile and publish an authorized canonical revision before treating it as synchronized.
3. **PARTIAL - 2026 Awards people/media:** The final iHeart stream URL and broader talent approvals still need approved source data. Six owner-requested public portraits are now linked from their public sources for the Awards directory (Anthony Ramos, Alana Springsteen, Caroline Jones, Lexi Hensler, Brandon Saho and Caroline Silby); the source images are not copied into the repository. Confirmed attendance is not enough. The earlier "Cheryl" item is resolved locally: the owner confirmed Cherrial Odell as co-chair, and both current website co-chair sections now reuse her existing ICF portrait and credit. This has not been deployed or added to the canonical attendee roster.
4. **PARTIAL - Awards RSVP:** The independent Netlify RSVP site was not developed in this repository. Phone requirement, exact RSVP statuses, owner/admin access, sharing workflow, privacy notice, and data retention are unresolved.
5. **PARTIAL - Ticket reservations:** A Supabase table/migration exists. Do not assume it is an approved or live public ticket flow; treat any records as potentially real data.
6. **PARTIAL - Guest-count divergence:** The live API and preserved local store have 53 guest records; current local reviewed config/fixtures have 51, excluding Steven and Alexandra Cohen as attendees while retaining foundation credit. Airtable was not re-queried during the baseline. Reconcile approved content without overwriting production or local operational data.

## Security and Operational Risks

1. **UNKNOWN - Shared GitHub credential revocation:** The owner reported sharing a GitHub token with a former collaborator. Account access removal alone is insufficient; revoke that token and verify no other owner credential was shared. Never paste it into chat or code.
2. **PARTIAL - Staff policy:** The current portal policy auto-activates invited staff identity as `ADMIN` at sign-in. This is broad authority and should receive an explicit production policy review.
3. **PARTIAL - AI provider state:** The server-side OpenAI adapter/config exists, but current key, billing/credits, feature flags, model, evaluation quality, and actual production use remain unverified.
4. **UNKNOWN - Database deployment/RLS:** Migrations include RLS and guarded functions, but deployed policy state and realistic-role testing need review before staging/production changes.
5. **PARTIAL - Local adapter data:** `work/live-ops-store.json` is operational local state. It may not match Supabase; never replace or seed it without an explicit revision-aware migration/backup procedure.
6. **PARTIAL - Deployed public projection:** The inspected live API still returns editorial `roleSource` fields that the local public-snapshot projection strips. The latest local security changes are not fully represented by the observed deployed behavior; deployment identity and behavior need targeted verification.

## Presentation and QA Follow-Up

- **PARTIAL - Summit partner assets:** September 18 Airtable discovery verified the Summit base but exposed no accessible interfaces/tables. Additional confirmed 2026 logos cannot yet be imported. The redesigned section shows published snapshot partners only. See `SUMMIT_REFRESH_2026-09-18.md` for media provenance, verification and remaining captions/post-event-reel uncertainty.

- Fresh isolated local checks passed: 649 workspace tests, 27 HTTP-audit script tests, lint/typecheck, and both production builds. See `LOCAL_BASELINE_2026-09-17.md`; these results do not establish browser/device or production acceptance.
- Latest website design/content adjustments are local work until the deployed site and target viewport are inspected.
- Some historical documentation contains older test counts, dates, and launch conclusions. Prefer code, checked service state, and current test output over old reports.
- Native asset changes may not be visible in an already-installed Simulator bundle; rebuild/reload the correct development build before judging assets.
