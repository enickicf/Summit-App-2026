import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { memorySubmissionStore, rsvpCsvColumns, rsvpPayloadSchema, rsvpTotals, type RsvpSubmission } from "./store";
import { handleRsvpPost } from "../../app/api/rsvp/route";
import { StaffPortal } from "../../components/staff-portal";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }), usePathname: () => "/nami" }));
const base = { name: "Nami Guest", email: "guest@nami.example", phone: "702-555-0100", organization: "NAMI", professionalRole: "Program Director", invitedBy: "NAMI", attendanceStatus: "attending", guestCount: 2 };
const post = (body: object) => new Request("https://notaloneawards.org/api/rsvp", { method: "POST", headers: { "content-type": "application/json", origin: "https://notaloneawards.org" }, body: JSON.stringify(body) });

describe("NAMI RSVPs land in the staff portal tagged NAMI (owner, Oct 2, 2026)", () => {
  it("tags a NAMI request and stores it with every other RSVP", async () => {
    expect(rsvpPayloadSchema.parse({ ...base, partner: "NAMI" }).partner).toBe("nami");
    expect(rsvpPayloadSchema.parse(base).partner).toBe("");
    expect(rsvpPayloadSchema.safeParse({ ...base, partner: "someone-else" }).success).toBe(false);
    expect(rsvpCsvColumns).toContain("partner");
    const store = memorySubmissionStore();
    const response = await handleRsvpPost(post({ ...base, partner: "nami", communityDay: "on" }), store, async () => {}, null);
    expect(response.status).toBe(200);
    const rows = await store.list("rsvp");
    expect(rows).toHaveLength(1); expect(rows[0]!.partner).toBe("nami"); expect(rows[0]!.communityDay).toBe(true);
  });
  it("shows a NAMI section, tile and badge in the staff portal", () => {
    const nami: RsvpSubmission = { ...base, attendanceStatus: "attending", partner: "nami", communityDay: true, notes: "", id: "n1", submittedAt: "2026-10-02T10:00:00.000Z", source: "form" };
    const other: RsvpSubmission = { ...base, name: "Other Guest", email: "other@example.com", attendanceStatus: "attending", communityDay: false, notes: "", id: "o1", submittedAt: "2026-10-02T11:00:00.000Z", source: "form" };
    const totals = rsvpTotals([nami, other]);
    expect(totals.namiGuests).toBe(1); expect(totals.namiTickets).toBe(2); expect(totals.ticketsRequested).toBe(4);
    const html = renderToStaticMarkup(<StaffPortal rsvps={[nami, other]} nominations={[]} poker={[]} workshops={[]} lineup={[]} generatedAt="2026-10-02T12:00:00.000Z" />);
    for (const text of ['id="nami-title"', "NAMI tickets", ">NAMI<", "Nami Guest", "Other Guest"]) expect(html).toContain(text);
    expect(html.indexOf('id="nami"')).toBeLessThan(html.indexOf('id="tickets"'));
  });
});

describe("no NAMI page on the public website (owner, Oct 2: only its own private link)", () => {
  it("has no /nami route and no public link to the NAMI form", async () => {
    const { existsSync, readFileSync } = await import("node:fs");
    const { join } = await import("node:path");
    expect(existsSync(join(__dirname, "../../app/nami"))).toBe(false);
    for (const file of ["components/site-header.tsx", "components/site-footer.tsx", "components/summit-navigation.tsx", "lib/page-cache.ts", "lib/awards-editorial.ts"]) expect(readFileSync(join(__dirname, "../..", file), "utf8")).not.toMatch(/nami-[a-z0-9]{8,}|\/nami\b/);
  });
});

describe("every request shows its form (owner, Oct 2)", () => {
  it("labels Standard, VIP and NAMI and puts the form in the CSV", async () => {
    const { rsvpForm, withRsvpForm, toCsv } = await import("./store");
    expect(rsvpForm({ vip: false, partner: "" })).toBe("Standard");
    expect(rsvpForm({ vip: true, partner: "" })).toBe("VIP");
    expect(rsvpForm({ vip: false, partner: "nami" })).toBe("NAMI");
    const row = { name: "A Guest", email: "a@example.com", phone: "", organization: "", professionalRole: "", attendanceStatus: "attending" as const, communityDay: false, guestCount: 1, notes: "", id: "x", submittedAt: "2026-10-02T00:00:00.000Z", source: "form" as const, partner: "nami" as const };
    expect(toCsv(withRsvpForm([row]), rsvpCsvColumns).split("\r\n")[1]).toContain(",NAMI,");
  });
});
