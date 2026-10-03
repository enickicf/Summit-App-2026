import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { groupPublishedProgramByDay } from "@not-alone/domain";
import { event2026Snapshot } from "@not-alone/test-fixtures/event-2026";
import type { ScheduleItem } from "@not-alone/validation";
import { ScheduleBrowser } from "../../components/schedule-browser";
import {
  eventDateKey, eventTimeZoneLabel, formatSessionTimes, groupSessionsByStart, initialScheduleDay, isFoundersOnly,
  scheduleDayForKey, scheduleStatusLabels, sessionDisplaySummary, tabIndexForKey
} from "./schedule-presentation";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));

const timeZone = event2026Snapshot.event.timeZone;
const days = groupPublishedProgramByDay(event2026Snapshot);
const session = (overrides: Partial<ScheduleItem> = {}): ScheduleItem => ({
  ...event2026Snapshot.scheduleItems[0]!,
  startUtc: "2026-11-02T16:00:00.000Z",
  endUtc: "2026-11-02T17:00:00.000Z",
  status: "scheduled",
  ...overrides
});

describe("schedule presentation", () => {
  it("derives friendly time-zone names from IANA zones without hard-coding Pacific or daylight time", () => {
    expect(eventTimeZoneLabel("America/Los_Angeles", "2026-07-01T12:00:00Z")).toBe("Pacific Time");
    expect(eventTimeZoneLabel("America/Los_Angeles", "2026-11-03T12:00:00Z")).toBe("Pacific Time");
    expect(eventTimeZoneLabel("America/New_York", "2026-11-03T12:00:00Z")).toBe("Eastern Time");
    expect(eventTimeZoneLabel("Asia/Tokyo", "2026-11-03T12:00:00Z")).toBe("Japan Standard Time");
    expect(eventTimeZoneLabel("Unconfirmed/Time_Zone", "2026-11-03T12:00:00Z")).toBe("Unconfirmed/Time Zone");
  });

  it("derives the event-local date independently of the device time zone", () => {
    expect(eventDateKey("2026-11-02T03:00:00Z", "America/Los_Angeles")).toBe("2026-11-01");
    expect(eventDateKey("2026-11-02T03:00:00Z", "Asia/Tokyo")).toBe("2026-11-02");
  });

  it("sorts by the actual instant and groups simultaneous sessions without mutating the input", () => {
    const later = session({ id: "later", startUtc: "2026-11-02T18:00:00Z" });
    const first = session({ id: "first", startUtc: "2026-11-02T16:00:00Z" });
    const simultaneous = session({ id: "simultaneous" });
    const items = [later, first, simultaneous];
    const groups = groupSessionsByStart(items);
    expect(groups.map(group => group.items.map(item => item.id))).toEqual([["first", "simultaneous"], ["later"]]);
    expect(items).toEqual([later, first, simultaneous]);
    expect(groupSessionsByStart([])).toEqual([]);
  });

  it("does not merge repeated local clock times at the November DST transition", () => {
    const daylight = session({ startUtc: "2026-11-01T08:30:00Z" });
    const standard = session({ startUtc: "2026-11-01T09:30:00Z" });
    const groups = groupSessionsByStart([standard, daylight]);
    expect(groups).toHaveLength(2);
    expect(formatSessionTimes(daylight, timeZone).start).toBe("1:30 AM PDT");
    expect(formatSessionTimes(standard, timeZone).start).toBe("1:30 AM PST");
  });

  it("shows the end date for overnight and year-boundary sessions in the canonical event zone", () => {
    const overnight = session({ startUtc: "2026-11-02T07:30:00Z", endUtc: "2026-11-02T08:30:00Z", eventTimeZone: "Asia/Tokyo" });
    expect(formatSessionTimes(overnight, timeZone)).toEqual({ start: "11:30 PM PST", end: "Nov 2, 2026, 12:30 AM PST" });
    expect(formatSessionTimes(session({ startUtc: "2027-01-01T07:30:00Z", endUtc: "2027-01-01T08:30:00Z" }), timeZone).end)
      .toBe("Jan 1, 2027, 12:30 AM PST");
  });

  it("opens today, the next program day, or the last day after the program, including pending-only dates", () => {
    expect(initialScheduleDay(days, "2026-10-30")).toBe("2026-11-01");
    expect(initialScheduleDay(days, "2026-11-03")).toBe("2026-11-03");
    expect(initialScheduleDay(days, "2026-11-05")).toBe("2026-11-05");
    expect(initialScheduleDay(days, "2026-11-10")).toBe("2026-11-05");
    expect(initialScheduleDay([], "2026-11-03")).toBe("");
    expect(initialScheduleDay(days.filter(day => day.date !== "2026-11-03"), "2026-11-03")).toBe("2026-11-04");
  });

  it("preserves an explicit selected day and recovers when a publication removes that day", () => {
    expect(scheduleDayForKey(days, "2026-11-01", "2026-11-03")?.date).toBe("2026-11-01");
    expect(scheduleDayForKey(days, "removed-day", "2026-11-03")?.date).toBe("2026-11-03");
    expect(scheduleDayForKey([], "removed-day", "2026-11-03")).toBeUndefined();
  });

  it("supports wrapping arrow navigation and Home/End without taking over unrelated keys", () => {
    expect(tabIndexForKey("ArrowLeft", 0, 5)).toBe(4);
    expect(tabIndexForKey("ArrowRight", 4, 5)).toBe(0);
    expect(tabIndexForKey("Home", 3, 5)).toBe(0);
    expect(tabIndexForKey("End", 1, 5)).toBe(4);
    expect(tabIndexForKey("Tab", 1, 5)).toBeUndefined();
    expect(tabIndexForKey("ArrowDown", 1, 5)).toBeUndefined();
    expect(tabIndexForKey("ArrowRight", 0, 0)).toBeUndefined();
    expect(tabIndexForKey("ArrowRight", 0, 1)).toBe(0);
  });

  it("respects published statuses and shared half-open time boundaries", () => {
    const item = session({ startUtc: "2026-11-02T16:00:00Z", endUtc: "2026-11-02T17:00:00Z" });
    expect(scheduleStatusLabels(item, "2026-11-02T15:59:59.999Z")).toEqual([]);
    expect(scheduleStatusLabels(item, "2026-11-02T16:00:00.000Z")).toEqual(["Scheduled now"]);
    expect(scheduleStatusLabels(item, "2026-11-02T17:00:00.000Z")).toEqual(["Ended"]);
    expect(scheduleStatusLabels({ ...item, status: "canceled" }, "2026-11-02T16:30:00Z")).toEqual(["Canceled"]);
    expect(scheduleStatusLabels({ ...item, status: "completed" }, "2026-11-02T16:30:00Z")).toEqual(["Completed"]);
    expect(scheduleStatusLabels({ ...item, status: "moved" }, "2026-11-02T16:30:00Z")).toEqual(["Moved", "Scheduled now"]);
    expect(scheduleStatusLabels({ ...item, status: "delayed" }, "2026-11-02T15:30:00Z")).toEqual(["Delayed"]);
  });

  it("identifies founders-only access from the canonical scope", () => {
    expect(isFoundersOnly(session({ eligibilityScope: { id: "founders", label: "Founders only" } }))).toBe(true);
    expect(isFoundersOnly(session({ eligibilityScope: { id: "restricted", label: "Founders" } }))).toBe(true);
    expect(isFoundersOnly(session({ eligibilityScope: { id: "restricted", label: "Founder's" } }))).toBe(true);
    for (const label of ["Speakers", "Sponsors and talent", "Access details to be confirmed", "Founders and speakers"]) {
      expect(isFoundersOnly(session({ eligibilityScope: { id: "restricted", label } }))).toBe(false);
    }
  });

  it("suppresses only exact generated summary boilerplate after trimming the surrounding whitespace", () => {
    const item = session();
    const generated = `${item.title}. ${item.locationName}. ${item.eligibilityScope.label}.`;
    expect(sessionDisplaySummary({ ...item, summary: `  ${generated}\n` })).toBeNull();
    for (const custom of ["Staff-approved program details.", `${generated} Additional staff instructions.`, generated.toLowerCase(), generated.slice(0, -1)]) {
      expect(sessionDisplaySummary({ ...item, summary: custom })).toBe(custom);
    }
  });
});

