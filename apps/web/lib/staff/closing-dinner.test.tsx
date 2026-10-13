import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { handleClosingDinnerPost } from "../../app/api/closing-dinner/route";
import { closingDinnerCsvColumns, closingDinnerSeats, closingDinnerTotals, memorySubmissionStore, toCsv } from "./store";
import { StaffPortal } from "../../components/staff-portal";

// Owner / Ryan (Oct 13): closing night dinner with Jewel (Nov 4): request form, own store kind, portal tab, CSV.
const post = (body: unknown, store = memorySubmissionStore()) => handleClosingDinnerPost(new Request("https://notaloneawards.org/api/closing-dinner", { method: "POST", headers: { "Content-Type": "application/json", Origin: "https://notaloneawards.org" }, body: JSON.stringify(body) }), store);
const base = { name: "Test Guest", email: "t@example.com", phone: "702-555-0100", organization: "Example Org", professionalRole: "Director" };

describe("closing dinner requests", () => {
  it("stores a request without a guest as one seat", async () => {
    const store = memorySubmissionStore();
    const response = await post({ ...base, textConsent: "yes", guestName: "Ignored" }, store);
    expect(response.status).toBe(201);
    const [record] = await store.list("closingDinner");
    expect(record).toMatchObject({ name: "Test Guest", bringingGuest: false, guestName: "", textConsent: true });
    expect(closingDinnerSeats(record!)).toBe(1);
  });
  it("requires the guest's name, email and phone when bringing a guest", async () => {
    const store = memorySubmissionStore();
    const missing = await post({ ...base, bringingGuest: "yes", guestName: "Plus One", guestEmail: "p@example.com" }, store);
    expect(missing.status).toBe(400);
    expect((await missing.json()).field).toBe("guestPhone");
    expect(await store.list("closingDinner")).toHaveLength(0);
    expect((await post({ ...base, bringingGuest: "yes", guestName: "Plus One", guestEmail: "p@example.com", guestPhone: "702 555 0101" }, store)).status).toBe(201);
    expect(closingDinnerTotals(await store.list("closingDinner"))).toMatchObject({ requests: 1, seatsRequested: 2, withGuest: 1 });
  });
  it("requires organization, title and phone, and ignores the honeypot", async () => {
    const store = memorySubmissionStore();
    expect((await post({ ...base, organization: "" }, store)).status).toBe(400);
    expect((await post({ ...base, professionalRole: "" }, store)).status).toBe(400);
    expect((await post({ ...base, phone: "12" }, store)).status).toBe(400);
    expect((await post({ ...base, website: "spam" }, store)).status).toBe(201);
    expect(await store.list("closingDinner")).toHaveLength(0);
  });
  it("counts each email once and shows the portal tab", () => {
    const rows = [
      { ...base, bringingGuest: false, guestName: "", guestEmail: "", guestPhone: "", notes: "", id: "1", submittedAt: "2026-10-13T18:00:00Z", source: "form" as const },
      { ...base, bringingGuest: true, guestName: "Plus One", guestEmail: "p@example.com", guestPhone: "7025550101", notes: "", id: "2", submittedAt: "2026-10-13T19:00:00Z", source: "form" as const }
    ];
    expect(closingDinnerTotals(rows)).toMatchObject({ formsSubmitted: 2, requests: 1, seatsRequested: 2 });
    expect(toCsv(rows.map(row => ({ ...row, seats: closingDinnerSeats(row) })), closingDinnerCsvColumns).split("\r\n")[0]).toContain("guestName,guestEmail,guestPhone");
    const html = renderToStaticMarkup(<StaffPortal rsvps={[]} nominations={[]} poker={[]} closingDinner={rows} lineup={[]} generatedAt="2026-10-13T20:00:00Z" />);
    expect(html).toContain("Closing Dinner");
    expect(html).toContain("kind=closing-dinner");
    expect(html).toContain("Plus One");
  });
});

describe("nomination form text consent (Oct 13)", () => {
  it("keeps the box", async () => {
    const { nominationPayloadSchema } = await import("./store");
    const base = { nominatorName: "Test Person", nominatorEmail: "n@example.com", nominatorPhone: "7025550100", nomineeName: "Some One", category: "Pioneer", reason: "Because." };
    expect(nominationPayloadSchema.parse({ ...base, textConsent: "yes" }).textConsent).toBe(true);
    expect(nominationPayloadSchema.parse(base).textConsent).toBeUndefined();
  });
});
