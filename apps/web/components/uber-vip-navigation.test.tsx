import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { SiteHeader } from "./site-header";
import { CommunityDayView } from "../app/community-day/community-day-view";
import { OriginalAwardsPage } from "./original-event-page";
import { partnerSiteByKey } from "../lib/awards-partner-sites";
const route = vi.hoisted(() => ({ pathname: "/vip" }));
vi.mock("next/navigation", () => ({ usePathname: () => route.pathname, useSearchParams: () => new URLSearchParams() }));
vi.mock("../lib/snapshot", () => ({ getSiteSnapshot: vi.fn().mockResolvedValue(null) }));
const vip = partnerSiteByKey("vip-legacy")!;
const links = (html: string) => [...html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/g)].map(([, href, label]) => [label!.replace(/<[^>]+>/g, ""), href]);

describe("general Uber VIP invitation websites", () => {
  it("keeps Awards and Day navigation within the invitation and uses the combined VIP RSVP", () => {
    for (const pathname of ["/vip", "/vip/community-day"]) {
      route.pathname = pathname;
      const items = links(renderToStaticMarkup(<SiteHeader />));
      expect(items).toContainEqual(["Tickets", vip.rsvpUrl]);
      expect(items).toContainEqual(["NV Mental Health Day", "/vip/community-day"]);
      expect(items).toContainEqual(["Awards", "/vip"]);
      expect(items.some(([label]) => label === "Closing dinner")).toBe(false);
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

describe("one-link VIP and Uber VIP websites",()=>{
  for(const key of ["vip-invitation","ubervip-site"]){
    const site=partnerSiteByKey(key)!;
    it(`${key} keeps every event RSVP and menu in the correct tier`,async()=>{
      for(const pathname of [site.path,site.path+"/community-day"]){
        route.pathname=pathname;
        const menu=links(renderToStaticMarkup(<SiteHeader/>));
        expect(menu).toContainEqual(["Tickets",site.rsvpUrl]);
        expect(menu).toContainEqual(["Awards",site.path]);
        expect(menu).toContainEqual(["NV Mental Health Day",site.path+"/community-day"]);
        expect(menu.some(([label])=>label==="Closing dinner")).toBe(false);
      }
      const day=renderToStaticMarkup(await CommunityDayView({partner:site}));
      const awards=renderToStaticMarkup(<OriginalAwardsPage year={2026} snapshot={null} rsvpUrl={site.rsvpUrl} invitationTier={site.invitationTier}/>);
      for(const html of [day,awards]){
        expect(html).toContain(`data-invitation-tier="${site.invitationTier}"`);
        const ticketLinks=links(html).filter(([,href])=>href?.includes('/rsvp')&&!href?.includes('/nominate'));
        expect(ticketLinks.length).toBeGreaterThan(0);
        expect(ticketLinks.every(([,href])=>href===site.rsvpUrl)).toBe(true);
      }
    });
  }
  it("corrects /vip to the regular VIP destination",()=>{
    expect(vip.path).toBe('/vip');expect(vip.rsvpUrl).toBe('https://notaloneawards.org/rsvp/vip');
  });
});
