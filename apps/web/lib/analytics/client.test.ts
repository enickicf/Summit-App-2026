import { describe, expect, it } from "vitest";
import { browserBatchSchema, type BrowserBatch } from "./contract";
import { createAnalyticsRuntime, type AnalyticsAdapter, type AnalyticsHandlers } from "./client";
import { memoryStore, sessionIdleMs, storageKeys, type KeyValueStore } from "./identity";

type Fake = {
  adapter: AnalyticsAdapter;
  sent: BrowserBatch[];
  statuses: number[]; // queued responses; 200 when exhausted
  handlers: AnalyticsHandlers | null;
  timers: (() => void)[];
  runTimers(): void;
  tick(ms: number): void;
  location: { pathname: string; search: string; href: string };
  navigation: "navigate" | "reload" | "back_forward";
  signals: { gpc: boolean; dnt: boolean };
};

let instances = 0;
function fake(options: { local?: KeyValueStore; tab?: KeyValueStore; start?: number; gpc?: boolean; dnt?: boolean; navigation?: Fake["navigation"] } = {}): Fake {
  let now = options.start ?? 1_700_000_000_000;
  let counter = 0;
  const instance = String(++instances).padStart(2, "0"); // distinct IDs per simulated page load
  const state: Fake = {
    sent: [],
    statuses: [],
    handlers: null,
    timers: [],
    location: { pathname: "/", search: "", href: "https://notalonesummit.org/" },
    navigation: options.navigation ?? "navigate",
    signals: { gpc: options.gpc ?? false, dnt: options.dnt ?? false },
    runTimers() { const due = state.timers.splice(0); due.forEach(fn => fn()); },
    tick(ms) { now += ms; },
    adapter: {
      local: options.local ?? memoryStore(),
      tab: options.tab ?? memoryStore(),
      now: () => now,
      uuid: () => `00000000-0000-4000-8000-${instance}${String(++counter).padStart(10, "0")}`,
      location: () => state.location,
      referrer: () => "https://www.google.com/",
      title: () => "Not Alone Summit 2026",
      initialNavigationType: () => state.navigation,
      signals: () => state.signals,
      send: async body => {
        const batch = JSON.parse(body) as BrowserBatch;
        expect(browserBatchSchema.safeParse(batch).success).toBe(true); // every batch is contract-valid
        state.sent.push(batch);
        return state.statuses.shift() ?? 200;
      },
      schedule: fn => { state.timers.push(fn); return () => { state.timers = state.timers.filter(t => t !== fn); }; },
      listen: handlers => { state.handlers = handlers; }
    }
  };
  return state;
}

const flushAll = async (f: Fake) => { f.runTimers(); await new Promise(resolve => setTimeout(resolve, 0)); };
const names = (batches: BrowserBatch[]) => batches.flatMap(batch => batch.events.map(event => event.eventName));

