import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { event2026Snapshot } from "@not-alone/test-fixtures/event-2026";
import { airtableFields as f, airtableRefreshSeconds } from "./airtable";
import { airtableOverlay, withAirtable } from "./airtable-overlay";
import { awardsDisplayPeople } from "./awards-people";
import { directoryPeople } from "./people";
import { personNameKey } from "./person-portraits";
import { AwardsGuestDirectory } from "../components/awards-guest-directory";
import { Directory } from "../components/directory";
import { GET as headshot } from "../app/api/airtable/headshot/[record]/route";
import { airtableHeadshotCrops } from "./airtable-headshot-crops";

// These tests exercise the Airtable schedule path; production follows the owner's Google Doc (Sept 22).
beforeEach(() => vi.stubEnv("SCHEDULE_SOURCE", "airtable"));

vi.mock("next/navigation", () => ({ usePathname: () => "/", useSearchParams: () => new URLSearchParams(), useRouter: () => ({ refresh: vi.fn() }) }));

// Deep tests for the live Airtable connection (owner, Sept 21, 2026): Airtable edits must reach both
// 2026 websites automatically and keep the site's format. A fake Airtable answers the same REST calls
// the site makes; each test edits it between reads the way the team would edit the base.
type Row = { id: string; fields: Record<string, unknown> };
const tables = { tables: [
  { id: "tblTalent", fields: [...Object.values(f.talent).map(id => ({ id })), { id: "fldStageName000000", name: "Stage Name" }] },
  { id: "tblRos", fields: Object.values(f.schedule).map(id => ({ id })) },
  { id: "tblPartners", fields: Object.values(f.partners).map(id => ({ id })) }
] };
const person = (id: string, name: string, groups: string[], extra: Record<string, unknown> = {}): Row => ({ id,
  fields: { [f.talent.name]: name, [f.talent.status]: "Confirmed Attendance", [f.talent.grouping]: groups, [f.talent.title]: `${name} title`, [f.talent.bio]: `${name} bio from Airtable.`, [f.talent.headshot]: [{ url: `https://airtable.test/${id}.jpg`, type: "image/jpeg", thumbnails: { large: { url: `https://airtable.test/${id}-large.jpg` } } }], ...extra } });
const session = (id: string, title: string, start: string, end = ""): Row => ({ id, fields: { [f.schedule.activity]: title, [f.schedule.start]: start, [f.schedule.end]: end } });

let base: Record<string, Row[]>;
let calls: { url: string; init?: RequestInit }[];
let failing: Set<string>;
const pageSize = 3; // small pages so pagination is always exercised

beforeEach(() => {
  vi.stubEnv("AIRTABLE_TOKEN", "test-token");
  calls = [];
  failing = new Set();
  base = {
    tblTalent: [
      person("recAAAAAAAAAAAAA1", "Zed Headliner", ["Musician", "B - talent"]),
      person("recAAAAAAAAAAAAA2", "Amy Star", ["Musician", "A-Talent"]),
      person("recAAAAAAAAAAAAA3", "Dr. Expert", ["Expert"]),
      person("recAAAAAAAAAAAAA4", "Staff Only", ["Staff"]),
      person("recAAAAAAAAAAAAA5", "Pending Person", ["Expert"], { [f.talent.status]: "Pending" }),
      person("recAAAAAAAAAAAAA6", "Founder Jones", ["Founder", "Co-Chair"]),
      person("recAAAAAAAAAAAAA7", "Press Person", ["Press"])
    ],
    tblRos: [
      session("recSSSSSSSSSSSSS1", "Doors Open", "2026-11-03T02:30:00.000Z"),
      session("recSSSSSSSSSSSSS2", "Awards Show", "2026-11-03T04:00:00.000Z", "10 PM"),
      session("recSSSSSSSSSSSSS3", "Load In", "2026-11-01T16:00:00.000Z")
    ],
    tblPartners: [{ id: "recPPPPPPPPPPPPP1", fields: { [f.partners.name]: "Glow", [f.partners.select]: "Gifting Suite", [f.partners.status]: "Confirmed" } }]
  };
  vi.stubGlobal("fetch", vi.fn(async (input: string, init?: RequestInit) => {
    const url = new URL(input);
    calls.push({ url: input, ...(init ? { init } : {}) });
    if (url.hostname === "airtable.test") return new Response(new Uint8Array([0xff, 0xd8, 0xff]), { status: 200, headers: { "content-type": "image/jpeg" } });
    const table = url.pathname.split("/")[3] ?? "";
    if (failing.has(table) || failing.has("all")) return new Response("{}", { status: failing.has("429") ? 429 : 503 });
    if (url.pathname.includes("/meta/")) return Response.json(tables);
    const record = url.pathname.split("/")[4];
    if (record) {
      const row = base[table]?.find(item => item.id === record);
      return row ? Response.json(row) : new Response("{}", { status: 404 });
    }
    const rows = base[table] ?? [];
    const offset = Number(url.searchParams.get("offset") ?? 0);
    const next = offset + pageSize;
    return Response.json({ records: rows.slice(offset, next), ...(next < rows.length ? { offset: String(next) } : {}) });
  }));
});
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

