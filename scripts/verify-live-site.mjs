#!/usr/bin/env node
/**
 * Live-site verification for the public website: https://notalonesummit.org and https://notaloneawards.org.
 *
 * Runs from ANY machine with Node 22+ (no checkout build, no secrets, no login), read-only against the live
 * site, and exits non-zero when a visitor-facing check fails. It is the check to run after every deploy and
 * the one a scheduled job (GitHub Actions, a cloud routine, a cron) can run while nobody is at a computer.
 *
 *   node scripts/verify-live-site.mjs                 # human report, exit 1 on any failure
 *   node scripts/verify-live-site.mjs --json          # machine-readable report on stdout
 *   node scripts/verify-live-site.mjs --skip-ask-ai   # do not exercise the Ask AI endpoint
 *   node scripts/verify-live-site.mjs --origin https://<deploy-id>--not-alone-summit.netlify.app --awards-origin ...
 *
 * What it proves (per the Sept 24, 2026 stability review, docs/WEBSITE_STABILITY_2026-09-24.md):
 *   - every public page answers 200 as HTML, within a time budget (warn > 3 s, fail > 9 s: Netlify's
 *     function limit is 10 s), with a <title> and none of the site's own "unavailable" states
 *     ("Confirmed guest details will appear after event-team approval" = the empty Who's Coming failure);
 *   - the Summit and Awards lineups really list people (link and card counts), the schedule really carries
 *     sessions, partners really show logos;
 *   - every page comes from ONE deploy (Next build id embedded in each page): a mix means the CDN is
 *     serving some pages from an older deploy;
 *   - no page references a laptop or tunnel (localhost, 127.0.0.1, trycloudflare, ngrok);
 *   - domain redirects, compatibility aliases, robots.txt and the sitemap behave;
 *   - a sample of the pictures the pages use really loads as an image;
 *   - profile pages resolve; the RSVP / nomination endpoints answer the form's CORS preflight; Ask AI answers;
 *   - informational only: the staff API on Vercel (the site must not depend on it at request time any more).
 */
import { parseArgs } from "node:util";
import { fileURLToPath } from "node:url";

export const defaultOptions = Object.freeze({
  summitOrigin: "https://notalonesummit.org",
  awardsOrigin: "https://notaloneawards.org",
  staffApiOrigin: "https://summit-app-2026-admin.vercel.app",
  rsvpFormOrigin: "https://not-alone-awards-rsvp-2026.netlify.app",
  timeoutMs: 20000,
  slowMs: 3000,
  failMs: 9000,
  maxImages: 60,
  images: true,
  askAi: true,
  profiles: 3,
  userAgent: "NotAloneLiveSiteCheck/1.0"
});

/** Public pages and what a healthy render must contain. Counts are deliberately below the real numbers. */
export const pageExpectations = Object.freeze({
  "/": { minPersonLinks: 50, minPersonCards: 50, text: ["Who's Coming", "More talent and guests to be announced.", "Wynn Las Vegas"] },
  "/2025": { minImages: 40, text: ["Meet Our Guests"] },
  "/awards/2026": { minPersonLinks: 40, text: ["The 2026 Lineup", "Founders"], site: "awards" },
  "/awards/2025": { minPersonLinks: 40, text: ["2025 Award Winners"], site: "awards" },
  "/partners": { minImages: 40, text: ["Presented by"] }, // Oct 5: "Founding Partners" wording retired
  "/partners/2025": { minImages: 15 },
  "/schedule": { minSessions: 15, text: ["November"] },
  "/venue": { text: ["Wynn"] },
  "/map": {},
  "/ask-ai": { text: ["Ask"] },
  "/donate": {},
  "/contact": {},
  "/inspiring-children-socials": {},
  "/summit/live": {}
});

/** The site's own degraded states. Any of these on a public page is a failure, whatever the HTTP status. */
export const degradedPhrases = Object.freeze([
  "Confirmed guest details will appear after event-team approval",
  "The guest directory is temporarily unavailable",
  "Guest details temporarily unavailable",
  "Application error: a server-side exception",
  "Internal Server Error",
  "This page could not be found"
]);

export const strayHostPattern = /\b(?:localhost|127\.0\.0\.1|0\.0\.0\.0|10\.0\.0\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3})\b|trycloudflare\.com|ngrok(?:-free)?\.(?:app|io|dev)/i;