describe("website event runtime", () => {
  it("sends only session_started before consent, then consent_updated and the current page view on allow", async () => {
    const f = fake();
    const runtime = createAnalyticsRuntime(f.adapter);
    runtime.start();
    expect(runtime.promptNeeded()).toBe(true);
    await flushAll(f);
    expect(names(f.sent)).toEqual(["session_started"]);
    const started = f.sent[0]!.events[0]!;
    expect(started.deviceId).toBeNull();
    expect(started.properties).toEqual({ consent: false, gpcEnabled: false });
    expect(f.sent[0]!.session.consent).toBe(false);

    runtime.setConsent("granted");
    await flushAll(f);
    expect(names(f.sent.slice(1))).toEqual(["consent_updated", "page_view"]);
    const [consent, view] = f.sent[1]!.events;
    expect(consent!.properties).toEqual({ choice: "granted", gpcEnabled: false });
    expect(view!.pageViewId).toBe(started.pageViewId); // the page the visitor was on, counted once
    expect(view!.deviceId).toMatch(/^[0-9a-f-]{36}$/);
    expect(view!.navigationType).toBe("navigate");
    expect(view!.properties).toEqual({ title: "Not Alone Summit 2026" });
    expect(f.sent[1]!.session).toMatchObject({ consent: true, deviceId: view!.deviceId, entryPath: "/", entryReferrer: "https://www.google.com/" });
    expect(runtime.promptNeeded()).toBe(false);
  });

  it("refresh: new page-view ID chained to the previous one, same session, no new session_started", async () => {
    const local = memoryStore();
    const tab = memoryStore();
    const first = fake({ local, tab });
    const runtime1 = createAnalyticsRuntime(first.adapter);
    runtime1.start();
    runtime1.setConsent("granted");
    await flushAll(first);
    const firstView = first.sent.flatMap(b => b.events).find(e => e.eventName === "page_view")!;

    const second = fake({ local, tab, start: 1_700_000_060_000, navigation: "reload" });
    const runtime2 = createAnalyticsRuntime(second.adapter);
    runtime2.start();
    await flushAll(second);
    expect(names(second.sent)).toEqual(["page_view"]);
    const view = second.sent[0]!.events[0]!;
    expect(view.navigationType).toBe("reload");
    expect(view.pageViewId).not.toBe(firstView.pageViewId);
    expect(view.previousPageViewId).toBe(firstView.pageViewId);
    expect(view.sessionId).toBe(firstView.sessionId);
    expect(view.tabId).toBe(firstView.tabId);
    expect(view.deviceId).toBe(firstView.deviceId);
  });

  it("returning visit after 30 idle minutes: new session, new page view, same device ID", async () => {
    const local = memoryStore();
    const first = fake({ local });
    const runtime1 = createAnalyticsRuntime(first.adapter);
    runtime1.start();
    runtime1.setConsent("granted");
    await flushAll(first);
    const firstView = first.sent.flatMap(b => b.events).find(e => e.eventName === "page_view")!;

    const later = fake({ local, start: 1_700_000_000_000 + sessionIdleMs + 60_000 });
    const runtime2 = createAnalyticsRuntime(later.adapter);
    runtime2.start();
    await flushAll(later);
    expect(names(later.sent)).toEqual(["session_started", "page_view"]);
    const [started, view] = later.sent[0]!.events;
    expect(started!.sessionId).not.toBe(firstView.sessionId);
    expect(view!.pageViewId).not.toBe(firstView.pageViewId);
    expect(view!.previousPageViewId).toBeNull(); // new tab
    expect(view!.deviceId).toBe(firstView.deviceId);
    expect(started!.deviceId).toBe(firstView.deviceId);
    expect(later.sent[0]!.session.deviceId).toBe(firstView.deviceId);
  });

  it("session resumption in an open tab creates a new session and page view marked session_resume", async () => {
    const f = fake();
    const runtime = createAnalyticsRuntime(f.adapter);
    runtime.start();
    runtime.setConsent("granted");
    await flushAll(f);
    const before = runtime.state();
    f.tick(sessionIdleMs + 1);
    f.handlers!.visible();
    await flushAll(f);
    const resumed = f.sent.at(-1)!.events;
    expect(resumed.map(e => e.eventName)).toEqual(["session_started", "page_view"]);
    expect(resumed[1]!.navigationType).toBe("session_resume");
    expect(resumed[1]!.sessionId).not.toBe(before.sessionId);
    expect(resumed[1]!.previousPageViewId).toBe(before.pageViewId);
  });

  it("in-site navigation and back/forward restore each create a page view; a repeated effect does not", async () => {
    const f = fake();
    const runtime = createAnalyticsRuntime(f.adapter);
    runtime.start();
    runtime.setConsent("granted");
    await flushAll(f);
    const home = runtime.state().pageViewId;
    runtime.routeChanged("/", ""); // React re-running the effect for the same page
    f.location = { pathname: "/schedule", search: "", href: "https://notalonesummit.org/schedule" };
    runtime.routeChanged("/schedule", "");
    runtime.routeChanged("/schedule", "");
    f.location = { pathname: "/schedule", search: "?day=2", href: "https://notalonesummit.org/schedule?day=2" };
    runtime.routeChanged("/schedule", "?day=2"); // query change is a new page view
    f.handlers!.restored();
    await flushAll(f);
    const views = f.sent.flatMap(b => b.events).filter(e => e.eventName === "page_view");
    expect(views.map(v => [v.pagePath, v.navigationType])).toEqual([["/", "navigate"], ["/schedule", "client_navigation"], ["/schedule", "client_navigation"], ["/schedule", "back_forward"]]);
    expect(views[1]!.previousPageViewId).toBe(home);
    expect(views[2]!.previousPageViewId).toBe(views[1]!.pageViewId);
    expect(new Set(views.map(v => v.pageViewId)).size).toBe(4);
  });

  it("records clicks with the control and destination, only when tracking is allowed", async () => {
    const f = fake();
    const runtime = createAnalyticsRuntime(f.adapter);
    runtime.start();
    f.handlers!.click({ elementText: "RSVP", targetUrl: "https://not-alone-awards-rsvp-2026.netlify.app/" });
    await flushAll(f);
    expect(names(f.sent)).toEqual(["session_started"]); // no consent yet
    runtime.setConsent("granted");
    f.handlers!.click({ elementId: "donate", elementText: "Donate", targetUrl: "https://www.inspiringchildren.org/donate" });
    await flushAll(f);
    const click = f.sent.flatMap(b => b.events).find(e => e.eventName === "element_click")!;
    expect(click).toMatchObject({ elementId: "donate", elementText: "Donate", targetUrl: "https://www.inspiringchildren.org/donate", pagePath: "/", pageViewId: runtime.state().pageViewId });
  });

  it("retries a failed batch with the same event IDs and keeps unsent events across a refresh", async () => {
    const tab = memoryStore();
    const local = memoryStore();
    const f = fake({ local, tab });
    const runtime = createAnalyticsRuntime(f.adapter);
    runtime.start();
    runtime.setConsent("granted");
    f.statuses.push(503, 0); // server unavailable, then network failure
    await flushAll(f);
    await flushAll(f);
    expect(f.sent).toHaveLength(2);
    expect(f.sent[1]!.events.map(e => e.eventId)).toEqual(f.sent[0]!.events.map(e => e.eventId));
    expect(runtime.pending().every(item => item.attempts === 2)).toBe(true);
    expect(tab.get(storageKeys.pending)).toContain(f.sent[0]!.events[0]!.eventId);

    // Refresh before the retry succeeds: the persisted events go out again, unchanged, with the new page view.
    const after = fake({ local, tab, navigation: "reload" });
    const runtime2 = createAnalyticsRuntime(after.adapter);
    runtime2.start();
    await flushAll(after);
    const ids = after.sent.flatMap(b => b.events.map(e => e.eventId));
    for (const id of f.sent[0]!.events.map(e => e.eventId)) expect(ids).toContain(id);
    expect(runtime2.pending()).toHaveLength(0);
    expect(tab.get(storageKeys.pending)).toBeNull();
  });

  it("drops a batch the server rejects as invalid instead of retrying it forever", async () => {
    const f = fake();
    const runtime = createAnalyticsRuntime(f.adapter);
    runtime.start();
    f.statuses.push(400);
    await flushAll(f);
    expect(runtime.pending()).toHaveLength(0);
  });

  it("never asks or tracks a browser that sends Global Privacy Control", async () => {
    const f = fake({ gpc: true });
    const runtime = createAnalyticsRuntime(f.adapter);
    runtime.start();
    expect(runtime.promptNeeded()).toBe(false);
    f.handlers!.click({ elementText: "Schedule" });
    await flushAll(f);
    expect(names(f.sent)).toEqual(["session_started"]);
    expect(f.sent[0]!.session).toMatchObject({ consent: false, gpcEnabled: true, deviceId: null });
    expect(f.sent[0]!.events[0]!.properties).toEqual({ consent: false, gpcEnabled: true });
    expect(f.adapter.local.get(storageKeys.device)).toBeNull();
  });

  it("sends the pending events by beacon when the page is hidden or leaving", async () => {
    const f = fake();
    const runtime = createAnalyticsRuntime(f.adapter);
    runtime.start();
    f.handlers!.pagehide();
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(names(f.sent)).toEqual(["session_started"]);
    expect(runtime.pending()).toHaveLength(0);
  });
});
