import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { memorySubmissionStore, newSubmission, rsvpCsvColumns, toCsv, withRsvpForm, type RsvpSubmission } from "./store";
import { handleRsvpPost } from "../../app/api/rsvp/route";
import { StaffPortal } from "../../components/staff-portal";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }), usePathname: () => "/staff" }));

// Owner (Oct 5, 2026): "make it up to 10 just make them submit data for all of the 10 people including phone
// name and email". The form sends the additional people as "guests"; the person filling it in is the first.
const post = (body: unknown) => new Request("https://notalonesummit.org/api/rsvp", { method: "POST", headers: { "content-type": "application/json", origin: "https://notaloneawards.org" }, body: JSON.stringify(body) });
const base = { name: "Dana Rivera", email: "dana@example.com", phone: "702-555-0140", attendanceStatus: "attending", communityDay: "on", notes: "", website: "" };
const guest = (n: number) => ({ name: `Guest Number${n}`, email: `Guest${n}@Example.com `, phone: `702-555-01${40 + n}` });
const submit = async (body: unknown) => {
  const store = memorySubmissionStore();
  const forwarded: unknown[] = [];
  const response = await handleRsvpPost(post(body), store, async payload => { forwarded.push(payload); }, null);
  return { response, json: await response.json() as { ok: boolean; error?: string }, stored: await store.list("rsvp"), forwarded };
};

describe("every person in a party gives a name, email and phone (owner, Oct 5)", () => {
  it("stores the guests of a party with their own details", async () => {
    const { response, stored } = await submit({ ...base, guestCount: "3", guests: [guest(1), guest(2)] });
    expect(response.status).toBe(200);
    expect(stored).toHaveLength(1);
    expect(stored[0]!.guestCount).toBe(3);
    expect(stored[0]!.guests).toEqual([
      { name: "Guest Number1", email: "guest1@example.com", phone: "702-555-0141" },
      { name: "Guest Number2", email: "guest2@example.com", phone: "702-555-0142" }
    ]);
  });

  it("accepts a full party of ten and nothing larger", async () => {
    const ten = await submit({ ...base, guestCount: "10", guests: Array.from({ length: 9 }, (_, index) => guest(index + 1)) });
    expect(ten.response.status).toBe(200);
    expect(ten.stored[0]!.guests).toHaveLength(9);
    const eleven = await submit({ ...base, guestCount: "11", guests: Array.from({ length: 10 }, (_, index) => guest(index + 1)) });
    expect(eleven.response.status).toBe(400);
    expect(eleven.stored).toHaveLength(0);
  });

  it("turns away a party whose guests are missing or incomplete, and stores nothing", async () => {
    const message = "Please add the full name, a valid email and a phone number for every person in your party.";
    for (const guests of [[], [guest(1)], [guest(1), { ...guest(2), phone: " " }], [guest(1), { ...guest(2), email: "not-an-email" }], [guest(1), { ...guest(2), name: "" }], [guest(1), guest(2), guest(3)]]) {
      const { response, json, stored } = await submit({ ...base, guestCount: "3", guests });
      expect(response.status, JSON.stringify(guests)).toBe(400);
      expect(json.error).toBe(message);
      expect(stored).toHaveLength(0);
    }
  });

  it("rejects missing primary phone and invalid guest phones before saving", async () => {
    for (const body of [{...base,phone:""},{...base,phone:"abc"},{...base,guestCount:2,guests:[{...guest(1),phone:"abc"}]}]) {
      const {response,stored}=await submit(body);expect(response.status).toBe(400);expect(stored).toHaveLength(0);
    }
  });
  it("needs no guest list for a single ticket", async () => {
    const { response, stored } = await submit({ ...base, guestCount: "1", guests: [] });
    expect(response.status).toBe(200);
    expect(stored[0]!.guests).toEqual([]);
  });

  it("rejects new submissions that omit the required guest list even from cached forms", async () => {
    const { response, stored } = await submit({ ...base, guestCount: "4" });
    expect(response.status).toBe(400);
    expect(stored).toHaveLength(0);
  });

  it("keeps sending the previous backend the fields it always received, without the guest list", async () => {
    const { forwarded } = await submit({ ...base, guestCount: "2", guests: [guest(1)] });
    expect(forwarded).toHaveLength(1);
    expect(forwarded[0]).toMatchObject({ name: "Dana Rivera", guestCount: "2" });
    expect(forwarded[0]).not.toHaveProperty("guests");
  });

  it("lists each guest under the person who sent the request and in the spreadsheet", () => {
    const row: RsvpSubmission = { ...newSubmission({ name: "Dana Rivera", email: "dana@example.com", phone: "702-555-0140", organization: "", professionalRole: "", attendanceStatus: "attending" as const, communityDay: true, guestCount: 3, notes: "",
      guests: [{ name: "Sam Rivera", email: "sam@example.com", phone: "702-555-0141" }, { name: "Alex \"AJ\" Rivera", email: "aj@example.com", phone: "702-555-0142" }] }), id: "p1" };
    const older: RsvpSubmission = { ...newSubmission({ name: "Lisa Lundt", email: "lisa@example.com", phone: "", organization: "", professionalRole: "", attendanceStatus: "attending" as const, communityDay: false, guestCount: 3, notes: "" }), id: "p2" };
    const html = renderToStaticMarkup(<StaffPortal rsvps={[row, older]} nominations={[]} poker={[]} workshops={[]} lineup={[]} generatedAt="2026-10-05T20:00:00.000Z" />);
    expect(html).toContain("<span>Sam Rivera</span> · <a href=\"mailto:sam@example.com\">sam@example.com</a> · 702-555-0141");
    expect(html).toContain("aj@example.com");
    expect(rsvpCsvColumns).toContain("guestDetails");
    const csv = toCsv(withRsvpForm([row, older]), rsvpCsvColumns);
    expect(csv).toContain("Sam Rivera <sam@example.com> 702-555-0141; Alex \"\"AJ\"\" Rivera <aj@example.com> 702-555-0142");
    // A request from before Oct 5 has a party size and an empty guest cell.
    const lisa = csv.split("\r\n").find(line => line.includes("lisa@example.com"))!;
    expect(lisa.split(",")[rsvpCsvColumns.indexOf("guestDetails")]).toBe("");
  });
});
