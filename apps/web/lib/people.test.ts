import { describe, expect, it } from "vitest";
import { demoSnapshot } from "@not-alone/test-fixtures";
import { directoryPeople, people2025, people2026 } from "./people";
import { originalProducerCredits, producerCredits2026 } from "@not-alone/config";
import { personPortrait, personInitials } from "./person-portraits";
import { airtableHeadshotCrops } from "./airtable-headshot-crops";

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
      { ...base, name: "Daniel Gillison" }, { ...base, name: "Mike Tyson" }, { ...base, name: "Bryan Hubbard" }
    ] };
    // Only people confirmed in the latest Airtable review with no staff record are added;
    // the owner's website-only exclusions stay off every public directory.
    expect(directoryPeople(snapshot).map(person => person.name)).toEqual(["Daniel Gillison", "Ray Lewis", "Sarah Gilman", "Rahil Briggs", "Miriam Isa", "Silas Luke Jones", "Bishop Briggs"]);
    expect(directoryPeople(snapshot).map(person => person.name)).not.toContain("Mike Tyson");
    expect(directoryPeople(snapshot).map(person => person.name)).not.toContain("Bryan Hubbard");
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
    expect(personPortrait("Dr. Wendy Oliver-Pyatt")).toBe("/2026-headshots/portraits/wendy-oliver-pyatt-framed-20261026.jpg");
    expect(personPortrait("Jon Hershfield")).toBe("/2026-headshots/portraits/jon-hershfield-2.jpg");
    expect(personPortrait("Steve Wozniak")).toBe("/2026-headshots/portraits/steve-wozniak-2-c.jpg");
    expect(personPortrait("Dr. Blaise Aguirre")).toBe("/2026-headshots/portraits/blaise-aguirre-harvard-20261026.jpg");
  });
  it("uses the Oct 26 full-frame portrait refresh for every requested guest", () => {
    const refreshed = [
      "Loni Love", "Jason Kennedy", "Anthony Ramos", "Lia Shelesh", "Lexi Hensler", "Atz Kilcher",
      "Forest Blakk", "Marc Brackett", "Paul Dalio", "Sarah Gilman", "Wendy Oliver-Pyatt", "Rahil Briggs",
      "Blaise Aguirre", "Tasha Rasolkhani-Kalhorn", "Beth Kojima", "Jennifer Karson-Strauss", "Sarah Steil",
      "Nicole Kalhorn", "Jeff Levin", "Leah Smith", "Jessica Edwards", "Kate Flannery", "Dylan Aguilar",
      "Elisa Sednaoui", "Princess Love", "Jessica Ladd", "Yoli Mayor", "Alexander Roque", "Ross Rocketto",
      "Anna Muller", "Jhone Ebert", "Douglas McKenzie", "Cameron Muller", "Nick Dana", "Angie McPhaul",
      "DMC DJ", "Franco Pascali", "Janet Wozniak", "Jay McGraw", "Sean Wolfington", "Winston Kelly",
      "Theresa Magnus", "Erik Blamoville", "Alexa Price", "Basak Kizilisik", "Julie Catineau", "Rohan Thakkar",
      "Taylor Perry", "Allison Elbl", "Andrew Diehl"
    ];
    for (const name of refreshed) expect(personPortrait(name), name).toMatch(/-20261026\.(?:jpg|png)$/);
  });
  it("uses the second Oct 26 portrait refresh and never assigns Lauren Ann's face to Joanna Howard", () => {
    const refreshed = ["Karen Niemi", "Christina Steil", "Maryn Pierce", "Gabriella Viveros", "Dalaura Kader", "Lauren Ann"];
    for (const name of refreshed) expect(personPortrait(name), name).toMatch(/-framed-20261026\.jpg$/);
    expect(personPortrait("Joanna Howard")).toBeUndefined();
    expect(personPortrait("Lauren Ann")).toBe("/2026-headshots/portraits/lauren-ann-framed-20261026.jpg");
    for (const record of ["recHUe7yCx96KjyX2", "recscpFoAZnCCcFIS", "recdgfoWNeqCQf0iU", "reclRFyb7EOWg9fYQ", "recnirvb72mepu9zE", "recSFlPwhOVKxnUW0"]) {
      expect(airtableHeadshotCrops[record]?.file, record).toMatch(/-framed-20261026\.jpg$/);
    }
    expect(airtableHeadshotCrops.rech2Y2rToKGdcvuR).toEqual({ bytes: null, file: null });
  });
});
