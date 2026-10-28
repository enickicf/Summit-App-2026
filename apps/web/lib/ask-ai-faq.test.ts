import { afterEach, describe, expect, it, vi } from "vitest";
import { crisisResourcesFromFaq, getAskAiFaq, resetAskAiFaqCache } from "./ask-ai-faq";

afterEach(() => {
  resetAskAiFaqCache();
  vi.unstubAllEnvs();
});

describe("Ask AI staff FAQ", () => {
  it("fetches the approved text export, caches it for five minutes, and keeps the last good copy", async () => {
    vi.stubEnv("ASK_AI_FAQ_URL", "https://docs.google.com/document/d/public-faq/export?format=txt");
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response("Parking is at Wynn.", { headers: { etag: "revision-1" } }))
      .mockRejectedValueOnce(new Error("offline"));
    expect(await getAskAiFaq(fetchMock, 0)).toEqual({ text: "Parking is at Wynn.", revision: "revision-1" });
    expect(await getAskAiFaq(fetchMock, 60_000)).toEqual({ text: "Parking is at Wynn.", revision: "revision-1" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(await getAskAiFaq(fetchMock, 301_000)).toEqual({ text: "Parking is at Wynn.", revision: "revision-1" });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("extracts only the crisis resources wording", () => {
    const text = "Contact and support\nCall us.\nCrisis resources\nCall or text 988. In an emergency, call 911.";
    expect(crisisResourcesFromFaq(text)).toBe("Call or text 988. In an emergency, call 911.");
  });
});

describe("FAQ resilience and section boundaries", () => {
  it("preserves all crisis paragraphs and stops at a following heading", () => {
    expect(crisisResourcesFromFaq("# Crisis resources\r\nFirst sentence.\r\n\r\nSecond paragraph.\r\n# Contact\r\nPrivate instructions must not appear.")).toBe("First sentence.\r\n\r\nSecond paragraph.");
  });
  it("bounds a streaming response and cancels further reading", async () => {
    vi.stubEnv("ASK_AI_FAQ_URL", "https://docs.google.com/document/d/public-faq/export?format=txt");
    const cancel = vi.fn();
    const stream = new ReadableStream<Uint8Array>({ start(controller) { controller.enqueue(new TextEncoder().encode("x".repeat(70_000))); }, cancel });
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const result = await getAskAiFaq(vi.fn().mockResolvedValue(new Response(stream)), 0);
    expect(result!.text.length).toBe(60 * 1024);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(cancel).toHaveBeenCalled();
    warn.mockRestore();
  });
  it("does not reuse another URL's cached FAQ after configuration changes", async () => {
    vi.stubEnv("ASK_AI_FAQ_URL", "https://docs.google.com/document/d/first/export?format=txt");
    await getAskAiFaq(vi.fn().mockResolvedValue(new Response("First doc")), 0);
    vi.stubEnv("ASK_AI_FAQ_URL", "https://docs.google.com/document/d/second/export?format=txt");
    expect(await getAskAiFaq(vi.fn().mockRejectedValue(new Error("unavailable")), 1)).toBeNull();
  });
  it("proceeds without FAQ on first-fetch failure and rejects non-approved URLs", async () => {
    vi.stubEnv("ASK_AI_FAQ_URL", "https://docs.google.com/document/d/public-faq/export?format=txt");
    expect(await getAskAiFaq(vi.fn().mockRejectedValue(new Error("offline")), 0)).toBeNull();
    vi.stubEnv("ASK_AI_FAQ_URL", "https://example.test/private");
    const fetchMock = vi.fn();
    expect(await getAskAiFaq(fetchMock, 0)).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
