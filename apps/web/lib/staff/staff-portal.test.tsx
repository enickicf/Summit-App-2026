import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { comingTo, fileSubmissionStore, memorySubmissionStore, newSubmission, nominationCsvColumns, rsvpCsvColumns, rsvpTotals, toCsv, type NominationSubmission, type RsvpSubmission } from "./store";
import { isStaffSession, passwordMatches, staffPassword, staffSessionToken } from "./auth";
import { handleRsvpPost } from "../../app/api/rsvp/route";
import { handleNominationPost } from "../../app/api/nominations/route";
import { StaffPortal } from "../../components/staff-portal";

afterEach(() => { vi.unstubAllEnvs(); });

const rsvp = (overrides: Partial<RsvpSubmission> = {}): RsvpSubmission => ({
  id: "r1", submittedAt: "2026-09-22T19:14:04.469Z", source: "form", name: "Lisa Lundt", email: "lisa@example.com", phone: "702-555-0100", organization: "", professionalRole: "",
  attendanceStatus: "attending", communityDay: false, guestCount: 3, notes: "", ...overrides
});
const nomination = (overrides: Partial<NominationSubmission> = {}): NominationSubmission => ({
  id: "n1", submittedAt: "2026-09-23T15:00:00.000Z", source: "form", nominatorName: "Paige N.", nominatorEmail: "paige@example.com", nominatorPhone: "", relationship: "Colleague",
  nomineeName: "Kevin Hines", nomineeOrganization: "Kevin Hines Foundation", category: "Lived Experience Award", reason: "Decades of suicide-prevention advocacy.", links: "", ...overrides
});
const post = (path: string, body: unknown, headers: Record<string, string> = {}) =>
  new Request(`https://notalonesummit.org${path}`, { method: "POST", headers: { "content-type": "application/json", origin: "https://not-alone-awards-rsvp-2026.netlify.app", ...headers }, body: typeof body === "string" ? body : JSON.stringify(body) });
const rsvpForm = { name: "Natasha Buonanno", email: "Natasha@Example.com", phone: "702-555-0101", organization: "", professionalRole: "Nursing", attendanceStatus: "attending", communityDay: "on", guestCount: "2", notes: "Wheelchair seating please", website: "" };

describe("staff portal store and totals", () => {
  it("counts tickets from the latest attending request per email and forms from every submission", () => {
    const totals = rsvpTotals([
      rsvp(), // Lisa, 3 tickets
      rsvp({ id: "r2", submittedAt: "2026-09-21T10:00:00.000Z", email: "lisa@example.com", guestCount: 1 }), // Lisa's earlier request: superseded
      rsvp({ id: "r3", submittedAt: "2026-09-20T10:00:00.000Z", email: "brian@example.com", guestCount: 4 }),
      rsvp({ id: "r4", submittedAt: "2026-09-19T10:00:00.000Z", email: "seth@example.com", attendanceStatus: "needs_follow_up", guestCount: 2 }),
      rsvp({ id: "r5", submittedAt: "2026-09-18T10:00:00.000Z", email: "al@example.com", attendanceStatus: "declined" })
    ]);
    expect(totals).toEqual({ lakeLasVegasGuests: 0, lakeLasVegasTickets: 0, namiGuests: 0, namiTickets: 0, ustaGuests: 0, ustaTickets: 0, vipGuests: 0, vipTickets: 0, formsSubmitted: 5, uniqueGuests: 4, ticketsRequested: 9, attending: 2, moreInformation: 1, unable: 1, communityDayGuests: 0, communityDayTickets: 0, communityDayOnlyGuests: 0, communityDayOnlyTickets: 0 });
    // Community Day is its own count: party sizes of the latest request per email that switched it on.
    const withCommunity = rsvpTotals([rsvp({ communityDay: true }), rsvp({ id: "c2", email: "brian@example.com", attendanceStatus: "declined", communityDay: true, guestCount: 2 })]);
    expect(withCommunity).toMatchObject({ ticketsRequested: 3, communityDayGuests: 2, communityDayTickets: 5 });
    expect(comingTo(rsvp({ communityDay: true }))).toEqual(["awards", "communityDay"]);
    // Owner (Sept 30): any ticket request counts as planning to attend the Awards; only an explicit legacy "unable" does not.
    expect(comingTo(rsvp({ attendanceStatus: "needs_follow_up", communityDay: true }))).toEqual(["awards", "communityDay"]);
    expect(comingTo(rsvp({ attendanceStatus: "declined", communityDay: true }))).toEqual(["communityDay"]);
    expect(comingTo(rsvp())).toEqual(["awards"]);
    expect(comingTo(rsvp({ attendanceStatus: "declined" }))).toEqual([]);
  });

  it("keeps records newest first in the file store and exports CSV with every field", async () => {
    const store = fileSubmissionStore(join(mkdtempSync(join(tmpdir(), "staff-portal-")), "store.json"));
    await store.add("rsvp", rsvp({ id: "old", submittedAt: "2026-09-20T10:00:00.000Z" }));
    await store.add("rsvp", rsvp());
    await store.add("nomination", nomination());
    expect((await store.list("rsvp")).map(record => record.id)).toEqual(["r1", "old"]);
    expect(await store.list("nomination")).toHaveLength(1);
    const csv = toCsv(await store.list("rsvp"), rsvpCsvColumns);
    expect(csv.split("\r\n")[0]).toBe(rsvpCsvColumns.join(","));
    expect(csv).toContain("Lisa Lundt,lisa@example.com,702-555-0100");
    expect(toCsv([nomination({ reason: 'Said "no quit", twice' })], nominationCsvColumns)).toContain('"Said ""no quit"", twice"');
  });
});

