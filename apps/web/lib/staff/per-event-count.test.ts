import { afterEach, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { memoryInboxStore, setInboxForTests, withSubmissionInbox } from "./submission-inbox";
import { setLimitStoreForTests } from "./submission-limit";
import { guestDetailsMissing, listAllRsvps, memorySubmissionStore, newSubmission, rsvpTotals, type RsvpSubmission } from "./store";

// Oct 21, 2026 (Cherrial, owner approved): every guest's Awards request stays counted when they later send the Nevada
// Mental Health Day-only form; each event is counted on its own; repeats for the same event count once; parties sent
// without their guests' details stay on file as a follow-up.
const base = { phone: "", organization: "", professionalRole: "", invitedBy: "", vip: false, partner: "" as const, heardFrom: "" as const, tier: "" as const, attendanceStatus: "attending" as const, communityDay: false, notes: "" };
const rsvp = (email: string, at: string, attending: "awards" | "both" | "community-day", guestCount: number, over: Partial<RsvpSubmission> = {}): RsvpSubmission =>
  ({ ...newSubmission({ ...base, name: email.split("@")[0]!, email, attending, communityDay: attending !== "awards", guestCount }), submittedAt: at, ...over }) as RsvpSubmission;

const post = (payload: unknown) => new Request("https://notaloneawards.org/api/rsvp", { method: "POST", headers: { "content-type": "application/json", origin: "https://notaloneawards.org" }, body: JSON.stringify(payload) });
function setup() {
  const store = memorySubmissionStore(); setLimitStoreForTests(store); setInboxForTests(memoryInboxStore());
  const handler = async (request: Request) => {
    const body = await request.json() as Record<string, unknown>;
    await store.add("rsvp", { ...newSubmission({ ...base, ...body } as Parameters<typeof newSubmission>[0]), id: String(body.requestId) } as never);
    return Response.json({ ok: true });
  };
  return { store, POST: withSubmissionInbox("rsvp", handler) };
}
const send = (attending: string, guestCount = 1, over: Record<string, unknown> = {}) => ({ requestId: randomUUID(), requestedAt: new Date().toISOString(), name: "Pat Guest", email: "pat@example.com", phone: "7025550101", attending, communityDay: attending !== "awards" ? "on" : "", guestCount, ...over });

afterEach(() => { setLimitStoreForTests(null); setInboxForTests(null); });

describe("Awards and Nevada Mental Health Day are counted separately (Cherrial, Oct 21)", () => {
  it("keeps an earlier Awards request counted after a later Nevada Mental Health Day-only form", () => {
    const totals = rsvpTotals([
      rsvp("vanessa@example.com", "2026-10-01T10:00:00Z", "awards", 10),
      rsvp("vanessa@example.com", "2026-10-14T10:00:00Z", "community-day", 3)
    ]);
    expect(totals.ticketsRequested).toBe(10);
    expect(totals.communityDayTickets).toBe(3);
    expect(totals.communityDayOnlyGuests).toBe(0); // she is coming to the Awards Show too
  });

  it("lets a newer request for the same event update the count without double counting", () => {
    const totals = rsvpTotals([
      rsvp("joe@example.com", "2026-10-01T10:00:00Z", "both", 10),
      rsvp("joe@example.com", "2026-10-10T10:00:00Z", "awards", 4),
      rsvp("joe@example.com", "2026-10-19T10:00:00Z", "community-day", 2)
    ]);
    expect(totals.ticketsRequested).toBe(4); // newest Awards request
    expect(totals.communityDayTickets).toBe(2); // newest Community Day request
    expect(totals.uniqueGuests).toBe(1);
  });

  it("keeps parties without their guests' details counted and flags them for follow-up", () => {
    const old = rsvp("old@example.com", "2026-09-29T10:00:00Z", "awards", 4);
    const complete = rsvp("new@example.com", "2026-10-15T10:00:00Z", "awards", 2, { guests: [{ name: "Sam Guest", email: "sam@example.com", phone: "7025550102" }] } as never);
    const totals = rsvpTotals([old, complete]);
    expect(totals.ticketsRequested).toBe(6);
    expect(guestDetailsMissing(old)).toBe(true);
    expect(guestDetailsMissing(complete)).toBe(false);
    expect(totals.guestDetailsMissingRequests).toBe(1);
    expect(totals.guestDetailsMissingTickets).toBe(4);
  });
});

describe("a new request only replaces an older one for the same event(s) (Cherrial, Oct 21)", () => {
  it("does not retire an Awards request when the guest sends the Nevada Mental Health Day-only form", async () => {
    const { store, POST } = setup();
    expect((await POST(post(send("awards", 2)))).status).toBe(200);
    expect((await POST(post(send("community-day", 1)))).status).toBe(200);
    const active = (await store.list("rsvp")).filter(row => !row.removedAt);
    expect(active).toHaveLength(2);
    expect(rsvpTotals(active).ticketsRequested).toBe(2);
  });

  it("still replaces an older request that the new one fully covers", async () => {
    const { store, POST } = setup();
    await POST(post(send("awards", 2)));
    await POST(post(send("both", 3)));
    const rows = await store.list("rsvp");
    expect(rows.filter(row => !row.removedAt)).toHaveLength(1);
    expect(rows.find(row => row.removedAt)).toMatchObject({ guestCount: 2 });
  });

  it("counts the three-try limit per event: using the Nevada Mental Health Day form leaves the Awards tries", async () => {
    const { POST } = setup();
    for (let i = 0; i < 3; i++) expect((await POST(post(send("awards", 1, { notes: `try ${i}` })))).status).toBe(200);
    expect((await POST(post(send("community-day", 1)))).status).toBe(200);
    expect((await POST(post(send("awards", 1)))).status).toBe(409);
  });

  it("brings back a request that was retired by a newer request for a different event (Oct 21 morning release)", async () => {
    const store = memorySubmissionStore();
    const earlier = rsvp("kim@example.com", "2026-09-29T15:29:00Z", "both", 10);
    const newer = rsvp("kim@example.com", "2026-10-21T17:35:00Z", "awards", 1);
    const fullyCovered = rsvp("lee@example.com", "2026-10-01T10:00:00Z", "awards", 2);
    const coveringNewer = rsvp("lee@example.com", "2026-10-21T10:00:00Z", "both", 3);
    const reason = "Replaced by an updated submission (October 21)";
    await store.add("rsvp", { ...earlier, removedAt: "2026-10-21T17:35:05Z", removedReason: reason, replacedBy: newer.id } as never);
    await store.add("rsvp", newer);
    await store.add("rsvp", { ...fullyCovered, removedAt: "2026-10-21T10:00:05Z", removedReason: reason, replacedBy: coveringNewer.id } as never);
    await store.add("rsvp", coveringNewer);
    const rows = await listAllRsvps(store);
    const kim = rows.find(row => row.id === earlier.id)!;
    expect(kim.removedAt).toBeUndefined();
    expect((kim as unknown as { restoredReason: string }).restoredReason).toMatch(/different event/);
    expect(rows.find(row => row.id === fullyCovered.id)!.removedAt).toBeTruthy(); // a covering update stands
    expect((await store.list("rsvp")).find(row => row.id === earlier.id)!.removedAt).toBeUndefined(); // saved, not just shown
    const totals = rsvpTotals(rows.filter(row => !row.removedAt));
    expect(totals.ticketsRequested).toBe(1 + 3); // Kim's newest Awards request + Lee's
    expect(totals.communityDayTickets).toBe(10 + 3); // Kim's Community Day request stays
  });
});
