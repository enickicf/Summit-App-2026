import type { EventSnapshot, ScheduleItem } from "@not-alone/validation";
import { personNameKey } from "./person-portraits";
import { setAirtableOverlay, type AirtableOverlayPerson } from "./airtable-shared";
import {
  airtableCategories, airtableUuid, assignRanks, featuredGroup, getAirtablePartners, getAirtableSchedule, getAirtableTalent, talentTier,
  isPublicAirtablePerson, type AirtableSession
} from "./airtable";
import { airtableRos2026, type RosRow } from "./airtable-ros-2026";
import { scheduleDoc2026 } from "./schedule-doc-2026";
import { airtableTalent2026, type RecordedAirtablePerson } from "./airtable-talent-2026";
import { airtablePartners2026 } from "./airtable-partners-2026";
import { airtableHeadshotCrops } from "./airtable-headshot-crops";
import { interimBio2026 } from "./interim-bios-2026";
import { awardsBiographies } from "./awards-people";

// Airtable becomes the website's source for 2026 people (who is listed, grouping, title, bio,
// headshot), the schedule and 2026 partners whenever the read-only connection is configured.
// The overlay is registered for the returned snapshot object so every page reads the same data in one request.
export { airtableOverlay, type AirtableOverlay, type AirtableOverlayPerson } from "./airtable-shared";

const timeZone = "America/Los_Angeles";

function zonedToUtc(year: number, month: number, day: number, hour: number, minute: number): Date {
  // Find the UTC instant whose Los Angeles wall-clock time matches (handles the Nov 1 DST change).
  let guess = Date.UTC(year, month - 1, day, hour + 8, minute);
  for (let i = 0; i < 2; i++) {
    const parts = Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone, hourCycle: "h23", year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric" })
      .formatToParts(new Date(guess)).map(part => [part.type, part.value]));
    const shown = Date.UTC(+parts.year!, +parts.month! - 1, +parts.day!, +parts.hour!, +parts.minute!);
    guess += Date.UTC(year, month - 1, day, hour, minute) - shown;
  }
  return new Date(guess);
}

function localDate(instant: string) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone, year: "numeric", month: "numeric", day: "numeric" }).formatToParts(new Date(instant)).map(part => [part.type, part.value]));
  return { year: +parts.year!, month: +parts.month!, day: +parts.day! };
}

// "10 PM", "6:15 PM", "12 AM" (or an ISO time) on the session's local day; after midnight rolls over.
export function sessionEndUtc(startUtc: string, endText: string): string {
  if (/^\d{4}-\d{2}-\d{2}T/.test(endText)) return new Date(endText).toISOString();
  const match = /^(\d{1,2})(?::(\d{2}))?\s*([ap])\.?m\.?$/i.exec(endText.trim());
  if (!match) return startUtc; // No end in Airtable: none is invented.
  let hour = +match[1]! % 12;
  if (match[3]!.toLowerCase() === "p") hour += 12;
  const { year, month, day } = localDate(startUtc);
  let end = zonedToUtc(year, month, day, hour, +(match[2] ?? 0));
  if (end.getTime() <= new Date(startUtc).getTime()) end = new Date(end.getTime() + 86_400_000);
  return end.toISOString();
}

// Operational rows (load-in/out, rehearsals) are not part of the attendee schedule.
const operational = /\bload[- ]?(in|out)\b|rehearsal|mike'?s bikes/i;

function scheduleFromAirtable(sessions: AirtableSession[], snapshot: EventSnapshot): ScheduleItem[] {
  const template = snapshot.scheduleItems.find(item => item.eventId === snapshot.event.id);
  const now = new Date().toISOString();
  const rows = sessions.filter(session => session.startUtc && !operational.test(session.title))
    .sort((a, b) => a.startUtc!.localeCompare(b.startUtc!));
  const perDay = new Map<string, number>();
  return rows.map(session => {
    const startUtc = session.startUtc!;
    const day = JSON.stringify(localDate(startUtc));
    const dayOrder = perDay.get(day) ?? 0;
    perDay.set(day, dayOrder + 1);
    // Airtable's Run of Show has no access field. Keep the access staff already published for the
    // same session; otherwise only the session's own name decides (Founders…, Speaker Reception), and
    // everything else stays "to be confirmed" rather than inventing who may attend.
    const published = snapshot.scheduleItems.find(item => item.title.trim().toLowerCase() === session.title.trim().toLowerCase());
    const access = published?.eligibilityScope
      ?? (/founder/i.test(session.title) ? { id: "ros-founders", label: "Founders" }
        : /speaker reception/i.test(session.title) ? { id: "ros-speakers", label: "Speakers" }
        : { id: "unconfirmed", label: "Access details to be confirmed" });
    const location = session.location || "Location to be confirmed";
    const summary = session.synopsis || session.title;
    return {
      ...(template ?? {}),
      id: airtableUuid(session.recordId), eventId: snapshot.event.id, title: session.title, shortTitle: session.title,
      summary, description: summary, startUtc, endUtc: sessionEndUtc(startUtc, session.endText), eventTimeZone: snapshot.event.timeZone || timeZone,
      dayOrder, locationId: airtableUuid(`location:${location}`), locationName: location,
      speakerIds: [],
      status: "scheduled", visibilityScope: { id: "public", label: "Public" }, eligibilityScope: access,
      notificationScope: { id: "public", label: "All attendees" }, notificationOffsetsMinutes: [], featured: false, published: true,
      revision: template?.revision ?? 1, updatedAt: now
    } as ScheduleItem;
  });
}

