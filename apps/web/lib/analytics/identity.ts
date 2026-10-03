// Shared identity model (contract v2): device (browser, persisted only with consent), session
// (one visit shared across tabs, 30 minutes idle), tab (one browser tab, survives refresh) and page
// view (one instance of a page; new on refresh, navigation, back/forward, restore or session
// resumption). Pure functions over injected storage so the rules are unit-tested without a DOM.

export type KeyValueStore = {
  get(key: string): string | null;
  set(key: string, value: string): void;
  remove(key: string): void;
};

export type IdentityEnv = {
  local: KeyValueStore; // browser-wide (localStorage)
  tab: KeyValueStore; // per tab (sessionStorage)
  now(): number;
  uuid(): string;
};

export const sessionIdleMs = 30 * 60 * 1000;

export const storageKeys = {
  consent: "na_analytics_consent",
  device: "na_analytics_device_id",
  session: "na_analytics_session",
  tab: "na_analytics_tab_id",
  page: "na_analytics_page",
  pending: "na_analytics_pending"
} as const;

export type ConsentChoice = "granted" | "denied";
export type PrivacySignals = { gpc: boolean; dnt: boolean };

export type SessionState = {
  id: string;
  startedAt: number;
  lastActivityAt: number;
  entryPath: string | null;
  entryReferrer: string | null;
  utm: Partial<Record<"source" | "medium" | "campaign" | "term" | "content", string>>;
};

export type PageState = { pageViewId: string; previousPageViewId: string | null };

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function readJson<T>(store: KeyValueStore, key: string): T | null {
  try {
    const raw = store.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function readConsent(env: IdentityEnv): ConsentChoice | null {
  const value = env.local.get(storageKeys.consent);
  return value === "granted" || value === "denied" ? value : null;
}

export function writeConsent(env: IdentityEnv, choice: ConsentChoice): void {
  env.local.set(storageKeys.consent, choice);
  // A denied choice removes the browser identifier; a later grant creates a fresh one.
  if (choice === "denied") env.local.remove(storageKeys.device);
}

// Behavioral events need analytics consent and no Global Privacy Control / Do Not Track signal.
export function trackingAllowed(env: IdentityEnv, signals: PrivacySignals): boolean {
  return readConsent(env) === "granted" && !signals.gpc && !signals.dnt;
}

// The same browser across visits. Created only when tracking is allowed; otherwise absent.
export function deviceId(env: IdentityEnv, allowed: boolean): string | null {
  if (!allowed) return null;
  const existing = env.local.get(storageKeys.device);
  if (existing && uuidPattern.test(existing)) return existing;
  const created = env.uuid();
  env.local.set(storageKeys.device, created);
  return created;
}

export function readSession(env: IdentityEnv): SessionState | null {
  const session = readJson<SessionState>(env.local, storageKeys.session);
  return session && typeof session.id === "string" && typeof session.lastActivityAt === "number" ? session : null;
}

export function sessionExpired(session: SessionState | null, now: number): boolean {
  return !session || now - session.lastActivityAt > sessionIdleMs || now < session.lastActivityAt - sessionIdleMs;
}

export type SessionEntry = { path: string; referrer: string; search: string };

function utmFromSearch(search: string): SessionState["utm"] {
  const params = new URLSearchParams(search);
  const utm: SessionState["utm"] = {};
  for (const key of ["source", "medium", "campaign", "term", "content"] as const) {
    const value = params.get(`utm_${key}`)?.trim();
    if (value) utm[key] = value.slice(0, 200);
  }
  return utm;
}

// Returns the live session, starting a new one after 30 minutes without tracked activity.
export function ensureSession(env: IdentityEnv, entry: SessionEntry): { session: SessionState; started: boolean; resumed: boolean } {
  const now = env.now();
  const existing = readSession(env);
  if (existing && !sessionExpired(existing, now)) {
    const session = { ...existing, lastActivityAt: now };
    env.local.set(storageKeys.session, JSON.stringify(session));
    return { session, started: false, resumed: false };
  }
  const session: SessionState = {
    id: env.uuid(),
    startedAt: now,
    lastActivityAt: now,
    entryPath: entry.path || null,
    entryReferrer: entry.referrer || null,
    utm: utmFromSearch(entry.search)
  };
  env.local.set(storageKeys.session, JSON.stringify(session));
  return { session, started: true, resumed: existing !== null };
}

export function touchSession(env: IdentityEnv, session: SessionState): SessionState {
  const touched = { ...session, lastActivityAt: env.now() };
  env.local.set(storageKeys.session, JSON.stringify(touched));
  return touched;
}

// One browser tab; survives refresh, distinct per new tab.
export function tabId(env: IdentityEnv): string {
  const existing = env.tab.get(storageKeys.tab);
  if (existing && uuidPattern.test(existing)) return existing;
  const created = env.uuid();
  env.tab.set(storageKeys.tab, created);
  return created;
}

export function currentPageView(env: IdentityEnv): PageState | null {
  const page = readJson<PageState>(env.tab, storageKeys.page);
  return page && typeof page.pageViewId === "string" ? page : null;
}

// A new page-view ID whose previous ID is the tab's preceding page view (null when unknown).
export function newPageView(env: IdentityEnv): PageState {
  const previous = currentPageView(env);
  const page: PageState = { pageViewId: env.uuid(), previousPageViewId: previous?.pageViewId ?? null };
  env.tab.set(storageKeys.page, JSON.stringify(page));
  return page;
}

export function memoryStore(initial: Record<string, string> = {}): KeyValueStore & { dump(): Record<string, string> } {
  const data = new Map(Object.entries(initial));
  return {
    get: key => data.get(key) ?? null,
    set: (key, value) => { data.set(key, value); },
    remove: key => { data.delete(key); },
    dump: () => Object.fromEntries(data)
  };
}
