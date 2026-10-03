# Why the website kept changing and failing (Sept 22–24, 2026), what was fixed, and how it is watched now

Written September 24, 2026 (evening, UTC) from live evidence: Netlify deploy history, `Cache-Status`
headers, Netlify function logs, staff-API latency samples, per-page build-id probes and Playwright
measurements. Nothing here depends on a Claude session or on the owner's laptop being on.

## Short answer

The public site (notalonesummit.org / notaloneawards.org) is hosted on Netlify: DNS is Netlify-managed,
pages are rendered by a Netlify Function in us-east-1, environment variables live in Netlify, and no page
references a laptop, a tunnel or localhost. **Nothing on the live site ever depended on your computer or on
a signed-in Claude.** What did make it look broken or different while you were away were four things:

| # | What visitors saw | Root cause (evidence) | Status |
| --- | --- | --- | --- |
| 1 | Whole site down for about an hour on Sept 23 | Netlify platform incident ("Elevated CDN Errors"): the edge lost its route to the origin function, and because pages were served `private, no-store` nothing was cached to fall back on. | Fixed Sept 23: public pages now carry `Netlify-CDN-Cache-Control: public, durable, s-maxage=300, stale-while-revalidate=86400` (lib/page-cache.ts), so an origin outage keeps serving the last good copy. Verified: `Cache-Status: "Netlify Durable"; hit` and `"Netlify Edge"; hit` on every listed page. |
| 2 | "Nobody under Who's Coming" that came and went; profile pages that took 5–7 s | Every page render fetched the published snapshot from the **staff API on Vercel** (summit-app-2026-admin.vercel.app) with a 5 s limit, at request time. That API cold-starts (function logs: 4.9 s and 5.3 s renders; my samples today: 0.35–0.83 s warm, one **HTTP 500** at 2.8 s, and 7.0 s for an uncached profile page). On a timeout the site fell back to the bundled fixture with the directory switched off, rendered an empty lineup, and the edge cache then kept that empty page for up to 5 minutes. | Fixed Sept 24 in two steps: (a) the last successful publication is remembered per function instance; (b) deploy 6ab599a4: the publication is copied into the build (`apps/web/lib/published-snapshot.json`, fetched by `scripts/fetch-published-snapshot.mjs` at build time, revision 9, 53 people, 26 sessions) and **pages never call Vercel at request time**. The Airtable-recorded people/schedule/partners overlay is unchanged. Verified after deploy: home 60 person cards, Awards 49, profiles 0.2–0.4 s. |
| 3 | Content "changing" several times a day | The team deployed 8 times on Sept 23 and 4 on Sept 24 (plus 5 cancelled deploys). Every deploy invalidates the caches and cold-starts the function (2.5–4.1 s renders in the minute after a deploy), so a page can look different from one refresh to the next around a deploy. | Not a bug. Netlify does invalidate both edge and durable caches on deploy (docs: "all new deploys invalidate the cache for the given deploy context"); verified with a build-id probe: every public page carried the current build id. |
| 4 | Ask AI answering "from the published activity details" only | ENABLE_AI is on in Netlify but no OpenAI key is set, so Ask AI uses its deterministic fallback. It never errors (verified: HTTP 200 in 0.3–1.1 s). | By design until the owner sets a key. |

Things checked and found healthy: HTTPS and redirects for both domains (apex, www, http→https, awards
root → /awards/2026), compatibility aliases (/summit, /awards, …), robots.txt and the four-URL sitemap,
354 pictures referenced by the home/Awards/partners pages (60 sampled, all load), the RSVP and nomination
CORS preflights the Netlify form relies on (204), the "More talent and guests to be announced." note
centered under "Who's Coming" at 1440/1024/390 px (heading, paragraph and rendered text share one center).

The one thing that does depend on this laptop is **not the website**: the Outreach OS / Podcast Portal at
localhost:3000 (and its optional Cloudflare tunnel) runs on the Mac by design; it stops when the Mac sleeps.

## Evidence

- Netlify site `not-alone-summit` (dca09595-…), Pro plan, functions region us-east-1, managed DNS, no Git
  connection (`build_settings` empty: every deploy is a CLI `netlify deploy --build --prod` from this Mac).
- Deploys: Sept 22 ×7, Sept 23 ×8 (+2 cancelled), Sept 24: 00:02, 14:23, 21:28, 21:47 UTC (+2 cancelled).
- Function logs (`netlify logs --source functions --function ___netlify-server-handler --since 40m`,
  21:16–21:30 UTC): typical 8–1000 ms, cold starts 2.5–4.1 s right after the 21:28 deploy, no errors.
- Staff API `/api/snapshot`: 12 samples 0.35–0.83 s (HTTP 200, revision 9, 53 speakers, 26 sessions,
  `cache-control: no-store`), one HTTP 500 in 2.76 s at 21:51 UTC.
- Uncached profile page `/directory/jewel` (old data path): 6.97 s at 21:36 UTC, 0.88 s when the API was
  warm, 0.23–0.38 s after the bundled-snapshot deploy.
- `Cache-Status` on public pages: `"Netlify Durable"; hit; ttl=…` / `fwd=stale` (revalidated in the
  background) / `"Netlify Edge"; hit`; profiles `fwd=bypass` (intentionally uncached: `?from=awards` selects
  a different page and Next's `netlify-vary` does not key on that query).
- Build id probe (the Next build id is embedded in each page as `\"b\":\"<id>\"`): 14 public pages ×2 fetches
  all carried the current deploy's id; a mix would have meant stale pages from an older deploy.
- External media the pages depend on: only two YouTube thumbnails (i.ytimg.com); every portrait and logo is
  served from the site itself.

## How it is watched now

`node scripts/verify-live-site.mjs` (also `pnpm test:live-site`) checks the live site from any machine in
about 15 s and exits non-zero on a visitor-facing failure: every public page 200/HTML within budget, no
degraded state ("Confirmed guest details will appear after event-team approval" is the empty Who's Coming),
people/card/session/logo counts, one build id for every page, no laptop/tunnel references, redirects,
aliases, robots, sitemap, a sample of pictures, profile pages by title, RSVP/nomination preflights, Ask AI
(`--skip-ask-ai` to leave it out), and the staff API as information only. `--json` gives a machine report;
`--origin https://<deploy-id>--not-alone-summit.netlify.app` checks a deploy permalink before it goes live.
Unit tests: `node --test scripts/verify-live-site.test.mjs`.

Run it after every deploy. To run it while nobody is at a computer, two options need the owner's decision:

1. `.github/workflows/live-site-check.yml` (written, inert until pushed to `main`): GitHub runs the check
   every 30 minutes and emails the repository owner when it fails. Pushing to GitHub is an external write
   (the Vercel projects are Git-connected), so the owner does that deliberately.
2. A scheduled Claude routine (cloud, independent of this laptop) that runs the same script and sends a
   push notification on failure.

## Rules that keep it stable

- Deploy with `netlify deploy --build --prod` from `apps/web` only; then run `pnpm test:live-site`.
- Never make a public page wait on another service at request time. New data goes through the build
  (`scripts/fetch-published-snapshot.mjs`) or an Airtable-recorded copy, both with a bundled fallback.
- Keep public pages in `lib/page-cache.ts` (edge + durable cache); never cache `/api/*`, `/staff`,
  `/directory/*` or `/summit/live`, and never cache a function 404.
- A deploy invalidates the caches; expect 2–4 s renders for the first minute after one. Do not read a
  slow first load after a deploy as "the site is broken".
