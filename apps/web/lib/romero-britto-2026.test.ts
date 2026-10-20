import { describe, expect, it } from "vitest";
import { ownerPartners2026, displayPartners, partnerGroupOf, withOwnerPartners } from "./partner-display-2026";
import { partnerLogo2026 } from "./partner-logos-2026";

// Oct 19 (Aubrey Wickenheiser via the owner): Romero Britto is listed as a Vendor with his own wordmark.
describe("Romero Britto (Oct 19)", () => {
  const britto = ownerPartners2026.find(partner => partner.name === "Romero Britto");

  it("is an owner-added Vendor, confirmed", () => {
    expect(britto).toBeDefined();
    expect(partnerGroupOf(britto!)).toBe("Vendors");
    expect(britto!.status).toBe("Confirmed");
  });

  it("shows his own logo rather than a name card", () => {
    expect(partnerLogo2026("Romero Britto")).toBe("/2026-partners/romero-britto.png");
  });

  it("is not added twice once Airtable carries him", () => {
    const fromAirtable = [{ recordId: "recAirtable", name: "Romero Britto", item: "", group: "Vendors", status: "Confirmed" }];
    const merged = withOwnerPartners(fromAirtable, [...ownerPartners2026]);
    expect(merged.filter(partner => partner.name === "Romero Britto")).toHaveLength(1);
    expect(displayPartners(merged).filter(partner => partner.name === "Romero Britto")).toHaveLength(1);
  });
});
