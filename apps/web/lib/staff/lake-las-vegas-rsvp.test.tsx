import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { activeRsvps, memorySubmissionStore, rsvpCsvColumns, rsvpForm, rsvpPayloadSchema, rsvpsOfForm, rsvpTotals, toCsv, withRsvpForm, type RsvpSubmission } from "./store";
import { handleRsvpPost } from "../../app/api/rsvp/route";
import { StaffPortal } from "../../components/staff-portal";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }), usePathname: () => "/staff" }));
const base = { name: "Lake Guest", email: "lake@example.com", phone: "702-555-0100", organization: "Org", professionalRole: "Role", invitedBy: "Team", attendanceStatus: "attending", guestCount: 2 };
const post = (body: object) => new Request("https://notaloneawards.org/api/rsvp", { method: "POST", headers: { "content-type": "application/json", origin: "https://notaloneawards.org" }, body: JSON.stringify(body) });
const row = (extra: Partial<RsvpSubmission>): RsvpSubmission => ({ ...base, attendanceStatus: "attending", communityDay: false, notes: "", id: Math.random().toString(36).slice(2), submittedAt: "2026-10-03T10:00:00.000Z", source: "form", ...extra });

describe("Lake Las Vegas RSVP form (owner, Oct 3, 2026)", () => {
  it("stores the Lake Las Vegas tag and refuses unknown tags", async () => {
    expect(rsvpPayloadSchema.parse({ ...base, tier: "lake-las-vegas" }).tier).toBe("lake-las-vegas");
    expect(rsvpPayloadSchema.parse(base).tier).toBe("");
    expect(rsvpPayloadSchema.safeParse({ ...base, tier: "front-row" }).success).toBe(false);
    const store = memorySubmissionStore();
    expect((await handleRsvpPost(post({ ...base, tier: "lake-las-vegas" }), store, async () => {}, null)).status).toBe(200);
    expect((await store.list("rsvp"))[0]!.tier).toBe("lake-las-vegas");
  });
  it("labels each form, counts Lake Las Vegas, and splits one list per form", () => {
    const lake = row({ tier: "lake-las-vegas" }), vip = row({ name: "Vip Guest", email: "v@example.com", vip: true }), nami = row({ name: "Nami Guest", email: "n@example.com", partner: "nami" }), standard = row({ name: "Std Guest", email: "s@example.com" });
    expect([lake, vip, nami, standard].map(r => rsvpForm(r))).toEqual(["Lake Las Vegas", "VIP", "NAMI", "Standard"]);
    const active = activeRsvps([lake, vip, nami, standard]);
    expect(rsvpsOfForm(active, "lake-las-vegas").map(r => r.name)).toEqual(["Lake Guest"]);
    expect(rsvpsOfForm(active, "standard").map(r => r.name)).toEqual(["Std Guest"]);
    expect(rsvpTotals(active).lakeLasVegasTickets).toBe(2);
    expect(rsvpCsvColumns).toContain("tier"); expect(toCsv(withRsvpForm([lake]), rsvpCsvColumns)).toContain("Lake Las Vegas");
    const html = renderToStaticMarkup(<StaffPortal rsvps={[lake, vip]} nominations={[]} poker={[]} workshops={[]} lineup={[]} generatedAt="2026-10-03T12:00:00.000Z" />);
    for (const text of ["Lake Las Vegas RSVPs", "Lake Las Vegas tickets", "form=lake-las-vegas", "form=vip", "form=nami", "form=nami-vip", "form=lake-las-vegas-vip"]) expect(html).toContain(text);
  });
});
