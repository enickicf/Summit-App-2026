import { getNowAndUpcoming, groupPublishedProgramByDay, toEventTimeRange } from "./index";
import type { EventSnapshot, ScheduleItem } from "@not-alone/validation";
import { DateTime } from "luxon";

export type AttendeeConciergeAnswer = {
  mode: "temporary-local" | "openai-ready";
  title: string;
  body: string;
  items: Array<{
    id: string;
    title: string;
    time: string;
    locationName: string;
  }>;
  warnings: string[];
};

const publicSummitKnowledge = {
  foundation:
    "Inspiring Children Foundation is a Las Vegas-based 501(c)(3) nonprofit with more than 25 years supporting young people through whole-human development: physical health, emotional wellbeing, academics, athletics, creativity, entrepreneurship, and service.",
  summit:
    "Not Alone Summit is a premium human-development convening focused on emotional and mental health. It brings together leaders, artists, athletes, clinicians, researchers, philanthropists, and youth voices.",
  checkIn:
    "Use the loaded schedule for registration, credential pickup, and room guidance. Final check-in details should be verified by staff before production launch.",
  emergency:
    "This app can help with summit schedule and event information, but it is not emergency or crisis care."
};

export function createAttendeeConciergeAnswer({
  question,
  snapshot,
  nowUtc
}: {
  question: string;
  snapshot: EventSnapshot;
  nowUtc: string;
}): AttendeeConciergeAnswer {
  const normalized = question.toLowerCase();
  const allItems = snapshot.scheduleItems.filter(item => item.eventId === snapshot.event.id && item.published && item.visibilityScope.id === "public").sort((left, right) => left.startUtc.localeCompare(right.startUtc));
  const timeline = getNowAndUpcoming({
    snapshot: { ...snapshot, scheduleItems: allItems },
    nowUtc,
    audienceGroups: ["public"]
  });
  const personMatch = findPersonScheduleMatch(normalized, allItems, snapshot);
  const dayMatch = findDayScheduleMatch(normalized, allItems, snapshot.event.timeZone);
  const locationMatch = findLocationMatch(normalized, snapshot);
  const pendingDays = groupPublishedProgramByDay(snapshot).filter(day => day.notes.length > 0);
  const currentDate = DateTime.fromISO(nowUtc, { zone: "utc" }).setZone(snapshot.event.timeZone).toISODate()!;
  const pendingUpcoming = pendingDays.filter(day => day.date >= currentDate);
  const pendingGuidance = pendingUpcoming.length > 0 ? ` Activities with unconfirmed timing remain for ${pendingUpcoming.map(day => day.dayLabel).join("; ")}. Check Schedule for the published timing notes.` : "";

  if (matchesAny(normalized, ["emergency", "crisis", "suicide", "self harm", "self-harm", "unsafe"])) {
    return createAnswer({
      title: "Immediate human support",
      body: `${publicSummitKnowledge.emergency} If you are in immediate danger in the United States, call emergency services or call/text 988 for crisis support.`,
      items: []
    });
  }

  const topicGroups = [
    ["awards", "award show", "red carpet"],
    ["community"],
    ["founder"],
    ["sponsor and talent dinner"],
    ["dinner", "lunch", "meal", "food"],
    ["music", "concert", "performance"],
    ["poker"],
    ["bike", "ride"]
  ];
  const topic = topicGroups.find(terms => matchesAny(normalized, terms));
  const activityDetails = topic && matchesAny(normalized, ["when", "where", "time", "timing", "location", "room", "schedule", "program"]);

  if (!activityDetails && matchesAny(normalized, ["sponsor", "powered by", "presented by", "cohen", "villa"])) {
    const sponsors = snapshot.sponsors.filter(sponsor => sponsor.published);
    return createAnswer({
      title: "Published event partners",
      body: sponsors.length > 0
        ? `${sponsors.map(sponsor => `${sponsor.tier}: ${sponsor.name}`).join(". ")}. Only currently published partners are listed.`
        : "Event partners have not been published yet.",
      items: []
    });
  }

  if (matchesAny(normalized, ["inspiring children", "foundation", "icf", "nonprofit"])) {
    return createAnswer({
      title: "Inspiring Children Foundation",
      body: snapshot.contentPages.find(page => page.published && page.slug === "inspiring-children-foundation")?.body ?? publicSummitKnowledge.foundation,
      items: []
    });
  }

  if (personMatch) {
    return createAnswer({
      title: personMatch.items.length > 0
        ? `${personMatch.name} in the current app schedule`
        : `${personMatch.name} does not have a published appearance time yet`,
      body:
        personMatch.items.length > 0
          ? `${personMatch.name} has published schedule records below.${personMatch.items.some(item => item.status === "canceled") ? " Canceled appearances will not take place." : ""}`
          : `${personMatch.confirmed ? `${personMatch.name} is a confirmed 2026 guest, but attendance does not confirm a speaking slot.` : `${personMatch.name} is not confirmed in the current published 2026 guest list.`} The current app schedule does not include a specific published appearance time yet.`,
      items: personMatch.items.slice(0, 4),
      snapshot
    });
  }

  if (dayMatch) {
    const notes = pendingDays.filter(day => day.dayLabel.toLowerCase().startsWith(dayMatch.label.split(" ")[0]!.toLowerCase()));
    return createAnswer({
      title: `${dayMatch.label} schedule`,
      body: (
        dayMatch.items.length > 0
          ? `${dayMatch.items.length} published session${dayMatch.items.length === 1 ? " is" : "s are"} loaded for ${dayMatch.label.toLowerCase()}.`
          : `No fully timed sessions are published for ${dayMatch.label.toLowerCase()} yet.`) + notes.map(day => `\n\n${day.notes.map(note => note.body).join("\n\n")} All times are Pacific.`).join(""),
      items: dayMatch.items.slice(0, 8),
      snapshot
    });
  }

  const pendingTerms = ["tennis", "high tea", "doors open", "pre-show", "ai relationships"].filter(term => normalized.includes(term));
  const resolvedPendingItems = allItems.filter(item => containsName(item.title, pendingTerms));
  if (resolvedPendingItems.length > 0) return createAnswer({
    title: "Published program details",
    body: `Use the published activity details below.${resolvedPendingItems.some(item => item.status === "canceled") ? " Canceled activities will not take place." : ""}`,
    items: resolvedPendingItems, snapshot
  });
  const pendingMatch = pendingDays.find(day => day.notes.some(note => pendingTerms.some(term => note.body.toLowerCase().includes(term))));
  if (pendingMatch) return createAnswer({
    title: `${pendingMatch.dayLabel}: timing to be confirmed`,
    body: `${pendingMatch.notes.map(note => note.body).join("\n\n")} All times are Pacific.`, items: []
  });

  if (matchesAny(normalized, ["now", "happening", "live", "current"])) {
    return createAnswer({
      title: timeline.current.length > 0 ? "Happening now" : "Nothing is live right now",
      body:
        timeline.current.length > 0
          ? "These are the sessions currently active for the loaded schedule."
          : timeline.upcoming[0]
            ? `The next loaded session is ${timeline.upcoming[0].title}.`
            : `There are no upcoming fully timed published sessions in the current snapshot.${pendingGuidance}`,
      items: timeline.current.length > 0 ? timeline.current : timeline.upcoming.slice(0, 3),
      snapshot
    });
  }

  if (matchesAny(normalized, ["quiet", "break", "wellness", "reset", "meditation", "breath"])) {
    const items = findItems(allItems, ["wellness", "reset", "meditation", "breath", "sauna", "pilates", "yoga"]);
    return createAnswer({
      title: "Quiet and wellness options",
      body: items.length > 0
        ? "These wellness activities are in the published schedule. Specific activities, room assignments, and access are only confirmed where stated."
        : "Quiet-room and wellness details are not fully published yet.",
      items: items.slice(0, 4),
      snapshot
    });
  }

  if (matchesAny(normalized, ["registration", "check in", "check-in", "badge", "credential", "arrive", "arrival"])) {
    const items = findItems(allItems, ["registration", "check in", "credential"]);
    return createAnswer({
      title: "Registration and arrival",
      body: items.length > 0 ? publicSummitKnowledge.checkIn : "Check-in times, credential pickup, and arrival instructions have not been published yet. Ask the event team; no registration desk or room is assumed.",
      items: items.slice(0, 4),
      snapshot
    });
  }

  if (locationMatch) {
    return createAnswer({
      title: locationMatch.location.name,
      body: locationMatch.guidance,
      items: locationMatch.items.slice(0, 4),
      snapshot
    });
  }

  if (matchesAny(normalized, ["performing", "performer", "hosting", "host", "honoree", "winning"]) || (/\bwho\b/.test(normalized) && matchesAny(normalized, ["speaking", "awards", "performances"]))) {
    return createAnswer({
      title: "Show roles require separate confirmation",
      body: "A confirmed guest list does not establish performers, hosts, speakers, or honorees. Check the published schedule and Awards program for separately confirmed assignments, or ask the event team.",
      items: []
    });
  }

  if (topic) {
    const items = findItems(allItems, topic);
    return createAnswer({
      title: "Published program details",
      body: items.length > 0
        ? "These activities are in the current published program. Attendance does not guarantee access; check each session's access details."
        : "No matching activity has been published yet. The event team will add details when confirmed.",
      items: items.slice(0, 6), snapshot
    });
  }

  if (matchesAny(normalized, ["next", "where", "go", "room", "location"])) {
    const nextItem = timeline.upcoming[0];
    return createAnswer({
      title: nextItem ? `Next: ${nextItem.title}` : "No next session found",
      body: nextItem
        ? `${nextItem.title}: ${toEventTimeRange(nextItem, snapshot.event.timeZone)}. ${nextItem.locationName}. Access: ${nextItem.eligibilityScope.label}.`
        : `No upcoming fully timed published session is available in the current snapshot.${pendingGuidance}`,
      items: timeline.upcoming.slice(0, 3),
      snapshot
    });
  }

  if (matchesAny(normalized, ["featured", "speaker", "speakers", "who"]) || containsName(normalized, ["mike", "tyson", "jewel", "wozniak"])) {
    const guests = snapshot.event.directoryEnabled ? snapshot.speakers.filter(person => person.published && person.eventId === snapshot.event.id) : [];
    return createAnswer({
      title: "Confirmed 2026 guests",
      body: guests.length > 0
        ? `${guests.map(person => person.name).join(", ")}. Attendance does not confirm a speaking time; check Schedule for published appearances.`
        : "No 2026 guests have been published yet.",
      items: findItems(allItems, normalized.split(/[^a-z0-9]+/).filter((word) => word.length > 3)).slice(0, 4),
      snapshot
    });
  }

  if (matchesAny(normalized, ["schedule", "program"])) {
    return createAnswer({
      title: "Published schedule",
      body: allItems.length > 0
        ? `The published schedule contains ${allItems.length} timed activities. ${allItems.length > 8 ? "The first eight are below; open Schedule for the complete agenda." : "They are listed below."}`
        : "No fully timed activities are published yet. Check Schedule for any published timing notes.",
      items: allItems.slice(0, 8), snapshot
    });
  }

  if (matchesAny(normalized, ["summit", "what is", "about", "purpose", "date", "venue", "hotel", "wynn"])) {
    return createAnswer({
      title: snapshot.event.name,
      body: `${snapshot.event.positioning} ${snapshot.event.venueName}. ${snapshot.event.dateLabel}. All schedule times use ${snapshot.event.timeZone}.`,
      items: timeline.upcoming.slice(0, 3), snapshot
    });
  }

  return createAnswer({
    title: "Best current answer",
    body:
      "That detail is not available in the current published event information. Open Schedule or ask the event team for confirmation.",
    items: timeline.upcoming.slice(0, 4),
    snapshot
  });
}

