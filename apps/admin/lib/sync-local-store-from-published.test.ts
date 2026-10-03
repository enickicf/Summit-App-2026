import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { event2026Snapshot } from "@not-alone/test-fixtures/event-2026";
import { readFile, mkdir, rename, writeFile } from "node:fs/promises";

vi.mock("node:fs/promises", () => ({ readFile: vi.fn(), mkdir: vi.fn(), rename: vi.fn(), writeFile: vi.fn() }));
const originalArgv = process.argv;
const loadScript = () => import("../../../scripts/sync-local-store-from-published.mjs");

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  process.argv = ["node", "sync-local-store-from-published.mjs", `--expected-local-revision=${event2026Snapshot.revision}`];
  vi.mocked(readFile).mockResolvedValue(JSON.stringify({ eventId: event2026Snapshot.event.id, revision: event2026Snapshot.revision, publishedSnapshot: event2026Snapshot }));
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json(event2026Snapshot)));
  vi.spyOn(console, "log").mockImplementation(() => {});
});

afterEach(() => {
  expect(mkdir).not.toHaveBeenCalled();
  expect(rename).not.toHaveBeenCalled();
  expect(writeFile).not.toHaveBeenCalled();
  process.argv = originalArgv;
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("anonymous public snapshot local-store preview", () => {
  it("rejects --apply before reading the staff store or contacting the API", async () => {
    process.argv.push("--apply");
    await expect(loadScript()).rejects.toThrow("--apply is disabled");
    expect(readFile).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("retains a clearly labeled read-only preview without writing any state", async () => {
    await loadScript();
    expect(fetch).toHaveBeenCalledExactlyOnceWith("https://summit-app-2026-admin.vercel.app/api/snapshot", { cache: "no-store" });
    expect(readFile).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('"localWrites":0'));
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining("--apply is disabled"));
  });

  it("does not treat a degraded HTTP-200 adapter as current", async () => {
    vi.mocked(fetch).mockResolvedValue(Response.json(event2026Snapshot, { headers: { "x-not-alone-adapter-warning": "unavailable" } }));
    await expect(loadScript()).rejects.toThrow("Published backend is unavailable");
    expect(console.log).not.toHaveBeenCalled();
  });

  it.each(["event", "revision", "local-revision", "http", "invalid-json"])("fails closed on %s mismatch or failure", async mode => {
    if (mode === "event") vi.mocked(fetch).mockResolvedValue(Response.json({ ...event2026Snapshot, event: { ...event2026Snapshot.event, id: "other" } }));
    if (mode === "revision") vi.mocked(fetch).mockResolvedValue(Response.json({ ...event2026Snapshot, revision: event2026Snapshot.revision - 1 }));
    if (mode === "local-revision") process.argv = ["node", "script", "--expected-local-revision=0"];
    if (mode === "http") vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 503 }));
    if (mode === "invalid-json") vi.mocked(fetch).mockResolvedValue(new Response("not JSON"));
    await expect(loadScript()).rejects.toThrow();
    expect(console.log).not.toHaveBeenCalled();
  });
});
