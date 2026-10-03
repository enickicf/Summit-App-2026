// Outage hardening (Sept 23, 2026). Public page routes that Netlify may keep in its edge + durable cache
// (5 minutes fresh, then served stale for up to a day while revalidating in the background), so a Netlify
// origin/edge failure no longer blanks the site. Listed explicitly, never as a pattern: during the Sept 23
// incident, static-file requests fell through to the Next.js function and its 404s were cached by a
// catch-all rule. Not listed: /api/*, /staff*, /directory/* (?from=awards varies the header), /summit/live
// (minute-by-minute state), Next asset routes and every static file. A deploy clears the cache.
export const cachedPublicPaths = [
  "/2025",
  "/ask-ai",
  "/awards",
  "/awards/2025",
  "/awards/2026",
  "/community-day",
  "/contact",
  "/donate",
  "/inspiring-children-socials",
  "/map",
  "/partners",
  "/partners/2025",
  "/schedule",
  "/summit",
  "/summit/2025",
  "/summit/schedule",
  "/venue"
] as const;

export const publicPageCacheHeaders = [
  { key: "Netlify-CDN-Cache-Control", value: "public, durable, s-maxage=300, stale-while-revalidate=86400" }
];
