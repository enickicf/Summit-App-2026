import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }), usePathname: () => "/schedule", useSearchParams: () => new URLSearchParams() }));
import { isWorkshopSignup, signatureMatchesName, signupOpenByCategory, signupOpenFor, siteVisitActivity, siteVisitWaiver, waiverRequiredFor, workshopCategory, workshopExclusivityNote } from "./morning-workshops";
import { handleWorkshopPost } from "../app/api/workshops/route";
import { memorySubmissionStore, newSubmission, siteVisitCsvColumns, siteVisitWaiverProblem, toCsv, workshopCsvColumns, workshopPayloadSchema, type SubmissionStore, type WorkshopSubmission } from "./staff/store";
import { StaffPortal, groupSiteVisit, groupWorkshops } from "../components/staff-portal";
import { WorkshopSignup } from "../components/workshop-signup";

const post = (store: SubmissionStore, body: unknown) => handleWorkshopPost(new Request("https://notalonesummit.org/api/workshops", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }), store);
const wellness = { sessionId: "s1", sessionTitle: "Wellness Activity", sessionDay: "Tuesday, November 3", sessionTime: "8:00 AM", name: "Lisa Lundt" };
const tennis = { sessionId: "t1", sessionTitle: "Tennis (ICF Site Visit)", sessionDay: "Thursday, November 5", sessionTime: "10:00 AM", name: "Lisa Lundt" };
const signed = { ...tennis, waiverAccepted: true, signature: "Lisa Lundt", waiverVersion: siteVisitWaiver.version };

