import { describe, expect, it } from "vitest";
import { rsvpForm, rsvpsOfForm, missingVipFields, type RsvpSubmission } from "./store";

const row = (extra: Partial<RsvpSubmission>): RsvpSubmission => ({ name: "Guest", email: Math.random() + "@example.com", phone: "", organization: "Org", professionalRole: "Role", invitedBy: "Team", attendanceStatus: "attending", communityDay: false, guestCount: 1, notes: "", id: Math.random().toString(36).slice(2), submittedAt: "2026-10-03T10:00:00.000Z", source: "form", ...extra });

describe("NAMI VIP and Lake Las Vegas VIP forms (owner, Oct 3, 2026)", () => {
  it("labels every form distinctly and lists each on its own", () => {
    const rows = [row({ vip: true, partner: "nami" }), row({ vip: true, tier: "lake-las-vegas" }), row({ partner: "nami" }), row({ tier: "lake-las-vegas" }), row({ vip: true }), row({})];
    expect(rows.map(r => rsvpForm(r))).toEqual(["NAMI VIP", "Lake Las Vegas VIP", "NAMI", "Lake Las Vegas", "VIP", "Standard"]);
    expect(rsvpsOfForm(rows, "nami-vip")).toHaveLength(1);
    expect(rsvpsOfForm(rows, "lake-las-vegas-vip")).toHaveLength(1);
    expect(rsvpsOfForm(rows, "vip")).toHaveLength(1);
  });
  it("applies the VIP required fields to the group VIP forms too", () => {
    expect(missingVipFields(row({ vip: true, partner: "nami", invitedBy: "" }))).toEqual(["who invited you"]);
  });
});
