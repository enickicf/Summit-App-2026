import type { MetadataRoute } from "next";
import { canonicalEventPaths, canonicalEventUrl, siteMetadataPolicy } from "../lib/site-metadata";

export default function sitemap(): MetadataRoute.Sitemap {
  const { indexingAllowed } = siteMetadataPolicy();
  if (!indexingAllowed) return [];
  // Only approved canonical event pages (Awards on their own domain); no aliases, profiles or live API state.
  return canonicalEventPaths.map(path => ({ url: canonicalEventUrl(path) }));
}
