import { describe, expect, it } from "vitest";
import { event2026Snapshot } from "@not-alone/test-fixtures/event-2026";
import { createAttendeeConciergeAnswer } from "./attendee-concierge";

const answer = (question: string, snapshot = event2026Snapshot) => createAttendeeConciergeAnswer({
  question, snapshot, nowUtc: "2026-09-16T20:00:00.000Z"
});

describe("shared online/offline 2026 concierge", () => {
  it("reads current dates, venue, and the foundation from the published snapshot", () => {
    expect(answer("What is the summit?").body).toContain("November 1 & 5");
    const updated = structuredClone(event2026Snapshot);
    updated.event.dateLabel = "Updated event dates";
    updated.event.venueName = "Updated venue";
    updated.contentPages.find(page => page.slug === "inspiring-children-foundation")!.body = "Approved foundation description";
    expect(answer("What is the summit?", updated).body).toContain("Updated event dates");
    expect(answer("What is the summit?", updated).body).toContain("Updated venue");
    expect(answer("What is ICF?", updated).body).toBe("Approved foundation description");
  });

  it.each(["Steve Wozniak", "Jason Kennedy", "Loni Love", "Mike Tyson", "DMC"])("does not assign old roles or times to %s", name => {
    const result = answer(`When is ${name} appearing?`);
    expect(result.body).toContain("confirmed 2026 guest");
    expect(result.body).toContain("attendance does not confirm a speaking slot");
    expect(result.body).not.toMatch(/co-chair|host|8:00|7:00/i);
    expect(result.items).toEqual([]);
  });

  it("does not resurrect historical performers or sponsors", () => {
    expect(answer("When is Rachel Platten appearing?").body).toContain("not confirmed");
    const sponsors = answer("Is Villa Bibbiani a sponsor?");
    expect(sponsors.body).toContain("Steven & Alexandra Cohen Foundation");
    expect(sponsors.body).not.toContain("Villa Bibbiani");
  });

  it.each([
    ["Where is poker?", "Molly's Game Poker Night", "Margaux"],
    ["When is the sponsor and talent dinner?", "Mike's Bikes Sponsor and Talent Dinner", "Margaux"]
  ])("prioritizes the requested activity over generic intent: %s", (question, title, locationName) => {
    const result = answer(question!);
    expect(result.title).toBe("Published program details");
    expect(result.items).toEqual([expect.objectContaining({ title, locationName })]);
    expect(result.body).not.toContain("Powered by:");
    expect(result.body).not.toContain("Mike's Bikes Community Ride");
  });

  it("keeps sponsor-only questions, show-role questions, and generic next-session guidance distinct", () => {
    expect(answer("Who sponsors the awards?").title).toBe("Published event partners");
    expect(answer("Who is performing at the awards?").title).toBe("Show roles require separate confirmation");
    expect(answer("Where should I go next?").items[0]?.title).toBe("Mike's Bikes Community Ride");
  });

  it.each(["unpublished", "private", "foreign"])("excludes %s records when matching an activity", state => {
    const updated = structuredClone(event2026Snapshot);
    const item = updated.scheduleItems.find(item => item.title === "Molly's Game Poker Night")!;
    if (state === "unpublished") item.published = false;
    if (state === "private") item.visibilityScope.id = "staff";
    if (state === "foreign") item.eventId = "other-event";
    const result = answer("Where is poker?", updated);
    expect(result.items).toEqual([]);
    expect(result.body).toContain("No matching activity has been published");
  });

  it("does not invent check-in, meditation, Community Day, or a closing concert", () => {
    expect(answer("Where do I check in?").items).toEqual([]);
    expect(answer("Where do I check in?").body).toContain("have not been published");
    expect(answer("Quiet reset options").body).not.toMatch(/meditation|stretching|breathwork/);
    const community = answer("Community Day");
    expect(community.items.map(item => item.title)).toEqual(["Mike's Bikes Community Ride", "Wellness and Community Programming"]);
    expect(community.body).not.toMatch(/life-plan|DBT|closing/);
    expect(answer("What concerts are there?").items.map(item => item.title)).toEqual(["Evening Talk and Performance"]);
  });

  it("keeps uncertain times available without making up an end time", () => {
    for (const question of ["When is tennis?", "What happens Thursday?"]) {
      const result = answer(question);
      expect(result.body).toContain("10:00 AM; end time to be confirmed");
      expect(result.items).toEqual([]);
    }
  });

  it("uses linked speaker IDs and current schedule revisions", () => {
    const updated = structuredClone(event2026Snapshot);
    const speaker = updated.speakers.find(person => person.name === "Mike Tyson")!;
    const session = updated.scheduleItems[0]!;
    session.title = "Newly published conversation";
    session.speakerIds = [speaker.id];
    expect(answer("When is Mike Tyson appearing?", updated).items[0]?.title).toBe(session.title);
  });

  it("requires a speakerId assignment, not a name mentioned in published session text", () => {
    const updated = structuredClone(event2026Snapshot);
    updated.scheduleItems[0]!.title = "Jewel retrospective";
    updated.scheduleItems[0]!.description = "Discussion of Jewel's work; no appearance assignment.";
    const result = answer("When is Jewel appearing?", updated);
    expect(result.items).toEqual([]);
    expect(result.body).toContain("attendance does not confirm a speaking slot");
  });

  it("resolves a known person alias to their explicit speakerId assignment", () => {
    const updated = structuredClone(event2026Snapshot);
    const person = updated.speakers.find(person => person.name === "Darryl McDaniels (DMC)")!;
    updated.scheduleItems[0]!.speakerIds = [person.id];
    expect(answer("When is DMC appearing?", updated).items.map(item => item.id)).toEqual([updated.scheduleItems[0]!.id]);
  });

  it.each(["unpublished", "private", "foreign"])("does not expose a linked %s appearance", state => {
    const updated = structuredClone(event2026Snapshot);
    const item = updated.scheduleItems[0]!;
    item.speakerIds = [updated.speakers.find(person => person.name === "Jewel")!.id];
    if (state === "unpublished") item.published = false;
    if (state === "private") item.visibilityScope.id = "staff";
    if (state === "foreign") item.eventId = "other-event";
    expect(answer("When is Jewel appearing?", updated).items).toEqual([]);
  });

  it.each(["unpublished", "foreign", "disabled"])("does not resolve an appearance through an unavailable person: %s", state => {
    const updated = structuredClone(event2026Snapshot);
    const person = updated.speakers.find(person => person.name === "Jewel")!;
    updated.scheduleItems[0]!.speakerIds = [person.id];
    if (state === "unpublished") person.published = false;
    if (state === "foreign") person.eventId = "other-event";
    if (state === "disabled") updated.event.directoryEnabled = false;
    expect(answer("When is Jewel appearing?", updated).items).toEqual([]);
  });

  it("does not fall back to the first old session after the event", () => {
    const result = createAttendeeConciergeAnswer({ question: "What is happening now?", snapshot: event2026Snapshot, nowUtc: "2026-11-10T20:00:00.000Z" });
    expect(result.items).toEqual([]);
    expect(result.body).toContain("no upcoming");
  });

  it("does not expose staff-only or unpublished activities in wayfinding", () => {
    const updated = structuredClone(event2026Snapshot);
    for (const session of updated.scheduleItems) {
      session.published = false;
      session.visibilityScope.id = "staff";
    }
    expect(answer("Where is Margaux?", updated).items).toEqual([]);
  });

  it("does not confuse a partial word with a person or their appearance", () => {
    expect(answer("Is jewelry allowed at the concert?").title).toBe("Published program details");
    const updated = structuredClone(event2026Snapshot);
    updated.scheduleItems[0]!.title = "Jewelry workshop";
    expect(answer("When is Jewel appearing?", updated).items).toEqual([]);
  });

  it("does not confuse know with now or a show role with attendance", () => {
    expect(answer("Do you know the awards time?").title).toBe("Published program details");
    expect(answer("Do you know the awards time?").items.some(item => item.title === "Awards Show")).toBe(true);
    expect(answer("Who is performing at the awards?").body).toContain("does not establish performers");
    expect(answer("Who is performing at the awards?").body).not.toContain("Jewel,");
  });

  it("gives canonical cancellation precedence over an old incomplete-time note", () => {
    const updated = structuredClone(event2026Snapshot);
    const item = { ...updated.scheduleItems[0]!, title: "Doors Open", shortTitle: "Doors Open", startUtc: "2026-11-03T02:30:00.000Z", endUtc: "2026-11-03T03:00:00.000Z", status: "canceled" as const };
    updated.scheduleItems.push(item);
    const result = answer("When do doors open?", updated);
    expect(result.body).toContain("Canceled activities will not take place");
    expect(result.body).not.toContain("end time to be confirmed");
    expect(result.items[0]?.title).toBe("Doors Open (canceled)");
    expect(answer("What happens Monday?", updated).body).not.toContain("Doors Open: 6:30 PM");
  });

  it("labels a canceled named appearance instead of affirming that it will happen", () => {
    const updated = structuredClone(event2026Snapshot);
    updated.scheduleItems[0]!.speakerIds = [updated.speakers.find(person => person.name === "Mike Tyson")!.id];
    updated.scheduleItems[0]!.status = "canceled";
    const result = answer("When is Mike Tyson appearing?", updated);
    expect(result.body).toContain("Canceled appearances will not take place");
    expect(result.body).not.toContain("appears in");
    expect(result.items[0]?.title).toContain("(canceled)");
  });

  it("keeps pending-day guidance when no fully timed sessions remain", () => {
    const result = createAttendeeConciergeAnswer({ question: "What is next?", snapshot: event2026Snapshot, nowUtc: "2026-11-05T18:00:00.000Z" });
    expect(result.body).toContain("unconfirmed timing remain for Thursday, November 5");
    expect(result.items).toEqual([]);
  });

  it("excludes foreign-event records and honors a disabled directory", () => {
    const updated = structuredClone(event2026Snapshot);
    updated.scheduleItems.forEach(item => { item.eventId = "other-event"; });
    updated.event.directoryEnabled = false;
    expect(answer("What is next?", updated).items).toEqual([]);
    expect(answer("Who is attending?", updated).body).toContain("No 2026 guests");
  });
});
