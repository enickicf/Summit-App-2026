import { describe, expect, it } from "vitest";
import { applyProducerCreditRules, isHiddenProducerCredit, ownerProducerCredits2026, producerCreditsHidden2026, sortProducerCredits, surnameOf } from "./producer-credits-2026";

// Ryan Wolfington, Oct 8, 2026: Raquelle Stevens is a producer (and still a speaker), Ryan is off the credits,
// and the credits read in alphabetical order.
describe("producer credits (Ryan, Oct 8)", () => {
  it("adds Raquelle Stevens to the Producers group as an owner addition", () => {
    expect(ownerProducerCredits2026).toEqual([{ name: "Raquelle Stevens", group: "Producers" }]);
  });

  it("hides Ryan Wolfington from the producer credits only (the set can be emptied to put him back)", () => {
    expect(producerCreditsHidden2026).toEqual(new Set(["ryan wolfington"]));
    expect(isHiddenProducerCredit("Ryan Wolfington")).toBe(true);
    expect(isHiddenProducerCredit("  ryan WOLFINGTON ")).toBe(true);
    expect(isHiddenProducerCredit("Isabella Wolfington")).toBe(false);
    expect(isHiddenProducerCredit("Jewel")).toBe(false);
  });

  it("reads the surname as the last word, ignoring suffixes, parentheticals and a couple's first names", () => {
    expect(surnameOf("Trent Alenik")).toBe("alenik");
    expect(surnameOf("Will Elmore Jr.")).toBe("elmore");
    expect(surnameOf("Dr. George Rapier III")).toBe("rapier");
    expect(surnameOf("Darryl McDaniels (DMC)")).toBe("mcdaniels");
    expect(surnameOf("Seth Porter Winterton")).toBe("winterton");
    expect(surnameOf("Jewel")).toBe("jewel");
    expect(surnameOf("Sean and Ana Wolfington")).toBe("wolfington");
    expect(surnameOf("Jay & Erica McGraw")).toBe("mcgraw");
    expect(surnameOf("Steven Cohen & Alexandra Cohen")).toBe("cohen");
    expect(surnameOf("Melony Lewis and Adam Smith")).toBe("lewis"); // the first person's surname
  });

  it("sorts alphabetically by surname, case-insensitively, and keeps ties in their incoming order", () => {
    const people = [
      { name: "Trevor Short" }, { name: "Jan Thwaites" }, { name: "Sally Dewhurst" }, { name: "Sophie Novak" },
      { name: "Paige Neuenschwander" }, { name: "Trent Alenik" }, { name: "Deb Cullen" }, { name: "Raquelle Stevens" },
      { name: "Will Elmore Jr." }, { name: "Max Novak" }, { name: "jewel" }
    ];
    expect(sortProducerCredits(people).map(person => person.name)).toEqual([
      "Trent Alenik", "Deb Cullen", "Sally Dewhurst", "Will Elmore Jr.", "jewel", "Paige Neuenschwander", "Sophie Novak", "Max Novak",
      "Trevor Short", "Raquelle Stevens", "Jan Thwaites"
    ]);
    expect(sortProducerCredits([{ name: "Ryan Wolfington" }, { name: "Isabella Wolfington" }]).map(person => person.name)).toEqual(["Ryan Wolfington", "Isabella Wolfington"]); // stable
    const untouched = [{ name: "B" }, { name: "A" }];
    sortProducerCredits(untouched);
    expect(untouched.map(person => person.name)).toEqual(["B", "A"]); // never sorts in place
  });

  const groups = [
    { title: "Executive Producers", photos: true, people: [{ name: "Ryan Wolfington", role: "Founder", image: "/r.jpg" }, { name: "Jewel", role: "Singer", image: "/j.jpg" }, { name: "Aphrah Brokaw", role: "COO", image: "/a.jpg" }] },
    { title: "Producers", photos: false, people: [{ name: "Trent Alenik", role: "CEO" }, { name: "Jan Thwaites", role: "Co-Founder" }, { name: "Deb Cullen", role: "Producer" }] },
    { title: "Co-Producers", photos: false, people: [] },
    { title: "Associate Producers", photos: false, people: [{ name: "Seth Porter Winterton", role: "Musical Director" }, { name: "Casey Caruso", role: "Event producer" }] }
  ];
  const live = new Map([
    ["raquelle stevens", { title: "Author/ Producer", occupation: "Podcast host" }],
    ["ryan wolfington", { title: "Founder, Inspiring Children Foundation and Not Alone", occupation: "" }]
  ]);

  it("with Airtable as the source: merges Raquelle into Producers with her Airtable title, drops Ryan, sorts each group", () => {
    const credited = applyProducerCreditRules(groups, live);
    expect(credited.map(group => group.title)).toEqual(["Executive Producers", "Producers", "Co-Producers", "Associate Producers"]);
    expect(credited[0]).toEqual({ title: "Executive Producers", photos: true, people: [{ name: "Aphrah Brokaw", role: "COO", image: "/a.jpg" }, { name: "Jewel", role: "Singer", image: "/j.jpg" }] });
    expect(credited[1]!.people).toEqual([{ name: "Trent Alenik", role: "CEO" }, { name: "Deb Cullen", role: "Producer" }, { name: "Raquelle Stevens", role: "Author/ Producer" }, { name: "Jan Thwaites", role: "Co-Founder" }]);
    expect(credited[1]!.people.find(person => person.name === "Raquelle Stevens")).not.toHaveProperty("image"); // a name card
    expect(credited[2]!.people).toEqual([]);
    expect(credited[3]!.people.map(person => person.name)).toEqual(["Casey Caruso", "Seth Porter Winterton"]);
    expect(groups[0]!.people.map(person => person.name)).toEqual(["Ryan Wolfington", "Jewel", "Aphrah Brokaw"]); // input untouched
  });

  it("does not add Raquelle twice once Airtable credits her itself, and skips her when her record is not listed", () => {
    const already = groups.map(group => group.title === "Producers" ? { ...group, people: [...group.people, { name: "Raquelle Stevens", role: "Author/ Producer" }] } : group);
    expect(applyProducerCreditRules(already, live)[1]!.people.filter(person => person.name === "Raquelle Stevens")).toHaveLength(1);
    expect(applyProducerCreditRules(groups, new Map())[1]!.people.map(person => person.name)).toEqual(["Trent Alenik", "Deb Cullen", "Jan Thwaites"]);
  });

  it("without Airtable (the Sept 21 credits): no addition, but Ryan is still off and the order is alphabetical", () => {
    const fallback = [
      { title: "Producers", photos: false, people: [{ name: "Jewel", role: "Producer" }, { name: "Ryan Wolfington", role: "Producer" }, { name: "Aphrah Brokaw", role: "Producer" }] },
      { title: "Executive Producers", photos: true, people: [{ name: "Trevor Short", role: "Executive Producer", image: "/t.jpg" }, { name: "Trent Alenik", role: "Executive Producer", image: "/ta.jpg" }] }
    ];
    const credited = applyProducerCreditRules(fallback, null);
    expect(credited[0]!.people.map(person => person.name)).toEqual(["Aphrah Brokaw", "Jewel"]);
    expect(credited[1]!.people.map(person => person.name)).toEqual(["Trent Alenik", "Trevor Short"]);
  });
});
