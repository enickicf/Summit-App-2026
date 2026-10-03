import assert from "node:assert/strict";
import test from "node:test";
import { auditPublicSite, discoverPublicRoutes, loadHtmlParser, main, pngDimensions, safeReference, validateOptions } from "./audit-public-site-http.mjs";

const origin = "http://127.0.0.1:4317";
const canonicalOrigin = "https://owner.example";
const eventPaths = ["/", "/2025", "/awards/2025", "/awards/2026"];
const aliases = new Map([["/summit", "/"], ["/summit/2025", "/2025"], ["/summit/schedule", "/schedule"], ["/awards", "/awards/2026"]]);
const inventory = { pages: [...eventPaths, ...aliases.keys(), "/schedule"], dynamic: ["/directory/[slug]"] };
const securityHeaders = {
  "Content-Security-Policy": "base-uri 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY"
};
const parseHtml = loadHtmlParser();

function response(body, type = "text/html", status = 200, extraHeaders = {}) {
  return new Response(body, { status, headers: { ...securityHeaders, "Content-Type": type, ...extraHeaders } });
}

function png(size) {
  const bytes = Buffer.alloc(24);
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]).copy(bytes);
  bytes.writeUInt32BE(13, 8);
  bytes.write("IHDR", 12, "ascii");
  bytes.writeUInt32BE(size, 16);
  bytes.writeUInt32BE(size, 20);
  return bytes;
}

function documentHtml(url, { indexing = "blocked", extra = "", missing = false, canonical } = {}) {
  const path = url.pathname;
  const indexable = !missing && (eventPaths.includes(path) || path.startsWith("/directory/"));
  const expectedCanonical = new URL(path, canonicalOrigin);
  if (path.startsWith("/directory/2025-") && url.searchParams.get("from") === "awards") expectedCanonical.searchParams.set("from", "awards");
  return `<!doctype html><html><head><title>HTTP audit fixture</title>
    <meta name="robots" content="${indexing === "allowed" && indexable ? "index, follow" : "noindex, nofollow"}">
    ${indexable ? `<link rel="canonical" href="${canonical ?? expectedCanonical.href}">` : ""}
    <link rel="manifest" href="/manifest.webmanifest"><link rel="icon" href="/icons/challenge-48.png">
    </head><body><main><h1>${missing ? "Profile not found" : "HTTP audit fixture"}</h1>${extra}</main></body></html>`;
}

function streamedNotFoundHtml(url) {
  return documentHtml(url, { missing: true, extra: '<template data-dgst="NEXT_HTTP_ERROR_FALLBACK;404"></template>' })
    .replace("<h1>Profile not found</h1>", "");
}

function streamedRedirectHtml(destination) {
  return `<!doctype html><html><head><title>Redirect</title><meta name="robots" content="noindex, nofollow"></head>
    <body><meta id="__next-page-redirect" http-equiv="refresh" content="1;url=${destination}"></body></html>`;
}

