import { describe, expect, it, vi } from "vitest";
import { event2026Snapshot } from "@not-alone/test-fixtures/event-2026";
import { withAirtable } from "./airtable-overlay";
import { scheduleDoc2026 } from "./schedule-doc-2026";

describe("owner's Google Doc schedule (Sept 22)", () => {
  it("drives the website schedule instead of Airtable until told otherwise, keeping Airtable rooms for matching rows", async () => {
    vi.stubEnv("AIRTABLE_TOKEN", "");
    vi.stubEnv("SCHEDULE_SOURCE", "");
    const next = await withAirtable({ ...event2026Snapshot, revision: event2026Snapshot.revision + 1 });
    const expected = [...scheduleDoc2026].sort((a, b) => `${a.date} ${a.start}`.localeCompare(`${b.date} ${b.start}`)).map(row => row.title);
    expect(next.scheduleItems.map(item => item.title)).toEqual(expected);
    const at = (title: string) => next.scheduleItems.find(item => item.title === title)!;
    expect(at("Awards Show Doors Open").startUtc).toBe("2026-11-03T01:30:00.000Z"); // Nov 2, 5:30 PM PST
    expect(at("Community Day").endUtc).toBe("2026-11-03T03:30:00.000Z"); // 7:30 PM
    expect(at("Poker Night").locationName).toBe("Encore Poker Room"); // room kept from Airtable
    expect(next.scheduleItems.filter(item => item.title === "Summit Sessions")).toHaveLength(4);
    // An intentionally empty publication stays empty.
    expect((await withAirtable({ ...event2026Snapshot, scheduleItems: [] })).scheduleItems).toEqual([]);
  });
});
