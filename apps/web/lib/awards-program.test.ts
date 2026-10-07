import { describe, expect, it } from "vitest";
import { event2026Snapshot } from "@not-alone/test-fixtures/event-2026";
import { publishedAwardsProgram } from "@not-alone/domain";
import { awardsPromotionalProgram, publicAwardsShow, reconcileAwardsProgram } from "./awards-program";

const body = publishedAwardsProgram(event2026Snapshot)!.body;

describe("Awards copy and canonical schedule", () => {
  it("applies the Oct 7 owner times only to the legacy doors and pre-show notes and hides pending promotional boilerplate", () => {
    const result = awardsPromotionalProgram(body, event2026Snapshot)!;
    // Aphrah (Oct 7): Doors 6:30, Pre-Show 7:30-8:00, Awards Show 8:00-10:00; no Nevada Day / Community Day line.
    expect(result).toContain("Doors Open: 6:30 PM\nPre-Show: 7:30-8:00 PM\nAwards Show: 8:00 PM-10:00 PM");
    expect(result).not.toMatch(/Nevada Day|Community Day|5:30 PM/);
    expect(result).not.toContain("end time to be confirmed");
    expect(result).not.toContain("complete show lineup");
    expect(event2026Snapshot.contentPages.find(page => page.slug === "schedule-pending-2026-11-02")!.body).toContain("Pre-Show: 7:30 PM");
  });

  it("does not override a subsequently published pre-show session or transfer the correction to another day", () => {
    const show = publicAwardsShow(event2026Snapshot)!;
    const snapshot = { ...event2026Snapshot, scheduleItems: [...event2026Snapshot.scheduleItems, { ...show, id: "pre-show-test", title: "Pre-Show", startUtc: "2026-11-03T03:15:00Z", endUtc: "2026-11-03T03:45:00Z" }] };
    expect(awardsPromotionalProgram(body, snapshot)).toContain("Pre-Show: 7:15 PM-7:45 PM");
    const moved = { ...event2026Snapshot, scheduleItems: event2026Snapshot.scheduleItems.map(item => item.title === "Awards Show" ? { ...item, startUtc: "2026-11-04T04:00:00Z", endUtc: "2026-11-04T06:00:00Z" } : item) };
    expect(awardsPromotionalProgram(body, moved)).not.toContain("Nevada Day");
  });
  it("makes an overnight end date explicit without changing the published instants", () => {
    const snapshot = { ...event2026Snapshot, scheduleItems: event2026Snapshot.scheduleItems.map(item => item.title === "Awards Show" ? { ...item, startUtc: "2026-11-03T07:00:00Z", endUtc: "2026-11-03T09:00:00Z" } : item) };
    const result = reconcileAwardsProgram(body, snapshot)!;
    expect(result).toContain("Awards Show: 11:00 PM-1:00 AM (Tuesday, November 3, 2026)");
    expect(snapshot.scheduleItems.find(item => item.title === "Awards Show")?.endUtc).toBe("2026-11-03T09:00:00Z");
  });

  it("retains editorial copy and uses published incomplete-timing notes without inventing durations", () => {
    const result = reconcileAwardsProgram(body, event2026Snapshot);
    expect(result).toContain("Awards Show: 8:00 PM-10:00 PM");
    expect(result).toContain("Doors Open: 6:30 PM; end time to be confirmed.");
    expect(result).toContain("Pre-Show: 7:30 PM; end time to be confirmed.");
    expect(result).toContain("complete show lineup will be announced when confirmed");
  });

  it("does not advertise a canceled show even when its program remains published", () => {
    const snapshot = { ...event2026Snapshot, scheduleItems: event2026Snapshot.scheduleItems.map(item => item.title === "Awards Show" ? { ...item, status: "canceled" as const } : item) };
    expect(publicAwardsShow(snapshot)?.status).toBe("canceled");
    expect(reconcileAwardsProgram(body, snapshot)).toBeNull();
  });

  it("updates an independently rescheduled show and never moves doors or red carpet implicitly", () => {
    const snapshot = { ...event2026Snapshot, scheduleItems: event2026Snapshot.scheduleItems.map(item => item.title === "Awards Show" ? { ...item, startUtc: "2026-11-04T05:00:00Z", endUtc: "2026-11-04T07:00:00Z" } : item) };
    const result = reconcileAwardsProgram(body, snapshot)!;
    expect(result).toContain("Tuesday, November 3, 2026");
    expect(result).toContain("Awards Show: 9:00 PM-11:00 PM");
    expect(result).toContain("Red Carpet: Monday, November 2, 2026");
    expect(result).toContain("Doors Open: Details to be confirmed");
    expect(result).not.toContain("Doors Open: 6:30");
    expect(result).not.toContain("Awards Show: 8:00");
  });

  it("does not restore withdrawn or private timeline items from old copy", () => {
    const snapshot = { ...event2026Snapshot, scheduleItems: event2026Snapshot.scheduleItems.filter(item => item.title !== "Red Carpet") };
    expect(reconcileAwardsProgram(body, snapshot)).toContain("Red Carpet: Details to be confirmed");
    expect(reconcileAwardsProgram(body, null)).toBeNull();
    expect(reconcileAwardsProgram(body, { ...snapshot, scheduleItems: [] })).toBeNull();
    expect(publicAwardsShow({ ...snapshot, scheduleItems: snapshot.scheduleItems.map(item => ({ ...item, published: false })) })).toBeUndefined();
  });
});
