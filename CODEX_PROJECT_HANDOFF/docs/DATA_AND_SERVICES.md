# Data and Services

This document names systems and configuration variables only. It contains no secret values.

## Systems That May Contain Live or User Data

| System | Role | Access / handling |
| --- | --- | --- |
| Supabase project `svertlbvvhemqiqohzmq` | Postgres, Auth, RLS, revisions, audit, device registrations, notification attempts, possible ticket reservations, and potential storage | Potentially live. Do not seed, delete, reset, or alter without explicit authorization and a scoped review. |
| Vercel projects | Staff portal/API and public website deployments/environment settings/logs | Potentially live. Inspect before deployment; do not change env or promote deployments during documentation-only work. |
| Expo / EAS project `inspiring-children-foundation/not-alone-summit` | Native build identity and future OTA/build workflows | Production/release-adjacent. Do not create builds, rotate credentials, or submit without authorization. |
| Apple Developer / App Store Connect | Certificates, identifiers, TestFlight, App Store release | External owner-controlled account; incomplete and requires authorized account access. |
| Airtable base `app7BHptsc1bjc3DD` | Reviewed 2026 event source | Strictly read-only. Never edit records/views/interfaces. |
| Independent Netlify RSVP site | Awards RSVP collection outside this repository | Potentially contains real submissions. Read/investigate only unless owner explicitly authorizes an approved change. |
| `work/live-ops-store.json` | Development/local live-ops adapter state | Local operational data. Preserve; use revision-aware backup workflow before replacement. |
| Native device AsyncStorage | Cached validated attendee snapshots | User/device data. Avoid blanket clearing in normal development/release work. |

## Documented Deployments and Ownership

These URLs/project references were documented before this handoff and have not been revalidated here:

- Public website: `https://not-alone-summit-web-rose.vercel.app/`
- Staff portal/API: `https://summit-app-2026-admin.vercel.app/`
- Repository: `porterthevibecodegoat/Summit-App-2026`
- `notalonesummit.org` was documented as still pointing at an older Squarespace site; confirm DNS before directing public traffic.

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
```

Presence of a name in code or templates does not prove the value exists in any deployment. Never copy a server-only value to `NEXT_PUBLIC_*` or `EXPO_PUBLIC_*`.

## Service-Specific Notes

- **Supabase:** migrations include `202608310001_gate0_schema.sql` through `202609140001_ticket_reservations.sql`. Verify deployed migrations and RLS instead of assuming repository parity.
- **Staff API:** public snapshots must be projections of published content only. Draft, audit, staff profile, service-role, and device data must remain server/private.
- **Notifications:** feature flags and cron secret exist in the design. Delivery must remain disabled or safely inert until credentials, audience permissions, and physical-device testing are approved.
- **AI:** feature flags and model configuration exist. Ground responses in structured published data; AI proposals must not directly alter production.
- **RSVP:** known observed response wording was "Yes, I plan to attend", "I would like more information", and "No, I am unable to attend". The owner requested Accepted/Maybe/Waitlisted consideration, but exact production wording is not approved yet.
