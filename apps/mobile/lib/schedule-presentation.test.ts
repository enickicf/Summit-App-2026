import { describe, expect, it } from "vitest";
import { event2026Snapshot } from "@not-alone/test-fixtures/event-2026";
import { displayLocation, isFoundersOnly, publicPendingProgramBlocks, splitClock } from "./schedule-presentation";

describe("mobile schedule presentation", () => {
  it("keeps start-only notes without inventing an end and drops the generic caveat", () => {
    const blocks = publicPendingProgramBlocks("Tennis: 10:00 AM; end time to be confirmed\n\nLocations and access details to be confirmed.");
    expect(blocks).toEqual([{ title: "Tennis", start: "10:00 AM", detail: "" }]);
  });

  it("keeps any other supplied detail exactly", () => {
    expect(publicPendingProgramBlocks("Golf: 7:30 AM; shotgun start")).toEqual([{ title: "Golf", start: "7:30 AM", detail: "shotgun start" }]);
  });

  it("labels only founders-only access and softens unconfirmed rooms", () => {
    const founders = event2026Snapshot.scheduleItems.filter(isFoundersOnly);
    expect(founders.every(item => /founder/i.test(item.eligibilityScope.label) || item.eligibilityScope.id === "founders")).toBe(true);
    expect(displayLocation("Location to be confirmed")).toBe("To be confirmed");
    expect(displayLocation("Encore Theater")).toBe("Encore Theater");
  });

  it("splits a clock time for the time column", () => {
    expect(splitClock("2026-11-02T22:00:00.000Z", "America/Los_Angeles")).toEqual({ time: "2:00", period: "PM" });
  });
});
