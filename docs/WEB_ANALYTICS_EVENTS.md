# Website Event Tracking

Implemented September 22, 2026 for the public website (`apps/web`, notalonesummit.org / notaloneawards.org) from the owner's "Website eventing" contract v2 (`website-eventing-agentic-ide-handoff.pdf`). The shared identity model is kept as specified; the event catalog is reduced to what this site has. This is separate from Google Tag Manager (`NEXT_PUBLIC_GTM_ID`), which stays as configured for the SEO/tracking setup.

## Implemented events

| Event | Category (server-assigned) | When | Extra fields / properties |
| --- | --- | --- | --- |
| `session_started` | strictly_necessary | Once per visit: first page of a session, or the first activity after 30 idle minutes | properties `consent`, `gpcEnabled` |
| `consent_updated` | strictly_necessary | The visitor chooses Allow or Decline in the analytics bar | properties `choice` (granted/denied), `gpcEnabled` |
| `page_view` | analytics | Once per page-view ID: initial load, refresh, in-site (route or query) navigation, back/forward restore, session resumption | properties `title` |
| `element_click` | analytics | Click on a link, button, submit input or summary anywhere on the site (RSVP, Donate, iHeartRadio, Schedule, nav, profiles, Ask AI submit ...) | `elementId` (`data-analytics-id`, `id` or `name`), `elementText`, `targetUrl` |

Every browser event carries the shared context: `id` (event UUID, reused on retries), `schemaVersion` 2, `eventTimestamp`, `sessionId`, `deviceId` (only with consent), `tabId`, `pageViewId`, `previousPageViewId`, `navigationType` (`navigate` / `reload` / `back_forward` / `client_navigation` / `session_resume`), `pagePath`, `pageUrl`, `referrer`. `user_id` is reserved and always null.

**Omitted (feature does not exist on this site):** `category_click`, `product_impression`, `product_click`, `product_view`, every cart event, every checkout event, every recommendation event, every Square server event, the `analytics_checkout_attribution` table and the product/cart/checkout/Square columns.

## Identity rules (as implemented)

- **device_id**: random UUID in `localStorage` (`na_analytics_device_id`), created only once tracking is allowed; the same across visits until storage is cleared or consent is declined (declining deletes it). Never sent when tracking is not allowed.
- **session_id**: UUID in `localStorage` (`na_analytics_session`, shared across tabs) with `lastActivityAt`; a new session starts after 30 minutes without tracked activity. Entry path, referrer and UTM parameters are first-touch.
- **tab_id**: UUID in `sessionStorage`; survives refresh, new per tab (a duplicated tab copies it: browser-dependent, as the contract notes).
- **page_view_id**: new UUID on load, refresh, route/query change, `pageshow` restore and session resumption; `previous_page_view_id` is the tab's preceding page view (null when unknown). Actions on the page share the ID.
- **Consent**: the bottom bar asks once (`localStorage` `na_analytics_consent`). Analytics-category events are queued and stored only when the choice is `granted` **and** the browser sends neither Global Privacy Control nor Do Not Track. Browsers with GPC/DNT are never asked. The server re-checks this: without consent it drops analytics events and stores no device ID. `gpcEnabled` reports GPC; DNT is treated as "no consent".
- **Delivery**: events are batched per session and posted to `/api/analytics/events` (`fetch` keepalive; `sendBeacon` on hide/leave). 5xx or network failures retry with the same IDs (2s, 5s, 15s, 30s, 60s; up to 6 attempts); unsent events are kept in `sessionStorage` (`na_analytics_pending`) and re-sent after a refresh. 4xx responses drop the batch.

## Code

- `apps/web/lib/analytics/contract.ts`: catalog, limits, Zod schemas (camelCase browser payload), property allow-lists.
- `apps/web/lib/analytics/identity.ts`: storage-backed identity rules (pure, tested without a DOM).
- `apps/web/lib/analytics/client.ts`: DOM-free runtime (session/page-view lifecycle, queue, retry, beacon) behind an adapter; `browser.ts` is the real adapter and the click describer; `components/analytics-provider.tsx` starts it, reports route changes and renders the consent bar (`analytics-consent.module.css`); mounted at the end of `app/layout.tsx`.
- `apps/web/lib/analytics/ingest.ts` + `app/api/analytics/events/route.ts`: validation (strict schema, 50 events / 64 KB per batch, same-site `Origin`, timestamps within 30 days past / 10 minutes future), category assignment, consent enforcement, snake_case mapping, Supabase RPC call with the service role. Unconfigured servers answer `{ disabled: true }` and drop, and `app/layout.tsx` does not mount the provider or the consent bar at all until `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` exist on the server, so the site is visibly unchanged until analytics can record.
- Tests: `lib/analytics/identity.test.ts`, `client.test.ts`, `ingest.test.ts` (32 cases: consent gating, refresh/navigation/restore/resume IDs, returning-visit device ID, retry with the same IDs across a refresh, invalid/foreign-origin/oversized batches, store failure -> 503, duplicate IDs stored once). `scripts/verify-analytics.mjs` runs the end-to-end proof against a live site and the real tables.

