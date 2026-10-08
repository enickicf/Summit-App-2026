import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import assets from "../components/site-image-assets.json";
import { airtablePartners2026 } from "./airtable-partners-2026";
import { displayPartners } from "./partner-display-2026";
import { partnerLogo2026, partnerLogoKey } from "./partner-logos-2026";

describe("2026 partner logos", () => {
  it("has a logo file for every confirmed Airtable partner card", () => {
    // The cards the page shows (internal labels hidden, By Dzign's two records merged, one card per brand).
    const cards = displayPartners(airtablePartners2026.filter(partner => /^\s*confirmed/i.test(partner.status)));
    // Oct 3: Bee Harmony Honey publishes no logo of its own (only its parent brand's "Beesponsible" mark),
    // so it keeps its name card until the brand supplies one.
    const awaitingLogo = new Set(["Bee Harmony Honey"]);
    const missing = cards.filter(card => !partnerLogo2026(card.name) && !awaitingLogo.has(card.name)).map(card => card.name);
    expect(missing).toEqual([]);
    for (const card of cards) {
      const logo = partnerLogo2026(card.name);
      if (!logo) continue;
      expect(existsSync(new URL(`../public${logo}`, import.meta.url)), logo).toBe(true);
      // SiteImage renders only inventoried files (site-image.test.tsx keeps the inventory measured).
      expect(Object.hasOwn(assets, logo), `${logo} missing from site-image-assets.json`).toBe(true);
    }
  });

  it("Oct 7 re-read: finds the new partners' logos by their Airtable names (TÖST without the diaeresis, Moon Valley Plants = Moon Valley Nurseries)", () => {
    expect(partnerLogoKey("TÖST")).toBe("tost");
    expect(partnerLogo2026("TÖST")).toBe("/2026-partners/tost.png");
    expect(partnerLogo2026("Moon Valley Plants")).toBe("/2026-partners/moon-valley-nurseries.png");
    expect(partnerLogo2026("By Dzign")).toBe("/2026-partners/by-dzign.png");
    for (const [name, file] of [["Tubby Todd", "tubby-todd"], ["Nomad Sauna", "nomad-sauna"], ["Tape Art", "tape-art"], ["Pickleroll", "pickleroll"], ["Villa Bibbiani", "villa-bibbiani"]]) {
      expect(partnerLogo2026(name!), name).toBe(`/2026-partners/${file}.png`);
    }
    // The internal label is never a card, so it needs no logo.
    expect(partnerLogo2026("ICF Items/Cold Creek Plunges")).toBeUndefined();
  });
});
