import { describe, expect, it, vi } from "vitest";
import { analyticsSchemaVersion, sanitizeProperties, type BrowserBatch } from "./contract";
import { prepareBatch, supabaseAnalyticsStore, type AnalyticsEventRow, type AnalyticsSessionRow, type AnalyticsStore } from "./ingest";
import { handleAnalyticsPost } from "../../app/api/analytics/events/route";

const now = new Date("2026-09-22T15:00:00.000Z");
const ids = {
  session: "5d7c3c1e-6c1a-4d2b-9c2e-2b1f3a4d5e6f",
  device: "0b1e2d3c-4a5b-4c6d-8e7f-9a8b7c6d5e4f",
  tab: "1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d",
  page: "2b3c4d5e-6f7a-4b8c-9d0e-1f2a3b4c5d6e",
  previous: "3c4d5e6f-7a8b-4c9d-8e1f-2a3b4c5d6e7f"
};

function event(overrides: Partial<BrowserBatch["events"][number]> = {}): BrowserBatch["events"][number] {
  return {
    eventId: "9f8e7d6c-5b4a-4c3d-8e1f-0a9b8c7d6e5f",
    eventName: "page_view",
    schemaVersion: analyticsSchemaVersion,
    eventTimestamp: "2026-09-22T14:59:30.000Z",
    sessionId: ids.session,
    deviceId: ids.device,
    tabId: ids.tab,
    pageViewId: ids.page,
    previousPageViewId: ids.previous,
    navigationType: "reload",
    pagePath: "/awards/2026",
    pageUrl: "https://notaloneawards.org/awards/2026",
    referrer: "https://www.google.com/",
    properties: { title: "Not Alone Awards 2026", junk: "stripped", nested: { a: 1 } },
    ...overrides
  };
}

function batch(overrides: Partial<BrowserBatch["session"]> = {}, events = [event()]): BrowserBatch {
  return {
    session: { sessionId: ids.session, deviceId: ids.device, consent: true, gpcEnabled: false, startedAt: "2026-09-22T14:58:00.000Z", entryPath: "/", entryReferrer: "https://www.google.com/", utm: { source: "press", campaign: "launch" }, ...overrides },
    events
  };
}

