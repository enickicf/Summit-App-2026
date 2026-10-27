## October 26 booking workflow — IMPLEMENTED locally, disabled

The web booking writer adds conditional `wellness/ledger-v1.json` transitions and immutable `wellness-intakes/<uuid>.json` payloads plus journal copies in the existing Netlify staff store. Source workshops keep original IDs, timestamps and waivers; cancellations live in the new audit/ledger. Pending source materialization suppresses all intake reminders. Test sources, inbox, outbox and ledger require isolated prefixes/directories. The companion remains read-only for bookings and cannot mutate intakes. A new full-staff-only private backup exports booking history and recovery payloads; the older general staff export is unchanged. No live store initialization or migration is included. See `docs/WELLNESS_BOOKING_WORKFLOW.txt` for settings and cutover restrictions.

## October 26 wellness integration — IMPLEMENTED locally / PARTIAL activation

The current web staff source is Netlify Blobs, not the historical admin/Supabase flow described elsewhere in this document. The new reminder feed reads `workshop`, `textPreference` and `programApproval`; only canonical wellness workshops enter the feed. The source adapter only writes generated journaled STOP opt-outs and cannot delete, approve or alter bookings. The optional booking projection reads `wellness/ledger-v1.json` through a read-only adapter, requires confirmed capacity configuration and refuses a missing live ledger. The atomic booking engine and sample policies are local foundation code; no live migration, public booking binding, provider setting or attendee sending was activated. See `docs/WELLNESS_REMINDER_REVIEW.txt`.

# Data and Services

This document names systems and configuration variables only. It contains no secret values.

September 18: no external reread/write in migration. Portals/access in DEPLOYMENTS_AND_PORTALS and ACCESS_AND_AUTH. Supabase cloud canonical published truth; Airtable editorial input read-only; local adapter recovery/dev only. Staging can contain real data. GitHub source/history, Vercel deploy env/logs, Expo build/OTA, Apple signing/release and OpenAI server AI when enabled remain owner systems. Device cache local AsyncStorage. Separate email/analytics/storage/Twilio/Firebase/Anthropic integrations not established; switching coding assistant does not add Anthropic to app. Private stores/backups excluded from transfer: inherit rules/locations, not datasets.

## Systems That May Contain Live or User Data

Sept 18 (local only): new `experience_signups` table (migration written, not applied) will hold attendee-entered names, a random per-install id and sign-up status for optional experiences. Staff-readable only via RLS/staff role; never in the public snapshot. Treat as personal data once live.

| System | Role | Access / handling |
| --- | --- | --- |
| Supabase project `svertlbvvhemqiqohzmq` | Postgres, Auth, RLS, revisions, audit, device registrations, notification attempts, possible ticket reservations, and potential storage | Potentially live. Do not seed, delete, reset, or alter without explicit authorization and a scoped review. |
| Vercel projects | Staff portal/API and public website deployments/environment settings/logs | Potentially live. Inspect before deployment; do not change env or promote deployments during documentation-only work. |
| Expo / EAS project `inspiring-children-foundation/not-alone-summit` | Native build identity and future OTA/build workflows | Production/release-adjacent. Do not create builds, rotate credentials, or submit without authorization. |
| Apple Developer / App Store Connect | Certificates, identifiers, TestFlight, App Store release | External owner-controlled account; incomplete and requires authorized account access. |
| Airtable base `app7BHptsc1bjc3DD` | Reviewed 2026 event source | Strictly read-only. Never edit records/views/interfaces. |
| Independent Netlify RSVP site | Awards RSVP collection outside this repository | Potentially contains real submissions. Read/investigate only unless owner explicitly authorizes an approved change. |
| Website analytics tables (`analytics_sessions`, `analytics_events`, reporting views) in the same Supabase project | Browser event tracking for the public website; device/session/page-view IDs only, no personal data; written only by the website server route with the service role | Migration `202609220001_web_analytics_events.sql` (not yet applied, Sept 22). RLS with no policies; anon/authenticated have no access. See `WEB_ANALYTICS_EVENTS.md`. |
| Staff portal store (Netlify Blobs `staff-portal` on site `not-alone-summit`) | Awards ticket requests (RSVP form) and award nominations, viewed at notalonesummit.org/staff (shared password `STAFF_PORTAL_PASSWORD`) | Real guest PII. Owner's Netlify account; CSV export from the portal. See `STAFF_PORTAL.md`. |
| `work/live-ops-store.json` | Development/local live-ops adapter state | Local operational data. Preserve; use revision-aware backup workflow before replacement. |
| Native device AsyncStorage | Cached validated attendee snapshots | User/device data. Avoid blanket clearing in normal development/release work. |

## Documented Deployments and Ownership

Public HTTP/DNS observations were refreshed read-only on September 17 around 22:02-22:03 UTC. They do not verify deployment ownership, environment values, deployed commits, or backend migration/RLS state:

