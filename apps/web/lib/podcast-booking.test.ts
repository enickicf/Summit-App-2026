import { describe, expect, it } from "vitest";
import { availablePodcastSlots, bookingConflicts, latestTravelWindow, selfReportedTravelWindow, shortBookingConflicts } from "./podcast-booking";
import type { PodcastBookingSubmission } from "./staff/store";

const booking = (overrides: Partial<PodcastBookingSubmission> = {}): PodcastBookingSubmission => ({
  id: "11111111-1111-4111-8111-111111111111", submittedAt: "2026-10-24T20:00:00.000Z", source: "form",
  podcast: "The Big Silence", guestName: "Guest One", email: "guest@example.com", format: "short",
  startUtc: "2026-11-03T17:00:00.000Z", endUtc: "2026-11-03T17:20:00.000Z", room: "Room 1", travelVerified: true, arrivalLocal: "",
  ...overrides
});

describe("podcast booking availability", () => {
  it("removes slots before an exact flight arrival plus a three-hour buffer", () => {
    const slots = availablePodcastSlots("long", { arrivalUtc: "2026-11-03T20:00:00.000Z", arrivalDate: "2026-11-03", exact: true }, []);
    expect(slots.every(slot => Date.parse(slot.startUtc) >= Date.parse("2026-11-03T23:00:00.000Z"))).toBe(true);
  });

  it("does not assign a clock time to short-form interviews", () => {
    const slots = availablePodcastSlots("short", { arrivalUtc: "2026-11-02T16:00:00.000Z", arrivalDate: "2026-11-02", exact: true }, []);
    expect(slots).toEqual([]);
  });

  it("starts full-length interview availability at 10 AM Las Vegas time", () => {
    const slots = availablePodcastSlots("long", { arrivalUtc: "2026-11-02T16:00:00.000Z", arrivalDate: "2026-11-02", exact: true }, []);
    expect(slots[0]?.startUtc).toBe("2026-11-03T18:00:00.000Z");
    expect(slots.every(slot => new Date(slot.startUtc).getUTCHours() >= 18)).toBe(true);
  });

  it("moves a date-only Nov 3 arrival to Nov 4", () => {
    const slots = availablePodcastSlots("long", { arrivalUtc: null, arrivalDate: "2026-11-03", exact: false }, []);
    expect(slots.length).toBeGreaterThan(0);
    expect(slots.every(slot => slot.startUtc.startsWith("2026-11-04"))).toBe(true);
  });

  it("uses the latest arrival across the interview guest and podcast hosts", () => {
    expect(latestTravelWindow([
      { arrivalUtc: "2026-11-03T18:00:00.000Z", arrivalDate: "2026-11-03", exact: true },
      { arrivalUtc: "2026-11-03T22:00:00.000Z", arrivalDate: "2026-11-03", exact: true },
      null
    ])?.arrivalUtc).toBe("2026-11-03T22:00:00.000Z");
    expect(latestTravelWindow([null, null])).toBeNull();
  });

  it("prevents duplicate short-form requests without assigning a time or room", () => {
    expect(shortBookingConflicts({ format: "short", podcast: "The Big Silence", guestName: "Guest One" }, [booking()])).toBe(true);
  });

  it("allows simultaneous interviews in separate rooms while preventing room and guest overlaps", () => {
    const current = booking();
    expect(bookingConflicts({ startUtc: current.startUtc, endUtc: current.endUtc, room: "Room 1", guestName: "Another" }, [current])).toBe(true);
    expect(bookingConflicts({ startUtc: current.startUtc, endUtc: current.endUtc, room: "Room 2", guestName: "Guest One" }, [current])).toBe(true);
    expect(bookingConflicts({ startUtc: current.startUtc, endUtc: current.endUtc, room: "Room 2", guestName: "Another" }, [current])).toBe(false);
  });

  it("keeps a time visible while at least one of the three rooms is available", () => {
    const startUtc = "2026-11-03T18:00:00.000Z", endUtc = "2026-11-03T19:15:00.000Z";
    const occupied = [booking({ startUtc, endUtc, room: "Room 1" }), booking({ id: "22222222-2222-4222-8222-222222222222", startUtc, endUtc, room: "Room 2", guestName: "Guest Two", podcast: "Another show" })];
    const slot = availablePodcastSlots("long", null, occupied).find(item => item.startUtc === startUtc);
    expect(slot?.rooms).toEqual(["Room 3"]);
  });

  it("treats a guest-entered time as Las Vegas local time", () => {
    expect(selfReportedTravelWindow("2026-11-03T14:30")?.arrivalUtc).toBe("2026-11-03T22:30:00.000Z");
  });
});
