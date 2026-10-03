import { NextRequest, NextResponse } from "next/server";
import { groupPublishedProgramByDay } from "@not-alone/domain";
import { getReadOnlyLiveOpsState } from "../../../../lib/live-ops-repository";
import { createAttendeeConciergeAnswer } from "../../../../lib/attendee-ai";
import { checkRateLimit } from "../../../../lib/rate-limit";
import { createOpenAiAttendeeAnswer } from "../../../../lib/openai-event-ai";
import { isOpenAiEnabled } from "../../../../lib/openai-server";
import { publicApiCorsHeaders, publicApiOptions } from "../../../../lib/public-api-cors";
import { projectPublicSnapshot } from "../../../../lib/public-snapshot";

const allowedMethods = ["POST"] as const;
const offlineWarning = "The live publication is unavailable. This is a saved offline schedule; current times, cancellations, guest attendance and roles cannot be verified.";

export function OPTIONS() {
  return publicApiOptions(allowedMethods);
}

export async function POST(request: NextRequest) {
  const rateLimit = checkRateLimit(request, "attendee-ai", {
    limit: process.env.RESPONSIVE_TEST_MODE === "1" ? 10_000 : 30,
    windowMs: 60_000
  });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many concierge requests. Please wait a moment and try again." },
      {
        status: 429,
        headers: {
          ...publicApiCorsHeaders(allowedMethods),
          ...rateLimit.headers,
          "Retry-After": String(rateLimit.retryAfterSeconds)
        }
      }
    );
  }
  const body = await request.json().catch(() => ({}));
  const question = typeof body.question === "string"
    ? body.question.trim().slice(0, 500)
    : "What is happening now?";
  const state = await getReadOnlyLiveOpsState();
  const unverified = Boolean(state.degraded || state.adapterWarning);
  const snapshot = projectPublicSnapshot(unverified
    ? { ...state.publishedSnapshot, event: { ...state.publishedSnapshot.event, directoryEnabled: false } }
    : state.publishedSnapshot);
  const fallbackAnswer = createAttendeeConciergeAnswer({
    question,
    snapshot,
    nowUtc: new Date().toISOString()
  });
  const aiEnabled = isOpenAiEnabled();
  let answer = fallbackAnswer;
  let engine: "openai" | "deterministic-fallback" = "deterministic-fallback";

  if (unverified) {
    // Crisis guidance is independent of the publication; other prose must not
    // turn an old roster or appearance into a current confirmation.
    const crisisAnswer = fallbackAnswer.title === "Immediate human support";
    const savedNotes = groupPublishedProgramByDay(snapshot)
      .filter(day => day.notes.length > 0)
      .map(day => `${day.dayLabel} (${snapshot.event.timeZone}):\n${day.notes.map(note => note.body).join("\n\n")}`)
      .join("\n\n");
    answer = {
      ...fallbackAnswer,
      title: crisisAnswer ? fallbackAnswer.title : "Offline schedule: current details unverified",
      body: crisisAnswer
        ? `${fallbackAnswer.body}\n\n${offlineWarning}`
        : `${offlineWarning} Saved schedule records below may have changed. Ask event staff for current details.${savedNotes ? `\n\nSaved timing notes (unverified):\n\n${savedNotes}` : ""}`,
      warnings: [offlineWarning]
    };
  } else if (aiEnabled) {
    try {
      answer = await createOpenAiAttendeeAnswer({
        question,
        snapshot,
        nowUtc: new Date().toISOString()
      });
      engine = "openai";
    } catch (error) {
      console.error("Attendee OpenAI call failed:", error instanceof Error ? error.message : "Unknown provider error.");
      answer = {
        ...fallbackAnswer,
        warnings: ["Live concierge is temporarily unavailable. This answer uses the latest published schedule."]
      };
    }
  }

  return NextResponse.json(
    {
      ok: true,
      aiEnabled,
      engine,
      answer,
      note: unverified ? offlineWarning : engine === "openai" ? "Live grounded concierge response." : "Schedule-grounded fallback response."
    },
    {
      headers: {
        "Cache-Control": "no-store",
        ...(unverified ? { "x-not-alone-adapter-warning": offlineWarning } : {}),
        ...publicApiCorsHeaders(allowedMethods),
        ...rateLimit.headers
      }
    }
  );
}
