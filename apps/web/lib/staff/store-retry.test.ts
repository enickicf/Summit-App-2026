import { describe, expect, it } from "vitest";
import { mapWithConcurrency, netlifyBlobsSubmissionStore, withRetry } from "./store";

describe("Blobs store resilience (Sept 29, 2026)", () => {
  it("retries a transient failure and then succeeds", async () => {
    let calls = 0;
    const value = await withRetry(async () => { calls += 1; if (calls < 3) throw new Error("503"); return "ok"; }, [1, 1, 1]);
    expect(value).toBe("ok"); expect(calls).toBe(3);
  });
  it("gives up after the last retry with the last error", async () => {
    await expect(withRetry(async () => { throw new Error("down"); }, [1])).rejects.toThrow("down");
  });
  it("reads a few blobs at a time and keeps order", async () => {
    let inFlight = 0, peak = 0;
    const out = await mapWithConcurrency([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 3, async n => { inFlight += 1; peak = Math.max(peak, inFlight); await new Promise(r => setTimeout(r, 2)); inFlight -= 1; return n * 2; });
    expect(out).toEqual([2, 4, 6, 8, 10, 12, 14, 16, 18, 20]); expect(peak).toBeLessThanOrEqual(3);
  });
  it("lists every record even when one blob read fails once", async () => {
    const failures = new Map<string, number>();
    const records = { "rsvp/a.json": { id: "a", submittedAt: "2026-09-01T00:00:00.000Z" }, "rsvp/b.json": { id: "b", submittedAt: "2026-09-02T00:00:00.000Z" } };
    const store = {
      setJSON: async () => {}, delete: async () => {},
      list: async () => ({ blobs: Object.keys(records).map(key => ({ key })), directories: [] }),
      get: async (key: string) => { if (key === "rsvp/b.json" && !failures.get(key)) { failures.set(key, 1); throw new Error("blip"); } return records[key as keyof typeof records]; }
    };
    const listed = await netlifyBlobsSubmissionStore(store as never).list("rsvp");
    expect(listed.map(r => r.id)).toEqual(["b", "a"]);
  });
});
