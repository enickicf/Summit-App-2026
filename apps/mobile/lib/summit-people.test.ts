import { describe, expect, it } from "vitest";
import { appPublicGuests2026 } from "./app-content-rules";
import { awardsContent, coChairs, guestCategories, summitGuests } from "./summit-people";

const key = (name: string) => name.toLowerCase().replace(/\([^)]*\)/g, "").replace(/[^a-z]+/g, " ").trim();

describe("app people and awards content", () => {
  it("lists every public talent, founder and producer exactly once", () => {
    const listed = new Set(summitGuests.flatMap(person => {
      if (!person.name.includes("&")) return [key(person.name)];
      const [first, second] = person.name.split("&").map(part => part.trim());
      const last = second!.split(" ").slice(1).join(" ");
      return [key(first!.includes(" ") ? first! : `${first} ${last}`), key(second!)];
    }));
    for (const name of appPublicGuests2026) expect(listed.has(key(name)), name).toBe(true);
    expect(new Set(summitGuests.map(person => person.name)).size).toBe(summitGuests.length);
  });

  it("never lists staff or press as people and keeps the approved co-chairs", () => {
    const names = summitGuests.map(person => person.name);
    for (const excluded of ["Bianca Mok", "Harvey Stern", "Alexa Price", "Cathy Olson", "Sophie Novak"]) expect(names).not.toContain(excluded);
    expect(coChairs.map(person => person.name)).toEqual(expect.arrayContaining(["Steve Wozniak", "Jewel", "Cherrial Odell"]));
    expect(guestCategories.every(category => summitGuests.some(person => person.category === category))).toBe(true);
    expect(summitGuests.every(person => person.image === null || person.image.startsWith("local:"))).toBe(true);
    // Everyone has a bundled headshot except people still awaiting one from the event team.
    expect(summitGuests.filter(person => !person.image).map(person => person.name)).toEqual(["Miriam Isa"]);
  });

  it("carries the owner-approved Awards timing and links", () => {
    expect(awardsContent.times).toEqual([
      { label: "Doors Open", time: "6:30 PM" },
      { label: "Pre-Show", time: "7:00 PM" },
      { label: "Awards Show", time: "8:00 PM-10:00 PM" }
    ]);
    expect(awardsContent.host?.name).toBe("Loni Love");
    expect(awardsContent.venue).toBe("Encore Theater at Wynn Las Vegas");
  });
});