describe("workshop + Tennis / High Tea sign-ups (owner, Sept 28; Tennis / High Tea back with a waiver, Oct 7)", () => {
  it("opens sign-up only for Tennis and High Tea; the wellness workshops stay closed (owner, Oct 5 / Oct 7)", () => {
    expect(workshopCategory("Wellness & Community Programming")).toBe("workshop");
    expect(workshopCategory("Wellness Activity")).toBe("workshop");
    expect(workshopCategory("Tennis (ICF Site Visit)")).toBe("siteVisit");
    expect(workshopCategory("High Tea (ICF Site Visit)")).toBe("siteVisit");
    expect(signupOpenByCategory).toEqual({ workshop: false, siteVisit: true });
    for (const title of ["Summit Sessions", "Lunch", "Awards Show", "Poker Night", "Founders Dinner", "Break"]) expect(isWorkshopSignup({ title }), title).toBe(false);
    for (const title of ["Wellness & Community Programming", "Wellness Activity"]) { expect(isWorkshopSignup({ title }), title).toBe(false); expect(signupOpenFor(title), title).toBe(false); }
    for (const title of ["Tennis (ICF Site Visit)", "High Tea (ICF Site Visit)"]) { expect(isWorkshopSignup({ title }), title).toBe(true); expect(signupOpenFor(title), title).toBe(true); }
    expect(siteVisitActivity("Tennis (ICF Site Visit)")).toBe("tennis");
    expect(siteVisitActivity("High Tea (ICF Site Visit)")).toBe("highTea");
    // Only the site visit asks for the waiver; the wellness workshops (if they ever reopen) stay name-only.
    expect(waiverRequiredFor("siteVisit")).toBe(true);
    expect(waiverRequiredFor("workshop")).toBe(false);
    expect(waiverRequiredFor(null)).toBe(false);
  });

  it("waiver: the owner's short text, versioned; the typed signature must be the full name entered (case and spacing aside)", () => {
    expect(siteVisitWaiver.version).toBe("2026-10-07");
    expect(siteVisitWaiver.text).toContain("Participation in this activity is voluntary and at my own risk.");
    expect(siteVisitWaiver.text).toContain("release the Inspiring Children Foundation, the Not Alone Summit and their partners and venues from liability");
    expect(siteVisitWaiver.text).toContain("to the extent permitted by law");
    expect(signatureMatchesName("Lisa Lundt", "Lisa Lundt")).toBe(true);
    expect(signatureMatchesName("  lisa   LUNDT ", "Lisa Lundt")).toBe(true);
    expect(signatureMatchesName("Lisa L", "Lisa Lundt")).toBe(false);
    expect(signatureMatchesName("", "")).toBe(false);
    expect(siteVisitWaiverProblem({ name: "Lisa Lundt", waiverAccepted: true, signature: "lisa lundt", waiverVersion: "2026-10-07" })).toBeNull();
    expect(siteVisitWaiverProblem({ name: "Lisa Lundt", waiverAccepted: undefined, signature: "Lisa Lundt", waiverVersion: "2026-10-07" })?.field).toBe("waiverAccepted");
    expect(siteVisitWaiverProblem({ name: "Lisa Lundt", waiverAccepted: true, signature: "Natasha Buonanno", waiverVersion: "2026-10-07" })).toMatchObject({ field: "signature", error: expect.stringContaining("match") });
    expect(siteVisitWaiverProblem({ name: "Lisa Lundt", waiverAccepted: true, signature: "Lisa Lundt", waiverVersion: undefined })?.field).toBe("waiverVersion");
  });

  it("renders the Tennis / High Tea form in order: full name, exclusivity note, waiver, agree box, typed signature, Sign up", () => {
    const item = { id: "t1", title: "Tennis (ICF Site Visit)", startUtc: "2026-11-05T18:00:00.000Z" };
    const closed = renderToStaticMarkup(<WorkshopSignup item={item} eventTimeZone="America/Los_Angeles" />);
    expect(closed).toContain(">Sign up<");
    expect(closed).not.toContain("waiver");
    const html = renderToStaticMarkup(<WorkshopSignup item={item} eventTimeZone="America/Los_Angeles" defaultOpen />);
    const order = ["Your full name", 'name="name"', workshopExclusivityNote, siteVisitWaiver.text, 'type="checkbox"', "I have read and agree to the waiver", "Type your full name to sign", 'name="signature"', 'type="submit"'];
    const positions = order.map(needle => html.indexOf(needle));
    for (const [index, needle] of order.entries()) expect(positions[index], needle).toBeGreaterThan(-1);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
    expect(html).toContain('name="waiverAccepted"');
    expect(html).toContain('name="website"'); // honeypot stays
    expect(html).not.toContain("email");
    expect(workshopExclusivityNote).toContain("exclusive to attendees of the Not Alone Summit");
    expect(workshopExclusivityNote).toContain("invitation-only");
    expect(workshopExclusivityNote).toContain("will be removed");
    // A wellness workshop (closed today) would still be a name-only form: no waiver block.
    const wellnessHtml = renderToStaticMarkup(<WorkshopSignup item={{ id: "s1", title: "Wellness Activity", startUtc: "2026-11-03T16:00:00.000Z" }} eventTimeZone="America/Los_Angeles" defaultOpen />);
    expect(wellnessHtml).toContain('name="name"');
    expect(wellnessHtml).not.toContain('name="waiverAccepted"');
    expect(wellnessHtml).not.toContain('name="signature"');
  });

  it("API: wellness is refused with 410; Tennis / High Tea need the signed waiver (400 otherwise) and store it", async () => {
    const store = memorySubmissionStore();
    expect((await post(store, wellness)).status).toBe(410);
    expect((await post(store, { ...wellness, waiverAccepted: true, signature: "Lisa Lundt", waiverVersion: siteVisitWaiver.version })).status).toBe(410);
    let response = await post(store, tennis); // no waiver at all
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ ok: false, field: "waiverAccepted", error: expect.stringContaining("waiver") });
    response = await post(store, { ...signed, waiverAccepted: false });
    expect(response.status).toBe(400);
    expect((await response.json()).field).toBe("waiverAccepted");
    response = await post(store, { ...signed, signature: "L" });
    expect(response.status).toBe(400);
    expect((await response.json()).field).toBe("signature");
    response = await post(store, { ...signed, signature: "Natasha Buonanno" });
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ ok: false, field: "signature", error: expect.stringContaining("match") });
    response = await post(store, { ...signed, waiverVersion: "" });
    expect(response.status).toBe(400);
    expect((await response.json()).field).toBe("waiverVersion");
    expect((await post(store, { ...signed, sessionTitle: "Lunch" })).status).toBe(400);
    expect((await post(store, { ...signed, name: "L" })).status).toBe(400);
    expect(await store.list("workshop")).toHaveLength(0);
    // Honeypot: pretend success, store nothing.
    expect((await post(store, { ...signed, website: "https://spam.example" })).status).toBe(200);
    expect(await store.list("workshop")).toHaveLength(0);
    // Complete sign-ups: the waiver is stored with the record; the signature is matched case- and spacing-insensitively.
    response = await post(store, signed);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect((await post(store, { ...signed, sessionId: "h1", sessionTitle: "High Tea (ICF Site Visit)", sessionTime: "11:30 AM", signature: " lisa  lundt " })).status).toBe(200);
    const records = await store.list("workshop");
    expect(records).toHaveLength(2);
    const tennisRecord = records.find(record => record.sessionId === "t1")!;
    expect(tennisRecord).toMatchObject({ category: "siteVisit", name: "Lisa Lundt", sessionTitle: "Tennis (ICF Site Visit)", waiverAccepted: true, signature: "Lisa Lundt", waiverVersion: "2026-10-07", source: "form" });
    expect(tennisRecord.waiverAcceptedAt).toBe(tennisRecord.submittedAt);
    expect(records.find(record => record.sessionId === "h1")).toMatchObject({ waiverAccepted: true, signature: "lisa  lundt" });
    // The payload rules for the (closed) wellness workshops are unchanged: name only, two characters or more.
    expect(workshopPayloadSchema.safeParse({ sessionId: "s1", sessionTitle: "Wellness Activity", name: "Ok Name" }).success).toBe(true);
    expect(workshopPayloadSchema.safeParse({ sessionId: "s1", sessionTitle: "Wellness Activity", name: "L" }).success).toBe(false);
    expect(workshopPayloadSchema.parse({ sessionId: "s1", sessionTitle: "Wellness Activity", name: "Ok Name" })).not.toHaveProperty("waiverAccepted");
  });

  it("portal: workshops grouped by session; Tennis / High Tea per person with badges and the signed waiver (— for older sign-ups)", () => {
    const mk = (over: Partial<WorkshopSubmission>): WorkshopSubmission => ({ ...newSubmission({ sessionId: "s1", sessionTitle: "Wellness Activity", sessionDay: "Tuesday, November 3", sessionTime: "8:00 AM", name: "Lisa Lundt", category: "workshop" as const }), ...over });
    const rows = [
      mk({ id: "w1", submittedAt: "2026-10-01T10:00:00.000Z" }),
      mk({ id: "w2", submittedAt: "2026-10-01T11:00:00.000Z", name: "Natasha Buonanno" }),
      mk({ id: "w3", submittedAt: "2026-10-02T10:00:00.000Z", sessionTitle: "Wellness & Community Programming", sessionDay: "Monday, November 2", sessionTime: "12:00 PM", name: "Natasha Buonanno" }),
      // Oct 3: a sign-up from before the waiver existed (no waiver fields at all).
      mk({ id: "t1", submittedAt: "2026-10-03T10:00:00.000Z", sessionTitle: "Tennis (ICF Site Visit)", sessionDay: "Thursday, November 5", sessionTime: "10:00 AM", category: "siteVisit" }),
      // Oct 7: the same person signs the waiver with her High Tea sign-up.
      mk({ id: "t2", submittedAt: "2026-10-07T10:05:00.000Z", sessionTitle: "High Tea (ICF Site Visit)", sessionDay: "Thursday, November 5", sessionTime: "11:30 AM", name: "lisa lundt", category: "siteVisit", waiverAccepted: true, signature: "Lisa Lundt", waiverVersion: "2026-10-07", waiverAcceptedAt: "2026-10-07T10:05:00.000Z" }),
      mk({ id: "t3", submittedAt: "2026-10-03T10:10:00.000Z", sessionTitle: "High Tea (ICF Site Visit)", sessionDay: "Thursday, November 5", sessionTime: "11:30 AM", name: "Natasha Buonanno", category: "siteVisit" })
    ];
    const groups = groupWorkshops(rows.filter(r => r.category === "workshop"));
    expect(groups.map(g => [g.title, g.people.map(p => p.name)])).toEqual([["Wellness & Community Programming", ["Natasha Buonanno"]], ["Wellness Activity", ["Lisa Lundt", "Natasha Buonanno"]]]);
    const people = groupSiteVisit(rows.filter(r => r.category === "siteVisit"));
    expect(people.map(p => [p.name, p.tennis, p.highTea, p.signature])).toEqual([["Lisa Lundt", true, true, "Lisa Lundt"], ["Natasha Buonanno", false, true, undefined]]);
    const html = renderToStaticMarkup(<StaffPortal rsvps={[]} nominations={[]} poker={[]} workshops={rows} lineup={[]} generatedAt="2026-10-03T12:00:00.000Z" />);
    const workshopsSection = html.slice(html.indexOf('data-view="workshops"'), html.indexOf('data-view="site-visit"'));
    const visit = html.slice(html.indexOf('data-view="site-visit"'), html.indexOf('data-view="poker"'));
    expect(workshopsSection).toContain("Wellness Activity"); expect(workshopsSection).not.toContain("Tennis");
    expect(visit).toContain(">Tennis</span>"); expect(visit).toContain(">High Tea</span>"); expect(visit).toContain("Lisa Lundt");
    expect(visit).toContain("<th>Waiver</th>");
    expect(visit).toContain("Signed: Lisa Lundt");
    expect(visit.match(/Signed: /g)).toHaveLength(1); // Natasha's older sign-up has no waiver and shows —
    expect(visit.slice(visit.indexOf("Natasha Buonanno"))).toContain(">—</span>");
    expect(html).toContain('href="#site-visit"');
    // CSV for Tennis & High Tea: the waiver columns, empty for the older sign-up.
    const csv = toCsv(rows.filter(r => r.category === "siteVisit"), siteVisitCsvColumns);
    expect(csv.split("\r\n")[0]).toBe([...workshopCsvColumns, "waiverAccepted", "signature", "waiverVersion"].join(","));
    expect(csv).toContain(",t2,true,Lisa Lundt,2026-10-07\r\n");
    expect(csv).toContain(",s1,form,t1,,,\r\n"); // the Oct 3 sign-up: no waiver columns filled
  });
});
