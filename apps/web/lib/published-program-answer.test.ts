import { describe, expect, it } from "vitest";
import { event2026Snapshot } from "@not-alone/test-fixtures/event-2026";
import { publishedProgramAnswer } from "./published-program-answer";

const now = "2026-09-16T20:00:00.000Z";

describe("published website program answers", () => {
  it("answers a generic schedule question without substituting an event description", () => {
    expect(publishedProgramAnswer("What is the schedule?", event2026Snapshot, now)).toContain("Mike's Bikes Community Ride");
    expect(publishedProgramAnswer("What is the schedule?", event2026Snapshot, now)).toContain("first eight");
  });

  it("answers a requested date with only that day's public events", () => {
    const answer = publishedProgramAnswer("What is the schedule for November 3?", event2026Snapshot, now)!;
    expect(answer).toContain("November 3, 2026");
    expect(answer).not.toContain("November 1,");
    expect(answer).not.toContain("November 2,");
  });

  it("keeps incomplete times and unsupported questions distinct", () => {
    expect(publishedProgramAnswer("When is tennis?", event2026Snapshot, now)).toContain("end time to be confirmed");
    expect(publishedProgramAnswer("Is jewelry allowed?", event2026Snapshot, now)).toBeNull();
  });

  it("includes cancellation, event dates, published locations, and overnight end dates", () => {
    const snapshot = structuredClone(event2026Snapshot);
    const show = snapshot.scheduleItems.find(item => item.title === "Awards Show")!;
    show.status = "canceled";
    expect(publishedProgramAnswer("When are the awards?", snapshot, now)).toContain("Awards Show (canceled)");
    const poker = publishedProgramAnswer("When is poker?", snapshot, now);
    expect(poker).toContain("Sunday, November 1, 2026");
    expect(poker).toContain("Nov 2, 2026, 12:00 AM PST");
    expect(poker).toContain("Location: Margaux");
    expect(poker).toContain("Timings and program subject to change.");
  });

  it("includes attire after location when the published item provides it", () => {
    const snapshot = structuredClone(event2026Snapshot);
    const show = snapshot.scheduleItems.find(item => item.title === "Awards Show")! as typeof snapshot.scheduleItems[number] & { attire?: string };
    show.attire = "Formal or semi-formal, with flair";
    const answer = publishedProgramAnswer("What is the dress code for the Awards Show, and what time does it start?", snapshot, now)!;
    expect(answer).toContain("Location:");
    expect(answer).toContain("Attire: Formal or semi-formal, with flair");
    expect(answer.indexOf("Location:")).toBeLessThan(answer.indexOf("Attire:"));
  });

  it("does not present hidden or unpublished activities or past activities as next", () => {
    const snapshot = structuredClone(event2026Snapshot);
    snapshot.scheduleItems.forEach(item => { item.published = false; });
    expect(publishedProgramAnswer("What is the schedule?", snapshot, now)).not.toContain("Mike's Bikes");
    expect(publishedProgramAnswer("What is next?", event2026Snapshot, "2026-11-10T20:00:00.000Z")).toContain("No upcoming");
  });

  it("keeps show roles separate from attendance and matches whole-word intent", () => {
    const roleAnswer = publishedProgramAnswer("Who is performing at the awards?", event2026Snapshot, now)!;
    expect(roleAnswer).toContain("does not establish performers");
    expect(roleAnswer).not.toContain("Mike Tyson");
    const timing = publishedProgramAnswer("Do you know the awards time?", event2026Snapshot, now)!;
    expect(timing).toContain("Awards Show");
    expect(timing).not.toContain("Mike's Bikes");
  });
});
