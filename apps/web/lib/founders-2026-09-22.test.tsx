import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { event2026Snapshot } from "@not-alone/test-fixtures/event-2026";
import { publishedAwardsProgram } from "@not-alone/domain";
import { OriginalAwardsPage, OriginalSummitPage } from "../components/original-event-page";
import { awardsDisplayPeople } from "./awards-people";
import { directoryPeople } from "./people";
import { withAirtable } from "./airtable-overlay";
import { peopleSections } from "./people-sections";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }), usePathname: () => "/", useSearchParams: () => new URLSearchParams() }));

// Paige/owner, Sept 22: Jay & Erica McGraw, Melony & Adam Lewis and Winston & Cameron Kelly are founders in
// Airtable (Hold Space) and must be credited in the Founders sections of both current sites.
describe("founder couples added Sept 22", async () => {
  const couples = ["Jay &amp; Erica McGraw", "Melony &amp; Adam Lewis", "Winston &amp; Cameron Kelly"];
  const snapshot = await withAirtable(event2026Snapshot);
  const summit = renderToStaticMarkup(<OriginalSummitPage year={2026} snapshot={snapshot} />);
  const awards = renderToStaticMarkup(<OriginalAwardsPage year={2026} snapshot={snapshot} program={publishedAwardsProgram(snapshot)} />);

  it("lists every Airtable founder regardless of invitation status, as one couple card each", () => {
    const people = awardsDisplayPeople(snapshot);
    const names = people.map(person => person.name);
    for (const name of ["Jay & Erica McGraw", "Melony & Adam Lewis", "Winston & Cameron Kelly"]) expect(names).toContain(name);
    for (const name of ["Jay McGraw", "Erica McGraw", "Melony Lewis", "Adam Lewis", "Winston Kelly", "Cameron Kelly"]) expect(names).not.toContain(name);
    for (const variant of ["summit", "awards"] as const) {
      const founders = peopleSections(people, variant).find(section => section.title === "Founders")!.people.map(entry => entry.person.name);
      for (const name of ["Jay & Erica McGraw", "Melony & Adam Lewis", "Winston & Cameron Kelly"]) expect(founders, variant).toContain(name);
    }
    // Not in the Summit lineup or the Awards lineup: founders only.
    for (const variant of ["summit", "awards"] as const) {
      const lineup = peopleSections(people, variant).filter(section => section.title !== "Founders").flatMap(section => section.people.map(entry => entry.person.name));
      for (const name of ["Jay & Erica McGraw", "Melony & Adam Lewis", "Winston & Cameron Kelly"]) expect(lineup, variant).not.toContain(name);
    }
  });

  it("renders the three couples on both 2026 pages, never the six individual records", () => {
    for (const name of couples) {
      expect(summit).toContain(name);
      expect(awards).toContain(`<h3>${name}</h3>`);
    }
    for (const name of ["Jay McGraw", "Erica McGraw", "Melony Lewis", "Adam Lewis", "Winston Kelly", "Cameron Kelly"]) {
      expect(summit).not.toMatch(new RegExp(`>${name}<`));
      expect(awards).not.toMatch(new RegExp(`>${name}<`));
    }
    // The shared card carries one founder sentence, not the same sentence twice.
    const mcgraws = awardsDisplayPeople(snapshot).find(person => person.name === "Jay & Erica McGraw")!;
    expect(mcgraws.bio).toContain("Erica McGraw is a philanthropist"); // Airtable bio (read Sept 22)
    expect(mcgraws.bio).toContain("Jay McGraw is an Emmy Award–winning television producer"); // Airtable bio (read Sept 23; Airtable wins over the interim line)
    expect(mcgraws.bio).not.toContain("Jay and Erica McGraw are founders of the Not Alone Summit.");
  });

  it("reuses ICF's 2025 couple photos for the Lewises and Kellys; the McGraws show the composite of their Airtable headshots (Sept 28)", () => {
    const people = awardsDisplayPeople(snapshot);
    expect(people.find(person => person.name === "Melony & Adam Lewis")?.image).toBe("/original-2025/e980901947b9a080f2b3.jpg");
    expect(people.find(person => person.name === "Winston & Cameron Kelly")?.image).toBe("/original-2025/b6752c35de4a68857221.jpg");
    expect(people.find(person => person.name === "Jay & Erica McGraw")?.image).toBe("/2026-headshots/portraits/jay-erica-mcgraw.jpg");
    // The no-photo rule still hides non-founders without a photo.
    expect(directoryPeople(snapshot).map(person => person.name)).not.toContain("Jen Whalen");
  });
});