## Database (Supabase project `svertlbvvhemqiqohzmq`, migration `supabase/migrations/202609220001_web_analytics_events.sql`)

- `public.analytics_sessions` (unique `session_id`, nullable `device_id`/`user_id`, consent/GPC booleans, entry path/referrer, UTM, first/last seen, created/updated) and `public.analytics_events` (UUID PK, name, `schema_version`, `event_category`, timestamps, session FK, device/user/tab/page-view/previous IDs, navigation type, page/referrer, element/target, `value_numeric`, `properties` JSON).
- Indexes: events by session+time, page view, device+time, name+time, created; sessions by device and first seen.
- Access: RLS enabled, **no policies**, all grants revoked from `anon`/`authenticated`/`public`. Only the service role (server) reads or writes. `analytics_ingest_batch(jsonb, jsonb)` is `security definer`, executable by `service_role` only; it upserts the session and inserts events with `on conflict (id) do nothing`, returning the count of newly stored events.
- Reporting views (`security_invoker`, not readable by anon/authenticated): `analytics_page_views` (derived per page-view ID), `analytics_session_summary` (per visit, with `returning_device`), `analytics_daily_summary` (UTC day totals incl. reloads and consent choices), `analytics_click_summary`.

Join rules: sessions per device = `analytics_sessions` grouped by `device_id`; events per visit = `analytics_events.session_id = analytics_sessions.session_id` (text key, not the internal `id`); page = group by `page_view_id`; previous page = `previous_page_view_id` within the same `tab_id`; repeated refresh = `page_view` rows with `navigation_type = 'reload'` grouped by device, session, tab and path.

## Remaining setup and deployment steps (owner)

1. **Apply the migration** to the Supabase project (nothing existing is altered; four tables/views and one function are added). Either paste `supabase/migrations/202609220001_web_analytics_events.sql` into the dashboard SQL editor (https://supabase.com/dashboard/project/svertlbvvhemqiqohzmq/sql) and run it, or run it with `psql` using the project's connection string from the dashboard. The Supabase CLI is not installed on this machine and no CLI/DB credential is available to the agent.
2. **Server environment for the website** (Netlify site `not-alone-summit`, build + runtime): `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (server-only; never `NEXT_PUBLIC_`). Until they are set, the route answers `{ disabled: true }` and the site behaves exactly as before.
3. **Deploy** the website (`netlify deploy --build --prod --filter @not-alone/web`) after 1 and 2.
4. **Verify against the deployed site**: `BASE_URL=https://notalonesummit.org SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node apps/web/scripts/verify-analytics.mjs` (source the values in the shell; add `--cleanup` to delete the rows it creates).
5. Optional: a short privacy note on the site explaining the analytics choice; the consent bar copy can be edited in `components/analytics-provider.tsx`.

## Verification record

- September 22, 2026 (local, before the migration is applied to the Supabase project):
  - Unit and route tests: 32 analytics cases pass within the web suite (492 total); `tsc` clean; production build passes with the new `/api/analytics/events` route.
  - Migration applied to a throwaway local Postgres (Homebrew, with `anon`/`authenticated`/`service_role` roles): applies cleanly; `analytics_ingest_batch` stored 2 events on the first call and 0 on a retry of the same IDs; `analytics_page_views` grouped the reload with its previous page-view ID; `analytics_session_summary` / `analytics_daily_summary` returned the expected counts; RLS enabled with zero policies; `anon`/`authenticated` hold no privilege on any analytics table or view and cannot execute the function (`permission denied` when selecting as those roles); views are `security_invoker`. Session upsert rules confirmed: a later batch without consent clears the stored `device_id`, a re-grant restores it, entry path stays first-touch, and a non-object/array batch raises `INVALID_ANALYTICS_BATCH`.
  - Real browser (Chrome via Playwright) on a local dev server: consent bar shown once; no device ID before Allow, device ID created on Allow; refresh gave a new page-view ID whose previous ID was the page before the refresh with the same session, tab and device IDs; in-site navigation to /schedule gave a third chained page view; the runtime posted four batches to the route (200, `disabled: true` because the dev server had no Supabase settings); no console or page errors. Direct route checks: same-origin 200, foreign `Origin` 403, malformed JSON 400, GET 405.
- End-to-end proof against the real project (`scripts/verify-analytics.mjs`): pending the owner's steps 1-2 above; record the output here once run.
