import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { SiteHeader } from "./site-header";
import { CommunityDayView } from "../app/community-day/community-day-view";
import { OriginalAwardsPage } from "./original-event-page";
import { partnerSiteByKey } from "../lib/awards-partner-sites";
const route = vi.hoisted(() => ({ pathname: "/vip" }));
vi.mock("next/navigation", () => ({ usePathname: () => route.pathname, useSearchParams: () => new URLSearchParams() }));
vi.mock("../lib/snapshot", () => ({ getSiteSnapshot: vi.fn().mockResolvedValue(null) }));
const vip = partnerSiteByKey("uber-vip")!;
const links = (html: string) => [...html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/g)].map(([, href, label]) => [label!.replace(/<[^>]+>/g, ""), href]);

describe("general Uber VIP invitation websites", () => {
  it("keeps Awards and Day navigation within the invitation and uses the combined VIP RSVP", () => {
    for (const pathname of ["/vip", "/vip/community-day"]) {
      route.pathname = pathname;
      const items = links(renderToStaticMarkup(<SiteHeader />));
      expect(items).toContainEqual(["Tickets", vip.rsvpUrl]);
      expect(items).toContainEqual(["NV Mental Health Day", "/vip/community-day"]);
      expect(items).toContainEqual(["Awards", "/vip"]);
      expect(items).toContainEqual(["Closing dinner", vip.closingDinnerUrl]);
      expect(items.some(([, href]) => href === "https://notaloneawards.org/rsvp")).toBe(false);
      expect(items.some(([, href]) => href?.endsWith("/rsvp/nevada-mental-health-day"))).toBe(false);
    }
  });
  it("routes all Day calls to action and Awards RSVP to the same form", async () => {
    const day = renderToStaticMarkup(await CommunityDayView({ partner: vip }));
    const awards = renderToStaticMarkup(<OriginalAwardsPage year={2026} snapshot={null} rsvpUrl={vip.rsvpUrl} />);
    expect(links(day)).toContainEqual(["Request free tickets", vip.rsvpUrl]);
    expect(links(day)).toContainEqual(["Open the RSVP form", vip.rsvpUrl]);
    expect(links(awards)).toContainEqual(["RSVP", vip.rsvpUrl]);
    expect(day).toContain('href="/vip"');
  });
  it("keeps ordinary invitation pages on their regular forms", () => {
    route.pathname = "/awards/2026";
    const awards = links(renderToStaticMarkup(<SiteHeader />));
    expect(awards).toContainEqual(["Tickets", "https://notaloneawards.org/rsvp"]);
    expect(awards.some(([label]) => label === "Closing dinner")).toBe(false);
    route.pathname = "/community-day";
    expect(links(renderToStaticMarkup(<SiteHeader />))).toContainEqual(["Tickets", "https://notaloneawards.org/rsvp/nevada-mental-health-day"]);
  });
});
