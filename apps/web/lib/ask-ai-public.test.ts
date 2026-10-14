import { describe, expect, it } from "vitest";
import { event2026Snapshot } from "@not-alone/test-fixtures/event-2026";
import { buildAskAiKnowledge } from "./ask-ai-knowledge";
import { publicSource } from "./ask-ai-model";

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
});
