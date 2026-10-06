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
// Owner, Oct 5: couples read with "and" ("Melony and Adam Lewis"); the McGraws are no longer a couple card but
// two individual Founder name cards (no photo of the two of them exists).
describe("founder couples added Sept 22", async () => {
  const couples = ["Melony and Adam Lewis", "Winston and Cameron Kelly"];
  const individuals = ["Melony Lewis", "Adam Lewis", "Winston Kelly", "Cameron Kelly"];
  const mcgraws = ["Jay McGraw", "Erica McGraw"];
  const snapshot = await withAirtable(event2026Snapshot);
  const summit = renderToStaticMarkup(<OriginalSummitPage year={2026} snapshot={snapshot} />);
  const awards = renderToStaticMarkup(<OriginalAwardsPage year={2026} snapshot={snapshot} program={publishedAwardsProgram(snapshot)} />);

  it("lists every Airtable founder regardless of invitation status: the Lewises and Kellys as one couple card each, the McGraws individually", () => {
    const people = awardsDisplayPeople(snapshot);
    const names = people.map(person => person.name);
    for (const name of [...couples, ...mcgraws]) expect(names).toContain(name);
    for (const name of [...individuals, "Jay & Erica McGraw", "Jay and Erica McGraw", "Melony & Adam Lewis", "Winston & Cameron Kelly"]) expect(names).not.toContain(name);
    for (const variant of ["summit", "awards"] as const) {
      const founders = peopleSections(people, variant).find(section => section.title === "Founders")!.people.map(entry => entry.person.name);
      for (const name of [...couples, ...mcgraws]) expect(founders, variant).toContain(name);
    }
    // Not in the Summit lineup or the Awards lineup: founders only.
    for (const variant of ["summit", "awards"] as const) {
      const lineup = peopleSections(people, variant).filter(section => section.title !== "Founders").flatMap(section => section.people.map(entry => entry.person.name));
      for (const name of [...couples, ...mcgraws]) expect(lineup, variant).not.toContain(name);
    }
  });

  it("renders the two couples and the two McGraws on both 2026 pages, never the four individual couple records", () => {
    for (const name of [...couples, ...mcgraws]) {
      expect(summit).toContain(`>${name}<`);
      expect(awards).toContain(`<h3>${name}</h3>`);
    }
    for (const name of [...individuals, "Jay &amp; Erica McGraw", "Jay and Erica McGraw"]) {
      expect(summit).not.toMatch(new RegExp(`>${name}<`));
      expect(awards).not.toMatch(new RegExp(`>${name}<`));
    }
    // Each McGraw keeps their own Airtable bio; no shared founder sentence.
    const people = awardsDisplayPeople(snapshot);
    expect(people.find(person => person.name === "Erica McGraw")?.bio).toContain("Erica McGraw is a philanthropist"); // Airtable bio (read Sept 22)
    expect(people.find(person => person.name === "Jay McGraw")?.bio).toContain("Jay McGraw is an Emmy Award–winning television producer"); // Airtable bio (read Sept 23; Airtable wins over the interim line)
    for (const name of mcgraws) expect(people.find(person => person.name === name)?.bio).not.toContain("Jay and Erica McGraw are founders of the Not Alone Summit.");
  });

  it("reuses ICF's 2025 couple photos for the Lewises and Kellys; the McGraws are name cards without a photo (owner, Oct 5)", () => {
    const people = awardsDisplayPeople(snapshot);
    expect(people.find(person => person.name === "Melony and Adam Lewis")?.image).toBe("/original-2025/e980901947b9a080f2b3.jpg");
    expect(people.find(person => person.name === "Winston and Cameron Kelly")?.image).toBe("/original-2025/b6752c35de4a68857221.jpg");
    for (const name of mcgraws) expect(people.find(person => person.name === name)?.image).toBeUndefined();
    expect(awards).not.toContain("jay-erica-mcgraw");
    // The no-photo rule still hides non-founders without a photo.
    expect(directoryPeople(snapshot).map(person => person.name)).not.toContain("Jen Whalen");
  });
});
