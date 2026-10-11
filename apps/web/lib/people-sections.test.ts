import { describe, expect, it } from "vitest";
import type { PersonCategory, SummitPerson } from "./people";
import { awardsLineupAdditions2026, isCompleteCard, peopleSections, summitLineup2026 } from "./people-sections";
import { airtableCategories, assignRanks, isPublicAirtablePerson, talentTier, type AirtablePerson } from "./airtable";

const person = (name: string, categories: PersonCategory[], extra: Partial<SummitPerson> & { image?: string | undefined } = {}): SummitPerson => {
  const { image, ...rest } = { image: `/p/${name}.jpg`, ...extra };
  return { name, slug: name.toLowerCase().replace(/\W+/g, "-"), categories, role: `${name} role`, bio: `${name} bio`, year: 2026, ...(image ? { image } : {}), ...rest };
};

// Sept 22 meeting: Top 12 (rank chip), then A, B, C, D, F talent, then Founders, then Attendees (Summit only).
const people = [
  person("Guest Person", ["Attendees"], { order: 1 }),
  person("Jewel", ["Founders", "Co-Chairs", "Executive Producers", "Musicians"], { featured: true, rank: 1, tier: "A", order: 10 }),
  person("F Musician", ["Talent"], { tier: "F", order: 2 }),
  person("A Musician", ["Talent"], { featured: true, tier: "A", order: 9 }),
  person("Expert Founder", ["Founders", "Experts"], { tier: "C", order: 3 }), // founder with a mid tier: Founders only
  person("Ray Lewis", ["Founders", "Athletes"], { rank: 4, tier: "A", order: 5 }),
  person("Steve Wozniak", ["Founders", "Co-Chairs"], { rank: 2, tier: "A", order: 6 }),
  person("Only Founder", ["Founders"], { order: 4 }),
  person("B Host", ["Hosts", "Talent"], { tier: "B", order: 5 }),
  person("Mike Majlak", ["Attendees"], { featured: true, rank: 8, tier: "A", order: 7 }),
  person("Nick Kislinger", ["Founders", "Talent"], { tier: "D", order: 19 }),
  person("Cherrial Odell", ["Co-Chairs"]),
  person("Only Producer", ["Producers"]),
  person("Untiered Expert", ["Experts"], { order: 8 }), // no tier chip: not in any section until the team assigns one
  person("Jewel", ["Musicians"]) // duplicate record: shown once
];
const names = (sections: ReturnType<typeof peopleSections>, title: string) => sections.find(section => section.title === title)?.people.map(entry => entry.person.name) ?? [];

