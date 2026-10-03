import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { awardsSiteUrl, canonicalEventPaths, canonicalEventUrl, eventMetadataContent, eventPageMetadata, existingOwnerSiteUrl, robotsForPage, siteMetadataPolicy, validatedSiteOrigin } from "./site-metadata";
import RootLayout, { metadata as rootMetadata } from "../app/layout";
import { metadata as summit2026 } from "../app/page";
import { metadata as summit2025 } from "../app/2025/page";
import { metadata as awards2025 } from "../app/awards/2025/page";
import { metadata as awards2026 } from "../app/awards/2026/page";
import robots from "../app/robots";
import sitemap from "../app/sitemap";

vi.mock("../components/site-header", () => ({ SiteHeader: () => <header>Header</header> }));
vi.mock("../components/site-footer", () => ({ SiteFooter: () => <footer>Footer</footer> }));
vi.mock("../components/analytics-provider", () => ({ AnalyticsProvider: () => <div data-analytics-provider="" /> }));
vi.mock("../components/ask-ai-widget", () => ({ AskAiWidget: () => null }));
// The GTM component renders through next/script, which emits nothing outside Next's runtime; a plain
// <script> stands in so the test can check the layout's gating and placement.
vi.mock("@next/third-parties/google", () => ({ GoogleTagManager: ({ gtmId }: { gtmId: string }) => <script src={`https://www.googletagmanager.com/gtm.js?id=${gtmId}`} /> }));

const production = { SITE_URL: existingOwnerSiteUrl, NODE_ENV: "production", VERCEL_ENV: "production" };
// Owner (Sept 22): with a configured owner origin, the Awards pages canonicalize to their own domain.
const expectedCanonical = (path: string) => path.startsWith("/awards/") ? `${awardsSiteUrl}${path}` : new URL(path, existingOwnerSiteUrl).toString();

afterEach(() => { vi.unstubAllEnvs(); });

describe("Owner site URL validation", () => {
  it("accepts an explicit HTTPS origin and normalizes a trailing slash", () => {
    expect(validatedSiteOrigin(existingOwnerSiteUrl)?.origin).toBe(existingOwnerSiteUrl);
    expect(validatedSiteOrigin(` ${existingOwnerSiteUrl}/ `)?.origin).toBe(existingOwnerSiteUrl);
    expect(validatedSiteOrigin("https://www.inspiringchildren.org")?.origin).toBe("https://www.inspiringchildren.org");
  });

  it.each([
    undefined, "", "   ", "not a URL", "https:example.com", "http://www.inspiringchildren.org",
    "javascript:alert(1)", "//www.inspiringchildren.org", "https://user:secret@www.inspiringchildren.org",
    "https://www.inspiringchildren.org/path", "https://www.inspiringchildren.org?preview=1",
    "https://www.inspiringchildren.org#test", "https://www.inspiringchildren.org:3001",
    "https://localhost", "https://preview.localhost", "https://preview.local", "https://127.0.0.1", "https://[::1]",
    "https://localhost.", "https://preview.localhost.", "https://preview.local.",
    "https://www.inspiringchildren.org\\path", "https://www.inspiring\nchildren.org"
  ])("rejects unsafe or non-origin SITE_URL values: %s", value => {
    expect(validatedSiteOrigin(value)).toBeNull();
    const policy = siteMetadataPolicy({ ...production, SITE_URL: value });
    expect(policy.origin.origin).toBe(existingOwnerSiteUrl);
    expect(policy.indexingAllowed).toBe(false);
  });

  it("uses only the configured owner origin, never an automatic preview host", () => {
    const environment = { ...production, SITE_URL: "https://www.inspiringchildren.org", VERCEL_URL: "unapproved-preview.vercel.app" };
    expect(siteMetadataPolicy(environment).origin.origin).toBe("https://www.inspiringchildren.org");
    expect(eventPageMetadata("/2025", environment).alternates?.canonical).toBe("https://www.inspiringchildren.org/2025");
  });
});

