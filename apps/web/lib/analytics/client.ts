import { analyticsSchemaVersion, type AnalyticsEventName, type BrowserBatch, type BrowserEvent, type NavigationType } from "./contract";
import {
  currentPageView, deviceId, ensureSession, newPageView, readConsent, sessionExpired, storageKeys, tabId, touchSession, trackingAllowed, writeConsent,
  type ConsentChoice, type IdentityEnv, type PageState, type PrivacySignals, type SessionState
} from "./identity";

// Browser event runtime, kept free of DOM globals: everything the browser provides comes through the
// adapter, so the identity rules, queueing and retry behaviour are unit-tested in Node. Events are
// captured with their IDs and page context at the moment they happen and sent in batches per
// session. A failed send keeps the same event IDs for the retry (the database stores each ID once),
// and unsent events survive a refresh in the tab's storage.

export type ClickDescriptor = { elementId?: string; elementText?: string; targetUrl?: string };

export type AnalyticsHandlers = {
  pagehide(): void;
  hidden(): void;
  visible(): void;
  restored(): void; // page restored from the back/forward cache
  click(descriptor: ClickDescriptor): void;
};

export type AnalyticsAdapter = IdentityEnv & {
  location(): { pathname: string; search: string; href: string };
  referrer(): string;
  title(): string;
  initialNavigationType(): "navigate" | "reload" | "back_forward";
  signals(): PrivacySignals;
  // Resolves to the HTTP status; 0 means the request never reached the server (retry later).
  send(body: string, beacon: boolean): Promise<number>;
  schedule(fn: () => void, ms: number): () => void;
  listen(handlers: AnalyticsHandlers): void;
};

type SessionDescriptor = BrowserBatch["session"];
type PendingItem = { session: SessionDescriptor; event: BrowserEvent; attempts: number };

export const analyticsEndpoint = "/api/analytics/events";
const maxPending = 200;
const maxAttempts = 6;
const retryDelaysMs = [2000, 5000, 15000, 30000, 60000];
const batchSize = 50;

export type AnalyticsRuntime = {
  start(): void;
  routeChanged(pathname: string, search: string): void;
  consent(): ConsentChoice | null;
  promptNeeded(): boolean;
  setConsent(choice: ConsentChoice): void;
  flush(beacon?: boolean): Promise<void>;
  pending(): readonly PendingItem[];
  state(): { sessionId: string | null; pageViewId: string | null; previousPageViewId: string | null; navigationType: NavigationType; deviceId: string | null };
};

