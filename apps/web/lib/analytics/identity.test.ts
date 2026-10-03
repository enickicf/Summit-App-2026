import { describe, expect, it } from "vitest";
import {
  deviceId, ensureSession, memoryStore, newPageView, readConsent, sessionIdleMs, storageKeys, tabId, trackingAllowed, writeConsent, type IdentityEnv
} from "./identity";

function env(overrides: Partial<IdentityEnv> = {}, start = 1_700_000_000_000): IdentityEnv & { tick(ms: number): void } {
  let now = start;
  let counter = 0;
  const local = memoryStore();
  const tab = memoryStore();
  return {
    local, tab,
    now: () => now,
    uuid: () => `00000000-0000-4000-8000-${String(++counter).padStart(12, "0")}`,
    tick: ms => { now += ms; },
    ...overrides
  };
}

describe("shared identity model", () => {
  it("creates a device ID only when tracking is allowed and keeps it across visits", () => {
    const e = env();
    expect(deviceId(e, false)).toBeNull();
    expect(e.local.get(storageKeys.device)).toBeNull(); // nothing persisted without consent
    writeConsent(e, "granted");
    const first = deviceId(e, trackingAllowed(e, { gpc: false, dnt: false }));
    expect(first).toMatch(/^[0-9a-f-]{36}$/);
    // A later visit in the same browser (same local storage, new tab storage) sees the same ID.
    const later = { ...e, tab: memoryStore() };
    expect(deviceId(later, true)).toBe(first);
    // Declining removes the browser identifier.
    writeConsent(e, "denied");
    expect(readConsent(e)).toBe("denied");
    expect(e.local.get(storageKeys.device)).toBeNull();
    expect(trackingAllowed(e, { gpc: false, dnt: false })).toBe(false);
  });

  it("blocks tracking on Global Privacy Control or Do Not Track even with consent", () => {
    const e = env();
    writeConsent(e, "granted");
    expect(trackingAllowed(e, { gpc: true, dnt: false })).toBe(false);
    expect(trackingAllowed(e, { gpc: false, dnt: true })).toBe(false);
    expect(trackingAllowed(e, { gpc: false, dnt: false })).toBe(true);
  });

  it("keeps one session across activity and starts a new one after 30 idle minutes", () => {
    const e = env();
    const entry = { path: "/", referrer: "https://www.google.com/", search: "?utm_source=press&utm_campaign=launch" };
    const first = ensureSession(e, entry);
    expect(first.started).toBe(true);
    expect(first.resumed).toBe(false);
    expect(first.session.entryPath).toBe("/");
    expect(first.session.entryReferrer).toBe("https://www.google.com/");
    expect(first.session.utm).toEqual({ source: "press", campaign: "launch" });
    e.tick(sessionIdleMs - 1);
    const same = ensureSession(e, { path: "/schedule", referrer: "", search: "" });
    expect(same.started).toBe(false);
    expect(same.session.id).toBe(first.session.id);
    expect(same.session.entryPath).toBe("/"); // entry context is first-touch
    e.tick(sessionIdleMs + 1);
    const next = ensureSession(e, { path: "/awards/2026", referrer: "", search: "" });
    expect(next.started).toBe(true);
    expect(next.resumed).toBe(true);
    expect(next.session.id).not.toBe(first.session.id);
    expect(next.session.entryPath).toBe("/awards/2026");
  });

  it("gives each page view a new ID chained to the tab's previous page view", () => {
    const e = env();
    expect(tabId(e)).toBe(tabId(e)); // one tab ID, stable across refreshes of that tab
    const first = newPageView(e);
    expect(first.previousPageViewId).toBeNull();
    const second = newPageView(e); // refresh or in-site navigation
    expect(second.pageViewId).not.toBe(first.pageViewId);
    expect(second.previousPageViewId).toBe(first.pageViewId);
    // A new tab has its own tab ID and no previous page.
    const otherTab = { ...e, tab: memoryStore() };
    expect(tabId(otherTab)).not.toBe(tabId(e));
    expect(newPageView(otherTab).previousPageViewId).toBeNull();
  });

  it("ignores corrupted storage values", () => {
    const e = env();
    e.local.set(storageKeys.session, "{not json");
    e.local.set(storageKeys.device, "not-a-uuid");
    e.tab.set(storageKeys.page, "[]");
    expect(ensureSession(e, { path: "/", referrer: "", search: "" }).started).toBe(true);
    expect(deviceId(e, true)).toMatch(/^[0-9a-f-]{36}$/);
    expect(newPageView(e).previousPageViewId).toBeNull();
  });
});