// All requests are injected responses: these tests never open a socket or invoke the site.
function fixture({ indexing = "blocked", rootExtra = "", override, parser = parseHtml, ...options } = {}) {
  const calls = [];
  function defaultResponse(url) {
    const path = url.pathname;
    if (aliases.has(path)) return response(null, "text/html", 307, { Location: aliases.get(path) });
    if (path === "/api/messages" || path === "/api/tickets") return response(null, "text/plain", 405);
    if (path === "/directory/%E0%A4%A") return response("Bad Request", "text/plain", 400);
    if (path.includes("__http-audit-missing-profile__")) return response(documentHtml(url, { missing: true }), "text/html", 404);
    if (path === "/robots.txt") return response(indexing === "allowed"
      ? `User-Agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${canonicalOrigin}/sitemap.xml\n`
      : "User-Agent: *\nDisallow: /\n", "text/plain");
    if (path === "/sitemap.xml") return response(`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${indexing === "allowed"
      ? eventPaths.map(page => `<url><loc>${new URL(page, canonicalOrigin).href}</loc></url>`).join("") : ""}</urlset>`, "application/xml");
    if (path === "/manifest.webmanifest") return response(JSON.stringify({ id: "/", name: "Not Alone Summit", start_url: "/", display: "browser",
      icons: [192, 512].map(size => ({ src: `/icons/challenge-${size}.png`, sizes: `${size}x${size}`, type: "image/png" })) }), "application/manifest+json");
    if (path.startsWith("/icons/")) return response(png(Number(path.match(/(\d+)\.png$/)?.[1] ?? 48)), "image/png");
    if (path === "/images/portrait.png" || path === "/_next/image") return response(png(48), "image/png");
    if (inventory.pages.includes(path) || path.startsWith("/directory/")) return response(documentHtml(url, { indexing, extra: path === "/" ? rootExtra : "" }));
    return response("Not found", "text/plain", 404);
  }
  const fetchImpl = async (href, init) => {
    const url = new URL(href);
    assert.equal(url.origin, origin, "every requested URL must remain loopback");
    assert.ok(["GET", "HEAD"].includes(init.method));
    assert.equal(init.redirect, "manual");
    assert.equal(init.credentials, "omit");
    assert.equal(init.body, undefined);
    assert.equal(new Headers(init.headers).has("authorization"), false);
    assert.equal(new Headers(init.headers).has("cookie"), false);
    calls.push({ url, method: init.method });
    return await override?.(url, init, defaultResponse) ?? defaultResponse(url);
  };
  return { calls, run: () => auditPublicSite({ origin, canonicalOrigin, indexing, ...options }, { inventory, fetchImpl, parseHtml: parser }) };
}

const checks = report => report.failures.map(failure => failure.check);

test("requires an explicit loopback origin and bounded options", () => {
  for (const candidate of [undefined, "https://production.example", "http://production.example:4317", "http://localhost", "http://localhost:4317/path",
    "http://user:secret@localhost:4317", "http://localhost:4317/?token=secret", "http://localhost:4317/#fragment", "http://localhost:4317\\path"]) {
    assert.throws(() => validateOptions({ origin: candidate }));
  }
  for (const candidate of [origin, "http://localhost:4317", "http://[::1]:4317"]) assert.equal(validateOptions({ origin: candidate }).origin, candidate);
  for (const value of [{ indexing: "guess" }, { maxRequests: 0 }, { maxRequests: 1001 }, { timeoutMs: 99 }, { canonicalOrigin: "http://owner.example" }]) {
    assert.throws(() => validateOptions({ origin, ...value }));
  }
});

test("discovers repository public pages without invoking API routes or treating profile templates as URLs", () => {
  const routes = discoverPublicRoutes();
  for (const path of eventPaths) assert.ok(routes.pages.includes(path));
  assert.ok(routes.pages.includes("/summit/live"));
  assert.ok(routes.dynamic.includes("/directory/[slug]"));
  assert.ok(routes.pages.every(path => !path.includes("[") && !path.startsWith("/api/")));
});

test("rejects unsafe local references and remote optimizer targets", () => {
  const options = validateOptions({ origin });
  const pages = new Set(inventory.pages);
  for (const value of ["/api/ask-ai", "/api/messages", "/?token=secret", "/directory/person?token=secret", "http://user:secret@127.0.0.1:4317/",
    "/_next/image?url=https%3A%2F%2Fexternal.example%2Fimage.png&w=48&q=75", "/_next/image?url=%2Fapi%2Fsecret.png&w=48&q=75",
    "/_next/image?url=%2Fimages%2Fportrait.png&w=99999&q=75", "/_next/image?url=%2Fimages%2Fportrait.png&w=48&q=75&q=80"]) {
    assert.equal(safeReference(value, origin, options, pages).kind, "invalid", value);
  }
  assert.equal(safeReference("https://external.example/", origin, options, pages).kind, "external");
  assert.equal(safeReference("mailto:hello@example.test", origin, options, pages).kind, "ignored");
  assert.equal(safeReference("/directory/person?from=awards#details", origin, options, pages).url.hash, "");
  assert.equal(safeReference("/_next/image?url=%2Fimages%2Fportrait.png&w=48&q=75", origin, options, pages).kind, "image");
});

