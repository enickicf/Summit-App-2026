import { z } from "zod";

// Website eventing contract v2 (owner handoff PDF, Sept 22, 2026), adapted to this site: the core
// navigation events apply; product, cart, checkout, recommendation and Square events do not exist
// here and are omitted. Browser payloads are camelCase; database columns are snake_case.
export const analyticsSchemaVersion = 2;

export type AnalyticsEventCategory = "strictly_necessary" | "analytics";

// Event name -> server-assigned category and the property keys kept (unknown keys are stripped).
export const analyticsEventCatalog = {
  session_started: { category: "strictly_necessary", properties: ["consent", "gpcEnabled"] },
  consent_updated: { category: "strictly_necessary", properties: ["choice", "gpcEnabled"] },
  page_view: { category: "analytics", properties: ["title"] },
  element_click: { category: "analytics", properties: [] }
} as const satisfies Record<string, { category: AnalyticsEventCategory; properties: readonly string[] }>;

export type AnalyticsEventName = keyof typeof analyticsEventCatalog;
export const analyticsEventNames = Object.keys(analyticsEventCatalog) as [AnalyticsEventName, ...AnalyticsEventName[]];

export const navigationTypes = ["navigate", "reload", "back_forward", "client_navigation", "session_resume"] as const;
export type NavigationType = (typeof navigationTypes)[number];

export const analyticsLimits = {
  maxEventsPerBatch: 50,
  maxBodyBytes: 64 * 1024,
  maxTextLength: 200,
  maxUrlLength: 2048,
  maxPropertyLength: 300,
  // Events older than this or from the future are dropped (clock skew, replayed storage).
  maxEventAgeMs: 30 * 24 * 60 * 60 * 1000,
  maxFutureSkewMs: 10 * 60 * 1000
} as const;

const uuid = z.string().uuid();
const isoTimestamp = z.string().datetime({ offset: true });
const optionalText = (max: number) => z.string().max(max).nullish();
const sessionId = z.string().regex(/^[A-Za-z0-9-]{8,64}$/);
const pagePath = z.string().min(1).max(analyticsLimits.maxUrlLength).regex(/^\//);

export const browserEventSchema = z.object({
  eventId: uuid,
  eventName: z.enum(analyticsEventNames),
  schemaVersion: z.literal(analyticsSchemaVersion),
  eventTimestamp: isoTimestamp,
  sessionId,
  deviceId: uuid.nullish(),
  tabId: uuid,
  pageViewId: uuid,
  previousPageViewId: uuid.nullish(),
  navigationType: z.enum(navigationTypes),
  pagePath,
  pageUrl: z.string().url().max(analyticsLimits.maxUrlLength),
  referrer: optionalText(analyticsLimits.maxUrlLength),
  elementId: optionalText(analyticsLimits.maxTextLength),
  elementText: optionalText(analyticsLimits.maxTextLength),
  targetUrl: optionalText(analyticsLimits.maxUrlLength),
  valueNumeric: z.number().nullish(),
  properties: z.record(z.string(), z.unknown()).optional()
}).strict();

export const browserSessionSchema = z.object({
  sessionId,
  deviceId: uuid.nullish(),
  consent: z.boolean(),
  gpcEnabled: z.boolean(),
  startedAt: isoTimestamp,
  entryPath: pagePath.nullish(),
  entryReferrer: optionalText(analyticsLimits.maxUrlLength),
  utm: z.object({
    source: optionalText(analyticsLimits.maxTextLength),
    medium: optionalText(analyticsLimits.maxTextLength),
    campaign: optionalText(analyticsLimits.maxTextLength),
    term: optionalText(analyticsLimits.maxTextLength),
    content: optionalText(analyticsLimits.maxTextLength)
  }).partial().optional()
}).strict();

export const browserBatchSchema = z.object({
  session: browserSessionSchema,
  events: z.array(browserEventSchema).min(1).max(analyticsLimits.maxEventsPerBatch)
}).strict();

export type BrowserEvent = z.infer<typeof browserEventSchema>;
export type BrowserSession = z.infer<typeof browserSessionSchema>;
export type BrowserBatch = z.infer<typeof browserBatchSchema>;

export function categoryFor(eventName: AnalyticsEventName): AnalyticsEventCategory {
  return analyticsEventCatalog[eventName].category;
}

// Keeps only the catalog's keys for that event, with scalar values capped in length.
export function sanitizeProperties(eventName: AnalyticsEventName, properties: Record<string, unknown> | undefined): Record<string, string | number | boolean> {
  const allowed: readonly string[] = analyticsEventCatalog[eventName].properties;
  const result: Record<string, string | number | boolean> = {};
  if (!properties) return result;
  for (const key of allowed) {
    const value = properties[key];
    if (typeof value === "string") result[key] = value.slice(0, analyticsLimits.maxPropertyLength);
    else if (typeof value === "number" && Number.isFinite(value)) result[key] = value;
    else if (typeof value === "boolean") result[key] = value;
  }
  return result;
}
