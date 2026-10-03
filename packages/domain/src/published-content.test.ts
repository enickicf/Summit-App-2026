import { describe, expect, it } from "vitest";
import { demoSnapshot } from "@not-alone/test-fixtures";
import { event2026Snapshot } from "@not-alone/test-fixtures/event-2026";
import { eventSnapshotSchema } from "@not-alone/validation";
import { groupPublishedProgramByDay, publishedAwardsProgram, publishedDirectory } from "./published-content";

describe("reviewed attendee content", () => {
  it("requires explicit directory activation", () => {
    expect(publishedDirectory(demoSnapshot)).toBeNull();
  });
  it("keeps an empty approved directory empty and excludes hidden or wrong-event people", () => {
    const person = demoSnapshot.speakers[0]!;
    const snapshot = { ...demoSnapshot, event: { ...demoSnapshot.event, directoryEnabled: true }, speakers: [{ ...person, published: false }, { ...person, eventId: "other", published: true }] };
    expect(publishedDirectory(snapshot)).toEqual([]);
  });
  it("uses updated published people without inferring producer roles", () => {
    const person = { ...demoSnapshot.speakers[0]!, published: true, role: "Approved role", directoryCategories: [] };
    expect(publishedDirectory({ ...demoSnapshot, event: { ...demoSnapshot.event, directoryEnabled: true }, speakers: [person] })).toEqual([person]);
  });
  it("never substitutes a hidden or historical Awards program", () => {
    const page = { ...demoSnapshot.contentPages[0]!, slug: "awards-2026-program", title: "Approved program", published: false };
    expect(publishedAwardsProgram({ ...demoSnapshot, contentPages: [page] })).toBeNull();
    expect(publishedAwardsProgram({ ...demoSnapshot, contentPages: [{ ...page, published: true }] })?.title).toBe("Approved program");
    expect(publishedAwardsProgram({ ...demoSnapshot, contentPages: [{ ...page, slug: "awards-2025-program", published: true }] })).toBeNull();
  });

  it("removes superseded timing notes while preserving unrelated incomplete details", () => {
    const snapshot = structuredClone(event2026Snapshot);
    snapshot.scheduleItems.push({ ...snapshot.scheduleItems[0]!, title: "Doors Open", status: "canceled", startUtc: "2026-11-03T02:30:00.000Z", endUtc: "2026-11-03T03:00:00.000Z" });
    const before = structuredClone(snapshot);
    const notes = groupPublishedProgramByDay(snapshot).find(day => day.date === "2026-11-02")!.notes;
    expect(notes[0]?.body).not.toContain("Doors Open:");
    expect(notes[0]?.body).toContain("Pre-Show: 7:30 PM");
    expect(snapshot).toEqual(before);
  });

  it("drops fully resolved notes, retains the timed day and ignores foreign/unpublished resolutions", () => {
    const snapshot = structuredClone(event2026Snapshot);
    const template = snapshot.scheduleItems[0]!;
    snapshot.scheduleItems.push(
      { ...template, title: "Tennis", startUtc: "2026-11-05T18:00:00.000Z", endUtc: "2026-11-05T19:00:00.000Z" },
      { ...template, title: "High Tea", startUtc: "2026-11-05T20:00:00.000Z", endUtc: "2026-11-05T21:00:00.000Z" }
    );
    const resolvedDay = groupPublishedProgramByDay(snapshot).find(day => day.date === "2026-11-05")!;
    expect(resolvedDay.notes).toEqual([]);
    expect(resolvedDay.items).toHaveLength(2);
    snapshot.scheduleItems.at(-1)!.published = false;
    snapshot.scheduleItems.at(-2)!.eventId = "other-event";
    const notes = groupPublishedProgramByDay(snapshot).find(day => day.date === "2026-11-05")!.notes;
    expect(notes[0]?.body).toContain("Tennis:");
    expect(notes[0]?.body).toContain("High Tea:");
  });

  it("does not infer which repeated-title activity supersedes a different day's note", () => {
    const snapshot = structuredClone(event2026Snapshot);
    snapshot.scheduleItems.push({ ...snapshot.scheduleItems[0]!, title: "Tennis" }, { ...snapshot.scheduleItems[1]!, title: "Tennis" });
    expect(groupPublishedProgramByDay(snapshot).find(day => day.date === "2026-11-05")!.notes[0]?.body).toContain("Tennis:");
  });

  it.each(["scheduled", "canceled"] as const)("does not use a unique %s activity to erase a different day's note", status => {
    const snapshot = structuredClone(event2026Snapshot);
    const note = snapshot.contentPages.find(page => page.slug === "schedule-pending-2026-11-05")!;
    snapshot.scheduleItems.push({ ...snapshot.scheduleItems[0]!, title: "Tennis", status });
    expect(groupPublishedProgramByDay(snapshot).find(day => day.date === "2026-11-05")!.notes[0]).toEqual(note);
  });

  it("uses the event-local date, not a matching UTC date, to resolve notes", () => {
    const snapshot = structuredClone(event2026Snapshot);
    const tennis = { ...snapshot.scheduleItems[0]!, title: "Tennis", startUtc: "2026-11-05T01:00:00.000Z", endUtc: "2026-11-05T02:00:00.000Z" };
    snapshot.scheduleItems.push(tennis);
    expect(groupPublishedProgramByDay(snapshot).find(day => day.date === "2026-11-05")!.notes[0]?.body).toContain("Tennis:");
    tennis.startUtc = "2026-11-06T01:00:00.000Z";
    tennis.endUtc = "2026-11-06T02:00:00.000Z";
    expect(groupPublishedProgramByDay(snapshot).find(day => day.date === "2026-11-05")!.notes[0]?.body).not.toContain("Tennis:");
  });

  it("does not resolve a public note using a private same-date session", () => {
    const snapshot = structuredClone(event2026Snapshot);
    snapshot.scheduleItems.push({ ...snapshot.scheduleItems[0]!, title: "Tennis", startUtc: "2026-11-05T18:00:00.000Z", endUtc: "2026-11-05T19:00:00.000Z", visibilityScope: { id: "staff", label: "Staff only" } });
    expect(groupPublishedProgramByDay(snapshot).find(day => day.date === "2026-11-05")!.notes[0]?.body).toContain("Tennis:");
  });

  it("preserves other notes when staff uses adjacent lines instead of paragraphs", () => {
    const snapshot = structuredClone(event2026Snapshot);
    snapshot.contentPages.find(page => page.slug === "schedule-pending-2026-11-05")!.body = "Tennis: 10:00 AM; end time to be confirmed.\nHigh Tea: 12:00 PM; end time to be confirmed.\nApproved additional details.";
    snapshot.scheduleItems.push({ ...snapshot.scheduleItems[0]!, title: "Tennis", startUtc: "2026-11-05T18:00:00.000Z", endUtc: "2026-11-05T19:00:00.000Z" });
    const body = groupPublishedProgramByDay(snapshot).find(day => day.date === "2026-11-05")!.notes[0]!.body;
    expect(body).not.toContain("Tennis:");
    expect(body).toContain("High Tea:");
    expect(body).toContain("Approved additional details.");
  });

  it.each(["\n", "\r\n"])("removes a canceled activity's multiline timing without orphaning its old time (%j)", newline => {
    const snapshot = structuredClone(event2026Snapshot);
    snapshot.contentPages.find(page => page.slug === "schedule-pending-2026-11-05")!.body = [
      "Tennis:", "10:00 AM; end time to be confirmed.",
      "High Tea:", "12:00 PM; end time to be confirmed.", "Approved additional details."
    ].join(newline);
    snapshot.scheduleItems.push({ ...snapshot.scheduleItems[0]!, title: "Tennis", status: "canceled", startUtc: "2026-11-05T18:00:00.000Z", endUtc: "2026-11-05T19:00:00.000Z" });
    const before = structuredClone(snapshot);
    const body = groupPublishedProgramByDay(eventSnapshotSchema.parse(snapshot)).find(day => day.date === "2026-11-05")!.notes[0]!.body;
    expect(body).toBe("High Tea:\n12:00 PM; end time to be confirmed.\nApproved additional details.");
    expect(snapshot).toEqual(before);
  });

  it.each([" 10:00 AM; end time to be confirmed.", "\n10:00 AM; end time to be confirmed."])("recognizes a full activity title containing a colon (%j)", timing => {
    const snapshot = structuredClone(event2026Snapshot);
    snapshot.contentPages.find(page => page.slug === "schedule-pending-2026-11-05")!.body = `Tennis: Morning Session:${timing}\n\nHigh Tea: 12:00 PM; end time to be confirmed.`;
    snapshot.scheduleItems.push({ ...snapshot.scheduleItems[0]!, title: "Tennis: Morning Session", status: "canceled", startUtc: "2026-11-05T18:00:00.000Z", endUtc: "2026-11-05T19:00:00.000Z" });
    const body = groupPublishedProgramByDay(eventSnapshotSchema.parse(snapshot)).find(day => day.date === "2026-11-05")!.notes[0]!.body;
    expect(body).toBe("High Tea: 12:00 PM; end time to be confirmed.");
  });

  it("does not let a same-date shorter title supersede a longer title on another date", () => {
    const snapshot = structuredClone(event2026Snapshot);
    const note = snapshot.contentPages.find(page => page.slug === "schedule-pending-2026-11-05")!;
    note.body = "Tennis: Morning Session:\n10:00 AM; end time to be confirmed.";
    snapshot.scheduleItems.push(
      { ...snapshot.scheduleItems[0]!, title: "Tennis", startUtc: "2026-11-05T18:00:00.000Z", endUtc: "2026-11-05T19:00:00.000Z" },
      { ...snapshot.scheduleItems[0]!, title: "Tennis: Morning Session" }
    );
    expect(groupPublishedProgramByDay(snapshot).find(day => day.date === "2026-11-05")!.notes[0]).toEqual(note);
  });

  it("preserves unknown prose and times beyond a paragraph boundary", () => {
    const snapshot = structuredClone(event2026Snapshot);
    snapshot.contentPages.find(page => page.slug === "schedule-pending-2026-11-05")!.body = "Tennis:\nStart time: 10:00 AM\nEnd time: to be confirmed.\nApproved additional details.\n11:00 AM; end time to be confirmed.\n\n12:00 PM; end time to be confirmed.";
    snapshot.scheduleItems.push({ ...snapshot.scheduleItems[0]!, title: "Tennis", status: "canceled", startUtc: "2026-11-05T18:00:00.000Z", endUtc: "2026-11-05T19:00:00.000Z" });
    const body = groupPublishedProgramByDay(snapshot).find(day => day.date === "2026-11-05")!.notes[0]!.body;
    expect(body).toBe("Approved additional details.\n11:00 AM; end time to be confirmed.\n\n12:00 PM; end time to be confirmed.");
  });

  it("does not consume standalone timing after a resolved heading's paragraph ends", () => {
    const snapshot = structuredClone(event2026Snapshot);
    snapshot.contentPages.find(page => page.slug === "schedule-pending-2026-11-05")!.body = "Tennis:\n10:00 AM; end time to be confirmed.\n\n12:00 PM; end time to be confirmed.";
    snapshot.scheduleItems.push({ ...snapshot.scheduleItems[0]!, title: "Tennis", status: "canceled", startUtc: "2026-11-05T18:00:00.000Z", endUtc: "2026-11-05T19:00:00.000Z" });
    expect(groupPublishedProgramByDay(snapshot).find(day => day.date === "2026-11-05")!.notes[0]?.body).toBe("12:00 PM; end time to be confirmed.");
  });
});
