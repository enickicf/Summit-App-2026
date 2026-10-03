import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { event2026Snapshot } from "@not-alone/test-fixtures/event-2026";
import type { EventSnapshot } from "@not-alone/validation";
import { liveEventState } from "./live-state";
import { LiveCompanion } from "./live-companion";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));

const snapshot = event2026Snapshot;
const empty: EventSnapshot = { ...snapshot, scheduleItems: [], contentPages: [] };
const render = (nowUtc: string, data = snapshot) => renderToStaticMarkup(<LiveCompanion snapshot={data} initialNowUtc={nowUtc} />);

describe("live companion canonical states", () => {
  it("retains the actual November 5 timing notes instead of claiming that the program has concluded", () => {
    const state = liveEventState(snapshot, "2026-11-05T18:00:00.000Z");
    expect(state.mode).toBe("pending");
    expect(state.phase).toBe("live");
    expect(state.current).toEqual([]);
    expect(state.next).toBeUndefined();
    const html = render("2026-11-05T18:00:00.000Z");
    expect(html).toContain("Tennis: 10:00 AM; end time to be confirmed.");
    expect(html).toContain("High Tea: 12:00 PM; end time to be confirmed.");
    expect(html).not.toContain("has concluded");
    expect(html).not.toContain("<time");
  });

  it("keeps timing pending until the event-local day ends, without creating a session duration", () => {
    expect(liveEventState(snapshot, "2026-11-06T07:59:59.000Z").mode).toBe("pending");
    expect(liveEventState(snapshot, "2026-11-06T08:00:00.000Z").mode).toBe("after");
  });

  it("renders an intentionally empty publication as pending, never concluded or refilled", () => {
    const state = liveEventState(empty, "2026-11-05T18:00:00.000Z");
    expect(state.mode).toBe("empty");
    expect(state.phase).toBe("empty");
    const html = render("2026-11-05T18:00:00.000Z", empty);
    expect(html).toContain("Schedule pending");
    expect(html).not.toContain("has concluded");
    expect(html).not.toContain("Tennis");
  });

  it("handles pending-only programs before, during, and after their canonical dates", () => {
    const onlyPending = { ...snapshot, scheduleItems: [] };
    expect(liveEventState(onlyPending, "2026-10-01T18:00:00Z").phase).toBe("before");
    expect(liveEventState(onlyPending, "2026-11-05T18:00:00Z").mode).toBe("pending");
    expect(liveEventState(onlyPending, "2026-11-06T18:00:00Z").mode).toBe("after");
  });

  it("shows upcoming sessions before the program and between sessions with explicit event-local dates", () => {
    const before = liveEventState(snapshot, "2026-10-01T18:00:00Z");
    expect(before.mode).toBe("upcoming");
    expect(before.phase).toBe("before");
    const gap = liveEventState(snapshot, "2026-11-03T18:15:00Z");
    expect(gap.mode).toBe("upcoming");
    expect(gap.phase).toBe("live");
    const html = render("2026-11-03T18:15:00Z");
    expect(html).toContain("Scheduled to begin in 15 min.");
    expect(html).toContain("Tuesday, Nov 3");
    expect(html).toContain("PST");
    expect(html).not.toContain("has concluded");
  });

  it("renders every simultaneously current public session and excludes completed and canceled ones", () => {
    const base = snapshot.scheduleItems[0]!;
    const data = { ...empty, scheduleItems: [
      { ...base, id: "first", title: "First concurrent session" },
      { ...base, id: "second", title: "Second concurrent session" },
      { ...base, id: "canceled", title: "Canceled session", status: "canceled" as const },
      { ...base, id: "completed", title: "Completed session", status: "completed" as const }
    ] };
    const now = new Date(Date.parse(base.startUtc) + 1000).toISOString();
    expect(liveEventState(data, now).current).toHaveLength(2);
    const html = render(now, data);
    expect(html).toContain("First concurrent session</h2>");
    expect(html).toContain("Second concurrent session</h2>");
    expect(html).not.toContain("Completed session</h2>");
    expect(html).not.toContain("Canceled session</h2>");
  });

  it("only shows concluded copy after the published program and notes have ended", () => {
    const html = render("2026-11-07T18:00:00Z");
    expect(html).toContain("The published program has concluded.");
    expect(html).not.toContain("Program timing to be confirmed");
    expect(html).not.toContain("Tennis");
  });

  it("does not advertise a fresh live state from an unverified bundled program", () => {
    const html = renderToStaticMarkup(<LiveCompanion snapshot={snapshot} initialNowUtc="2026-11-07T18:00:00Z" isUnverified />);
    expect(html).toContain("Bundled schedule:");
    expect(html).toContain("No later times in the bundled program.");
    expect(html).not.toContain("The published program has concluded.");
  });

  it("provides local schedule, venue and help destinations with a polite non-countdown status", () => {
    const html = render("2026-11-03T18:15:00Z");
    expect(html).toContain('href="/schedule"');
    expect(html).toContain('href="/venue"'); // Sept 29: rooms private, the old map page redirects
    expect(html).toContain('href="/contact"');
    expect(html).toContain('role="status" aria-live="polite" aria-atomic="true">Coming up</p>');
    expect(html).not.toContain("https://www.inspiringchildren.org/summit-");
  });

  it("avoids generated current-session duplication but keeps custom staff text and explicit access", () => {
    const base = snapshot.scheduleItems[0]!;
    const item = { ...base, title: "Test session", locationName: "Test room", eligibilityScope: { id: "restricted", label: "Invitation required" } };
    const generated = `${item.title}. ${item.locationName}. ${item.eligibilityScope.label}.`;
    const now = new Date(Date.parse(item.startUtc) + 1000).toISOString();
    const boilerplate = render(now, { ...empty, scheduleItems: [{ ...item, summary: generated }] });
    expect(boilerplate).not.toContain(generated);
    expect(boilerplate).not.toContain("Test room"); // Owner / Ryan (Sept 29): rooms are private (lib/room-privacy.ts)
    expect(boilerplate).toContain("<strong>Access: </strong>Invitation required");
    expect(boilerplate.match(/Invitation required/g)).toHaveLength(1);
    const custom = `${generated} Staff-approved arrival details.`;
    expect(render(now, { ...empty, scheduleItems: [{ ...item, summary: custom }] })).toContain(`<p>${custom}</p>`);
  });
});
