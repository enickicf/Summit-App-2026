import { describe, expect, it } from "vitest";
import { event2026Snapshot } from "@not-alone/test-fixtures/event-2026";
import { isOptionalExperience, scheduleParticipation } from "./experiences";

describe("schedule participation", () => {
  const byTitle = (title: string) => event2026Snapshot.scheduleItems.filter(item => item.title === title);

  it("treats activations as sign-up experiences", () => {
    for (const title of ["Mike's Bikes Community Ride", "Molly's Game Poker Night", "Late Night Pickleball and Sauna", "Wellness Activity", "Pet Partners Therapy"]) {
      expect(byTitle(title).length, title).toBeGreaterThan(0);
      expect(byTitle(title).every(isOptionalExperience), title).toBe(true);
    }
  });

  it("keeps core programming included and restricted items invitation-only", () => {
    for (const title of ["Summit Sessions", "Awards Show", "Evening Talk and Performance", "Lunch"]) {
      expect(byTitle(title).every(item => scheduleParticipation(item) === "included"), title).toBe(true);
    }
    for (const item of event2026Snapshot.scheduleItems.filter(item => /founder/i.test(item.eligibilityScope.label))) {
      expect(scheduleParticipation(item)).toBe("invitation");
    }
  });
});
