import { NextResponse } from "next/server";
import { directoryPeople } from "../../../lib/people";
import { personNameKey } from "../../../lib/person-portraits";
import { getSiteSnapshot } from "../../../lib/snapshot";
import { publishedProgramAnswer } from "../../../lib/published-program-answer";
import { awardsFactAnswer, buildAskAiKnowledge, icfFactAnswer, isMentalHealthQuestion, isRelevantQuestion, mentalHealthAnswer, offTopicAnswer } from "../../../lib/ask-ai-knowledge";
import { allowModelCall, cachedAnswer, createAskAiModelAnswer, isAskAiModelEnabled, rememberAnswer } from "../../../lib/ask-ai-model";
import { QuestionRequestError, readQuestion } from "./request";

function respond(answer: string, status = 200) {
  return NextResponse.json({ answer }, { status, headers: { "Cache-Control": "no-store" } });
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
  if (/\b(message|messaging|connect)\b/.test(question)) {
    return respond("Attendee-to-attendee messaging is not available. Use the Contact page to reach the event team.");
  }
  try {
    const snapshot = await getSiteSnapshot();
    if (!snapshot) return respond("Published event information is temporarily unavailable. Please try again or use the Contact page to reach the event team.", 503);
    const searchableQuestion = ` ${personNameKey(question)} `;
    const person = directoryPeople(snapshot).find(({ name }) => searchableQuestion.includes(` ${personNameKey(name)} `));
    if (person) {
      const hasPublishedAppearance = snapshot.scheduleItems.some(item => item.eventId === snapshot.event.id
        && item.published && item.visibilityScope.id === "public" && item.speakerIds.includes(person.slug));
      if (hasPublishedAppearance) {
        const programAnswer = publishedProgramAnswer(question, snapshot, new Date().toISOString(), { personSchedule: true });
        if (programAnswer) return respond(programAnswer);
      }
      return respond(`${person.name} is listed for 2026 as ${person.role}. Attendance does not confirm a speaking slot or award. Check the published schedule for appearance details.`);
    }
    const awardsAnswer = awardsFactAnswer(question);
    if (awardsAnswer) return respond(awardsAnswer);
    const programAnswer = publishedProgramAnswer(question, snapshot, new Date().toISOString());
    if (programAnswer) return respond(programAnswer);
    if ((/\b(dates?|when)\b/.test(question) && /\b(summit|event)\b/.test(question)) || /^(?:what (?:is|are) (?:the )?)?dates?\??$/.test(question)) {
      return respond(`${snapshot.event.name}: ${snapshot.event.dateLabel}.`);
    }
    if (/\b(venue|map)\b/.test(question) || /\bwhere\b.*\b(summit|event)\b/.test(question)) {
      return respond(`${snapshot.event.name}: ${snapshot.event.venueName}, ${snapshot.event.city}. Check the published venue guide for confirmed room details.`);
    }
    // Free answers first; only relevant questions that no local rule answers may reach the model.
    const factAnswer = icfFactAnswer(question);
    if (factAnswer) return respond(factAnswer);
    // Zero-cost gate: unrelated questions are answered locally and never reach the API.
    if (!isRelevantQuestion(question, snapshot)) return respond(offTopicAnswer);
    if (isAskAiModelEnabled()) {
      const cacheKey = `${snapshot.event.id}:${snapshot.revision ?? ""}:${question.replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim()}`;
      const cached = cachedAnswer(cacheKey);
      if (cached) return respond(cached);
      const client = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "anonymous";
      if (!allowModelCall(client)) return respond("You've asked several questions in a short time. Please wait a few minutes, or use the Schedule and Contact pages.", 429);
      try {
        const result = await createAskAiModelAnswer(question, buildAskAiKnowledge(snapshot));
        const answer = result.relevant && result.answer ? result.answer : offTopicAnswer;
        rememberAnswer(cacheKey, answer);
        return respond(answer);
      } catch {
        // Provider trouble falls through to the deterministic answer below.
      }
    }
    return respond("I don't have a confirmed answer to that question. Check the published schedule or directory, or use the Contact page to ask the event team for confirmation.");
  } catch {
    return respond("Published event information is temporarily unavailable. Please try again or use the Contact page to reach the event team.", 503);
  }
}
