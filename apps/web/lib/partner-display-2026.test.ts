import { describe, expect, it } from "vitest";
import { airtablePartners2026 } from "./airtable-partners-2026";
import { displayPartners, isInternalPartnerLabel, partnerDisplayName } from "./partner-display-2026";

const row = (name: string, group: string, recordId = `rec-${name}`, item = "") => ({ recordId, name, item, group, status: "Confirmed" });

describe("2026 partner display rules (Oct 7 Airtable re-read)", () => {
  it("shows the two By Dzign records as one card named By Dzign, in the first record's place", () => {
    const cards = displayPartners([row("Tape Art", "Vendors"), row("By Dzign Ceiling Equipment", "Vendors", "a", "Ceiling Decor"), row("By Dzign (All Decor)", "Vendors", "b", "Decor"), row("Pickleroll", "Vendors")]);
    expect(cards.map(card => card.name)).toEqual(["Tape Art", "By Dzign", "Pickleroll"]);
    expect(cards[1]).toMatchObject({ recordId: "a", group: "Vendors", item: "Ceiling Decor" });
    expect(partnerDisplayName("By Dzign (All Decor)")).toBe("By Dzign");
    expect(partnerDisplayName(" Tubby Todd ")).toBe("Tubby Todd");
  });

  it("hides the internal ICF Items label and keeps one card per brand: its first card in page order, even when Airtable lists the other row first", () => {
    // Airtable's grid lists the Vendors block before the "Partner" rows, as for Hugz today.
    const rows = [row("ICF Items/Cold Creek Plunges", "Vendors"), row("Hugz", "Vendors", "vendor"), row("Nomad Sauna", "Vendors"), row("Hugz", "Partner", "partner")];
    const cards = displayPartners(rows);
    // Returned in Airtable order; the Partners group is reached before Vendors on the page, so that Hugz row is the card.
    expect(cards.map(card => card.name)).toEqual(["Nomad Sauna", "Hugz"]);
    expect(cards[1]).toMatchObject({ recordId: "partner", group: "Partner" });
    expect(isInternalPartnerLabel("ICF Items/Cold Creek Plunges")).toBe(true);
    expect(isInternalPartnerLabel("Hugz")).toBe(false);
    // Untouched rows are returned as the same objects (React keys and groups unchanged); the input is not mutated.
    expect(cards[0]).toBe(rows[2]);
    expect(cards[1]).toBe(rows[3]);
    expect(rows).toHaveLength(4);
  });

  it("applies to the recorded Airtable rows: Hugz once (Partners group), By Dzign once, no ICF Items card, every other new partner listed", () => {
    const confirmed = airtablePartners2026.filter(partner => /^\s*confirmed/i.test(partner.status));
    expect(confirmed.filter(partner => partner.name === "Hugz")).toHaveLength(2);
    const cards = displayPartners(confirmed);
    expect(cards.filter(card => card.name === "Hugz")).toEqual([expect.objectContaining({ recordId: "recUZ5bDgnhBp9fVY", group: "Partner" })]);
    expect(cards.filter(card => /by dzign/i.test(card.name))).toEqual([expect.objectContaining({ name: "By Dzign", group: "Vendors", item: "Ceiling Decor" })]);
    expect(cards.some(card => /icf items|cold creek/i.test(card.name))).toBe(false);
    const names = cards.map(card => card.name);
    for (const name of ["Tubby Todd", "TÖST", "Nomad Sauna", "Tape Art", "Pickleroll", "Moon Valley Plants", "Villa Bibbiani"]) expect(names).toContain(name);
    expect(cards.find(card => card.name === "Villa Bibbiani")).toMatchObject({ group: "Sponsors" });
    expect(cards.find(card => card.name === "TÖST")).toMatchObject({ group: "Gifting Suite" });
    // Consequence of "one card per brand" for the only other brand Airtable records twice: Sena Rituals (Gifting Suite
    // and Vendors since Oct 3) now shows once, in Vendors, the first group a visitor reaches. Flagged to the owner Oct 7.
    expect(confirmed.filter(partner => partner.name === "Sena Rituals")).toHaveLength(2);
    expect(cards.filter(card => card.name === "Sena Rituals")).toEqual([expect.objectContaining({ group: "Vendors" })]);
    // Nothing else is dropped: only the internal label, the second By Dzign, Hugz and Sena Rituals rows go.
    expect(cards).toHaveLength(confirmed.length - 4);
  });
});
