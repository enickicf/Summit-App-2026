import type { EventSnapshot } from "@not-alone/validation";
import { awards2026Editorial, awards2026Program } from "./awards-editorial";
import { awardsDoorsOpen2026 } from "./event-partners-2026";
import { communityDay2026 } from "./community-day-2026";

type Source = { title: string; url: string };
type Answer = { answer: string; sources: Source[] };
type CommonQuestion = { question: string; match: RegExp; answer: (snapshot: EventSnapshot) => Answer };

const awards = { title: "Not Alone Awards", url: "https://notaloneawards.org/awards/2026" };
const awardsRsvp = { title: "Awards Show RSVP", url: awards2026Editorial.rsvpUrl };
const communityRsvp = { title: "Nevada Mental Health Day RSVP", url: communityDay2026.rsvpUrl };
const summit = { title: "Not Alone Summit", url: "https://notalonesummit.org/" };
const schedule = { title: "Published Summit schedule", url: "https://notalonesummit.org/schedule" };
const contact = { title: "Contact the event team", url: "https://notalonesummit.org/contact" };
const result = (answer: string, ...sources: Source[]): Answer => ({ answer, sources });

export const ticketConfirmationMessage = "Submitting an RSVP is a request, not a confirmed ticket. If your tickets are confirmed, the event team will contact you by email and/or text with your confirmation and ticketing information. Please provide contact details you check regularly. Ask AI cannot check an individual request's status.";

/** Public process answer only; never checks a submission or reveals an RSVP record. */
export function ticketProcessAnswer(question: string, audience: "summit" | "awards" = "summit"): Answer | null {
  const ticket = /\b(?:rsvp|tickets?|seats?|admission|request|waiting list)\b/i.test(question);
  const process = /\b(?:confirm\w*|approv\w*|guarantee\w*|receive|arrive|email|text|notify|notification|hear back|status|waiting list)\b/i.test(question);
  if (!ticket || !process) return null;
  const source = /\b(?:community day|nevada mental health day)\b/i.test(question) ? communityRsvp
    : /\bawards?\b/i.test(question) || audience === "awards" ? awardsRsvp : contact;
  return result(ticketConfirmationMessage, source);
}

export const awardsSummitPrivacyAnswer = "The Not Alone Summit is a private, invitation-only event, and I don't have further Summit details to share on the Awards site. I can answer questions about the published Nevada Mental Health Day and Not Alone Awards information here. For Summit inquiries, please use the Summit website or contact the event team.";

/** The Awards site shares high-level Summit context but directs detailed Summit inquiries to its own site. */
export function isDetailedSummitQuestion(question: string): boolean {
  if (!/\b(?:not alone )?summit\b/i.test(question) || /\b(?:awards?|nevada mental health day|community day)\b/i.test(question)) return false;
  return /\b(?:schedule|agenda|sessions?|speakers?|speaking|performing|appearing|guests?|attendees?|lineup|programming|rooms?|detailed?|details?|vip|rsvp|register|registration|tickets?|access|dress code|attire|meals?|breakfast|lunch|dinner|transport|parking|accommodations?|activities|panels?|workshops?|itinerary|invite|invitation|producers?|founders?|co-?chairs?|biograph\w*|bio|accomplishments?)\b|\bwho (?:is|will be|can|gets) (?:at|attending|speaking|invited)\b|\bhow (?:do|can) i attend\b/i.test(question);
}

