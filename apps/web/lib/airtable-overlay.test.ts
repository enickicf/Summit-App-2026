import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { event2026Snapshot } from "@not-alone/test-fixtures/event-2026";
import { airtableFields as f, airtableCategories, isPublicAirtablePerson } from "./airtable";
import { airtableOverlay, sessionEndUtc, withAirtable } from "./airtable-overlay";

// These tests exercise the Airtable schedule path; production follows the owner's Google Doc (Sept 22).
beforeEach(() => vi.stubEnv("SCHEDULE_SOURCE", "airtable"));

const tables = { tables: [
  { id: "tblTalent", fields: Object.values(f.talent).map(id => ({ id })) },
  { id: "tblRos", fields: Object.values(f.schedule).map(id => ({ id })) },
  { id: "tblPartners", fields: Object.values(f.partners).map(id => ({ id })) }
] };
const records: Record<string, unknown[]> = {
  tblTalent: [
    { id: "recAAAAAAAAAAAAAA", fields: { [f.talent.name]: "Jewel", [f.talent.status]: "Confirmed", [f.talent.grouping]: ["Co-Chair", "Musician", "Executive Producer", "A-Talent"], [f.talent.title]: "Singer-songwriter", [f.talent.bio]: "Full Airtable bio.", [f.talent.headshot]: [{ url: "https://example.test/j.jpg" }] } },
    { id: "recBBBBBBBBBBBBBB", fields: { [f.talent.name]: "Staff Person", [f.talent.status]: "Confirmed", [f.talent.grouping]: ["Staff"] } },
    { id: "recCCCCCCCCCCCCCC", fields: { [f.talent.name]: "Pending Expert", [f.talent.status]: "Invited", [f.talent.grouping]: ["Expert"] } }
  ],
  tblRos: [
    { id: "recDDDDDDDDDDDDDD", fields: { [f.schedule.activity]: "Awards Show", [f.schedule.start]: "2026-11-03T04:00:00.000Z", [f.schedule.end]: "10 PM", [f.schedule.location]: "Encore Theater" } },
    { id: "recEEEEEEEEEEEEEE", fields: { [f.schedule.activity]: "Load-in", [f.schedule.start]: "2026-11-02T16:00:00.000Z" } }
  ],
  tblPartners: [{ id: "recFFFFFFFFFFFFFF", fields: { [f.partners.name]: "Glow", [f.partners.select]: "Gifting Suite", [f.partners.status]: "Confirmed" } }]
};

beforeEach(() => {
  vi.stubEnv("AIRTABLE_TOKEN", "test-token");
  vi.stubGlobal("fetch", vi.fn(async (url: string) => {
    const path = new URL(url).pathname;
    const body = path.includes("/meta/") ? tables : { records: records[path.split("/").pop()!] ?? [] };
    return new Response(JSON.stringify(body), { status: 200 });
  }));
});
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe("Airtable Website Grouping rubric", () => {
  it("maps public groups to website categories and never lists staff or unconfirmed people", () => {
    expect(airtableCategories(["Co-Chair", "Musician", "Executive Producer"])).toEqual(["Co-Chairs", "Musicians", "Executive Producers"]);
    expect(airtableCategories(["A-Talent"])).toEqual(["Talent"]);
    expect(airtableCategories(["Staff", "Press", "Guest", "Sponsor"])).toEqual([]);
    expect(isPublicAirtablePerson({ recordId: "r", name: "x", status: "Invited", groups: ["Expert"], occupation: "", organization: "", title: "", bio: "", hasHeadshot: false })).toBe(false);
  });
});