describe("Conservative indexing policy", () => {
  it("requires explicit production configuration and page approval", () => {
    expect(siteMetadataPolicy(production).indexingAllowed).toBe(true);
    expect(robotsForPage(true, production)).toEqual({ index: true, follow: true });
    expect(robotsForPage(false, production)).toEqual({ index: false, follow: true });
    expect(robotsForPage(undefined, production)).toEqual({ index: false, follow: true });
    expect(robotsForPage(true, { ...production, VERCEL_ENV: undefined })).toEqual({ index: true, follow: true });
  });

  it.each([
    { ...production, VERCEL_ENV: "preview" },
    { ...production, VERCEL_ENV: "development" },
    { ...production, NODE_ENV: "development" },
    { ...production, SITE_URL: undefined }
  ])("keeps preview, local and unconfigured deployments noindex: %j", environment => {
    expect(robotsForPage(true, environment)).toEqual({ index: false, follow: false });
    for (const path of canonicalEventPaths) expect(eventPageMetadata(path, environment).robots).toEqual({ index: false, follow: false });
  });

  it("does not let transient profile content inherit an index or homepage canonical", () => {
    expect(rootMetadata.robots).toMatchObject({ index: false });
    expect(rootMetadata.alternates).toBeUndefined();
    expect(robotsForPage(false, production)).toMatchObject({ index: false });
  });
});

describe("Year-specific event metadata", () => {
  it("gives each canonical page a distinct absolute title, description and share image", () => {
    expect(canonicalEventPaths).toEqual(["/", "/2025", "/awards/2025", "/awards/2026"]);
    const descriptions = new Set<string>();
    const images = new Set<string>();
    for (const path of canonicalEventPaths) {
      const metadata = eventPageMetadata(path, production);
      const content = eventMetadataContent[path];
      descriptions.add(content.description);
      images.add(content.image.path);
      expect(metadata.title).toEqual({ absolute: content.title });
      expect(metadata.alternates?.canonical).toBe(expectedCanonical(path));
      expect(metadata.openGraph).toMatchObject({
        title: content.title, description: content.description, url: expectedCanonical(path),
        images: [{ url: new URL(content.image.path, existingOwnerSiteUrl).toString(), alt: content.image.alt, width: content.image.width, height: content.image.height }]
      });
      expect(metadata.twitter).toMatchObject({ title: content.title, description: content.description, card: content.image.card });
      if (path.includes("2025")) {
        expect(content.title).toContain("2025 Archive");
        expect(content.description).not.toContain("2026");
      } else {
        expect(content.title).toContain("2026");
        expect(content.image.path).not.toContain("2025");
        expect(content.description).not.toMatch(/speaker|honoree|performer/i);
      }
    }
    expect(descriptions.size).toBe(4);
    expect(images.size).toBe(4);
  });

  it("canonicalizes the Awards pages to notaloneawards.org and everything else to the Summit origin", () => {
    const live = { SITE_URL: "https://notalonesummit.org", NODE_ENV: "production" };
    expect(canonicalEventUrl("/", live)).toBe("https://notalonesummit.org/");
    expect(canonicalEventUrl("/2025", live)).toBe("https://notalonesummit.org/2025");
    expect(canonicalEventUrl("/awards/2026", live)).toBe("https://notaloneawards.org/awards/2026");
    expect(canonicalEventUrl("/awards/2025", live)).toBe("https://notaloneawards.org/awards/2025");
    expect(eventPageMetadata("/awards/2026", live).alternates?.canonical).toBe("https://notaloneawards.org/awards/2026");
    expect(eventPageMetadata("/awards/2026", live).openGraph).toMatchObject({ url: "https://notaloneawards.org/awards/2026" });
    // Share images stay on the Summit origin (metadataBase), where they are served.
    expect(eventPageMetadata("/awards/2026", live).openGraph).toMatchObject({ images: [{ url: "https://notalonesummit.org/not-alone-awards-logo.png" }] });
    // Without a configured owner origin nothing moves to the Awards domain.
    for (const path of canonicalEventPaths) expect(canonicalEventUrl(path, { NODE_ENV: "production" })).toBe(new URL(path, existingOwnerSiteUrl).toString());
  });

  it("wires the four page metadata exports to their canonical routes", () => {
    for (const [path, metadata] of [["/", summit2026], ["/2025", summit2025], ["/awards/2025", awards2025], ["/awards/2026", awards2026]] as const) {
      expect(new URL(String(metadata.alternates?.canonical)).pathname).toBe(path);
      expect(metadata.title).toEqual({ absolute: eventMetadataContent[path].title });
    }
  });

  it("references existing known assets and keeps the 2025 Summit image source-shared", () => {
    const publicDirectory = resolve(import.meta.dirname, "../public");
    for (const content of Object.values(eventMetadataContent)) expect(existsSync(resolve(publicDirectory, content.image.path.slice(1)))).toBe(true);
    const source = JSON.parse(readFileSync(resolve(import.meta.dirname, "original-sites.json"), "utf8")) as { summit: { sections: { images: { src: string }[] }[] } };
    const assets = JSON.parse(readFileSync(resolve(import.meta.dirname, "original-assets.json"), "utf8")) as Record<string, string>;
    expect(eventMetadataContent["/2025"].image.path).toBe(assets[source.summit.sections[0]!.images[0]!.src]);
  });
});

