import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { airtablePartners2026 } from "./airtable-partners-2026";
import { partnerLogo2026 } from "./partner-logos-2026";

describe("2026 partner logos", () => {
  it("has a logo file for every confirmed Airtable partner ", () => {
    const confirmed = airtablePartners2026.filter(partner => /^\s*confirmed/i.test(partner.status));
    const missing = confirmed.filter(partner => !partnerLogo2026(partner.name)).map(partner => partner.name);
    expect(missing).toEqual([]);
    for (const partner of confirmed) {
      const logo = partnerLogo2026(partner.name);
      if (logo) expect(existsSync(new URL(`../public${logo}`, import.meta.url)), logo).toBe(true);
    }
  });
});