export function createAnalyticsRuntime(adapter: AnalyticsAdapter): AnalyticsRuntime {
  let started = false;
  let session: SessionState | null = null;
  let page: PageState | null = null;
  let navigation: NavigationType = "navigate";
  let pageKey = "";
  let pending: PendingItem[] = loadPending();
  let cancelTimer: (() => void) | null = null;
  let inFlight = false;

  const signals = () => adapter.signals();
  const allowed = () => trackingAllowed(adapter, signals());

  function loadPending(): PendingItem[] {
    try {
      const raw = adapter.tab.get(storageKeys.pending);
      const items = raw ? (JSON.parse(raw) as unknown) : [];
      if (!Array.isArray(items)) return [];
      return items.filter((item): item is PendingItem => Boolean(item && typeof item === "object" && (item as PendingItem).event?.eventId && (item as PendingItem).session?.sessionId));
    } catch {
      return [];
    }
  }

  function persistPending() {
    if (pending.length === 0) adapter.tab.remove(storageKeys.pending);
    else adapter.tab.set(storageKeys.pending, JSON.stringify(pending));
  }

  function describeSession(current: SessionState): SessionDescriptor {
    return {
      sessionId: current.id,
      deviceId: deviceId(adapter, allowed()),
      consent: allowed(),
      gpcEnabled: signals().gpc,
      startedAt: new Date(current.startedAt).toISOString(),
      entryPath: current.entryPath,
      entryReferrer: current.entryReferrer,
      utm: current.utm
    };
  }

  function build(eventName: AnalyticsEventName, extra: Partial<Pick<BrowserEvent, "elementId" | "elementText" | "targetUrl" | "properties">> = {}): BrowserEvent {
    const location = adapter.location();
    return {
      eventId: adapter.uuid(),
      eventName,
      schemaVersion: analyticsSchemaVersion,
      eventTimestamp: new Date(adapter.now()).toISOString(),
      sessionId: session!.id,
      deviceId: deviceId(adapter, allowed()),
      tabId: tabId(adapter),
      pageViewId: page!.pageViewId,
      previousPageViewId: page!.previousPageViewId,
      navigationType: navigation,
      pagePath: location.pathname || "/",
      pageUrl: location.href,
      referrer: adapter.referrer() || null,
      ...extra
    };
  }

  function enqueue(event: BrowserEvent) {
    pending.push({ session: describeSession(session!), event, attempts: 0 });
    if (pending.length > maxPending) pending.splice(0, pending.length - maxPending);
    persistPending();
    scheduleFlush(1000);
  }

  function sessionStartedEvent() {
    return build("session_started", { properties: { consent: allowed(), gpcEnabled: signals().gpc } });
  }

  function enqueuePageView() {
    if (!allowed()) return;
    enqueue(build("page_view", { properties: { title: adapter.title().slice(0, 300) } }));
  }

  function beginPageView(type: NavigationType) {
    page = newPageView(adapter);
    navigation = type;
    const location = adapter.location();
    pageKey = `${location.pathname}${location.search}`;
  }

  // Starts a session when none is live; returns whether a new one began.
  function checkSession(): boolean {
    const location = adapter.location();
    const result = ensureSession(adapter, { path: location.pathname || "/", referrer: adapter.referrer(), search: location.search });
    session = result.session;
    return result.started;
  }

  // Activity after 30 idle minutes begins a new session and a new page view (session_resume).
  function resumeIfExpired() {
    if (session && !sessionExpired(session, adapter.now())) {
      session = touchSession(adapter, session);
      return;
    }
    if (checkSession()) {
      beginPageView("session_resume");
      enqueue(sessionStartedEvent());
      enqueuePageView();
    }
  }

  function scheduleFlush(ms: number) {
    cancelTimer?.();
    cancelTimer = adapter.schedule(() => { cancelTimer = null; void flush(false); }, ms);
  }

  async function flush(beacon = false): Promise<void> {
    if (pending.length === 0 || (inFlight && !beacon)) return;
    inFlight = !beacon;
    try {
      const groups = new Map<string, PendingItem[]>();
      for (const item of pending) {
        const list = groups.get(item.session.sessionId) ?? [];
        list.push(item);
        groups.set(item.session.sessionId, list);
      }
      let retryDelay: number | null = null;
      for (const items of groups.values()) {
        const chunk = items.slice(0, batchSize);
        const body = JSON.stringify({ session: chunk[chunk.length - 1]!.session, events: chunk.map(item => item.event) } satisfies BrowserBatch);
        const status = await adapter.send(body, beacon);
        if ((status >= 200 && status < 300) || (status >= 400 && status < 500)) {
          // Stored (or rejected as invalid, which a retry would not fix): done with these IDs.
          pending = pending.filter(item => !chunk.includes(item));
        } else {
          for (const item of chunk) item.attempts += 1;
          pending = pending.filter(item => item.attempts < maxAttempts);
          const attempts = Math.min(...chunk.map(item => item.attempts));
          retryDelay = retryDelaysMs[Math.min(attempts - 1, retryDelaysMs.length - 1)]!;
        }
      }
      persistPending();
      if (retryDelay !== null && !beacon && pending.length > 0) scheduleFlush(retryDelay);
    } finally {
      if (!beacon) inFlight = false;
    }
  }

  return {
    start() {
      if (started) return;
      started = true;
      tabId(adapter);
      const fresh = checkSession();
      beginPageView(adapter.initialNavigationType());
      if (fresh) enqueue(sessionStartedEvent());
      enqueuePageView();
      adapter.listen({
        pagehide: () => { void flush(true); },
        hidden: () => { void flush(true); },
        visible: () => { resumeIfExpired(); },
        restored: () => {
          resumeIfExpired();
          beginPageView("back_forward");
          enqueuePageView();
        },
        click: descriptor => {
          resumeIfExpired();
          if (!allowed()) return;
          enqueue(build("element_click", descriptor));
        }
      });
      if (pending.length > 0) scheduleFlush(0);
    },
    routeChanged(pathname, search) {
      if (!started) return;
      if (`${pathname}${search}` === pageKey) return; // first render, or a repeated effect for the same page
      const expired = !session || sessionExpired(session, adapter.now());
      const fresh = checkSession();
      beginPageView(fresh && expired ? "session_resume" : "client_navigation");
      if (fresh) enqueue(sessionStartedEvent());
      enqueuePageView();
    },
    consent: () => readConsent(adapter),
    promptNeeded: () => readConsent(adapter) === null && !signals().gpc && !signals().dnt,
    setConsent(choice) {
      if (!started) return;
      writeConsent(adapter, choice);
      resumeIfExpired();
      enqueue(build("consent_updated", { properties: { choice, gpcEnabled: signals().gpc } }));
      // The page the visitor is on was not counted before consent; count it once now.
      if (choice === "granted") enqueuePageView();
      scheduleFlush(0);
    },
    flush,
    pending: () => pending,
    state: () => ({
      sessionId: session?.id ?? null,
      pageViewId: page?.pageViewId ?? currentPageView(adapter)?.pageViewId ?? null,
      previousPageViewId: page?.previousPageViewId ?? null,
      navigationType: navigation,
      deviceId: allowed() ? adapter.local.get(storageKeys.device) : null
    })
  };
}
