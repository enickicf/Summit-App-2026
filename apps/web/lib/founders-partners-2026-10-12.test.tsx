import { describe, expect, it } from "vitest";
import { ownerApprovedFounders2026 } from "./awards-editorial";
import { ownerPartners2026, withOwnerPartners } from "./partner-display-2026";
import { partnerLogo2026 as partnerLogo } from "./partner-logos-2026";
import { portraitAttribution2026 } from "./portrait-overrides";

// Oct 12 (owner, relaying Ryan and Paige): Bryan brothers on one card, Pam and Duncan off the 2026 founders,
// Bryan Brothers Foundation listed as a partner with its logo.
describe("Oct 12 founder and partner changes", () => {
  it("credits the Bryan brothers' shared photo on their profile", () => {
    expect(portraitAttribution2026("Bob and Mike Bryan", "/2026-headshots/portraits/bob-mike-bryan.jpg")?.label).toContain("CC BY-SA 4.0");
  });
  it("no longer lists Pam and Duncan Goldie-Morrison as 2026 founders", () => {
    expect(ownerApprovedFounders2026).toEqual([]);
  });
  it("adds Bryan Brothers Foundation once, with its logo", () => {
    expect(withOwnerPartners([{ recordId: "recGlow", name: "Glow", item: "", group: "Gifting Suite", status: "Confirmed" }], ownerPartners2026).map(partner => partner.name)).toEqual(["Glow", "Bryan Brothers Foundation", "Fight For Lives"]);
    expect(withOwnerPartners(ownerPartners2026, ownerPartners2026)).toHaveLength(2);
    expect(partnerLogo("Bryan Brothers Foundation")).toBe("/2026-partners/bryan-bros-foundation.png");
  });
});
