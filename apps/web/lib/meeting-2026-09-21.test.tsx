import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { event2026Snapshot } from "@not-alone/test-fixtures/event-2026";
import { publishedAwardsProgram } from "@not-alone/domain";
import { OriginalAwardsPage, OriginalSummitPage } from "../components/original-event-page";
import { awards2026Program } from "./awards-editorial";
import { withAirtable } from "./airtable-overlay";

// Sept 22 meeting: ranks and tiers come from Airtable, so the pages render with the overlay applied.
const live = await withAirtable(event2026Snapshot);

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }), usePathname: () => "/", useSearchParams: () => new URLSearchParams() }));

const escape = (text: string) => text.replaceAll("&", "&amp;").replaceAll("'", "&#x27;").replaceAll("\"", "&quot;");
const order = (html: string, markers: string[]) => markers.map(marker => {
  const index = html.indexOf(marker);
  expect(index, marker).toBeGreaterThan(-1);
  return index;
});

// NAS web meeting debrief, September 21, 2026.
describe("Sept 21 meeting website direction", () => {
  const awards = renderToStaticMarkup(<OriginalAwardsPage year={2026} snapshot={live} program={publishedAwardsProgram(live)} />);
  const summit = renderToStaticMarkup(<OriginalSummitPage year={2026} snapshot={live} />);

  it("orders the Awards page: logo, broadcast, lineup, founders, mission, winners, Challenge, no-solicitation", () => {
    // Owner (Sept 21): last year's full mission statement stays at the top until it is replaced.
    // Owner (Oct 4): the lineup comes right after the hero and the iHeartRadio band; the mission follows it.
    // Owner (Oct 7 meeting): the mission opens "Inspiring Children Foundation × NAMI present the Not Alone Awards Show".
    const positions = order(awards, ['id="awards-program"', 'id="broadcast"', 'aria-label="Lineup"', 'aria-label="Founders"', 'id="mission"', "Inspiring Children Foundation × NAMI present the Not Alone Awards Show", 'id="winners"', 'id="not-alone-challenge"', 'id="no-solicitation"']);
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);
    // Owner (Sept 21): broadcast line removed; RSVP button reads just "RSVP"; venue sits with the date.
    expect(awards).not.toContain(escape(awards2026Program.broadcast));
    expect(awards.indexOf("Monday, November 2, 2026")).toBeLessThan(awards.indexOf("Encore Theater at Wynn Las Vegas"));
    // Owner (Sept 21, late): 2025 awards with descriptions instead of the 2026 category list.
    expect(awards).not.toContain('id="award-categories"');
    expect(awards).toContain("<h3>No Quit Award</h3>");
    expect(awards).toContain("Recognizing resilience and perseverance.");
    expect(awards).toContain(`href="${awards2026Program.challengeUrl}"`);
    expect(awards).toContain(`href="${awards2026Program.toolkitUrl}"`);
    expect(awards).toContain(escape(awards2026Program.noSolicitation.body));
  });

  it("keeps the approved Awards host, co-chairs, producers and RSVP", () => {
    for (const marker of ['id="awards-host"', "Co-Chairs", "Producers", ">RSVP</a>", "Cherrial Odell"]) expect(awards).toContain(marker);
  });

  it("lists newly confirmed talent; founders, business leaders and philanthropists share Founders (owner, Sept 21)", () => {
    for (const name of ["Bishop Briggs", "Silas Luke Jones"]) expect(awards).toContain(name);
    // Sept 22 meeting: Airtable is the source of truth for founders; Pam & Duncan are not in Airtable, so not listed.
    expect(awards).not.toContain("Pam &amp; Duncan Goldie-Morrison");
    // Owner (Sept 22, after launch): Wendy and Rahil are off the Awards page; Daniel Gillison is a founder there, not lineup.
    for (const name of ["Rahil Briggs", "Wendy Oliver-Pyatt"]) expect(awards).not.toContain(name);
    expect(awards).toContain("Daniel Gillison");
    expect(awards).not.toMatch(/<h2>(Business Leaders|Philanthropists)<\/h2>/);
    // Sept 22 meeting: Airtable's grouping decides. Cathy Olson is D talent (both lineups); Nick Dana is an
    // attendee (Summit Attendees section only); Bianca (associate producer) and Harvey (no grouping) are not cards.
    expect(awards).toContain("Cathy Olson");
    expect(awards).not.toContain("Nick Dana");
    expect(summit).toContain("Nick Dana");
    // Bianca (Associate Producer in Airtable) is a name in the producer credits only, never a people card.
    expect(summit.split('id="producers"')[0]).not.toContain("Bianca Mok");
    expect(awards.split('id="producers"')[0]).not.toContain("Bianca Mok");
    expect(summit).toContain("<h3>Bianca Mok</h3>");
    for (const name of ["Harvey Stern"]) {
      expect(awards).not.toContain(name);
      expect(summit).not.toContain(name);
    }
  });

  it("puts the no-solicitation notice near the top, guests, co-chairs above producers, then the schedule and program block near the bottom (owner, Sept 21 late)", () => {
    const positions = order(summit, ['id="about"', 'id="no-solicitation"', 'id="directory"', 'id="schedule"', 'id="leadership"', 'id="producers"', 'id="not-alone-program"', 'id="rsvp"']);
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);
    // Owner (Sept 21): the Featuring list and Cohen logo are removed from the home page.
    expect(summit).not.toContain(">Featuring<");
    // Owner (Sept 23 / Oct 5): the Cohen logo is back on the home page, but only inside the "Our Partners" block
    // (id="summit-partners") under Founders.
    const cohenLogos = [...summit.matchAll(/alt="Steven &amp; Alexandra Cohen Foundation"/g)].length;
    expect(cohenLogos).toBe(1);
    expect(summit.indexOf('id="summit-partners"')).toBeGreaterThan(-1);
    expect(summit.slice(summit.indexOf('id="summit-partners"'))).toContain('alt="Steven &amp; Alexandra Cohen Foundation"');
    expect(summit).toContain(`href="${awards2026Program.challengeUrl}"`);
    expect(summit).toContain(`href="${awards2026Program.toolkitUrl}"`);
  });

  it("keeps the 2025 ICF Alumni exactly as ICF lists them (owner, Sept 21)", () => {
    const archive = renderToStaticMarkup(<OriginalSummitPage year={2025} />);
    const alumni = archive.slice(archive.indexOf("<h2>ICF Alumni</h2>"));
    expect(alumni.slice(0, alumni.indexOf("</section>"))).not.toContain("<h3>Cherrial Odell</h3>");
    for (const name of ["Sara Alajbegovic", "Miles Jackson", "Selena Williams"]) expect(alumni).toContain(name);
  });
});
