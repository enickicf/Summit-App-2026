import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { event2026Snapshot } from "@not-alone/test-fixtures/event-2026";
import { publishedAwardsProgram } from "@not-alone/domain";
import { OriginalAwardsPage, OriginalSummitPage } from "../components/original-event-page";
import { awardsDisplayPeople } from "./awards-people";
import { directoryPeople } from "./people";
import { withAirtable } from "./airtable-overlay";
import { isPublicAirtablePerson } from "./airtable";
import { airtableTalent2026 } from "./airtable-talent-2026";
import { peopleSections } from "./people-sections";
import { portraitAttribution2026 } from "./portrait-overrides";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }), usePathname: () => "/", useSearchParams: () => new URLSearchParams() }));

// Owner (Oct 4, 2026): "put Logan Paul on the websites as founder and ... Aloe Blacc as an A talent".
describe("owner additions, Oct 4: Logan Paul (Founder) and Aloe Blacc (A-Talent)", async () => {
  const snapshot = await withAirtable(event2026Snapshot);
  const summitPeople = directoryPeople(snapshot);
  const awardsPeople = awardsDisplayPeople(snapshot);
  const sections = (variant: "summit" | "awards") => peopleSections(variant === "summit" ? summitPeople : awardsPeople, variant);
  const names = (variant: "summit" | "awards", title: string) => sections(variant).find(section => section.title === title)?.people.map(entry => entry.person.name) ?? [];
  const everywhere = (variant: "summit" | "awards") => sections(variant).flatMap(section => section.people.map(entry => `${section.title}:${entry.person.name}`));

  it("lists Logan Paul once, under Founders, on both sites with his Airtable headshot, a title and a bio", () => {
    for (const variant of ["summit", "awards"] as const) {
      expect(names(variant, "Founders"), variant).toContain("Logan Paul");
      expect(everywhere(variant).filter(entry => entry.endsWith(":Logan Paul")), variant).toEqual(["Founders:Logan Paul"]);
    }
    const logan = awardsPeople.find(person => person.name === "Logan Paul")!;
    expect(logan.image).toBe("/2026-headshots/portraits/logan-paul-c.jpg");
    expect(logan.role).toBe("Entertainer, WWE Superstar & Co-Founder of PRIME");
    expect(logan.bio).toContain("co-founded the beverage company PRIME");
    expect(logan.bio).not.toContain("is a founder of the Not Alone Summit"); // the interim line is replaced
  });

  it("lists Aloe Blacc once as A-Talent in both lineups, after the ranked Top 12, although Airtable still says Pending", () => {
    const record = airtableTalent2026.find(person => person.name === "Aloe Blacc")!;
    expect(record.status).toBe("Pending");
    expect(record.groups).toEqual(["A-Talent"]);
    expect(isPublicAirtablePerson(record)).toBe(true);
    // The exception is by name only: another pending record stays off the site.
    expect(isPublicAirtablePerson({ ...record, name: "Someone Else" })).toBe(false);
    for (const variant of ["summit", "awards"] as const) {
      const listed = everywhere(variant).filter(entry => entry.endsWith(":Aloe Blacc"));
      expect(listed, variant).toHaveLength(1);
      expect(listed[0], variant).not.toMatch(/^Founders:/);
    }
    const lineup = sections("awards").flatMap(section => section.people.map(entry => entry.person.name));
    expect(lineup.indexOf("Aloe Blacc")).toBeGreaterThan(lineup.indexOf("Caroline Jones")); // rank 10
    expect(lineup.indexOf("Aloe Blacc")).toBeLessThan(lineup.indexOf("Harry Hudson")); // B - talent
    const aloe = awardsPeople.find(person => person.name === "Aloe Blacc")!;
    expect(aloe.image).toBe("/2026-headshots/portraits/aloe-blacc-c.jpg");
    expect(aloe.role).toBe("Grammy-Nominated Singer-Songwriter");
  });

  it("renders both on the Summit and Awards pages", () => {
    const summit = renderToStaticMarkup(<OriginalSummitPage year={2026} snapshot={snapshot} />);
    const awards = renderToStaticMarkup(<OriginalAwardsPage year={2026} snapshot={snapshot} program={publishedAwardsProgram(snapshot)} />);
    for (const html of [summit, awards]) for (const name of ["Logan Paul", "Aloe Blacc"]) expect(html).toContain(name);
    expect(awards).toContain("<h3>Aloe Blacc</h3><p>Grammy-Nominated Singer-Songwriter</p>");
  });

  it("shows the required credit for Aloe Blacc's Creative Commons photo only while that photo is displayed", () => {
    expect(portraitAttribution2026("Aloe Blacc", "/2026-headshots/portraits/aloe-blacc-c.jpg")).toEqual({
      label: "Web Summit Rio, CC BY 2.0 (cropped)",
      href: "https://commons.wikimedia.org/wiki/File:Aloe_Blacc_Corporate_Innovation_Summit_event_Rio_de_Janeiro_Riocentro_Web_Summit_Rio_20258310_(54483438773).jpg"
    });
    expect(portraitAttribution2026("Aloe Blacc", "/somewhere/else.jpg")).toBeNull();
    expect(portraitAttribution2026("Logan Paul", "/2026-headshots/portraits/logan-paul-c.jpg")).toBeNull();
  });
});
