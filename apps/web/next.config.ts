import type { NextConfig } from "next";
import { publicSecurityHeaders } from "./lib/security-headers";
import { cachedPublicPaths, publicPageCacheHeaders } from "./lib/page-cache";

const nextConfig: NextConfig = {
  // Lets the classic and new site versions run side by side locally (separate build folders).
  ...(process.env.NEXT_DIST_DIR ? { distDir: process.env.NEXT_DIST_DIR } : {}),
  poweredByHeader: false,
  reactStrictMode: true,
  transpilePackages: ["@not-alone/config", "@not-alone/test-fixtures"],
  // Oct 9: the Tennis & High Tea form (the ICF designer's static page in public/tennis-high-tea) at a clean address.
  async rewrites() {
    return [{ source: "/tennis-high-tea", destination: "/tennis-high-tea/index.html" }];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: publicSecurityHeaders
      },
      // Outage hardening (Sept 23, 2026): Netlify's edge lost its route to origin functions for about an
      // hour ("Elevated CDN Errors") and every page view failed, because the pages were served
      // private/no-store and never cached at the edge. Public pages are now stored in Netlify's edge and
      // durable caches for 5 minutes and kept serving as stale for a day while they revalidate in the
      // background, so an origin failure no longer blanks the site. Browsers still get no-store (unchanged).
      // The rule names the page routes explicitly: during that incident, requests for static files fell
      // through to the Next.js function, whose 404s must never carry this header (a catch-all pattern let
      // the edge cache those 404s until the cache was purged). Not listed on purpose: /api/*, the staff
      // portal (cookie-specific), profile pages (their header depends on ?from=awards), /summit/live
      // (minute-by-minute state) and Next's own asset routes. A new deploy clears the cache.
      ...["/", ...cachedPublicPaths].map(source => ({ source, headers: publicPageCacheHeaders }))
    ];
  }
};

export default nextConfig;