describe("validated event ingestion", () => {
  it("maps a consented batch to snake_case rows with server-assigned categories and stripped properties", () => {
    const prepared = prepareBatch(batch(), now);
    expect(prepared.ok).toBe(true);
    if (!prepared.ok) return;
    expect(prepared.dropped).toBe(0);
    expect(prepared.session).toEqual({
      session_id: ids.session, device_id: ids.device, analytics_consent: true, gpc_enabled: false, entry_path: "/", entry_referrer: "https://www.google.com/",
      utm_source: "press", utm_medium: null, utm_campaign: "launch", utm_term: null, utm_content: null,
      first_seen_at: "2026-09-22T14:58:00.000Z", last_seen_at: "2026-09-22T14:59:30.000Z"
    });
    expect(prepared.events[0]).toEqual({
      id: "9f8e7d6c-5b4a-4c3d-8e1f-0a9b8c7d6e5f", event_name: "page_view", schema_version: 2, event_category: "analytics", event_timestamp: "2026-09-22T14:59:30.000Z",
      session_id: ids.session, device_id: ids.device, user_id: null, tab_id: ids.tab, page_view_id: ids.page, previous_page_view_id: ids.previous, navigation_type: "reload",
      page_path: "/awards/2026", page_url: "https://notaloneawards.org/awards/2026", referrer: "https://www.google.com/", element_id: null, element_text: null, target_url: null,
      value_numeric: null, properties: { title: "Not Alone Awards 2026" }
    });
  });

  it("keeps only strictly necessary events, without device IDs, when consent is missing or GPC is on", () => {
    const events = [event(), event({ eventId: "8e7d6c5b-4a3c-4d2e-8f1a-0b9c8d7e6f5a", eventName: "session_started", properties: { consent: false, gpcEnabled: false } })];
    for (const session of [{ consent: false }, { consent: true, gpcEnabled: true }]) {
      const prepared = prepareBatch(batch(session, events), now);
      expect(prepared.ok).toBe(true);
      if (!prepared.ok) return;
      expect(prepared.dropped).toBe(1);
      expect(prepared.events.map(e => e.event_name)).toEqual(["session_started"]);
      expect(prepared.events[0]!.event_category).toBe("strictly_necessary");
      expect(prepared.events[0]!.device_id).toBeNull();
      expect(prepared.session.device_id).toBeNull();
    }
  });

  it("rejects malformed batches, foreign event names, other sessions' events and non-object bodies", () => {
    expect(prepareBatch(null, now)).toEqual({ ok: false, error: "invalid_batch" });
    expect(prepareBatch({ session: batch().session, events: [] }, now)).toEqual({ ok: false, error: "invalid_batch" });
    expect(prepareBatch(batch({}, [event({ eventName: "add_to_cart" as never })]), now)).toEqual({ ok: false, error: "invalid_batch" });
    expect(prepareBatch(batch({}, [event({ schemaVersion: 1 as never })]), now)).toEqual({ ok: false, error: "invalid_batch" });
    expect(prepareBatch(batch({}, [event({ pagePath: "awards" })]), now)).toEqual({ ok: false, error: "invalid_batch" });
    expect(prepareBatch({ ...batch(), extra: true }, now)).toEqual({ ok: false, error: "invalid_batch" });
    expect(prepareBatch(batch({}, [event({ sessionId: "other-session-id" })]), now)).toEqual({ ok: false, error: "session_mismatch" });
    expect(prepareBatch(batch({}, Array.from({ length: 51 }, () => event())), now)).toEqual({ ok: false, error: "invalid_batch" });
  });

  it("drops events with implausible timestamps and keeps the rest", () => {
    const prepared = prepareBatch(batch({}, [event({ eventTimestamp: "2026-01-01T00:00:00.000Z" }), event({ eventId: "7d6c5b4a-3c2d-4e1f-8a0b-9c8d7e6f5a4b", eventTimestamp: "2026-09-22T16:00:00.000Z" }), event({ eventId: "6c5b4a3c-2d1e-4f0a-8b9c-8d7e6f5a4b3c" })]), now);
    expect(prepared.ok).toBe(true);
    if (!prepared.ok) return;
    expect(prepared.dropped).toBe(2);
    expect(prepared.events.map(e => e.id)).toEqual(["6c5b4a3c-2d1e-4f0a-8b9c-8d7e6f5a4b3c"]);
  });

  it("strips property keys outside the catalog and caps their length", () => {
    expect(sanitizeProperties("consent_updated", { choice: "granted", gpcEnabled: false, email: "x@y.z" })).toEqual({ choice: "granted", gpcEnabled: false });
    expect(sanitizeProperties("element_click", { anything: 1 })).toEqual({});
    expect(sanitizeProperties("page_view", { title: "a".repeat(500) }).title).toHaveLength(300);
  });

  it("calls the Supabase RPC with the service role from the server environment only", async () => {
    const calls: { url: string; init: RequestInit }[] = [];
    const fetchImpl = (async (url: string, init: RequestInit) => { calls.push({ url, init }); return new Response("3", { status: 200 }); }) as unknown as typeof fetch;
    expect(supabaseAnalyticsStore({ SUPABASE_URL: "https://example.supabase.co" }, fetchImpl)).toBeNull();
    expect(supabaseAnalyticsStore({ SUPABASE_URL: "http://example.supabase.co", SUPABASE_SERVICE_ROLE_KEY: "k" }, fetchImpl)).toBeNull();
    const store = supabaseAnalyticsStore({ SUPABASE_URL: "https://example.supabase.co/", SUPABASE_SERVICE_ROLE_KEY: "service-key" }, fetchImpl)!;
    const prepared = prepareBatch(batch(), now);
    if (!prepared.ok) throw new Error("unexpected");
    await expect(store.ingest(prepared.session, prepared.events)).resolves.toBe(3);
    expect(calls[0]!.url).toBe("https://example.supabase.co/rest/v1/rpc/analytics_ingest_batch");
    expect(calls[0]!.init.headers).toMatchObject({ apikey: "service-key", Authorization: "Bearer service-key" });
    expect(JSON.parse(String(calls[0]!.init.body))).toEqual({ p_session: prepared.session, p_events: prepared.events });
  });
});

