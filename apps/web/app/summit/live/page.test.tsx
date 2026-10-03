import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { event2026Snapshot } from "@not-alone/test-fixtures/event-2026";
import { getPublicSnapshotState } from "../../../lib/snapshot";
import LivePage from "./page";

vi.mock("../../../lib/snapshot", () => ({ getPublicSnapshotState: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));

describe("live route", () => {
  it("has one focusable main landmark and labels fallback with its true session publication date", async () => {
    vi.mocked(getPublicSnapshotState).mockResolvedValue({
      snapshot: event2026Snapshot, source: "reviewed-offline", freshness: "unverified", latestSchedulePublishedAtUtc: "2026-09-16T16:00:00.000Z"
    });
    const html = renderToStaticMarkup(await LivePage());
    expect(html).toContain('<main id="main-content" tabindex="-1"');
    expect(html.match(/<main /g)).toHaveLength(1);
    expect(html).toContain("Current publication unavailable.");
    expect(html).toContain("Latest included session publication:");
    expect(html).toContain("September 16, 2026");
    expect(html).toContain('dateTime="2026-09-16T16:00:00.000Z"');
    expect(html).toContain("Bundled schedule:");
  });
});
