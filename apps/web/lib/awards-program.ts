import type { EventSnapshot } from "@not-alone/validation";
import { awards2026Editorial } from "./awards-editorial";
import { airtableOverlay } from "./airtable-shared";

type Item = EventSnapshot["scheduleItems"][number];
const timedProgramLabels = new Set(["Red Carpet", "Awards Show"]);
const pendingProgramLabels = new Set(["Doors Open", "Pre-Show"]);
const dateHeading = /^(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday), [A-Za-z]+ \d{1,2}, \d{4}$/;

export function publicAwardsShow(snapshot: EventSnapshot | null): Item | undefined {
  return snapshot?.scheduleItems.find(item => item.eventId === snapshot.event.id && item.title === "Awards Show" && item.published && item.visibilityScope.id === "public");
}

function programDate(instant: string, timeZone: string) {
  return new Intl.DateTimeFormat("en-US", { timeZone, weekday: "long", month: "long", day: "numeric", year: "numeric" }).format(new Date(instant));
}

export function awardsDate(item: Item) {
  return programDate(item.startUtc, item.eventTimeZone);
}

function programTime(item: Item, show: Item) {
  const time = new Intl.DateTimeFormat("en-US", { timeZone: item.eventTimeZone, hour: "numeric", minute: "2-digit" });
  const day = awardsDate(item) === awardsDate(show) ? "" : `${awardsDate(item)} · `;
  const start = time.format(new Date(item.startUtc));
  // A session without an end time (start == end) shows its start only; no end is invented.
  if (item.endUtc === item.startUtc) return `${item.title}: ${day}${start}${item.status === "scheduled" ? "" : ` (${item.status})`}`;
  const end = time.format(new Date(item.endUtc));
  const endDate = programDate(item.endUtc, item.eventTimeZone);
  const endDay = endDate === awardsDate(item) ? "" : ` (${endDate})`;
  const status = item.status === "scheduled" ? "" : ` (${item.status})`;
  return `${item.title}: ${day}${start}-${end}${endDay}${status}`;
}

// The published program is plain text. Reconcile only its known timetable lines;
// preserve editorial copy and incomplete-timing notes without inventing end times.
export function reconcileAwardsProgram(body: string, snapshot: EventSnapshot | null) {
  const show = publicAwardsShow(snapshot);
  if (!show || show.status === "canceled") return null;
  const publicItems = snapshot!.scheduleItems.filter(item => item.eventId === snapshot!.event.id && item.published && item.visibilityScope.id === "public");
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: show.eventTimeZone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date(show.startUtc));
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find(value => value.type === type)!.value;
  const dateKey = `${part("year")}-${part("month")}-${part("day")}`;
  const pendingLines = snapshot!.contentPages.filter(page => page.published && page.slug === `schedule-pending-${dateKey}`).flatMap(page => page.body.split(/\r?\n/));
  return body.split(/\r?\n/).map(line => {
    const trimmed = line.trim();
    if (dateHeading.test(trimmed)) return awardsDate(show);
    const separator = trimmed.indexOf(":");
    const label = separator < 0 ? "" : trimmed.slice(0, separator);
    if (pendingProgramLabels.has(label)) {
      const completeItem = publicItems.find(candidate => candidate.title === label);
      if (completeItem) return completeItem.status === "canceled" ? `${label}: Canceled` : programTime(completeItem, show);
      return pendingLines.find(note => note.trim().startsWith(`${label}:`))?.trim() ?? `${label}: Details to be confirmed`;
    }
    if (!timedProgramLabels.has(label)) return line;
    const item = publicItems.find(candidate => candidate.title === label);
    if (!item) return `${label}: Details to be confirmed`;
    return item.status === "canceled" ? `${label}: Canceled` : programTime(item, show);
  }).join("\n");
}

export function awardsPromotionalProgram(body: string, snapshot: EventSnapshot | null) {
  const reconciled = reconcileAwardsProgram(body, snapshot);
  if (!reconciled) return null;
  const show = publicAwardsShow(snapshot)!;
  const publishedTitles = new Set(snapshot!.scheduleItems.filter(item => item.eventId === snapshot!.event.id && item.published && item.visibilityScope.id === "public").map(item => item.title));
  // Editorial corrections apply only to the legacy publication; Airtable's Run of Show is authoritative.
  const corrections = !airtableOverlay(snapshot)?.schedule && awardsDate(show) === awards2026Editorial.date ? awards2026Editorial.eveningTimes.filter(entry => !publishedTitles.has(entry.label)) : [];
  const corrected = new Set<string>();
  return reconciled.split(/\r?\n/).flatMap(line => {
    // Correct only the reviewed legacy notes on the owner-specified date. A later published
    // session or moved show always wins over this editorial correction.
    const label = line.slice(0, Math.max(0, line.indexOf(":")));
    const correction = corrections.find(entry => entry.label === label);
    if (correction && /^(Doors Open: 6:30 PM|Pre-Show: 7:30 PM)(?:; end time to be confirmed\.)?$/.test(line)) {
      corrected.add(label);
      // Oct 7: Nevada Mental Health Day (daytime) is no longer part of the Awards Show program text.
      return [`${label}: ${correction.time}`];
    }
    return [line];
  }).map(line => {
    if (/^(Room,|All times are Pacific\.|Locations and access details|.*complete show lineup will be announced)/i.test(line)) return "";
    if (/^(Doors Open|Pre-Show|Red Carpet|Awards Show): Details to be confirmed/.test(line)) return "";
    return line.replace(/; end time to be confirmed\./gi, "");
  }).filter((line, index, lines) => line.trim() || lines[index - 1]?.trim()).join("\n").trim();
}

export function awardsHeroTimes(program: string | null, snapshot: EventSnapshot | null) {
  const show = publicAwardsShow(snapshot);
  if (!show || show.status === "canceled") return [];
  const lines = program?.split(/\r?\n/) ?? [];
  const live = airtableOverlay(snapshot)?.schedule;
  return ["Red Carpet", "Doors Open", "Nevada Day", "Community Day", "Pre-Show", "Awards Show"].flatMap(label => {
    // With Airtable's Run of Show, the evening's own sessions supply the times directly.
    const session = live ? snapshot!.scheduleItems.find(item => item.title === label && item.eventId === snapshot!.event.id && awardsDate(item) === awardsDate(show)) : undefined;
    const line = label === "Awards Show" ? programTime(show, show) : session ? programTime(session, show) : lines.find(value => value.startsWith(`${label}: `));
    return line ? [{ label, time: line.slice(label.length + 2) }] : [];
  });
}
