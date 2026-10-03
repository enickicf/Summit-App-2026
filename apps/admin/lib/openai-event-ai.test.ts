import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createStructuredOpenAiResponse } from "./openai-server";
import { createOpenAiAttendeeAnswer, createOpenAiStateAnswer, createOpenAiScheduleProposal } from "./openai-event-ai";
import { mixedPublicSnapshot } from "./public-snapshot.test-fixtures";

vi.mock("./openai-server", () => ({ createStructuredOpenAiResponse: vi.fn() }));
const generate = vi.mocked(createStructuredOpenAiResponse);

beforeEach(() => {
  generate.mockReset();
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network forbidden in attendee AI test")));
});

afterEach(() => {
  expect(fetch).not.toHaveBeenCalled();
  vi.unstubAllGlobals();
});

describe("attendee AI public boundary", () => {
  it("filters provider input and returned IDs using the same public projection", async () => {
    const snapshot = mixedPublicSnapshot();
    const before = structuredClone(snapshot);
    generate.mockResolvedValue({ title: "Published program", body: "Use the published eligibility details.", itemIds: snapshot.scheduleItems.map(item => item.id), warnings: [] });
    const result = await createOpenAiAttendeeAnswer({ question: "What is scheduled?", snapshot, nowUtc: snapshot.serverTimeUtc });
    const input = JSON.parse(generate.mock.calls[0]![0].input);
    expect(input.publishedSchedule).toHaveLength(1);
    expect(input.publishedSchedule[0]).toMatchObject({ id: snapshot.scheduleItems[0]!.id, eligibility: "Founders only" });
    expect(input.event.featuredPeople).toEqual([snapshot.event.featuredPeople[0]]);
    expect(JSON.stringify(input)).not.toMatch(/private-editorial-marker|private-session-marker|unpublished-|foreign-|roleSource|Unconfirmed Person/);
    expect(result.items.map(item => item.id)).toEqual([snapshot.scheduleItems[0]!.id]);
    expect(snapshot).toEqual(before);
  });

  it("removes duplicate and unknown IDs without restoring hidden sessions", async () => {
    const snapshot = mixedPublicSnapshot();
    const publicId = snapshot.scheduleItems[0]!.id;
    generate.mockResolvedValue({ title: "Program", body: "Published details", itemIds: [publicId, publicId, "unknown", snapshot.scheduleItems[1]!.id], warnings: [] });
    const result = await createOpenAiAttendeeAnswer({ question: "Schedule", snapshot, nowUtc: snapshot.serverTimeUtc });
    expect(result.items.map(item => item.id)).toEqual([publicId]);
  });

  it.each(["scheduled", "canceled", "delayed", "moved", "completed"] as const)("preserves %s status in model facts and returned cards", async status => {
    const snapshot = mixedPublicSnapshot();
    const item = snapshot.scheduleItems[0]!;
    item.status = status;
    generate.mockResolvedValue({ title: "Program", body: "Published details", itemIds: [item.id], warnings: [] });
    const result = await createOpenAiAttendeeAnswer({ question: "What is happening?", snapshot, nowUtc: snapshot.serverTimeUtc });
    const call = generate.mock.calls[0]![0];
    expect(JSON.parse(call.input).publishedSchedule[0]).toMatchObject({ id: item.id, status });
    expect(call.instructions).toContain("Canceled activities will not take place");
    expect(result.items[0]).toMatchObject({ id: item.id, title: status === "scheduled" ? item.title : `${item.title} (${status})` });
    expect(result.items[0]?.time).toBeTruthy();
  });

  it("withholds featured people when the directory is disabled without hiding public sessions", async () => {
    const snapshot = mixedPublicSnapshot();
    snapshot.event.directoryEnabled = false;
    generate.mockResolvedValue({ title: "Program", body: "Published details", itemIds: [], warnings: [] });
    await createOpenAiAttendeeAnswer({ question: "Who is attending?", snapshot, nowUtc: snapshot.serverTimeUtc });
    const input = JSON.parse(generate.mock.calls[0]![0].input);
    expect(input.event.featuredPeople).toEqual([]);
    expect(input.publishedSchedule).toHaveLength(1);
  });

  it("keeps empty publications empty even if the provider supplies an old ID", async () => {
    const snapshot = mixedPublicSnapshot();
    const oldId = snapshot.scheduleItems[0]!.id;
    snapshot.scheduleItems = [];
    generate.mockResolvedValue({ title: "Pending", body: "No schedule published", itemIds: [oldId], warnings: [] });
    const result = await createOpenAiAttendeeAnswer({ question: "Schedule", snapshot, nowUtc: snapshot.serverTimeUtc });
    expect(JSON.parse(generate.mock.calls[0]![0].input).publishedSchedule).toEqual([]);
    expect(result.items).toEqual([]);
  });

  it("leaves staff-state and proposal inputs separate from the public projection", async () => {
    const facts = { restrictedStaffFact: "staff-only-marker" };
    generate.mockResolvedValueOnce({ answer: "Staff answer" });
    expect(await createOpenAiStateAnswer({ question: "Staff question", facts, sessions: [] })).toBe("Staff answer");
    expect(JSON.parse(generate.mock.calls[0]![0].input).facts).toEqual(facts);
    generate.mockResolvedValueOnce({ summary: "No edits", confidence: "High", changes: [], warnings: [] });
    expect((await createOpenAiScheduleProposal("Staff proposal", [])).changes).toEqual([]);
    expect(JSON.parse(generate.mock.calls[1]![0].input).commandText).toBe("Staff proposal");
  });
});
