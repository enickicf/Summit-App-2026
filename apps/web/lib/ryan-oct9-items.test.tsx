import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { displayTitle2026, titleOneLine } from "./title-overrides-2026";
import { excludedFromSite2026, isPublicAirtablePerson, withOwnerGroups } from "./airtable";
import { airtableTalent2026 } from "./airtable-talent-2026";
import { EventPartners } from "../components/event-partners";
import { RoleLines } from "../components/role-lines";

// Ryan's Oct 9 meeting + the owner's Oct 11 decisions.
describe("Ryan, Oct 9 / owner, Oct 11", () => {
  it("shows ICF alumni as 'ICF Alumni' with their title on the next line", () => {
    expect(displayTitle2026("Nick Ekern", "ICF Alumni & Director of marketing")).toBe("ICF Alumni\nDirector of marketing");
    expect(displayTitle2026("Trent Alenik", "CEO, Inspiring Children Foundation")).toBe("ICF Alumni\nCEO, Inspiring Children Foundation");
    expect(displayTitle2026("Sophie Novak", "")).toBe("ICF Alumni");
    expect(displayTitle2026("Paige Neuenschwander", "Executive Assistant")).toBe("ICF Partnerships Manager");
    expect(displayTitle2026("Jewel", "Singer")).toBe("Singer");
    expect(titleOneLine("ICF Alumni\nManager")).toBe("ICF Alumni, Manager");
    expect(renderToStaticMarkup(<RoleLines text={"ICF Alumni\nManager"} />)).toBe("ICF Alumni<br/>Manager");
  });

  it("keeps Seth Porter Winterton off the website", () => {
    expect(excludedFromSite2026.has("seth porter winterton")).toBe(true);
    const seth = airtableTalent2026.find(person => person.name === "Seth Porter Winterton")!;
    expect(isPublicAirtablePerson(seth)).toBe(false);
  });

  it("credits the Bryan brothers as Founders and lists George Rapier, Kimbal and Christiana Musk as Founders", () => {
    for (const name of ["Bob Bryan", "Mike Bryan"]) expect(withOwnerGroups(airtableTalent2026.find(person => person.name === name)!).groups).toContain("Founder");
    for (const name of ["Dr. George Rapier III", "Kimbal Musk", "Christiana Musk"]) {
      const person = airtableTalent2026.find(entry => entry.name === name)!;
      expect(person.groups).toContain("Founder");
      expect(isPublicAirtablePerson(person)).toBe(true);
    }
    // Ryan: "Take Ratcliff out of the Founders" — Airtable still groups him Founder, so the site excludes him by name.
    expect(isPublicAirtablePerson(airtableTalent2026.find(person => person.name === "John Ratcliff")!)).toBe(false);
  });

  it("uses Producer wording in Sally and Sophie's public copy", () => {
    for (const name of ["Sally Dewhurst", "Sophie Novak"]) {
      const source = airtableTalent2026.find(person => person.name === name)!;
      const publicPerson = withOwnerGroups(source);
      expect(`${publicPerson.title} ${publicPerson.bio}`).not.toContain("Executive Producer of the Not Alone Summit");
      expect(`${publicPerson.title} ${publicPerson.bio}`.toLowerCase()).toContain("producer of the not alone summit");
      expect(source.bio).toContain("Executive Producer of the Not Alone Summit");
    }
  });

  it("adds Wise Friend as the curriculum partner in Our Partners (light and dark)", () => {
    for (const tone of ["light", "dark"] as const) {
      const html = renderToStaticMarkup(<EventPartners tone={tone} />);
      expect(html).toContain("Curriculum partner");
      expect(html).toContain('alt="Wise Friend"');
    }
  });
});
