import { afterEach, describe, expect, it, vi } from "vitest";
import { event2026Snapshot } from "@not-alone/test-fixtures/event-2026";
import { buildAskAiKnowledge, icfYouthContributionAnswer } from "./ask-ai-knowledge";
import { createAskAiModelAnswer, publicSource } from "./ask-ai-model";

afterEach(() => vi.unstubAllEnvs());

describe("Ask AI public boundary", () => {
  it("does not send staff-only sessions or unpublished facts to the model", () => {
    const snapshot = structuredClone(event2026Snapshot);
    snapshot.scheduleItems[0]!.summary = "SECRET STAFF CUE";
    snapshot.scheduleItems[0]!.visibilityScope.id = "staff";
    snapshot.faqs[0]!.answer = "SECRET PRIVATE FAQ";
    snapshot.faqs[0]!.published = false;
    const knowledge = JSON.stringify(buildAskAiKnowledge(snapshot, "What is the schedule?"));
    expect(knowledge).not.toContain("SECRET STAFF CUE");
    expect(knowledge).not.toContain("SECRET PRIVATE FAQ");
    expect(knowledge).not.toContain("recordId");
  });

  it("accepts only public HTTPS citations on approved domains", () => {
    expect(publicSource({ title: "ICF", url: "https://www.inspiringchildren.org/na-program" })).toBe(true);
    expect(publicSource({ title: "Staff", url: "https://notalonesummit.org/staff" })).toBe(false);
    expect(publicSource({ title: "Other", url: "https://example.com/na-program" })).toBe(false);
    expect(publicSource({ title: "Wrong protocol", url: "javascript:alert(1)" })).toBe(false);
  });

  it("answers ICF youth contribution questions from published ICF copy", () => {
    expect(icfYouthContributionAnswer("How did ICF youth contribute to the Not Alone tools and campaign?"))
      .toContain("helped create and run much of the #NotAloneChallenge");
  });

  it("does not offer Summit web search or Summit citations to the Awards-site model", async () => {
    vi.stubEnv("ENABLE_AI", "true");
    vi.stubEnv("OPENAI_API_KEY", "test-key");
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body));
      expect(body.tools[0].filters.allowed_domains).toEqual(["inspiringchildren.org", "notaloneawards.org"]);
      expect(JSON.parse(body.input).facts.schedule).toEqual([]);
      return Response.json({ output_text: JSON.stringify({ relevant: true, answer: "Public Awards information.", sources: [
        { title: "Awards", url: "https://notaloneawards.org/awards/2026" },
        { title: "Summit", url: "https://notalonesummit.org/schedule" }
      ] }) });
    });
    const result = await createAskAiModelAnswer("What is the Awards Show?", buildAskAiKnowledge(event2026Snapshot, "", "awards"), fetchMock as typeof fetch, "awards");
    expect(result.sources).toEqual([{ title: "Awards", url: "https://notaloneawards.org/awards/2026" }]);
  });
});
