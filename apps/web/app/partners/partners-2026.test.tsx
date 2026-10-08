import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { event2026Snapshot } from "@not-alone/test-fixtures/event-2026";
import { setAirtableOverlay } from "../../lib/airtable-shared";

const partners = [
  { recordId: "rec00000000000000", name: "NAMI", item: "", group: "", status: "Confirmed" },
  { recordId: "rec00000000000001", name: "Glow Skincare", item: "Gift sets", group: "Gifting Suite", status: "Confirmed" },
  { recordId: "rec00000000000002", name: "Declined Co", item: "", group: "Gifting Suite", status: "Declined" },
  { recordId: "rec00000000000003", name: "Pending Co", item: "", group: "Vendors", status: "Pending" },
  { recordId: "rec00000000000004", name: "Tool Co", item: "", group: "Vendors", status: "Confirmed" },
  // The two Airtable Sponsors, in Airtable's own order (Oct 3 re-read).
  { recordId: "rec00000000000005", name: "Fanatics Foundation", item: "", group: "Sponsors", status: "Confirmed" },
  { recordId: "rec00000000000006", name: "Resonance Foundation", item: "", group: "Sponsors", status: "Confirmed" }
];
const snapshot = { ...event2026Snapshot };
setAirtableOverlay(snapshot, { people: null, partners, schedule: false });
vi.mock("../../lib/snapshot", () => ({ getPublicSnapshotState: async () => ({ snapshot }) }));

describe("2026 partners page", () => {
  it("keeps the presenting and premier sponsors and lists Airtable partners by their Select group", async () => {
    const { default: PartnersPage } = await import("./page");
    const html = renderToStaticMarkup(await PartnersPage());
    // Owner (Oct 5): "Powered by" (Cohen Foundation) then "Presented by" (ICF x NAMI) first, then Wynn, then the brands
    // with Vendors before the Gifting Suite. No "Founding Partners" or "community partner" wording anywhere.
    expect(html).not.toContain("Founding Partners");
    expect(html.toLowerCase()).not.toContain("community partner");
    expect(html.indexOf(">Powered by<")).toBeLessThan(html.indexOf(">Presented by<"));
    expect(html.indexOf(">Presented by<")).toBeLessThan(html.indexOf("Premier Sponsor"));
    expect(html).toContain("Premier Sponsor");
    expect(html).not.toContain("Presenting Sponsor");
    expect(html.indexOf(">Vendors<")).toBeLessThan(html.indexOf("Gifting Suite Partners"));
    expect(html).toContain("Tool Co");
    expect(html).toContain('id="brands"');
    expect(html).toContain('id="philanthropists"');
    expect(html).toContain("Gifting Suite Partners");
    expect(html).toContain("Glow Skincare");
    expect(html).not.toContain("Declined Co");
    expect(html).not.toContain("Pending Co");
    expect(html).not.toContain("Inaugural Sponsors");
    expect(html).toContain('href="/partners/2025"');
  });

  it("owner (Oct 7): Resonance Philanthropies holds the Sponsor spot beside Wynn and Fanatics sits in the Sponsors group", async () => {
    const { default: PartnersPage } = await import("./page");
    const html = renderToStaticMarkup(await PartnersPage());
    const brands = html.indexOf('id="brands"');
    const resonance = html.indexOf('alt="Resonance Philanthropies"');
    const fanatics = html.indexOf('alt="Fanatics Foundation"');
    expect(brands).toBeGreaterThan(-1);
    expect(resonance).toBeGreaterThan(-1);
    expect(fanatics).toBeGreaterThan(-1);
    // Top row: Premier Sponsor (Wynn) then the single "Sponsor" heading with the Resonance Philanthropies logo, all before the brand groups.
    expect(html.match(/>Sponsor</g)).toHaveLength(1);
    expect(html.indexOf("Premier Sponsor")).toBeLessThan(html.indexOf(">Sponsor<"));
    expect(html.indexOf(">Sponsor<")).toBeLessThan(resonance);
    expect(resonance).toBeLessThan(brands);
    expect(html).toContain("resonance-foundation.png");
    // Fanatics is now in the "Sponsors" group of the brands block, not in the top row.
    expect(fanatics).toBeGreaterThan(brands);
    expect(html.slice(brands).indexOf(">Sponsors<")).toBeGreaterThan(-1);
    expect(html.slice(brands).indexOf(">Sponsors<")).toBeLessThan(html.slice(brands).indexOf('alt="Fanatics Foundation"'));
    expect(html.slice(0, brands)).not.toContain("Fanatics");
    // The Airtable record name is never shown twice: the card reads as the logo does.
    expect(html).not.toContain('alt="Resonance Foundation"');
  });
});
