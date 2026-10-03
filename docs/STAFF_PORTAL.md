# Staff Portal (Awards tickets + nominations)

Built September 23, 2026 (owner request). One clean, Not Alone-themed page for staff, separate from the public sites, protected by a single shared password (no usernames).

- **URL:** https://notalonesummit.org/staff (sign-in at /staff/login). Not indexed (`robots` disallow + `noindex`); the public header, footer and Ask AI widget do not render there.
- **Password:** the Netlify environment variable `STAFF_PORTAL_PASSWORD` on the `not-alone-summit` site (set to the owner's chosen value on Sept 23). Changing it signs every browser out. The cookie (`na_staff`, HttpOnly, 30 days) is an HMAC of the password; no password is stored in the code.
- **Community Day (Sept 23):** the RSVP form has a separate toggle for Community Day (doors 5:30 PM). Each request shows a red **Awards** badge when the guest plans to attend the Awards Show and a blue **Community Day** badge when the toggle was on (both badges when both); a blue "Community Day tickets" tile counts those party sizes and a separate "Community Day RSVPs" section lists only those guests. Requests from before the toggle existed read as "no" for Community Day.
- **What it shows:** running totals at the top (**Tickets requested** = party sizes of "plan to attend" requests, one per guest email; **Forms submitted** = every RSVP submission; plus attend / more-info / unable counts and the number of nominations), then the **Awards ticket requests** table (every RSVP field, newest first, CSV download), the **Award nominations** section (its own category, CSV download), and the **current Awards lineup** from the site's Airtable-driven sections for reference.

- **Removed guests (Sept 28):** each ticket or poker request has a Remove button; removed requests leave the lists and totals but stay stored (every field + when/why) under the Removed blocks, with Restore and "Delete permanently" buttons (delete works only on a removed record). Use Remove for real guests you want out of the working list; use Delete only for test entries.
- **Views (Sept 28):** Awards / Summit workshops / Tennis & High Tea / Poker tabs, each with its own totals; the URL hash picks the view (#poker, #workshops, #site-visit, #removed …).
- **Backups (Sept 28):** `STAFF_PORTAL_PASSWORD=… node apps/web/scripts/backup-staff-portal.mjs` writes a dated JSON of everything (RSVPs incl. removed, nominations, poker, confirmation-email log) to `work/staff-portal-backups/` and a self-contained HTML page; the owner's private Claude artifact "Awards Guest List Backup" is republished from that page. `GET /api/staff/export?kind=all` is the raw JSON.
- **Confirmation email (Sept 28):** `/api/rsvp` emails every "plan to attend" guest a waiting-list confirmation once SMTP settings exist (RSVP_EMAIL_SMTP_USER/PASS on the Netlify web site); `/api/staff/rsvp-emails` previews it, sends a test, or back-fills earlier guests once.

- **Summit workshops + Tennis / High Tea (Sept 28):** name-only sign-ups from the schedule page (`/api/workshops`). Workshops are grouped by session; Tennis / High Tea is one row per person with badges for one or both. Staff check names against the guest list; there is no removal button for these yet (the CSV keeps everything).

## Where the data lives

- Production: the website's **Netlify Blobs** store `staff-portal` (site `not-alone-summit`, strongly consistent), one JSON blob per submission under `rsvp/` and `nomination/`. No database credentials are involved; the store belongs to the owner's Netlify account.
- Development/tests: `apps/web/work/staff-portal-store.json` (ignored by git) or an in-memory store.
- Code: `apps/web/lib/staff/store.ts` (schemas, stores, totals, CSV), `lib/staff/auth.ts`, routes `app/api/rsvp`, `app/api/nominations`, `app/api/staff/{login,logout,export,import}`, pages `app/staff` + `app/staff/login`, component `components/staff-portal.tsx`, tests `lib/staff/staff-portal.test.tsx`.

## How the forms reach it

- The Awards **RSVP form** (Netlify site `not-alone-awards-rsvp-2026`) posts to `/api/rsvp/`, which its `_redirects` now proxies to `https://notalonesummit.org/api/rsvp/`. The route validates the same fields the form has always sent, stores the request, and forwards a copy to the previous Codex-hosted backend (`not-alone-awards-rsvp-2026.sethporterw.chatgpt.site`) so that store and the summit-outreach-ai mirror keep receiving (best effort; a failure there never fails the guest).
- The new **nomination form** lives on the same site at `/nominate` (`nominate.html`, same look as the RSVP page; 18 award categories + "Not sure / other"; nominator, nominee, reason, links; honeypot) and posts to `/api/nominations/` → `https://notalonesummit.org/api/nominations/`. The Awards site menu's **Nominate** points there.
- Both routes answer CORS for the form site and the two public domains, reject bad input with the form's own wording, and silently drop honeypot submissions.
- Existing rows from the previous backend were imported with `apps/web/scripts/import-legacy-rsvps.mjs` (source `work/awards-rsvp-exports/awards-rsvps-2026-09-22T1930Z.json`, the five internal test rows skipped); they show as source "Previous portal".

## Not included yet

- Approving/declining a request from the portal (a status column) and the automatic waiting-list email (no sending service exists; see NEXT_TASKS).
- Per-user accounts or an audit trail: one shared password, as requested.

## Freshness (Sept 29, 2026)

The portal page is rendered from the store on every request and is never cached (force-dynamic, `no-store`, Netlify edge bypass), so a refresh always shows current data for every staff member. While a tab stays open, `components/portal-auto-refresh.tsx` re-fetches the data every minute (visible tabs only, and immediately when a hidden tab is shown again) without a full reload.

## Resilience (Sept 29, 2026)

Every Netlify Blobs call in `lib/staff/store.ts` is retried (250/750/1500 ms) and record reads run eight at a time. Before this, one transient Blobs error made the whole portal page show "This page could not load" (about one load in eight with 30+ records). If that message ever returns, reload once; the data is intact, the failure is on read.

## VIP RSVPs (Sept 30, 2026)

An unlisted VIP RSVP page on the RSVP site (address in CURRENT_WORK; never linked) posts the same form with `vip=on`. The portal's Awards view shows a gold VIP tile, a "VIP RSVPs" section first, an "Invited by" column and a VIP badge; CSV/backup carry `invitedBy` and `vip`. A VIP request without organization, title or invited-by is rejected by /api/rsvp. To rotate the link, rename the HTML file and the `_redirects` rule and redeploy the RSVP site.

## VIP portal (Sept 30, 2026, supersedes the VIP section above)

VIP RSVPs are no longer shown in the staff portal. They live at `/staff/vip` behind `VIP_PORTAL_PASSWORD` (separate cookie `na_vip`), stored as kind `vipRsvp`; exports at `/api/staff/vip/export` (CSV, or `?kind=all` JSON), row actions at `/api/staff/vip/rsvps`, backup with `scripts/backup-vip-portal.mjs` (local JSON only). The staff portal's exports and backup artifact contain no VIP rows. A ticket request counts as attending: no "Plan to attend" tile or Response column.
