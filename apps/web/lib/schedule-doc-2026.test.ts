import { describe, expect, it, vi } from "vitest";
import { event2026Snapshot } from "@not-alone/test-fixtures/event-2026";
import { withAirtable } from "./airtable-overlay";
import { scheduleDoc2026 } from "./schedule-doc-2026";
import { isOnWebsiteSchedule } from "./schedule-website-rules";

// Owner (Oct 7, 2026): Airtable's Run of Show drives the schedule now. The Sept 22 Google Doc schedule stays
// available behind SCHEDULE_SOURCE=doc, with the same website rules (owner exclusions, pinned times) applied.
describe("owner's Google Doc schedule (Sept 22), behind SCHEDULE_SOURCE=doc", () => {
  it("is not used by default: without the switch the schedule is Airtable's Run of Show", async () => {
    vi.stubEnv("AIRTABLE_TOKEN", "");
    vi.stubEnv("SCHEDULE_SOURCE", "");
    const next = await withAirtable({ ...event2026Snapshot, revision: 9 });
    expect(next.scheduleItems.map(item => item.title)).toContain("Awards Show"); // Airtable's "Not Alone Awards with iHeartRadio" row, shown as "Awards Show"
    expect(next.scheduleItems.map(item => item.title)).not.toContain("Pre-Show");
  });

  it("drives the website schedule only when asked, keeping Airtable rooms, the owner's exclusions and pinned times", async () => {
    vi.stubEnv("AIRTABLE_TOKEN", "");
    vi.stubEnv("SCHEDULE_SOURCE", "doc");
    const next = await withAirtable({ ...event2026Snapshot, revision: event2026Snapshot.revision + 1 });
    const expected = [...scheduleDoc2026].filter(isOnWebsiteSchedule).sort((a, b) => `${a.date} ${a.start}`.localeCompare(`${b.date} ${b.start}`)).map(row => row.title);
    expect(expected).not.toContain("Pre-Show");
    expect(expected).not.toContain("Red Carpet");
    expect(expected).not.toContain("Speaker Reception");
    expect(next.scheduleItems.map(item => item.title)).toEqual(expected);
    const at = (title: string) => next.scheduleItems.find(item => item.title === title)!;
    expect(at("Wellness Activities & Check-In").startUtc).toBe("2026-11-02T20:00:00.000Z"); // Nov 2, 12:00 PM PST
    // Pinned by the owner (Oct 7) over the doc's 3:30 / 8:00: Nevada Mental Health Day 3:00, Awards Show 7:30-10:00.
    expect(at("Nevada Mental Health Day").startUtc).toBe("2026-11-02T23:00:00.000Z"); // 3:00 PM
    expect(at("Nevada Mental Health Day").endUtc).toBe("2026-11-03T02:30:00.000Z"); // 6:30 PM
    expect(at("Awards Show Doors Open").startUtc).toBe("2026-11-03T02:30:00.000Z"); // 6:30 PM
    expect(at("Awards Show").startUtc).toBe("2026-11-03T03:30:00.000Z"); // 7:30 PM
    expect(at("Awards Show").endUtc).toBe("2026-11-03T06:00:00.000Z"); // 10:00 PM
    expect(at("Poker Night").locationName).toBe("Encore Poker Room"); // room kept from Airtable
    expect(next.scheduleItems.filter(item => item.title === "Summit Sessions")).toHaveLength(4);
    // An intentionally empty publication stays empty.
    expect((await withAirtable({ ...event2026Snapshot, scheduleItems: [] })).scheduleItems).toEqual([]);
  });
});
