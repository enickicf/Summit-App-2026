import { describe, expect, it } from "vitest";
import { demoSnapshot } from "@not-alone/test-fixtures";
import { directoryPeople, people2025, people2026 } from "./people";
import { originalProducerCredits, producerCredits2026 } from "@not-alone/config";
import { personPortrait, personInitials } from "./person-portraits";

describe("website reviewed directory", () => {
  it("restricts producer listings to ICF's 2025 credits and the Sept 21 meeting's 2026 credits", () => {
    for (const [year, list] of [[2025, people2025], [2026, people2026]] as const) for (const person of list.filter(person => /producer/i.test(person.role) || person.categories.some(category => /producer/i.test(category)))) {
      const credit = (year === 2025 ? originalProducerCredits : producerCredits2026).find(credit => credit.name === person.name);
      expect(credit).toBeDefined();
      expect(person.role).toBe(credit?.role);
      expect(person.categories).toContain(credit?.category);
    }
    expect(people2025.filter(person => /producer/i.test(person.role))).toHaveLength(6);
    expect(people2026.some(person => person.name === "Dr. George Rapier III")).toBe(false);
  });
  it("does not infer roles from the collaborator's legacy roster", () => {
    expect(directoryPeople(demoSnapshot)).toEqual([]);
  });
  it("does not resurrect legacy names when the reviewed directory is empty or unavailable", () => {
    expect(directoryPeople(null)).toEqual([]);
    expect(directoryPeople({ ...demoSnapshot, event: { ...demoSnapshot.event, directoryEnabled: true }, speakers: [] })).toEqual([]);
  });
  it("uses stable identity and only staff-published roles and categories", () => {
    const speaker = { ...demoSnapshot.speakers[0]!, name: "Jewel", role: "Confirmed attendee", published: true };
    const people = directoryPeople({ ...demoSnapshot, event: { ...demoSnapshot.event, directoryEnabled: true }, speakers: [speaker] });
    expect(people[0]).toMatchObject({ name: speaker.name, slug: speaker.id, role: speaker.role, categories: ["Attendees"] });
  });
  it("requires both Airtable confirmation and staff publication, including for stale published guest records", () => {
    const base = { ...demoSnapshot.speakers[0]!, role: "Confirmed attendee", published: true };
    const snapshot = { ...demoSnapshot, event: { ...demoSnapshot.event, directoryEnabled: true }, speakers: [
      { ...base, name: "Steven Cohen" }, { ...base, name: "Alexandra Cohen" },
      { ...base, name: "Unconfirmed famous guest" }, { ...base, name: "Jewel", published: false },
      { ...base, name: "Daniel Gillison" }, { ...base, name: "Mike Tyson" }
    ] };
    // Only people confirmed in the latest Airtable review with no staff record are added;
    // the owner's website-only exclusions stay off every public directory.
    expect(directoryPeople(snapshot).map(person => person.name)).toEqual(["Daniel Gillison", "Ray Lewis", "Sarah Gilman", "Rahil Briggs", "Miriam Isa", "Silas Luke Jones", "Bishop Briggs"]);
    expect(directoryPeople(snapshot).map(person => person.name)).not.toContain("Mike Tyson");
    expect(directoryPeople({ ...snapshot, speakers: [...snapshot.speakers, { ...base, name: "Bishop Briggs", published: false }] }).map(person => person.name)).not.toContain("Bishop Briggs");
  });
  it("reuses matching source portraits without changing reviewed roles, and prefers published headshots", () => {
    const speaker = { ...demoSnapshot.speakers[0]!, name: "Daniel Gillison", role: "Confirmed attendee", published: true, headshotUrl: null };
    const snapshot = { ...demoSnapshot, event: { ...demoSnapshot.event, directoryEnabled: true }, speakers: [speaker] };
    expect(directoryPeople(snapshot)[0]).toMatchObject({ role: speaker.role, image: personPortrait("Daniel H. Gillison, Jr.") });
    expect(directoryPeople(snapshot)[0]?.image).toBe("/2026-headshots/portraits/daniel-gillison.jpg");
    // Without the Airtable overlay a published headshot still wins (the overlay path prefers the reviewed portrait).
    expect(directoryPeople({ ...snapshot, speakers: [{ ...speaker, headshotUrl: "https://example.com/headshot.jpg" }] })[0]?.image).toBe("https://example.com/headshot.jpg");
    expect(directoryPeople({ ...snapshot, speakers: [{ ...speaker, name: "Caroline Silby", headshotUrl: "https://example.com/headshot.jpg" }] })[0]?.image).toBe("https://example.com/headshot.jpg");
    expect(personPortrait("Not a matching guest")).toBeUndefined();
    expect(personInitials("Sanem (Sam) Alkan")).toBe("SA");
  });
  it("uses the reviewed 2026 Airtable portraits without copying expiring attachment URLs", () => {
    expect(personPortrait("Dr. Wendy Oliver-Pyatt")).toBe("/2026-headshots/portraits/wendy-oliver-pyatt-2.jpg");
    expect(personPortrait("Jon Hershfield")).toBe("/2026-headshots/portraits/jon-hershfield-2.jpg");
    expect(personPortrait("Steve Wozniak")).toBe("/2026-headshots/portraits/steve-wozniak-2-c.jpg");
    expect(personPortrait("Dr. Blaise Aguirre")).toBe("/2026-headshots/portraits/blaise-aguirre.jpg");
  });
});
