import { readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parseArgs } from "node:util";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const appDirectory = join(root, "apps/web/app");
const eventPaths = ["/", "/2025", "/awards/2025", "/awards/2026"];
const aliases = new Map([["/summit", "/"], ["/summit/2025", "/2025"], ["/summit/schedule", "/schedule"], ["/awards", "/awards/2026"]]);
const retiredEndpoints = ["/api/messages", "/api/tickets"];
const probes = ["/directory/2025-__http-audit-missing-profile__", "/directory/__http-audit-missing-profile__", "/directory/%E0%A4%A"];
const redirectStatuses = new Set([301, 302, 303, 307, 308]);
const defaultCanonicalOrigin = "https://not-alone-summit-web-rose.vercel.app";
const auditUserAgent = "NotAloneHttpAudit/1.0";

export function validateOptions(options) {
  let origin;
  let canonical;
  try {
    origin = new URL(options.origin);
    canonical = new URL(options.canonicalOrigin ?? defaultCanonicalOrigin);
  } catch { throw new Error("An explicit loopback origin and a valid canonical origin are required."); }
  if (origin.protocol !== "http:" || !["localhost", "127.0.0.1", "[::1]"].includes(origin.hostname)
      || !origin.port || origin.username || origin.password || origin.pathname !== "/" || origin.search || origin.hash
      || /[\s\\]/.test(options.origin)) throw new Error("Origin must be an explicit HTTP loopback origin with a port, without credentials or a path.");
  if (canonical.protocol !== "https:" || canonical.username || canonical.password || canonical.port
      || canonical.pathname !== "/" || canonical.search || canonical.hash) throw new Error("Canonical origin must be a bare HTTPS origin; it is never requested.");
  const indexing = options.indexing ?? "blocked";
  const maxRequests = Number(options.maxRequests ?? 400);
  const timeoutMs = Number(options.timeoutMs ?? 10000);
  if (!["blocked", "allowed"].includes(indexing) || !Number.isInteger(maxRequests) || maxRequests < 1 || maxRequests > 1000
      || !Number.isInteger(timeoutMs) || timeoutMs < 100 || timeoutMs > 30000) throw new Error("Invalid indexing policy or request limits.");
  return { origin: origin.origin, canonicalOrigin: canonical.origin, indexing, maxRequests, timeoutMs };
}

export function discoverPublicRoutes(directory = appDirectory) {
  const pages = new Set();
  const dynamic = new Set();
  function walk(folder, segments) {
    for (const entry of readdirSync(folder, { withFileTypes: true })) {
      if (entry.isDirectory() && !entry.name.startsWith("_") && !entry.name.startsWith("@") && entry.name !== "api") {
        walk(join(folder, entry.name), entry.name.startsWith("(") ? segments : [...segments, entry.name]);
      } else if (entry.isFile() && /^page\.(?:tsx|ts|jsx|js)$/.test(entry.name)) {
        const route = `/${segments.join("/")}`;
        (segments.some(segment => segment.includes("[")) ? dynamic : pages).add(route);
      }
    }
  }
  walk(directory, []);
  return { pages: [...pages].sort(), dynamic: [...dynamic].sort() };
}

export function loadHtmlParser() {
  try {
    return createRequire(join(root, "apps/web/package.json"))("next/dist/compiled/node-html-parser").parse;
  } catch { return null; }
}

const isAssetPath = path => !path.startsWith("/api/") && !path.startsWith("/directory/") && /\.(?:png|jpe?g|webp|avif|gif|svg|ico|pdf|woff2?)$/i.test(path);
const isProfilePath = path => /^\/directory\/[^/]+$/.test(path);

