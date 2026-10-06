import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { event2026Snapshot } from "@not-alone/test-fixtures/event-2026";
import { setAirtableOverlay } from "../../lib/airtable-shared";

const partners = [
  { recordId: "rec00000000000001", name: "Glow Skincare", item: "Gift sets", group: "Gifting Suite", status: "Confirmed" },
  { recordId: "rec00000000000002", name: "Declined Co", item: "", group: "Gifting Suite", status: "Declined" },
  { recordId: "rec00000000000003", name: "Pending Co", item: "", group: "Vendors", status: "Pending" },
  { recordId: "rec00000000000004", name: "Tool Co", item: "", group: "Vendors", status: "Confirmed" }
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
});
