import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { handlePokerPost } from "./route";
import { isPokerSponsor, memorySubmissionStore, pokerCsvColumns, pokerSponsorshipTotals, pokerTotals, toCsv, type PokerSubmission } from "../../../lib/staff/store";
import { StaffPortal } from "../../../components/staff-portal";

// Owner (Sept 28): the All In poker tournament keeps its own separate site and form; its requests are
// mirrored here so the team reads them in the portal, in their own section, never mixed into the
// Awards ticket requests or Community Day.
const seat = (overrides: Partial<PokerSubmission> = {}): PokerSubmission => ({
  id: "p1", submittedAt: "2026-09-28T17:00:00.000Z", source: "form", name: "Ray Lewis", email: "ray@example.com",
  phone: "702-555-0110", organization: "", interest: "player", sponsorship: "", seats: 2, experience: "casual", notes: "", ...overrides
});
const post = (body: unknown) => new Request("https://notalonesummit.org/api/poker", {
  method: "POST", headers: { "content-type": "application/json", origin: "https://all-in-for-mental-health.netlify.app" },
  body: typeof body === "string" ? body : JSON.stringify(body)
});
const form = { name: "Ray Lewis", email: "Ray@Example.com", phone: "702-555-0110", organization: "", interest: "player", seats: "2", experience: "casual", notes: "Seat near the rail", website: "" };

describe("the poker site's mirror into the staff portal", () => {
  it("stores a seat request under its own kind, apart from tickets and nominations", async () => {
    const store = memorySubmissionStore();
    const response = await handlePokerPost(post(form), store);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    const [stored] = await store.list("poker");
    expect(stored).toMatchObject({ name: "Ray Lewis", email: "ray@example.com", interest: "player", seats: 2 });
    // The Awards sections must not see it.
    expect(await store.list("rsvp")).toEqual([]);
    expect(await store.list("nomination")).toEqual([]);
  });

  it("answers the poker site's origin and refuses what it cannot use", async () => {
    expect(await handlePokerPost(post(form), memorySubmissionStore()).then(r => r.headers.get("access-control-allow-origin")))
      .toBe("https://all-in-for-mental-health.netlify.app");
    for (const [body, error] of [
      [{ ...form, name: "R" }, "Please enter your full name."],
      [{ ...form, email: "ray@" }, "Please enter a valid email address."],
      [{ ...form, interest: "dealer" }, "Please tell us how you would like to take part."]
    ] as const) {
      const store = memorySubmissionStore();
      const response = await handlePokerPost(post(body), store);
      expect(response.status).toBe(400);
      expect(await response.json()).toMatchObject({ ok: false, error });
      expect(await store.list("poker")).toEqual([]);
    }
  });

  it("answers a filled honeypot with success and stores nothing", async () => {
    const store = memorySubmissionStore();
    expect(await handlePokerPost(post({ ...form, website: "https://spam.example" }), store).then(r => r.json())).toEqual({ ok: true });
    expect(await store.list("poker")).toEqual([]);
  });

  it("tells the guest to try again when the store fails", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const failing = { add: async () => { throw new Error("blobs down"); }, list: async () => [] } as never;
    const response = await handlePokerPost(post(form), failing);
    expect(response.status).toBe(500);
    error.mockRestore();
  });

  it("counts seats once per email and shows poker in its own portal section", () => {
    expect(pokerTotals([
      seat({ seats: 2 }),
      seat({ id: "p2", submittedAt: "2026-09-27T10:00:00.000Z", seats: 6 }), // the same guest, earlier
      seat({ id: "p3", submittedAt: "2026-09-26T10:00:00.000Z", email: "sean@example.com", interest: "table", seats: 8 }),
      seat({ id: "p4", submittedAt: "2026-09-25T10:00:00.000Z", email: "ana@example.com", interest: "spectator" })
    ])).toEqual({ formsSubmitted: 4, uniqueGuests: 3, seatsRequested: 10, players: 1, tableSponsors: 1, spectators: 1, moreInformation: 0 });

    const html = renderToStaticMarkup(<StaffPortal rsvps={[]} nominations={[]} poker={[seat()]} lineup={[]} generatedAt="2026-09-28T20:00:00.000Z" />);
    expect(html).toContain("Earlier seat requests");   // seats moved to the invitation, Sept 29
    expect(html).toContain("Earlier seat requests");   // the tile is labelled for its history now
    expect(html).toContain("Ray Lewis");
    expect(html).toContain("/api/staff/export?kind=poker");
    // Its own section, its own words — never folded into the Awards numbers.
    expect(html).toContain("all-in-for-mental-health.netlify.app");   // still named as its own separate site
    expect(toCsv([seat()], pokerCsvColumns).split("\r\n")[0]).toBe(pokerCsvColumns.join(","));
  });
});

describe("sponsorship levels", () => {
  const sponsor = (level: string) => ({ ...form, interest: "table", sponsorship: level });

  it("accepts every published level and rejects anything else", async () => {
    for (const level of ["title", "presenting", "premier", "champion", "table"]) {
      const store = memorySubmissionStore();
      const response = await handlePokerPost(post(sponsor(level)), store);
      expect(response.status, level).toBe(200);
      expect((await store.list("poker"))[0]).toMatchObject({ interest: "table", sponsorship: level });
    }
    const store = memorySubmissionStore();
    expect((await handlePokerPost(post(sponsor("platinum")), store)).status).toBe(400);
    expect(await store.list("poker")).toEqual([]);
  });

  it("counts what the sponsors have pledged, once per email", () => {
    const rows = [
      seat({ id: "s1", interest: "table", sponsorship: "title" }),
      seat({ id: "s2", submittedAt: "2026-09-27T10:00:00.000Z", interest: "table", sponsorship: "table" }), // same guest, earlier
      seat({ id: "s3", submittedAt: "2026-09-26T10:00:00.000Z", email: "b@example.com", interest: "table", sponsorship: "champion" }),
      seat({ id: "s4", submittedAt: "2026-09-25T10:00:00.000Z", email: "c@example.com", interest: "player" })
    ];
    // Title 100,000 + Champion 10,000; seats 45 + 18; Awards tickets 25 + 10.
    expect(pokerSponsorshipTotals(rows)).toEqual({ sponsors: 2, pledged: 110_000, reservedSeats: 63, awardsTickets: 35 });
    expect(isPokerSponsor(rows[0]!)).toBe(true);
    expect(isPokerSponsor(rows[3]!)).toBe(false);
  });

  it("marks a sponsor's row in the portal, apart from a regular guest", () => {
    const html = renderToStaticMarkup(<StaffPortal rsvps={[]} nominations={[]} poker={[
      seat({ id: "s1", name: "Big Sponsor", interest: "table", sponsorship: "title" }),
      seat({ id: "s2", name: "Plain Guest", email: "guest@example.com", interest: "player" })
    ]} lineup={[]} generatedAt="2026-09-28T20:00:00.000Z" />);
    expect(html).toContain("Title Sponsor");
    expect(html).toContain("$100,000");
    expect(html).toContain("Sponsorship enquiries");   // the tab the owner asked for, Sept 29
    expect(html).toContain("45 reserved");
    // The plain guest keeps the ordinary label.
    expect(html).toContain("Reserving a seat");
  });
});
