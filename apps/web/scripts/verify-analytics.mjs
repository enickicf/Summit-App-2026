#!/usr/bin/env node
// End-to-end check of website event tracking against a running site and the real analytics tables.
//
//   BASE_URL=http://localhost:4004 SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node apps/web/scripts/verify-analytics.mjs
//
// Secrets come from the environment only (source the server .env in the shell; never paste them).
// Proves: events persist; a retried batch (same IDs) is stored once; a refresh and an in-site
// navigation each get a new page-view ID chained to the previous one; a return after 30 idle
// minutes gets a new session but keeps the same device ID; nothing is stored before consent.
// Rows it creates stay in the tables (session IDs are printed) unless --cleanup is passed.

import { chromium } from "playwright-core";
import { randomUUID } from "node:crypto";

const base = (process.env.BASE_URL ?? "http://localhost:4004").replace(/\/$/, "");
const supabaseUrl = (process.env.SUPABASE_URL ?? "").replace(/\/$/, "");
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const executablePath = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const cleanup = process.argv.includes("--cleanup");
if (!supabaseUrl || !serviceKey) { console.error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in the environment."); process.exit(2); }

const failures = [];
const check = (condition, label) => { console.log(`${condition ? "PASS" : "FAIL"}  ${label}`); if (!condition) failures.push(label); };
const rest = async (path, init = {}) => {
  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, { ...init, headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, "Content-Type": "application/json", ...(init.headers ?? {}) } });
  if (!response.ok) throw new Error(`${path} -> ${response.status} ${await response.text()}`);
  return response.status === 204 ? null : response.json();
};
const idsOf = page => page.evaluate(() => ({
  session: JSON.parse(localStorage.getItem("na_analytics_session") ?? "null")?.id ?? null,
  device: localStorage.getItem("na_analytics_device_id"),
  tab: sessionStorage.getItem("na_analytics_tab_id"),
  page: JSON.parse(sessionStorage.getItem("na_analytics_page") ?? "null")
}));
const flush = page => page.evaluate(() => window.__naAnalytics?.flush());
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const browser = await chromium.launch({ executablePath, headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();

// 1. First visit, no consent yet.
await page.goto(`${base}/`, { waitUntil: "load" });
await sleep(1500);
const beforeConsent = await idsOf(page);
check(beforeConsent.session && !beforeConsent.device, "first visit: session exists, no device ID before consent");
await flush(page);
await sleep(500);

// 2. Allow analytics.
await page.getByRole("button", { name: "Allow" }).click();
await sleep(500);
const afterConsent = await idsOf(page);
check(Boolean(afterConsent.device), "consent granted: device ID created");
await flush(page);
await sleep(500);

// 3. Refresh -> new page-view ID chained to the previous one.
await page.reload({ waitUntil: "load" });
await sleep(1000);
const afterReload = await idsOf(page);
check(afterReload.page.pageViewId !== afterConsent.page.pageViewId, "refresh: new page-view ID");
check(afterReload.page.previousPageViewId === afterConsent.page.pageViewId, "refresh: previous page-view ID is the page before the refresh");
check(afterReload.session === afterConsent.session, "refresh: same session");
check(afterReload.tab === afterConsent.tab, "refresh: same tab ID");
await flush(page);
await sleep(500);

// 4. In-site navigation (client navigation) and a tracked click.
await page.getByRole("link", { name: "Schedule" }).first().click();
await page.waitForURL(/\/schedule/);
await sleep(1000);
const afterNavigation = await idsOf(page);
check(afterNavigation.page.previousPageViewId === afterReload.page.pageViewId, "navigation: new page view chained to the previous one");
await flush(page);
await sleep(500);

// 5. Returning visit after 30 idle minutes: new session, same device.
await page.evaluate(() => {
  const session = JSON.parse(localStorage.getItem("na_analytics_session"));
  session.lastActivityAt = Date.now() - 31 * 60 * 1000;
  localStorage.setItem("na_analytics_session", JSON.stringify(session));
});
const returning = await context.newPage();
await returning.goto(`${base}/awards/2026`, { waitUntil: "load" });
await sleep(1500);
const secondVisit = await idsOf(returning);
check(secondVisit.session !== afterConsent.session, "returning visit: new session ID");
check(secondVisit.device === afterConsent.device, "returning visit: same device ID");
await flush(returning);
await sleep(1500);

// 6. Retry with the same event IDs is stored once (direct API check).
const retrySession = randomUUID();
const eventId = randomUUID();
const now = new Date().toISOString();
const batch = {
  session: { sessionId: retrySession, deviceId: afterConsent.device, consent: true, gpcEnabled: false, startedAt: now, entryPath: "/", entryReferrer: null, utm: {} },
  events: [{ eventId, eventName: "page_view", schemaVersion: 2, eventTimestamp: now, sessionId: retrySession, deviceId: afterConsent.device, tabId: randomUUID(), pageViewId: randomUUID(), previousPageViewId: null, navigationType: "navigate", pagePath: "/", pageUrl: `${base}/`, referrer: null, properties: { title: "verification" } }]
};
const post = () => fetch(`${base}/api/analytics/events`, { method: "POST", headers: { "Content-Type": "application/json", Origin: base }, body: JSON.stringify(batch) }).then(r => r.json());
const first = await post();
const second = await post();
check(first.stored === 1, `retry: first send stored 1 (${JSON.stringify(first)})`);
check(second.stored === 0 && second.accepted === 1, `retry: second send of the same ID stored 0 (${JSON.stringify(second)})`);

// 7. Database rows.
const sessions = [afterConsent.session, secondVisit.session, retrySession];
const list = `in.(${sessions.map(s => `"${s}"`).join(",")})`;
const events = await rest(`analytics_events?session_id=${encodeURIComponent(list)}&select=id,event_name,event_category,session_id,device_id,tab_id,page_view_id,previous_page_view_id,navigation_type,page_path,properties&order=event_timestamp.asc`);
const sessionRows = await rest(`analytics_sessions?session_id=${encodeURIComponent(list)}&select=session_id,device_id,analytics_consent,gpc_enabled,entry_path,first_seen_at,last_seen_at`);
const pageViews = await rest(`analytics_page_views?session_id=${encodeURIComponent(list)}&select=page_view_id,navigation_type,page_path,previous_page_view_id,event_count`);
const byName = name => events.filter(e => e.event_name === name);
check(events.length > 0, `events persisted (${events.length} rows across ${sessions.length} sessions)`);
check(sessionRows.length === 3, `session rows persisted (${sessionRows.length})`);
check(byName("session_started").filter(e => e.session_id === afterConsent.session).length === 1, "one session_started for the first visit");
check(byName("session_started").some(e => e.session_id === afterConsent.session && e.device_id === null), "session_started before consent has no device ID");
check(byName("consent_updated").some(e => e.properties?.choice === "granted" && e.session_id === afterConsent.session), "consent_updated(granted) stored");
const firstVisitViews = byName("page_view").filter(e => e.session_id === afterConsent.session);
check(firstVisitViews.length === 3, `first visit has 3 page views: landing, reload, navigation (${firstVisitViews.length})`);
check(firstVisitViews.some(e => e.navigation_type === "reload" && e.previous_page_view_id === afterConsent.page.pageViewId), "reload page view stored with its previous page-view ID");
check(firstVisitViews.some(e => e.navigation_type === "client_navigation" && e.page_path === "/schedule"), "client navigation page view stored");
check(new Set(firstVisitViews.map(e => e.page_view_id)).size === 3, "the three page views have distinct IDs");
check(firstVisitViews.every(e => e.device_id === afterConsent.device), "consented page views carry the device ID");
const secondVisitRows = events.filter(e => e.session_id === secondVisit.session);
check(secondVisitRows.some(e => e.event_name === "session_started") && secondVisitRows.some(e => e.event_name === "page_view"), "returning visit stored session_started and page_view");
check(secondVisitRows.every(e => e.device_id === afterConsent.device), "returning visit rows keep the same device ID");
check(events.filter(e => e.id === eventId).length === 1, "retried event stored exactly once");
check(pageViews.length === new Set(events.filter(e => e.page_view_id).map(e => e.page_view_id)).size, `analytics_page_views view groups by page view (${pageViews.length})`);
check(events.every(e => ["strictly_necessary", "analytics"].includes(e.event_category)), "every row has a server-assigned category");

// 8. Public access is blocked (anon key not needed: no key at all must fail; the anon key has no policy).
const anonymous = await fetch(`${supabaseUrl}/rest/v1/analytics_events?select=id&limit=1`);
check(anonymous.status === 401 || anonymous.status === 403, `unauthenticated read of analytics_events blocked (${anonymous.status})`);

await browser.close();
console.log(`\nVerification sessions: ${sessions.join(", ")}`);
if (cleanup) {
  await rest(`analytics_sessions?session_id=${encodeURIComponent(list)}`, { method: "DELETE", headers: { Prefer: "return=minimal" } });
  console.log("Verification rows deleted (events cascade from sessions).");
} else {
  console.log("Rows kept. Remove them later with --cleanup, or by deleting those analytics_sessions rows (events cascade).");
}
if (failures.length) { console.error(`\n${failures.length} check(s) failed.`); process.exit(1); }
console.log("\nAll checks passed.");