describe("Robots and sitemap routes", () => {
  function setEnvironment(environment: typeof production) {
    for (const [key, value] of Object.entries(environment)) vi.stubEnv(key, value);
  }

  it("publishes only canonical event URLs, without aliases, profiles or invented timestamps", () => {
    setEnvironment(production);
    const entries = sitemap();
    expect(entries).toEqual(canonicalEventPaths.map(path => ({ url: expectedCanonical(path) })));
    expect(entries).toHaveLength(4);
    expect(JSON.stringify(entries)).not.toMatch(/directory|lastModified|priority|changeFrequency/);
    expect(robots()).toEqual({ rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/staff"] }, sitemap: `${existingOwnerSiteUrl}/sitemap.xml` });
  });

  it("does not advertise preview, local or invalid-site URLs to crawlers", () => {
    for (const environment of [{ ...production, VERCEL_ENV: "preview" }, { ...production, VERCEL_ENV: "" }, { ...production, SITE_URL: "invalid" }]) {
      setEnvironment(environment);
      expect(sitemap()).toEqual([]);
      expect(robots()).toEqual({ rules: { userAgent: "*", disallow: "/" } });
    }
  });

  it("supports independently hosted production without a Vercel environment", () => {
    setEnvironment(production);
    vi.stubEnv("VERCEL_ENV", undefined);
    expect(sitemap()).toHaveLength(4);
    expect(robots()).toEqual({ rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/staff"] }, sitemap: `${existingOwnerSiteUrl}/sitemap.xml` });
  });
});

describe("Root layout integration", () => {
  it("uses small correctly sized derivatives of the existing event icons", () => {
    const publicDirectory = resolve(import.meta.dirname, "../public");
    expect(rootMetadata.icons).toEqual({
      icon: [{ url: "/icons/challenge-48.png", sizes: "48x48", type: "image/png" }],
      apple: [{ url: "/icons/challenge-180.png", sizes: "180x180", type: "image/png" }]
    });
    for (const name of ["challenge", "awards"]) {
      for (const size of [48, 180]) {
        const image = readFileSync(resolve(publicDirectory, `icons/${name}-${size}.png`));
        expect(image.readUInt32BE(16)).toBe(size);
        expect(image.readUInt32BE(20)).toBe(size);
        expect(image.byteLength).toBeLessThan(size === 48 ? 10_000 : 50_000);
      }
    }
    for (const path of ["/awards/2025", "/awards/2026"] as const) {
      expect(eventPageMetadata(path, production).icons).toEqual({
        icon: [{ url: "/icons/awards-48.png", sizes: "48x48", type: "image/png" }],
        apple: [{ url: "/icons/awards-180.png", sizes: "180x180", type: "image/png" }]
      });
    }
  });

  it("places the shared skip link first without adding a duplicate main landmark", () => {
    const html = renderToStaticMarkup(<RootLayout><main id="main-content" tabIndex={-1}>Page content</main></RootLayout>);
    expect(html).toContain('<body><a href="#main-content" class="skipLink">Skip to main content</a><header>');
    expect(html.match(/<main\b/g)).toHaveLength(1);
    expect(html.match(/id="main-content"/g)).toHaveLength(1);
    expect(rootMetadata.appleWebApp).toBeUndefined();
    expect(rootMetadata.manifest).toBe("/manifest.webmanifest");
  });

  it("mounts website event tracking only where the server can store events", () => {
    const render = () => renderToStaticMarkup(<RootLayout><main id="main-content">Page content</main></RootLayout>);
    vi.stubEnv("SUPABASE_URL", "");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");
    expect(render()).not.toContain("data-analytics-provider");
    vi.stubEnv("SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "service-key");
    expect(render()).toContain("data-analytics-provider");
  });

  it("loads Google Tag Manager only where the public container ID is configured", () => {
    const render = () => renderToStaticMarkup(<RootLayout><main id="main-content">Page content</main></RootLayout>);
    vi.stubEnv("NEXT_PUBLIC_GTM_ID", "");
    expect(render()).not.toContain("googletagmanager");
    vi.stubEnv("NEXT_PUBLIC_GTM_ID", "GTM-TEST123");
    const html = render();
    expect(html).toContain("googletagmanager.com/gtm.js");
    expect(html).toContain("GTM-TEST123");
    expect(html.match(/googletagmanager/g)).toHaveLength(1);
  });
});
