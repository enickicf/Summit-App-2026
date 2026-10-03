import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { event2026Snapshot } from "@not-alone/test-fixtures/event-2026";
import type { EventSnapshot } from "@not-alone/validation";
import { getPublicSnapshotState } from "../../lib/snapshot";
import SchedulePage from "./page";

vi.mock("../../lib/snapshot", () => ({ getPublicSnapshotState: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));

function mockSnapshot(snapshot: EventSnapshot) {
  vi.mocked(getPublicSnapshotState).mockResolvedValue({ snapshot, source: "published", freshness: "current", latestSchedulePublishedAtUtc: null });
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime("2026-11-01T20:00:00Z");
  mockSnapshot(event2026Snapshot);
});
afterEach(() => vi.useRealTimers());

describe("schedule route", () => {
  it("shows a clean header with canonical dates and venue and no secondary program controls", async () => {
    const html = renderToStaticMarkup(await SchedulePage());
    expect(html).toContain("Summit Schedule");
    expect(html).toContain(event2026Snapshot.event.dateLabel.replaceAll("&", "&amp;"));
    expect(html).toContain(event2026Snapshot.event.venueName);
    expect(html).toContain('<main id="main-content" tabindex="-1"');
    expect(html.match(/<main /g)).toHaveLength(1);
    expect(html.match(/role="tab"/g)).toHaveLength(5);
    expect(html).not.toContain("Personal schedule");
    // Removed at the owner's request: time-zone label, program note, jump action, and secondary links.
    expect(html).not.toContain("Pacific Time");
    expect(html).not.toContain("attendance alone does not confirm a speaking appearance");
    expect(html).not.toContain("Jump to");
    expect(html).not.toContain('href="/map"');
    expect(html).not.toContain('href="/summit/live"');
    expect(html).not.toContain('aria-label="Event information"');
  });

  it("excludes unpublished and non-public sessions and unpublished pending notes", async () => {
    const base = event2026Snapshot.scheduleItems[0]!;
    mockSnapshot({
      ...event2026Snapshot,
      scheduleItems: [
        { ...base, title: "PRIVATE SESSION", visibilityScope: { id: "staff", label: "Staff" } },
        { ...base, title: "DRAFT SESSION", published: false }
      ],
      contentPages: event2026Snapshot.contentPages.map(page => ({ ...page, published: false }))
    });
    const html = renderToStaticMarkup(await SchedulePage());
    expect(html).toContain("The published schedule will appear here when available.");
    expect(html).not.toContain("PRIVATE SESSION");
    expect(html).not.toContain("DRAFT SESSION");
    expect(html).not.toContain("Timing to be confirmed");
    expect(html).not.toContain("attendance alone does not confirm a speaking appearance");
  });

  it("labels reviewed bundled fallback without inventing an unavailable publication date", async () => {
    vi.mocked(getPublicSnapshotState).mockResolvedValue({
      snapshot: event2026Snapshot, source: "reviewed-offline", freshness: "unverified", latestSchedulePublishedAtUtc: null
    });
    const html = renderToStaticMarkup(await SchedulePage());
    expect(html).toContain("Current publication unavailable.");
    expect(html).toContain("reviewed bundled program");
    expect(html).toContain("Session publication date unavailable.");
    expect(html).toContain("<summary>Bundled program, freshness unverified</summary>");
    expect(html).not.toMatch(/<details[^>]*\sopen[=\s>]/);
    expect(html).not.toContain("Last updated");
  });
});
