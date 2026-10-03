import { describe, expect, it } from "vitest";
import { viewForHash } from "./portal-views";
describe("staff portal views (owner, Sept 28)", () => {
  it("maps every section hash to its view and defaults to Awards", () => {
    expect(viewForHash("")).toBe("awards");
    for (const h of ["#awards", "#tickets", "#community-day", "#nominations", "#removed", "#lineup"]) expect(viewForHash(h)).toBe("awards");
    for (const h of ["#summit", "#workshops", "#workshop-list"]) expect(viewForHash(h)).toBe("workshops");
    for (const h of ["#site-visit", "#site-visit-list"]) expect(viewForHash(h)).toBe("site-visit");
    for (const h of ["#poker", "#poker-removed"]) expect(viewForHash(h)).toBe("poker");
    expect(viewForHash("#nonsense")).toBe("awards");
  });
});
