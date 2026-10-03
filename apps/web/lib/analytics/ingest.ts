import { analyticsLimits, browserBatchSchema, categoryFor, sanitizeProperties, type BrowserBatch } from "./contract";

// Server-side validation of a browser batch and its translation to database rows. Categories are
// assigned here, never trusted from the browser. Analytics-category events are stored only when the
// session has analytics consent and no Global Privacy Control signal; without that, only the
// strictly necessary events (session_started, consent_updated) remain and no device ID is kept.

export type AnalyticsSessionRow = {
  session_id: string;
  device_id: string | null;
  analytics_consent: boolean;
  gpc_enabled: boolean;
  entry_path: string | null;
  entry_referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  first_seen_at: string;
  last_seen_at: string;
};

export type AnalyticsEventRow = {
  id: string;
  event_name: string;
  schema_version: number;
  event_category: "strictly_necessary" | "analytics";
  event_timestamp: string;
  session_id: string;
  device_id: string | null;
  user_id: null;
  tab_id: string;
  page_view_id: string;
  previous_page_view_id: string | null;
  navigation_type: string;
  page_path: string;
  page_url: string;
  referrer: string | null;
  element_id: string | null;
  element_text: string | null;
  target_url: string | null;
  value_numeric: number | null;
  properties: Record<string, string | number | boolean>;
};

export type PreparedBatch =
  | { ok: true; session: AnalyticsSessionRow; events: AnalyticsEventRow[]; dropped: number }
  | { ok: false; error: string };

export function prepareBatch(input: unknown, now: Date = new Date()): PreparedBatch {
  const parsed = browserBatchSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid_batch" };
  const batch: BrowserBatch = parsed.data;
  if (batch.events.some(event => event.sessionId !== batch.session.sessionId)) return { ok: false, error: "session_mismatch" };

  const allowed = batch.session.consent && !batch.session.gpcEnabled;
  const deviceId = allowed ? batch.session.deviceId ?? null : null;
  const events: AnalyticsEventRow[] = [];
  let dropped = 0;
  for (const event of batch.events) {
    const category = categoryFor(event.eventName);
    const at = Date.parse(event.eventTimestamp);
    const tooOld = now.getTime() - at > analyticsLimits.maxEventAgeMs;
    const inFuture = at - now.getTime() > analyticsLimits.maxFutureSkewMs;
    if (tooOld || inFuture || (category === "analytics" && !allowed)) { dropped += 1; continue; }
    events.push({
      id: event.eventId,
      event_name: event.eventName,
      schema_version: event.schemaVersion,
      event_category: category,
      event_timestamp: new Date(at).toISOString(),
      session_id: event.sessionId,
      device_id: allowed ? event.deviceId ?? deviceId : null,
      user_id: null,
      tab_id: event.tabId,
      page_view_id: event.pageViewId,
      previous_page_view_id: event.previousPageViewId ?? null,
      navigation_type: event.navigationType,
      page_path: event.pagePath,
      page_url: event.pageUrl,
      referrer: event.referrer || null,
      element_id: event.elementId || null,
      element_text: event.elementText || null,
      target_url: event.targetUrl || null,
      value_numeric: event.valueNumeric ?? null,
      properties: sanitizeProperties(event.eventName, event.properties)
    });
  }
  events.sort((a, b) => a.event_timestamp.localeCompare(b.event_timestamp));

  const started = Date.parse(batch.session.startedAt);
  const timestamps = events.map(event => Date.parse(event.event_timestamp));
  const firstSeen = Math.min(Number.isFinite(started) ? started : now.getTime(), ...timestamps);
  const lastSeen = Math.max(firstSeen, ...timestamps);
  const utm = batch.session.utm ?? {};
  return {
    ok: true,
    dropped,
    session: {
      session_id: batch.session.sessionId,
      device_id: deviceId,
      analytics_consent: batch.session.consent,
      gpc_enabled: batch.session.gpcEnabled,
      entry_path: batch.session.entryPath ?? null,
      entry_referrer: batch.session.entryReferrer || null,
      utm_source: utm.source || null,
      utm_medium: utm.medium || null,
      utm_campaign: utm.campaign || null,
      utm_term: utm.term || null,
      utm_content: utm.content || null,
      first_seen_at: new Date(firstSeen).toISOString(),
      last_seen_at: new Date(lastSeen).toISOString()
    },
    events
  };
}

export type AnalyticsStore = {
  // Stores the session and events; returns how many events were newly stored (retries return 0).
  ingest(session: AnalyticsSessionRow, events: AnalyticsEventRow[]): Promise<number>;
};

// Supabase, service role only (server environment). Returns null when the server is not configured.
export type AnalyticsServerEnv = { SUPABASE_URL?: string; NEXT_PUBLIC_SUPABASE_URL?: string; SUPABASE_SERVICE_ROLE_KEY?: string };

export function supabaseAnalyticsStore(env: AnalyticsServerEnv = process.env as AnalyticsServerEnv, fetchImpl: typeof fetch = fetch): AnalyticsStore | null {
  const url = (env.SUPABASE_URL ?? env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim().replace(/\/$/, "");
  const key = (env.SUPABASE_SERVICE_ROLE_KEY ?? "").trim();
  if (!/^https:\/\//.test(url) || !key) return null;
  return {
    async ingest(session, events) {
      const response = await fetchImpl(`${url}/rest/v1/rpc/analytics_ingest_batch`, {
        method: "POST",
        headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ p_session: session, p_events: events })
      });
      if (!response.ok) throw new Error(`analytics_ingest_batch returned ${response.status}`);
      const stored = Number(await response.text());
      return Number.isFinite(stored) ? stored : 0;
    }
  };
}
