import { afterEach, describe, expect, it } from "vitest";
import { contactFromBody, memoryInboxStore, setInboxForTests, unresolvedFailures, withSubmissionInbox } from "./submission-inbox";

// Owner (Oct 19): no submission may be lost, including requests the API refuses.
const post = (body: string) => new Request("https://notaloneawards.org/api/rsvp", { method: "POST", headers: { "Content-Type": "application/json", origin: "https://notaloneawards.org" }, body });
const guest = JSON.stringify({ name: "Ada Guest", email: "ada@example.com", phone: "702-555-0100" });

afterEach(() => setInboxForTests(null));

describe("submission inbox", () => {
  it("stores every request before the handler, and a refused one again with the message the guest saw", async () => {
    const inbox = memoryInboxStore(); setInboxForTests(inbox);
    let seen = "";
    const POST = withSubmissionInbox("rsvp", async request => { seen = await request.text(); return Response.json({ ok: false, error: "Please sign the waiver." }, { status: 400 }); });
    const response = await POST(post(guest));
    expect(response.status).toBe(400);
    expect(seen).toBe(guest); // the handler still gets the exact body
    const received = await inbox.list("received/rsvp/"), failed = await inbox.list("failed/rsvp/");
    expect(received).toHaveLength(1);
    expect(failed).toMatchObject([{ name: "Ada Guest", email: "ada@example.com", phone: "702-555-0100", status: 400, error: "Please sign the waiver.", body: guest }]);
  });
  it("does not flag a saved request", async () => {
    const inbox = memoryInboxStore(); setInboxForTests(inbox);
    const POST = withSubmissionInbox("rsvp", async () => Response.json({ ok: true }, { status: 201 }));
    expect((await POST(post(guest))).status).toBe(201);
    expect(await inbox.list("received/")).toHaveLength(1);
    expect(await inbox.list("failed/")).toHaveLength(0);
  });
  it("turns a crash into a 500 the guest can retry, and keeps the request", async () => {
    const inbox = memoryInboxStore(); setInboxForTests(inbox);
    const POST = withSubmissionInbox("closing-dinner", async () => { throw new Error("blobs down"); });
    const response = await POST(post(guest));
    expect(response.status).toBe(500);
    expect(await inbox.list("failed/closing-dinner/")).toMatchObject([{ email: "ada@example.com", status: 500 }]);
  });
  it("never blocks the guest when the inbox itself fails", async () => {
    setInboxForTests({ async set() { throw new Error("inbox down"); }, async list() { return []; } });
    const POST = withSubmissionInbox("rsvp", async () => Response.json({ ok: true }));
    expect((await POST(post(guest))).status).toBe(200);
  });
  it("reads contact details from every form's shape", () => {
    expect(contactFromBody(JSON.stringify({ requester: { name: "Vip Person", email: "v@example.com", phone: "1" } }))).toMatchObject({ name: "Vip Person", email: "v@example.com" });
    expect(contactFromBody(JSON.stringify({ nominatorName: "Nom", nominatorEmail: "n@example.com" }))).toMatchObject({ name: "Nom", email: "n@example.com" });
    expect(contactFromBody("not json")).toMatchObject({ name: "", email: "" });
  });
  it("drops a failure once the same guest has a saved request", () => {
    const failed = [{ id: "1", endpoint: "rsvp", receivedAt: "2026-10-19T10:00:00.000Z", origin: "", userAgent: "", body: "", name: "Ada", email: "ADA@example.com", phone: "", status: 400 }];
    expect(unresolvedFailures(failed, [])).toHaveLength(1);
    expect(unresolvedFailures(failed, [{ email: "ada@example.com", submittedAt: "2026-10-19T10:05:00.000Z" }])).toHaveLength(0);
    expect(unresolvedFailures(failed, [{ email: "ada@example.com", submittedAt: "2026-10-01T10:05:00.000Z" }])).toHaveLength(1);
  });
});
