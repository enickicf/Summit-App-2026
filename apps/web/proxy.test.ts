import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "./proxy";
import nextConfig from "./next.config";
import { publicSecurityHeaders } from "./lib/security-headers";

describe("public route boundary", () => {
  it.each(["%E0%A4%A", "%FF", "%", "%C0%AF"])("rejects malformed profile encoding %s without reflecting input", async slug => {
    const response = proxy(new NextRequest(`https://example.test/directory/${slug}`));
    expect(response.status).toBe(400);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(response.headers.get("X-Robots-Tag")).toContain("noindex");
    for (const { key, value } of publicSecurityHeaders) expect(response.headers.get(key)).toBe(value);
    expect(await response.text()).not.toContain(slug);
  });
  it.each(["2025-mike-tyson", "20260000-0000-4000-8003-000000000053", "Jos%C3%A9", "%25"])("leaves valid encoded addresses for normal profile resolution: %s", slug => {
    expect(proxy(new NextRequest(`https://example.test/directory/${slug}`)).headers.get("x-middleware-next")).toBe("1");
  });
  it.each([
    ["/summit", "/"], ["/summit/2025", "/2025"], ["/summit/schedule", "/schedule"], ["/awards", "/awards/2026"]
  ])("redirects %s before page streaming without accepting a user-selected destination", (path, destination) => {
    const response = proxy(new NextRequest(`https://example.test${path}?next=https://other.test`));
    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe(`https://example.test${destination}?next=https://other.test`);
    for (const { key, value } of publicSecurityHeaders) expect(response.headers.get(key)).toBe(value);
  });
  it("uses the same hardening headers for page responses and early responses", async () => {
    const rules = await nextConfig.headers!();
    expect(rules[0]).toEqual({ source: "/:path*", headers: publicSecurityHeaders });
  });

  it("caches public pages at Netlify's edge and durable cache, but never the API, staff portal, profile pages or a function 404 (outage hardening, Sept 23)", async () => {
    const rules = await nextConfig.headers!();
    const cached = rules.filter(rule => rule.headers.some(header => header.key === "Netlify-CDN-Cache-Control"));
    expect(cached.length).toBeGreaterThan(5);
    for (const rule of cached) expect(rule.headers).toEqual([{ key: "Netlify-CDN-Cache-Control", value: "public, durable, s-maxage=300, stale-while-revalidate=86400" }]);
    const sources = cached.map(rule => rule.source);
    // Every listed source is a literal page route (no patterns), so a request the Next.js function answers
    // with 404 (e.g. a static file the CDN failed to serve during an incident) never gets the header.
    for (const source of sources) expect(source).toMatch(/^\/[a-z0-9\-/]*$/);
    for (const path of ["/", "/2025", "/awards/2026", "/awards/2025", "/schedule", "/partners", "/partners/2025", "/venue", "/contact", "/ask-ai", "/map", "/donate"]) expect(sources).toContain(path);
    for (const path of ["/api/rsvp", "/api/staff/login", "/staff", "/staff/login", "/directory/jewel", "/summit/live", "/_next/static/x.css", "/_next/image", "/images/summit-logo.png", "/icons/challenge-48.png"]) expect(sources).not.toContain(path);
  });
});
