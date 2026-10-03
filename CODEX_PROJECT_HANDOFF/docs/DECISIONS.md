# Decisions

## Product and Platform

- **Native stays native.** The attendee app is Expo/React Native, independently deployable from the website. No WebView/PWA replacement.
- **Three surfaces, one safe published model.** Mobile, web, and staff remain separate UIs with shared contracts and canonical revisions.
- **Staff is separate from attendees.** Administrative controls never appear in the attendee app.
- **No personal schedules or demo mode.** Attendees view the event-wide schedule; notifications are scheduled by staff for appropriate audiences.
- **Website direction differs by purpose.** Summit is lighter and richer; Awards is darker, more compact, public promotional, and links to Summit without duplicating the full schedule.

## Data and Editorial Provenance

- **Airtable is read-only.** It can supply reviewed 2026 facts but is never modified by this codebase or agent.
- **No inference from attendance.** Attendance cannot establish talent, a speaking slot, award, host role, staff permission, sponsor, or access entitlement.
- **Historical/current split.** Preserve original 2025 ICF content; do not use it as evidence for 2026 participation.
- **Producer credit protection.** Only original ICF-site producer credits may be shown until the owner explicitly approves an updated list.
- **Unknown means unknown.** Use neutral pending language; do not fabricate missing logistics or copy.

## Operations and Security

- **Publish atomically and audit it.** Drafts stay private until authorized publish; the release either completes as a full revision or leaves production unchanged.
- **Keep elevated secrets server-only.** Never put secret values in code, mobile/browser config, screenshots, chat, or documents.
- **Credential separation remains incomplete until verified.** Former collaborator access was documented as removed, but a shared owner GitHub token was reported and needs revocation confirmation.
- **Credentials and paid services are last-mile work.** Push, AI provider credits, Apple/App Store, EAS credentials, and other external activation need explicit owner authorization and targeted verification.

## Known 2026 Awards Decisions

- Local promotional direction uses Monday, November 2, 2026; Encore Theater at Wynn Las Vegas; Loni Love as host; and a 7:00 PM pre-show. The official foundation wording is Steven & Alexandra Cohen Foundation.
- The local Awards promotional UI has a 7:00 PM pre-show correction while a documented cloud canonical note may still show 7:30 PM. Publish/reconcile the canonical source before claiming all surfaces are synchronized.
- Cheryl must not be added until full identity, role, and approved image/content are provided. iHeart is a promotional channel, not a verified direct-stream integration until a final URL is supplied.
