import { afterEach, describe, expect, it, vi } from "vitest";
import { ASK_AI_TIMEOUT_MS, askAi, questionSchema } from "./request";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("Ask AI request handling", () => {
  it("trims questions and accepts only 2 to 500 characters", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    for (const question of ["", "   ", " x ", "x".repeat(501)]) {
      expect(await askAi(question, new AbortController().signal)).toEqual({
        status: "error", message: "Please enter a question between 2 and 500 characters."
      });
    }
    expect(fetchMock).not.toHaveBeenCalled();
    expect(questionSchema.parse("  Where? \n")).toBe("Where?");
    expect(questionSchema.safeParse("x".repeat(500)).success).toBe(true);
  });

  it("only posts the trimmed question to the same-origin API and validates the answer", async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ answer: " Published information. ", unrelated: true }));
    vi.stubGlobal("fetch", fetchMock);
    const controller = new AbortController();
    const removeListener = vi.spyOn(controller.signal, "removeEventListener");
    expect(await askAi("  Where is the schedule?  ", controller.signal)).toEqual({ status: "success", answer: "Published information." });
    expect(fetchMock).toHaveBeenCalledExactlyOnceWith("/api/ask-ai", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: "Where is the schedule?" }), signal: expect.any(AbortSignal)
    });
    expect(removeListener).toHaveBeenCalledWith("abort", expect.any(Function));
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each([400, 408, 413, 429, 500, 503])("handles HTTP %s without displaying its body as an answer", async status => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ answer: "Internal error details" }, { status })));
    const result = await askAi("Where?", new AbortController().signal);
    expect(result.status).toBe("error");
    expect(result).not.toHaveProperty("answer");
    expect(JSON.stringify(result)).not.toContain("Internal error details");
    if (status === 429) expect(JSON.stringify(result)).toContain("wait a moment");
  });

  it.each([null, {}, { answer: null }, { answer: 42 }, { answer: "" }, { answer: "  \n" }])("rejects malformed or empty answer payloads: %j", async payload => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json(payload)));
    expect(await askAi("Where?", new AbortController().signal)).toEqual({
      status: "error", message: "An answer could not be read. Please try again, or contact the event team."
    });
  });

  it("handles non-JSON gateway responses and network failures without throwing", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response("<html>Gateway problem</html>"))
      .mockRejectedValueOnce(new TypeError("Failed to fetch"))
      .mockResolvedValueOnce(Response.json({ answer: "Recovered answer" }));
    vi.stubGlobal("fetch", fetchMock);
    expect(await askAi("Where?", new AbortController().signal)).toEqual({
      status: "error", message: "An answer could not be read. Please try again, or contact the event team."
    });
    expect(await askAi("Where?", new AbortController().signal)).toEqual({
      status: "error", message: "An answer could not be loaded. Please check your connection and try again."
    });
    expect(await askAi("Where?", new AbortController().signal)).toEqual({ status: "success", answer: "Recovered answer" });
  });

  it("does not fetch a request already canceled by navigation", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const controller = new AbortController();
    controller.abort();
    expect(await askAi("Where?", controller.signal)).toEqual({ status: "error", message: "The request was canceled." });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  function mockPendingRequest() {
    const fetchMock = vi.fn((_url: string, options: RequestInit) => new Promise<Response>((_resolve, reject) => {
      options.signal?.addEventListener("abort", () => reject(new DOMException("Canceled", "AbortError")), { once: true });
    }));
    vi.stubGlobal("fetch", fetchMock);
    return fetchMock;
  }

  it("aborts a stalled response after 15 seconds and clears its timer", async () => {
    vi.useFakeTimers();
    const fetchMock = mockPendingRequest();
    const request = askAi("Where?", new AbortController().signal);
    await vi.advanceTimersByTimeAsync(ASK_AI_TIMEOUT_MS);
    expect(await request).toEqual({ status: "error", message: "The answer took too long. Please try again, or use the Schedule or Contact pages." });
    expect(fetchMock.mock.calls[0]?.[1].signal?.aborted).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("propagates navigation cancellation to fetch and clears its timer", async () => {
    vi.useFakeTimers();
    const fetchMock = mockPendingRequest();
    const controller = new AbortController();
    const request = askAi("Where?", controller.signal);
    controller.abort();
    expect(await request).toEqual({ status: "error", message: "The request was canceled." });
    expect(fetchMock.mock.calls[0]?.[1].signal?.aborted).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });
});
