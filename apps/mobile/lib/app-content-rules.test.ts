import { describe, expect, it } from "vitest";
import { event2026Snapshot } from "@not-alone/test-fixtures/event-2026";
import { applyAppContentRules } from "./app-content-rules";

describe("app-only content rules", () => {
  const shaped = applyAppContentRules(event2026Snapshot);

  it("drops Mike's Bikes from the app's schedule and notes", () => {
    expect(shaped.scheduleItems.some(item => /mike's bikes/i.test(item.title))).toBe(false);
    expect(shaped.contentPages.some(page => /mike's bikes/i.test(page.body))).toBe(false);
    expect(shaped.scheduleItems.some(item => item.title === "Molly's Game Poker Night")).toBe(true);
  });

  it("presents only talent, founders and producers as guests", () => {
    const names = shaped.speakers.map(speaker => speaker.name);
    for (const excluded of ["Bianca Mok", "Harvey Stern", "Salina Raymond", "Alexa Price", "Taylor Perry", "Allison Elbl", "Cathy Olson", "Sophie Novak", "Nick Dana", "Kase Murray"]) {
      expect(names).not.toContain(excluded);
    }
    for (const kept of ["Steve Wozniak", "Jewel", "Ray Lewis", "Sarah Gilman", "Trevor Short", "Aphrah Brokaw", "Trent Alenik", "Darryl McDaniels (DMC)"]) {
      expect(names).toContain(kept);
    }
  });

  it("leaves the shared published snapshot untouched", () => {
    expect(event2026Snapshot.scheduleItems.some(item => /mike's bikes/i.test(item.title))).toBe(true);
  });
});
