import { afterEach, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { memoryInboxStore, setInboxForTests, unresolvedFailures, withSubmissionInbox } from "./submission-inbox";
import { isUnlimitedSubmitter, setLimitStoreForTests } from "./submission-limit";
import { memorySubmissionStore, newSubmission } from "./store";

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
  it("saves the first RSVP, refuses a second one by the same email or phone with a clear message, and keeps the refused copy", async () => {
    const { store, inbox, handler } = setup();
    const POST = withSubmissionInbox("rsvp", handler);
    expect((await POST(post("rsvp", guest()))).status).toBe(200);
    const sameEmail = await POST(post("rsvp", guest({ phone: "7025559999", name: "Pat Again" })));
    expect(sameEmail.status).toBe(409);
    expect((await sameEmail.json()).error).toMatch(/already have your RSVP .*music@inspiringchildren\.org/);
    expect((await POST(post("rsvp", guest({ email: "other@example.com", phone: "702-555-0101" })))).status).toBe(409);
    expect(await store.list("rsvp")).toHaveLength(1);
    const failed = await inbox.list("failed/");
    expect(failed).toHaveLength(2);
    expect(failed.every(entry => entry.reason === "already-submitted")).toBe(true);
    expect(unresolvedFailures(failed, [])).toHaveLength(0); // not listed under Needs attention
  });

  it("lets a retry of the same request through (same requestId) and stores it once", async () => {
    const { store, handler } = setup();
    const POST = withSubmissionInbox("rsvp", handler);
    const first = guest();
    expect((await POST(post("rsvp", first))).status).toBe(200);
    expect((await POST(post("rsvp", first))).status).toBe(200);
    expect(await store.list("rsvp")).toHaveLength(1);
  });

  it("refuses a second request that was saved earlier on another server instance", async () => {
    const { store, handler } = setup();
    await store.add("rsvp", { ...newSubmission({ name: "Earlier Guest", email: "Earlier@Example.com", phone: "7025550111" }), submittedAt: "2026-10-12T18:00:00.000Z" } as never);
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
    expect((await withSubmissionInbox("closing-dinner", dinner.handler)(post("closing-dinner", guest()))).status).toBe(200);
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