describe("2026 people sections (Airtable-driven, Sept 22 meeting)", () => {
  it("Summit: Top 12 by rank, then A-F talent in tier then Airtable order, then Founders, then Attendees", () => {
    const sections = peopleSections(people);
    expect(sections.map(section => section.title)).toEqual(["Keynotes", "Speakers", "Founders", "Attendees"]);
    expect(names(sections, "Keynotes")).toEqual(["Jewel", "Steve Wozniak", "Ray Lewis", "Mike Majlak"]);
    expect(names(sections, "Speakers")).toEqual(["A Musician", "B Host", "F Musician"]); // A, B, F; founders with mid tiers are not here
    expect(names(sections, "Founders")).toEqual(["Jewel", "Steve Wozniak", "Nick Kislinger", "Expert Founder", "Only Founder"]); // Ryan's order (Oct 9), then Airtable order
    expect(names(sections, "Founders")).not.toContain("Ray Lewis"); // owner (Sept 22): not a founder, whatever Airtable says
    expect(names(sections, "Attendees")).toEqual(["Guest Person"]);
    for (const title of ["Keynotes", "Speakers", "Attendees"]) {
      expect(names(sections, title)).not.toContain("Cherrial Odell");
      expect(names(sections, title)).not.toContain("Only Producer");
      expect(names(sections, title)).not.toContain("Untiered Expert");
    }
    expect(sections.find(section => section.title === "Speakers")?.heading).toBe("2026 Lineup");
  });

  it("lists each person once; a headline founder (Top 12 or A Talent) is the only one who also appears in the lineup", () => {
    const sections = peopleSections(people);
    const counts = new Map<string, number>();
    for (const section of sections) for (const entry of section.people) counts.set(entry.person.name, (counts.get(entry.person.name) ?? 0) + 1);
    expect(counts.get("Jewel")).toBe(2); // rank 1 + founder
    expect(counts.get("Steve Wozniak")).toBe(2);
    expect(counts.get("Expert Founder")).toBe(1); // founder only
    expect(counts.get("Nick Kislinger")).toBe(1);
    expect(counts.get("A Musician")).toBe(1);
  });

  it("Awards: one lineup (Top 12 then A-F) without a heading, then Founders, never Attendees", () => {
    const sections = peopleSections(people, "awards");
    expect(sections.map(section => section.title)).toEqual(["Lineup", "Founders"]);
    expect(sections[0]!.heading).toBeNull();
    expect(names(sections, "Lineup")).toEqual(["Jewel", "Steve Wozniak", "Ray Lewis", "Mike Majlak", "A Musician", "B Host", "F Musician"]);
    expect(names(sections, "Founders")).toEqual(["Jewel", "Steve Wozniak", "Nick Kislinger", "Expert Founder", "Only Founder"]);
  });

  it("completeness gate: no title, photo or bio means no card (the McGraws have an Airtable photo since Sept 28, so no exception remains)", () => {
    const missing = [
      person("No Title", ["Talent"], { tier: "B", role: "" }),
      person("No Bio", ["Talent"], { tier: "B", bio: "  " }),
      person("No Photo", ["Founders"], { image: "" }),
      person("Jay & Erica McGraw", ["Founders"], { image: "/2026-headshots/portraits/jay-erica-mcgraw.jpg", order: 20 })
    ];
    for (const p of missing.slice(0, 3)) expect(isCompleteCard(p), p.name).toBe(false);
    expect(isCompleteCard(missing[3]!)).toBe(true);
    const sections = peopleSections([...people, ...missing]);
    const all = sections.flatMap(section => section.people.map(entry => entry.person.name));
    for (const name of ["No Title", "No Bio", "No Photo"]) expect(all).not.toContain(name);
    expect(names(sections, "Founders")).toContain("Jay & Erica McGraw");
  });

  it("Awards only: Daniel Gillison is a founder, not lineup; Wendy and Rahil are off the page; Summit unchanged", () => {
    const extra = [...people, person("Daniel Gillison", ["Founders", "Talent"], { tier: "C", order: 21 }), person("Wendy Oliver-Pyatt", ["Experts", "Talent"], { tier: "C", order: 22 }), person("Rahil Briggs", ["Talent"], { tier: "C", order: 23 })];
    const awards = peopleSections(extra, "awards");
    expect(names(awards, "Lineup")).not.toContain("Daniel Gillison");
    expect(names(awards, "Founders")).toContain("Daniel Gillison");
    for (const name of ["Wendy Oliver-Pyatt", "Rahil Briggs"]) for (const section of awards) expect(section.people.map(entry => entry.person.name)).not.toContain(name);
    const summit = peopleSections(extra, "summit");
    expect(names(summit, "Speakers")).toEqual(expect.arrayContaining(["Wendy Oliver-Pyatt", "Rahil Briggs"]));
    expect(names(summit, "Founders")).toContain("Daniel Gillison");
  });
});

