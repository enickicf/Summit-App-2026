import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { event2026Snapshot } from "@not-alone/test-fixtures/event-2026";
import { publishedAwardsProgram } from "@not-alone/domain";
import { OriginalAwardsPage, OriginalSummitPage } from "../components/original-event-page";
import { awardsDisplayPeople } from "./awards-people";
import { withAirtable } from "./airtable-overlay";
import { airtableTalent2026 } from "./airtable-talent-2026";
import { directoryPeople } from "./people";
import { peopleSections } from "./people-sections";
import { portraitAttribution2026 } from "./portrait-overrides";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams()
}));

describe("Rachel Platten Airtable website publication", async () => {
  const record = airtableTalent2026.find(person => person.recordId === "rec0Kv5Ve7GQVY3tQ")!;
  const snapshot = await withAirtable(structuredClone(event2026Snapshot));

  it("preserves Aphrah's confirmed A-Talent grouping and complete public materials", () => {
    expect(record).toMatchObject({
      name: "Rachel Platten",
      status: "Confirmed Attendance",
      groups: ["A-Talent", "9 "],
      hasHeadshot: true,
      headshotFile: "/2026-headshots/portraits/rachel-platten.jpg"
    });
    expect(record.title).toContain("Multi-Platinum Singer-Songwriter");
    expect(record.bio).toContain("Fight Song");
    expect(record.bio).toContain("mental health");
    expect(existsSync(join(process.cwd(), "public", record.headshotFile!))).toBe(true);
  });

  it("places Rachel in the ranked lineup on both Summit and Awards sites", () => {
    const summit = directoryPeople(snapshot);
    const awards = awardsDisplayPeople(snapshot);
    for (const [variant, people] of [["summit", summit], ["awards", awards]] as const) {
      const rachel = people.find(person => person.name === "Rachel Platten");
      expect(rachel, variant).toMatchObject({
        role: record.title,
        bio: record.bio,
        image: record.headshotFile,
        featured: true,
        tier: "A"
      });
      const sections = peopleSections(people, variant);
      expect(sections.flatMap(section => section.people).some(entry => entry.person.name === "Rachel Platten"), variant).toBe(true);
    }
  });

  it("renders Rachel's card and profile link on both full pages", () => {
    const summitHtml = renderToStaticMarkup(<OriginalSummitPage year={2026} snapshot={snapshot} />);
    const awardsHtml = renderToStaticMarkup(<OriginalAwardsPage year={2026} snapshot={snapshot} program={publishedAwardsProgram(snapshot)} />);
    for (const html of [summitHtml, awardsHtml]) {
      expect(html).toContain("Rachel Platten");
      expect(html).toContain("rachel-platten.jpg");
      expect(html).toContain("Emmy Award-Winning, Multi-Platinum Singer-Songwriter");
      expect(html).toContain("Mental Health Advocate");
    }
  });

  it("retains the required Creative Commons attribution", () => {
    expect(portraitAttribution2026("Rachel Platten", record.headshotFile!)).toEqual({
      label: "Gage Skidmore / Wikimedia Commons, CC BY-SA 2.0 (cropped)",
      href: "https://commons.wikimedia.org/wiki/File:Rachel_Platten_(53695417073)_cropped.jpg"
    });
  });
});
