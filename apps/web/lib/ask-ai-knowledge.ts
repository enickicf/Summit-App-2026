import type { EventSnapshot } from "@not-alone/validation";
import { publicLocation } from "./room-privacy";
import source from "./original-sites.json";
import { awards2026Editorial, awards2026Evening } from "./awards-editorial";
import { awardsDoorsOpen2026 } from "./event-partners-2026";
import { directoryPeople } from "./people";
import { awardsDisplayPeople } from "./awards-people";
import { communityDay2026 } from "./community-day-2026";
import { communityDaySchedule2026 } from "./community-day-schedule-2026";
import { personNameKey } from "./person-portraits";
import { isFoundersOnly } from "../app/schedule/schedule-presentation";

// ICF facts come only from ICF's own published site copy preserved in original-sites.json.
const footer = source.summit.footer;
const programCopy = source.summit.sections[2]!.blocks.map(block => block.text);
const summitPurpose = source.summit.sections[1]!.blocks[2]!.text;
const icfOverview = footer[2]!.replace(/\s*Click here to learn more\.$/, "");
const icfTaxStatus = footer[1]!;

const contactAddress = "1801 N Martin L King Blvd #271258, Las Vegas, NV 89127";

type FactAnswer = { pattern: RegExp; answer: () => string };

const icfFacts: FactAnswer[] = [
  { pattern: /\bhow many\b.*\b(kids|children|youth|students|young people)\b|\b(kids|children|youth)\b.*\bserve/, answer: () => sentence(icfOverview, /serves/) },
  { pattern: /\b(scholarships?|colleges?|leadership program)\b/, answer: () => sentence(icfOverview, /scholarships/) },
  { pattern: /\b(22 cities|other cities|duplicated|replicated)\b/, answer: () => sentence(icfOverview, /22 cities/) },
  { pattern: /\b(10|ten) pillars\b|\bpillars\b/, answer: () => programCopy[1]! },
  { pattern: /\b(hours|operate|days? a year|365)\b.*\b(icf|foundation|program)\b|\b(icf|foundation|program)\b.*\b(hours|operate|365)\b/, answer: () => sentence(programCopy[2]!, /8 a\.m\./) },
  { pattern: /\b(ein|501\s*\(?c\)?\s*\(?3\)?|tax[- ]?(exempt|deductible)|non-?profit status)\b/, answer: () => icfTaxStatus },
  { pattern: /\bnot alone program\b|\bwho (produces|runs|puts on|organizes)\b/, answer: () => programCopy[0]! },
  { pattern: /\b(what|who) (is|are)\b.*\b(icf|inspiring children)\b|\babout (icf|inspiring children)\b|\binspiring children foundation\b\??$/, answer: () => `${icfOverview} ${programCopy[0]}` },
  { pattern: /\b(donate|donation|donating)\b|\bhow (can|do) i (give|support)\b/, answer: () => "You can support the Inspiring Children Foundation through its official donation page: https://www.inspiringchildren.org/donate" },
  { pattern: /\b(contact|email|reach) (icf|you|the foundation|inspiring children|the team)\b|\bmailing address\b|\bsend (you |icf )?mail\b/, answer: () => `Visit the Contact page for ICF's contact menu. To send mail: ${contactAddress}.` }
];

function sentence(text: string, marker: RegExp) {
  return text.split(/(?<=\.)\s+/).find(part => marker.test(part)) ?? text;
}

