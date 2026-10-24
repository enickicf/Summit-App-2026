import { confirmedSummitGuests2026, publicAppConfig } from "@not-alone/config";
import { event2026Snapshot as reviewedOfflineSnapshot } from "@not-alone/test-fixtures/event-2026";
import { eventSnapshotSchema, type EventSnapshot, type ScheduleItem } from "@not-alone/validation";
import { personNameKey } from "./person-portraits";
import { withAirtable } from "./airtable-overlay";
import bundledPublication from "./published-snapshot.json";

const defaultApiBaseUrl = "https://summit-app-2026-admin.vercel.app";
const confirmedNames = new Set(confirmedSummitGuests2026.map(personNameKey));

function publicUrl(value: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password ? value : null;
  } catch {
    return null;
  }
}

// Standing owner removals from every current public website surface. Published/staff data stays intact.
// Mike's Bikes: Sept 21. Any Governor Rick Perry segment: Oct 23.
const excludedCurrentWebsiteProgram = /mike'?s bikes|\bgov(?:ernor)?\.?\s+rick perry\b/i;
const excludedCurrentWebsitePerson = /^(?:gov(?:ernor)?\.?\s+)?rick perry$/i;

function publicProjection(snapshot: EventSnapshot): EventSnapshot {
  const eventId = snapshot.event.id;
  const scheduleItems = snapshot.scheduleItems.filter(item => item.eventId === eventId && item.published && item.visibilityScope.id === "public" && !excludedCurrentWebsiteProgram.test(item.title));
  // The shared schema accepts strings, but rendering requires valid time zones.
  for (const timeZone of new Set([snapshot.event.timeZone, ...scheduleItems.map(item => item.eventTimeZone)])) {
    new Intl.DateTimeFormat("en-US", { timeZone });
  }
  const speakers = snapshot.event.directoryEnabled ? snapshot.speakers
    .filter(person => person.published && person.eventId === eventId && confirmedNames.has(personNameKey(person.name)) && !excludedCurrentWebsitePerson.test(person.name.trim()))
    .map(({ roleSource: _roleSource, ...person }) => ({ ...person, headshotUrl: publicUrl(person.headshotUrl) })) : [];
  const publishedNames = new Set(speakers.map(person => personNameKey(person.name)));
  const speakerIds = new Set(speakers.map(person => person.id));
  return {
    ...snapshot,
    event: { ...snapshot.event, featuredPeople: snapshot.event.featuredPeople.filter(person => publishedNames.has(personNameKey(person.name))) },
    scheduleItems: scheduleItems.map(item => ({ ...item, speakerIds: item.speakerIds.filter(id => speakerIds.has(id)) })),
    speakers,
    locations: snapshot.locations.filter(location => location.eventId === eventId),
    notices: snapshot.notices.filter(notice => notice.eventId === eventId && notice.published),
    faqs: snapshot.faqs.filter(faq => faq.published),
    sponsors: snapshot.sponsors.filter(sponsor => sponsor.published)
      .map(sponsor => ({ ...sponsor, websiteUrl: publicUrl(sponsor.websiteUrl), logoUrl: publicUrl(sponsor.logoUrl) })),
    media: snapshot.media.filter(item => item.published && publicUrl(item.url)),
    contentPages: snapshot.contentPages.filter(page => page.published).map(page => /^schedule-pending-/.test(page.slug)
      ? { ...page, body: page.body.split(/\r?\n\s*\r?\n/).filter(block => !excludedCurrentWebsiteProgram.test(block)).join("\n\n") }
      : page)
  };
}

// Sept 24, 2026 (owner: "website keeps breaking"): the staff API on Vercel sometimes takes longer than
// the 5-second limit (function logs showed 4.9 s and 5.3 s invocations), and every such page view used
// to render with no people at all ("nobody under Who's Coming"), which the edge cache then kept for
// minutes. The last publication this function instance fetched successfully is remembered and reused
// while the API is slow or down; it is the same published revision, only seconds or minutes older.
let lastPublished: EventSnapshot | null = null;
export function resetSnapshotMemory() { lastPublished = null; }

function offlineEssentials(directoryEnabled: boolean): EventSnapshot {
  return publicProjection({ ...reviewedOfflineSnapshot, event: { ...reviewedOfflineSnapshot.event, directoryEnabled } });
}

// The snapshot the public pages render from. Never null: the live publication, else the last one this
// instance fetched, else the reviewed bundle with the directory on and the recorded Airtable copies
// applied (Airtable drives the 2026 people since Sept 21, so the bundle's own speaker list is only a base).
export async function getSiteSnapshot(): Promise<EventSnapshot> {
  return (await getReviewedContentSnapshot()) ?? lastPublished ?? (await withAirtable(offlineEssentials(true)));
}

