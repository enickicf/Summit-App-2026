import { describe, expect, it } from "vitest";
import { siteStatement2026, siteStatementShown } from "./site-statement-2026";

describe("nonpartisan statement (owner, Oct 22)", () => {
  it("appears from Oct 23, 2026 at 9:00 AM Las Vegas time, not before", () => {
    expect(siteStatementShown(new Date("2026-10-23T08:59:59-07:00"))).toBe(false);
    expect(siteStatementShown(new Date("2026-10-23T09:00:00-07:00"))).toBe(true);
  });
  it("uses the owner's wording, without the Cohen Foundation and without a notice label", () => {
    const all = siteStatement2026.paragraphs.join(" ");
    expect(all).toContain("The Summit is nonpartisan.");
    expect(all).not.toContain("Cohen");
    expect(all).not.toMatch(/please note/i);
  });
});
