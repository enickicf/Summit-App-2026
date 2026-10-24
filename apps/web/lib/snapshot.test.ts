import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
// These tests cover the publication boundary; the recorded Airtable schedule is tested in airtable-overlay.test.ts.
vi.mock("./airtable-ros-2026", () => ({ airtableRos2026: [] }));
vi.mock("./airtable-talent-2026", () => ({ airtableTalent2026: [], airtableTalentRecordedAt: "" }));
vi.mock("./airtable-partners-2026", () => ({ airtablePartners2026: [], airtablePartnersRecordedAt: "" }));
import { demoSnapshot } from "@not-alone/test-fixtures";
import { event2026Snapshot } from "@not-alone/test-fixtures/event-2026";
import { getPublicSnapshot, getPublicSnapshotState, getReviewedContentSnapshot, getSiteSnapshot, publicScheduleItems, resetSnapshotMemory } from "./snapshot";

// These tests exercise the Airtable schedule path; production follows the owner's Google Doc (Sept 22).
beforeEach(() => vi.stubEnv("SCHEDULE_SOURCE", "airtable"));

beforeEach(() => {
  vi.stubEnv("PUBLIC_API_BASE_URL", "https://staff.example.test");
  // These cases cover the request-time fetch; production reads the bundled publication (Sept 24).
  vi.stubEnv("SNAPSHOT_SOURCE", "live");
  resetSnapshotMemory();
});