export function decodeEntities(html) {
  return html.replace(/&#x27;|&#39;|&apos;/g, "'").replace(/&quot;/g, "\"").replace(/&#x2F;/g, "/").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&");
}

/** Next.js app-router pages embed the build id in the flight payload as \"b\":\"<id>\" (or "b":"<id>"). */
export function extractBuildId(html) {
  const escaped = /\\"b\\":\\"([A-Za-z0-9_-]{16,40})\\"/.exec(html);
  if (escaped) return escaped[1];
  const plain = /"b":"([A-Za-z0-9_-]{16,40})"/.exec(html);
  return plain ? plain[1] : null;
}

export function countPersonLinks(html) {
  return new Set([...html.matchAll(/href="(\/directory\/[^"?#]+)/g)].map(match => match[1])).size;
}

export function countPersonCards(html) {
  return (html.match(/class="[^"]*\bpersonCard\b[^"]*"/g) ?? []).length;
}

export function countImages(html) {
  return (html.match(/<img\b/gi) ?? []).length;
}

/** Sessions travel to the schedule browser inside the server payload; each carries a startUtc. */
export function countSessions(html) {
  return (html.match(/startUtc/g) ?? []).length;
}

export function firstProfilePaths(html, limit) {
  return [...new Set([...html.matchAll(/href="(\/directory\/[^"?#]+)"/g)].map(match => decodeEntities(match[1])))].slice(0, limit);
}

/** Same-origin <img src> and the first srcset candidate of each <img>/<source>, resolved against the page URL. */
export function extractImageUrls(html, pageUrl) {
  const urls = new Set();
  const add = raw => {
    if (!raw) return;
    const candidate = decodeEntities(raw.trim().split(/\s+/)[0]);
    try {
      const url = new URL(candidate, pageUrl);
      if (["http:", "https:"].includes(url.protocol) && (url.origin === new URL(pageUrl).origin || url.hostname === "i.ytimg.com")) urls.add(url.href);
    } catch { /* not a URL */ }
  };
  for (const match of html.matchAll(/<(?:img|source)\b[^>]*>/gi)) {
    const tag = match[0];
    add(/\bsrc="([^"]+)"/i.exec(tag)?.[1]);
    add(/\bsrcset="([^"]+)"/i.exec(tag)?.[1]?.split(",")[0]);
  }
  return [...urls];
}

/** Evenly spaced sample so a limit still covers every page's pictures. */
export function sample(list, limit) {
  if (list.length <= limit) return list;
  const step = list.length / limit;
  return Array.from({ length: limit }, (_, index) => list[Math.floor(index * step)]);
}

export function checkPage(path, expectation, result, options = defaultOptions) {
  const findings = [];
  const html = decodeEntities(result.text ?? "");
  const contentType = result.headers?.get?.("content-type") ?? "";
  if (result.error) { findings.push({ result: "fail", detail: `request failed: ${result.error}` }); return findings; }
  if (result.status !== 200) findings.push({ result: "fail", detail: `HTTP ${result.status}` });
  if (!/text\/html/i.test(contentType)) findings.push({ result: "fail", detail: `content-type ${contentType || "missing"}` });
  if (result.ms > options.failMs) findings.push({ result: "fail", detail: `took ${result.ms} ms (limit ${options.failMs} ms)` });
  else if (result.ms > options.slowMs) findings.push({ result: "warn", detail: `slow: ${result.ms} ms` });
  if (!/<title>[^<]+<\/title>/i.test(html)) findings.push({ result: "fail", detail: "no <title>" });
  for (const phrase of degradedPhrases) if (html.includes(phrase)) findings.push({ result: "fail", detail: `degraded state on page: "${phrase}"` });
  const stray = strayHostPattern.exec(html);
  if (stray) findings.push({ result: "fail", detail: `references a local machine or tunnel: ${stray[0]}` });
  for (const text of expectation.text ?? []) if (!html.includes(text)) findings.push({ result: "fail", detail: `missing text "${text}"` });
  const counts = { personLinks: countPersonLinks(html), personCards: countPersonCards(html), images: countImages(html), sessions: countSessions(html) };
  if (expectation.minPersonLinks && counts.personLinks < expectation.minPersonLinks) findings.push({ result: "fail", detail: `${counts.personLinks} people linked (expected ≥ ${expectation.minPersonLinks})` });
  if (expectation.minPersonCards && counts.personCards < expectation.minPersonCards) findings.push({ result: "fail", detail: `${counts.personCards} person cards (expected ≥ ${expectation.minPersonCards})` });
  if (expectation.minImages && counts.images < expectation.minImages) findings.push({ result: "fail", detail: `${counts.images} images (expected ≥ ${expectation.minImages})` });
  if (expectation.minSessions && counts.sessions < expectation.minSessions) findings.push({ result: "fail", detail: `${counts.sessions} sessions (expected ≥ ${expectation.minSessions})` });
  if (!extractBuildId(html)) findings.push({ result: "warn", detail: "no Next build id found in the page" });
  return findings;
}

export function checkRedirect(expected, result) {
  if (result.error) return [{ result: "fail", detail: `request failed: ${result.error}` }];
  const location = result.headers?.get?.("location") ?? "";
  let target = null;
  try { target = new URL(location, result.url ?? expected.from).href; } catch { target = null; }
  if (!expected.statuses.includes(result.status)) return [{ result: "fail", detail: `HTTP ${result.status} (expected ${expected.statuses.join("/")}) → ${location || "no Location"}` }];
  if (target !== expected.to) return [{ result: "fail", detail: `redirects to ${location || "nowhere"} (expected ${expected.to})` }];
  return [];
}

/** Compatibility aliases may answer with a real redirect or Next's streamed 200 that carries the target and noindex. */
export function checkAlias(alias, result) {
  if (result.error) return [{ result: "fail", detail: `request failed: ${result.error}` }];
  if (result.status >= 300 && result.status < 400) {
    const location = result.headers?.get?.("location") ?? "";
    let path = null;
    try { path = new URL(location, result.url).pathname; } catch { path = null; }
    return path === alias.to ? [] : [{ result: "fail", detail: `redirects to ${location || "nowhere"} (expected ${alias.to})` }];
  }
  if (result.status === 200 && (result.text ?? "").includes("noindex") && (result.text ?? "").includes(alias.to)) return [];
  return [{ result: "fail", detail: `HTTP ${result.status} without a redirect to ${alias.to}` }];
}

export function checkRobots(result) {
  const text = result.text ?? "";
  const findings = [];
  if (result.status !== 200) findings.push({ result: "fail", detail: `HTTP ${result.status}` });
  for (const line of ["Allow: /", "Disallow: /api/", "Disallow: /staff"]) if (!text.includes(line)) findings.push({ result: "fail", detail: `missing "${line}"` });
  return findings;
}

export function checkSitemap(result, options = defaultOptions) {
  const text = result.text ?? "";
  const findings = [];
  if (result.status !== 200) findings.push({ result: "fail", detail: `HTTP ${result.status}` });
  const locs = [...text.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
  for (const expected of [`${options.summitOrigin}/`, `${options.summitOrigin}/2025`, `${options.awardsOrigin}/awards/2026`, `${options.awardsOrigin}/awards/2025`]) {
    if (!locs.includes(expected)) findings.push({ result: "fail", detail: `sitemap lacks ${expected}` });
  }
  return findings;
}

export function redirectExpectations(options = defaultOptions) {
  const summit = new URL(options.summitOrigin);
  const awards = new URL(options.awardsOrigin);
  const list = [];
  if (summit.protocol === "https:") {
    list.push({ from: `http://${summit.host}/`, statuses: [301, 308], to: `${summit.origin}/` });
    if (!summit.hostname.startsWith("www.")) list.push({ from: `https://www.${summit.host}/`, statuses: [301, 308], to: `${summit.origin}/` });
  }
  if (awards.protocol === "https:" && awards.host !== summit.host) {
    list.push({ from: `http://${awards.host}/`, statuses: [301, 308], to: `${awards.origin}/` });
    list.push({ from: `${awards.origin}/`, statuses: [302], to: `${awards.origin}/awards/2026` });
    if (!awards.hostname.startsWith("www.")) list.push({ from: `https://www.${awards.host}/`, statuses: [302], to: `${awards.origin}/awards/2026` });
  }
  return list;
}

export const compatibilityAliases = Object.freeze([
  { from: "/summit", to: "/" }, { from: "/summit/2025", to: "/2025" }, { from: "/summit/schedule", to: "/schedule" }, { from: "/awards", to: "/awards/2026" }
]);

/** fetch with timing, a timeout and a bounded body read; never throws. */
export async function timedFetch(fetchImpl, url, init = {}, options = defaultOptions, mode = "text") {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeoutMs);
  const started = performance.now();
  try {
    const response = await fetchImpl(url, { redirect: "manual", ...init, headers: { "user-agent": options.userAgent, ...(init.headers ?? {}) }, signal: controller.signal });
    let text = "";
    if (mode === "text") text = await response.text();
    else if (response.body?.cancel) await response.body.cancel().catch(() => undefined);
    return { url: response.url || url, status: response.status, headers: response.headers, text, ms: Math.round(performance.now() - started) };
  } catch (error) {
    return { url, status: 0, headers: new Headers(), text: "", ms: Math.round(performance.now() - started), error: error?.name === "AbortError" ? `timed out after ${options.timeoutMs} ms` : String(error?.message ?? error) };
  } finally {
    clearTimeout(timer);
  }
}

function cacheNote(headers) {
  const status = headers?.get?.("cache-status");
  const age = headers?.get?.("age");
  return [status ? status.replace(/"/g, "") : null, age ? `age ${age}s` : null].filter(Boolean).join(" · ");
}

async function mapLimit(items, limit, worker) {
  const results = new Array(items.length);
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const index = next++;
      results[index] = await worker(items[index], index);
    }
  }));
  return results;
}

export async function verifyLiveSite(userOptions = {}, fetchImpl = globalThis.fetch) {
  const options = { ...defaultOptions, ...userOptions };
  const startedAt = new Date().toISOString();
  const checks = [];
  const record = (kind, target, findings, extra = {}) => {
    const worst = findings.some(f => f.result === "fail") ? "fail" : findings.some(f => f.result === "warn") ? "warn" : extra.info ? "info" : "pass";
    const { info: _info, detail: fallbackDetail, ...rest } = extra;
    checks.push({ kind, target, ...rest, result: worst, detail: findings.map(f => f.detail).join("; ") || fallbackDetail || "" });
  };
  const originFor = expectation => (expectation.site === "awards" ? options.awardsOrigin : options.summitOrigin);

  // 1. Public pages (as visitors get them: cached when cached).
  const pages = {};
  for (const [path, expectation] of Object.entries(pageExpectations)) {
    const url = `${originFor(expectation)}${path}`;
    const result = await timedFetch(fetchImpl, url, { redirect: "follow" }, options);
    pages[path] = result;
    record("page", url, checkPage(path, expectation, result, options), { status: result.status, ms: result.ms, cache: cacheNote(result.headers), buildId: extractBuildId(result.text) });
  }

  // 2. One deploy for every page.
  const buildIds = new Map();
  for (const check of checks) if (check.kind === "page" && check.buildId) buildIds.set(check.buildId, [...(buildIds.get(check.buildId) ?? []), check.target]);
  const deployBuildId = buildIds.size === 1 ? [...buildIds.keys()][0] : null;
  record("consistency", "one deploy for every page", buildIds.size > 1
    ? [{ result: "fail", detail: `pages come from ${buildIds.size} different builds: ${[...buildIds.entries()].map(([id, targets]) => `${id} (${targets.length})`).join(", ")}` }]
    : buildIds.size === 0 ? [{ result: "warn", detail: "no build id found on any page" }] : [], { detail: deployBuildId ? `build ${deployBuildId}` : "" });

  // 3. Domain redirects, compatibility aliases, robots and sitemap.
  for (const expected of redirectExpectations(options)) {
    const result = await timedFetch(fetchImpl, expected.from, {}, options, "none");
    record("redirect", expected.from, checkRedirect(expected, result), { status: result.status, ms: result.ms });
  }
  for (const alias of compatibilityAliases) {
    const result = await timedFetch(fetchImpl, `${options.summitOrigin}${alias.from}`, {}, options);
    record("alias", `${options.summitOrigin}${alias.from}`, checkAlias(alias, result), { status: result.status, ms: result.ms });
  }
  const robots = await timedFetch(fetchImpl, `${options.summitOrigin}/robots.txt`, {}, options);
  record("meta", `${options.summitOrigin}/robots.txt`, checkRobots(robots), { status: robots.status, ms: robots.ms });
  const sitemap = await timedFetch(fetchImpl, `${options.summitOrigin}/sitemap.xml`, {}, options);
  record("meta", `${options.summitOrigin}/sitemap.xml`, checkSitemap(sitemap, options), { status: sitemap.status, ms: sitemap.ms });

  // 4. Profile pages (uncached function renders: the slowest path visitors hit).
  const profilePaths = firstProfilePaths(pages["/"]?.text ?? "", options.profiles);
  const awardsProfile = firstProfilePaths(pages["/awards/2026"]?.text ?? "", 1)[0];
  const profileUrls = [...profilePaths.map(path => `${options.summitOrigin}${path}`), ...(awardsProfile ? [`${options.awardsOrigin}${awardsProfile}?from=awards`] : [])];
  if (!profileUrls.length) record("profile", "profiles", [{ result: "fail", detail: "no profile links found on the home page" }]);
  for (const url of profileUrls) {
    const result = await timedFetch(fetchImpl, url, { redirect: "follow" }, options);
    const findings = checkPage(new URL(url).pathname, { text: ["<h1"] }, result, options).filter(f => !/no Next build id/.test(f.detail));
    const title = decodeEntities(/<title>([^<]*)<\/title>/i.exec(result.text ?? "")?.[1] ?? "");
    if (/^(Profile not found|Guest details temporarily unavailable)/i.test(title)) findings.push({ result: "fail", detail: `profile page says "${title}"` });
    record("profile", url, findings, { status: result.status, ms: result.ms, cache: cacheNote(result.headers), detail: title ? `“${title}”` : "" });
  }

  // 5. Pictures really load.
  if (options.images) {
    const candidates = [];
    for (const path of ["/", "/awards/2026", "/partners"]) {
      const page = pages[path];
      if (page?.text) candidates.push(...extractImageUrls(page.text, page.url || `${originFor(pageExpectations[path])}${path}`));
    }
    const picked = sample([...new Set(candidates)], options.maxImages);
    const results = await mapLimit(picked, 6, url => timedFetch(fetchImpl, url, { redirect: "follow" }, options, "none"));
    const broken = results.map((result, index) => ({ result, url: picked[index] })).filter(({ result }) => result.error || result.status !== 200 || !/^image\//i.test(result.headers?.get?.("content-type") ?? ""));
    const findings = broken.map(({ result, url }) => ({ result: "fail", detail: `${url} → ${result.error ?? `HTTP ${result.status} ${result.headers?.get?.("content-type") ?? ""}`}` }));
    if (!picked.length) findings.push({ result: "warn", detail: "no pictures found on the pages to sample" });
    record("images", `${picked.length} of ${new Set(candidates).size} pictures sampled`, findings, { detail: "all loaded as images" });
  }

  // 6. Endpoints the public forms and the Ask AI widget rely on.
  for (const path of ["/api/rsvp", "/api/nominations"]) {
    const url = `${options.summitOrigin}${path}`;
    const result = await timedFetch(fetchImpl, url, { method: "OPTIONS", headers: { origin: options.rsvpFormOrigin, "access-control-request-method": "POST" } }, options, "none");
    const findings = [];
    if (result.error) findings.push({ result: "fail", detail: `request failed: ${result.error}` });
    else if (result.status !== 204) findings.push({ result: "fail", detail: `preflight HTTP ${result.status} (expected 204)` });
    else if (!result.headers?.get?.("access-control-allow-origin")) findings.push({ result: "fail", detail: "preflight without Access-Control-Allow-Origin" });
    record("endpoint", `OPTIONS ${url}`, findings, { status: result.status, ms: result.ms });
  }
  if (options.askAi) {
    const url = `${options.summitOrigin}/api/ask-ai`;
    const result = await timedFetch(fetchImpl, url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ question: "What time do doors open for the Awards show?" }) }, options);
    const findings = [];
    let answer = "";
    try { answer = JSON.parse(result.text || "{}").answer ?? ""; } catch { answer = ""; }
    if (result.error) findings.push({ result: "fail", detail: `request failed: ${result.error}` });
    else if (result.status !== 200) findings.push({ result: "fail", detail: `HTTP ${result.status}` });
    else if (!answer.trim()) findings.push({ result: "fail", detail: "empty answer" });
    else if (result.ms > options.failMs) findings.push({ result: "warn", detail: `slow: ${result.ms} ms` });
    record("endpoint", `POST ${url}`, findings, { status: result.status, ms: result.ms, detail: answer ? `answer: ${answer.slice(0, 80).replace(/\s+/g, " ")}…` : "" });
  }

  // 7. Upstream staff API: informational. The site no longer waits for it at request time (Sept 24, 2026).
  if (options.staffApiOrigin) {
    const url = `${options.staffApiOrigin}/api/snapshot`;
    const result = await timedFetch(fetchImpl, url, {}, { ...options, timeoutMs: Math.min(options.timeoutMs, 10000) });
    let revision = null;
    try { revision = JSON.parse(result.text || "{}").revision ?? null; } catch { revision = null; }
    record("upstream", url, [], { info: true, status: result.status, ms: result.ms, detail: result.error ? `unreachable (${result.error}) — informational, the site does not depend on it` : `HTTP ${result.status} in ${result.ms} ms, revision ${revision ?? "?"} — informational` });
  }

  const summary = { pass: 0, warn: 0, fail: 0, info: 0 };
  for (const check of checks) summary[check.result] += 1;
  return { startedAt, finishedAt: new Date().toISOString(), origins: { summit: options.summitOrigin, awards: options.awardsOrigin }, deployBuildId, summary, checks };
}

export function formatReport(report) {
  const lines = [];
  for (const check of report.checks) {
    const label = check.result.toUpperCase().padEnd(4);
    const status = check.status ? String(check.status).padStart(3) : "   ";
    const ms = check.ms !== undefined ? `${String(check.ms).padStart(5)} ms` : "        ";
    const extra = [check.detail, check.cache].filter(Boolean).join(" · ");
    lines.push(`${label} ${status} ${ms}  ${check.target}${extra ? `  — ${extra}` : ""}`);
  }
  const { pass, warn, fail, info } = report.summary;
  lines.push("", `${fail ? "LIVE SITE CHECK FAILED" : "LIVE SITE CHECK PASSED"}: ${pass} passed, ${warn} warnings, ${fail} failed, ${info} informational · deploy build ${report.deployBuildId ?? "mixed/unknown"} · ${report.origins.summit} + ${report.origins.awards} · ${report.finishedAt}`);
  return lines.join("\n");
}

export async function main(argv = process.argv.slice(2)) {
  const { values } = parseArgs({ args: argv, options: {
    origin: { type: "string" }, "awards-origin": { type: "string" }, "staff-api": { type: "string" },
    json: { type: "boolean", default: false }, "skip-images": { type: "boolean", default: false }, "skip-ask-ai": { type: "boolean", default: false },
    "max-images": { type: "string" }, "timeout-ms": { type: "string" }, "slow-ms": { type: "string" }, "fail-ms": { type: "string" }
  } });
  const options = {};
  if (values.origin) options.summitOrigin = values.origin.replace(/\/$/, "");
  if (values["awards-origin"]) options.awardsOrigin = values["awards-origin"].replace(/\/$/, "");
  else if (values.origin) options.awardsOrigin = options.summitOrigin;
  if (values["staff-api"] !== undefined) options.staffApiOrigin = values["staff-api"].replace(/\/$/, "") || null;
  if (values["skip-images"]) options.images = false;
  if (values["skip-ask-ai"]) options.askAi = false;
  for (const [flag, key] of [["max-images", "maxImages"], ["timeout-ms", "timeoutMs"], ["slow-ms", "slowMs"], ["fail-ms", "failMs"]]) {
    if (values[flag] !== undefined) {
      const number = Number(values[flag]);
      if (!Number.isInteger(number) || number < 1) throw new Error(`--${flag} must be a positive integer`);
      options[key] = number;
    }
  }
  const report = await verifyLiveSite(options);
  process.stdout.write(`${values.json ? JSON.stringify(report, null, 2) : formatReport(report)}\n`);
  return report.summary.fail === 0 ? 0 : 1;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().then(code => { process.exitCode = code; }).catch(error => { console.error(error instanceof Error ? error.message : error); process.exitCode = 2; });
}