for (const indexing of ["blocked", "allowed"]) {
  test(`audits ${indexing} metadata, aliases, linked profiles, icons, and safe GET retirement statuses`, async () => {
    assert.equal(typeof parseHtml, "function", "the installed Next structured parser should be available");
    const run = fixture({ indexing, rootExtra: `<a href="/directory/current?from=awards">Current fixture</a>
      <a href="/directory/2025-archive?from=awards">Archive fixture</a><a href="https://external.example/">External</a>
      <a href="#main-content">Local fragment</a><img src="/images/portrait.png" alt="">
      <img src="/_next/image?url=%2Fimages%2Fportrait.png&amp;w=48&amp;q=75" alt="">` });
    const report = await run.run();
    assert.equal(report.status, "passed", JSON.stringify(report.failures));
    assert.equal(report.counts.failures, 0);
    assert.equal(report.counts.icons, 2);
    assert.equal(report.counts.images, 3);
    assert.ok(report.counts.externalReferencesSkipped > 0);
    assert.ok(run.calls.some(call => call.method === "HEAD" && call.url.pathname === "/_next/image"));
    assert.equal(run.calls.filter(call => call.url.pathname.startsWith("/api/")).length, 2);
    assert.ok(report.responses.find(item => item.path === "/summit").headersPassed);
    assert.equal(report.responses.find(item => item.path === "/summit").status, 307);
  });
}

test("fails incorrect canonicals, indexing metadata, titles, and security headers", async () => {
  const run = fixture({ override: url => {
    if (url.pathname !== "/") return;
    const html = documentHtml(url, { canonical: "https://wrong.example/" }).replace("<title>HTTP audit fixture</title>", "").replace("noindex, nofollow", "index, follow");
    const result = response(html);
    result.headers.delete("x-content-type-options");
    return result;
  } });
  const report = await run.run();
  for (const check of ["canonical-origin-path-or-context", "robots-meta-policy", "missing-title", "header:nosniff"]) assert.ok(checks(report).includes(check));
  assert.equal(report.status, "failed");
});

test("normalizes equivalent absolute root canonicals without permitting different URLs", async () => {
  const run = fixture({ override: url => url.pathname === "/" ? response(documentHtml(url, { canonical: canonicalOrigin })) : undefined });
  assert.equal((await run.run()).status, "passed");
  for (const canonical of ["/", `${canonicalOrigin}/2025`, `${canonicalOrigin}/?from=awards`, `${canonicalOrigin}/#fragment`, "https://user:secret@owner.example/"]) {
    const invalid = fixture({ override: url => url.pathname === "/" ? response(documentHtml(url, { canonical })) : undefined });
    assert.ok(checks(await invalid.run()).includes("canonical-origin-path-or-context"), canonical);
  }
});

test("follows only exact Next streamed compatibility redirects and inspects the destinations", async () => {
  const run = fixture({ override: url => aliases.has(url.pathname) ? response(streamedRedirectHtml(aliases.get(url.pathname))) : undefined });
  const report = await run.run();
  assert.equal(report.status, "passed", JSON.stringify(report.failures));
  for (const path of aliases.keys()) {
    const result = report.responses.find(item => item.path === path);
    assert.equal(result.status, 200);
    assert.equal(result.finalStatus, 200);
    assert.equal(result.redirect, "next-meta-refresh");
    assert.ok(result.headersPassed);
  }
  assert.equal(report.warnings.filter(item => item.check.startsWith("streamed-redirect:")).length, 4);
});

