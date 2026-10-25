import { NextResponse } from "next/server";
import { titleOneLine } from "../../../lib/title-overrides-2026";
import { directoryPeople } from "../../../lib/people";
import { awardsDisplayPeople } from "../../../lib/awards-people";
import { personNameKey } from "../../../lib/person-portraits";
import { getSiteSnapshot } from "../../../lib/snapshot";
import { publishedProgramAnswer } from "../../../lib/published-program-answer";
import { awardsFactAnswer, buildAskAiKnowledge, communityDayAnswer, icfFactAnswer, icfYouthContributionAnswer, isMentalHealthQuestion, isRelevantQuestion, mentalHealthAnswer, offTopicAnswer } from "../../../lib/ask-ai-knowledge";
import { commonQuestionAnswer, ticketProcessAnswer } from "../../../lib/ask-ai-common-questions";
import { allowModelCall, askAiModelName, cachedAnswer, createAskAiModelAnswer, isAskAiModelEnabled, rememberAnswer } from "../../../lib/ask-ai-model";
import { crisisResourcesFromFaq, getAskAiFaq } from "../../../lib/ask-ai-faq";
import { writeAskAiLog } from "../../../lib/ask-ai-log";
import { QuestionRequestError, readQuestion } from "./request";

function jsonResponse(answer: string, status = 200, sources: Array<{ title: string; url: string }> = []) {
  return NextResponse.json({ answer, ...(sources.length ? { sources } : {}) }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  let submittedQuestion: string;
  try {
    submittedQuestion = await readQuestion(request);
  } catch (error) {
    return error instanceof QuestionRequestError
      ? jsonResponse(error.message, error.status)
      : jsonResponse("Please send a valid question.", 400);
  }
  const started = Date.now();
  const question = submittedQuestion.toLowerCase();
  const faq = await getAskAiFaq();
  let responseModel = "deterministic";
  async function respond(answer: string, status = 200, sources: Array<{ title: string; url: string }> = []) {
    await writeAskAiLog({ ts: new Date().toISOString(), question: submittedQuestion, answer, sources, latencyMs: Date.now() - started, model: responseModel, faqRevision: faq?.revision ?? null });
    return jsonResponse(answer, status, sources);
  }
  if (isMentalHealthQuestion(question)) return respond(faq ? crisisResourcesFromFaq(faq.text) || mentalHealthAnswer : mentalHealthAnswer,
    200, faq ? [{ title: "Summit FAQ", url: "https://notalonesummit.org/schedule" }] : []);
  const browserSite = request.headers.get("x-ask-ai-site");
  const browserOrigin = request.headers.get("origin") || request.headers.get("referer") || "";
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim().replace(/^www\./, "");
  const hostHeader = request.headers.get("host")?.split(":")[0]?.replace(/^www\./, "");
  const audience = browserSite === "awards"
    || forwardedHost === "notaloneawards.org"
    || hostHeader === "notaloneawards.org"
    || /^(?:https?:\/\/)?(?:www\.)?notaloneawards\.org(?::\d+)?(?:\/|$)/i.test(browserOrigin)
    || new URL(request.url).hostname.replace(/^www\./, "") === "notaloneawards.org" ? "awards" : "summit";
  const ticketAnswer = ticketProcessAnswer(question, audience);
  if (ticketAnswer) return respond(ticketAnswer.answer, 200, ticketAnswer.sources);
  if (/\b(?:airtable|raw records?|data entries|rsvp entries|submissions?|staff notes?|private contacts?|export|guest emails?|guest phone numbers?)\b/i.test(question)) {
    return respond("I can share only approved public information. For private records or staff details, please contact the event team through its authorized channels.");
  }
  if (/\b(message|messaging|chat|connect)\b/.test(question)
    && /\b(attendees?|guests?|someone|somebody|other people|participants?|each other|another person)\b/.test(question)) {
    return respond("Attendee-to-attendee messaging is not available. Use the Contact page to reach the event team.");
  }
  if (/\b(?:room number|room\b.*\b(?:staying|stay|hotel)|where (?:is|does|will).*(?:staying|sleep)|(?:phone|email|contact)\b.*\b(?:speaker|guest|attendee|person)|(?:speaker|guest|attendee|person)\b.*\b(?:phone|email|contact)|talent fees?|speaker fees?|staff war room|private contacts?|who (?:is|will be) attending|founders dinner)\b/i.test(question)) {
    return respond("That information is not covered by the public event sources. Please contact concierge@inspiringchildren.org or (702) 421-6351 by phone, text, or WhatsApp.");
  }
  try {
    const snapshot = await getSiteSnapshot();
    if (!snapshot) return respond("Published event information is temporarily unavailable. Please try again or use the Contact page to reach the event team.", 503);
    const faqIntent = /\b(?:park|parking|hotel|room block|airport|arriv|depart|pack|bring|badge|registration desk|concierge|weather|accessibility|dietary|allerg|solicitation|photograph|filming|updates?)\b/i.test(question);
    const searchableQuestion = ` ${personNameKey(question)} `;
    const publicPeople = awardsDisplayPeople(snapshot);
    const person = (/\bbryan brothers\b/.test(question) ? publicPeople.find(candidate => candidate.slug === "2026-bob-mike-bryan") : undefined)
      ?? [...publicPeople, ...directoryPeople(snapshot)].find(({ name }) => searchableQuestion.includes(` ${personNameKey(name)} `));
    if (person) {
      const hasPublishedAppearance = snapshot.scheduleItems.some(item => item.eventId === snapshot.event.id
        && item.published && item.visibilityScope.id === "public" && item.speakerIds.includes(person.slug));
      if (hasPublishedAppearance) {
        const programAnswer = publishedProgramAnswer(question, snapshot, new Date().toISOString(), { personSchedule: true });
        if (programAnswer) return respond(programAnswer, 200, [{ title: "Published Summit schedule", url: "https://notalonesummit.org/schedule" }]);
      }
      if (/\b(when|where|what time|appearing|performing|speaking)\b/.test(question)) {
        return respond("I don't have a confirmed public appearance for that person. Attendance does not confirm a speaking slot or award. Check the published schedule or ask the event team for confirmation.");
      }
      if (/\b(who is|who are|tell me about|biograph|bio|accomplishment|career|achievements?)\b/.test(question) && person.bio.trim()) {
        const briefBio = person.bio.trim().slice(0, 1000);
        return respond(`${person.name}: ${briefBio}${person.bio.length > 1000 ? "…" : ""}`, 200,
          [{ title: `${person.name} public biography`, url: `https://notalonesummit.org/directory/${encodeURIComponent(person.slug)}` }]);
      }
      return respond(`${person.name} is listed for 2026 as ${titleOneLine(person.role)}. Attendance does not confirm a speaking slot or award. Check the published schedule for appearance details.`);
    }
    if (/\b(?:where|how)\b.*\b(?:find|see|view|check)\b.*\bsummit schedule\b|\bwhere is the summit schedule\b/i.test(question)) {
      const answer = commonQuestionAnswer(question, snapshot);
      if (answer) return respond(answer.answer, 200, answer.sources);
    }
    if (/\bsummit\b/.test(question) && (/\b(?:tickets?|rsvp|register|registration|invite|invitation)\b/.test(question)
      || /\b(?:how|where)\b.*\battend\b/.test(question))) {
      return respond("The Not Alone Summit is private and invitation-only. Please contact concierge@inspiringchildren.org or (702) 421-6351 by phone, text, or WhatsApp about attendance.", 200,
        [{ title: "Not Alone Summit", url: "https://notalonesummit.org/" }]);
    }
    const dayAndAwardsQuestion = /\b(?:community day|nevada mental health day)\b/.test(question) && /\bawards?\b/.test(question);
    const sharedTicketAnswer = dayAndAwardsQuestion ? commonQuestionAnswer(question, snapshot) : null;
    if (sharedTicketAnswer) return respond(sharedTicketAnswer.answer, 200, sharedTicketAnswer.sources);
    const dayAnswer = communityDayAnswer(question);
    if (dayAnswer) return respond(dayAnswer, 200, [{ title: "Nevada Mental Health Day", url: "https://notaloneawards.org/community-day" }]);
    if (!faqIntent && ((/\b(dates?|when)\b/.test(question) && /\b(summit|event)\b/.test(question)) || /^(?:what (?:is|are) (?:the )?)?dates?\??$/.test(question))) {
      return respond(`${snapshot.event.name}: ${snapshot.event.dateLabel}.`);
    }
    if (/\b(venue|map)\b/.test(question) || /^(?:where is|what is the (?:location|venue) (?:for|of)) (?:the )?(?:not alone )?(?:summit|event)\??$/.test(question)) {
      return respond(`${snapshot.event.name}: ${snapshot.event.venueName}, ${snapshot.event.city}. Check the published venue guide for confirmed room details.`);
    }
    if (/\b(?:hosts?|hosting|emcee|where|venue|location|held)\b.*\bawards?\b|\bawards?\b.*\b(?:hosts?|hosting|emcee|where|venue|location|held)\b/.test(question)) {
      const answer = awardsFactAnswer(question);
      if (answer) return respond(answer, 200, [{ title: "Not Alone Awards 2026", url: "https://notaloneawards.org/awards/2026" }]);
    }
    const programAnswer = faqIntent ? null : publishedProgramAnswer(question, snapshot, new Date().toISOString());
    if (programAnswer) return respond(programAnswer, 200, [{ title: "Published Summit schedule", url: "https://notalonesummit.org/schedule" }]);
    const awardsAnswer = awardsFactAnswer(question);
    if (awardsAnswer) return respond(awardsAnswer, 200, [{ title: "Not Alone Awards 2026", url: "https://notaloneawards.org/awards/2026" }]);
    const commonAnswer = commonQuestionAnswer(question, snapshot);
    if (commonAnswer) return respond(commonAnswer.answer, 200, commonAnswer.sources);
    // Free answers first; only relevant questions that no local rule answers may reach the model.
    const youthAnswer = icfYouthContributionAnswer(question);
    if (youthAnswer) return respond(youthAnswer, 200, [{ title: "ICF Mental Fitness Tools", url: "https://www.inspiringchildren.org/tools" }]);
    const factAnswer = icfFactAnswer(question);
    if (factAnswer) return respond(factAnswer, 200, [{ title: "Inspiring Children Foundation", url: "https://www.inspiringchildren.org/na-program" }]);
    // Zero-cost gate: unrelated questions are answered locally and never reach the API.
    if (!isRelevantQuestion(question, snapshot)) return respond(offTopicAnswer);
    if (isAskAiModelEnabled()) {
      const cacheKey = `${audience}:${snapshot.event.id}:${snapshot.revision ?? ""}:${question.replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim()}`;
      const cached = cachedAnswer(cacheKey);
      if (cached) { responseModel = askAiModelName(); return respond(cached.answer, 200, cached.sources); }
      const client = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "anonymous";
      if (!allowModelCall(client)) return respond("You've asked several questions in a short time. Please wait a few minutes, or use the Schedule and Contact pages.", 429);
      try {
        responseModel = askAiModelName();
        const result = await createAskAiModelAnswer(question, buildAskAiKnowledge(snapshot, question, audience, faq?.text ?? null), fetch, audience);
        const answer = result.relevant && result.answer ? result.answer : offTopicAnswer;
        const faqSource = { title: "Summit FAQ", url: "https://notalonesummit.org/schedule" };
        const sources = result.relevant ? [...result.sources, ...(faq && faqIntent && !result.sources.some(source => source.title === faqSource.title) ? [faqSource] : [])].slice(0, 3) : [];
        rememberAnswer(cacheKey, { answer, sources });
        return respond(answer, 200, sources);
      } catch {
        // Provider trouble falls through to the deterministic answer below.
        responseModel = "deterministic";
      }
    }
    return respond("I don't have a confirmed answer to that question. Check the published schedule or directory, or use the Contact page to ask the event team for confirmation.");
  } catch {
    return respond("Published event information is temporarily unavailable. Please try again or use the Contact page to reach the event team.", 503);
  }
}
