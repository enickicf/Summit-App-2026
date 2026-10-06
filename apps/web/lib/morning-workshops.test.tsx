import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }), usePathname: () => "/schedule", useSearchParams: () => new URLSearchParams() }));
import { isWorkshopSignup, siteVisitActivity, workshopCategory, workshopExclusivityNote, workshopSignupsOpen } from "./morning-workshops";
import { handleWorkshopPost } from "../app/api/workshops/route";
import { memorySubmissionStore, newSubmission, workshopPayloadSchema, type WorkshopSubmission } from "./staff/store";
import { StaffPortal, groupSiteVisit, groupWorkshops } from "../components/staff-portal";
import { WorkshopSignup } from "../components/workshop-signup";

describe("workshop + Tennis / High Tea sign-ups (owner, Sept 28)", () => {
  it("opens sign-up only for the wellness workshops and the Thursday site visit", () => {
    expect(workshopCategory("Wellness & Community Programming")).toBe("workshop");
    expect(workshopCategory("Wellness Activity")).toBe("workshop");
    expect(workshopCategory("Tennis (ICF Site Visit)")).toBe("siteVisit");
    expect(workshopCategory("High Tea (ICF Site Visit)")).toBe("siteVisit");
    for (const title of ["Summit Sessions", "Lunch", "Awards Show", "Poker Night", "Founders Dinner", "Break"]) expect(isWorkshopSignup({ title }), title).toBe(false);
    // Owner (Oct 5): sign-ups are closed for now, so no session shows a Sign up button.
    expect(workshopSignupsOpen).toBe(false);
    for (const title of ["Wellness & Community Programming", "Wellness Activity", "Tennis (ICF Site Visit)", "High Tea (ICF Site Visit)"]) expect(isWorkshopSignup({ title }), title).toBe(false);
    expect(siteVisitActivity("Tennis (ICF Site Visit)")).toBe("tennis");
    expect(siteVisitActivity("High Tea (ICF Site Visit)")).toBe("highTea");
  });

  it("renders the name-only form with the exclusivity wording", () => {
    const html = renderToStaticMarkup(<WorkshopSignup item={{ id: "s1", title: "Wellness Activity", startUtc: "2026-11-03T16:00:00.000Z" }} eventTimeZone="America/Los_Angeles" />);
    expect(html).toContain(">Sign up<");
    expect(html).not.toContain("email");
    expect(workshopExclusivityNote).toContain("exclusive to attendees of the Not Alone Summit");
    expect(workshopExclusivityNote).toContain("invitation-only");
    expect(workshopExclusivityNote).toContain("will be removed");
  });

  it("refuses new sign-ups while they are closed (owner, Oct 5) and keeps the payload rules for when they reopen", async () => {
    const store = memorySubmissionStore();
    const post = (body: unknown) => handleWorkshopPost(new Request("https://notalonesummit.org/api/workshops", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }), store);
    expect((await post({ sessionId: "s1", sessionTitle: "Wellness Activity", sessionDay: "Tuesday, November 3", sessionTime: "8:00 AM", name: "Lisa Lundt" })).status).toBe(410);
    expect((await post({ sessionId: "t1", sessionTitle: "Tennis (ICF Site Visit)", sessionDay: "Thursday, November 5", sessionTime: "10:00 AM", name: "Lisa Lundt" })).status).toBe(410);
    expect(await store.list("workshop")).toHaveLength(0);
    expect(workshopPayloadSchema.safeParse({ sessionId: "s1", sessionTitle: "Wellness Activity", name: "Ok Name" }).success).toBe(true);
    expect(workshopPayloadSchema.safeParse({ sessionId: "s1", sessionTitle: "Wellness Activity", name: "L" }).success).toBe(false);
  });

  it("portal: workshops grouped by session; Tennis / High Tea per person with badges for one or both", () => {
    const mk = (over: Partial<WorkshopSubmission>): WorkshopSubmission => ({ ...newSubmission({ sessionId: "s1", sessionTitle: "Wellness Activity", sessionDay: "Tuesday, November 3", sessionTime: "8:00 AM", name: "Lisa Lundt", category: "workshop" as const }), ...over });
    const rows = [
      mk({ id: "w1", submittedAt: "2026-10-01T10:00:00.000Z" }),
      mk({ id: "w2", submittedAt: "2026-10-01T11:00:00.000Z", name: "Natasha Buonanno" }),
      mk({ id: "w3", submittedAt: "2026-10-02T10:00:00.000Z", sessionTitle: "Wellness & Community Programming", sessionDay: "Monday, November 2", sessionTime: "12:00 PM", name: "Natasha Buonanno" }),
      mk({ id: "t1", submittedAt: "2026-10-03T10:00:00.000Z", sessionTitle: "Tennis (ICF Site Visit)", sessionDay: "Thursday, November 5", sessionTime: "10:00 AM", category: "siteVisit" }),
      mk({ id: "t2", submittedAt: "2026-10-03T10:05:00.000Z", sessionTitle: "High Tea (ICF Site Visit)", sessionDay: "Thursday, November 5", sessionTime: "11:30 AM", name: "lisa lundt", category: "siteVisit" }),
      mk({ id: "t3", submittedAt: "2026-10-03T10:10:00.000Z", sessionTitle: "High Tea (ICF Site Visit)", sessionDay: "Thursday, November 5", sessionTime: "11:30 AM", name: "Natasha Buonanno", category: "siteVisit" })
    ];
    const groups = groupWorkshops(rows.filter(r => r.category === "workshop"));
    expect(groups.map(g => [g.title, g.people.map(p => p.name)])).toEqual([["Wellness & Community Programming", ["Natasha Buonanno"]], ["Wellness Activity", ["Lisa Lundt", "Natasha Buonanno"]]]);
    const people = groupSiteVisit(rows.filter(r => r.category === "siteVisit"));
    expect(people.map(p => [p.name, p.tennis, p.highTea])).toEqual([["Lisa Lundt", true, true], ["Natasha Buonanno", false, true]]);
    const html = renderToStaticMarkup(<StaffPortal rsvps={[]} nominations={[]} poker={[]} workshops={rows} lineup={[]} generatedAt="2026-10-03T12:00:00.000Z" />);
    const workshopsSection = html.slice(html.indexOf('data-view="workshops"'), html.indexOf('data-view="site-visit"'));
    const visit = html.slice(html.indexOf('data-view="site-visit"'), html.indexOf('data-view="poker"'));
    expect(workshopsSection).toContain("Wellness Activity"); expect(workshopsSection).not.toContain("Tennis");
    expect(visit).toContain(">Tennis</span>"); expect(visit).toContain(">High Tea</span>"); expect(visit).toContain("Lisa Lundt");
    expect(html).toContain('href="#site-visit"');
  });
});