// In-memory store with the database's semantics: one row per event ID, retries store nothing new.
function memoryAnalyticsStore(): AnalyticsStore & { events: Map<string, AnalyticsEventRow>; sessions: Map<string, AnalyticsSessionRow> } {
  const events = new Map<string, AnalyticsEventRow>();
  const sessions = new Map<string, AnalyticsSessionRow>();
  return {
    events, sessions,
    async ingest(session, rows) {
      sessions.set(session.session_id, session);
      let stored = 0;
      for (const row of rows) if (!events.has(row.id)) { events.set(row.id, row); stored += 1; }
      return stored;
    }
  };
}

// Route tests run against the real clock: recent timestamps, so nothing is dropped as stale.
const liveBatch = (session: Partial<BrowserBatch["session"]> = {}) =>
  batch({ startedAt: new Date(Date.now() - 60_000).toISOString(), ...session }, [event({ eventTimestamp: new Date(Date.now() - 30_000).toISOString() })]);

const post = (body: unknown, headers: Record<string, string> = {}) =>
  new Request("https://notalonesummit.org/api/analytics/events", { method: "POST", headers: { "content-type": "application/json", origin: "https://notalonesummit.org", ...headers }, body: typeof body === "string" ? body : JSON.stringify(body) });

describe("POST /api/analytics/events", () => {
  it("stores a batch once and reports a retry of the same IDs as already stored", async () => {
    const store = memoryAnalyticsStore();
    const first = await handleAnalyticsPost(post(liveBatch()), store);
    expect(first.status).toBe(200);
    expect(await first.json()).toEqual({ accepted: 1, stored: 1, dropped: 0 });
    const retry = await handleAnalyticsPost(post(liveBatch()), store);
    expect(await retry.json()).toEqual({ accepted: 1, stored: 0, dropped: 0 });
    expect(store.events.size).toBe(1);
    expect(first.headers.get("cache-control")).toBe("no-store");
  });

  it("rejects foreign origins, oversized and malformed bodies", async () => {
    const store = memoryAnalyticsStore();
    expect((await handleAnalyticsPost(post(liveBatch(), { origin: "https://evil.example" }), store)).status).toBe(403);
    expect((await handleAnalyticsPost(post(liveBatch(), { origin: "https://notaloneawards.org" }), store)).status).toBe(200);
    expect((await handleAnalyticsPost(post("{not json"), store)).status).toBe(400);
    expect((await handleAnalyticsPost(post({ hello: "world" }), store)).status).toBe(400);
    expect((await handleAnalyticsPost(post(JSON.stringify(liveBatch()) + " ".repeat(70_000)), store)).status).toBe(413);
    expect(store.events.size).toBe(1);
  });

  it("accepts and drops when the server has no analytics configuration, and asks for a retry when the store fails", async () => {
    const disabled = await handleAnalyticsPost(post(liveBatch()), null);
    expect(await disabled.json()).toEqual({ accepted: 1, stored: 0, dropped: 0, disabled: true });
    const failing: AnalyticsStore = { ingest: async () => { throw new Error("db down"); } };
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const failed = await handleAnalyticsPost(post(liveBatch()), failing);
    expect(failed.status).toBe(503);
    spy.mockRestore();
  });

  it("never stores analytics events without consent, even when the browser sends a device ID", async () => {
    const store = memoryAnalyticsStore();
    const response = await handleAnalyticsPost(post(liveBatch({ consent: false })), store);
    expect(await response.json()).toEqual({ accepted: 0, stored: 0, dropped: 1 });
    expect(store.events.size).toBe(0);
  });
});
