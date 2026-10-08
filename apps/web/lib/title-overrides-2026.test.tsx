import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { event2026Snapshot } from "@not-alone/test-fixtures/event-2026";
import { publishedAwardsProgram } from "@not-alone/domain";
import { OriginalAwardsPage, OriginalSummitPage } from "../components/original-event-page";
import { awardsDisplayPeople, philanthropistDisplayPeople } from "./awards-people";
import { directoryPeople } from "./people";
import { airtableOverlay, withAirtable } from "./airtable-overlay";
import { airtableTalent2026 } from "./airtable-talent-2026";
import { peopleSections } from "./people-sections";
import { titleOverride2026, titleOverrides2026 } from "./title-overrides-2026";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }), usePathname: () => "/", useSearchParams: () => new URLSearchParams() }));

const ryanTitle = "Founder, Inspiring Children Foundation and Not Alone";

// Ryan Wolfington (Oct 8, 2026): "Take off 'co-founder' for Not Alone... I would put 'Founder, Inspiring Children
// Foundation and Not Alone'."
describe("owner title override (Ryan, Oct 8)", () => {
  it("is keyed by the normalized name and covers Ryan only", () => {
    expect(titleOverrides2026).toEqual(new Map([["ryan wolfington", ryanTitle]]));
    expect(titleOverride2026("Ryan Wolfington")).toBe(ryanTitle);
    expect(titleOverride2026("  RYAN  Wolfington ")).toBe(ryanTitle);
    expect(titleOverride2026("Isabella Wolfington")).toBeUndefined();
  });

  it("wins over Airtable's Title column wherever his title shows (Summit and Awards cards, Partners, profile, overlay)", async () => {
    const record = airtableTalent2026.find(person => person.name === "Ryan Wolfington")!;
    expect(record.title).toContain("Co Founder, Not Alone Challenge"); // Airtable still reads the old title
    const snapshot = await withAirtable(event2026Snapshot);
    expect(snapshot.speakers.find(speaker => speaker.name === "Ryan Wolfington")?.role).toBe(ryanTitle);
    expect(airtableOverlay(snapshot)?.people?.get("ryan wolfington")?.title).toBe(ryanTitle);
    const summit = directoryPeople(snapshot);
    const awards = awardsDisplayPeople(snapshot);
    expect(summit.find(person => person.name === "Ryan Wolfington")?.role).toBe(ryanTitle); // profile and Summit cards read this
    expect(awards.find(person => person.name === "Ryan Wolfington")?.role).toBe(ryanTitle);
    expect(philanthropistDisplayPeople(awards).find(person => person.name === "Ryan Wolfington")?.role).toBe(ryanTitle); // Partners page
    for (const variant of ["summit", "awards"] as const) {
      const founders = peopleSections(variant === "summit" ? summit : awards, variant).find(section => section.title === "Founders")!;
      expect(founders.people.find(entry => entry.person.name === "Ryan Wolfington")?.role, variant).toBe(ryanTitle);
    }
    const summitHtml = renderToStaticMarkup(<OriginalSummitPage year={2026} snapshot={snapshot} />);
    const awardsHtml = renderToStaticMarkup(<OriginalAwardsPage year={2026} snapshot={snapshot} program={publishedAwardsProgram(snapshot)} />);
    for (const html of [summitHtml, awardsHtml]) {
      expect(html).toContain(ryanTitle);
      expect(html).not.toContain("Co Founder, Not Alone Challenge");
      expect(html).not.toContain("President, Jewel Inc.");
    }
  });

  it("leaves everyone else's Airtable title alone", async () => {
    const snapshot = await withAirtable(event2026Snapshot);
    expect(snapshot.speakers.find(speaker => speaker.name === "Jewel")?.role).toBe(airtableTalent2026.find(person => person.name === "Jewel")!.title);
  });
});
