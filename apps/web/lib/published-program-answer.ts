import { createAttendeeConciergeAnswer } from "@not-alone/domain/concierge";
import { publicLocation } from "./room-privacy";
import type { EventSnapshot } from "@not-alone/validation";
import { formatSessionTimes } from "../app/schedule/schedule-presentation";

const programIntent = /\b(schedule|program|monday|tuesday|wednesday|thursday|friday|saturday|sunday|now|next|happening|live|awards?|red carpet|tennis|high tea|doors open|pre-show|ai relationships|community|founders?|dinner|lunch|meals?|food|music|concerts?|performances?|poker|bike|ride|registration|check[ -]in|badges?|credentials?|wellness|meditation|quiet|reset|breath)\b/i;

export function publishedProgramAnswer(question: string, snapshot: EventSnapshot, nowUtc: string, { personSchedule = false }: { personSchedule?: boolean } = {}): string | null {
  // The route sets personSchedule only after finding an explicit public speakerId
  // link, so questions such as "When is Jewel speaking?" need no program keyword.
  if (!personSchedule && !programIntent.test(question)) return null;
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
