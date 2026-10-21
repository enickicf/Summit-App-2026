import { afterEach, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { memoryInboxStore, setInboxForTests, unresolvedFailures, withSubmissionInbox } from "./submission-inbox";
import { isUnlimitedSubmitter, setLimitStoreForTests } from "./submission-limit";
import { memorySubmissionStore, newSubmission } from "./store";
import { handleRsvpPost } from "../../app/api/rsvp/route";
import { eventWaiverVersion } from "../event-waiver";

// Owner (Oct 20, 2026): one submission per person per form; ambassador@, music@, the owner's and Cherrial's phone
// numbers may submit as many tests as they want.
const post = (endpoint: string, payload: unknown) => new Request(`https://notaloneawards.org/api/${endpoint}`, { method: "POST", headers: { "content-type": "application/json", origin: "https://notaloneawards.org" }, body: JSON.stringify(payload) });
const guest = (over: Record<string, unknown> = {}) => ({ requestId: randomUUID(), requestedAt: new Date().toISOString(), name: "Pat Guest", email: "pat@example.com", phone: "(702) 555-0101", ...over });

// A handler that stores what it gets, the way the real RSVP handler does (id = requestId).
function setup(kind: "rsvp" | "closingDinner" = "rsvp") {
  const store = memorySubmissionStore(); setLimitStoreForTests(store);
  const inbox = memoryInboxStore(); setInboxForTests(inbox);
  const handler = async (request: Request) => {
    const body = await request.json() as Record<string, string>;
    const existing = (await store.list(kind as "rsvp")).find(record => record.id === body.requestId);
    if (!existing) await store.add(kind as "rsvp", { ...newSubmission(body), id: body.requestId } as never);
    return Response.json({ ok: true }, { status: 200 });
  };
  return { store, inbox, handler };
}

afterEach(() => { setLimitStoreForTests(null); setInboxForTests(null); delete process.env.SUBMISSION_TEST_ALLOWLIST; });

describe("one submission per person per form (owner, Oct 20)", () => {
  it("lets a person send an RSVP three times, each new one replacing the last, and refuses a fourth (owner, Oct 20)", async () => {
    const { store, inbox, handler } = setup();
    const POST = withSubmissionInbox("rsvp", handler);
    for (let i = 0; i < 3; i++) expect((await POST(post("rsvp", guest({ notes: `try ${i + 1}` })))).status).toBe(200);
    const rows = await store.list("rsvp");
    expect(rows).toHaveLength(3);
    const active = rows.filter(row => !row.removedAt);
    expect(active).toHaveLength(1); // one up-to-date RSVP per person
    expect(active[0]).toMatchObject({ notes: "try 3" });
    expect((active[0] as unknown as { replaces: string[] }).replaces).toHaveLength(2);
    const ids = new Set(rows.map(row => row.id));
    expect(rows.filter(row => row.removedAt).every(row => /^Replaced by an updated submission/.test(String(row.removedReason)) && ids.has((row as unknown as { replacedBy: string }).replacedBy))).toBe(true);
    const fourth = await POST(post("rsvp", guest({ phone: "7025559999", name: "Pat Again" })));
    expect(fourth.status).toBe(409);
    expect((await fourth.json()).error).toMatch(/already have your RSVP .*music@inspiringchildren\.org/);
    expect((await POST(post("rsvp", guest({ email: "other@example.com", phone: "702-555-0101" })))).status).toBe(409); // same phone
    expect(await store.list("rsvp")).toHaveLength(3);
    const failed = await inbox.list("failed/");
    expect(failed.every(entry => entry.reason === "already-submitted")).toBe(true);
    expect(unresolvedFailures(failed, [])).toHaveLength(0);
  });

  it("replaces the earlier RSVP with the real RSVP handler (browser-clock dates), keeping the original first date", async () => {
    const store = memorySubmissionStore(); setLimitStoreForTests(store); setInboxForTests(memoryInboxStore());
    const POST = withSubmissionInbox("rsvp", (request: Request) => handleRsvpPost(request, store, async () => {}, null));
    const accepted = (name: string) => ({ status: "accepted" as const, version: eventWaiverVersion, signature: name, adultSelf: true as const, liabilityAccepted: true as const, mediaAccepted: true as const, ticketTextConsent: true as const, electronicConsent: true as const });
    const rsvp = (requestedAt: string, guestCount: number, guests: unknown[]) => ({ requestId: randomUUID(), requestedAt, name: "Old Link Guest", email: "oldlink@example.com", phone: "7025550177", organization: "Example", professionalRole: "Guest", invitedBy: "Host", attendanceStatus: "attending", attending: "awards", guestCount, guests, eventWaiver: accepted("Old Link Guest") });
    await store.add("rsvp", { ...newSubmission({ name: "Old Link Guest", email: "oldlink@example.com", phone: "7025550177", organization: "", professionalRole: "", invitedBy: "", vip: false, partner: "", heardFrom: "", tier: "", attendanceStatus: "attending", communityDay: false, guestCount: 3, notes: "old link, no guest details" }), submittedAt: "2026-10-10T18:00:00.000Z" } as never);
    const answer = await POST(post("rsvp", rsvp(new Date(Date.now() - 60_000).toISOString(), 1, [])));
    expect(answer.status).toBe(200);
    const rows = await store.list("rsvp");
    const active = rows.filter(row => !row.removedAt);
    expect(active).toHaveLength(1);
    expect(active[0]!.guestCount).toBe(1);
    expect((active[0] as unknown as { firstSubmittedAt: string }).firstSubmittedAt).toBe("2026-10-10T18:00:00.000Z");
    expect(rows.find(row => row.removedAt)?.notes).toBe("old link, no guest details");
  });

  it("lets a retry of the same request through (same requestId) and stores it once", async () => {
    const { store, handler } = setup();
    const POST = withSubmissionInbox("rsvp", handler);
    const first = guest();
    expect((await POST(post("rsvp", first))).status).toBe(200);
    expect((await POST(post("rsvp", first))).status).toBe(200);
    expect(await store.list("rsvp")).toHaveLength(1);
  });

  it("counts submissions saved earlier on another server instance", async () => {
    const { store, handler } = setup();
    for (const day of ["10", "11", "12"]) await store.add("rsvp", { ...newSubmission({ name: "Earlier Guest", email: "Earlier@Example.com", phone: "7025550111" }), submittedAt: `2026-10-${day}T18:00:00.000Z`, ...(day === "12" ? {} : { removedAt: "2026-10-12T18:00:00.000Z", replacedBy: "x" }) } as never);
    const answer = await withSubmissionInbox("rsvp", handler)(post("rsvp", guest({ email: "earlier@example.com" })));
    expect(answer.status).toBe(409);
    expect((await answer.json()).error).toContain("October 12");
  });

  it("ignores a record staff removed, so that person can send again", async () => {
    const { store, handler } = setup();
    await store.add("rsvp", { ...newSubmission({ name: "Removed", email: "pat@example.com", phone: "" }), removedAt: "2026-10-19T00:00:00.000Z" } as never);
    expect((await withSubmissionInbox("rsvp", handler)(post("rsvp", guest()))).status).toBe(200);
  });

  it("gives unlimited submissions to ambassador@, music@ and the numbers in SUBMISSION_TEST_ALLOWLIST", async () => {
    process.env.SUBMISSION_TEST_ALLOWLIST = "7025550123, +1 (702) 555-0144";
    const { store, handler } = setup();
    const POST = withSubmissionInbox("rsvp", handler);
    for (let i = 0; i < 3; i++) expect((await POST(post("rsvp", guest({ email: "Music@InspiringChildren.org" })))).status).toBe(200);
    for (let i = 0; i < 3; i++) expect((await POST(post("rsvp", guest({ email: "ambassador@inspiringchildren.org", phone: "" })))).status).toBe(200);
    for (let i = 0; i < 3; i++) expect((await POST(post("rsvp", guest({ email: `tester${i}@example.com`, phone: "702.555.0123" })))).status).toBe(200);
    for (let i = 0; i < 3; i++) expect((await POST(post("rsvp", guest({ email: `cherrial${i}@example.com`, phone: "17025550144" })))).status).toBe(200);
    expect(await store.list("rsvp")).toHaveLength(12);
    expect(isUnlimitedSubmitter({ email: "someone@example.com", phone: "7025550100" })).toBe(false);
  });

  it("counts each form separately: an RSVP does not block a Closing Dinner request", async () => {
    const { handler } = setup();
    expect((await withSubmissionInbox("rsvp", handler)(post("rsvp", guest()))).status).toBe(200);
    const dinner = setup("closingDinner");
    await dinner.store.add("rsvp", { ...newSubmission({ name: "Pat Guest", email: "pat@example.com", phone: "" }) } as never);
    for (let i = 0; i < 3; i++) expect((await withSubmissionInbox("closing-dinner", dinner.handler)(post("closing-dinner", guest()))).status).toBe(200);
    expect((await withSubmissionInbox("closing-dinner", dinner.handler)(post("closing-dinner", guest()))).status).toBe(409);
  });

  it("never limits text-message opt-outs or the attendee waiver", async () => {
    const { handler } = setup();
    for (const endpoint of ["text-preferences", "attendee-waiver"]) {
      const POST = withSubmissionInbox(endpoint, handler);
      for (let i = 0; i < 3; i++) expect((await POST(post(endpoint, guest()))).status).toBe(200);
    }
  });

  it("lets the request through if the check itself fails (a guest's request is never lost to the limit)", async () => {
    setLimitStoreForTests({ async list() { throw new Error("blobs down"); } } as never);
    setInboxForTests(memoryInboxStore());
    expect((await withSubmissionInbox("rsvp", async () => Response.json({ ok: true }))(post("rsvp", guest()))).status).toBe(200);
  });
});
