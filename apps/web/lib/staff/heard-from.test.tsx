import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { memorySubmissionStore, rsvpCsvColumns, rsvpPayloadSchema, toCsv, withRsvpForm, type RsvpSubmission } from "./store";
import { handleRsvpPost } from "../../app/api/rsvp/route";
import { StaffPortal } from "../../components/staff-portal";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }), usePathname: () => "/staff" }));
const base = { name: "Heard Guest", email: "heard@example.com", phone: "702-555-0100", organization: "Org", professionalRole: "Role", invitedBy: "Team", attendanceStatus: "attending", guestCount: 2 };
const post = (body: object) => new Request("https://notaloneawards.org/api/rsvp", { method: "POST", headers: { "content-type": "application/json", origin: "https://notaloneawards.org" }, body: JSON.stringify(body) });

describe("How did you hear about us? (owner, Oct 3, 2026)", () => {
  it("stores the answer, accepts forms that do not send it, and refuses unknown answers", async () => {
    for (const value of ["inspiring-children", "nami", "lake-las-vegas", "other"]) expect(rsvpPayloadSchema.parse({ ...base, heardFrom: value }).heardFrom).toBe(value);
    expect(rsvpPayloadSchema.parse(base).heardFrom).toBe("");
    expect(rsvpPayloadSchema.safeParse({ ...base, heardFrom: "radio" }).success).toBe(false);
    const store = memorySubmissionStore();
    expect((await handleRsvpPost(post({ ...base, heardFrom: "lake-las-vegas" }), store, async () => {}, null)).status).toBe(200);
    expect((await store.list("rsvp"))[0]!.heardFrom).toBe("lake-las-vegas");
  });
  it("shows it in the portal and the CSV", () => {
    const row: RsvpSubmission = { ...base, attendanceStatus: "attending", communityDay: false, notes: "", id: "h1", submittedAt: "2026-10-03T10:00:00.000Z", source: "form", heardFrom: "nami" };
    expect(rsvpCsvColumns).toContain("heardFromLabel");
    expect(toCsv(withRsvpForm([row]), rsvpCsvColumns)).toContain(",NAMI,");
    const html = renderToStaticMarkup(<StaffPortal rsvps={[row]} nominations={[]} poker={[]} workshops={[]} lineup={[]} generatedAt="2026-10-03T12:00:00.000Z" />);
    expect(html).toContain("<th>Heard from</th>"); expect(html).toContain("<td>NAMI</td>");
  });
});

describe("confirmation email tools in the portal (owner, Oct 3, 2026)", () => {
  it("shows the test and catch-up buttons", () => {
    const html = renderToStaticMarkup(<StaffPortal rsvps={[]} nominations={[]} poker={[]} workshops={[]} lineup={[]} generatedAt="2026-10-03T12:00:00.000Z" />);
    for (const text of ['id="confirmation-emails"', "Send test", "Send to earlier RSVPs", "Preview the email"]) expect(html).toContain(text);
  });
});
