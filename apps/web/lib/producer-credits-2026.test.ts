import { describe, expect, it } from "vitest";
import { applyProducerCreditRules, isHiddenProducerCredit, ownerProducerCredits2026, producerCreditsHidden2026, sortProducerCredits, surnameOf } from "./producer-credits-2026";

// Ryan Wolfington, Oct 8, 2026: Raquelle Stevens is a producer (and still a speaker), Ryan is off the credits,
// and the credits read in alphabetical order.
describe("producer credits (Ryan, Oct 8)", () => {
  it("adds Raquelle Stevens to the Producers group as an owner addition", () => {
    expect(ownerProducerCredits2026).toEqual([{ name: "Raquelle Stevens", group: "Producers" }]);
  });

  it("hides nobody now: Ryan asked on Oct 9 to be the third Executive Producer", () => {
    expect(producerCreditsHidden2026.size).toBe(0);
    expect(isHiddenProducerCredit("Ryan Wolfington")).toBe(false);
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

  it("with Airtable as the source: Ryan's Oct 9 groups and order, Raquelle merged into Producers", () => {
    const credited = applyProducerCreditRules(groups, live);
    expect(credited.map(group => group.title)).toEqual(["Executive Producers", "Producers", "Co-Producers", "Associate Producers"]);
    // Trevor (when present) first, Trent moved up from Producers second, Ryan third, then the others by surname.
    expect(credited[0]!.people.map(person => person.name)).toEqual(["Trent Alenik", "Ryan Wolfington", "Aphrah Brokaw", "Jewel"]);
    expect(credited[1]!.people.map(person => person.name)).toEqual(["Raquelle Stevens", "Deb Cullen", "Jan Thwaites"]);
    expect(credited[1]!.people.find(person => person.name === "Raquelle Stevens")).not.toHaveProperty("image"); // a name card
    expect(credited[3]!.people.map(person => person.name)).toEqual(["Casey Caruso", "Seth Porter Winterton"]);
    expect(groups[0]!.people.map(person => person.name)).toEqual(["Ryan Wolfington", "Jewel", "Aphrah Brokaw"]); // input untouched
  });

  it("orders every group as Ryan dictated, then the rest by surname", () => {
    const full = [
      { title: "Executive Producers", photos: true, people: ["Jewel", "Aphrah Brokaw", "Ryan Wolfington"].map(name => ({ name, role: "" })) },
      { title: "Producers", photos: false, people: ["Trevor Short", "Trent Alenik", "Jan Thwaites", "Raquelle Stevens", "Paige Neuenschwander", "Sophie Novak", "Sally Dewhurst", "Deb Cullen"].map(name => ({ name, role: "" })) },
      { title: "Associate Producers", photos: false, people: ["Will Elmore Jr.", "Ricky Sypert", "Cherrial Odell", "Clark Cummings", "Isabella Wolfington", "Nick Ekern", "Casey Caruso", "Bianca Mok", "Payton McDonald"].map(name => ({ name, role: "" })) }
    ];
    const credited = applyProducerCreditRules(full, new Map());
    expect(credited[0]!.people.map(person => person.name)).toEqual(["Trevor Short", "Trent Alenik", "Ryan Wolfington", "Aphrah Brokaw", "Jewel"]);
    expect(credited[1]!.people.map(person => person.name)).toEqual(["Sally Dewhurst", "Sophie Novak", "Paige Neuenschwander", "Raquelle Stevens", "Deb Cullen", "Jan Thwaites"]);
    expect(credited[2]!.people.map(person => person.name)).toEqual(["Casey Caruso", "Nick Ekern", "Clark Cummings", "Cherrial Odell", "Ricky Sypert", "Will Elmore Jr.", "Payton McDonald", "Bianca Mok", "Isabella Wolfington"]);
    const withSydney = applyProducerCreditRules([{ title: "Associate Producers", photos: false, people: ["Isabella Wolfington", "Max Novak", "Sydney King", "Ricky Sypert", "Casey Caruso"].map(name => ({ name, role: "" })) }], new Map());
    expect(withSydney[0]!.people.map(person => person.name)).toEqual(["Casey Caruso", "Sydney King", "Ricky Sypert", "Max Novak", "Isabella Wolfington"]);
  });
});
