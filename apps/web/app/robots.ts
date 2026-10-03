import type { MetadataRoute } from "next";
import { siteMetadataPolicy } from "../lib/site-metadata";

export default function robots(): MetadataRoute.Robots {
  const { origin, indexingAllowed } = siteMetadataPolicy();
  if (!indexingAllowed) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/staff"] },
    sitemap: new URL("/sitemap.xml", origin).toString()
  };
}