// Never forward arbitrary queries, credentials, external redirects, or a remote image-proxy target.
export function safeReference(value, base, options, pages) {
  let url;
  try { url = new URL(value, base); } catch { return { kind: "invalid" }; }
  if (!["http:", "https:"].includes(url.protocol)) return { kind: "ignored" };
  if (url.origin !== options.origin) return { kind: "external" };
  if (url.username || url.password || url.pathname.length > 300) return { kind: "invalid" };
  url.hash = "";
  if (url.pathname === "/_next/image") {
    const keys = [...url.searchParams.keys()].sort();
    let image;
    try { image = new URL(url.searchParams.get("url"), options.origin); } catch { return { kind: "invalid" }; }
    if (keys.join(",") !== "q,url,w" || image.origin !== options.origin || image.username || image.password || image.search || image.hash
        || !isAssetPath(image.pathname) || !/^\d+$/.test(url.searchParams.get("w") ?? "") || !/^\d+$/.test(url.searchParams.get("q") ?? "")
        || Number(url.searchParams.get("w")) < 1 || Number(url.searchParams.get("w")) > 8192
        || Number(url.searchParams.get("q")) < 1 || Number(url.searchParams.get("q")) > 100) return { kind: "invalid" };
    return { kind: "image", url };
  }
  if (url.search && !(isProfilePath(url.pathname) && url.searchParams.size === 1 && url.searchParams.get("from") === "awards")) return { kind: "invalid" };
  if (pages.has(url.pathname) || isProfilePath(url.pathname)) return { kind: "page", url };
  if (["/robots.txt", "/sitemap.xml", "/manifest.webmanifest"].includes(url.pathname)) return { kind: "metadata", url };
  if (isAssetPath(url.pathname)) return { kind: "image", url };
  return { kind: "invalid" };
}

async function readBounded(response, limit) {
  if (Number(response.headers.get("content-length")) > limit) {
    await response.body?.cancel();
    throw new Error("response-too-large");
  }
  const reader = response.body?.getReader();
  if (!reader) return Buffer.alloc(0);
  const chunks = [];
  let length = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.byteLength;
    if (length > limit) { await reader.cancel(); throw new Error("response-too-large"); }
    chunks.push(value);
  }
  return Buffer.concat(chunks, length);
}

export function pngDimensions(bytes) {
  if (bytes.length < 24 || !bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) || bytes.toString("ascii", 12, 16) !== "IHDR") return null;
  return `${bytes.readUInt32BE(16)}x${bytes.readUInt32BE(20)}`;
}

function nextNotFoundMarker(document) {
  if (document.querySelectorAll("template[data-dgst]").some(node => node.getAttribute("data-dgst") === "NEXT_HTTP_ERROR_FALLBACK;404")) return "Next 404 template";
  const scripts = document.querySelectorAll("script").map(node => node.textContent.trim());
  for (const template of document.querySelectorAll("template[id]")) {
    const id = template.getAttribute("id");
    if (!/^B:[\da-f]+$/.test(id)) continue;
    // React can stream the digest assignment after the boundary template. Match
    // its exact production instruction without executing scripts or decoding Flight.
    const instruction = `$RX(${JSON.stringify(id)},"NEXT_HTTP_ERROR_FALLBACK;404")`;
    if (scripts.some(script => script === instruction || (script.startsWith("$RX=function(") && script.endsWith(`;${instruction}`)))) return "Next streamed 404 boundary instruction";
  }
  return null;
}

