import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { SiteHeader } from "./site-header";
const route = vi.hoisted(() => ({ pathname: "/", from: "" }));
vi.mock("next/navigation", () => ({ usePathname: () => route.pathname, useSearchParams: () => new URLSearchParams(route.from) }));

describe("single persistent navigation", () => {
  it.each(["/", "/2025", "/schedule", "/map", "/contact"])("has no hidden menu or duplicate navigation on %s", pathname => {
    route.pathname = pathname; route.from = "";
    const html = renderToStaticMarkup(<SiteHeader />);
    expect(html.match(/<nav\b/g)).toHaveLength(1);
    // Owner (Sept 21): no logo bar; the menu is the only link row.
    // Owner (Sept 22): "2026" carries a hover list (2026 Summit / 2025 Summit), so 9 links.
    // Owner (Sept 23): Summit (2 entries) + Schedule + Directory (3 entries) + Venue + Awards + Donate sticker = 11 links.
    expect(html.match(/<a\b/g)).toHaveLength(11);
    expect(html.match(/<nav\b[\s\S]*<\/nav>/)?.[0].match(/<a\b/g)).toHaveLength(11);
    expect(html).not.toMatch(/<button|aria-expanded|aria-controls|challengeBar/);
  });
  it("preserves the approved Awards navigation for profiles as well as pages", () => {
    for (const pathname of ["/awards/2026", "/directory/current-person"]) {
      route.pathname = pathname; route.from = "from=awards";
      const html = renderToStaticMarkup(<SiteHeader />);
      expect(html).toContain('aria-label="Awards navigation"');
      expect(html).not.toContain("NotAloneAwards_Logo_White.png");
      expect(html.match(/<nav\b/g)).toHaveLength(1);
      expect(html).not.toContain("Summit navigation");
    }
  });
});
