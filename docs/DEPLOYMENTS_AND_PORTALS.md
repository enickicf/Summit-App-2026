# Deployments and Portals

September 18 migration inventory. Public behavior LAST KNOWN checked September 17 around 22:02-22:03 UTC; not rechecked. Local linking metadata read from disk. Deployed commit/branch/env/DNS ownership UNKNOWN unless noted. No deployment.

| Product | URLs / identity | Local relationship |
| --- | --- | --- |
| Public web (Netlify, NEW Sept 18) | https://not-alone-summit.netlify.app/ ; admin https://app.netlify.com/projects/not-alone-summit | Owner-approved new Netlify site (team sethporterwintertonmusic, site id dca09595-b5fa-4210-9d36-010bccfb903c) deployed from local working tree via Netlify CLI 27.8 (not Git-connected yet). Config apps/web/netlify.toml; link .netlify/state.json at repo root. Env: ENABLE_AI=true; OPENAI_API_KEY added by owner in Netlify UI (never in repo/chat); SITE_URL unset (noindex). Build note: @netlify/plugin-nextjs 5.16.0 fails on Next 16 middleware (writes functions-config-manifest before server dir exists); local deploys used a one-line mkdir fix in the CLI-installed plugin copy - Git-connected builds on Netlify will hit the upstream bug until fixed or patched. Deploy: from repo root `netlify deploy --prod --filter @not-alone/web`. Other team sites (incl. RSVP) untouched. |
| Public web (Vercel, prior) | https://not-alone-summit-web-rose.vercel.app/ ; /2025 ; /awards/2025 ; /awards/2026 | Vercel not-alone-summit-web; apps/web. Root link ID prj_HGy0aP19rQg0bMCCCvQXAiNYTamI; team_oYtva26XDzlMAKj3M1lFcZZE. Latest local UI/security not verified deployed. |
| Staff/API | https://summit-app-2026-admin.vercel.app/ ; /api/health ; /api/snapshot ; /privacy ; /support | Vercel summit-app-2026-admin, apps/admin. Supabase-backed staging bridge; potentially real data. Hosting ID unknown. |
| Local preview | http://localhost:3001/ ; /partners ; /venue ; /schedule ; /awards/2026 | Web running prior session. Staff convention http://localhost:3000; running/auth not rechecked. |
| Supabase | https://supabase.com/dashboard/project/svertlbvvhemqiqohzmq ; https://svertlbvvhemqiqohzmq.supabase.co | Summit 2026 - ICF; DB/Auth/RLS. supabase/migrations; deployed parity unknown. |
| Expo/EAS | https://expo.dev/accounts/inspiring-children-foundation/projects/not-alone-summit ; https://u.expo.dev/5a79b65b-7080-4c27-84e1-8eb5e9d119fd | apps/mobile; project 5a79b65b-7080-4c27-84e1-8eb5e9d119fd. API defaults staff Vercel. Native deployment separate; Apple release incomplete. |
| GitHub | https://github.com/porterthevibecodegoat/Summit-App-2026 | One monorepo, codex/awards-2026-polish; HEAD a60ba26ce4cc70e11f54cb150d5777bcaebdb03f. Main protected; Git-connected Vercel. No fetch/push. |
| Independent RSVP | https://not-alone-awards-rsvp-2026.netlify.app/ ; https://app.netlify.com/ | Source not in repo. Owner/ID/branch/backend unknown. Preserve existing form/submissions; obtain access, not rebuild. |
| Original ICF | https://www.inspiringchildren.org/summit ; https://www.inspiringchildren.org/awards | Squarespace historical provenance. notalonesummit.org last known redirects to ICF Summit, not Vercel. Registrar/control unknown. |
| Donate | https://www.inspiringchildren.org/donate | Current Donate destination; external payment system, not RSVP. |
| Mood reference | https://not-alone-summit-2026.vercel.app/ | Color/aesthetic reference only; not canonical data/functions/hosting target. Ownership unknown. |
| iHeart | https://www.youtube.com/@iHeartRadio/streams | Awards button opens the channel Live tab (owner, Sept 18); direct 2026 broadcast URL still unknown. |

Local root: /Users/sethwinterton/Documents/Codex/2026-08-31/files-mentioned-by-the-user-not. Portable root: CURRENT_SOURCE_SNAPSHOT. Never overwrite original with copy.

## Commands and Discrepancies

Read STAGING_DEPLOYMENT.md, per-app vercel.json, mobile eas.json/release docs before approved operations. Build contracts: pnpm --filter @not-alone/web build and pnpm --filter @not-alone/admin build. Install pnpm install --frozen-lockfile. Not deployment authorization. Git pushes can trigger deployment. Verify owner team/project/root/env/branch in dashboard before Vercel writes; no generic deploy is authorized. EAS build/submit/OTA and Supabase seed/publish are external writes, not bootstrap.

Last observed revision 9: 53 guests/26 activities versus 51 reviewed local guests; pre-show 7:30 live versus approved 7:00 local. Live roleSource fields are stripped by newer local code. Latest local source ahead of observed live behavior, but deployed commit IDs and branch mappings unknown. localhost does not prove sync.
