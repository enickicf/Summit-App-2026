import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { event2026Snapshot } from "@not-alone/test-fixtures/event-2026";
import source from "../lib/original-sites.json";
import { ClassicAwardsPage } from "./classic-awards-page";
import { ClassicHeader } from "./classic-header";

const escape = (text: string) => text.replaceAll("&", "&amp;").replaceAll("\"", "&quot;").replaceAll("'", "&#x27;");
const sections = source.awards.sections;

// Unoriginal (classic) Awards = the live ICF Awards page word for word (owner, Sept 21, 2026);
// 2026 differs only in its attendee sections.
describe("classic Awards version", () => {
  const archive = renderToStaticMarkup(<ClassicAwardsPage year={2025} />);
  const current = renderToStaticMarkup(<ClassicAwardsPage year={2026} snapshot={event2026Snapshot} />);

  it("renders 2025 as ICF's page: same sections, order, text and people", () => {
    // Owner (Sept 21): ICF's order, except the no-solicitation notice moves to the bottom.
    const markers = ["INVITATION ONLY | NOV 2, 2026", "Presenting the Not Alone Awards Show", "<h3>Host</h3>", "When:", "RSVP HERE",
      "<h2>Founders</h2>", "<h2>Musicians</h2>", "<h2>Entertainers &amp; Athletes</h2>", "<h2>Experts</h2>", "<h2>Business Leaders &amp; Philanthropists</h2>", "<h3>Why It Matters</h3>", "<h3>Awards</h3>", "Celebrating Pioneers in Human Development &amp; Mental Health", "No Solicitation, Only Connection."];
    const positions = markers.map(marker => { const index = archive.indexOf(marker); expect(index, marker).toBeGreaterThan(-1); return index; });
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);
    for (const section of sections.slice(5, 10)) for (const person of section.people) expect(archive).toContain(`<strong>${escape(person.name)}</strong>`);
    for (const block of sections[11]!.blocks.slice(1)) expect(archive).toContain(escape(block.text));
  });

  it("keeps everything but the attendees identical on 2026", () => {
    // 2026 opens its people with Keynotes (owner's sections); 2025 keeps ICF's Founders first.
    // Cut just before the first people section (2026: the headless ranked lineup; 2025: ICF's Founders).
    const strip = (html: string) => { const at = Math.min(...['aria-label="Lineup"', "<h2>Founders</h2>"].map(marker => html.indexOf(marker)).filter(index => index > -1)); return html.slice(0, html.lastIndexOf("<section", at)) + html.slice(html.indexOf("<h3>Why It Matters</h3>")); };
    expect(strip(current)).toBe(strip(archive));
    expect(current).toContain('href="/directory/');
  });
  it("leads from the Unoriginal Awards pages back to the Unoriginal Summit site", () => {
    const header = renderToStaticMarkup(<ClassicHeader pathname="/awards/2026" awards />);
    expect(header).toContain('href="/">Summit</a>');
    expect(header).not.toContain(">Awards</a>");
    expect(renderToStaticMarkup(<ClassicHeader pathname="/" />)).toContain('href="/awards/2026">Awards</a>');
  });
});
