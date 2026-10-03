import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { listAllRsvps, listVipRsvps, memorySubmissionStore, missingVipFields, rsvpCsvColumns, rsvpPayloadSchema, rsvpTotals, type RsvpSubmission } from "./store";
import { handleRsvpPost } from "../../app/api/rsvp/route";
import { StaffPortal } from "../../components/staff-portal";

const base = { name: "Priscilla Example", email: "priscilla@example.com", phone: "702-555-0100", attendanceStatus: "attending", guestCount: 2 };
const post = (body: object) => new Request("https://notalonesummit.org/api/rsvp", { method: "POST", headers: { "content-type": "application/json", origin: "https://notaloneawards.org" }, body: JSON.stringify(body) });
const vipRow: RsvpSubmission = { ...base, attendanceStatus: "attending", organization: "Wardrobe Co", professionalRole: "Stylist", invitedBy: "Ryan", vip: true, communityDay: false, notes: "", id: "v1", submittedAt: "2026-09-30T01:00:00.000Z", source: "form" };
const massRow: RsvpSubmission = { ...base, name: "Regular Guest", email: "regular@example.com", attendanceStatus: "attending", organization: "", professionalRole: "", invitedBy: "", vip: false, communityDay: false, notes: "", id: "r1", submittedAt: "2026-09-30T02:00:00.000Z", source: "form" };

describe("VIP RSVPs share the staff portal backend (owner, Oct 1, 2026)", () => {
  it("still requires organization, title and who invited you on the VIP form", async () => {
    expect(rsvpPayloadSchema.parse({ ...base, invitedBy: "Ryan", vip: "on" }).vip).toBe(true);
    expect(rsvpCsvColumns).toContain("vip");
    expect(missingVipFields({ vip: true, organization: "", professionalRole: "Stylist", invitedBy: "" })).toEqual(["your organization", "who invited you"]);
    const store = memorySubmissionStore();
    const rejected = await handleRsvpPost(post({ ...base, vip: "on", organization: "Wardrobe Co" }), store, async () => {}, null);
    expect(rejected.status).toBe(400);
  });
  it("stores a VIP request with the other RSVPs, flagged vip", async () => {
    const store = memorySubmissionStore();
    const ok = await handleRsvpPost(post({ ...base, vip: "on", organization: "Wardrobe Co", professionalRole: "Stylist", invitedBy: "Ryan" }), store, async () => {}, null);
    expect(ok.status).toBe(200);
    const rows = await store.list("rsvp");
    expect(rows).toHaveLength(1); expect(rows[0]!.vip).toBe(true); expect(rows[0]!.invitedBy).toBe("Ryan");
    expect(await store.list("vipRsvp")).toHaveLength(0);
  });
  it("moves records parked under the old VIP kind back into the shared list without losing any", async () => {
    const store = memorySubmissionStore({ rsvp: [massRow], vipRsvp: [vipRow] });
    expect((await listAllRsvps(store)).map(r => r.id).sort()).toEqual(["r1", "v1"]);
    expect(await store.list("vipRsvp")).toHaveLength(0);
    expect((await listVipRsvps(store)).map(r => r.id)).toEqual(["v1"]);
  });
  it("shows a VIP section first in the staff portal and counts VIPs in the totals", () => {
    const totals = rsvpTotals([vipRow, massRow]);
    expect(totals.vipGuests).toBe(1); expect(totals.vipTickets).toBe(2); expect(totals.ticketsRequested).toBe(4);
    const html = renderToStaticMarkup(<StaffPortal rsvps={[massRow, vipRow]} nominations={[]} poker={[]} workshops={[]} lineup={[]} generatedAt="2026-10-01T02:00:00.000Z" />);
    expect(html).toContain('id="vip-title"'); expect(html.indexOf('id="vip"')).toBeLessThan(html.indexOf('id="tickets"'));
    for (const text of ["VIP tickets", "<th>Invited by</th>", ">Ryan<", ">VIP<", "Regular Guest"]) expect(html).toContain(text);
  });
});
