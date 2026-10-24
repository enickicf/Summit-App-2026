import { describe, expect, it } from "vitest";
import { availablePodcastSlots, bookingConflicts, selfReportedTravelWindow } from "./podcast-booking";
import type { PodcastBookingSubmission } from "./staff/store";

const booking = (overrides: Partial<PodcastBookingSubmission> = {}): PodcastBookingSubmission => ({
  id: "11111111-1111-4111-8111-111111111111", submittedAt: "2026-10-24T20:00:00.000Z", source: "form",
  podcast: "The Big Silence", guestName: "Guest One", email: "guest@example.com", format: "short",
  startUtc: "2026-11-03T17:00:00.000Z", endUtc: "2026-11-03T17:20:00.000Z", room: "Room 1", travelVerified: true, arrivalLocal: "",
  ...overrides
});

describe("podcast booking availability", () => {
  it("removes slots before an exact flight arrival plus a three-hour buffer", () => {
    const slots = availablePodcastSlots("short", { arrivalUtc: "2026-11-03T20:00:00.000Z", arrivalDate: "2026-11-03", exact: true }, []);
    expect(slots.every(slot => Date.parse(slot.startUtc) >= Date.parse("2026-11-03T23:00:00.000Z"))).toBe(true);
  });

  it("moves a date-only Nov 3 arrival to Nov 4", () => {
    const slots = availablePodcastSlots("long", { arrivalUtc: null, arrivalDate: "2026-11-03", exact: false }, []);
    expect(slots.length).toBeGreaterThan(0);
    expect(slots.every(slot => slot.startUtc.startsWith("2026-11-04"))).toBe(true);
  });

  it("prevents room, guest and podcast overlaps", () => {
    const current = booking();
    expect(bookingConflicts({ ...current, room: "Room 1", guestName: "Another", podcast: "Another show" }, [current])).toBe(true);
    expect(bookingConflicts({ ...current, room: "Room 2", guestName: "Guest One", podcast: "Another show" }, [current])).toBe(true);
    expect(bookingConflicts({ ...current, room: "Room 2", guestName: "Another", podcast: "The Big Silence" }, [current])).toBe(true);
  });

  it("treats a guest-entered time as Las Vegas local time", () => {
    expect(selfReportedTravelWindow("2026-11-03T14:30")?.arrivalUtc).toBe("2026-11-03T22:30:00.000Z");
  });
});
