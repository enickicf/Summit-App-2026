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

// Owner (Oct 24, 2026): current Airtable attendance status now overrides older manual additions.
// Logan Paul is Donation - Not Attending and Aloe Blacc is withdrawn, so neither is public.
describe("older owner additions follow current Airtable attendance", async () => {
  const snapshot = await withAirtable(event2026Snapshot);
  const summitPeople = directoryPeople(snapshot);
  const awardsPeople = awardsDisplayPeople(snapshot);
  const sections = (variant: "summit" | "awards") => peopleSections(variant === "summit" ? summitPeople : awardsPeople, variant);
  const names = (variant: "summit" | "awards", title: string) => sections(variant).find(section => section.title === title)?.people.map(entry => entry.person.name) ?? [];
  const everywhere = (variant: "summit" | "awards") => sections(variant).flatMap(section => section.people.map(entry => `${section.title}:${entry.person.name}`));

  it("removes Logan Paul from both sites after Airtable marks him not attending", () => {
    for (const variant of ["summit", "awards"] as const) {
      expect(names(variant, "Founders"), variant).not.toContain("Logan Paul");
      expect(everywhere(variant).filter(entry => entry.endsWith(":Logan Paul")), variant).toEqual([]);
    }
    expect(awardsPeople.find(person => person.name === "Logan Paul")).toBeUndefined();
  });

  // Ryan (Oct 8, 2026): "We gotta take Aloe Blacc out." The Oct 4 name-only exception is withdrawn; his Airtable
  // status is still Pending, so the ordinary rule keeps him off both sites until Airtable confirms him.
  it("no longer lists Aloe Blacc anywhere: the owner exception is empty and his Airtable status is Pending", () => {
    const record = airtableTalent2026.find(person => person.name === "Aloe Blacc")!;
    expect(record.status).not.toMatch(/confirmed|hold space/i); // Pending until Oct 19, "Withdrew" on the Oct 20 Airtable read
    expect(record.groups).not.toContain("Founder"); // A-Talent until Oct 19; no grouping on the Oct 20 Airtable read
    expect(ownerListedRegardless.size).toBe(0);
    expect(isPublicAirtablePerson(record)).toBe(false);
    expect(isPublicAirtablePerson({ ...record, groups: ["A-Talent"], status: "Confirmed Attendance" })).toBe(true); // a confirmation in Airtable brings him back
    for (const variant of ["summit", "awards"] as const) expect(everywhere(variant).filter(entry => entry.endsWith(":Aloe Blacc")), variant).toEqual([]);
    expect(summitPeople.find(person => person.name === "Aloe Blacc")).toBeUndefined();
    expect(awardsPeople.find(person => person.name === "Aloe Blacc")).toBeUndefined();
    const lineup = sections("awards").flatMap(section => section.people.map(entry => entry.person.name));
    expect(lineup.indexOf("Caroline Jones")).toBeLessThan(lineup.indexOf("Harry Hudson")); // rank 10 still precedes B - talent
  });

  it("renders neither Logan Paul nor Aloe Blacc on the Summit and Awards pages", () => {
    const summit = renderToStaticMarkup(<OriginalSummitPage year={2026} snapshot={snapshot} />);
    const awards = renderToStaticMarkup(<OriginalAwardsPage year={2026} snapshot={snapshot} program={publishedAwardsProgram(snapshot)} />);
    for (const html of [summit, awards]) {
      expect(html).not.toContain("Logan Paul");
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