// Sept 24, 2026 (owner: "go for it"): the published snapshot is copied into the site at build time
// (scripts/fetch-published-snapshot.mjs -> lib/published-snapshot.json) and pages read that copy, so a
// request never depends on the staff API on Vercel. SNAPSHOT_SOURCE=live restores the request-time fetch
// (used by the tests of that path). A new publication reaches the site with the next deploy.
const snapshotSource = () => (process.env.SNAPSHOT_SOURCE === "live" ? "live" : "bundled");
let bundledParsed: EventSnapshot | null | undefined;
function bundledSnapshot(): EventSnapshot | null {
  if (bundledParsed !== undefined) return bundledParsed;
  try {
    const snapshot = eventSnapshotSchema.parse(bundledPublication);
    bundledParsed = snapshot.event.demo || snapshot.event.id !== publicAppConfig.eventId ? null : snapshot;
  } catch {
    bundledParsed = null;
  }
  return bundledParsed;
}

export async function getReviewedContentSnapshot(): Promise<EventSnapshot | null> {
  if (snapshotSource() === "bundled") {
    const bundled = bundledSnapshot();
    if (!bundled) return null;
    lastPublished = await withAirtable(publicProjection(bundled));
    return lastPublished;
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const baseUrl = (process.env.PUBLIC_API_BASE_URL ?? defaultApiBaseUrl).replace(/\/+$/, "");
    const response = await fetch(`${baseUrl}/api/snapshot`, { cache: "no-store", signal: controller.signal });
    // The shared mobile client omits headers; a degraded API can return a local
    // adapter snapshot with HTTP 200, which is not a verified current publication.
    if (!response.ok || response.headers.has("x-not-alone-adapter-warning")) return null;
    const snapshot = eventSnapshotSchema.parse(await response.json());
    if (snapshot.event.demo || snapshot.event.id !== publicAppConfig.eventId) return null;
    // Airtable (when connected) supplies 2026 people, schedule and partners on top of the publication.
    lastPublished = await withAirtable(publicProjection(snapshot));
    return lastPublished;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export type PublicSnapshotState = {
  snapshot: EventSnapshot;
  // This is a session publication timestamp, not a snapshot-wide publication or
  // retrieval timestamp. Empty schedules or missing publishedAt yield null.
  latestSchedulePublishedAtUtc: string | null;
} & (
  | { source: "published"; freshness: "current" }
  | { source: "reviewed-offline"; freshness: "unverified" }
);

function latestSchedulePublishedAt(snapshot: EventSnapshot): string | null {
  return snapshot.scheduleItems.reduce<string | null>((latest, item) => {
    if (!item.publishedAt) return latest;
    return !latest || Date.parse(item.publishedAt) > Date.parse(latest) ? item.publishedAt : latest;
  }, null);
}

export async function getPublicSnapshotState(): Promise<PublicSnapshotState> {
  const published = await getReviewedContentSnapshot();
  if (published) {
    return { snapshot: published, source: "published", freshness: "current", latestSchedulePublishedAtUtc: latestSchedulePublishedAt(published) };
  }
  // The last publication this instance fetched is still that publication (Sept 24; see above).
  if (lastPublished) {
    return { snapshot: lastPublished, source: "published", freshness: "current", latestSchedulePublishedAtUtc: latestSchedulePublishedAt(lastPublished) };
  }
  // Preserve reviewed offline essentials (with the recorded Airtable copies for schedule/partners),
  // never the bundle's own guest list. This bundle is not a cache of the last successful API response.
  const snapshot = await withAirtable(offlineEssentials(false));
  return { snapshot, source: "reviewed-offline", freshness: "unverified", latestSchedulePublishedAtUtc: latestSchedulePublishedAt(snapshot) };
}

export async function getPublicSnapshot(): Promise<EventSnapshot> {
  return (await getPublicSnapshotState()).snapshot;
}

export type WebScheduleItem = Pick<
  ScheduleItem,
  "id" | "title" | "shortTitle" | "summary" | "startUtc" | "endUtc" | "eventTimeZone" | "locationName" | "status" | "featured"
>;

export function publicScheduleItems(snapshot: EventSnapshot): WebScheduleItem[] {
  return snapshot.scheduleItems
    .filter((item) => item.eventId === snapshot.event.id && item.published && item.visibilityScope.id === "public")
    .sort((left, right) => Date.parse(left.startUtc) - Date.parse(right.startUtc))
    .map(({ id, title, shortTitle, summary, startUtc, endUtc, eventTimeZone, locationName, status, featured }) => ({
      id,
      title,
      shortTitle,
      summary,
      startUtc,
      endUtc,
      eventTimeZone,
      locationName,
      status,
      featured
    }));
}