function findDayScheduleMatch(prompt: string, items: ScheduleItem[], timeZone: string) {
  const day = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].find((value) =>
    prompt.includes(value)
  );
  if (!day) return null;

  const period = ["morning", "afternoon", "evening"].find((value) => prompt.includes(value));
  const matches = items.filter((item) => {
    const date = new Date(item.startUtc);
    const weekday = new Intl.DateTimeFormat("en-US", { weekday: "long", timeZone }).format(date).toLowerCase();
    if (weekday !== day) return false;

    if (!period) return true;
    const hourPart = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      hourCycle: "h23",
      timeZone
    }).formatToParts(date).find((part) => part.type === "hour")?.value;
    const hour = Number(hourPart);
    if (!Number.isFinite(hour)) return true;
    if (period === "morning") return hour < 12;
    if (period === "afternoon") return hour >= 12 && hour < 17;
    return hour >= 17;
  });

  const periodLabel = period ? ` ${period}` : "";
  return { label: `${day[0]?.toUpperCase()}${day.slice(1)}${periodLabel}`, items: matches };
}

function findLocationMatch(prompt: string, snapshot: EventSnapshot) {
  if (!matchesAny(prompt, ["where", "room", "location", "stage", "find", "navigate", "directions"])) return null;

  const searchablePrompt = prompt.replace(/[^a-z0-9]+/g, " ");
  const venueGuidePages = snapshot.contentPages
    .filter((page) => page.published && (page.slug.includes("venue") || page.slug.includes("room") || page.title.toLowerCase().includes("venue")))
    .map((page) => page.body);
  const venueGuide = venueGuidePages.join(" ").toLowerCase();
  const location = snapshot.locations.find((candidate) => {
    if (candidate.eventId !== snapshot.event.id) return false;
    const name = candidate.name.toLowerCase();
    const significantNameParts = name.split(/[^a-z0-9]+/).filter((part) => part.length >= 4);
    const directMatch = significantNameParts.some((part) => searchablePrompt.includes(part));
    const mainStageMatch = prompt.includes("main stage") && significantNameParts.some((part) => venueGuide.includes(`${part} is the wisdom forum main stage`));
    return directMatch || mainStageMatch;
  });
  if (!location) return null;

  const locationTerms = location.name.toLowerCase().split(/[^a-z0-9]+/).filter((part) => part.length >= 4);
  const guidance = venueGuidePages
    .flatMap((body) => body.split(/(?<=[.!?])\s+/))
    .find((sentence) => locationTerms.some((part) => sentence.toLowerCase().includes(part)));

  return {
    location,
    guidance: guidance ?? location.description,
    items: snapshot.scheduleItems.filter((item) => item.eventId === snapshot.event.id && item.published && item.visibilityScope.id === "public" && item.locationId === location.id)
  };
}

