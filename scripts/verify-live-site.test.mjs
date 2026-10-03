import assert from "node:assert/strict";
import test from "node:test";
import { checkAlias, checkPage, checkRedirect, checkRobots, checkSitemap, compatibilityAliases, countPersonCards, countPersonLinks, decodeEntities, defaultOptions, extractBuildId, extractImageUrls, formatReport, pageExpectations, redirectExpectations, sample, verifyLiveSite } from "./verify-live-site.mjs";

const summit = "https://summit.example";
const awards = "https://awards.example";
const buildId = "59Ve4oYWRdBWIwUrbtZJJ";

function people(count, prefix = "20260000-0000-4000-8003-0000000000") {
  return Array.from({ length: count }, (_, i) => `<a class="personCard" href="/directory/${prefix}${String(i).padStart(2, "0")}"><img src="/2026-headshots/p${i}.jpg" alt=""><h4>Person ${i}</h4></a>`).join("");
}

function page(body, { id = buildId, title = "Not Alone Summit" } = {}) {
  return `<!doctype html><html><head><title>${title}</title></head><body>${body}<script>self.__next_f.push([1,"0:{\\"P\\":null,\\"b\\":\\"${id}\\",\\"p\\":\\"\\"}"])</script></body></html>`;
}

const homeHtml = page(`<h1>Not Alone Summit</h1><p>November 2–4 | Wynn Las Vegas</p><section id="directory"><h2>Who&#x27;s Coming</h2><p>More talent and guests to be announced.</p>${people(60)}</section>`);
const awardsHtml = page(`<h2>The 2026 Lineup</h2>${people(45, "20260000-0000-4000-8003-00000000A")}<h2>Founders</h2>`);
const scheduleFlight = JSON.stringify(Array.from({ length: 26 }, (_, i) => ({ startUtc: `2026-11-02T${String(10 + i % 8).padStart(2, "0")}:00:00Z` })));
const scheduleHtml = page(`<h1>Schedule</h1><p>November 2–4</p><script>self.__next_f.push([1,${JSON.stringify(scheduleFlight)}])</script>`);
const imagesHtml = page(`<h2>Founding Partners</h2>${Array.from({ length: 50 }, (_, i) => `<img src="/2026-partners/logo-${i}.png" srcset="/2026-partners/logo-${i}.png 1x, /2026-partners/logo-${i}@2x.png 2x">`).join("")}`);
const genericHtml = text => page(`<h1>${text}</h1><p>Meet Our Guests · 2025 Award Winners · Wynn · Ask</p>${people(45)}${"<img src=\"/images/x.png\">".repeat(45)}`);

function response(status, body = "", headers = {}, url) {
  return { status, url, headers: new Headers(headers), text: async () => body, body: { cancel: async () => undefined } };
}

/** A fake of the whole live site: pages, redirects, robots, sitemap, images, endpoints, upstream. */
function fakeSite(overrides = {}) {
  const html = { "/": homeHtml, "/awards/2026": awardsHtml, "/schedule": scheduleHtml, "/partners": imagesHtml, ...overrides.html };
  return async (url, init = {}) => {
    const { origin, pathname, hostname, protocol } = new URL(url);
    const method = init.method ?? "GET";
    if (protocol === "http:") return response(301, "", { location: `https://${hostname}/` }, url);
    if (hostname.startsWith("www.")) return hostname.includes("awards") ? response(302, "", { location: `${awards}/awards/2026` }, url) : response(301, "", { location: `${summit}/` }, url);
    if (origin === awards && pathname === "/") return response(302, "", { location: `${awards}/awards/2026` }, url);
    if (origin === "https://staff.example") return response(200, JSON.stringify({ revision: 9 }), { "content-type": "application/json" }, url);
    if (pathname === "/robots.txt") return response(200, "User-Agent: *\nAllow: /\nDisallow: /api/\nDisallow: /staff\n", { "content-type": "text/plain" }, url);
    if (pathname === "/sitemap.xml") return response(200, `<urlset><url><loc>${summit}/</loc></url><url><loc>${summit}/2025</loc></url><url><loc>${awards}/awards/2026</loc></url><url><loc>${awards}/awards/2025</loc></url></urlset>`, { "content-type": "application/xml" }, url);
    if (pathname.startsWith("/api/") && method === "OPTIONS") return response(204, "", { "access-control-allow-origin": init.headers?.origin ?? "*" }, url);
    if (pathname === "/api/ask-ai") return response(200, JSON.stringify({ answer: "Doors open at 5:30 PM." }), { "content-type": "application/json" }, url);
    if (/\.(png|jpg)$/.test(pathname)) return response(overrides.brokenImage === pathname ? 404 : 200, "", { "content-type": "image/png" }, url);
    const alias = compatibilityAliases.find(a => a.from === pathname);
    if (alias) return response(307, "", { location: `${summit}${alias.to}` }, url);
    if (pathname.startsWith("/directory/")) return response(200, page(overrides.lostProfiles ? "<h1>Profile not found</h1>" : "<h1>Person</h1><p>Bio</p>", { title: overrides.lostProfiles ? "Profile not found | Not Alone Summit" : "Person | Not Alone Summit 2026" }), { "content-type": "text/html; charset=utf-8" }, url);
    const body = html[pathname] ?? genericHtml(pathname);
    return response(200, body, { "content-type": "text/html; charset=utf-8", "cache-status": "\"Netlify Durable\"; hit; ttl=120", age: "180" }, url);
  };
}