export async function auditPublicSite(input, dependencies = {}) {
  const options = validateOptions(input);
  const inventory = dependencies.inventory ?? discoverPublicRoutes();
  const pages = new Set(inventory.pages);
  const fetchImpl = dependencies.fetchImpl ?? globalThis.fetch;
  const parseHtml = dependencies.parseHtml === undefined ? loadHtmlParser() : dependencies.parseHtml;
  const report = {
    status: "passed", origin: options.origin, canonicalOrigin: options.canonicalOrigin, indexing: options.indexing,
    coverage: { publicRoutes: inventory.pages.length, dynamicPatterns: inventory.dynamic, parser: parseHtml ? "next/node-html-parser" : "unavailable", userAgent: auditUserAgent,
      limitations: ["HTTP only: no JavaScript execution, layout, accessibility, interaction, or exhaustive browser verification.", "Full-response metadata is inspected, including streamed body metadata; other crawler user-agent representations are not covered.", "Next not-found template/boundary markers establish server intent, not successful client recovery or rendered not-found UI.", "External URLs, srcset variants, CSS background images and fragment targets are not requested or verified.", "PNG checks inspect signatures and declared dimensions, not full image decoding.", "The parent must isolate the server's upstream data sources; this client only contacts loopback."] },
    counts: { requests: 0, pages: 0, images: 0, icons: 0, externalReferencesSkipped: 0, failures: 0 },
    responses: [], failures: [], warnings: []
  };
  const recorded = new Set();
  const fail = (path, check) => {
    const key = `${path}:${check}`;
    if (recorded.has(key)) return;
    recorded.add(key);
    report.counts.failures += 1;
    if (report.failures.length < 60) report.failures.push({ path, check });
    report.status = "failed";
  };
  const warn = (path, check) => { if (report.warnings.length < 30) report.warnings.push({ path, check }); };
  if (!parseHtml) warn("/", "HTML metadata, references and sitemap entries skipped: structured parser unavailable");
  const cache = new Map();
  const imageReferences = new Map();
  const documentQueue = new Map(inventory.pages.map(path => [new URL(path, options.origin).href, path]));

  async function request(target, method = "GET", limit = 8 * 1024 * 1024) {
    const key = `${method}:${target.href}`;
    if (cache.has(key)) return cache.get(key);
    let url = new URL(target);
    let firstStatus;
    let redirectHeadersPassed = true;
    let metaRedirectFollowed = false;
    const seen = new Set();
    try {
      for (let hop = 0; hop < 6; hop++) {
        if (url.origin !== options.origin || url.username || url.password) { fail(target.pathname, "nonlocal-request-blocked"); return null; }
        if (seen.has(url.href)) { fail(target.pathname, "redirect-loop"); return null; }
        seen.add(url.href);
        if (report.counts.requests >= options.maxRequests) { fail("/", "request-budget-exhausted"); return null; }
        report.counts.requests += 1;
        const response = await fetchImpl(url.href, { method, redirect: "manual", credentials: "omit", signal: AbortSignal.timeout(options.timeoutMs),
          headers: { "User-Agent": auditUserAgent, Accept: method === "HEAD" ? "*/*" : "text/html,application/json,application/xml,text/plain,image/png;q=0.8" } });
        firstStatus ??= response.status;
        if (redirectStatuses.has(response.status)) {
          redirectHeadersPassed = inspectHeaders({ headers: response.headers }, url.pathname) && redirectHeadersPassed;
          const location = response.headers.get("location");
          await response.body?.cancel();
          const next = location ? safeReference(location, url, options, pages) : { kind: "invalid" };
          if (!["page", "metadata", "image"].includes(next.kind)) { fail(target.pathname, "unsafe-or-missing-redirect"); return null; }
          url = next.url;
          continue;
        }
        const bytes = method === "HEAD" ? (await response.body?.cancel(), Buffer.alloc(0)) : await readBounded(response, limit);
        if (method === "GET" && response.status === 200 && aliases.has(url.pathname) && parseHtml
            && (response.headers.get("content-type") ?? "").includes("text/html")) {
          const document = parseHtml(bytes.toString("utf8"));
          const refresh = document.querySelectorAll("meta[http-equiv]").filter(node => node.getAttribute("http-equiv").toLowerCase() === "refresh");
          if (refresh.length) {
            const destination = aliases.get(url.pathname);
            const robots = document.querySelectorAll('meta[name="robots"]').flatMap(node => (node.getAttribute("content") ?? "").toLowerCase().split(/[,\s]+/));
            // Next emits this marker when redirect() happens after streaming starts.
            const verified = refresh.length === 1 && refresh[0].getAttribute("id") === "__next-page-redirect"
              && [`0;url=${destination}`, `1;url=${destination}`].includes(refresh[0].getAttribute("content"))
              && robots.includes("noindex") && !robots.includes("index") && !url.search && !url.hash;
            if (!verified) { fail(target.pathname, "invalid-streamed-compatibility-redirect"); return null; }
            redirectHeadersPassed = inspectHeaders({ headers: response.headers }, url.pathname) && redirectHeadersPassed;
            metaRedirectFollowed = true;
            warn(url.pathname, "streamed-redirect: HTTP 200 with exact local Next redirect and noindex");
            url = new URL(destination, options.origin);
            continue;
          }
        }
        const result = { status: response.status, firstStatus, url, headers: response.headers, bytes, redirectHeadersPassed, metaRedirectFollowed };
        cache.set(key, result);
        return result;
      }
      fail(target.pathname, "too-many-redirects");
    } catch { fail(target.pathname, "request-failed-timeout-or-body-limit"); }
    cache.set(key, null);
    return null;
  }

  function inspectHeaders(result, path) {
    const csp = (result.headers.get("content-security-policy") ?? "").split(";").map(value => value.trim());
    const permissions = result.headers.get("permissions-policy") ?? "";
    const checks = {
      nosniff: result.headers.get("x-content-type-options") === "nosniff",
      frameDeny: result.headers.get("x-frame-options") === "DENY",
      referrerPolicy: result.headers.get("referrer-policy") === "strict-origin-when-cross-origin",
      contentSecurityPolicy: ["base-uri 'self'", "form-action 'self'", "frame-ancestors 'none'", "object-src 'none'"].every(value => csp.includes(value)),
      permissionsPolicy: ["camera=()", "microphone=()", "geolocation=()", "browsing-topics=()"].every(value => permissions.includes(value)),
      poweredByAbsent: !result.headers.has("x-powered-by")
    };
    for (const [name, passed] of Object.entries(checks)) if (!passed) fail(path, `header:${name}`);
    return Object.values(checks).every(Boolean);
  }

  function enqueue(value, base, source, image = false) {
    if (!value) return;
    const reference = safeReference(value, base, options, pages);
    if (reference.kind === "external") { report.counts.externalReferencesSkipped += 1; return; }
    if (reference.kind === "ignored") return;
    if (reference.kind === "invalid" || (image && reference.kind !== "image")) { fail(source, "unsafe-or-unknown-local-reference"); return; }
    if (reference.kind === "page") documentQueue.set(reference.url.href, reference.url.pathname);
    if (reference.kind === "image") imageReferences.set(reference.url.href, { url: reference.url, source, image });
  }

  function inspectDocument(result, path, missing = false) {
    if (!parseHtml) {
      if (missing && result.status === 200) warn(path, "streamed-404-body-not-verified-without-parser");
      return;
    }
    let document;
    try { document = parseHtml(result.bytes.toString("utf8")); } catch { fail(path, "html-parse-failed"); return; }
    const links = document.querySelectorAll("link");
    const canonical = links.filter(node => (node.getAttribute("rel") ?? "").toLowerCase().split(/\s+/).includes("canonical"));
    const robots = document.querySelectorAll('meta[name="robots"]').flatMap(node => (node.getAttribute("content") ?? "").toLowerCase().split(/[,\s]+/));
    const heading = document.querySelectorAll("h1").map(node => node.textContent.trim().toLowerCase());
    const nextNotFound = nextNotFoundMarker(document);
    if (missing) {
      const verified = (heading.some(value => ["profile not found", "page not found"].includes(value)) || nextNotFound)
        && robots.includes("noindex") && !robots.includes("index") && !canonical.length;
      if (!verified) fail(path, "missing-profile-not-found-metadata");
      if (verified && result.status === 200) warn(path, nextNotFound
        ? `streamed-not-found: HTTP 200 with noindex and ${nextNotFound}; client-rendered UI not verified`
        : "streamed-not-found: HTTP 200 with noindex and not-found heading");
      return;
    }
    const page = result.url.pathname;
    if (nextNotFound || heading.includes("profile not found") || heading.includes("guest details temporarily unavailable")) fail(path, "linked-profile-unavailable-or-missing");
    if (!document.querySelectorAll("title").some(node => node.textContent.trim())) fail(path, "missing-title");
    const expectedIndex = options.indexing === "allowed" && (eventPaths.includes(page) || isProfilePath(page));
    if (!robots.length || (expectedIndex ? !robots.includes("index") || robots.includes("noindex") : !robots.includes("noindex"))) fail(path, "robots-meta-policy");
    const requiredCanonical = eventPaths.includes(page) || isProfilePath(page);
    if (canonical.length !== (requiredCanonical ? 1 : 0)) fail(path, "canonical-count");
    if (canonical.length) {
      const expected = new URL(page, options.canonicalOrigin);
      if (page.startsWith("/directory/2025-") && result.url.searchParams.get("from") === "awards") expected.searchParams.set("from", "awards");
      let actual;
      try { actual = new URL(canonical[0].getAttribute("href")).href; } catch { /* Relative and malformed canonicals are invalid. */ }
      if (actual !== expected.href) fail(path, "canonical-origin-path-or-context");
    }
    if (document.querySelector("base")) fail(path, "unexpected-base-element");
    const manifests = links.filter(node => (node.getAttribute("rel") ?? "").toLowerCase().split(/\s+/).includes("manifest"));
    if (manifests.length !== 1 || manifests[0].getAttribute("href") !== "/manifest.webmanifest") fail(path, "manifest-link");
    for (const node of document.querySelectorAll("a[href]")) enqueue(node.getAttribute("href"), result.url, path);
    for (const node of document.querySelectorAll("img[src]")) enqueue(node.getAttribute("src"), result.url, path, true);
    for (const node of links) {
      const rel = (node.getAttribute("rel") ?? "").toLowerCase().split(/\s+/);
      if (rel.some(value => ["icon", "apple-touch-icon"].includes(value))) enqueue(node.getAttribute("href"), result.url, path, true);
    }
  }

  for (const [href, path] of documentQueue) {
    const result = await request(new URL(href));
    if (!result) continue;
    report.counts.pages += 1;
    if (result.status !== 200 || !(result.headers.get("content-type") ?? "").includes("text/html")) fail(path, "page-status-or-content-type");
    if (aliases.has(path) && (!(redirectStatuses.has(result.firstStatus) || result.metaRedirectFollowed) || result.url.pathname !== aliases.get(path))) fail(path, "compatibility-redirect");
    const headersPassed = inspectHeaders(result, path) && result.redirectHeadersPassed;
    if (pages.has(path)) report.responses.push({ path, status: result.firstStatus, finalStatus: result.status, headersPassed,
      ...(aliases.has(path) ? { redirect: result.metaRedirectFollowed ? "next-meta-refresh" : redirectStatuses.has(result.firstStatus) ? "http" : "missing" } : {}) });
    inspectDocument(result, path);
  }

  for (const path of retiredEndpoints) {
    const result = await request(new URL(path, options.origin));
    if (!result) continue;
    if (![404, 405, 410].includes(result.status) || result.firstStatus !== result.status) fail(path, "retired-endpoint-get-status");
    report.responses.push({ path, method: "GET", status: result.status, headersPassed: inspectHeaders(result, path) });
  }

  for (const path of probes) {
    const result = await request(new URL(path, options.origin));
    if (!result) continue;
    const malformed = path.endsWith("%E0%A4%A");
    if (![200, 404, ...(malformed ? [400] : [])].includes(result.status) || result.firstStatus !== result.status) fail(path, "missing-profile-status");
    if (!(malformed && result.status === 400)) inspectDocument(result, path, true);
    report.responses.push({ path, status: result.status });
  }

  const metadata = {};
  for (const [name, path, type] of [["robots", "/robots.txt", "text/plain"], ["sitemap", "/sitemap.xml", "xml"], ["manifest", "/manifest.webmanifest", "json"]]) {
    const result = await request(new URL(path, options.origin), "GET", 1024 * 1024);
    if (!result) continue;
    metadata[name] = result;
    const contentType = result.headers.get("content-type") ?? "";
    if (result.status !== 200 || !(contentType.includes(type) || (name === "manifest" && contentType.includes("manifest")))) fail(path, "metadata-status-or-content-type");
    report.responses.push({ path, status: result.status, headersPassed: inspectHeaders(result, path) });
  }
  if (metadata.robots) {
    const directives = metadata.robots.bytes.toString("utf8").split(/\r?\n/).map(line => line.split("#")[0].trim()).filter(Boolean).map(line => {
      const separator = line.indexOf(":");
      return [line.slice(0, separator).trim().toLowerCase(), line.slice(separator + 1).trim()];
    });
    const has = (key, value) => directives.some(([name, text]) => name === key && text === value);
    if (!has("user-agent", "*") || (options.indexing === "blocked" ? !has("disallow", "/") || has("allow", "/")
      : !has("allow", "/") || !has("disallow", "/api/") || has("disallow", "/") || !has("sitemap", `${options.canonicalOrigin}/sitemap.xml`))) fail("/robots.txt", "crawler-policy");
  }
  if (metadata.sitemap && parseHtml) {
    try {
      const sitemap = parseHtml(metadata.sitemap.bytes.toString("utf8"));
      const locations = sitemap.querySelectorAll("urlset > url > loc").map(node => node.textContent.trim()).sort();
      const expected = options.indexing === "allowed" ? eventPaths.map(path => new URL(path, options.canonicalOrigin).href).sort() : [];
      if (!sitemap.querySelector("urlset") || JSON.stringify(locations) !== JSON.stringify(expected)) fail("/sitemap.xml", "canonical-event-sitemap-policy");
    } catch { fail("/sitemap.xml", "sitemap-parse-failed"); }
  }
  if (metadata.manifest) {
    try {
      const manifest = JSON.parse(metadata.manifest.bytes.toString("utf8"));
      if (manifest.name !== "Not Alone Summit" || manifest.display !== "browser" || manifest.start_url !== "/" || manifest.id !== "/") fail("/manifest.webmanifest", "public-website-identity");
      if (!Array.isArray(manifest.icons) || !["192x192", "512x512"].every(size => manifest.icons.some(icon => icon?.sizes === size))) fail("/manifest.webmanifest", "missing-required-icons");
      for (const icon of Array.isArray(manifest.icons) ? manifest.icons : []) {
        const reference = safeReference(icon.src, options.origin, options, pages);
        if (reference.kind !== "image" || reference.url.pathname === "/_next/image" || icon.type !== "image/png") { fail("/manifest.webmanifest", "nonlocal-or-invalid-manifest-icon"); continue; }
        const image = await request(reference.url, "GET", 1024 * 1024);
        if (!image) continue;
        report.counts.icons += 1;
        const dimensions = pngDimensions(image.bytes);
        if (image.status !== 200 || !(image.headers.get("content-type") ?? "").includes("image/png") || !dimensions || dimensions !== icon.sizes) fail(reference.url.pathname, "manifest-icon-status-type-or-dimensions");
      }
    } catch { fail("/manifest.webmanifest", "invalid-manifest-json-or-icons"); }
  }
  for (const { url, source, image } of imageReferences.values()) {
    const result = await request(url, "HEAD");
    if (!result) continue;
    report.counts.images += 1;
    if (result.status !== 200 || (image && !(result.headers.get("content-type") ?? "").startsWith("image/"))) fail(source, "local-image-or-asset-status-type");
  }
  return report;
}

export async function main(argv = process.argv.slice(2)) {
  let report;
  try {
    const { values } = parseArgs({ args: argv, strict: true, options: {
      origin: { type: "string" }, "canonical-origin": { type: "string" }, indexing: { type: "string" },
      "max-requests": { type: "string" }, "timeout-ms": { type: "string" }
    } });
    report = await auditPublicSite({ origin: values.origin, canonicalOrigin: values["canonical-origin"], indexing: values.indexing,
      maxRequests: values["max-requests"], timeoutMs: values["timeout-ms"] });
  } catch {
    report = { status: "failed", failures: [{ check: "invalid-options-or-audit-initialization" }],
      usage: "node scripts/audit-public-site-http.mjs --origin http://127.0.0.1:PORT [--canonical-origin https://owner.example] [--indexing blocked|allowed]" };
  }
  console.log(JSON.stringify(report, null, 2));
  return report.status === "passed" ? 0 : 1;
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) process.exitCode = await main();
