import { describe, expect, it } from "vitest";
import { event2026Snapshot } from "@not-alone/test-fixtures/event-2026";
import { eventSnapshotSchema } from "@not-alone/validation";
import { projectPublicSnapshot } from "./public-snapshot";
import { mixedPublicSnapshot } from "./public-snapshot.test-fixtures";

describe("anonymous snapshot projection", () => {
  it("removes unpublished, restricted and foreign-event records without mutating staff state", () => {
    const snapshot = mixedPublicSnapshot();
    const before = structuredClone(snapshot);
    const result = projectPublicSnapshot(snapshot);
    expect(eventSnapshotSchema.parse(result)).toEqual(result);
    expect(result.revision).toBe(snapshot.revision);
    expect(result.serverTimeUtc).toBe(snapshot.serverTimeUtc);
    expect(result.scheduleItems).toHaveLength(1);
    expect(result.speakers).toHaveLength(1);
    expect(result.media).toHaveLength(1);
    expect(result.notices).toHaveLength(1);
    expect(result.faqs).toHaveLength(snapshot.faqs.length - 1);
    expect(result.sponsors).toHaveLength(snapshot.sponsors.length - 1);
    expect(result.contentPages).toHaveLength(snapshot.contentPages.length - 1);
    expect(JSON.stringify(result)).not.toMatch(/private-editorial-marker|private-session-marker|unpublished-|foreign-|roleSource|Unconfirmed Person/);
    expect(snapshot).toEqual(before);
  });

  it("preserves visible sessions with restricted eligibility and all public session contract fields", () => {
    const snapshot = mixedPublicSnapshot();
    const result = projectPublicSnapshot(snapshot);
    expect(result.scheduleItems[0]).toEqual({ ...snapshot.scheduleItems[0], speakerIds: [snapshot.speakers[0]!.id] });
    expect(result.scheduleItems[0]?.eligibilityScope).toEqual({ id: "founders", label: "Founders only" });
  });

  it("removes withheld speaker references and featured people, without adding a role", () => {
    const snapshot = mixedPublicSnapshot();
    const result = projectPublicSnapshot(snapshot);
    expect(result.scheduleItems[0]?.speakerIds).toEqual([snapshot.speakers[0]!.id]);
    expect(result.event.featuredPeople).toEqual([snapshot.event.featuredPeople[0]]);
    expect(result.speakers[0]?.role).toBe(snapshot.speakers[0]!.role);
    expect(result.speakers[0]).not.toHaveProperty("roleSource");
  });

  it.each([false, undefined])("honors directoryEnabled=%s without restoring guests from bundled data", enabled => {
    const snapshot = mixedPublicSnapshot();
    if (enabled === undefined) delete snapshot.event.directoryEnabled;
    else snapshot.event.directoryEnabled = enabled;
    const result = projectPublicSnapshot(snapshot);
    expect(result.speakers).toEqual([]);
    expect(result.event.featuredPeople).toEqual([]);
    expect(result.scheduleItems[0]?.speakerIds).toEqual([]);
    expect(result.scheduleItems).toHaveLength(1);
  });

  it("keeps reviewed current-event venue essentials, including unreferenced locations", () => {
    const snapshot = mixedPublicSnapshot();
    const result = projectPublicSnapshot(snapshot);
    expect(result.locations).toEqual(snapshot.locations.filter(location => location.eventId === snapshot.event.id));
    expect(result.locations.some(location => !result.scheduleItems.some(item => item.locationId === location.id))).toBe(true);
  });

  it("keeps intentionally empty current publications empty", () => {
    const snapshot = { ...event2026Snapshot, scheduleItems: [], speakers: [], contentPages: [] };
    const result = projectPublicSnapshot(snapshot);
    expect(result.scheduleItems).toEqual([]);
    expect(result.speakers).toEqual([]);
    expect(result.contentPages).toEqual([]);
  });
});
