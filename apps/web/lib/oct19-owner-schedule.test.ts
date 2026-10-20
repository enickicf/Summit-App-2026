import { describe, expect, it } from "vitest";
import { isOnWebsiteSchedule, ownerScheduleDays, pinnedTime } from "./schedule-website-rules";

// Owner (Oct 19): Nevada Mental Health Day panels start 2:30 PM on the website, and Late Night Pickleball
// runs Monday and Tuesday whatever Airtable's checkboxes say.
describe("owner's Oct 19 schedule rules", () => {
  it("starts Nevada Mental Health Day at 2:30 PM", () => {
    expect(pinnedTime({ title: "Nevada Mental Health Day", date: "2026-11-02", start: "15:00", end: "6:30 PM" }).start).toBe("14:30");
  });

  it("shows Late Night Pickleball on Monday and Tuesday and never on Wednesday", () => {
    const row = (date: string, websitePublic: string) => ({ title: "Late Night Pickleball + Sauna", date, websitePublic });
    expect(isOnWebsiteSchedule(row("2026-11-02", ""))).toBe(true);   // Airtable unchecked, owner says Monday
    expect(isOnWebsiteSchedule(row("2026-11-03", "checked"))).toBe(true);
    expect(isOnWebsiteSchedule(row("2026-11-04", "checked"))).toBe(false); // Airtable checked, owner says no
  });

  it("leaves every other row to Airtable's checkbox", () => {
    expect(isOnWebsiteSchedule({ title: "Summit Sessions", date: "2026-11-04", websitePublic: "checked" })).toBe(true);
    expect(isOnWebsiteSchedule({ title: "Summit Sessions", date: "2026-11-04", websitePublic: "private" })).toBe(false);
    expect(ownerScheduleDays).toHaveLength(1);
  });
});
