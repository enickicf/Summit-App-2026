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
  { recordId: "rec00000000000006", name: "Resonance Foundation", item: "", group: "Sponsors", status: "Confirmed" },
  // The Oct 7 re-read rows in Airtable's grid order: two Gifting Suite partners, Vendors including an internal label,
  // two By Dzign records and a second Hugz record, a Sponsor, and then Hugz's original "Partner" row (Airtable lists
  // the Vendors block before the Partner rows).
  { recordId: "recNEW-tubby-todd", name: "Tubby Todd", item: "Hair and Body wash combo", group: "Gifting Suite", status: "Confirmed" },
  { recordId: "recNEW-tost", name: "TÖST", item: "216 cans of non alcoholic sangria drink", group: "Gifting Suite", status: "Confirmed" },
  { recordId: "recNEW-nomad-sauna", name: "Nomad Sauna", item: "", group: "Vendors", status: "Confirmed" },
  { recordId: "recNEW-tape-art", name: "Tape Art", item: "", group: "Vendors", status: "Confirmed" },
  { recordId: "recNEW-icf-items-cold-creek-plunges", name: "ICF Items/Cold Creek Plunges", item: "", group: "Vendors", status: "Confirmed" },
  { recordId: "recNEW-pickleroll", name: "Pickleroll", item: "1 pickleball court", group: "Vendors", status: "Confirmed" },
  { recordId: "recNEW-moon-valley-plants", name: "Moon Valley Plants", item: "Plants", group: "Vendors", status: "Confirmed" },
  { recordId: "recNEW-by-dzign-ceiling-equipment", name: "By Dzign Ceiling Equipment", item: "Ceiling Decor", group: "Vendors", status: "Confirmed" },
  { recordId: "recNEW-by-dzign-all-decor", name: "By Dzign (All Decor)", item: "Decor", group: "Vendors", status: "Confirmed" },
  { recordId: "recNEW-hugz-vendors", name: "Hugz", item: "small stuffed animal for green room set up", group: "Vendors", status: "Confirmed" },
  { recordId: "recNEW-villa-bibbiani", name: "Villa Bibbiani", item: "", group: "Sponsors", status: "Confirmed" },
  { recordId: "rec00000000000007", name: "Hugz", item: "Purple Turtles", group: "Partner", status: "Confirmed" }
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

  it("Oct 7 Airtable re-read: new partners sit in their groups in Airtable order, By Dzign and Hugz are one card each, the internal ICF Items label is not shown", async () => {
    const { default: PartnersPage } = await import("./page");
    const html = renderToStaticMarkup(await PartnersPage());
    const brands = html.slice(html.indexOf('id="brands"'));
    const at = (text: string) => { const index = brands.indexOf(text); expect(index, text).toBeGreaterThan(-1); return index; };
    // Sponsors: Fanatics (Resonance holds the top-row Sponsor spot) then Villa Bibbiani; then Partners (Hugz, where it was),
    // then Vendors and the Gifting Suite, each in Airtable order; a partner without a logo (Tool Co, Glow Skincare) stays a name card.
    const order = [
      ">Sponsors<", 'alt="Fanatics Foundation"', 'alt="Villa Bibbiani"',
      ">Partners<", 'alt="Hugz"',
      ">Vendors<", "Tool Co", 'alt="Nomad Sauna"', 'alt="Tape Art"', 'alt="Pickleroll"', 'alt="Moon Valley Plants"', 'alt="By Dzign"',
      ">Gifting Suite Partners<", "Glow Skincare", 'alt="Tubby Todd"', 'alt="TÖST"'
    ];
    const positions = order.map(at);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
    // One card each: the two By Dzign records read "By Dzign"; the second Hugz record adds no card; no internal label.
    expect(html.match(/alt="By Dzign"/g)).toHaveLength(1);
    expect(html).not.toContain("By Dzign Ceiling Equipment");
    expect(html).not.toContain("By Dzign (All Decor)");
    expect(html.match(/alt="Hugz"/g)).toHaveLength(1);
    expect(html).not.toContain("ICF Items");
    expect(html).not.toContain("Cold Creek");
    // Every new logo is served from public/2026-partners through the image optimizer.
    for (const file of ["tubby-todd", "tost", "nomad-sauna", "tape-art", "pickleroll", "moon-valley-nurseries", "by-dzign", "villa-bibbiani-official"]) {
      expect(html, file).toContain(`%2F2026-partners%2F${file}.png`);
    }
  });
});
