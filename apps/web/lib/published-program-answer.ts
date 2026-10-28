import { createAttendeeConciergeAnswer } from "@not-alone/domain/concierge";
import type { EventSnapshot } from "@not-alone/validation";
import { formatSessionTimes } from "../app/schedule/schedule-presentation";
import { notCoveredAnswer } from "./ask-ai-policy";

const programIntent = /\b(schedule|program|agenda|activities|events?|sessions?|speakers?|speaking|performing|appearing|monday|tuesday|wednesday|thursday|friday|saturday|sunday|now|next|happening|live|red carpet|tennis|high tea|doors open|pre-show|ai relationships|founders?|dinner|lunch|meals?|food|music|concerts?|performances?|poker|bike|ride|registration|check[ -]in|badges?|credentials?|wellness|meditation|quiet|reset|breath|attire|dress code|wear|where|location|when|what time|starts?|ends?)\b/i;

function publishedItem(item: EventSnapshot["scheduleItems"][number]): string {
  const day = new Intl.DateTimeFormat("en-US", { timeZone: item.eventTimeZone, weekday: "long", month: "long", day: "numeric", year: "numeric" }).format(new Date(item.startUtc));
  const times = formatSessionTimes(item, item.eventTimeZone);
  const when = Date.parse(item.endUtc) === Date.parse(item.startUtc) ? times.start : `${times.start} – ${times.end}`;
  const location = item.locationName.trim() || "location to be confirmed";
  const attire = (item as typeof item & { attire?: string }).attire?.trim();
  return [`${item.title}${item.status === "scheduled" ? "" : ` (${item.status})`}`, `${day}, ${when}`, `Location: ${location}`, ...(attire ? [`Attire: ${attire}`] : [])].join("\n");
}

function requestedNovemberDay(question: string): number | null {
  const match = /\b(?:nov(?:ember)?\.?\s+([1-9]|[12]\d|30)(?:st|nd|rd|th)?|11\/([1-9]|[12]\d|30)|2026-11-([0-2]\d|30))\b/i.exec(question);
  return match ? Number(match[1] || match[2] || match[3]) : null;
}

export function publishedProgramAnswer(question: string, snapshot: EventSnapshot, nowUtc: string, { personSchedule = false }: { personSchedule?: boolean } = {}): string | null {
  // The route sets personSchedule only after finding an explicit public speakerId
  // link, so questions such as "When is Jewel speaking?" need no program keyword.
  const requestedDay = requestedNovemberDay(question);
  if (/\b(?:where|how)\b.*\b(?:find|see|view|check)\b.*\bschedule\b/i.test(question)) return null;
  if (/\b(?:community day|nevada mental health day)\b/i.test(question)) {
    const items = snapshot.scheduleItems.filter(item => item.eventId === snapshot.event.id && item.published && item.visibilityScope.id === "public"
      && /\b(?:community day|nevada mental health day)\b/i.test(item.title)).sort((a, b) => a.startUtc.localeCompare(b.startUtc));
    if (!items.length) return null;
    return [...items.map(publishedItem), "Timings and program subject to change."].join("\n\n");
  }
  if (/\bawards?(?: show)?\b/i.test(question) && /\b(?:when|time|starts?|doors?|attire|dress code|wear|where|venue|location|held)\b/i.test(question)) {
    const items = snapshot.scheduleItems.filter(item => item.eventId === snapshot.event.id && item.published && item.visibilityScope.id === "public"
      && /^(?:(?:not alone )?awards show(?: doors open)?|doors open)$/i.test(item.title.trim())).sort((a, b) => a.startUtc.localeCompare(b.startUtc));
    if (items.length) return [
      ...(/\bdoors?\b/i.test(question) && !items.some(item => /doors open/i.test(item.title)) ? [`The published schedule does not specify a doors opening time. ${notCoveredAnswer}`] : []),
      ...items.map(publishedItem),
      "Timings and program subject to change."
    ].join("\n\n");
  }
  if (!personSchedule && !programIntent.test(question) && !requestedDay) return null;
  const weekdays = [...question.toLowerCase().matchAll(/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/g)].map(match => match[1]);
  if (!personSchedule && weekdays.length) {
    // Include every requested item, rather than the shared app interpreter's
    // first-eight preview. A busy wellness morning must not hide lunch/sessions.
    const topics = [
      { intent: /\bsummit sessions?\b/i, title: /\bsummit sessions?\b/i },
      { intent: /\blunch\b/i, title: /\blunch\b/i },
      { intent: /\bdinner\b/i, title: /\bdinner\b/i },
      { intent: /\bwellness\b/i, title: /\bwellness\b/i }
    ].filter(topic => topic.intent.test(question));
    const items = snapshot.scheduleItems.filter(item => item.eventId === snapshot.event.id && item.published && item.visibilityScope.id === "public"
      && weekdays.includes(new Intl.DateTimeFormat("en-US", { timeZone: item.eventTimeZone, weekday: "long" }).format(new Date(item.startUtc)).toLowerCase())
      && (!topics.length || topics.some(topic => topic.title.test(item.title))))
      .sort((a, b) => a.startUtc.localeCompare(b.startUtc));
    if (items.length) return [...items.map(publishedItem), "Timings and program subject to change."].join("\n\n");
    return "No matching public activities are currently listed for that day. Check the published schedule for updates.";
  }
  if (requestedDay && /\b(schedule|program|agenda|happens?|happening|activities|events?|sessions?|what is on|what's on)\b/i.test(question)) {
    const items = snapshot.scheduleItems.filter(item => item.eventId === snapshot.event.id && item.published && item.visibilityScope.id === "public"
      && Number(new Intl.DateTimeFormat("en-US", { timeZone: item.eventTimeZone, day: "numeric", month: "numeric" }).formatToParts(new Date(item.startUtc)).find(part => part.type === "day")?.value) === requestedDay
      && new Intl.DateTimeFormat("en-US", { timeZone: item.eventTimeZone, month: "numeric" }).format(new Date(item.startUtc)) === "11")
      .sort((a, b) => a.startUtc.localeCompare(b.startUtc));
    if (!items.length) return `No public activities are currently listed for November ${requestedDay}, 2026. Check the published Schedule for updates.`;
    return [`Public schedule for November ${requestedDay}, 2026:`, ...items.map(publishedItem), "Timings and program subject to change."].join("\n\n");
  }
  // Keep one shared program interpreter. The web adapter adds complete dates,
  // cancellation/access labels and overnight times to its plain-text response.
  const result = createAttendeeConciergeAnswer({ question, snapshot, nowUtc });
  if (result.title === "Best current answer" || result.title === "Registration and arrival" && !result.items.length
    || /^Next:|^No next session found/.test(result.title) && !/\b(?:next|go)\b/i.test(question)) return null;
  const items = result.items.flatMap(resultItem => {
    const item = snapshot.scheduleItems.find(candidate => candidate.id === resultItem.id && candidate.published && candidate.visibilityScope.id === "public" && candidate.eventId === snapshot.event.id);
    if (!item) return [];
    return [publishedItem(item)];
  });
  return [result.body, ...items, ...(items.length || /\b\d{1,2}(?::\d{2})?\s*(?:AM|PM)\b/i.test(result.body) ? ["Timings and program subject to change."] : [])].join("\n\n");
}