/** Twenty common visitor questions, answered from owner-approved public facts. */
export const commonQuestions2026: readonly CommonQuestion[] = [
  { question: "What is the Not Alone Awards Show?", match: /\bwhat (?:is|are) (?:the )?(?:not alone )?awards(?: show)?\b/i,
    answer: () => result("The Not Alone Awards honor pioneers, advocates, and people advancing mental health and human well-being. See the Awards page for the announced program and lineup.", awards) },
  { question: "When is the Awards Show?", match: /\b(?:when|what date|which day)\b.*\bawards?(?: show)?\b/i,
    answer: () => result(`The 2026 Not Alone Awards Show is ${awards2026Editorial.date}.`, awards) },
  { question: "Where is the Awards Show?", match: /\b(?:where|venue|location)\b.*\bawards?(?: show)?\b/i,
    answer: () => result(`The Awards Show is at the ${awards2026Editorial.venue}.`, awards) },
  { question: "Who hosts the Awards Show?", match: /\bwho\b.*\b(?:hosts?|hosting|emcee)\b.*\bawards?\b/i,
    answer: () => result(`${awards2026Editorial.host} hosts the 2026 Not Alone Awards Show.`, awards) },
  { question: "What time do Awards doors open?", match: /\b(?:what time|when)\b.*\bawards?\b.*\b(?:doors?|show)\b|\b(?:what time|when)\b.*\b(?:doors?|show)\b.*\bawards?\b/i,
    answer: () => result(`Awards doors open at ${awardsDoorsOpen2026}; the show runs 7:30–10:00 PM on ${awards2026Editorial.date}.`, awards) },
  { question: "How do I request Awards tickets?", match: /\b(?:how|where)\b.*\b(?:rsvp|request|tickets?)\b.*\bawards?\b/i,
    answer: () => result(`Use the Awards Show RSVP form: ${awards2026Editorial.rsvpUrl}. A request joins the waiting list and is not a confirmed ticket.`, awardsRsvp) },
  { question: "Does an RSVP guarantee an Awards ticket?", match: /\b(?:does|will|is)\b.*\b(?:rsvp|request)\b.*\b(?:guarantee|confirmed|ticket)\b/i,
    answer: () => result(ticketConfirmationMessage, awardsRsvp) },
  { question: "How will I know if my tickets are confirmed?", match: /\b(?:how|when)\b.*\b(?:tickets?|confirmation)\b.*\b(?:confirm\w*|email|text|receive|arrive)\b/i,
    answer: () => result(ticketConfirmationMessage, awardsRsvp) },
  { question: "Does Nevada Mental Health Day admission include the Awards Show?", match: /\b(?:nevada mental health day|community day)\b.*\b(?:include|cover|same|awards? ticket)\b.*\bawards?\b/i,
    answer: () => result(`No. The Nevada Mental Health Day RSVP does not include an Awards Show ticket. Request Day admission at ${communityDay2026.rsvpUrl}; request the Awards Show separately at ${awards2026Editorial.rsvpUrl}.`, communityRsvp, awardsRsvp) },
  { question: "Who are the 2026 Awards honorees?", match: /\b(?:who|which)\b.*\b(?:honorees?|winners?|award recipients?)\b/i,
    answer: () => result("Only announced honorees should be treated as confirmed. Check the Awards page for the latest public announcements; Ask AI will not guess an award or recipient.", awards) },
  { question: "What is the Not Alone Summit?", match: /^what (?:is|are) (?:the )?(?:not alone )?summit(?: about)?\??$/i,
    answer: () => result("The Not Alone Summit brings together leaders in mental health, science, lived experience, philanthropy, and the arts for dialogue and collaboration. It is part of the Inspiring Children Foundation's Not Alone Program.", summit) },
  { question: "When is the Summit?", match: /^(?:when is|what (?:are the )?dates? (?:for|of)|which days? is) (?:the )?(?:not alone )?summit\??$/i,
    answer: snapshot => result(`${snapshot.event.name}: ${snapshot.event.dateLabel}.`, summit) },
  { question: "Where is the Summit?", match: /^(?:where is|what is the (?:venue|location) (?:for|of)) (?:the )?(?:not alone )?summit\??$/i,
    answer: snapshot => result(`${snapshot.event.name} is at ${snapshot.event.venueName}, ${snapshot.event.city}.`, summit) },
  { question: "Is the Summit private?", match: /\b(?:is|private|invitation|invite[- ]only)\b.*\bsummit\b.*\b(?:private|invitation|invite|public)\b|\bis the summit private\b/i,
    answer: () => result("Yes. The Not Alone Summit is a private, invitation-only event. Public information is on the Summit website; contact the event team about an invitation.", summit, contact) },
  { question: "How can I attend the Summit?", match: /\b(?:how (?:can|do) i attend|how (?:can|do) i get (?:an? )?invitation|register for)\b.*\bsummit\b/i,
    answer: () => result("The Summit is invitation-only. Please use the Summit Contact page to inquire about attendance; an inquiry is not a ticket confirmation.", contact) },
  { question: "Where can I find the Summit schedule?", match: /\b(?:where|how)\b.*\b(?:find|see|view|check)\b.*\bsummit schedule\b|\bwhere is the summit schedule\b/i,
    answer: () => result("See the published Summit schedule for announced sessions and updates. Private or unconfirmed details are not shown there.", schedule) },
  { question: "Where can I see who is coming to the Summit?", match: /\b(?:where|how)\b.*\b(?:see|find|view)\b.*\b(?:who(?:'s| is) coming|summit lineup|summit guests?)\b/i,
    answer: () => result("The current public lineup is on the Summit website. A guest listing does not by itself confirm a speaking slot, performance, or award.", summit) },
  { question: "Does a listed Summit guest have a speaking slot?", match: /\b(?:does|do|is|are)\b.*\b(?:listed|lineup|guest|attendee)\b.*\b(?:speak\w*|perform\w*|appear\w*|award)\b/i,
    answer: () => result("No. Being listed as a guest does not confirm a speaking slot, performance, or award. Check the published schedule for an announced appearance.", schedule) },
  { question: "Can I pitch or solicit at the Summit?", match: /\b(?:pitch|solicit|network|sell)\b.*\bsummit\b|\bsummit\b.*\b(?:pitch|solicit|network|sell)\b/i,
    answer: () => result(awards2026Program.noSolicitation.body, summit) },
  { question: "How does the Summit relate to Inspiring Children and the Awards?", match: /\b(?:how|what)\b.*\bsummit\b.*\b(?:inspiring children|icf|awards|not alone program)\b/i,
    answer: () => result(awards2026Program.programStatement, summit) }
];

export function commonQuestionAnswer(question: string, snapshot: EventSnapshot): Answer | null {
  const match = commonQuestions2026.find(entry => entry.match.test(question));
  return match?.answer(snapshot) ?? null;
}
