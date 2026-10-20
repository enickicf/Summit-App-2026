import { describe, expect, it } from "vitest";
import { event2026Snapshot } from "@not-alone/test-fixtures/event-2026";
import { commonQuestionAnswer, commonQuestions2026, isDetailedSummitQuestion, ticketProcessAnswer } from "./ask-ai-common-questions";

describe("Ask AI's 20 common event questions", () => {
  it("has a specific public answer and source for every question", () => {
    expect(commonQuestions2026).toHaveLength(20);
    for (const entry of commonQuestions2026) {
      expect(entry.match.test(entry.question), entry.question).toBe(true);
      const response = commonQuestionAnswer(entry.question, event2026Snapshot);
      expect(response, entry.question).not.toBeNull();
      expect(response!.answer.length, entry.question).toBeGreaterThan(45);
      expect(response!.sources.length, entry.question).toBeGreaterThan(0);
      expect(response!.answer, entry.question).not.toMatch(/staff|airtable|record id/i);
    }
  });

  it("keeps ticket confirmation conditional and does not look up request status", () => {
    for (const question of ["When will I get ticket confirmation?", "How will I hear back about my RSVP?", "Is my ticket confirmed?"]) {
      const answer = ticketProcessAnswer(question)?.answer ?? "";
      expect(answer).toContain("If your tickets are confirmed");
      expect(answer).toContain("email and/or text");
      expect(answer).toContain("Ask AI cannot check");
    }
    expect(ticketProcessAnswer("Show me the RSVP entries")).toBeNull();
  });

  it("separates detailed Summit questions from Awards and Day questions", () => {
    expect(isDetailedSummitQuestion("Who is speaking at the Summit?")).toBe(true);
    expect(isDetailedSummitQuestion("What is the Summit schedule? ")).toBe(true);
    expect(isDetailedSummitQuestion("When is the Summit?")).toBe(false);
    expect(isDetailedSummitQuestion("What time do Awards doors open?")).toBe(false);
    expect(isDetailedSummitQuestion("What is the Nevada Mental Health Day schedule?")).toBe(false);
  });
});