describe("owner exception (Sept 24 / Oct 8): the Tape Art artists, Raquelle Stevens and Jessica Edwards sit in the Summit lineup, not under Attendees", () => {
  const roster = [
    person("Jewel", ["Talent"], { rank: 1, order: 1 }),
    person("Some Speaker", ["Talent"], { tier: "B", order: 2 }),
    person("Michael Townsend", ["Attendees"], { order: 3 }),
    person("Leah Smith", ["Attendees"], { order: 4 }),
    person("Nick Dana", ["Attendees"], { order: 5 }),
    person("Jessica Edwards", ["Attendees"], { order: 6, role: "CDO, NAMI" }),
    person("Raquelle Stevens", ["Attendees"], { order: 7, role: "Author/ Producer" })
  ];
  it("lists them at the end of the Summit lineup (after the tiers, Airtable order) and not under Attendees", () => {
    const sections = peopleSections(roster, "summit");
    expect(names(sections, "Speakers")).toEqual(["Some Speaker", "Michael Townsend", "Leah Smith", "Jessica Edwards", "Raquelle Stevens"]);
    expect(names(sections, "Attendees")).toEqual(["Nick Dana"]);
    expect(summitLineup2026).toEqual(new Set(["michael townsend", "leah smith", "raquelle stevens", "jessica edwards"]));
  });
  it("keeps their Airtable titles on the lineup card", () => {
    const speakers = peopleSections(roster, "summit").find(section => section.title === "Speakers")!.people;
    expect(speakers.find(entry => entry.person.name === "Raquelle Stevens")?.role).toBe("Author/ Producer");
    expect(speakers.find(entry => entry.person.name === "Jessica Edwards")?.role).toBe("CDO, NAMI");
  });
  it("leaves the Awards lineup unchanged (no tier means not a celebrity)", () => {
    expect(names(peopleSections(roster, "awards"), "Lineup")).toEqual(["Jewel", "Some Speaker"]);
  });
  it("still needs a complete card (title, photo, bio): the exception never bypasses the gate", () => {
    const noPhoto = roster.map(p => p.name === "Raquelle Stevens" ? person("Raquelle Stevens", ["Attendees"], { order: 7, image: "" }) : p);
    expect(names(peopleSections(noPhoto, "summit"), "Speakers")).not.toContain("Raquelle Stevens");
  });
});

describe("owner exception (Ryan, Oct 8): Ben Maxwell is in the Awards lineup as well, once his card is complete", () => {
  const roster = [
    person("Jewel", ["Talent"], { rank: 1, order: 1 }),
    person("Some Speaker", ["Talent"], { tier: "B", order: 2 }),
    person("Ben Maxwell", ["Experts"], { order: 3 }) // no tier chip: an expert the Summit lists only once a tier is set
  ];
  it("lists him at the end of the Awards lineup even without a tier chip, with his photo", () => {
    expect(awardsLineupAdditions2026).toEqual(new Set(["ben maxwell"]));
    expect(names(peopleSections(roster, "awards"), "Lineup")).toEqual(["Jewel", "Some Speaker", "Ben Maxwell"]);
  });
  it("keeps his tier order when Airtable gives him one (D-talent today)", () => {
    const tiered = roster.map(p => p.name === "Ben Maxwell" ? person("Ben Maxwell", ["Talent"], { tier: "D", order: 3 }) : p);
    expect(names(peopleSections([...tiered, person("F Talent", ["Talent"], { tier: "F", order: 4 })], "awards"), "Lineup")).toEqual(["Jewel", "Some Speaker", "Ben Maxwell", "F Talent"]);
    expect(names(peopleSections(tiered, "summit"), "Speakers")).toEqual(["Some Speaker", "Ben Maxwell"]);
  });
  it("waits for a photo: the completeness gate still applies", () => {
    const noPhoto = roster.map(p => p.name === "Ben Maxwell" ? person("Ben Maxwell", ["Experts"], { order: 3, image: "" }) : p);
    expect(names(peopleSections(noPhoto, "awards"), "Lineup")).toEqual(["Jewel", "Some Speaker"]);
  });
  it("does not change the Summit page (Airtable alone decides there)", () => {
    expect(names(peopleSections(roster, "summit"), "Speakers")).toEqual(["Some Speaker"]);
    expect(peopleSections(roster, "summit").flatMap(section => section.people.map(entry => entry.person.name))).not.toContain("Ben Maxwell");
  });
});

