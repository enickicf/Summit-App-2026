import { getSessionTemporalState, type groupPublishedProgramByDay } from "@not-alone/domain";
import type { ScheduleItem } from "@not-alone/validation";

export type ScheduleDay = ReturnType<typeof groupPublishedProgramByDay>[number];

export function eventTimeZoneLabel(timeZone: string, referenceUtc: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "longGeneric" })
      .formatToParts(new Date(referenceUtc)).find(part => part.type === "timeZoneName")?.value ?? timeZone.replaceAll("_", " ");
  } catch {
    return timeZone.replaceAll("_", " ");
  }
}

export function eventDateKey(utc: string, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone, year: "numeric", month: "2-digit", day: "2-digit"
  }).formatToParts(new Date(utc));
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find(value => value.type === type)!.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function initialScheduleDay(days: ScheduleDay[], today: string): string {
  return days.find(day => day.date >= today)?.date ?? days.at(-1)?.date ?? "";
}

export function scheduleDayForKey(days: ScheduleDay[], selected: string, today: string): ScheduleDay | undefined {
  return days.find(day => day.date === selected) ?? days.find(day => day.date === initialScheduleDay(days, today));
}

export function tabIndexForKey(key: string, index: number, count: number): number | undefined {
  if (count === 0) return undefined;
  if (key === "ArrowRight") return (index + 1) % count;
  if (key === "ArrowLeft") return (index - 1 + count) % count;
  if (key === "Home") return 0;
  if (key === "End") return count - 1;
  return undefined;
}

export function groupSessionsByStart(items: ScheduleItem[]) {
  const groups = new Map<string, ScheduleItem[]>();
  for (const item of [...items].sort((a, b) => Date.parse(a.startUtc) - Date.parse(b.startUtc))) {
    // An instant is the group key: repeated DST clock labels are different starts.
    const key = new Date(item.startUtc).toISOString();
    const group = groups.get(key) ?? [];
    group.push(item);
    groups.set(key, group);
  }
  return [...groups].map(([startUtc, groupedItems]) => ({ startUtc, items: groupedItems }));
}

export function formatSessionTimes(item: ScheduleItem, timeZone: string) {
  const clock = new Intl.DateTimeFormat("en-US", {
    timeZone, hour: "numeric", minute: "2-digit", timeZoneName: "short"
  });
  const start = clock.format(new Date(item.startUtc));
  const endClock = clock.format(new Date(item.endUtc));
  const sameDay = eventDateKey(item.startUtc, timeZone) === eventDateKey(item.endUtc, timeZone);
  const endDate = new Intl.DateTimeFormat("en-US", { timeZone, month: "short", day: "numeric", year: "numeric" });
  return { start, end: sameDay ? endClock : `${endDate.format(new Date(item.endUtc))}, ${endClock}` };
}

export function sessionDisplaySummary(item: ScheduleItem): string | null {
  const generated = `${item.title}. ${item.locationName}. ${item.eligibilityScope.label}.`;
  // A summary that only repeats the title (e.g. "Poker Night" under "Poker Night") adds nothing (owner, Sept 28).
  const summary = item.summary.trim();
  return summary === generated.trim() || summary.toLowerCase() === item.title.trim().toLowerCase() ? null : item.summary;
}

export function scheduleStatusLabels(item: ScheduleItem, nowUtc: string): string[] {
  const labels: string[] = [];
  if (item.status !== "scheduled") labels.push(item.status[0]!.toUpperCase() + item.status.slice(1));
  // Normalize valid UTC representations before the shared domain's comparisons.
  const temporalState = getSessionTemporalState({
    ...item, startUtc: new Date(item.startUtc).toISOString(), endUtc: new Date(item.endUtc).toISOString()
  }, new Date(nowUtc).toISOString());
  if (temporalState === "current") labels.push("Scheduled now");
  if (temporalState === "completed" && item.status !== "completed") labels.push("Ended");
  return labels;
}

// Access is shown publicly only for founders-only events, where it must be explicit.
export function isFoundersOnly(item: ScheduleItem): boolean {
  return item.eligibilityScope.id === "founders" || /^founders?(?:['’]s?)?(?:\s+only)?$/i.test(item.eligibilityScope.label.trim());
}
