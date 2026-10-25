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