test("rejects streamed alias redirects with incorrect targets, markers, policy, or HTTP status", async () => {
  const valid = streamedRedirectHtml("/awards/2026");
  for (const body of [
    streamedRedirectHtml("https://external.example/awards/2026"), streamedRedirectHtml("/awards/2025"),
    streamedRedirectHtml("/awards/2026?from=awards"), streamedRedirectHtml("/awards/2026#directory"),
    valid.replace('id="__next-page-redirect"', 'id="untrusted"'), valid.replace("noindex, nofollow", "index, follow"),
    valid.replace("noindex, nofollow", "noindex, index"), valid.replace("noindex, nofollow", ""),
    valid.replace("</body>", '<meta http-equiv="refresh" content="1;url=/awards/2026"></body>')
  ]) {
    const run = fixture({ override: url => url.pathname === "/awards" ? response(body) : undefined });
    assert.ok(checks(await run.run()).includes("invalid-streamed-compatibility-redirect"));
  }
  const error = fixture({ override: url => url.pathname === "/awards" ? response(valid, "text/html", 503) : undefined });
  const report = await error.run();
  assert.ok(checks(report).includes("compatibility-redirect"));
  assert.ok(checks(report).includes("page-status-or-content-type"));
  assert.equal(report.warnings.some(item => item.path === "/awards"), false);
});

test("also accepts permanent HTTP compatibility redirects", async () => {
  const run = fixture({ override: url => aliases.has(url.pathname) ? response(null, "text/html", 308, { Location: aliases.get(url.pathname) }) : undefined });
  const report = await run.run();
  assert.equal(report.status, "passed");
  assert.equal(report.responses.find(item => item.path === "/awards").redirect, "http");
});

test("does not fetch external redirects, arbitrary queries, API links, or remote optimizer targets", async () => {
  const secret = "fixture-secret-must-not-appear-in-report";
  const run = fixture({ rootExtra: `<a href="/api/ask-ai">Do not submit</a><a href="/?token=${secret}">Unsafe query</a>
    <img src="/_next/image?url=https%3A%2F%2Fexternal.example%2Fremote.png&amp;w=48&amp;q=75" alt="">`,
  override: url => url.pathname === "/2025" ? response(null, "text/html", 307, { Location: `https://external.example/?secret=${secret}` }) : undefined });
  const report = await run.run();
  assert.ok(checks(report).includes("unsafe-or-unknown-local-reference"));
  assert.ok(checks(report).includes("unsafe-or-missing-redirect"));
  assert.equal(JSON.stringify(report).includes(secret), false);
  assert.ok(run.calls.every(call => !call.url.searchParams.has("token") && call.url.pathname !== "/_next/image" && call.url.pathname !== "/api/ask-ai"));
});

test("detects loops, wrong compatibility redirects, and unavailable linked profiles", async () => {
  const run = fixture({ rootExtra: '<a href="/directory/unavailable">Unavailable fixture</a>', override: url => {
    if (url.pathname === "/2025") return response(null, "text/html", 307, { Location: "/2025" });
    if (url.pathname === "/awards") return response(null, "text/html", 307, { Location: "/awards/2025" });
    if (url.pathname === "/directory/unavailable") return response(documentHtml(url, { missing: true }), "text/html", 404);
  } });
  const report = await run.run();
  for (const check of ["redirect-loop", "compatibility-redirect", "linked-profile-unavailable-or-missing", "page-status-or-content-type"]) assert.ok(checks(report).includes(check));
});

test("reports streamed not-found responses separately from real HTTP 404", async () => {
  const run = fixture({ override: url => url.pathname.includes("__http-audit-missing-profile__") ? response(documentHtml(url, { missing: true })) : undefined });
  const report = await run.run();
  assert.equal(report.status, "passed", JSON.stringify(report.failures));
  assert.equal(report.warnings.filter(item => item.check.startsWith("streamed-not-found:")).length, 2);
  assert.ok(report.responses.filter(item => item.path.includes("__http-audit-missing-profile__")).every(item => item.status === 200));
});

test("recognizes Next server 404 templates without claiming client-rendered headings", async () => {
  const run = fixture({ override: url => url.pathname.includes("__http-audit-missing-profile__") ? response(streamedNotFoundHtml(url)) : undefined });
  const report = await run.run();
  assert.equal(report.status, "passed", JSON.stringify(report.failures));
  assert.equal(report.warnings.filter(item => item.check.includes("Next 404 template; client-rendered UI not verified")).length, 2);
});