// The Sept 21 Airtable Run of Show, used until the live connection is configured.
export const recordedAgainstRevision = 9;
// Owner (Sept 22): the schedule follows the owner's Google Doc until told otherwise. SCHEDULE_SOURCE=airtable returns to Airtable's Run of Show.
export const scheduleFollowsDoc = () => process.env.SCHEDULE_SOURCE !== "airtable";
export function recordedAirtableSchedule(rows: RosRow[] = airtableRos2026): AirtableSession[] {
  return rows.filter(row => row.start && row.start !== "00:00").map(row => {
    const [year, month, day] = row.date.split("-").map(Number) as [number, number, number];
    const [hour, minute] = row.start.split(":").map(Number) as [number, number];
    return { recordId: row.recordId, title: row.title, date: row.date, startUtc: zonedToUtc(year, month, day, hour, minute).toISOString(), endText: row.end, location: row.location, synopsis: row.synopsis, forum: "", websiteTime: "" };
  });
}

// undefined = no review entry (use Airtable's photo); null = reviewed, no photo (name only); string = the file.
function reviewedHeadshot(person: { recordId: string; headshotBytes?: number }): string | null | undefined {
  const crop = airtableHeadshotCrops[person.recordId];
  if (!crop) return undefined;
  if (crop.file === null) return null;
  if (crop.bytes === null) return crop.file; // an approved non-Airtable photo
  return person.headshotBytes !== undefined && crop.bytes === person.headshotBytes ? crop.file : undefined;
}

function liveHeadshot(person: { recordId: string; hasHeadshot: boolean; headshotBytes?: number }, fallback: string | null): string | null {
  const reviewed = reviewedHeadshot(person);
  if (reviewed !== undefined) return reviewed;
  return person.hasHeadshot ? `/api/airtable/headshot/${person.recordId}` : fallback;
}

export async function withAirtable(snapshot: EventSnapshot): Promise<EventSnapshot> {
  const [liveTalent, live, livePartners] = await Promise.all([getAirtableTalent(), getAirtableSchedule(), getAirtablePartners()]);
  // Owner (Sept 21): the schedule must match Airtable's current Run of Show, even before the live link is set up.
  // It replaces only the stale published revision 9 (and never an intentionally empty publication);
  // any newer staff publication wins.
  const stale = snapshot.revision <= recordedAgainstRevision && snapshot.scheduleItems.length > 0;
  // Owner (Sept 22): until told otherwise the schedule follows the owner's Google Doc, not Airtable
  // (live or recorded). Set scheduleFollowsDoc to false to return to Airtable's Run of Show.
  const doc = scheduleFollowsDoc() && snapshot.scheduleItems.length > 0 ? recordedAirtableSchedule(scheduleDoc2026) : [];
  const recorded = stale ? recordedAirtableSchedule() : [];
  const sessions = doc.length ? doc : live ?? (recorded.length ? recorded : null);
  // The same applies to the recorded Airtable people (with local copies of their headshots) and partners.
  const talent: RecordedAirtablePerson[] | null = liveTalent ?? (stale && airtableTalent2026.length ? airtableTalent2026 : null);
  const partners = livePartners ?? (stale && airtablePartners2026.length ? airtablePartners2026 : null);
  if (!talent && !sessions && !partners) return snapshot;
  const next: EventSnapshot = { ...snapshot };
  let people: Map<string, AirtableOverlayPerson> | null = null;
  if (talent && snapshot.event.directoryEnabled) {
    people = new Map();
    const ranks = assignRanks(talent);
    next.speakers = talent.filter(isPublicAirtablePerson).map(person => {
      const key = personNameKey(person.name);
      const existing = snapshot.speakers.find(speaker => personNameKey(speaker.name) === key);
      const speakerId = existing?.id ?? airtableUuid(person.recordId);
      people!.set(key, { ...person, speakerId, categories: airtableCategories(person.groups), featured: person.groups.includes(featuredGroup), rank: talent.indexOf(person),
        ...(talentTier(person.groups) ? { tier: talentTier(person.groups)! } : {}), ...(ranks.has(person) ? { topRank: ranks.get(person)! } : {}) });
      return {
        id: speakerId, eventId: snapshot.event.id, name: person.name,
        // Owner (Sept 21, late): the website shows Airtable's Title column only, never Occupation.
        // Sept 22 meeting: the title comes from Airtable (or one already published on the website); nothing is invented.
        role: person.title || existing?.role || "",
        // Airtable's bio wins; then a published one, ICF's own bio, and finally the interim bio.
        bio: person.bio || existing?.bio || awardsBiographies[person.name]?.bio || interimBio2026(person.name) || "",
        headshotUrl: "headshotFile" in person && person.headshotFile ? person.headshotFile
          // Live: an unchanged Airtable photo keeps its face-centered crop; a new one comes from Airtable.
          : liveTalent ? liveHeadshot(person, existing?.headshotUrl ?? null)
          : existing?.headshotUrl ?? null,
        published: true
      };
    });
  }
  if (sessions) {
    next.scheduleItems = scheduleFromAirtable(sessions, snapshot);
      // Staff-authored timing notes describe the old schedule; Airtable now supplies the times.
    next.contentPages = snapshot.contentPages.filter(page => !/^schedule-pending-/.test(page.slug));
  }
  setAirtableOverlay(next, { people, partners, schedule: Boolean(sessions) });
  return next;
}
