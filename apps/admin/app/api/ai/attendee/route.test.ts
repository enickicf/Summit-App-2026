import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { getReadOnlyLiveOpsState, type LiveOpsState } from "../../../../lib/live-ops-repository";
import { mixedPublicSnapshot } from "../../../../lib/public-snapshot.test-fixtures";
import { createOpenAiAttendeeAnswer } from "../../../../lib/openai-event-ai";
import { isOpenAiEnabled } from "../../../../lib/openai-server";
import { POST } from "./route";

vi.mock("../../../../lib/live-ops-repository", () => ({ getReadOnlyLiveOpsState: vi.fn() }));
vi.mock("../../../../lib/openai-server", () => ({ isOpenAiEnabled: vi.fn() }));
vi.mock("../../../../lib/openai-event-ai", () => ({ createOpenAiAttendeeAnswer: vi.fn() }));
vi.mock("../../../../lib/rate-limit", () => ({ checkRateLimit: () => ({ allowed: true, headers: {} }) }));

beforeEach(() => {
  vi.mocked(getReadOnlyLiveOpsState).mockResolvedValue({ publishedSnapshot: mixedPublicSnapshot() } as LiveOpsState);
  vi.mocked(isOpenAiEnabled).mockReturnValue(false);
  vi.mocked(createOpenAiAttendeeAnswer).mockReset();
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Unexpected network request")));
});
afterEach(() => { expect(fetch).not.toHaveBeenCalled(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

function request(question: string) {
  return new NextRequest("https://offline.invalid/api/ai/attendee", { method: "POST", body: JSON.stringify({ question }), headers: { "Content-Type": "application/json" } });
}

describe("attendee route public-data boundary", () => {
  it("filters deterministic answers before a provider is considered", async () => {
    const response = await POST(request("What is the schedule?"));
    expect(response.status).toBe(200);
    const result = await response.json();
    expect(result.engine).toBe("deterministic-fallback");
    expect(result.answer.items).toHaveLength(1);
    expect(JSON.stringify(result)).not.toMatch(/private-editorial-marker|private-session-marker|unpublished-|foreign-|roleSource|Unconfirmed Person/);
    expect(createOpenAiAttendeeAnswer).not.toHaveBeenCalled();
  });

  it("supplies only public data to the model path and keeps its failure fallback filtered", async () => {
    vi.mocked(isOpenAiEnabled).mockReturnValue(true);
    vi.mocked(createOpenAiAttendeeAnswer).mockRejectedValue(new Error("Synthetic provider failure"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    const result = await (await POST(request("What is the schedule?"))).json();
    expect(createOpenAiAttendeeAnswer).toHaveBeenCalledOnce();
    const input = vi.mocked(createOpenAiAttendeeAnswer).mock.calls[0]![0];
    expect(input.snapshot.scheduleItems).toHaveLength(1);
    expect(JSON.stringify(input)).not.toMatch(/private-session-marker|unpublished-|foreign-|roleSource|Unconfirmed Person/);
    expect(result.engine).toBe("deterministic-fallback");
    expect(result.answer.items).toHaveLength(1);
    expect(JSON.stringify(result)).not.toMatch(/private-session-marker|unpublished-|foreign-|roleSource|Unconfirmed Person/);
  });

  it.each<Pick<LiveOpsState, "degraded" | "adapterWarning">>([
    { degraded: true },
    { adapterWarning: "private-backend-error-marker" }
  ])("keeps an explicitly unverified offline schedule without invoking AI: %j", async flags => {
    const snapshot = mixedPublicSnapshot();
    snapshot.scheduleItems[0]!.status = "canceled";
    const before = structuredClone(snapshot);
    vi.mocked(getReadOnlyLiveOpsState).mockResolvedValue({ publishedSnapshot: snapshot, ...flags } as LiveOpsState);
    vi.mocked(isOpenAiEnabled).mockReturnValue(true);
    const response = await POST(request("What is the schedule?"));
    const result = await response.json();
    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
    expect(response.headers.get("x-not-alone-adapter-warning")).toContain("saved offline schedule");
    expect(result.engine).toBe("deterministic-fallback");
    expect(result.answer.title).toContain("unverified");
    expect(result.answer.body).toContain("current times, cancellations, guest attendance and roles cannot be verified");
    expect(result.answer.items).toHaveLength(1);
    expect(result.answer.items[0]).toMatchObject({ id: snapshot.scheduleItems[0]!.id, title: `${snapshot.scheduleItems[0]!.title} (canceled)` });
    expect(result.answer.warnings).toEqual([result.note]);
    expect(JSON.stringify(result)).not.toMatch(/private-backend-error-marker|private-session-marker|unpublished-|foreign-|roleSource|Unconfirmed Person/);
    expect(createOpenAiAttendeeAnswer).not.toHaveBeenCalled();
    expect(snapshot).toEqual(before);
  });

  it.each(["Who is attending?", "When is Jason Kennedy speaking?", "Who is hosting the Awards?"])("does not reconfirm a stale guest or role: %s", async question => {
    const snapshot = mixedPublicSnapshot();
    vi.mocked(getReadOnlyLiveOpsState).mockResolvedValue({ publishedSnapshot: snapshot, degraded: true } as LiveOpsState);
    vi.mocked(isOpenAiEnabled).mockReturnValue(true);
    const result = await (await POST(request(question))).json();
    expect(result.answer.body).toContain("guest attendance and roles cannot be verified");
    expect(JSON.stringify(result)).not.toContain(snapshot.speakers[0]!.name);
    expect(JSON.stringify(result)).not.toMatch(/Confirmed 2026 guests|is a confirmed 2026 guest|No 2026 guests have been published|latest published schedule/);
    expect(createOpenAiAttendeeAnswer).not.toHaveBeenCalled();
  });

  it("preserves crisis guidance while disclosing an unavailable publication", async () => {
    vi.mocked(getReadOnlyLiveOpsState).mockResolvedValue({ publishedSnapshot: mixedPublicSnapshot(), degraded: true } as LiveOpsState);
    vi.mocked(isOpenAiEnabled).mockReturnValue(true);
    const result = await (await POST(request("This is an emergency and I feel unsafe"))).json();
    expect(result.answer.title).toBe("Immediate human support");
    expect(result.answer.body).toContain("988");
    expect(result.answer.body).toContain("live publication is unavailable");
    expect(result.answer.items).toEqual([]);
    expect(createOpenAiAttendeeAnswer).not.toHaveBeenCalled();
  });

  it("keeps an empty offline schedule empty", async () => {
    const snapshot = mixedPublicSnapshot();
    snapshot.scheduleItems = [];
    vi.mocked(getReadOnlyLiveOpsState).mockResolvedValue({ publishedSnapshot: snapshot, degraded: true } as LiveOpsState);
    const result = await (await POST(request("What is the schedule?"))).json();
    expect(result.answer.items).toEqual([]);
    expect(result.answer.body).toContain("cannot be verified");
    expect(createOpenAiAttendeeAnswer).not.toHaveBeenCalled();
  });

  it("preserves reviewed partial-timing notes as unverified offline information", async () => {
    const snapshot = mixedPublicSnapshot();
    vi.mocked(getReadOnlyLiveOpsState).mockResolvedValue({ publishedSnapshot: snapshot, degraded: true } as LiveOpsState);
    const result = await (await POST(request("What happens Thursday?"))).json();
    expect(result.answer.body).toContain("Saved timing notes (unverified)");
    expect(result.answer.body).toContain("Thursday, November 5 (America/Los_Angeles)");
    expect(result.answer.body).toContain("Tennis: 10:00 AM; end time to be confirmed");
    expect(result.answer.body).toContain("High Tea: 12:00 PM; end time to be confirmed");
    expect(JSON.stringify(result)).not.toContain("unpublished-page-marker");
    expect(createOpenAiAttendeeAnswer).not.toHaveBeenCalled();
  });

  it("still allows a model answer from a verified public publication", async () => {
    vi.mocked(getReadOnlyLiveOpsState).mockResolvedValue({ publishedSnapshot: mixedPublicSnapshot(), degraded: false } as LiveOpsState);
    vi.mocked(isOpenAiEnabled).mockReturnValue(true);
    const answer = { mode: "openai-ready" as const, title: "Published program", body: "Published details", items: [], warnings: [] };
    vi.mocked(createOpenAiAttendeeAnswer).mockResolvedValue(answer);
    const response = await POST(request("What is the schedule?"));
    const result = await response.json();
    expect(result.engine).toBe("openai");
    expect(result.answer).toEqual(answer);
    expect(response.headers.get("x-not-alone-adapter-warning")).toBeNull();
    expect(createOpenAiAttendeeAnswer).toHaveBeenCalledOnce();
  });
});
