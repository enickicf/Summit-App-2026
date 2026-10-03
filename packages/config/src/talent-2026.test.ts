import { describe, expect, it } from "vitest";
import { isPublicGuest2026, publicGuests2026, talentLevel2026, talentPlacement2026 } from "./talent-2026";

describe("2026 public guest levels", () => {
  it("lists talent, founders and producers only", () => {
    for (const name of ["Bianca Mok", "Cathy Olson", "Nick Dana", "Sophie Novak", "Alexa Price"]) expect(isPublicGuest2026(name)).toBe(false);
    for (const name of ["Jewel", "Bishop Briggs", "Silas Luke Jones", "Trent Alenik", "Miriam Isa"]) expect(isPublicGuest2026(name)).toBe(true);
    expect(talentLevel2026("Aphrah Brokaw")).toBe("producer");
    expect(publicGuests2026).toHaveLength(47);
  });

  it("only places confirmed public guests", () => {
    for (const name of Object.keys(talentPlacement2026)) expect(isPublicGuest2026(name), name).toBe(true);
  });
});
