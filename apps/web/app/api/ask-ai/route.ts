import { NextResponse } from "next/server";
import { titleOneLine } from "../../../lib/title-overrides-2026";
import { directoryPeople } from "../../../lib/people";
import { awardsDisplayPeople } from "../../../lib/awards-people";
import { personNameKey } from "../../../lib/person-portraits";
import { getSiteSnapshot } from "../../../lib/snapshot";
import { publishedProgramAnswer } from "../../../lib/published-program-answer";
import { awardsFactAnswer, buildAskAiKnowledge, communityDayAnswer, icfFactAnswer, isMentalHealthQuestion, isRelevantQuestion, mentalHealthAnswer, offTopicAnswer } from "../../../lib/ask-ai-knowledge";
import { allowModelCall, cachedAnswer, createAskAiModelAnswer, isAskAiModelEnabled, rememberAnswer } from "../../../lib/ask-ai-model";
import { QuestionRequestError, readQuestion } from "./request";

function respond(answer: string, status = 200, sources: Array<{ title: string; url: string }> = []) {
  return NextResponse.json({ answer, ...(sources.length ? { sources } : {}) }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  let question: string;
  try {
    question = (await readQuestion(request)).toLowerCase();
  } catch (error) {
    return error instanceof QuestionRequestError
      ? respond(error.message, error.status)
      : respond("Please send a valid question.", 400);
  }
  if (isMentalHealthQuestion(question)) return respond(mentalHealthAnswer);
  if (/\b(?:airtable|raw records?|data entries|rsvp entries|submissions?|staff notes?|private contacts?|export|guest emails?|guest phone numbers?)\b/i.test(question)) {
    return respond("I can share only approved public information. For private records or staff details, please contact the event team through its authorized channels.");
  }
  if (/\b(message|messaging|connect)\b/.test(question)) {
    return respond("Attendee-to-attendee messaging is not available. Use the Contact page to reach the event team.");
  }
  try {
    const snapshot = await getSiteSnapshot();
    if (!snapshot) return respond("Published event information is temporarily unavailable. Please try again or use the Contact page to reach the event team.", 503);
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
    const awardsAnswer = awardsFactAnswer(question);
    if (awardsAnswer) return respond(awardsAnswer, 200, [{ title: "Not Alone Awards 2026", url: "https://notaloneawards.org/awards/2026" }]);
    const dayAnswer = communityDayAnswer(question);
    if (dayAnswer) return respond(dayAnswer, 200, [{ title: "Nevada Mental Health Day", url: "https://notaloneawards.org/community-day" }]);
    const programAnswer = publishedProgramAnswer(question, snapshot, new Date().toISOString());
    if (programAnswer) return respond(programAnswer, 200, [{ title: "Published Summit schedule", url: "https://notalonesummit.org/schedule" }]);
    if ((/\b(dates?|when)\b/.test(question) && /\b(summit|event)\b/.test(question)) || /^(?:what (?:is|are) (?:the )?)?dates?\??$/.test(question)) {
      return respond(`${snapshot.event.name}: ${snapshot.event.dateLabel}.`);
    }
    if (/\b(venue|map)\b/.test(question) || /\bwhere\b.*\b(summit|event)\b/.test(question)) {
      return respond(`${snapshot.event.name}: ${snapshot.event.venueName}, ${snapshot.event.city}. Check the published venue guide for confirmed room details.`);
    }
    // Free answers first; only relevant questions that no local rule answers may reach the model.
    const factAnswer = icfFactAnswer(question);
    if (factAnswer) return respond(factAnswer, 200, [{ title: "Inspiring Children Foundation", url: "https://www.inspiringchildren.org/na-program" }]);
    // Zero-cost gate: unrelated questions are answered locally and never reach the API.
    if (!isRelevantQuestion(question, snapshot)) return respond(offTopicAnswer);
    if (isAskAiModelEnabled()) {
      const cacheKey = `${snapshot.event.id}:${snapshot.revision ?? ""}:${question.replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim()}`;
      const cached = cachedAnswer(cacheKey);
      if (cached) return respond(cached.answer, 200, cached.sources);
      const client = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "anonymous";
      if (!allowModelCall(client)) return respond("You've asked several questions in a short time. Please wait a few minutes, or use the Schedule and Contact pages.", 429);
      try {
        const result = await createAskAiModelAnswer(question, buildAskAiKnowledge(snapshot, question));
        const answer = result.relevant && result.answer ? result.answer : offTopicAnswer;
        const sources = result.relevant ? result.sources : [];
        rememberAnswer(cacheKey, { answer, sources });
        return respond(answer, 200, sources);
      } catch {
        // Provider trouble falls through to the deterministic answer below.
      }
    }
    return respond("I don't have a confirmed answer to that question. Check the published schedule or directory, or use the Contact page to ask the event team for confirmation.");
  } catch {
    return respond("Published event information is temporarily unavailable. Please try again or use the Contact page to reach the event team.", 503);
  }
}
