import { readFile, readdir } from "node:fs/promises";
import { getSharp, optimizeImage } from "next/dist/server/image-optimizer";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import assets from "./site-image-assets.json";
import { getSiteImageMetadata, SiteImage, type SiteImageProps } from "./site-image";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";

vi.mock("next/navigation", () => ({ usePathname: () => "/", useSearchParams: () => new URLSearchParams() }));

const publicRoot = new URL("../public/", import.meta.url);

describe("local image inventory", () => {
  it("contains every public raster/vector image with measured dimensions and byte length", async () => {
    const files = (await readdir(publicRoot, { recursive: true }))
      .filter(file => /\.(png|jpe?g|webp|avif|gif|svg)$/i.test(file)).map(file => `/${file}`).sort();
    expect(Object.keys(assets).sort()).toEqual(files);
    // Use Next's installed Sharp, including the optimizer's EXIF orientation handling.
    const sharp = getSharp(undefined, undefined);
    for (const src of files) {
      const buffer = await readFile(new URL(`.${src}`, publicRoot));
      const actual = await sharp(buffer).metadata();
      expect(getSiteImageMetadata(src), src).toEqual({
        width: actual.autoOrient.width,
        height: actual.autoOrient.height,
        bytes: buffer.length
      });
      expect(actual.pages ?? 1, "Animated assets need explicit review before adding to the inventory").toBe(1);
    }
  });

  it.each([
    "https://example.test/image.png", "//example.test/image.png", "data:image/png;base64,test",
    "/api/image", "/images/missing.png", "/images/summit-logo.png?width=1",
    "/images/../images/summit-logo.png", "constructor", "__proto__"
  ])("rejects non-inventoried sources: %s", src => {
    expect(getSiteImageMetadata(src)).toBeUndefined();
    expect(() => SiteImage({ src, alt: "Image", sizes: "100px" })).toThrow("inventoried local asset");
  });
});

describe("SiteImage", () => {
  it("provides measured intrinsic dimensions and Next's responsive optimizer URLs", () => {
    const html = renderToStaticMarkup(<SiteImage src="/images/icf-logo.webp" alt="Inspiring Children Foundation" sizes="100px" />);
    expect(html).toContain('width="1500"');
    expect(html).toContain('height="1136"');
    expect(html).toContain('alt="Inspiring Children Foundation"');
    expect(html).toContain('loading="lazy"');
    expect(html).toContain('decoding="async"');
    expect(html).toContain('sizes="100px"');
    expect(html).toContain("srcSet=");
    expect(html).toContain("/_next/image?url=%2Fimages%2Ficf-logo.webp&amp;w=256&amp;q=75 256w");
    expect(html).not.toContain('src="/images/icf-logo.webp"');
  });

  it("preserves decorative alt text and explicitly requested loading, semantics, styles, and error handling", () => {
    const onError = vi.fn();
    const style = { width: "100%", height: "auto" };
    const image = SiteImage({ src: "/images/summit-logo.png", alt: "", sizes: "100px", loading: "eager", fetchPriority: "high", "aria-hidden": true, className: "existing-image", style, onError });
    expect(image.props).toMatchObject({ width: 1507, height: 1681, alt: "", loading: "eager", fetchPriority: "high", "aria-hidden": true, className: "existing-image", style, onError });
  });

  it("supports a deliberately sized fill container without conflicting width/height props", () => {
    const image = SiteImage({ src: "/images/wynn-las-vegas.webp", alt: "Wynn Las Vegas", sizes: "100vw", fill: true, style: { objectFit: "cover" } });
    expect(image.props.fill).toBe(true);
    expect(image.props.width).toBeUndefined();
    expect(image.props.height).toBeUndefined();
    expect(image.props.style).toEqual({ objectFit: "cover" });
  });

  it("lets Next handle preload without forcing a conflicting lazy loading value", () => {
    const image = SiteImage({ src: "/images/wynn-las-vegas.webp", alt: "Wynn Las Vegas", sizes: "100vw", preload: true });
    expect(image.props.preload).toBe(true);
    expect(image.props.loading).toBeUndefined();
  });

  it("requires explicit sizes and alt instead of guessing layout or accessible names", () => {
    expect(() => SiteImage({ src: "/images/icf-logo.webp", alt: "ICF", sizes: " " })).toThrow("requires sizes");
    // @ts-expect-error alt is intentionally required, even for decorative images.
    expect(() => SiteImage({ src: "/images/icf-logo.webp", sizes: "100px" })).toThrow("explicit alt text");
    // @ts-expect-error callers must declare the responsive CSS slot.
    expect(() => SiteImage({ src: "/images/icf-logo.webp", alt: "ICF" })).toThrow("requires sizes");
  });

  it("keeps dimensions and optimizer source controls out of the public API", () => {
    const valid = { src: "/images/icf-logo.webp", alt: "ICF", sizes: "100px" } satisfies SiteImageProps;
    // @ts-expect-error intrinsic dimensions come from the measured inventory.
    const dimensions: SiteImageProps = { ...valid, width: 100 };
    // @ts-expect-error external/custom loaders are not supported.
    const loader: SiteImageProps = { ...valid, loader: () => "https://example.test/image.png" };
    // @ts-expect-error the displayed source must stay local and inventoried.
    const override: SiteImageProps = { ...valid, overrideSrc: "https://example.test/image.png" };
    // @ts-expect-error priority is deprecated by the installed Next version.
    const priority: SiteImageProps = { ...valid, priority: true };
    expect([dimensions, loader, override, priority]).toHaveLength(4);
  });

  it("also rejects source/loader overrides passed indirectly through object spreads", () => {
    for (const overrides of [{ loader: () => "https://example.test/image.png" }, { overrideSrc: "https://example.test/image.png" }, { unoptimized: true }]) {
      const props = { src: "/images/icf-logo.webp", alt: "ICF", sizes: "100px", ...overrides };
      expect(() => SiteImage(props)).toThrow("built-in local image optimizer");
    }
  });

  it("keeps the shell header free of logos (owner, Sept 21) and the footer logo optimized", () => {
    const header = renderToStaticMarkup(<SiteHeader />);
    const footer = renderToStaticMarkup(<SiteFooter />);
    expect(header).not.toMatch(/<img/);
    expect(header).toContain('aria-label="Summit navigation"');
    expect(footer).toContain('width="1500" height="1136"');
    expect(footer).toContain('sizes="100px"');
  });


  it("keeps the eager, above-fold-on-short-pages footer logo below 16 KiB at 3x", async () => {
    const original = await readFile(new URL("./images/icf-logo.webp", publicRoot));
    const output = await optimizeImage({ buffer: original, width: 384, quality: 75, contentType: "image/webp" });
    expect(output.length).toBeLessThan(16 * 1024);
  });

  it.each(["/images/summit-logo.png", "/images/icf-logo.webp"])("substantially reduces %s bytes at the default 2x shell candidate", async src => {
    const original = await readFile(new URL(`.${src}`, publicRoot));
    const output = await optimizeImage({ buffer: original, width: 256, quality: 75, contentType: "image/webp" });
    expect(output.length).toBeLessThan(original.length * 0.1);
  });
});