test("recognizes an exact streamed React 404 instruction only for its existing template boundary", async () => {
  const url = new URL("/directory/__http-audit-missing-profile__", origin);
  const skeleton = streamedNotFoundHtml(url).replace('<template data-dgst="NEXT_HTTP_ERROR_FALLBACK;404"></template>', '<template id="B:1"></template>');
  const instruction = '$RX("B:1","NEXT_HTTP_ERROR_FALLBACK;404")';
  for (const script of [instruction, `$RX=function(b,c,d,e,f){/* synthetic function is never executed */};;${instruction}`]) {
    const run = fixture({ override: value => value.pathname === url.pathname ? response(`${skeleton}<script>${script}</script>`) : undefined });
    const report = await run.run();
    assert.equal(report.status, "passed", JSON.stringify(report.failures));
    assert.ok(report.warnings.some(item => item.check.includes("Next streamed 404 boundary instruction; client-rendered UI not verified")));
  }
  for (const script of [instruction.replace("B:1", "B:2"), instruction.replace(";404", ";403"),
    `self.__next_f.push([1,${JSON.stringify(instruction)}])`, `console.log(${JSON.stringify(instruction)})`]) {
    const run = fixture({ override: value => value.pathname === url.pathname ? response(`${skeleton}<script>${script}</script>`) : undefined });
    assert.ok(checks(await run.run()).includes("missing-profile-not-found-metadata"));
  }
});

test("still rejects noindex unavailable pages, text-only 404 digests, bad templates, or indexable missing pages", async () => {
  const url = new URL("/directory/__http-audit-missing-profile__", origin);
  const valid = streamedNotFoundHtml(url);
  for (const body of [
    documentHtml(url, { missing: true }).replace("Profile not found", "Profile unavailable"),
    valid.replace('<template data-dgst="NEXT_HTTP_ERROR_FALLBACK;404"></template>', "NEXT_HTTP_ERROR_FALLBACK;404"),
    valid.replace("NEXT_HTTP_ERROR_FALLBACK;404", "NEXT_HTTP_ERROR_FALLBACK;403"),
    valid.replace("noindex, nofollow", "index, follow"), valid.replace("noindex, nofollow", "noindex, index"),
    valid.replace("</head>", `<link rel="canonical" href="${canonicalOrigin}/directory/unavailable"></head>`)
  ]) {
    const run = fixture({ override: value => value.pathname === url.pathname ? response(body) : undefined });
    assert.ok(checks(await run.run()).includes("missing-profile-not-found-metadata"));
  }
});

test("does not accept a streamed 404 template for an actual linked profile", async () => {
  const run = fixture({ rootExtra: '<a href="/directory/missing">Missing fixture</a>', override: url => url.pathname === "/directory/missing"
    ? response(streamedNotFoundHtml(url)) : undefined });
  assert.ok(checks(await run.run()).includes("linked-profile-unavailable-or-missing"));
});

test("keeps malformed-profile HTTP 500 responses as genuine failures", async () => {
  const run = fixture({ override: url => url.pathname === "/directory/%E0%A4%A" ? response("Internal Server Error", "text/plain", 500) : undefined });
  const report = await run.run();
  assert.equal(report.status, "failed");
  assert.ok(report.failures.some(item => item.path === "/directory/%E0%A4%A" && item.check === "missing-profile-status"));
});

test("fails missing-profile success pages and reactivated retired GET endpoints", async () => {
  const run = fixture({ override: url => {
    if (url.pathname.includes("__http-audit-missing-profile__")) return response(documentHtml(url));
    if (url.pathname === "/api/messages") return response("{}", "application/json");
  } });
  const report = await run.run();
  assert.ok(checks(report).includes("missing-profile-not-found-metadata"));
  assert.ok(checks(report).includes("retired-endpoint-get-status"));
  assert.equal(report.warnings.some(item => item.check.startsWith("streamed-not-found:")), false);
});