const names = (snapshot: Awaited<ReturnType<typeof withAirtable>>) => snapshot.speakers.map(speaker => speaker.name);
const rendered = async () => {
  const snapshot = await withAirtable(event2026Snapshot);
  return {
    snapshot,
    awards: renderToStaticMarkup(<AwardsGuestDirectory people={awardsDisplayPeople(snapshot)} />),
    summit: renderToStaticMarkup(<Directory people2026={directoryPeople(snapshot)} simplified />)
  };
};

describe("Airtable -> website, automatically", () => {
  it("reads every page of every table, read-only, cached for five minutes and tagged for refresh", async () => {
    const snapshot = await withAirtable(event2026Snapshot);
    expect(names(snapshot)).toEqual(["Zed Headliner", "Amy Star", "Dr. Expert", "Founder Jones"]);
    const recordCalls = calls.filter(call => call.url.includes("/tblTalent?"));
    expect(recordCalls.length).toBe(3); // 7 rows at 3 per page
    for (const call of calls) {
      expect(call.init?.method ?? "GET").toBe("GET");
      expect(call.init?.body).toBeUndefined();
      expect((call.init?.headers as Record<string, string>).Authorization).toBe("Bearer test-token");
      expect((call.init as { next?: { tags?: string[] } }).next?.tags).toEqual(["airtable"]);
    }
    expect(calls.some(call => (call.init as { next?: { revalidate?: number } }).next?.revalidate === airtableRefreshSeconds)).toBe(true);
    expect(airtableRefreshSeconds).toBe(300);
  });

  it("follows each kind of Airtable edit on the next read", async () => {
    let { snapshot, awards } = await rendered();
    expect(awards).toContain("Amy Star");
    // New confirmed person, regrouping, new bio and title, a removal and a status change.
    base.tblTalent!.push(person("recAAAAAAAAAAAAA8", "New Comedian", ["Comedian"]));
    base.tblTalent![2]!.fields[f.talent.grouping] = ["Expert", "Podcast"];
    base.tblTalent![1]!.fields[f.talent.bio] = "Updated bio, straight from Airtable.";
    base.tblTalent![1]!.fields[f.talent.title] = "Singer-Songwriter";
    base.tblTalent!.splice(0, 1); // Zed removed from the base
    base.tblTalent![3]!.fields[f.talent.status] = "Pending"; // Staff Only row index shifted; Founder Jones below
    base.tblTalent!.find(row => row.fields[f.talent.name] === "Founder Jones")!.fields[f.talent.status] = "Declined";
    ({ snapshot, awards } = await rendered());
    // Sept 22 meeting: a founder stays listed whatever the invitation status, so declined Founder Jones remains.
    expect(names(snapshot)).toEqual(["Amy Star", "Dr. Expert", "Founder Jones", "New Comedian"]);
    const amy = snapshot.speakers.find(speaker => speaker.name === "Amy Star")!;
    expect(amy.bio).toBe("Updated bio, straight from Airtable.");
    expect(amy.role).toBe("Singer-Songwriter");
    expect(airtableOverlay(snapshot)!.people!.get(personNameKey("Dr. Expert"))!.categories).toEqual(["Experts", "Podcasters"]);
    expect(awards).not.toContain("New Comedian"); // Owner (Sept 22): the Awards lineup is celebrities only (A-Talent/ranked); other talent stays on the Summit
    expect(awards).not.toMatch(/Zed Headliner|Staff Only|Pending Person|Press Person/);
    expect(awards).toContain("Founder Jones"); // credited under Founders although declined
  });

  it("shows the clean Stage Name instead of a Name that carries notes", async () => {
    base.tblTalent![0]!.fields[f.talent.name] = "Zed Headliner (TBC - Jewel's son)";
    base.tblTalent![0]!.fields.fldStageName000000 = "Zed Headliner";
    base.tblTalent![1]!.fields.fldStageName000000 = "";
    const { snapshot, awards } = await rendered();
    expect(names(snapshot)).toContain("Zed Headliner");
    expect(names(snapshot)).toContain("Amy Star"); // empty Stage Name falls back to Name
    expect(awards).not.toMatch(/TBC|Jewel's son/);
    expect(calls.some(call => call.url.includes("fields%5B%5D=fldStageName000000"))).toBe(true);
  });

  it("keeps the face-centered crop while a person's Airtable photo is unchanged, and follows a new upload", async () => {
    const [record, crop] = Object.entries(airtableHeadshotCrops).find(([, entry]) => entry.bytes !== null && entry.file)! as [string, { bytes: number; file: string }];
    base.tblTalent!.push(person(record, "Cropped Person", ["Expert"], { [f.talent.headshot]: [{ url: "https://airtable.test/c.jpg", size: crop.bytes }] }));
    let snapshot = await withAirtable(event2026Snapshot);
    expect(snapshot.speakers.find(speaker => speaker.name === "Cropped Person")!.headshotUrl).toBe(crop.file);
    base.tblTalent!.at(-1)!.fields[f.talent.headshot] = [{ url: "https://airtable.test/new.jpg", size: crop.bytes + 1 }];
    snapshot = await withAirtable(event2026Snapshot);
    expect(snapshot.speakers.find(speaker => speaker.name === "Cropped Person")!.headshotUrl).toBe(`/api/airtable/headshot/${record}`);
  });

  it("serves each headshot at a stable site URL and follows a replaced photo", async () => {
    const { snapshot } = await rendered();
    const amy = snapshot.speakers.find(speaker => speaker.name === "Amy Star")!;
    expect(amy.headshotUrl).toBe("/api/airtable/headshot/recAAAAAAAAAAAAA2");
    const response = await headshot(new Request("http://localhost/"), { params: Promise.resolve({ record: "recAAAAAAAAAAAAA2" }) });
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/jpeg");
    expect(response.headers.get("cache-control")).toContain("max-age=900");
    expect(calls.some(call => call.url === "https://airtable.test/recAAAAAAAAAAAAA2-large.jpg")).toBe(true);
    base.tblTalent![1]!.fields[f.talent.headshot] = [{ url: "https://airtable.test/new.jpg", type: "image/jpeg" }];
    await headshot(new Request("http://localhost/"), { params: Promise.resolve({ record: "recAAAAAAAAAAAAA2" }) });
    expect(calls.at(-1)!.url).toBe("https://airtable.test/new.jpg");
    for (const record of ["../etc", "rec123", "recAAAAAAAAAAAAA9"]) {
      expect((await headshot(new Request("http://localhost/"), { params: Promise.resolve({ record }) })).status).toBe(404);
    }
  });

  it("keeps the site's format: A-Talent first, then Airtable's order, one card per category, every card linked to its bio", async () => {
    base.tblTalent!.push(person("recAAAAAAAAAAAAA8", "Beta Musician", ["Musician", "C - talent"]));
    const { awards, summit } = await rendered();
    const musicians = summit.slice(summit.indexOf('id="directory"')); // the Summit lineup lists every confirmed talent row
    const order = ["Amy Star", "Zed Headliner", "Beta Musician"].map(name => musicians.indexOf(name));
    expect(order.every(index => index > -1)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order); // A-Talent, then Airtable row order (not alphabetical)
    for (const html of [awards, summit]) {
      expect(html.match(/>Amy Star</g)?.length).toBe(1);
      // Airtable people link to their own profile (speaker ID); the owner-approved founders credit keeps its page.
      for (const match of html.matchAll(/href="\/directory\/([^"?]+)/g)) expect(match[1]).toMatch(/^[0-9a-f-]{36}$|^2026-pam-duncan-goldie-morrison$/);
      expect(html).toContain('src="/api/airtable/headshot/recAAAAAAAAAAAAA2"');
    }
    // A co-chair who is also a founder is listed under Founders on the gallery; the chairs section is separate.
    expect(awards).toContain("Founder Jones");
  });

  it("falls back safely: an outage keeps the recorded data, and a partial outage only affects that table", async () => {
    failing.add("all");
    const offline = await withAirtable({ ...event2026Snapshot, revision: event2026Snapshot.revision + 1 });
    expect(offline.speakers).toEqual(event2026Snapshot.speakers);
    failing.clear();
    failing.add("tblRos");
    const partial = await withAirtable({ ...event2026Snapshot, revision: event2026Snapshot.revision + 1 });
    expect(names(partial)).toContain("Amy Star");
    expect(partial.scheduleItems).toEqual(event2026Snapshot.scheduleItems);
    failing.clear();
    failing.add("429");
    failing.add("all");
    expect((await withAirtable({ ...event2026Snapshot, revision: event2026Snapshot.revision + 1 })).speakers).toEqual(event2026Snapshot.speakers);
  });

  it("moves schedule changes onto the right date, hides operational rows and never invents an end", async () => {
    base.tblRos!.push(session("recSSSSSSSSSSSSS4", "High Tea", "2026-11-05T20:00:00.000Z"));
    base.tblRos![1]!.fields[f.schedule.start] = "2026-11-03T04:30:00.000Z"; // Awards moved to 8:30 PM in Airtable...
    const snapshot = await withAirtable(event2026Snapshot);
    const at = (title: string) => snapshot.scheduleItems.find(item => item.title === title)!;
    expect(snapshot.scheduleItems.map(item => item.title)).toEqual(["Doors Open", "Awards Show", "High Tea"]);
    // ...but the owner's pinned 7:30 PM wins until he lifts it (lib/schedule-website-rules.ts ownerPinnedTimes).
    expect(at("Awards Show").startUtc).toBe("2026-11-03T03:30:00.000Z");
    expect(at("Awards Show").endUtc).toBe("2026-11-03T06:00:00.000Z");
    expect(at("High Tea").endUtc).toBe(at("High Tea").startUtc);
    expect(airtableOverlay(snapshot)!.partners!.map(partner => partner.name)).toEqual(["Glow", "Bryan Brothers Foundation", "Fight For Lives", "Romero Britto"]); // Oct 12 and Oct 19: + the owner-listed partners
  });
});
