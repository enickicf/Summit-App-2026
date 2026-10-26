import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { PodcastStaffPortal } from "../../../../components/staff-portal";
import { availablePodcastSlots } from "../../../../lib/podcast-booking";
import { memorySubmissionStore, type PodcastBookingSubmission } from "../../../../lib/staff/store";
import { mutatePodcastBooking } from "./route";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));

const booking = (overrides: Partial<PodcastBookingSubmission> = {}): PodcastBookingSubmission => ({
  id: "11111111-1111-4111-8111-111111111111",
  submittedAt: "2026-10-24T20:00:00.000Z",
  source: "form",
  podcast: "The Big Silence",
  guestName: "Guest One",
  email: "guest@example.com",
  format: "long",
  startUtc: "2026-11-02T18:00:00.000Z",
  endUtc: "2026-11-02T19:15:00.000Z",
  room: "Room 1",
  travelVerified: true,
  arrivalLocal: "",
  ...overrides
});

describe("staff podcast booking controls", () => {
  it("reschedules a long-form interview using a canonical available room and time", async () => {
    const store = memorySubmissionStore({ podcastBooking: [booking()] });
    const result = await mutatePodcastBooking(store, booking().id, "reschedule", "2026-11-02T19:30:00.000Z|Room 2");

    expect(result).toMatchObject({ ok: true, action: "rescheduled", record: { startUtc: "2026-11-02T19:30:00.000Z", endUtc: "2026-11-02T20:45:00.000Z", room: "Room 2" } });
    expect(await store.list("podcastBooking")).toEqual([expect.objectContaining({ id: booking().id, startUtc: "2026-11-02T19:30:00.000Z", room: "Room 2" })]);
  });

  it("rejects a room and time occupied by another interview", async () => {
    const occupied = booking({ id: "22222222-2222-4222-8222-222222222222", guestName: "Guest Two", startUtc: "2026-11-02T19:30:00.000Z", endUtc: "2026-11-02T20:45:00.000Z", room: "Room 2" });
    const store = memorySubmissionStore({ podcastBooking: [booking(), occupied] });
    const result = await mutatePodcastBooking(store, booking().id, "reschedule", "2026-11-02T19:30:00.000Z|Room 2");

    expect(result).toMatchObject({ ok: false, status: 409 });
    expect((await store.list("podcastBooking")).find(row => row.id === booking().id)?.startUtc).toBe("2026-11-02T18:00:00.000Z");
  });

  it("rejects a time when the same guest is booked in another room", async () => {
    const sameGuest = booking({ id: "33333333-3333-4333-8333-333333333333", startUtc: "2026-11-02T19:30:00.000Z", endUtc: "2026-11-02T20:45:00.000Z", room: "Room 3" });
    const store = memorySubmissionStore({ podcastBooking: [booking(), sameGuest] });
    const result = await mutatePodcastBooking(store, booking().id, "reschedule", "2026-11-02T19:30:00.000Z|Room 2");

    expect(result).toMatchObject({ ok: false, status: 409, error: "That guest already has an interview at this time. Choose another option." });
    expect((await store.list("podcastBooking")).find(row => row.id === booking().id)?.startUtc).toBe("2026-11-02T18:00:00.000Z");
  });

  it("removes a booking and immediately returns its room to public availability", async () => {
    const original = booking();
    const store = memorySubmissionStore({ podcastBooking: [original] });
    expect(availablePodcastSlots("long", null, await store.list("podcastBooking")).find(slot => slot.startUtc === original.startUtc)?.rooms).not.toContain("Room 1");

    expect(await mutatePodcastBooking(store, original.id, "remove")).toMatchObject({ ok: true, action: "removed" });
    expect(await store.list("podcastBooking")).toEqual([]);
    expect(availablePodcastSlots("long", null, await store.list("podcastBooking")).find(slot => slot.startUtc === original.startUtc)?.rooms).toContain("Room 1");
  });

  it("renders reschedule and removal controls in the podcast portal", () => {
    const html = renderToStaticMarkup(<PodcastStaffPortal bookings={[booking()]} generatedAt="2026-10-26T18:00:00.000Z" />);
    expect(html).toContain('action="/api/staff/podcast-bookings"');
    expect(html).toContain("Save time");
    expect(html).toContain("Remove booking");
    expect(html).toContain("Room 1 (current)");
  });
});
