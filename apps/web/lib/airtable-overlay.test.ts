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
    expect(at("Poker Night")).toEqual(["2026-11-02T03:00:00.000Z"]); // Nov 1, 7:00 PM PST
    expect(at("Doors Open")).toEqual(["2026-11-03T02:30:00.000Z"]); // Nov 2, 6:30 PM
    expect(at("Closing Celebration")).toEqual(["2026-11-05T02:30:00.000Z"]);
    expect(at("High Tea")).toEqual(["2026-11-05T20:00:00.000Z"]);
    expect(next.scheduleItems.some(item => /load (in|out)|mike'?s bikes|eagleman/i.test(item.title))).toBe(false);
  });
  it("parses Airtable end times without inventing missing ones", () => {
    expect(sessionEndUtc("2026-11-03T04:00:00.000Z", "10 PM")).toBe("2026-11-03T06:00:00.000Z");
    expect(sessionEndUtc("2026-11-03T04:00:00.000Z", "")).toBe("2026-11-03T04:00:00.000Z");
  });
});
