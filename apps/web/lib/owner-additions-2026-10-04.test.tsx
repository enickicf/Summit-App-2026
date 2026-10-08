import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { event2026Snapshot } from "@not-alone/test-fixtures/event-2026";
import { publishedAwardsProgram } from "@not-alone/domain";
import { OriginalAwardsPage, OriginalSummitPage } from "../components/original-event-page";
import { awardsDisplayPeople } from "./awards-people";
import { directoryPeople } from "./people";
import { withAirtable } from "./airtable-overlay";
import { isPublicAirtablePerson, ownerListedRegardless } from "./airtable";
import { airtableTalent2026 } from "./airtable-talent-2026";
import { peopleSections } from "./people-sections";
import { portraitAttribution2026 } from "./portrait-overrides";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }), usePathname: () => "/", useSearchParams: () => new URLSearchParams() }));

// Owner (Oct 4, 2026): "put Logan Paul on the websites as founder and ... Aloe Blacc as an A talent".
// Ryan (Oct 8, 2026): Aloe Blacc is out again; Logan Paul stays.
describe("owner additions, Oct 4: Logan Paul (Founder); Aloe Blacc withdrawn Oct 8", async () => {
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

  // Ryan (Oct 8, 2026): "We gotta take Aloe Blacc out." The Oct 4 name-only exception is withdrawn; his Airtable
  // status is still Pending, so the ordinary rule keeps him off both sites until Airtable confirms him.
  it("no longer lists Aloe Blacc anywhere: the owner exception is empty and his Airtable status is Pending", () => {
    const record = airtableTalent2026.find(person => person.name === "Aloe Blacc")!;
    expect(record.status).toBe("Pending");
    expect(record.groups).toEqual(["A-Talent"]);
    expect(ownerListedRegardless.size).toBe(0);
    expect(isPublicAirtablePerson(record)).toBe(false);
    expect(isPublicAirtablePerson({ ...record, status: "Confirmed Attendance" })).toBe(true); // a confirmation in Airtable brings him back
    for (const variant of ["summit", "awards"] as const) expect(everywhere(variant).filter(entry => entry.endsWith(":Aloe Blacc")), variant).toEqual([]);
    expect(summitPeople.find(person => person.name === "Aloe Blacc")).toBeUndefined();
    expect(awardsPeople.find(person => person.name === "Aloe Blacc")).toBeUndefined();
    const lineup = sections("awards").flatMap(section => section.people.map(entry => entry.person.name));
    expect(lineup.indexOf("Caroline Jones")).toBeLessThan(lineup.indexOf("Harry Hudson")); // rank 10 still precedes B - talent
  });

  it("renders Logan Paul, and never Aloe Blacc, on the Summit and Awards pages", () => {
    const summit = renderToStaticMarkup(<OriginalSummitPage year={2026} snapshot={snapshot} />);
    const awards = renderToStaticMarkup(<OriginalAwardsPage year={2026} snapshot={snapshot} program={publishedAwardsProgram(snapshot)} />);
    for (const html of [summit, awards]) {
      expect(html).toContain("Logan Paul");
      expect(html).not.toContain("Aloe Blacc");
    }
  });

  it("keeps the Creative Commons credit data for Aloe Blacc's photo in place, unused, for a return", () => {
    expect(portraitAttribution2026("Aloe Blacc", "/2026-headshots/portraits/aloe-blacc-c.jpg")).toEqual({
      label: "Web Summit Rio, CC BY 2.0 (cropped)",
      href: "https://commons.wikimedia.org/wiki/File:Aloe_Blacc_Corporate_Innovation_Summit_event_Rio_de_Janeiro_Riocentro_Web_Summit_Rio_20258310_(54483438773).jpg"
    });
    expect(portraitAttribution2026("Aloe Blacc", "/somewhere/else.jpg")).toBeNull();
    expect(portraitAttribution2026("Logan Paul", "/2026-headshots/portraits/logan-paul-c.jpg")).toBeNull();
  });
});