describe("Airtable Website Grouping rules", () => {
  const record = (name: string, groups: string[], status = "Confirmed Attendance"): AirtablePerson =>
    ({ recordId: `rec${name.replace(/\W/g, "")}`, name, status, groups, occupation: "", organization: "", title: "T", bio: "B", hasHeadshot: true });

  it("reads the tier from the talent chips and maps X - attendee / Philanthropist", () => {
    expect(talentTier(["Summit Host", "A-Talent", "7"])).toBe("A");
    expect(talentTier(["B - talent"])).toBe("B");
    expect(talentTier(["Expert", "C - talent"])).toBe("C");
    expect(talentTier(["D - talent"])).toBe("D");
    expect(talentTier(["F - talent"])).toBe("F");
    expect(talentTier(["Expert"])).toBeNull();
    expect(airtableCategories(["X - attendee"])).toEqual(["Attendees"]);
    expect(airtableCategories(["Philanthropist", "X - attendee"])).toEqual(["Philanthropists", "Attendees"]); // a philanthropist can still be an attendee
    expect(airtableCategories(["Producer", "X - attendee"])).toEqual(["Producers"]); // someone with a role is not also an attendee
    expect(airtableCategories(["Founder", "Philanthropist", "D - talent"])).toEqual(["Founders", "Philanthropists", "Talent"]);
  });

  it("Top 12: chips 1-10 in order; people sharing 10 become 10, 11, 12 in Airtable order", () => {
    const list = [record("Ten A", ["A-Talent", "10"]), record("One", ["A-Talent", "1"]), record("Ten B", ["A-Talent", "10"]), record("Three", ["3"]), record("None", ["B - talent"]), record("Ten C", ["10"])];
    const ranks = assignRanks(list);
    expect([...ranks.entries()].map(([person, rank]) => [person.name, rank])).toEqual([["One", 1], ["Three", 2], ["Ten A", 3], ["Ten B", 4], ["Ten C", 5]]);
    expect(ranks.has(list[4]!)).toBe(false);
  });

  it("founders are listed whatever their status; everyone else needs a confirmed status", () => {
    expect(isPublicAirtablePerson(record("Declined Founder", ["Founder"], "Declined"))).toBe(true);
    expect(isPublicAirtablePerson(record("Hold Founder", ["Founder"], "Hold Space - 75%"))).toBe(true);
    expect(isPublicAirtablePerson(record("Pending Talent", ["B - talent"], "Pending"))).toBe(false);
    expect(isPublicAirtablePerson(record("Invited Attendee", ["X - attendee"], "Invited"))).toBe(false);
    expect(isPublicAirtablePerson(record("Confirmed Talent", ["B - talent"]))).toBe(true);
    expect(isPublicAirtablePerson(record("Staff", ["Staff"]))).toBe(false);
  });
});

describe("Founders order (Ryan, Oct 9 meeting)", () => {
  it("follows Ryan's list, keeps unnamed founders in Airtable order after it and puts Ryan Wolfington last", async () => {
    const { founderOrder2026 } = await import("./people-sections");
    const mk = (name: string) => ({ name } as unknown as import("./people").SummitPerson);
    const input = ["Ryan Wolfington", "Bob Bryan", "Jen Smorgon", "Kimbal Musk", "Mike Bryan", "Jennifer Donnelly", "Sean and Ana Wolfington", "Winston and Cameron Kelly", "Melinda and Noah Springer", "Ellie Kanner", "Daniel Gillison", "Erica McGraw", "Jay McGraw", "Logan Paul", "Miriam Isa", "Jeneva Bell", "Sheri Sobrato", "Melony and Adam Lewis", "Nick Kislinger", "Janet Wozniak", "Steve Wozniak", "Jewel", "Christiana Musk", "Steven and Alexandra Cohen"];
    expect(founderOrder2026(input.map(mk)).map(p => p.name)).toEqual([
      "Steven and Alexandra Cohen", "Jewel", "Steve Wozniak", "Janet Wozniak", "Nick Kislinger", "Melony and Adam Lewis", "Sheri Sobrato",
      "Jeneva Bell", "Miriam Isa", "Logan Paul", "Jay McGraw", "Erica McGraw", "Daniel Gillison", "Ellie Kanner", "Melinda and Noah Springer",
      "Winston and Cameron Kelly", "Christiana Musk", "Kimbal Musk", "Mike Bryan", "Bob Bryan", "Sean and Ana Wolfington", "Jen Smorgon", "Jennifer Donnelly", "Ryan Wolfington"
    ]);
  });
});
