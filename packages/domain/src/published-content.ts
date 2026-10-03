import type { EventSnapshot } from "@not-alone/validation";
import { DateTime } from "luxon";

const pendingTimeLine = /^(?:\d{1,2}(?::\d{2})?\s*(?:AM|PM)(?:;\s*(?:start|end) time to be confirmed)?|(?:start|end) time:\s*(?:\d{1,2}(?::\d{2})?\s*(?:AM|PM)|to be confirmed)|timing to be confirmed)\.?$/i;

// Null means staff has not activated the reviewed directory. Empty means an
// intentionally empty publication; never restore removed names from bundled data.
export function publishedDirectory(snapshot: EventSnapshot) {
  if (!snapshot.event.directoryEnabled) return null;
  return snapshot.speakers.filter(person => person.published && person.eventId === snapshot.event.id);
}

export function publishedAwardsProgram(snapshot: EventSnapshot) {
  return snapshot.contentPages.find(page => page.slug === "awards-2026-program" && page.published) ?? null;
}

export function groupPublishedProgramByDay(snapshot: EventSnapshot) {
  const visibleItems = snapshot.scheduleItems.filter(item => item.eventId === snapshot.event.id && item.published && item.visibilityScope.id === "public");
  const dates = new Set(visibleItems.map(item =>
    DateTime.fromISO(item.startUtc).setZone(snapshot.event.timeZone).toISODate()!
  ));
  const notes = snapshot.contentPages.filter(page => page.published && /^schedule-pending-\d{4}-\d{2}-\d{2}$/.test(page.slug)).flatMap(page => {
    const date = page.slug.replace("schedule-pending-", "");
    const key = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    let replaced = false;
    let removeTimingContinuation = false;
    const lines = page.body.split(/\r?\n/).filter(line => {
      // Prefer the full known title when the title itself contains a colon.
      const heading = [...line.matchAll(/:/g)].reverse().find(match =>
        visibleItems.some(item => key(item.title) === key(line.slice(0, match.index)))
      );
      if (!heading) {
        // Only recognizable timing lines belong to a resolved standalone
        // heading. Unknown prose and paragraph boundaries stop the removal.
        if (removeTimingContinuation && pendingTimeLine.test(line.trim())) return false;
        removeTimingContinuation = false;
        return true;
      }
      const candidates = visibleItems.filter(item => key(item.title) === key(line.slice(0, heading.index)));
      // A title alone does not establish a reschedule across event-local dates.
      const resolved = candidates.some(item => DateTime.fromISO(item.startUtc).setZone(snapshot.event.timeZone).toISODate() === date);
      removeTimingContinuation = resolved && !line.slice(heading.index + 1).trim();
      replaced ||= resolved;
      return !resolved;
    });
    if (replaced && lines.every(line => !line.trim() || line.trim() === "Locations and access details to be confirmed.")) return [];
    const body = lines.join("\n").trim();
    return body ? [{ ...page, body }] : [];
  });
  for (const note of notes) dates.add(note.slug.replace("schedule-pending-", ""));
  return [...dates].sort().filter(date => DateTime.fromISO(date).isValid).map(date => ({
    date,
    dayLabel: DateTime.fromISO(date).toFormat("cccc, LLLL d"),
    weekday: DateTime.fromISO(date).toFormat("ccc"),
    shortDate: DateTime.fromISO(date).toFormat("LLL d"),
    items: visibleItems.filter(item => DateTime.fromISO(item.startUtc).setZone(snapshot.event.timeZone).toISODate() === date)
      .sort((a, b) => a.startUtc.localeCompare(b.startUtc)),
    notes: notes.filter(note => note.slug === `schedule-pending-${date}`)
  }));
}
