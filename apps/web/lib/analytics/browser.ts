import { analyticsEndpoint, createAnalyticsRuntime, type AnalyticsAdapter, type AnalyticsRuntime, type ClickDescriptor } from "./client";
import { memoryStore, type KeyValueStore } from "./identity";

// The real browser behind the runtime: storage, clock, IDs, page context, privacy signals, network
// (fetch with keepalive, sendBeacon when the page is leaving) and the DOM listeners.

function safeStore(getStorage: () => Storage): KeyValueStore {
  // Private windows or blocked storage fall back to memory for this page only.
  const fallback = memoryStore();
  return {
    get: key => { try { return getStorage().getItem(key); } catch { return fallback.get(key); } },
    set: (key, value) => { try { getStorage().setItem(key, value); } catch { fallback.set(key, value); } },
    remove: key => { try { getStorage().removeItem(key); } catch { fallback.remove(key); } }
  };
}

function fallbackUuid(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6]! & 0x0f) | 0x40;
  bytes[8] = (bytes[8]! & 0x3f) | 0x80;
  const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

// The clicked control: links, buttons and submit inputs. Controls inside [data-analytics-ignore]
// (the consent bar) are skipped; consent_updated already records that choice.
export function describeClick(target: EventTarget | null): ClickDescriptor | null {
  const element = target instanceof Element ? target.closest("a[href], button, [role='button'], input[type='submit'], summary") : null;
  if (!element || element.closest("[data-analytics-ignore]")) return null;
  const text = (element.textContent ?? "").replace(/\s+/g, " ").trim() || element.getAttribute("aria-label") || element.getAttribute("title") || "";
  const id = element.getAttribute("data-analytics-id") || element.id || element.getAttribute("name") || "";
  const href = element instanceof HTMLAnchorElement ? element.href : "";
  const descriptor: ClickDescriptor = {};
  if (id) descriptor.elementId = id.slice(0, 200);
  if (text) descriptor.elementText = text.slice(0, 200);
  if (href) descriptor.targetUrl = href.slice(0, 2048);
  return descriptor;
}

export function browserAdapter(): AnalyticsAdapter {
  return {
    local: safeStore(() => window.localStorage),
    tab: safeStore(() => window.sessionStorage),
    now: () => Date.now(),
    uuid: () => (typeof crypto.randomUUID === "function" ? crypto.randomUUID() : fallbackUuid()),
    location: () => ({ pathname: window.location.pathname, search: window.location.search, href: window.location.href }),
    referrer: () => document.referrer,
    title: () => document.title,
    initialNavigationType: () => {
      const entry = performance.getEntriesByType?.("navigation")[0] as PerformanceNavigationTiming | undefined;
      return entry?.type === "reload" || entry?.type === "back_forward" ? entry.type : "navigate";
    },
    signals: () => ({
      gpc: (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true,
      dnt: navigator.doNotTrack === "1" || (window as Window & { doNotTrack?: string }).doNotTrack === "1"
    }),
    send: async (body, beacon) => {
      if (beacon && typeof navigator.sendBeacon === "function") {
        return navigator.sendBeacon(analyticsEndpoint, new Blob([body], { type: "application/json" })) ? 200 : 0;
      }
      try {
        const response = await fetch(analyticsEndpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true, credentials: "same-origin" });
        return response.status;
      } catch {
        return 0;
      }
    },
    schedule: (fn, ms) => {
      const timer = window.setTimeout(fn, ms);
      return () => window.clearTimeout(timer);
    },
    listen: handlers => {
      window.addEventListener("pagehide", () => handlers.pagehide());
      document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") handlers.hidden(); else handlers.visible(); });
      window.addEventListener("pageshow", event => { if (event.persisted) handlers.restored(); });
      document.addEventListener("click", event => {
        const descriptor = describeClick(event.target);
        if (descriptor) handlers.click(descriptor);
      }, true);
    }
  };
}

declare global {
  interface Window { __naAnalytics?: AnalyticsRuntime }
}

export function getAnalyticsRuntime(): AnalyticsRuntime {
  if (!window.__naAnalytics) window.__naAnalytics = createAnalyticsRuntime(browserAdapter());
  return window.__naAnalytics;
}
