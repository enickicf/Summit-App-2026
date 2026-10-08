import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { memorySubmissionStore, rsvpCsvColumns, rsvpForm, rsvpPayloadSchema, rsvpsOfForm, rsvpTotals, toCsv, ustaRsvps, withRsvpForm, type RsvpSubmission } from "./store";
import { handleRsvpPost } from "../../app/api/rsvp/route";
import { StaffPortal } from "../../components/staff-portal";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }), usePathname: () => "/staff" }));

const base = {
  name: "USTA Guest",
  email: "guest@usta.example",
  phone: "702-555-0142",
  organization: "USTA",
  professionalRole: "Community Programs",
  invitedBy: "USTA",
  attendanceStatus: "attending" as const,
  attending: "both" as const,
  guestCount: 2,
  guests: [{ name: "Second Guest", email: "second@example.com", phone: "702-555-0143" }],
  heardFrom: "usta" as const,
  partner: "usta" as const,
};

const post = (body: object) => new Request("https://notaloneawards.org/api/rsvp", {
  method: "POST",
  headers: { "content-type": "application/json", origin: "https://not-alone-awards-rsvp-2026.netlify.app" },
  body: JSON.stringify(body),
});

describe("USTA Community Day + Awards RSVP", () => {
  it("validates, stores and labels the request without changing existing forms", async () => {
    expect(rsvpPayloadSchema.parse(base)).toMatchObject({ partner: "usta", heardFrom: "usta", attending: "both" });
    expect(rsvpPayloadSchema.safeParse({ ...base, partner: "unapproved" }).success).toBe(false);
    const store = memorySubmissionStore();
    const response = await handleRsvpPost(post(base), store, async () => {}, null);
    expect(response.status).toBe(200);
    const rows = await store.list("rsvp");
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ partner: "usta", communityDay: false, attending: "both" });
    expect(rsvpForm(rows[0]!)).toBe("USTA");
    expect(ustaRsvps(rows)).toHaveLength(1);
    expect(rsvpsOfForm(rows, "usta")).toHaveLength(1);
    expect(toCsv(withRsvpForm(rows), rsvpCsvColumns)).toContain(",USTA,");
  });

  it("has its own portal totals, section, badge and export", () => {
    const row: RsvpSubmission = { ...base, communityDay: false, notes: "", id: "usta-1", submittedAt: "2026-10-08T20:00:00.000Z", source: "form" };
    const totals = rsvpTotals([row]);
    expect(totals).toMatchObject({ ustaGuests: 1, ustaTickets: 2, communityDayGuests: 1, communityDayTickets: 2 });
    const html = renderToStaticMarkup(<StaffPortal rsvps={[row]} nominations={[]} poker={[]} workshops={[]} lineup={[]} generatedAt="2026-10-08T20:00:00.000Z" />);
    for (const text of ['id="usta-title"', "USTA tickets", ">USTA<", "USTA Guest", "form=usta"]) expect(html).toContain(text);
    expect(html.indexOf('id="usta"')).toBeLessThan(html.indexOf('id="tickets"'));
  });
});