describe("bundled publication (Sept 24: pages never call the staff API at request time)", () => {
  it("serves the build-time copy without any network call, as a current publication", async () => {
    vi.stubEnv("SNAPSHOT_SOURCE", undefined);
    const fetchMock = vi.fn().mockRejectedValue(new Error("network must not be used"));
    vi.stubGlobal("fetch", fetchMock);
    const snapshot = await getReviewedContentSnapshot();
    expect(snapshot?.event.id).toBe("not-alone-summit-2026-prototype");
    expect(snapshot?.revision).toBeGreaterThanOrEqual(9);
    expect(snapshot?.scheduleItems.length).toBeGreaterThan(0);
    expect(snapshot?.speakers.length).toBeGreaterThan(0);
    expect(await getSiteSnapshot()).toEqual(snapshot);
    expect(await getPublicSnapshotState()).toMatchObject({ source: "published", freshness: "current" });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.useRealTimers();
});

function serve(snapshot: unknown) {
  const fetchMock = vi.fn().mockResolvedValue({ ok: true, headers: new Headers(), json: async () => snapshot });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

// The fixture's first sessions are Mike's Bikes, which the website no longer shows (owner, Sept 21).
const websiteSchedule = event2026Snapshot.scheduleItems.filter(item => !/mike'?s bikes/i.test(item.title));
const keptIndex = event2026Snapshot.scheduleItems.findIndex(item => !/mike'?s bikes/i.test(item.title));

describe("public snapshot boundary", () => {
  it("requests the owner-configured API without credentials or persistent caching", async () => {
    const fetchMock = serve(event2026Snapshot);
    await getReviewedContentSnapshot();
    expect(fetchMock).toHaveBeenCalledWith("https://staff.example.test/api/snapshot", {
      cache: "no-store", signal: expect.any(AbortSignal)
    });
  });

  it("uses the owner-controlled default API when no override is configured", async () => {
    vi.stubEnv("PUBLIC_API_BASE_URL", undefined);
    const fetchMock = serve(event2026Snapshot);
    await getReviewedContentSnapshot();
    expect(fetchMock).toHaveBeenCalledWith("https://summit-app-2026-admin.vercel.app/api/snapshot", expect.any(Object));
  });

  it("removes unpublished, private, cross-event and unconfirmed records without mutating the source", async () => {
    const snapshot = structuredClone(event2026Snapshot);
    const session = snapshot.scheduleItems[keptIndex]!;
    const person = snapshot.speakers[0]!;
    snapshot.scheduleItems = [session, { ...session, title: "Psychedelic Breakthroughs: Gov. Rick Perry & Bryan Hubbard" }, { ...session, title: "private-session", visibilityScope: { id: "staff", label: "Staff" } },
      { ...session, title: "draft-session", published: false }, { ...session, title: "foreign-session", eventId: "other" }];
    snapshot.speakers = [person, { ...person, name: "draft-person", published: false },
      { ...person, name: "foreign-person", eventId: "other" }, { ...person, name: "unconfirmed-person" }];
    snapshot.scheduleItems[0] = { ...session, speakerIds: [person.id, "00000000-0000-4000-8000-000000000099"] };
    snapshot.event.featuredPeople = [{ name: person.name, role: person.role, group: "Attendees" },
      { name: "unconfirmed-person", role: "Unapproved", group: "Hosts" }];
    snapshot.locations.push({ ...snapshot.locations[0]!, eventId: "other", name: "foreign-location" });
    snapshot.faqs.push({ ...snapshot.faqs[0]!, question: "draft-faq", published: false });
    snapshot.sponsors.push({ ...snapshot.sponsors[0]!, name: "draft-sponsor", published: false });
    snapshot.contentPages.push({ ...snapshot.contentPages[0]!, title: "draft-page", published: false });
    snapshot.media = [{ id: person.id, title: "draft-media", url: "https://example.test/private", type: "link", altText: "", published: false }];
    const notice = { id: person.id, eventId: snapshot.event.id, title: "Public update", body: "Approved notice", severity: "info" as const,
      startsAtUtc: snapshot.serverTimeUtc, endsAtUtc: null, published: true };
    snapshot.notices = [notice, { ...notice, title: "draft-notice", published: false }, { ...notice, title: "foreign-notice", eventId: "other" }];
    const original = structuredClone(snapshot);
    serve(snapshot);

    const result = await getReviewedContentSnapshot();
    expect(result).not.toBeNull();
    expect(result?.scheduleItems).toHaveLength(1);
    expect(result?.scheduleItems[0]?.speakerIds).toEqual([person.id]);
    expect(result?.speakers).toHaveLength(1);
    expect(result?.event.featuredPeople).toHaveLength(1);
    expect(result?.notices).toEqual([notice]);
    expect(JSON.stringify(result)).not.toMatch(/Rick Perry|private-session|draft-|foreign-|unconfirmed-person|roleSource/);
    expect(snapshot).toEqual(original);
  });

  it("hides directory records and legacy featured people while publication is disabled", async () => {
    serve({ ...event2026Snapshot, event: { ...event2026Snapshot.event, directoryEnabled: false } });
    const result = await getReviewedContentSnapshot();
    expect(result?.speakers).toEqual([]);
    expect(result?.event.featuredPeople).toEqual([]);
    expect(result?.scheduleItems.length).toBeGreaterThan(0);
  });

  it("does not forward executable or credential-bearing content URLs", async () => {
    const snapshot = structuredClone(event2026Snapshot);
    snapshot.speakers[0]!.headshotUrl = "data:text/html,private";
    snapshot.sponsors[0]!.websiteUrl = "javascript:alert(1)";
    snapshot.sponsors[0]!.logoUrl = "https://user:private@example.test/image.jpg";
    const media = { id: snapshot.speakers[0]!.id, title: "Media", type: "link" as const, altText: "", published: true };
    snapshot.media = [{ ...media, url: "javascript:alert(1)" }, { ...media, url: "https://example.test/public" }];
    serve(snapshot);
    const result = await getReviewedContentSnapshot();
    expect(result?.speakers[0]?.headshotUrl).toBeNull();
    expect(result?.sponsors[0]?.websiteUrl).toBeNull();
    expect(result?.sponsors[0]?.logoUrl).toBeNull();
    expect(result?.media.map(item => item.url)).toEqual(["https://example.test/public"]);
  });

  it.each([
    {},
    { ...event2026Snapshot, event: { ...event2026Snapshot.event, demo: true } },
    { ...event2026Snapshot, event: { ...event2026Snapshot.event, id: "another-event" } }
  ])("treats invalid, demo and unrelated event responses as unavailable", async snapshot => {
    serve(snapshot);
    expect(await getReviewedContentSnapshot()).toBeNull();
  });

  it.each(["event", "session"])("falls back safely for an invalid %s time zone that passes structural validation", async field => {
    const snapshot = structuredClone(event2026Snapshot);
    if (field === "event") snapshot.event.timeZone = "Not/A_TimeZone";
    else snapshot.scheduleItems[keptIndex]!.eventTimeZone = "Not/A_TimeZone";
    serve(snapshot);
    expect(await getReviewedContentSnapshot()).toBeNull();
    // Owner (Sept 21): Mike's Bikes is off every website surface (schedule, Summit page, Ask AI).
    expect(event2026Snapshot.scheduleItems.some(item => /mike'?s bikes/i.test(item.title))).toBe(true);
    expect(JSON.stringify(await getPublicSnapshot())).not.toMatch(/mike'?s bikes/i);
    expect((await getPublicSnapshot()).scheduleItems).toEqual(websiteSchedule);
  });

  it("fails closed for reviewed profiles while keeping the reviewed offline essentials on a network failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("upstream private details")));
    expect(await getReviewedContentSnapshot()).toBeNull();
    const result = await getPublicSnapshot();
    expect(result.event).toEqual({ ...event2026Snapshot.event, directoryEnabled: false });
    expect(result.scheduleItems).toEqual(websiteSchedule);
    expect(result.locations).toEqual(event2026Snapshot.locations);
    expect(result.contentPages).toEqual(event2026Snapshot.contentPages);
    expect(result.event.demo).toBe(false);
    expect(result.speakers).toEqual([]);
    // Sept 24: the public pages never render empty. With nothing fetched yet, they get the reviewed
    // bundle with the directory on (the Airtable overlay supplies the 2026 people in production).
    const site = await getSiteSnapshot();
    expect(site.event.directoryEnabled).toBe(true);
    expect(site.speakers.length).toBeGreaterThan(0);
    expect(site.scheduleItems).toEqual(websiteSchedule);
  });

  it("reuses the last publication this instance fetched while the API is slow or down (Sept 24)", async () => {
    const fetchMock = serve(event2026Snapshot);
    const live = await getSiteSnapshot();
    expect(live.speakers.length).toBeGreaterThan(0);
    fetchMock.mockRejectedValue(new Error("upstream private timeout"));
    expect(await getReviewedContentSnapshot()).toBeNull();
    expect(await getSiteSnapshot()).toBe(live);
    const state = await getPublicSnapshotState();
    expect(state).toMatchObject({ source: "published", freshness: "current" });
    expect(state.snapshot).toBe(live);
    expect(JSON.stringify(state)).not.toContain("upstream private timeout");
    // A later successful read replaces it.
    fetchMock.mockResolvedValue({ ok: true, headers: new Headers(), json: async () => ({ ...event2026Snapshot, revision: event2026Snapshot.revision + 1 }) });
    expect((await getSiteSnapshot()).revision).toBe(event2026Snapshot.revision + 1);
  });

  it("does not restore offline records when a successful live publication is intentionally empty", async () => {
    serve({ ...event2026Snapshot, scheduleItems: [], speakers: [], contentPages: [] });
    const result = await getPublicSnapshot();
    expect(result.scheduleItems).toEqual([]);
    expect(result.speakers).toEqual([]);
    expect(result.contentPages).toEqual([]);
  });

  it("observes withdrawals and new revisions on the next read", async () => {
    const fetchMock = serve(event2026Snapshot);
    await getPublicSnapshot();
    fetchMock.mockResolvedValue({ ok: true, headers: new Headers(), json: async () => ({ ...event2026Snapshot, revision: event2026Snapshot.revision + 1, scheduleItems: [], speakers: [] }) });
    const result = await getPublicSnapshot();
    expect(result.revision).toBe(event2026Snapshot.revision + 1);
    expect(result.scheduleItems).toEqual([]);
    expect(result.speakers).toEqual([]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it.each(["fetch", "body"])("aborts a stalled %s after five seconds", async phase => {
    vi.useFakeTimers();
    const fetchMock = vi.fn((_url: string, { signal }: RequestInit) => {
      const stalled = new Promise<never>((_, reject) => signal!.addEventListener("abort", () => reject(new Error("aborted")), { once: true }));
      return phase === "fetch" ? stalled : Promise.resolve({ ok: true, headers: new Headers(), json: () => stalled });
    });
    vi.stubGlobal("fetch", fetchMock);
    const result = getReviewedContentSnapshot();
    await vi.advanceTimersByTimeAsync(4999);
    expect(fetchMock.mock.calls[0]?.[1].signal?.aborted).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    expect(await result).toBeNull();
    expect(fetchMock.mock.calls[0]?.[1].signal?.aborted).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("handles upstream errors and malformed JSON without exposing upstream details", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 503 }));
    expect(await getReviewedContentSnapshot()).toBeNull();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, headers: new Headers(), json: async () => { throw new Error("private body"); } }));
    expect(await getReviewedContentSnapshot()).toBeNull();
  });
});

describe("public snapshot source and freshness", () => {
  it("marks a successful publication current, using only actual session publication timestamps", async () => {
    const snapshot = structuredClone(event2026Snapshot);
    snapshot.serverTimeUtc = "2026-10-01T18:00:00.000Z";
    snapshot.scheduleItems[keptIndex]!.publishedAt = "2026-09-20T12:00:00.000Z";
    serve(snapshot);
    const state = await getPublicSnapshotState();
    expect(state.source).toBe("published");
    expect(state.freshness).toBe("current");
    expect(state.snapshot.revision).toBe(snapshot.revision);
    expect(state.latestSchedulePublishedAtUtc).toBe("2026-09-20T12:00:00.000Z");
    expect(state.latestSchedulePublishedAtUtc).not.toBe(snapshot.serverTimeUtc);
  });

  it("does not invent a publication timestamp from updatedAt, server time or the current clock", async () => {
    const snapshot = structuredClone(event2026Snapshot);
    for (const item of snapshot.scheduleItems) delete item.publishedAt;
    serve(snapshot);
    const state = await getPublicSnapshotState();
    expect(state.source).toBe("published");
    expect(state.latestSchedulePublishedAtUtc).toBeNull();
  });

  it("does not expose private or unpublished session timestamps as public freshness", async () => {
    const snapshot = structuredClone(event2026Snapshot);
    const privateItem = { ...snapshot.scheduleItems[keptIndex]!, publishedAt: "2026-10-01T00:00:00.000Z", visibilityScope: { id: "staff", label: "Staff" } };
    snapshot.scheduleItems = [privateItem, { ...snapshot.scheduleItems[keptIndex]!, published: false }];
    serve(snapshot);
    expect((await getPublicSnapshotState()).latestSchedulePublishedAtUtc).toBeNull();
  });

  it("keeps an intentionally empty live publication empty and current", async () => {
    const fetchMock = serve({ ...event2026Snapshot, scheduleItems: [], speakers: [], contentPages: [] });
    const state = await getPublicSnapshotState();
    expect(state).toMatchObject({ source: "published", freshness: "current", latestSchedulePublishedAtUtc: null });
    expect(state.snapshot.scheduleItems).toEqual([]);
    expect(state.snapshot.speakers).toEqual([]);
    expect(state.snapshot.contentPages).toEqual([]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("labels bundled essentials unverified after a newer publication fails, without reviving guests", async () => {
    const fetchMock = serve({ ...event2026Snapshot, revision: event2026Snapshot.revision + 1, scheduleItems: [], speakers: [] });
    const current = await getPublicSnapshotState();
    expect(current.source).toBe("published");
    expect(current.snapshot.scheduleItems).toEqual([]);
    fetchMock.mockRejectedValue(new Error("private upstream failure"));
    // While this instance remembers the newer publication it keeps serving it (Sept 24).
    expect((await getPublicSnapshotState()).snapshot.revision).toBe(event2026Snapshot.revision + 1);
    resetSnapshotMemory();

    const offline = await getPublicSnapshotState();
    expect(offline).toMatchObject({ source: "reviewed-offline", freshness: "unverified", latestSchedulePublishedAtUtc: event2026Snapshot.scheduleItems[keptIndex]!.publishedAt });
    expect(offline.snapshot.revision).toBe(event2026Snapshot.revision);
    expect(offline.snapshot.scheduleItems).toEqual(websiteSchedule);
    expect(offline.snapshot.speakers).toEqual([]);
    expect(offline.snapshot.event.directoryEnabled).toBe(false);
    expect(offline.snapshot.event.featuredPeople).toEqual([]);
    expect(await getReviewedContentSnapshot()).toBeNull();
    expect(await getPublicSnapshot()).toEqual(offline.snapshot);
    expect(JSON.stringify(offline)).not.toContain("private upstream failure");
  });

  it("does not label an HTTP-200 degraded admin adapter response as current", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify(event2026Snapshot), {
      headers: { "x-not-alone-adapter-warning": "Configured backend unavailable: private details" }
    })));
    expect(await getReviewedContentSnapshot()).toBeNull();
    const state = await getPublicSnapshotState();
    expect(state.source).toBe("reviewed-offline");
    expect(state.freshness).toBe("unverified");
    expect(state.snapshot.speakers).toEqual([]);
    expect(JSON.stringify(state)).not.toContain("private details");
  });

  it("returns to the published source after recovery without caching fallback state", async () => {
    const fetchMock = serve(event2026Snapshot);
    fetchMock.mockRejectedValueOnce(new Error("offline"));
    expect((await getPublicSnapshotState()).source).toBe("reviewed-offline");
    const recovered = await getPublicSnapshotState();
    expect(recovered.source).toBe("published");
    expect(recovered.freshness).toBe("current");
    expect(recovered.snapshot.speakers.length).toBeGreaterThan(0);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

describe("publicScheduleItems", () => {
  it("returns only public published event sessions in chronological order", () => {
    const items = publicScheduleItems(demoSnapshot);

    expect(items).toHaveLength(demoSnapshot.scheduleItems.filter((item) => item.published && item.visibilityScope.id === "public").length);
    expect(items.every(item => demoSnapshot.scheduleItems.find(original => original.id === item.id)?.visibilityScope.id === "public")).toBe(true);
    expect(items.every((item, index) => index === 0 || item.startUtc >= items[index - 1]!.startUtc)).toBe(true);
  });

  it("excludes other events and projects only display fields without mutating source ordering", () => {
    const snapshot = structuredClone(event2026Snapshot);
    const item = snapshot.scheduleItems[keptIndex]!;
    snapshot.scheduleItems = [
      { ...item, startUtc: "2026-11-02T20:00:00.100Z" },
      { ...item, startUtc: "2026-11-02T20:00:00Z" },
      { ...item, eventId: "other" }
    ];
    const original = structuredClone(snapshot);
    const items = publicScheduleItems(snapshot);
    expect(items.map(item => item.startUtc)).toEqual(["2026-11-02T20:00:00Z", "2026-11-02T20:00:00.100Z"]);
    expect(Object.keys(items[0]!).sort()).toEqual(["id", "title", "shortTitle", "summary", "startUtc", "endUtc", "eventTimeZone", "locationName", "status", "featured"].sort());
    expect(snapshot).toEqual(original);
  });
});
