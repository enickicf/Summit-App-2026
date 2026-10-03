import Image, { type ImageProps } from "next/image";
import assets from "./site-image-assets.json";

export type SiteImageSource = keyof typeof assets;
export type SiteImageMetadata = Readonly<{ width: number; height: number; bytes: number }>;

/** Returns verified, orientation-aware public-asset dimensions, or undefined for an unknown source. */
export function getSiteImageMetadata(src: string): SiteImageMetadata | undefined {
  return Object.hasOwn(assets, src) ? assets[src as SiteImageSource] : undefined;
}

export type SiteImageProps = Omit<ImageProps,
  "src" | "width" | "height" | "sizes" | "loader" | "overrideSrc" | "unoptimized" | "priority"
> & {
  src: string;
  sizes: string;
};

/**
 * Optimizes only inventoried local assets; never guesses dimensions or alt text.
 * Supply sizes for the rendered CSS slot. CSS still controls display dimensions;
 * use height: auto for an uncropped image, or fill within a positioned, sized parent.
 * Next defaults to lazy loading. Use loading="eager" for above-fold images.
 */
export function SiteImage({ src, sizes, alt, fill, ...props }: SiteImageProps) {
  const metadata = getSiteImageMetadata(src);
  if (!metadata) {
    // Development and tests fail loudly (site-image.test.tsx keeps the inventory complete). A live
    // visitor must never lose a whole page to one stale inventory entry, so production falls back
    // to a plain, unoptimized image for a safe local path.
    if (process.env.NODE_ENV === "production" && /^\/(?:images|original-2025|2026-headshots|classic)\/[\w./-]+$/.test(src) && !src.includes("..") && typeof alt === "string") {
      const { fill: _fill, priority: _priority, placeholder: _placeholder, blurDataURL: _blur, quality: _quality, fetchPriority, loading, ...rest } = props as SiteImageProps & { priority?: boolean; placeholder?: string; blurDataURL?: string; quality?: number };
      return <img {...(rest as object)} src={src} alt={alt} sizes={sizes} loading={loading ?? "lazy"} {...(fetchPriority ? { fetchPriority } : {})} decoding="async" />;
    }
    throw new Error(`SiteImage requires an inventoried local asset: ${src}`);
  }
  if ("loader" in props || "overrideSrc" in props || "unoptimized" in props) throw new Error("SiteImage only supports the built-in local image optimizer");
  if (!sizes?.trim()) throw new Error("SiteImage requires sizes matching its rendered CSS slot");
  if (typeof alt !== "string") throw new Error("SiteImage requires explicit alt text, including an empty string for decorative images");

  return <Image {...props} src={src} alt={alt} sizes={sizes}
    {...(fill ? { fill: true } : { width: metadata.width, height: metadata.height })} />;
}