test("requires the manifest link and both manifest icon sizes", async () => {
  const run = fixture({ override: url => {
    if (url.pathname === "/") return response(documentHtml(url).replace('<link rel="manifest" href="/manifest.webmanifest">', ""));
    if (url.pathname === "/manifest.webmanifest") return response(JSON.stringify({ id: "/", name: "Not Alone Summit", start_url: "/", display: "browser",
      icons: [{ src: "/icons/challenge-192.png", type: "image/png", sizes: "192x192" }] }), "application/json");
  } });
  const report = await run.run();
  assert.ok(checks(report).includes("manifest-link"));
  assert.ok(checks(report).includes("missing-required-icons"));
});

test("checks compatibility redirect headers as well as final page headers", async () => {
  const run = fixture({ override: url => {
    if (url.pathname !== "/summit") return;
    const result = response(null, "text/html", 307, { Location: "/" });
    result.headers.delete("x-frame-options");
    return result;
  } });
  const report = await run.run();
  assert.ok(checks(report).includes("header:frameDeny"));
  assert.equal(report.responses.find(item => item.path === "/summit").headersPassed, false);
});

test("fails a broken image, incorrect manifest dimensions, and mismatched crawler policy", async () => {
  const run = fixture({ rootExtra: '<img src="/images/missing.png" alt="">', override: url => {
    if (url.pathname === "/icons/challenge-192.png") return response(png(48), "image/png");
    if (url.pathname === "/robots.txt") return response("User-Agent: *\nAllow: /\n", "text/plain");
    if (url.pathname === "/sitemap.xml") return response(`<urlset><url><loc>${canonicalOrigin}/</loc></url></urlset>`, "application/xml");
  } });
  const report = await run.run();
  for (const check of ["local-image-or-asset-status-type", "manifest-icon-status-type-or-dimensions", "crawler-policy", "canonical-event-sitemap-policy"]) assert.ok(checks(report).includes(check));
});

test("rejects remote manifest icons without fetching them", async () => {
  const run = fixture({ override: url => url.pathname === "/manifest.webmanifest" ? response(JSON.stringify({ id: "/", name: "Not Alone Summit",
    start_url: "/", display: "browser", icons: [{ src: "https://external.example/icon.png", type: "image/png", sizes: "192x192" }] }), "application/json") : undefined });
  const report = await run.run();
  assert.ok(checks(report).includes("nonlocal-or-invalid-manifest-icon"));
  assert.equal(report.counts.icons, 0);
});

test("keeps status-only fallback explicit when the structured parser is absent", async () => {
  const run = fixture({ parser: null });
  const report = await run.run();
  assert.equal(report.status, "passed");
  assert.equal(report.coverage.parser, "unavailable");
  assert.ok(report.warnings.some(item => item.check.includes("structured parser unavailable")));
  assert.equal(report.counts.images, 0);
  assert.equal(report.counts.icons, 2);
});

test("bounds requests and response bodies, and sanitizes request errors", async () => {
  const limited = fixture({ maxRequests: 2 });
  const limitReport = await limited.run();
  assert.equal(limited.calls.length, 2);
  assert.ok(checks(limitReport).includes("request-budget-exhausted"));
  const secret = "fixture-error-secret";
  const run = fixture({ override: url => {
    if (url.pathname === "/2025") throw new Error(secret);
    if (url.pathname === "/robots.txt") return response("oversized", "text/plain", 200, { "Content-Length": "1048577" });
  } });
  const report = await run.run();
  assert.equal(report.status, "failed");
  assert.ok(checks(report).includes("request-failed-timeout-or-body-limit"));
  assert.equal(JSON.stringify(report).includes(secret), false);
});

test("reads only the PNG signature and dimensions without claiming full image decoding", () => {
  assert.equal(pngDimensions(png(192)), "192x192");
  assert.equal(pngDimensions(Buffer.from("not a PNG")), null);
});

test("CLI returns nonzero JSON for invalid origins without fetching or echoing secrets", async () => {
  const output = [];
  const originalLog = console.log;
  console.log = value => output.push(value);
  try {
    assert.equal(await main(["--origin", "http://user:fixture-secret@production.example:4317"]), 1);
    assert.equal(await main([]), 1);
  } finally { console.log = originalLog; }
  assert.equal(output.length, 2);
  assert.ok(output.every(value => JSON.parse(value).status === "failed" && !value.includes("fixture-secret")));
});
