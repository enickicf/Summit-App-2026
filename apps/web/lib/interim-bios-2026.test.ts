import { describe, expect, it } from "vitest";
import { airtableTalent2026 } from "./airtable-talent-2026";
import { isPublicAirtablePerson } from "./airtable";
import { awardsBiographies } from "./awards-people";
import { interimBio2026 } from "./interim-bios-2026";

describe("2026 bios", () => {
  it("gives every listed person a bio (Airtable first, then ICF, then the interim bio)", () => {
    const without = airtableTalent2026.filter(isPublicAirtablePerson)
      .filter(person => !person.bio.trim() && !awardsBiographies[person.name]?.bio && !interimBio2026(person.name))
      .map(person => person.name);
    expect(without).toEqual([]);
  });
});