describe("withAirtable", () => {
  it("replaces people, schedule and partners from Airtable read-only", async () => {
    const next = await withAirtable(event2026Snapshot);
    expect(next.speakers.map(s => s.name)).toEqual(["Jewel"]);
    expect(next.speakers[0]).toMatchObject({ bio: "Full Airtable bio.", role: "Singer-songwriter", headshotUrl: "/api/airtable/headshot/recAAAAAAAAAAAAAA" });
    const overlay = airtableOverlay(next)!;
    expect(overlay.people!.get("jewel")).toMatchObject({ featured: true, categories: ["Co-Chairs", "Musicians", "Executive Producers"] });
    expect(next.scheduleItems.map(item => item.title)).toEqual(["Awards Show"]);
    expect(next.scheduleItems[0]!.endUtc).toBe("2026-11-03T06:00:00.000Z");
    expect(overlay.partners).toEqual([{ recordId: "recFFFFFFFFFFFFFF", name: "Glow", item: "", group: "Gifting Suite", status: "Confirmed" }]);
    for (const call of vi.mocked(fetch).mock.calls) expect((call[1] as RequestInit).method ?? "GET").toBe("GET");
  });
  it("leaves a newer staff publication unchanged without a token", async () => {
    vi.stubEnv("AIRTABLE_TOKEN", "");
    const newer = { ...event2026Snapshot, revision: event2026Snapshot.revision + 1 };
    expect(await withAirtable(newer)).toBe(newer);
  });
  it("replaces the stale revision-9 schedule with the recorded Airtable Run of Show without a token", async () => {
    vi.stubEnv("AIRTABLE_TOKEN", "");
    const next = await withAirtable({ ...event2026Snapshot, revision: 9 });
    const at = (title: string) => next.scheduleItems.filter(item => item.title === title).map(item => item.startUtc);
    const one = (title: string) => next.scheduleItems.find(item => item.title === title)!;
    expect(at("Poker Night")).toEqual(["2026-11-02T03:00:00.000Z"]); // Nov 1, 7:00 PM PST
    // Oct 7 read (Bianca's restructure): doors 6:30, the Awards 7:30-10:00 with no Pre-Show row, Nevada Mental Health Day 3:00.
    expect(at("Awards Show Doors Open")).toEqual(["2026-11-03T02:30:00.000Z"]); // Nov 2, 6:30 PM
    expect(at("Awards Show")).toEqual(["2026-11-03T03:30:00.000Z"]); // 7:30 PM
    expect(one("Awards Show").endUtc).toBe("2026-11-03T06:00:00.000Z"); // 10:00 PM
    expect(at("Nevada Mental Health Day")).toEqual(["2026-11-02T23:00:00.000Z"]); // 3:00 PM
    expect(at("Wellness Activities & Check-In")).toEqual(["2026-11-02T20:00:00.000Z"]); // 12:00 PM
    expect(one("Wellness Activities & Check-In").endUtc).toBe("2026-11-03T01:00:00.000Z"); // 5:00 PM
    expect(at("Founders Cocktails")).toEqual(["2026-11-03T00:00:00.000Z"]); // 4:00 PM
    expect(at("Closing Dinner and Performance")).toEqual(["2026-11-05T03:00:00.000Z"]); // Nov 4, 7:00 PM
    expect(at("Evening Talk + Performance/Writer's Round")).toEqual(["2026-11-04T04:00:00.000Z"]); // Nov 3, 8:00 PM
    expect(at("High Tea")).toEqual(["2026-11-05T20:00:00.000Z"]);
    expect(next.scheduleItems.some(item => /load (in|out)|eagleman|red carpet|pre-show|speaker reception/i.test(item.title))).toBe(false);
    // Owner (Oct 7): the public schedule lists the day's blocks, not every Run of Show segment, until the team marks
    // segments "Public" in Airtable; attire rides along; private events say "Invite only"; the talent dinner reads "Dinner".
    expect(next.scheduleItems.some(item => /ray lewis|fitness 1|song break|hobbies panel/i.test(item.title))).toBe(false);
    expect((one("Awards Show") as { attire?: string }).attire).toBe("Semi-Formal with Flair");
    expect((one("Tennis") as { attire?: string }).attire).toBe("Athleisure");
    expect(next.scheduleItems.filter(item => item.title === "Summit Sessions").map(item => (item as { attire?: string }).attire)).toEqual(Array(4).fill("Chic Business Casual"));
    expect((one("Lunch") as { attire?: string }).attire).toBeUndefined();
    expect(one("Founders Cocktails").eligibilityScope).toEqual({ id: "invite-only", label: "Invite only" });
    expect(one("Founder's Dinner").eligibilityScope.label).toBe("Invite only");
    expect(at("Dinner")).toEqual(["2026-11-04T02:30:00.000Z"]); // "Dinner - talent" in Airtable, Nov 3 6:30 PM
    expect(one("Dinner").eligibilityScope.label).toBe("Invite only");
    expect(next.scheduleItems.filter(item => item.title === "Pet Partners Therapy")).toHaveLength(3);
  });
  it("parses Airtable end times without inventing missing ones", () => {
    expect(sessionEndUtc("2026-11-03T04:00:00.000Z", "10 PM")).toBe("2026-11-03T06:00:00.000Z");
    expect(sessionEndUtc("2026-11-03T04:00:00.000Z", "")).toBe("2026-11-03T04:00:00.000Z");
  });
});
