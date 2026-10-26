import { isIP } from "node:net";
import type { Metadata } from "next";

// Existing owner deployment from app/layout.tsx and apps/web/.env.example.
export const existingOwnerSiteUrl = "https://not-alone-summit-web-rose.vercel.app";

type MetadataEnvironment = {
  SITE_URL?: string | undefined;
  NODE_ENV?: string | undefined;
  VERCEL_ENV?: string | undefined;
};

export function validatedSiteOrigin(value: string | undefined): URL | null {
  if (!value) return null;
  const candidate = value.trim();
  if (!/^https:\/\//i.test(candidate) || /[\s\\]/.test(candidate)) return null;
  try {
    const url = new URL(candidate);
    if (url.protocol !== "https:" || url.username || url.password || url.port || url.pathname !== "/" || url.search || url.hash) return null;
    const hostname = url.hostname.replace(/\.$/, "");
    if (!hostname.includes(".") || isIP(hostname) || hostname.endsWith(".localhost") || hostname.endsWith(".local")) return null;
    return new URL(url.origin);
  } catch {
    return null;
  }
}

/**
 * Indexing is opt-in: valid explicit SITE_URL + production build + a page's
 * approval. VERCEL_ENV must be absent (independent hosting) or production.
 * Preview/development/misconfigured builds get
 * noindex metadata, blocked crawling and an empty sitemap. The established owner
 * origin remains the fallback for share URLs, never a request host/preview URL.
 * Root metadata stays noindex so transient profile fallbacks cannot inherit an
 * index directive. A profile must opt in only after resolving published content.
 * These crawler directives are not access control or an indexing guarantee.
 */
// Owner (Sept 22, 2026): the Awards pages live on their own owned domain. Once the owner origin is
// configured (production hosting), /awards/* canonicalizes there; every other page stays on SITE_URL.
export const awardsSiteUrl = "https://notaloneawards.org";

export function siteMetadataPolicy(environment: MetadataEnvironment = process.env) {
  const configuredOrigin = validatedSiteOrigin(environment.SITE_URL);
  return {
    origin: configuredOrigin ?? new URL(existingOwnerSiteUrl),
    awardsOrigin: configuredOrigin ? new URL(awardsSiteUrl) : new URL(existingOwnerSiteUrl),
    // Oct 3, 2026: private review builds (NEXT_PUBLIC_REVIEW_BUILD=1, set only when building a review link) are never indexed.
    indexingAllowed: configuredOrigin !== null && environment.NODE_ENV === "production" && (environment.VERCEL_ENV === undefined || environment.VERCEL_ENV === "production") && process.env.NEXT_PUBLIC_REVIEW_BUILD !== "1"
  };
}

export function robotsForPage(indexable = false, environment: MetadataEnvironment = process.env): Metadata["robots"] {
  const { indexingAllowed } = siteMetadataPolicy(environment);
  return { index: indexable && indexingAllowed, follow: indexingAllowed };
}

export const eventMetadataContent = {
  "/": {
    title: "Not Alone Summit 2026",
    description: "The 2026 Not Alone Summit from Inspiring Children Foundation. Published event information and confirmed Summit guest updates.",
    image: { path: "/images/social-summit-group-2026.jpg", width: 1200, height: 630, alt: "Guests gathering at the Not Alone Summit", card: "summary_large_image" }
  },
  "/2025": {
    title: "Not Alone Summit 2025 Archive",
    description: "Explore the 2025 Not Alone Summit archive, preserving the original event's people, mission, and production credits.",
    image: { path: "/original-2025/ad7f2645ecf2430dbed0.jpg", width: 2500, height: 1112, alt: "Original Not Alone Summit artwork from the 2025 archive", card: "summary_large_image" }
  },
  "/awards/2025": {
    title: "Not Alone Awards 2025 Archive",
    description: "The 2025 Not Alone Awards archive, with the original award categories, people, and production credits.",
    image: { path: "/images/awards-2025-highlights.jpg", width: 1280, height: 720, alt: "2025 Not Alone Awards highlights", card: "summary_large_image" }
  },
  "/awards/2026": {
    title: "Not Alone Awards 2026",
    description: "Published information for the 2026 Not Alone Awards from Inspiring Children Foundation. Awards appearances and honors are announced separately.",
    image: { path: "/images/hero-awards-start.jpg", width: 1920, height: 1080, alt: "Jewel performing at the Not Alone Awards", card: "summary_large_image" }
  }

} as const;

export type CanonicalEventPath = keyof typeof eventMetadataContent;
export const canonicalEventPaths = Object.keys(eventMetadataContent) as CanonicalEventPath[];

export function canonicalEventUrl(path: CanonicalEventPath, environment: MetadataEnvironment = process.env): string {
  const { origin, awardsOrigin } = siteMetadataPolicy(environment);
  return new URL(path, path.startsWith("/awards/") ? awardsOrigin : origin).toString();
}

export function eventPageMetadata(path: CanonicalEventPath, environment: MetadataEnvironment = process.env): Metadata {
  const { origin } = siteMetadataPolicy(environment);
  const { title, description, image } = eventMetadataContent[path];
  const url = canonicalEventUrl(path, environment);
  const imageUrl = new URL(image.path, origin).toString();
  return {
    title: { absolute: title },
    description,
    ...(path.startsWith("/awards/") ? {
      icons: {
        icon: [{ url: "/icons/awards-48.png", sizes: "48x48", type: "image/png" }],
        apple: [{ url: "/icons/awards-180.png", sizes: "180x180", type: "image/png" }]
      }
    } : {}),
    alternates: { canonical: url },
    robots: robotsForPage(true, environment),
    openGraph: {
      type: "website",
      siteName: "Not Alone Summit and Awards",
      title,
      description,
      url,
      images: [{ url: imageUrl, width: image.width, height: image.height, alt: image.alt }]
    },
    twitter: {
      card: image.card,
      title,
      description,
      images: [{ url: imageUrl, alt: image.alt }]
    }
  };
}
