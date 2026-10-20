import { describe, expect, it } from "vitest";
import { journaledStore, memorySubmissionStore, type RsvpSubmission } from "./store";

const row: RsvpSubmission = { name: "Lisa Lundt", email: "lisa@example.com", phone: "", organization: "", professionalRole: "", attendanceStatus: "attending", communityDay: false, guestCount: 2, notes: "", id: "a1", submittedAt: "2026-09-30T10:00:00.000Z", source: "form" };

describe("append-only journal (owner, Sept 30: never lose a submission)", () => {
  it("copies every write, keeps the copy after a permanent delete, and preserves the primary write if the journal is unavailable", async () => {
    const journal = new Map<string, unknown>();
    let tick = 0;
    const store = journaledStore(memorySubmissionStore(), { setJSON: async (key, value) => { journal.set(key, value); } }, () => new Date(Date.UTC(2026, 8, 30, 10, 0, tick++)));
    await store.add("rsvp", row);
    await store.add("rsvp", { ...row, removedAt: "2026-09-30T11:00:00.000Z", removedReason: "test" });
    await store.add("vipRsvp", { ...row, id: "v1", vip: true, invitedBy: "Ryan" });
    await store.delete("rsvp", row);
    expect(await store.list("rsvp")).toHaveLength(0);
    expect([...journal.keys()].filter(key => key.startsWith("rsvp/"))).toHaveLength(2);   // both versions survive the delete
    expect([...journal.keys()].filter(key => key.startsWith("vipRsvp/"))).toHaveLength(1);
    const failing = journaledStore(memorySubmissionStore(), { setJSON: async () => { throw new Error("journal down"); } });
    await failing.add("rsvp", row);                                                        // a journal failure never loses the real write
    expect(await failing.list("rsvp")).toHaveLength(1);
  }, 20000);
});
