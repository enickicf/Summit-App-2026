import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { askAiLogRetentionEndsAt, listAskAiLogs, purgeExpiredAskAiLogs, resetAskAiLogs, writeAskAiLog, type AskAiLogRecord } from "./ask-ai-log";
import { GET } from "../app/api/ask-ai/log.csv/route";

const fakeStore = vi.hoisted(() => ({ list: vi.fn(), get: vi.fn(), setJSON: vi.fn(), delete: vi.fn() }));
vi.mock("@netlify/blobs", () => ({ getStore: vi.fn(() => fakeStore) }));
const record = (ts: string, question = "Question"): AskAiLogRecord => ({ ts, question, answer: "Answer", sources: [], latencyMs: 12, model: "deterministic", faqRevision: null });
const exportRequest = (range = "", key = "test-key") => new Request(`https://notalonesummit.org/api/ask-ai/log.csv${range}`, { headers: { "x-ask-ai-key": key } });

beforeEach(() => {
  resetAskAiLogs(); vi.clearAllMocks(); vi.useFakeTimers(); vi.setSystemTime("2026-10-27T20:00:00Z");
  vi.stubEnv("NETLIFY", "false"); vi.stubEnv("ASK_AI_LOG_KEY", "test-key");
});
afterEach(() => { vi.unstubAllEnvs(); vi.useRealTimers(); resetAskAiLogs(); });

describe("private question logs", () => {
  it("rejects absent, wrong, and unconfigured export secrets", async () => {
    expect((await GET(exportRequest("", "wrong"))).status).toBe(401);
    expect((await GET(new Request("https://notalonesummit.org/api/ask-ai/log.csv"))).status).toBe(401);
    vi.stubEnv("ASK_AI_LOG_KEY", "");
    expect((await GET(exportRequest())).status).toBe(401);
  });
  it.each(["?from=2026-02-30", "?from=2026-13-01", "?from=2026-11-02&to=2026-11-01", "?from=yesterday"])("rejects invalid ranges: %s", async range => {
    expect((await GET(exportRequest(range))).status).toBe(400);
  });
  it("preserves stored input while escaping CSV quotes, newlines and formula injection", async () => {
    await writeAskAiLog(record("2026-11-02T20:00:00Z", '=HYPERLINK("evil")\nnext line'));
    const response = await GET(exportRequest("?from=2026-11-02&to=2026-11-02"));
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(await response.text()).toContain('"\'=HYPERLINK(""evil"")\nnext line"');
    expect((await listAskAiLogs("2026-11-02", "2026-11-02"))[0]!.question).toBe('=HYPERLINK("evil")\nnext line');
  });
  it("finds the oldest 10,000 across unsorted blob pages and bounds concurrent reads", async () => {
    vi.stubEnv("NETLIFY", "true");
    const keys = Array.from({ length: 10_002 }, (_, i) => `${new Date(Date.parse("2026-11-02T00:00:00Z") + i * 1000).toISOString()}/${i}.json`).reverse();
    fakeStore.list.mockImplementation(async function* () { yield { blobs: keys.slice(0, 7000).map(key => ({ key })) }; yield { blobs: keys.slice(7000).map(key => ({ key })) }; });
    fakeStore.get.mockImplementation(async key => record(key.split("/")[0]));
    const records = await listAskAiLogs("2026-11-02", "2026-11-02");
    expect(records).toHaveLength(10_000);
    expect(records[0]!.ts).toBe("2026-11-02T00:00:00.000Z");
    expect(records.at(-1)!.ts).toBe(new Date(Date.parse("2026-11-02T00:00:00Z") + 9999 * 1000).toISOString());
    expect(fakeStore.get).toHaveBeenCalledTimes(10_000);
  });
  it("does not leak provider error messages or fail attendee answers when logging fails", async () => {
    vi.stubEnv("NETLIFY", "true");
    fakeStore.setJSON.mockRejectedValue(new Error("private-sdk-token"));
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    await expect(writeAskAiLog(record("2026-11-02T20:00:00Z"))).resolves.toBeUndefined();
    expect(log).toHaveBeenCalledWith("Ask AI question log write failed");
    log.mockRestore();
    fakeStore.list.mockImplementation(() => { throw new Error("private-sdk-token"); });
    const response = await GET(exportRequest());
    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain("private-sdk-token");
  });
  it("purges only its dedicated store after the event-timezone retention deadline", async () => {
    vi.stubEnv("NETLIFY", "true");
    fakeStore.list.mockImplementation(async function* () { yield { blobs: [{ key: "ask-ai-test-record" }] }; });
    expect(await purgeExpiredAskAiLogs(askAiLogRetentionEndsAt - 1)).toBe(0);
    expect(fakeStore.delete).not.toHaveBeenCalled();
    expect(await purgeExpiredAskAiLogs(askAiLogRetentionEndsAt)).toBe(1);
    expect(fakeStore.delete).toHaveBeenCalledWith("ask-ai-test-record");
    const { getStore } = await import("@netlify/blobs");
    expect(getStore).toHaveBeenCalledWith({ name: "ask-ai-logs", consistency: "strong" });
    vi.setSystemTime(askAiLogRetentionEndsAt);
    await writeAskAiLog(record("2027-01-01T08:00:00Z"));
    expect(fakeStore.setJSON).not.toHaveBeenCalled();
    expect(await listAskAiLogs("2026-01-01", "2026-12-31")).toEqual([]);
  });
});