/** Free answer for the approved 2026 Awards host and venue (owner-approved editorial facts). */
export function awardsFactAnswer(question: string): string | null {
  const normalized = question.toLowerCase();
  if (!/\bawards?\b/.test(normalized)) return null;
  const { host, venue, date } = awards2026Editorial;
  if (/\bhost(s|ed|ing)?\b|\bemcee|\bmc\b/.test(normalized)) return `The 2026 Not Alone Awards are hosted by ${host}, at the ${venue} on ${date}.`;
  if (/\bwhere\b|\bvenue\b|\blocation\b|\bheld\b/.test(normalized)) return `The 2026 Not Alone Awards take place at the ${venue} on ${date}.`;
  // Owner (Oct 7 meeting): the public evening is Doors Open 6:30 PM and the Awards Show 7:30–10:00 PM; no Pre-Show is
  // announced. Answered here, before the published program, because the staff app's revision 9 still carries the
  // old times until a new revision is published.
  if (/\b(when|what time|time|times|doors?|starts?|starting|begins?|ends?|how long|how late|o'?clock)\b/.test(normalized)) return `The 2026 Not Alone Awards Show is on ${date} at the ${venue}. Doors open ${awardsDoorsOpen2026}; the Awards Show runs ${awardsShowTime2026}.`;
  return null;
}

const awardsShowTime2026 = awards2026Evening.find(entry => entry.label === "Awards Show")!.time;

export function communityDayAnswer(question: string): string | null {
  if (!/\b(?:community day|nevada mental health day)\b/i.test(question)) return null;
  if (/\b(what happens|schedule|agenda|times?|when|starts?|doors?|activities|sessions?)\b/i.test(question)) {
    return `Nevada Mental Health Day is ${communityDay2026.date}. Public schedule: ${communityDaySchedule2026().map(item => `${item.time} ${item.title}${item.room ? ` at ${item.room}` : ""}`).join("; ")}. See the Community Day page for updates.`;
  }
  return `${communityDay2026.about} See the Community Day page for the public schedule and ticket information.`;
}
// Owner (Oct 7 meeting): no Pre-Show is announced publicly, so the legacy "Pre-Show: 7:30 PM; end time to be
// confirmed." pending note never reaches the model (it is still canonical published text elsewhere).
// Owner (Oct 7): the Red Carpet is never on the website either, so Ask AI does not quote it.
const withoutPreShow = (body: string) => body.split(/\r?\n/).filter(line => !/^(Pre-Show|Red Carpet):/i.test(line.trim())).join("\n").replace(/\n{3,}/g, "\n\n").trim();

/** Free answers quoted from ICF's own copy, so common foundation questions never reach the model. */
export function icfFactAnswer(question: string): string | null {
  const normalized = question.toLowerCase();
  return icfFacts.find(fact => fact.pattern.test(normalized))?.answer() ?? null;
}

const topicWords = /\b(summit|not alone|awards?|icf|inspiring|children|child|kids|youth|students?|foundation|nonprofit|non-profit|charity|mission|pillars?|program|programs|challenge|event|events|schedule|agenda|session|sessions|speakers?|guests?|talent|founders?|co-?chairs?|hosts?|producers?|partners?|sponsors?|venue|wynn|encore|las vegas|vegas|rsvp|tickets?|register|registration|attend|attending|attendance|donate|donation|mental health|emotional health|wellness|jewel|wozniak|loni|panel|panels|dinner|lunch|breakfast|reception|red carpet|tennis|pickleball|high tea|poker|bike|ride|dress code|parking|hotel|stream|iheart|livestream|contact|scholarships?|leadership program|updates?|announcements?|news|appear(ing|ance|s)?|perform(ing|ance|er|ers|s)?|allowed|bring|wear|attire)\b/i;

/** Local, zero-cost relevance gate: only on-topic questions may spend model tokens. */
export function isRelevantQuestion(question: string, snapshot: EventSnapshot): boolean {
  if (/\bbryan brothers\b/i.test(question)) return true;
  if (topicWords.test(question)) return true;
  const key = ` ${personNameKey(question)} `;
  if (directoryPeople(snapshot).some(person => key.includes(` ${personNameKey(person.name)} `))) return true;
  return snapshot.scheduleItems.some(item => item.published && item.visibilityScope.id === "public"
    && item.title.length > 3 && key.includes(` ${personNameKey(item.title)} `));
}

export const offTopicAnswer = "This AI only answers questions about the Not Alone Summit, the Not Alone Awards, Community Day, the Not Alone Challenge, or the Inspiring Children Foundation.";

export const notAloneToolsUrl = "https://www.inspiringchildren.org/notalonetools";

// Personal mental-health and crisis questions never reach the model and never receive tips.
const mentalHealthHelp = /\b(suicid\w*|kill (myself|me)|end my life|want to die|self[- ]?harm\w*|hurt(ing)? myself|depress\w*|anxiety|anxious|panic attacks?|mental health (tips?|advice|help|support)|therap(y|ist)|coping|cope|grie(f|ving)|eating disorders?|addiction|overdose|insomnia|can'?t sleep|lonely|loneliness|hopeless|overwhelmed)\b|\bi(?: am|'m)? (feel(?:ing)? )?(so |really |very )?(sad|down|alone|stressed|scared|worthless|empty)\b|\bhow (do|can|should) i (deal|cope|calm|stop feeling|feel better|get over|handle)\b/i;

export function isMentalHealthQuestion(question: string) {
  if (/\b(?:icf|inspiring children|not alone|foundation|program)\b/i.test(question)
    && /\b(?:what|which|how)\b/i.test(question)
    && !/\b(?:i|me|my|myself)\b/i.test(question)) return false;
  return mentalHealthHelp.test(question);
}

export const mentalHealthAnswer = `I can't give mental health advice here, but you're not alone. The Not Alone Mental Fitness Tools, created by youth and reviewed by experts, are free at ${notAloneToolsUrl}. If this is an emergency, call 911. For crisis support, call or text 988 (Suicide & Crisis Lifeline).`;

/** Compact, public-only knowledge pack for the model. Drafts, staff data and private contacts never enter it. */
export function buildAskAiKnowledge(snapshot: EventSnapshot, question = "") {
  const publicItems = snapshot.scheduleItems.filter(item => item.published && item.visibilityScope.id === "public" && item.eventId === snapshot.event.id);
  const normalized = ` ${personNameKey(question)} `;
  const matchingProfiles = awardsDisplayPeople(snapshot).filter(person => normalized.includes(` ${personNameKey(person.name)} `)).slice(0, 2);
  return {
    summit: {
      name: snapshot.event.name,
      dates: snapshot.event.dateLabel,
      venue: `${snapshot.event.venueName}, ${snapshot.event.city}`,
      timeZone: snapshot.event.timeZone,
      purpose: summitPurpose,
      poweredBy: "Steven & Alexandra Cohen Foundation"
    },
    awards2026: {
      date: awards2026Editorial.date,
      venue: awards2026Editorial.venue,
      host: awards2026Editorial.host,
      poweredBy: awards2026Editorial.foundation,
      presentedBy: "Inspiring Children Foundation × NAMI",
      // Owner (Oct 7 meeting): the public evening; no Pre-Show is announced.
      doorsOpen: awardsDoorsOpen2026,
      awardsShow: awardsShowTime2026,
      evening: awards2026Evening.map(entry => `${entry.label} ${entry.time}`).join(" · "),
      rsvp: awards2026Editorial.rsvpUrl
    },
    communityDay2026: {
      title: communityDay2026.title,
      date: communityDay2026.date,
      about: communityDay2026.about,
      publicSchedule: communityDaySchedule2026().map(item => ({ title: item.title, time: item.time, room: item.room, synopsis: item.synopsis }))
    },
    inspiringChildrenFoundation: { overview: icfOverview, taxStatus: icfTaxStatus, program: programCopy, donate: "https://www.inspiringchildren.org/donate", mailingAddress: contactAddress },
    schedule: publicItems.map(item => ({
      title: item.title,
      status: item.status,
      startUtc: item.startUtc,
      endUtc: item.endUtc,
      location: publicLocation(item.locationName),
      publicSummary: item.summary,
      foundersOnly: isFoundersOnly(item)
    })),
    pendingNotes: snapshot.contentPages.filter(page => page.published && page.slug.startsWith("schedule-pending")).map(page => withoutPreShow(page.body)),
    guests: directoryPeople(snapshot).map(person => ({ name: person.name, role: person.role })),
    matchingPublishedProfiles: matchingProfiles.map(person => ({ name: person.name, role: person.role, bio: person.bio.slice(0, 1200), profile: `https://notalonesummit.org/directory/${encodeURIComponent(person.slug)}` })),
    partners: snapshot.sponsors.filter(sponsor => sponsor.published).map(sponsor => ({ name: sponsor.name, tier: sponsor.tier, website: sponsor.websiteUrl })),
    faqs: snapshot.faqs.filter(faq => faq.published).map(faq => ({ question: faq.question, answer: faq.answer }))
  };
}
