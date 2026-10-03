import { Children, isValidElement, type ReactElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { EventNotice, EventSnapshot, ScheduleItem } from "@not-alone/validation";
import { event2026Snapshot } from "@not-alone/test-fixtures/event-2026";
import { useEventClock } from "../app/schedule/use-event-clock";
import { usePublicationRefresh } from "../app/schedule/use-publication-refresh";
import { CurrentEventUpdates, PublicEventNotices } from "./current-event-updates";

vi.mock("../app/schedule/use-event-clock", () => ({ useEventClock: vi.fn((initial: string) => initial) }));
vi.mock("../app/schedule/use-publication-refresh", () => ({ usePublicationRefresh: vi.fn() }));

const now = "2026-11-02T17:00:00.000Z";
const eventId = event2026Snapshot.event.id;
const notice = (overrides: Partial<EventNotice> = {}): EventNotice => ({
  id: "20260000-0000-4000-8009-000000000001", eventId,
  title: "Reviewed event update", body: "Isolated test notice, not an event instruction.",
  severity: "info", published: true, startsAtUtc: "2026-11-02T16:00:00.000Z", endsAtUtc: null,
  ...overrides
});
const session = (overrides: Partial<ScheduleItem> = {}): ScheduleItem => ({
  ...event2026Snapshot.scheduleItems[0]!, title: "Reviewed session", shortTitle: "Reviewed session",
  status: "moved", startUtc: "2026-11-02T18:00:00.000Z", endUtc: "2026-11-02T19:00:00.000Z",
  ...overrides
});
const snapshot = (notices: EventNotice[] = [], scheduleItems: ScheduleItem[] = []): EventSnapshot => ({
  ...event2026Snapshot, notices, scheduleItems
});
const markup = (value: EventSnapshot, instant = now) => renderToStaticMarkup(<PublicEventNotices snapshot={value} nowUtc={instant} />);

function articles(node: ReactNode): ReactElement<Record<string, unknown>>[] {
  if (!isValidElement<Record<string, unknown>>(node)) return [];
  if (node.type === "article") return [node];
  return Children.toArray(node.props.children as ReactNode).flatMap(articles);
}

beforeEach(() => { vi.clearAllMocks(); });

describe("public event notice presentation", () => {
  it("renders no empty strip or all-clear claim when there are no active notices", () => {
    expect(markup(snapshot())).toBe("");
    expect(markup(snapshot([notice({ startsAtUtc: "2026-11-03T00:00:00Z" })]))).toBe("");
    expect(useEventClock).not.toHaveBeenCalled();
    expect(usePublicationRefresh).not.toHaveBeenCalled();
  });

  it("includes the exact start instant and excludes the exact end across ISO precision", () => {
    const start = snapshot([notice({ startsAtUtc: "2026-11-02T17:00:00Z" })]);
    expect(markup(start, "2026-11-02T16:59:59.999Z")).toBe("");
    expect(markup(start)).toContain("Reviewed event update");
    const end = snapshot([notice({ endsAtUtc: "2026-11-02T17:00:00Z" })]);
    expect(markup(end, "2026-11-02T16:59:59.999Z")).toContain("Reviewed event update");
    expect(markup(end)).toBe("");
    expect(markup(end, "2026-11-02T17:00:01.000Z")).toBe("");
  });

  it("excludes unpublished and foreign-event notices without mutating input", () => {
    const value = snapshot([
      notice({ published: false, title: "Draft notice" }),
      notice({ eventId: "another-event", title: "Another event notice" })
    ]);
    const before = structuredClone(value);
    expect(markup(value)).toBe("");
    expect(value).toEqual(before);
  });

  it("shows text severity and correct live roles in priority order", () => {
    const value = snapshot([
      notice({ id: "info", title: "Informational title" }),
      notice({ id: "change", severity: "change", title: "Change title" }),
      notice({ id: "urgent", severity: "urgent", title: "Urgent title" })
    ]);
    const nodes = articles(PublicEventNotices({ snapshot: value, nowUtc: now }));
    expect(nodes.map(node => node.props["data-severity"])).toEqual(["urgent", "change", "info"]);
    expect(nodes.map(node => node.props.role)).toEqual(["alert", "status", "status"]);
    for (const node of nodes) {
      expect(node.props["aria-atomic"]).toBe("true");
      expect(node.props["aria-relevant"]).toBe("additions text");
    }
    const html = markup(value);
    for (const label of ["Urgent update", "Schedule change", "Event information"]) expect(html).toContain(label);
    expect(html).toContain('aria-label="Event updates"');
    expect(html).toContain('aria-hidden="true"');
  });

  it("uses shared disruption notices only for this event's published public sessions", () => {
    const value = snapshot([], [
      session({ id: "moved" }),
      session({ id: "delayed", shortTitle: "Delayed session", status: "delayed" }),
      session({ id: "canceled", shortTitle: "Canceled session", status: "canceled" }),
      session({ id: "draft", published: false, shortTitle: "Draft session" }),
      session({ id: "private", visibilityScope: { id: "staff", label: "Staff" }, shortTitle: "Private session" }),
      session({ id: "foreign", eventId: "another-event", shortTitle: "Foreign session" }),
      session({ id: "ended", endUtc: "2026-11-02T17:00:00Z", shortTitle: "Ended session" }),
      session({ id: "scheduled", status: "scheduled", shortTitle: "Scheduled session" })
    ]);
    const html = markup(value);
    expect(html).toContain("Reviewed session moved");
    expect(html).toContain("Delayed session delayed");
    expect(html).toContain("Canceled session canceled");
    expect(html).toContain("This session will not take place.");
    for (const hidden of ["Draft session", "Private session", "Foreign session", "Ended session", "Scheduled session"]) expect(html).not.toContain(hidden);
    expect(articles(PublicEventNotices({ snapshot: value, nowUtc: now }))).toHaveLength(3);
  });

  it("keeps unchanged notice keys and markup stable across clock ticks and refreshed snapshots", () => {
    const value = snapshot([notice({ severity: "urgent" })]);
    const first = PublicEventNotices({ snapshot: value, nowUtc: now });
    const refreshed = PublicEventNotices({ snapshot: structuredClone(value), nowUtc: "2026-11-02T17:01:00.000Z" });
    expect(articles(refreshed).map(node => node.key)).toEqual(articles(first).map(node => node.key));
    expect(renderToStaticMarkup(refreshed)).toBe(renderToStaticMarkup(first));
    expect(markup(value)).not.toMatch(/tabindex|autofocus|<input|<button/);
    const changed = snapshot([notice({ severity: "urgent", body: "Updated isolated notice text." })]);
    const updated = PublicEventNotices({ snapshot: changed, nowUtc: now });
    expect(articles(updated)[0]!.key).toBe(articles(first)[0]!.key);
    expect(renderToStaticMarkup(updated)).toContain("Updated isolated notice text.");
    expect(markup(snapshot([notice({ published: false })]))).toBe("");
  });

  it("renders published copy as text, not executable markup", () => {
    const html = markup(snapshot([notice({ body: '<img src=x onerror="alert(1)">' })]));
    expect(html).toContain("&lt;img");
    expect(html).not.toContain("<img");
  });
});

describe("current-event publication wrapper", () => {
  it("keeps the existing clock and refresh hook mounted while publication is unavailable", () => {
    expect(CurrentEventUpdates({ snapshot: null, initialNowUtc: now })).toBeNull();
    expect(useEventClock).toHaveBeenCalledExactlyOnceWith(now);
    expect(usePublicationRefresh).toHaveBeenCalledOnce();
  });

  it("passes the event clock to presentation and leaves timer ownership outside presentation", () => {
    const clock = "2026-11-02T17:01:00.000Z";
    vi.mocked(useEventClock).mockReturnValueOnce(clock);
    const value = snapshot([notice()]);
    const tree = CurrentEventUpdates({ snapshot: value, initialNowUtc: now });
    expect(tree?.type).toBe(PublicEventNotices);
    expect(tree?.props).toEqual({ snapshot: value, nowUtc: clock });
    expect(usePublicationRefresh).toHaveBeenCalledOnce();
    expect(markup(value)).toContain("Reviewed event update");
    expect(usePublicationRefresh).toHaveBeenCalledOnce();
  });
});
