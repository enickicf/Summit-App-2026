import { afterEach, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { addStaffGuest } from "./staff-guest";
import { memorySubmissionStore, newSubmission, rsvpForm } from "./store";
import { backfillRsvpConfirmations } from "./rsvp-email";
import { memoryInboxStore, setInboxForTests, withSubmissionInbox } from "./submission-inbox";
import { setLimitStoreForTests } from "./submission-limit";

// Oct 20, 2026 (Cherrial, owner approved): staff add guests Trent sends by WhatsApp / text.
const guest = (over: Record<string, unknown> = {}) => ({ name: "Pat Guest", email: "Pat@Example.com", phone: "(702) 555-0101", organization: "Example Org", professionalRole: "Director", invitedBy: "Trent", list: "vip", events: "both", guestCount: "2", notes: "Wife: Sam Guest", addedBy: "Cherrial", ...over });

afterEach(() => { setLimitStoreForTests(null); setInboxForTests(null); });

describe("staff 'Add a guest'", () => {
  it("stores the guest as an RSVP tagged as added by staff, on the chosen list and events", async () => {
    const store = memorySubmissionStore();
    expect(await addStaffGuest(store, guest())).toEqual({ ok: true, added: ["Awards Show + Nevada Mental Health Day"] });
    const [row] = await store.list("rsvp");
    expect(row).toMatchObject({ name: "Pat Guest", email: "pat@example.com", source: "staff", addedBy: "Cherrial", invitedBy: "Trent", vip: true, attending: "both", communityDay: true, guestCount: 2, attendanceStatus: "attending" });
    expect(rsvpForm(row!)).toBe("VIP");
    expect(await store.list("closingDinner")).toHaveLength(0);
  });

  it("adds a Closing Dinner request too when ticked, or only that for 'Closing Dinner only'", async () => {
    const store = memorySubmissionStore();
    expect(await addStaffGuest(store, guest({ list: "uber-vip", events: "none", closingDinner: "on" }))).toEqual({ ok: true, added: ["Closing Dinner"] });
    expect(await store.list("rsvp")).toHaveLength(0);
    expect((await store.list("closingDinner"))[0]).toMatchObject({ name: "Pat Guest", source: "staff", addedBy: "Cherrial" });
    expect((await addStaffGuest(store, guest({ email: "x@example.com", phone: "", events: "none" }))).ok).toBe(false); // no event at all
  });

  it("warns when the guest is already on file, unless 'Add anyway' is ticked; needs a name, an email and who added them", async () => {
    const store = memorySubmissionStore();
    await addStaffGuest(store, guest());
    const again = await addStaffGuest(store, guest({ email: "other@example.com" })); // same phone
    expect(again).toMatchObject({ ok: false, status: 409 });
    expect((await addStaffGuest(store, guest({ email: "other@example.com", allowDuplicate: "on" }))).ok).toBe(true);
    for (const bad of [{ name: "" }, { email: "" }, { addedBy: "" }]) expect(await addStaffGuest(store, guest({ ...bad, email: bad.email ?? `${randomUUID()}@example.com` }))).toMatchObject({ ok: false, status: 400 });
  });

  it("sends no confirmation email to staff-added guests, even in the one-time catch-up", async () => {
    const store = memorySubmissionStore();
    await addStaffGuest(store, guest());
    await store.add("rsvp", { ...newSubmission({ name: "Form Guest", email: "form@example.com", phone: "", organization: "", professionalRole: "", invitedBy: "", vip: false, partner: "", heardFrom: "", tier: "", attendanceStatus: "attending", communityDay: false, guestCount: 1, notes: "" }) } as never);
    const to: string[] = [];
    const result = await backfillRsvpConfirmations(store, async message => { to.push(message.to); });
    expect(to).toEqual(["form@example.com"]); // the normal RSVP is emailed, the staff-added guest is not
    expect(result.sent).toEqual(["form@example.com"]);
  });

  it("does not block the guest's own RSVP later (the one-per-person limit ignores staff-added records)", async () => {
    const store = memorySubmissionStore(); setLimitStoreForTests(store); setInboxForTests(memoryInboxStore());
    await addStaffGuest(store, guest());
    const POST = withSubmissionInbox("rsvp", async () => Response.json({ ok: true }));
    const body = JSON.stringify({ requestId: randomUUID(), name: "Pat Guest", email: "pat@example.com", phone: "7025550101" });
    expect((await POST(new Request("https://notaloneawards.org/api/rsvp", { method: "POST", headers: { "content-type": "application/json" }, body }))).status).toBe(200);
  });
});
