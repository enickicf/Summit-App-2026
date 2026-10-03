import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { isPokerNight, pokerNight } from "./poker-night-links";

// Owner (Sept 28): "have it on the schedule, but not everywhere." The charity poker tournament's site
// and RSVP may be linked from its own schedule entry and from nowhere else on this website.
describe("the poker night links", () => {
  it("matches the poker entry and nothing else on the schedule", () => {
    for (const title of ["Poker Night", "Charity poker tournament", "POKER NIGHT"]) expect(isPokerNight(title), title).toBe(true);
    for (const title of ["Opening Keynote", "Community Day", "Awards Show", "Registration & Cocktails", "Pickleball"]) {
      expect(isPokerNight(title), title).toBe(false);
    }
  });

  it("appears only in the schedule component", () => {
    const source = (file: string) => readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
    expect(source("components/schedule-browser.tsx")).toContain("isPokerNight");
    // Every other surface of the Summit site must stay clear of it.
    for (const file of ["components/summit-navigation.tsx", "components/site-header.tsx", "components/site-footer.tsx",
      "components/original-event-page.tsx", "app/page.tsx", "app/venue/page.tsx"]) {
      expect(source(file), file).not.toContain(pokerNight.site);
      expect(source(file), file).not.toContain("poker-night-links");
    }
  });
});
