import { afterEach, describe, expect, it, vi } from "vitest";
import { resetAskAiLogs, writeAskAiLog } from "../../../../lib/ask-ai-log";
import { GET } from "./route";

afterEach(() => {
  resetAskAiLogs();
  vi.unstubAllEnvs();
});

describe("Ask AI question log export", () => {
  it("requires the secret and exports only anonymous question fields", async () => {
    vi.stubEnv("ASK_AI_LOG_KEY", "test-export-key");
    await writeAskAiLog({ ts: "2026-10-24T20:00:00.000Z", question: "Where do I park?", answer: "At Wynn.", sources: [{ title: "Summit FAQ", url: "https://notalonesummit.org/schedule" }], latencyMs: 42, model: "gpt-test", faqRevision: "rev-1" });
    expect((await GET(new Request("https://example.test/api/ask-ai/log.csv"))).status).toBe(401);
    const response = await GET(new Request("https://example.test/api/ask-ai/log.csv?from=2026-10-24&to=2026-10-24", { headers: { "x-ask-ai-key": "test-export-key" } }));
    expect(response.status).toBe(200);
    const body = await response.text();
    expect(body).toContain("Where do I park?");
    expect(body).toContain("faqRevision");
    expect(body).not.toContain("user-agent");
    expect(body).not.toContain("ipAddress");
  });
});
