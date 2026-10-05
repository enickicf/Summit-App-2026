import { afterEach, describe, expect, it, vi } from "vitest";

// Oct 5, 2026: Netlify's function log showed "Failed to decode token: Token expired" (HTTP 401) on every storage
// call of a server instance about half an hour after it started, because one Blobs store (and the token it was
// created with) was kept for the instance's whole life. The store must be created again for each request.
const getStore = vi.hoisted(() => vi.fn((options: { name: string }) => ({ name: options.name, setJSON: vi.fn(), get: vi.fn(), list: vi.fn(async () => ({ blobs: [] })), delete: vi.fn() })));
vi.mock("@netlify/blobs", () => ({ getStore }));

afterEach(() => { vi.unstubAllEnvs(); getStore.mockClear(); vi.resetModules(); });

describe("the Netlify storage connection is never kept between requests", () => {
  it("creates the portal store and its journal again on every call", async () => {
    vi.stubEnv("NETLIFY_BLOBS_CONTEXT", "context-of-the-first-request");
    const { getSubmissionStore } = await import("./store");
    const first = await getSubmissionStore();
    expect(getStore.mock.calls.map(call => call[0].name)).toEqual(["staff-portal", "staff-portal-journal"]);
    const second = await getSubmissionStore();
    expect(second).not.toBe(first);
    expect(getStore.mock.calls.map(call => call[0].name)).toEqual(["staff-portal", "staff-portal-journal", "staff-portal", "staff-portal-journal"]);
    // Each store reads what is in storage through its own, newly created connection.
    await second.list("rsvp");
    expect(getStore.mock.results[2]!.value.list).toHaveBeenCalledTimes(1);
    expect(getStore.mock.results[0]!.value.list).not.toHaveBeenCalled();
  });

  it("still keeps the one local file store used in development and tests", async () => {
    vi.stubEnv("NETLIFY", "");
    vi.stubEnv("NETLIFY_BLOBS_CONTEXT", "");
    vi.stubEnv("STAFF_PORTAL_FILE", "/tmp/claude-501/does-not-exist-staff-portal-store.json");
    const { getSubmissionStore } = await import("./store");
    expect(await getSubmissionStore()).toBe(await getSubmissionStore());
    expect(getStore).not.toHaveBeenCalled();
  });
});
