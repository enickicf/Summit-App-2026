import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { SiteHeader } from "./site-header";
const route = vi.hoisted(() => ({ pathname: "/community-day" }));
vi.mock("next/navigation", () => ({ usePathname: () => route.pathname, useSearchParams: () => new URLSearchParams() }));

const links = (html: string) => [...html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/g)].map(([, href, label]) => [label!.replace(/<[^>]+>/g, ""), href]);

describe("Community Day menu", () => {
  it("shows only Community Day, Concert (the Awards page) and Donate", () => {
    route.pathname = "/community-day";
    const html = renderToStaticMarkup(<SiteHeader />);
    expect(html.match(/<nav\b/g)).toHaveLength(1);
    expect(links(html)).toEqual([
      ["Community Day", "/community-day"],
      ["Concert", "https://notaloneawards.org/awards/2026"],
      ["Donate", "https://www.inspiringchildren.org/donate"]
    ]);
    for (const gone of ["Summit", "Schedule", "Directory", "Venue", "Awards<", "/venue"]) expect(html).not.toContain(gone);
  });

  it("leaves the Summit menu unchanged everywhere else", () => {
    route.pathname = "/";
    const html = renderToStaticMarkup(<SiteHeader />);
    for (const label of ["Summit", "Schedule", "Directory", "Venue", "Awards"]) expect(html).toContain(`>${label}</a>`);
    expect(html).not.toContain("Community Day");
  });
});
