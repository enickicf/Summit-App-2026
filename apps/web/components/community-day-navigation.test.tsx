import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { SiteHeader } from "./site-header";
import summit from "./summit-refresh.module.css";
const route = vi.hoisted(() => ({ pathname: "/community-day" }));
vi.mock("next/navigation", () => ({ usePathname: () => route.pathname, useSearchParams: () => new URLSearchParams() }));

const anchors = (html: string) => [...html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/g)];
const links = (html: string) => anchors(html).map(([, href, label]) => [label!.replace(/<[^>]+>/g, ""), href]);

describe("Nevada Mental Health Day menu", () => {
  it("shows NV Mental Health Day, Schedule (scrolls down this page), Tickets (this page's form, new tab), Awards and the Donate sticker (owner, Oct 7)", () => {
    route.pathname = "/community-day";
    const html = renderToStaticMarkup(<SiteHeader />);
    expect(html.match(/<nav\b/g)).toHaveLength(1);
    expect(links(html)).toEqual([
      ["NV Mental Health Day", "/community-day"],
      ["Schedule", "#schedule"],
      ["Tickets", "https://notaloneawards.org/rsvp/nevada-mental-health-day"],
      ["Awards", "https://notaloneawards.org/awards/2026"],
      ["Donate", "https://www.inspiringchildren.org/donate"]
    ]);
    const [page, , tickets, awards] = anchors(html).map(match => match[0]);
    expect(page).toContain('aria-current="page"');
    expect(tickets).toMatch(/target="_blank"[^>]*rel="noopener"/);
    expect(awards).not.toContain("target=");
    for (const gone of ["Summit<", "/schedule\"", "Directory", "Venue", "/venue", "Concert", ">Community Day<"]) expect(html).not.toContain(gone);
  });

  it("renders Donate as the ICF-style sticker (blue pill with the heart) shared with the Summit menu, last in the row", () => {
    route.pathname = "/community-day";
    const html = renderToStaticMarkup(<SiteHeader />);
    const donate = anchors(html).at(-1)!;
    expect(donate[1]).toBe("https://www.inspiringchildren.org/donate");
    expect(donate[0]).toContain(`class="${summit.donateButton} `);
    expect(donate[0]).toMatch(/<svg\b[^>]*aria-hidden="true"/);
    expect(donate[2]!.replace(/<[^>]+>/g, "")).toBe("Donate");
  });

  it("keeps a private partner copy's menu inside that copy: its own page, its own form and its Awards page", () => {
    route.pathname = "/nami/community-day";
    const html = renderToStaticMarkup(<SiteHeader />);
    expect(links(html)).toEqual([
      ["NV Mental Health Day", "/nami/community-day"],
      ["Schedule", "#schedule"],
      ["Tickets", "https://notaloneawards.org/rsvp/nami-9wvfjfkt40dd"],
      ["Awards", "/nami"],
      ["Donate", "https://www.inspiringchildren.org/donate"]
    ]);
    expect(html).not.toContain("notaloneawards.org/awards/2026");
    expect(html).not.toContain("/rsvp/nevada-mental-health-day");
  });

  it("leaves the Summit menu unchanged everywhere else", () => {
    route.pathname = "/";
    const html = renderToStaticMarkup(<SiteHeader />);
    for (const label of ["Summit", "Schedule", "Directory", "Venue", "Awards"]) expect(html).toContain(`>${label}</a>`);
    expect(html).not.toContain("Community Day");
    expect(html).not.toContain("Mental Health Day");
  });
});
