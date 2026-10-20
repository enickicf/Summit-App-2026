import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { event2026Snapshot } from "@not-alone/test-fixtures/event-2026";
import { groupPublishedProgramByDay } from "@not-alone/domain";
import { getPublicSnapshotState } from "../../../lib/snapshot";
import { cachedPublicPaths } from "../../../lib/page-cache";
import ScheduleDayPage, { generateMetadata, scheduleDayExists } from "./page";

vi.mock("../../../lib/snapshot", () => ({ getPublicSnapshotState: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
  notFound: () => { throw new Error("NEXT_NOT_FOUND"); }
}));

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime("2026-11-01T20:00:00Z");
  vi.mocked(getPublicSnapshotState).mockResolvedValue({ snapshot: event2026Snapshot, source: "published", freshness: "current", latestSchedulePublishedAtUtc: null });
});
afterEach(() => vi.useRealTimers());

const selectedTab = (html: string) => html.match(/<button[^>]*aria-selected="true"[^>]*>/)?.[0] ?? "";

describe("per-day schedule routes (Oct 19, QR codes)", () => {
  it("opens the schedule with the requested day selected", async () => {
    const days = groupPublishedProgramByDay(event2026Snapshot);
    for (const day of days) {
      const html = renderToStaticMarkup(await ScheduleDayPage({ params: Promise.resolve({ day: day.date }) }));
      expect(html).toContain("Summit Schedule");
      expect(html.match(/role="tab"/g)).toHaveLength(days.length);
      expect(selectedTab(html)).toContain(`tab-${day.date}`);
      expect(html.match(/aria-selected="true"/g)).toHaveLength(1);
      expect((await generateMetadata({ params: Promise.resolve({ day: day.date }) })).title).toBe(`Summit Schedule · ${day.dayLabel}`);
    }
  });

  it("is a 404 for a day that is not in the published schedule", async () => {
    for (const day of ["2026-11-09", "2026-11-1", "sun", "../staff", "2025-11-02"]) {
      expect(await scheduleDayExists(day)).toBe(false);
      await expect(ScheduleDayPage({ params: Promise.resolve({ day }) })).rejects.toThrow("NEXT_NOT_FOUND");
    }
  });

  it("lists every current Summit day literally in the edge-cache list", () => {
    const days = groupPublishedProgramByDay(event2026Snapshot).map(day => `/schedule/${day.date}`);
    for (const path of days) expect(cachedPublicPaths).toContain(path);
    expect(cachedPublicPaths.filter(path => path.startsWith("/schedule/"))).toEqual(days);
  });
});
