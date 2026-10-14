import { createAttendeeConciergeAnswer } from "@not-alone/domain/concierge";
import { publicLocation } from "./room-privacy";
import type { EventSnapshot } from "@not-alone/validation";
import { formatSessionTimes } from "../app/schedule/schedule-presentation";

const programIntent = /\b(schedule|program|agenda|activities|events?|sessions?|monday|tuesday|wednesday|thursday|friday|saturday|sunday|now|next|happening|live|awards?|red carpet|tennis|high tea|doors open|pre-show|ai relationships|community|founders?|dinner|lunch|meals?|food|music|concerts?|performances?|poker|bike|ride|registration|check[ -]in|badges?|credentials?|wellness|meditation|quiet|reset|breath)\b/i;

function requestedNovemberDay(question: string): number | null {
  const match = /\b(?:nov(?:ember)?\.?\s+([1-9]|[12]\d|30)(?:st|nd|rd|th)?|11\/([1-9]|[12]\d|30)|2026-11-([0-2]\d|30))\b/i.exec(question);
  return match ? Number(match[1] || match[2] || match[3]) : null;
}

export function publishedProgramAnswer(question: string, snapshot: EventSnapshot, nowUtc: string, { personSchedule = false }: { personSchedule?: boolean } = {}): string | null {
  // The route sets personSchedule only after finding an explicit public speakerId
  // link, so questions such as "When is Jewel speaking?" need no program keyword.
  const requestedDay = requestedNovemberDay(question);
  if (!personSchedule && !programIntent.test(question) && !requestedDay) return null;
  if (requestedDay && /\b(schedule|program|agenda|happens?|happening|activities|events?|sessions?|what is on|what's on)\b/i.test(question)) {
    const items = snapshot.scheduleItems.filter(item => item.eventId === snapshot.event.id && item.published && item.visibilityScope.id === "public"
      && Number(new Intl.DateTimeFormat("en-US", { timeZone: item.eventTimeZone, day: "numeric", month: "numeric" }).formatToParts(new Date(item.startUtc)).find(part => part.type === "day")?.value) === requestedDay
      && new Intl.DateTimeFormat("en-US", { timeZone: item.eventTimeZone, month: "numeric" }).format(new Date(item.startUtc)) === "11")
      .sort((a, b) => a.startUtc.localeCompare(b.startUtc));
    if (!items.length) return `No public activities are currently listed for November ${requestedDay}, 2026. Check the published Schedule for updates.`;
    return [`Public schedule for November ${requestedDay}, 2026 (${snapshot.event.timeZone}):`, ...items.map(item => {
      const time = formatSessionTimes(item, item.eventTimeZone);
      const room = publicLocation(item.locationName);
      return `${time.start} — ${item.title}${item.status === "scheduled" ? "" : ` (${item.status})`}${room ? `, ${room}` : ""}. Access: ${item.eligibilityScope.label}.`;
    }), "See the Schedule page for updates."].join("\n");
  }
  // Keep one shared program interpreter. The web adapter adds complete dates,
  // cancellation/access labels and overnight times to its plain-text response.
  const result = createAttendeeConciergeAnswer({ question, snapshot, nowUtc });
  if (result.title === "Best current answer") return null;
  const items = result.items.flatMap(resultItem => {
    const item = snapshot.scheduleItems.find(candidate => candidate.id === resultItem.id && candidate.published && candidate.visibilityScope.id === "public" && candidate.eventId === snapshot.event.id);
    if (!item) return [];
    const day = new Intl.DateTimeFormat("en-US", { timeZone: item.eventTimeZone, weekday: "long", month: "long", day: "numeric", year: "numeric" }).format(new Date(item.startUtc));
    const times = formatSessionTimes(item, item.eventTimeZone);
    const status = item.status === "scheduled" ? "" : ` (${item.status})`;
    const when = item.endUtc === item.startUtc ? times.start : `${times.start} - ${times.end}`;
    const room = publicLocation(item.locationName);
    return [`${item.title}${status}\n${day}, ${when}\n${room ? `${room}. ` : ""}Access: ${item.eligibilityScope.label}.`];
  });
  return [result.body, ...items].join("\n\n");
}
