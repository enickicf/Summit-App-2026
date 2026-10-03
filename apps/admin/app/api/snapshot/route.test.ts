import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { eventSnapshotSchema } from "@not-alone/validation";
import { selectPublishedSnapshot } from "../../../../mobile/lib/snapshot-sync";
import { getReadOnlyLiveOpsState, type LiveOpsState } from "../../../lib/live-ops-repository";
import { mixedPublicSnapshot } from "../../../lib/public-snapshot.test-fixtures";
import { GET, OPTIONS } from "./route";

vi.mock("../../../lib/live-ops-repository", () => ({ getReadOnlyLiveOpsState: vi.fn() }));
const loadState = vi.mocked(getReadOnlyLiveOpsState);

beforeEach(() => {
  loadState.mockReset();
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network forbidden in snapshot route test")));
});

afterEach(() => {
  expect(fetch).not.toHaveBeenCalled();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("anonymous snapshot route", () => {
  it("serves the public projection in the existing schema with current server time and unchanged CORS", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-20T12:34:56.000Z"));
    const snapshot = mixedPublicSnapshot();
    const before = structuredClone(snapshot);
    loadState.mockResolvedValue({ publishedSnapshot: snapshot } as LiveOpsState);

    const response = await GET();
    const data = eventSnapshotSchema.parse(await response.json());
    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
    expect(response.headers.get("Access-Control-Allow-Methods")).toBe("GET, OPTIONS");
    expect(data.serverTimeUtc).toBe("2026-09-20T12:34:56.000Z");
    expect(data.revision).toBe(snapshot.revision);
    expect(data.scheduleItems).toHaveLength(1);
    expect(data.scheduleItems[0]?.id).toBe(snapshot.scheduleItems[0]?.id);
    expect(data.scheduleItems[0]?.publishedAt).toBe(snapshot.scheduleItems[0]?.publishedAt);
    expect(data.scheduleItems[0]?.eligibilityScope.id).toBe("founders");
    expect(data.speakers.map(person => person.id)).toEqual([snapshot.speakers[0]!.id]);
    expect(JSON.stringify(data)).not.toMatch(/private-editorial-marker|private-session-marker|unpublished-|foreign-|roleSource|Unconfirmed Person/);
    expect(snapshot).toEqual(before);
  });

  it("is accepted by existing mobile selection at the same revision and replaces cached hidden records", async () => {
    const current = mixedPublicSnapshot();
    loadState.mockResolvedValue({ publishedSnapshot: current } as LiveOpsState);
    const incoming = eventSnapshotSchema.parse(await (await GET()).json());
    const result = selectPublishedSnapshot(current, incoming);
    expect(result.snapshot).toBe(incoming);
    expect(result.advanced).toBe(false);
    expect(result.rejectedStaleRevision).toBeUndefined();
    expect(result.snapshot.scheduleItems).toHaveLength(1);
    expect(result.snapshot.revision).toBe(current.revision);
  });

  it("projects degraded adapter data too, retaining a generic warning without operational details", async () => {
    loadState.mockResolvedValue({ publishedSnapshot: mixedPublicSnapshot(), adapterWarning: "Supabase private path and error details" } as LiveOpsState);
    const response = await GET();
    expect(response.headers.has("x-not-alone-adapter-warning")).toBe(true);
    expect(response.headers.get("x-not-alone-adapter-warning")).not.toMatch(/Supabase|private path|error details/);
    expect(JSON.stringify(await response.json())).not.toMatch(/private-session-marker|unpublished-|foreign-/);
  });

  it("preserves empty publications and disabled directories through the actual route", async () => {
    const snapshot = mixedPublicSnapshot();
    snapshot.scheduleItems = [];
    snapshot.event.directoryEnabled = false;
    loadState.mockResolvedValue({ publishedSnapshot: snapshot } as LiveOpsState);
    const data = await (await GET()).json();
    expect(data.scheduleItems).toEqual([]);
    expect(data.speakers).toEqual([]);
    expect(data.event.featuredPeople).toEqual([]);
  });

  it("retains unauthenticated read preflight without contacting a provider", () => {
    const response = OPTIONS();
    expect(response.status).toBe(204);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
    expect(response.headers.get("Access-Control-Allow-Methods")).toBe("GET, OPTIONS");
    expect(response.headers.get("Access-Control-Allow-Headers")).toBe("Cache-Control, Content-Type");
    expect(loadState).not.toHaveBeenCalled();
  });
});