describe("schedule browser server markup", () => {
  it("associates every tab with a panel and places only the selected tab in the tab order", () => {
    const html = renderToStaticMarkup(<ScheduleBrowser days={days} eventTimeZone={timeZone} initialNowUtc="2026-11-03T20:00:00Z" />);
    expect(html.match(/role="tab"/g)).toHaveLength(days.length);
    expect(html.match(/role="tabpanel"/g)).toHaveLength(days.length);
    expect(html.match(/aria-selected="true"/g)).toHaveLength(1);
    expect(html.match(/aria-selected="true" tabindex="0"/g)).toHaveLength(1);
    expect(html.match(/hidden=""/g)).toHaveLength(days.length - 1);
    for (const [, panelId] of html.matchAll(/aria-controls="([^"]+)"/g)) expect(html).toContain(`id="${panelId}"`);
    for (const [, tabId] of html.matchAll(/aria-labelledby="([^"]+-tab-[^"]+)"/g)) expect(html).toContain(`id="${tabId}"`);
    const selected = days.find(day => day.date === "2026-11-03")!;
    expect(html.match(/<article /g)).toHaveLength(selected.items.length);
    expect(html).toContain("PST");
    expect(html).toContain("<time dateTime=");
    for (const day of days) {
      expect(html).toContain(`aria-label="${day.dayLabel}"`);
      expect(html).toContain(`<strong>${day.weekday}</strong><span>${day.shortDate}</span>`);
    }
  });

  it("keeps element IDs unique across schedule instances and repeated DST clock labels", () => {
    const dstDays = [{ ...days[0]!, items: [
      session({ id: "daylight", startUtc: "2026-11-01T08:30:00Z" }),
      session({ id: "standard", startUtc: "2026-11-01T09:30:00Z" })
    ] }];
    const html = renderToStaticMarkup(<>
      <ScheduleBrowser days={dstDays} eventTimeZone={timeZone} initialNowUtc="2026-11-01T08:00:00Z" />
      <ScheduleBrowser days={dstDays} eventTimeZone={timeZone} initialNowUtc="2026-11-01T08:00:00Z" />
    </>);
    const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("shows pending-only days without invented session times or an incorrect empty state", () => {
    const html = renderToStaticMarkup(<ScheduleBrowser days={days} eventTimeZone={timeZone} initialNowUtc="2026-11-05T20:00:00Z" />);
    expect(html).toContain("Timing to be confirmed");
    expect(html).toContain("<h2>10:00 AM</h2>");
    expect(html).toContain("<h3>Tennis</h3>");
    expect(html).toContain("<h2>12:00 PM</h2>");
    expect(html).toContain("<h3>High Tea</h3>");
    expect(html).not.toContain("end time to be confirmed");
    expect(html).not.toContain("Locations and access details to be confirmed");
    expect(html.match(/<article/g)).toHaveLength(2);
    expect(html).not.toContain('data-status="scheduled"');
    expect(html).not.toContain("No published sessions");
    expect(html).not.toContain("<input");
    expect(html).not.toContain("Jump to");
  });

  it("handles a fully empty program and an empty selected day", () => {
    const empty = renderToStaticMarkup(<ScheduleBrowser days={[]} eventTimeZone={timeZone} initialNowUtc="2026-11-03T20:00:00Z" />);
    expect(empty).toContain("The published schedule will appear here when available.");
    expect(empty).not.toContain('role="tab"');
    const emptyDay = [{ ...days[0]!, items: [], notes: [] }];
    expect(renderToStaticMarkup(<ScheduleBrowser days={emptyDay} eventTimeZone={timeZone} initialNowUtc="2026-11-03T20:00:00Z" />))
      .toContain("No published sessions for this day.");
  });

  it("shows location, never general access, and marks founders-only events explicitly", () => {
    const base = days[0]!.items[0]!;
    const item = { ...base, title: "Test session", locationName: "Test room", eligibilityScope: { id: "restricted", label: "Invitation required" } };
    const generated = `${item.title}. ${item.locationName}. ${item.eligibilityScope.label}.`;
    const renderItems = (items: ScheduleItem[]) => renderToStaticMarkup(<ScheduleBrowser
      days={[{ ...days[0]!, items }]}
      eventTimeZone={timeZone} initialNowUtc="2026-11-01T20:00:00Z"
    />);
    const boilerplate = renderItems([{ ...item, summary: generated }]);
    expect(boilerplate).not.toContain(generated);
    // Owner / Ryan (Sept 29): rooms are private on the public schedule (lib/room-privacy.ts).
    expect(boilerplate).not.toContain("Test room");
    expect(boilerplate).not.toContain("Invitation required");
    expect(boilerplate).not.toContain("Access");
    expect(boilerplate).not.toContain("Founders only");
    const custom = `${generated} Staff-approved arrival details.`;
    expect(renderItems([{ ...item, summary: custom }])).toContain(`<p>${custom}</p>`);
    const founders = renderItems([{ ...item, eligibilityScope: { id: "founders", label: "Founders" }, summary: "" }]);
    expect(founders).toContain("Founders only event");
    expect(founders).toContain("data-founders-only");
  });
});