const options = { summitOrigin: summit, awardsOrigin: awards, staffApiOrigin: "https://staff.example", maxImages: 12, slowMs: 3000, failMs: 9000 };

test("decodes the entities Next writes into text", () => {
  assert.equal(decodeEntities("Who&#x27;s Coming &amp; more &quot;x&quot;"), "Who's Coming & more \"x\"");
});

test("extracts the Next build id from the flight payload, escaped or plain", () => {
  assert.equal(extractBuildId(homeHtml), buildId);
  assert.equal(extractBuildId('{"P":null,"b":"AbCdEfGhIjKlMnOpQrStU"}'), "AbCdEfGhIjKlMnOpQrStU");
  assert.equal(extractBuildId("<html>no payload</html>"), null);
});

test("counts people, cards, images and same-origin pictures", () => {
  assert.equal(countPersonLinks(homeHtml), 60);
  assert.equal(countPersonCards(homeHtml), 60);
  const urls = extractImageUrls(`<img src="/a.png"><img src="https://other.example/b.png"><source srcset="/c.webp 1x, /c@2x.webp 2x"><img src="https://i.ytimg.com/vi/x/max.jpg">`, `${summit}/`);
  assert.deepEqual(urls, [`${summit}/a.png`, `${summit}/c.webp`, "https://i.ytimg.com/vi/x/max.jpg"]);
  assert.deepEqual(sample([1, 2, 3, 4, 5, 6], 3), [1, 3, 5]);
});

test("a healthy home page passes and every degraded state fails", () => {
  const ok = { status: 200, headers: new Headers({ "content-type": "text/html" }), text: homeHtml, ms: 400 };
  assert.deepEqual(checkPage("/", pageExpectations["/"], ok, options), []);
  const empty = { ...ok, text: page("<h2>Who&#x27;s Coming</h2><p>More talent and guests to be announced.</p><p>Wynn Las Vegas</p><p class=\"emptyState\">Confirmed guest details will appear after event-team approval.</p>") };
  const details = checkPage("/", pageExpectations["/"], empty, options).map(f => f.detail);
  assert.ok(details.some(d => d.includes("Confirmed guest details will appear")), details.join("; "));
  assert.ok(details.some(d => d.includes("0 people linked")), details.join("; "));
  const stray = { ...ok, text: homeHtml.replace("</body>", "<a href=\"https://abc-def.trycloudflare.com/x\">x</a></body>") };
  assert.ok(checkPage("/", pageExpectations["/"], stray, options).some(f => /tunnel/.test(f.detail)));
  const slow = checkPage("/", pageExpectations["/"], { ...ok, ms: 4000 }, options);
  assert.deepEqual(slow.map(f => f.result), ["warn"]);
  const dead = checkPage("/", pageExpectations["/"], { ...ok, ms: 9500 }, options);
  assert.ok(dead.some(f => f.result === "fail" && /limit/.test(f.detail)));
  const wrongStatus = checkPage("/", pageExpectations["/"], { ...ok, status: 502 }, options);
  assert.ok(wrongStatus.some(f => f.detail === "HTTP 502"));
  const failed = checkPage("/", pageExpectations["/"], { status: 0, headers: new Headers(), text: "", ms: 20000, error: "timed out after 20000 ms" }, options);
  assert.deepEqual(failed, [{ result: "fail", detail: "request failed: timed out after 20000 ms" }]);
});

test("schedule, partners and awards expectations use their own markers", () => {
  const html = (text, type = "text/html") => ({ status: 200, headers: new Headers({ "content-type": type }), text, ms: 100 });
  assert.deepEqual(checkPage("/schedule", pageExpectations["/schedule"], html(scheduleHtml), options), []);
  assert.ok(checkPage("/schedule", pageExpectations["/schedule"], html(page("<h1>Schedule</h1><p>November</p>")), options).some(f => /0 sessions/.test(f.detail)));
  assert.deepEqual(checkPage("/partners", pageExpectations["/partners"], html(imagesHtml), options), []);
  assert.deepEqual(checkPage("/awards/2026", pageExpectations["/awards/2026"], html(awardsHtml), options), []);
  assert.ok(checkPage("/awards/2026", pageExpectations["/awards/2026"], html(page("<h2>The 2026 Lineup</h2><h2>Founders</h2>")), options).some(f => /0 people linked/.test(f.detail)));
});

