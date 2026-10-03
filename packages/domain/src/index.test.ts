import { describe, expect, it } from "vitest";
import { event2026Snapshot } from "@not-alone/test-fixtures/event-2026";
import { eventSnapshotSchema, type ScheduleItem } from "@not-alone/validation";
import { getEventPhase, getNowAndUpcoming } from ".";

const session: ScheduleItem = {
  ...event2026Snapshot.scheduleItems[0]!,
  startUtc: "2026-11-05T17:00:00Z",
  endUtc: "2026-11-05T18:00:00Z",
  status: "scheduled"
};

function snapshot(items: ScheduleItem[] = [session]) {
  return eventSnapshotSchema.parse({ ...event2026Snapshot, scheduleItems: items, contentPages: [] });
}

describe("UTC instant precision in live selectors", () => {
  it.each(["Z", ".0Z", ".000Z"])("completes at an equal end instant formatted with %s", suffix => {
    const published = snapshot();
    const nowUtc = `2026-11-05T18:00:00${suffix}`;
    expect(getEventPhase(published, nowUtc)).toBe("after");
    expect(getNowAndUpcoming({ snapshot: published, nowUtc, audienceGroups: ["public"] }))
      .toEqual({ current: [], upcoming: [] });
  });

  it("starts at an equal instant rather than treating the zero-precision form as later", () => {
    expect(getEventPhase(snapshot(), "2026-11-05T16:59:59.999Z")).toBe("before");
    expect(getEventPhase(snapshot(), "2026-11-05T17:00:00.000Z")).toBe("live");
    expect(getEventPhase(snapshot(), "2026-11-05T17:59:59.999Z")).toBe("live");
  });

  it("uses the latest actual end, including fractional instants", () => {
    const later = { ...session, id: event2026Snapshot.scheduleItems[1]!.id, endUtc: "2026-11-05T18:00:00.500Z" };
    expect(getEventPhase(snapshot([session, later]), "2026-11-05T18:00:00.000Z")).toBe("live");
    expect(getEventPhase(snapshot([session, later]), "2026-11-05T18:00:00.500Z")).toBe("after");
  });

  it("orders next sessions by actual instants, not UTC string precision", () => {
    const later = { ...session, id: event2026Snapshot.scheduleItems[1]!.id, startUtc: "2026-11-05T17:00:00.500Z" };
    const timeline = getNowAndUpcoming({ snapshot: snapshot([later, session]), nowUtc: "2026-11-05T16:00:00.000Z", audienceGroups: ["public"] });
    expect(timeline.upcoming.map(item => item.id)).toEqual([session.id, later.id]);
  });

  it("preserves pending-day, empty, and canceled-only semantics", () => {
    expect(getEventPhase(event2026Snapshot, "2026-11-05T18:05:00.000Z")).toBe("live");
    expect(getEventPhase(event2026Snapshot, "2026-11-06T08:00:00Z")).toBe("after");
    expect(getEventPhase(snapshot([]), "2026-11-05T18:00:00.000Z")).toBe("empty");
    expect(getEventPhase(snapshot([{ ...session, status: "canceled" }]), "2026-11-05T18:00:00.000Z")).toBe("empty");
  });
});
