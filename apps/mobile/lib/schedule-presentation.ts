// Public schedule presentation rules, mirrored from the Summit website (apps/web/app/schedule)
// so the app and site show the same details: founders-only access is the only access label,
// generic caveats are omitted, and start-only notes never gain an invented end, room or status.
import type { ScheduleItem } from "@not-alone/validation";

export function isFoundersOnly(item: ScheduleItem): boolean {
  return item.eligibilityScope.id === "founders" || /^founders?(?:['’]s?)?(?:\s+only)?$/i.test(item.eligibilityScope.label.trim());
}

export function sessionDisplaySummary(item: ScheduleItem): string | null {
  const generated = `${item.title}. ${item.locationName}. ${item.eligibilityScope.label}.`;
  return item.summary.trim() === generated.trim() ? null : item.summary;
}

export function displayLocation(locationName: string): string {
  return /^location to be confirmed\.?$/i.test(locationName.trim()) ? "To be confirmed" : locationName;
}

export type PendingBlock = { title: string; start: string; detail: string };

export function publicPendingProgramBlocks(body: string): PendingBlock[] {
  return body.split(/\r?\n\s*\r?\n/).map(text => {
    const match = /^([^:\n]+):\s*(\d{1,2}:\d{2}\s*[AP]M)([\s\S]*)$/i.exec(text.trim());
    return match
      ? { title: match[1]!.trim(), start: match[2]!, detail: match[3]!.replace(/^[;\s]+/, "").trim() }
      : { title: "", start: "", detail: text.trim() };
  })
    .filter(block => block.detail || block.start)
    .filter(block => block.start || !/^locations and access details to be confirmed\.?$/i.test(block.detail))
    .map(block => block.start && /^end time to be confirmed\.?$/i.test(block.detail) ? { ...block, detail: "" } : block);
}

export function splitClock(iso: string, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone }).formatToParts(new Date(iso));
  return {
    time: `${parts.find(part => part.type === "hour")?.value ?? ""}:${parts.find(part => part.type === "minute")?.value ?? ""}`,
    period: parts.find(part => part.type === "dayPeriod")?.value ?? ""
  };
}