function createAnswer({
  title,
  body,
  items,
  snapshot
}: {
  title: string;
  body: string;
  items: ScheduleItem[];
  snapshot?: EventSnapshot;
}): AttendeeConciergeAnswer {
  return {
    mode: "temporary-local",
    title,
    body,
    items: snapshot
      ? items.map((item) => ({
          id: item.id,
          title: item.status === "scheduled" ? item.title : `${item.title} (${item.status})`,
          time: toEventTimeRange(item, snapshot.event.timeZone),
          locationName: item.locationName
        }))
      : [],
    warnings: ["Temporary no-key answer. Real OpenAI concierge must run server-side before production use."]
  };
}

function findPersonScheduleMatch(prompt: string, items: ScheduleItem[], snapshot: EventSnapshot) {
  const people = [
    { name: "Mike Tyson", aliases: ["mike tyson", "tyson"] },
    { name: "Steve Wozniak", aliases: ["steve wozniak", "wozniak"] },
    { name: "Jewel", aliases: ["jewel"] },
    { name: "Jada Pinkett Smith", aliases: ["jada", "pinkett"] },
    { name: "Loni Love", aliases: ["loni love", "loni"] },
    { name: "Jason Kennedy", aliases: ["jason kennedy", "jason"] },
    { name: "Rachel Platten", aliases: ["rachel platten", "rachel"] },
    { name: "Darryl McDaniels", aliases: ["darryl", "mcdaniels", "dmc"] },
    { name: "Harry Hudson", aliases: ["harry hudson"] },
    { name: "Kevin Hines", aliases: ["kevin hines"] }
  ];
  const publicPeople = snapshot.event.directoryEnabled ? snapshot.speakers.filter(person => person.published && person.eventId === snapshot.event.id) : [];
  const publishedPerson = publicPeople.find(person => containsName(prompt, [person.name]));
  const person = publishedPerson ? { name: publishedPerson.name, aliases: [publishedPerson.name.toLowerCase()] } : people.find((candidate) => containsName(prompt, candidate.aliases));

  if (!person) {
    return null;
  }

  const linkedPerson = publishedPerson ?? publicPeople.find(candidate => containsName(candidate.name, person.aliases));
  return {
    name: person.name,
    confirmed: Boolean(linkedPerson),
    // A textual mention is not an approved appearance assignment.
    items: linkedPerson ? items.filter(item => item.speakerIds.includes(linkedPerson.id)) : []
  };
}

function containsName(value: string, names: string[]) {
  const normalize = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const words = ` ${normalize(value)} `;
  return names.some(name => {
    const normalized = normalize(name);
    return normalized.length > 0 && words.includes(` ${normalized} `);
  });
}

function findItems(items: ScheduleItem[], terms: string[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (!matchesAny(searchText(item), terms) || seen.has(item.id)) {
      return false;
    }

    seen.add(item.id);
    return true;
  });
}

function searchText(item: ScheduleItem) {
  return `${item.title} ${item.shortTitle} ${item.summary} ${item.description} ${item.locationName} ${item.visibilityScope.label}`.toLowerCase();
}

function matchesAny(value: string, terms: string[]) {
  return containsName(value, terms.flatMap(term => [term, `${term}s`]));
}