- Public website: `https://not-alone-summit-web-rose.vercel.app/`
- Staff portal/API: `https://summit-app-2026-admin.vercel.app/`
- Repository: `porterthevibecodegoat/Summit-App-2026`
- `notalonesummit.org` currently redirects to `https://www.inspiringchildren.org/summit`, which serves Squarespace markup. It is not the new Vercel website.

The public API returned revision 9 with 26 timed activities and 53 guest records. The current local reviewed list contains 51 names; the preserved local operational store still contains 53. The live Awards page/API show 7:30 PM pre-show while local promotional code shows 7:00 PM. These differences require approved reconciliation, not a reset or seed. See [the local baseline](LOCAL_BASELINE_2026-09-17.md).

## Environment Variable Names

### Client-safe public configuration

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY
EXPO_PUBLIC_API_BASE_URL
EXPO_PUBLIC_EAS_PROJECT_ID
EXPO_PUBLIC_ENABLE_PUSH_DELIVERY
EXPO_PUBLIC_APP_ENV
SITE_URL
PUBLIC_API_BASE_URL
```

### Server-only configuration

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
OPENAI_API_KEY
OPENAI_MODEL
ENABLE_AI
ENABLE_PUSH_DELIVERY
ENABLE_NOTIFICATION_DISPATCH
EXPO_ACCESS_TOKEN
CRON_SECRET
EAS_PROJECT_ID
APP_STORE_PRIVACY_URL
APP_SUPPORT_URL
STAGING_ADMIN_URL
STAGING_STAFF_ACCESS_TOKEN
EVENT_ID
LOCAL_STAFF_ROLE
STAFF_PORTAL_PASSWORD
VIP_PORTAL_PASSWORD
RSVP_EMAIL_SMTP_USER
RSVP_EMAIL_SMTP_PASS
RSVP_EMAIL_FROM
RSVP_EMAIL_REPLY_TO
RSVP_EMAIL_SMTP_HOST
RSVP_EMAIL_SMTP_PORT
RSVP_EMAIL_BCC
```

Presence of a name in code or templates does not prove the value exists in any deployment. Never copy a server-only value to `NEXT_PUBLIC_*` or `EXPO_PUBLIC_*`.

## Service-Specific Notes

- **Supabase:** migrations include `202608310001_gate0_schema.sql` through `202609140001_ticket_reservations.sql`. Verify deployed migrations and RLS instead of assuming repository parity.
- **Staff API:** public snapshots must be projections of published content only. Draft, audit, staff profile, service-role, and device data must remain server/private.
- **Notifications:** feature flags and cron secret exist in the design. Delivery must remain disabled or safely inert until credentials, audience permissions, and physical-device testing are approved.
- **AI:** feature flags and model configuration exist. The public web app (apps/web /api/ask-ai) now also reads ENABLE_AI, OPENAI_API_KEY and OPENAI_MODEL server-side; default off. Ground responses in structured published data; AI proposals must not directly alter production.
- **RSVP:** the September 17 read-only check confirmed an optional phone input and response wording "Yes, I plan to attend", "I would like more information", and "No, I am unable to attend". The owner requested Accepted/Maybe/Waitlisted consideration, but exact production wording is not approved yet. No form was submitted; storage, access, and privacy remain unverified.
- **Website analytics:** `apps/web` posts validated browser events to its own `/api/analytics/events`, which needs the server-only `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in the website hosting environment (Netlify). Without them the route accepts and drops. Never expose these as `NEXT_PUBLIC_*`.
- **Local sync:** `scripts/sync-local-store-from-published.mjs` supports read-only preview only. `--apply` is disabled because the anonymous public projection is not a complete staff-store backup. Historical instructions describing replacement behavior are not current operating instructions.

# Cherrial Operations review records (October 24, 2026)

Status: **LIVE** in production deploy `6add7c8158581fd1b9e40056` (rollback `6add7a02fc8f3a605c1c5466`). The web staff store has three separate operational layers: source requests (`rsvp`, `closingDinner`, `workshop`, `poker`), approved Awards/Nevada Mental Health Day allocations (`ticketOffer`) and guest replies (`ticketConfirmation`). The `programApproval` kind stores staff decisions for dinner, wellness, workshops, site visits and poker. All use the same strongly consistent `staff-portal` Netlify Blobs store and the append-only `staff-portal-journal`. The full authenticated backup includes all three decision/response kinds. No approval record mutates a source request. No outbound send runs from Cherrial's Approval Portal.

## Podcast booking operations (October 26, 2026)

Status: **IMPLEMENTED.** Authorized full-staff and podcast-only sessions can reschedule or remove records in the `podcastBooking` kind. Reschedules retain the record ID and original submission timestamp and write a new journal version before replacing the active blob. Removals delete only the active blob; the append-only journal retains the prior record for recovery. Public room/time availability reads only active `podcastBooking` records, so a removed booking releases its room and time immediately.