describe("password-only staff sign-in", () => {
  it("accepts only the configured password and recognises its signed cookie", () => {
    const env = { STAFF_PORTAL_PASSWORD: "password" };
    expect(staffPassword({})).toBeNull();
    expect(passwordMatches("password", env)).toBe(true);
    expect(passwordMatches("Password", env)).toBe(false);
    expect(passwordMatches("password", {})).toBe(false);
    const token = staffSessionToken("password");
    expect(token).toMatch(/^v1\.[0-9a-f]{64}$/);
    expect(isStaffSession(token, env)).toBe(true);
    expect(isStaffSession(token, { STAFF_PORTAL_PASSWORD: "changed" })).toBe(false); // changing the password signs everyone out
    expect(isStaffSession(undefined, env)).toBe(false);
    expect(isStaffSession("v1.garbage", env)).toBe(false);
  });
});

describe("RSVP and nomination intake", () => {
  it("stores a valid RSVP with the form's fields, forwards a copy, and answers the form's origin", async () => {
    const store = memorySubmissionStore();
    const forwarded: unknown[] = [];
    const response = await handleRsvpPost(post("/api/rsvp/", rsvpForm), store, async payload => { forwarded.push(payload); });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(response.headers.get("access-control-allow-origin")).toBe("https://not-alone-awards-rsvp-2026.netlify.app");
    const [saved] = await store.list("rsvp");
    expect(saved).toMatchObject({ name: "Natasha Buonanno", email: "natasha@example.com", phone: "702-555-0101", professionalRole: "Nursing", attendanceStatus: "attending", communityDay: true, guestCount: 2, notes: "Wheelchair seating please", source: "form" });
    // Without the toggle (or from the old form) Community Day is simply "no".
    const { communityDay: _cd, ...noToggle } = rsvpForm;
    await handleRsvpPost(post("/api/rsvp/", noToggle), store, async () => {});
    expect((await store.list("rsvp")).find(record => record.communityDay === false)).toBeTruthy();
    expect(saved!.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(forwarded).toHaveLength(1);
  });

  it("rejects bad input with the form's wording, ignores honeypot submissions, and survives a legacy forward failure", async () => {
    const store = memorySubmissionStore();
    expect(await (await handleRsvpPost(post("/api/rsvp/", { ...rsvpForm, name: "A" }), store, async () => {})).json()).toEqual({ ok: false, error: "Please enter your full name." });
    expect(await (await handleRsvpPost(post("/api/rsvp/", { ...rsvpForm, email: "nope" }), store, async () => {})).json()).toEqual({ ok: false, error: "Please enter a valid email address." });
    expect(await (await handleRsvpPost(post("/api/rsvp/", { ...rsvpForm, attendanceStatus: "maybe" }), store, async () => {})).json()).toEqual({ ok: false, error: "Please select a valid response." });
    expect((await handleRsvpPost(post("/api/rsvp/", "{bad"), store, async () => {})).status).toBe(400);
    expect(await (await handleRsvpPost(post("/api/rsvp/", { ...rsvpForm, website: "http://spam" }), store, async () => {})).json()).toEqual({ ok: true });
    expect(await store.list("rsvp")).toHaveLength(0);
    const failing = await handleRsvpPost(post("/api/rsvp/", rsvpForm), store, async () => { throw new Error("legacy down"); });
    expect(failing.status).toBe(200);
    expect(await store.list("rsvp")).toHaveLength(1);
  });

  it("stores nominations with the category and reason, and validates the required fields", async () => {
    const store = memorySubmissionStore();
    const body = { nominatorName: "Paige N.", nominatorEmail: "paige@example.com", nominatorPhone: "", relationship: "Colleague", nomineeName: "Kevin Hines", nomineeOrganization: "Kevin Hines Foundation", category: "Lived Experience Award", reason: "Decades of advocacy.", links: "https://kevinhinesstory.com", website: "" };
    const response = await handleNominationPost(post("/api/nominations/", body), store);
    expect(await response.json()).toEqual({ ok: true });
    expect((await store.list("nomination"))[0]).toMatchObject({ nomineeName: "Kevin Hines", category: "Lived Experience Award", links: "https://kevinhinesstory.com", source: "form" });
    expect(await (await handleNominationPost(post("/api/nominations/", { ...body, category: "" }), store)).json()).toEqual({ ok: false, error: "Please choose an award category." });
    expect(await (await handleNominationPost(post("/api/nominations/", { ...body, reason: "" }), store)).json()).toEqual({ ok: false, error: "Please tell us why they should be honored (up to 2000 characters)." });
    expect(await (await handleNominationPost(post("/api/nominations/", { ...body, website: "bot" }), store)).json()).toEqual({ ok: true });
    expect(await store.list("nomination")).toHaveLength(1);
  });
});

describe("staff portal page", () => {
  it("shows the running totals at the top, every RSVP field, nominations in their own section and the lineup", () => {
    const html = renderToStaticMarkup(<StaffPortal rsvps={[rsvp({ communityDay: true }), rsvp({ id: "r2", submittedAt: "2026-09-20T10:00:00.000Z", email: "brian@example.com", name: "Brian Goldfus", guestCount: 4, notes: "Table near the stage", source: "import" })]} nominations={[nomination()]} poker={[]} lineup={[{ title: "Lineup", people: [{ name: "Jewel", role: "Singer-Songwriter", rank: 1, tier: "A", photo: true }] }, { title: "Founders", people: [{ name: "Jay & Erica McGraw", role: "", rank: null, tier: null, photo: false }] }]} generatedAt="2026-09-23T20:00:00.000Z" />);
    const stats = html.slice(html.indexOf('aria-label="Ticket totals"'), html.indexOf('id="tickets"'));
    expect(stats).toMatch(/>7<[\s\S]*?Awards Show tickets/);
    expect(stats).toMatch(/>2<[\s\S]*?Forms submitted/);
    expect(html.indexOf('aria-label="Ticket totals"')).toBeLessThan(html.indexOf('id="tickets"'));
    for (const text of ["Lisa Lundt", "lisa@example.com", "702-555-0100", "Brian Goldfus", "Table near the stage", "Previous portal"]) expect(html).toContain(text);
    // Owner (Sept 30): a ticket request means the guest plans to attend; no response column or "Plan to attend" tile.
    expect(html).not.toContain("Yes, plans to attend"); expect(html).not.toContain("Plan to attend");
    expect(html.slice(html.indexOf('id="nominations"'))).toContain("Kevin Hines");
    expect(html).toContain("Lived Experience Award");
    expect(html).toContain('href="/api/staff/export?kind=rsvp"');
    expect(html).toContain('href="/api/staff/export?kind=nominations"');
    expect(html.slice(html.indexOf('id="lineup"'))).toContain("Jay &amp; Erica McGraw");
    expect(html).toContain("no photo");
    expect(html).toContain('action="/api/staff/logout"');
    // Owner (Sept 23): red Awards badge, blue Community Day badge, both for Lisa; a separate Community Day section lists only her.
    const lisaRow = html.slice(html.indexOf("Lisa Lundt"), html.indexOf("Brian Goldfus"));
    expect(lisaRow).toMatch(/badgeAwards[^>]*>Awards</);
    expect(lisaRow).toMatch(/badgeCommunity[^>]*>Community Day</);
    const brianRow = html.slice(html.indexOf("Brian Goldfus"), html.indexOf('id="community-day"'));
    expect(brianRow).toMatch(/badgeAwards[^>]*>Awards</);
    expect(brianRow).not.toMatch(/badgeCommunity[^>]*>Community Day</);
    const community = html.slice(html.indexOf('id="community-day"'), html.indexOf('id="nominations"'));
    expect(community).toContain("Lisa Lundt");
    expect(community).not.toContain("Brian Goldfus");
    expect(stats).toMatch(/>3<[\s\S]*?Community Day tickets/);
  });

  it("creates submissions with a fresh id and timestamp", () => {
    const record = newSubmission({ name: "x" }, new Date("2026-09-23T12:00:00Z"));
    expect(record).toMatchObject({ name: "x", source: "form", submittedAt: "2026-09-23T12:00:00.000Z" });
    expect(record.id).toMatch(/^[0-9a-f-]{36}$/);
  });
});

describe("removed guests (owner, Sept 28)", async () => {
  const { removeOrRestoreRsvp } = await import("../../app/api/staff/rsvps/route");
  const { activeRsvps, removedRsvps } = await import("./store");
  const { renderToStaticMarkup } = await import("react-dom/server");
  const { StaffPortal } = await import("../../components/staff-portal");
  const base = (over: Partial<RsvpSubmission>): RsvpSubmission => ({ ...newSubmission({ name: "Cherrial Odell", email: "cherrial@example.com", phone: "", organization: "", professionalRole: "", attendanceStatus: "attending", communityDay: false, guestCount: 2, notes: "" }), ...over });
  it("removing keeps every field, drops the request from the lists and totals, and restore brings it back", async () => {
    const test1 = base({ id: "t1", submittedAt: "2026-09-23T10:00:00.000Z" });
    const real = base({ id: "g1", name: "Lisa Lundt", email: "lisa@example.com", submittedAt: "2026-09-22T19:14:00.000Z", guestCount: 3 });
    const store = memorySubmissionStore({ rsvp: [test1, real] });
    const removed = await removeOrRestoreRsvp(store, "t1", "remove", "Test entry");
    expect(removed).toMatchObject({ id: "t1", name: "Cherrial Odell", guestCount: 2, removedReason: "Test entry" });
    expect(removed?.removedAt).toBeTruthy();
    const all = await store.list("rsvp");
    expect(all).toHaveLength(2);
    expect(activeRsvps(all).map(r => r.id)).toEqual(["g1"]);
    expect(removedRsvps(all).map(r => r.id)).toEqual(["t1"]);
    expect(rsvpTotals(activeRsvps(all))).toMatchObject({ formsSubmitted: 1, ticketsRequested: 3 });
    const html = renderToStaticMarkup(<StaffPortal rsvps={all} nominations={[]} poker={[]} lineup={[]} generatedAt="2026-09-28T00:00:00.000Z" />);
    const tickets = html.slice(html.indexOf('id="tickets"'), html.indexOf('id="community-day"'));
    const removedSection = html.slice(html.indexOf('id="removed"'), html.indexOf('id="lineup"'));
    expect(tickets).toContain("Lisa Lundt"); expect(tickets).not.toContain("Cherrial Odell");
    expect(removedSection).toContain("Cherrial Odell"); expect(removedSection).toContain("Test entry"); expect(removedSection).toContain(">Restore<");
    expect(html).toContain('href="#removed"');
    expect(html).not.toContain("Unable to attend</span>");
    expect(await removeOrRestoreRsvp(store, "t1", "restore", "")).not.toHaveProperty("removedAt");
    expect(activeRsvps(await store.list("rsvp"))).toHaveLength(2);
    expect(await removeOrRestoreRsvp(store, "nope", "remove", "")).toBeNull();
  });
  it("CSV keeps removed requests with their reason", () => {
    const csv = toCsv([base({ id: "t1", removedAt: "2026-09-28T20:00:00.000Z", removedReason: "Test entry" })], rsvpCsvColumns);
    expect(csv.split("\r\n")[0]).toContain("removedAt,removedReason");
    expect(csv).toContain("2026-09-28T20:00:00.000Z,Test entry");
  });
});

describe("permanent deletion of removed test entries (owner, Sept 28)", async () => {
  const { deleteRemovedSubmission, removeOrRestoreSubmission } = await import("../../app/api/staff/rsvps/route");
  it("deletes only records that were removed first, for tickets and poker alike", async () => {
    const test = { ...newSubmission({ name: "Ray Lewis", email: "ray@example.com", phone: "702-555-0110", organization: "", interest: "player" as const, sponsorship: "", seats: 2, experience: "casual", notes: "Seat near the rail" }), id: "p1" };
    const store = memorySubmissionStore({ poker: [test] });
    expect(await deleteRemovedSubmission(store, "poker", "p1")).toBe("not-removed");
    await removeOrRestoreSubmission(store, "poker", "p1", "remove", "Test fixture");
    expect(await deleteRemovedSubmission(store, "poker", "p1")).toBe("deleted");
    expect(await store.list("poker")).toEqual([]);
    expect(await deleteRemovedSubmission(store, "poker", "p1")).toBe("not-found");
  });
});
