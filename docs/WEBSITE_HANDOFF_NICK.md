# Not Alone Summit & Awards websites: handoff for the ICF website

Prepared September 21, 2026. Nothing here has been deployed yet; every step below is done by
the ICF team with its own accounts. No passwords or tokens are in this document.

## What you are receiving

One website app (`apps/web` in the `porterthevibecodegoat/Summit-App-2026` repository) that serves both
event sites:

| Page | Path |
| --- | --- |
| Summit 2026 (home) | `/` |
| Summit 2025 | `/2025` |
| Awards 2026 | `/awards/2026` |
| Awards 2025 | `/awards/2025` |
| Schedule, Partners (2026 / 2025), Venue, Ask AI, Contact, guest bio pages | `/schedule`, `/partners`, `/partners/2025`, `/venue`, `/ask-ai`, `/contact`, `/directory/<guest>` |

It builds in two versions from the same code. The owner picks which one goes live:

- **Original** (the redesign): leave `NEXT_PUBLIC_SITE_VARIANT` unset.
- **Unoriginal** (word-for-word copies of the current inspiringchildren.org Summit and Awards pages;
  the 2026 pages list the current confirmed guests): set `NEXT_PUBLIC_SITE_VARIANT=classic`.

To run both at once, create two hosting sites from the same repository, one with each setting.

## Hosting (Netlify, already configured)

`apps/web/netlify.toml` holds the build settings: build command `pnpm --filter @not-alone/web run build`,
Next.js runtime detected automatically. In Netlify: **Add new site → Import from Git** → this repository.
Base directory is the repository root. Then set these environment variables in
**Site configuration → Environment variables**:

| Variable | Value | Notes |
| --- | --- | --- |
| `AIRTABLE_TOKEN` | the read-only Airtable token (see below) | Server-only. Never in a `NEXT_PUBLIC_` variable. |
| `SITE_URL` | the site's final public address, e.g. `https://summit.inspiringchildren.org` | Used for links and metadata. |
| `NEXT_PUBLIC_SITE_VARIANT` | `classic` for the Unoriginal version, or leave unset | Needs a redeploy when changed. |
| `ENABLE_AI`, `OPENAI_API_KEY`, `OPENAI_MODEL` | optional | Ask AI stays in its built-in mode without them. |

## Airtable: automatic updates

The sites read the **Main NA Summit 2026** base read-only. They never write to it. With the token set:

- **2026 people**: who is listed (Summit Status "Confirmed Attendance"), their categories (the
  **Website Grouping** field), title, bio and headshot. A-Talent people are listed first in each category,
  then people follow Airtable's row order. Staff, Guest, Press, Sponsor, Vendor, Contractor and Talent
  Support Staff rows are never shown.
- **Schedule**: from the Run of Show. Load-in/out and rehearsal rows are hidden, and a row with no
  start time (or a 12:00 AM placeholder) is hidden until it gets a real time.
- **2026 Partners page**: from the Simplified Partners sheet.
- **2025 pages** stay exactly as they are and do not change with Airtable.

Updates appear on the live sites **within about 5 minutes**, with no rebuild or redeploy. Headshots are
served through the site at `/api/airtable/headshot/<record id>`, because Airtable's own image links
expire. If Airtable is unreachable, the site keeps showing the last good data.

**Creating the token (Airtable account owner):** airtable.com/create/tokens → **Create token** →
scopes `data.records:read` and `schema.bases:read` → access: only the **Main NA Summit 2026** base →
copy it straight into the Netlify variable `AIRTABLE_TOKEN`. Do not email or paste it anywhere else.

**Check after setting it (5 minutes later):** change one test bio in Airtable, reload `/awards/2026`,
confirm the change shows, then change it back.

## Putting it on inspiringchildren.org (Squarespace)

Squarespace can't host this app itself, so the app lives on Netlify and ICF's site points to it.
Recommended:

1. **Give it an address.** In Netlify: **Domain management → Add a domain**, e.g.
   `summit.inspiringchildren.org`. Add the CNAME record Netlify shows wherever the domain's DNS is managed
   (Squarespace Domains or the registrar). `notalonesummit.org`, which currently redirects to the ICF
   Summit page, can instead be pointed at the Netlify site the same way.
2. **Send ICF's pages to it.** In Squarespace: **Settings → Developer Tools → URL Mappings**, for example:
   ```
   /summit -> https://summit.inspiringchildren.org/ 301
   /awards -> https://summit.inspiringchildren.org/awards/2026 301
   ```
   Or point the "Summit" and "Awards" navigation links at those addresses.
3. Avoid embedding the site in a Squarespace iframe block: scrolling, the videos and search engines
   all work worse that way.

## Before going live

- The owner approves which version (Original or Unoriginal) and the production deploy.
- Confirm the Airtable token is set and the 5-minute check above passes.
- Check both sites on a phone and a laptop.
- The RSVP button points to the separate RSVP form (`not-alone-awards-rsvp-2026.netlify.app`), which is
  unchanged.
