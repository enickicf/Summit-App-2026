import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import source from "../lib/original-sites.json";
import { ClassicSummitPage } from "./classic-summit-page";
import { ClassicHeader, classicNavigation } from "./classic-header";
import { ClassicFooter } from "./classic-footer";

vi.mock("next/navigation", () => ({ usePathname: () => "/", useSearchParams: () => new URLSearchParams() }));

const escape = (text: string) => text.replaceAll("&", "&amp;").replaceAll("\"", "&quot;").replaceAll("'", "&#x27;");

// Classic version = the live ICF Summit page (inspiringchildren.org/summit, Sept 21, 2026)
// plus only this site's Schedule and Ask AI pages.
describe("classic Summit version", () => {
  const html = renderToStaticMarkup(<ClassicSummitPage />);

  it("keeps the live page's sections in ICF's order (owner, Sept 21: verbatim)", () => {
    const markers = ["Not Alone Summit", "Davos of Human Development", "Building on the success of", "The Not Alone Program,", "Sponsored By", "<h2>Co-Chairs</h2>", "<h2>Summit Host</h2>", "<h2>Awards Host</h2>", "Featuring:", "Located at ", "<h2>Founders</h2>", "<h2>Musicians</h2>", "<h2>Entertainers &amp; Athletes</h2>", "<h2>Experts</h2>", "<h2>Business Leaders &amp; Philanthropists</h2>", "<h2>ICF Alumni</h2>", "<h2>Executive Producers</h2>", "<h2>Producers</h2>", "Thank you for your interest!"];
    const positions = markers.map(marker => { const index = html.indexOf(marker); expect(index, marker).toBeGreaterThan(-1); return index; });
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);
  });

  it("shows every person, role and all 14 features exactly as ICF lists them", () => {
    for (const section of source.summit.sections.slice(7, 13)) for (const person of section.people) {
      expect(html).toContain(`<strong>${escape(person.name)}</strong>`);
      expect(html).toContain(escape(person.role));
    }
    for (const item of ["Panels", "Pitches", "Product Launches", "Group Discussions", "Exclusive VIP Experiences"]) expect(html).toContain(`<strong>${escape(item)}</strong>`);
    expect(html).toContain("presented by <strong>Villa Bibbiani</strong>");
    expect(html).toContain("November 2 - 4, 2026");
    const producers = html.slice(html.indexOf("<h2>Executive Producers</h2>"));
    const order = ["Jewel", "Ryan Wolfington", "Dr. George Rapier III", "Trevor Short", "Aphrah Brokaw", "Trent Alenik"].map(name => producers.indexOf(`<h4>${name}</h4>`));
    expect([...order].sort((a, b) => a - b)).toEqual(order);
  });

  it("keeps ICF's Davos quote, since this version is verbatim (owner, Sept 21)", () => expect(html).toContain("Davos of Human Development"));
  it("renders 2025 as ICF's page with ICF's own photos", () => {
    const archive = renderToStaticMarkup(<ClassicSummitPage year={2025} />);
    expect(archive).not.toContain("/2026-headshots/");
    for (const person of source.summit.sections[12]!.people) expect(archive).toContain(`<strong>${escape(person.name)}</strong>`);
  });

  it("plays the live page's hero film, muted, with a sound toggle", () => {
    expect(html).toContain('poster="/classic/hero-fallback.webp"');
    expect(html).toContain('aria-label="Turn sound on"');
  });

  it("uses ICF's navigation plus Schedule and Ask AI, and ICF's footer", () => {
    const header = renderToStaticMarkup(<ClassicHeader pathname="/" />);
    expect(classicNavigation.map(item => item.label)).toEqual(["About", "Speakers", "Awards", "Partners", "Venue", "Schedule", "Ask AI", "Contact Us", "2025"]);
    for (const item of classicNavigation) expect(header).toContain(`href="${item.href}"`);
    expect(header).toContain("Join the #NotAloneChallenge!");
    expect(header).toContain('href="https://www.inspiringchildren.org/donate"');
    const footer = renderToStaticMarkup(<ClassicFooter />);
    expect(footer).toContain("Our EIN is 20-1638145.");
    expect(footer).toContain('href="tel:988"');
  });
});