test("redirects, aliases, robots and sitemap", () => {
  const expected = redirectExpectations(options);
  assert.deepEqual(expected.map(e => e.from), ["http://summit.example/", "https://www.summit.example/", "http://awards.example/", "https://awards.example/", "https://www.awards.example/"]);
  const good = { status: 302, headers: new Headers({ location: "/awards/2026" }), url: `${awards}/` };
  assert.deepEqual(checkRedirect(expected[3], good), []);
  assert.ok(checkRedirect(expected[3], { ...good, headers: new Headers({ location: "/" }) }).length === 1);
  assert.ok(checkRedirect(expected[3], { status: 200, headers: new Headers(), url: `${awards}/` })[0].detail.startsWith("HTTP 200"));
  assert.deepEqual(checkAlias(compatibilityAliases[0], { status: 307, headers: new Headers({ location: `${summit}/` }), url: `${summit}/summit` }), []);
  assert.deepEqual(checkAlias(compatibilityAliases[3], { status: 200, headers: new Headers(), url: `${summit}/awards`, text: "<meta name=\"robots\" content=\"noindex\"><a href=\"/awards/2026\">x</a>" }), []);
  assert.equal(checkAlias(compatibilityAliases[0], { status: 200, headers: new Headers(), url: `${summit}/summit`, text: "<h1>Home</h1>" }).length, 1);
  assert.deepEqual(checkRobots({ status: 200, text: "Allow: /\nDisallow: /api/\nDisallow: /staff" }), []);
  assert.equal(checkRobots({ status: 200, text: "Disallow: /" }).length, 3);
  assert.deepEqual(checkSitemap({ status: 200, text: `<loc>${summit}/</loc><loc>${summit}/2025</loc><loc>${awards}/awards/2026</loc><loc>${awards}/awards/2025</loc>` }, options), []);
  assert.equal(checkSitemap({ status: 200, text: "<loc>https://elsewhere.example/</loc>" }, options).length, 4);
});

test("a healthy site passes end to end and the report is readable", async () => {
  const report = await verifyLiveSite(options, fakeSite());
  const failures = report.checks.filter(c => c.result === "fail");
  assert.deepEqual(failures, [], JSON.stringify(failures, null, 2));
  assert.equal(report.deployBuildId, buildId);
  assert.equal(report.summary.info, 1);
  assert.ok(report.checks.some(c => c.kind === "profile" && c.target.endsWith("?from=awards")));
  assert.ok(report.checks.find(c => c.kind === "images").target.startsWith("12 of"));
  const text = formatReport(report);
  assert.match(text, /LIVE SITE CHECK PASSED/);
  assert.match(text, /PASS +200 +\d+ ms {2}https:\/\/summit\.example\//);
});

test("pages served from two different deploys, a broken picture and an empty lineup are reported", async () => {
  const stale = homeHtml.replace(buildId, "OlderDeployBuildId0001");
  const report = await verifyLiveSite(options, fakeSite({ html: { "/": stale, "/awards/2026": page("<h2>The 2026 Lineup</h2><h2>Founders</h2>") }, brokenImage: "/2026-headshots/p0.jpg" }));
  const byKind = Object.fromEntries(report.checks.filter(c => c.result === "fail").map(c => [c.kind, c.detail]));
  assert.match(byKind.consistency, /2 different builds/);
  assert.match(byKind.images, /p0\.jpg → HTTP 404/);
  assert.match(byKind.page, /0 people linked/);
  assert.equal(report.deployBuildId, null);
  assert.match(formatReport(report), /LIVE SITE CHECK FAILED/);
});

test("profile pages that answer 200 with a not-found title are failures", async () => {
  const report = await verifyLiveSite(options, fakeSite({ lostProfiles: true }));
  const profiles = report.checks.filter(c => c.kind === "profile");
  assert.equal(profiles.length, 4);
  assert.ok(profiles.every(c => c.result === "fail" && /Profile not found/.test(c.detail)), JSON.stringify(profiles));
});

test("a site that is down fails every page without throwing", async () => {
  const report = await verifyLiveSite({ ...options, timeoutMs: 50 }, async () => { throw Object.assign(new Error("connect ECONNREFUSED"), { name: "Error" }); });
  assert.ok(report.summary.fail >= Object.keys(pageExpectations).length);
  assert.ok(report.checks.every(c => c.result !== "pass" || c.kind === "consistency"), JSON.stringify(report.checks.filter(c => c.result === "pass")));
  assert.ok(defaultOptions.failMs < 10000, "Netlify's synchronous function limit is 10 s");
});
