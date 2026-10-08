import { describe, expect, it } from "vitest";
import { airtableRos2026 } from "./airtable-ros-2026";
import { isOnWebsiteSchedule, pinnedTime, websiteSessionTitle } from "./schedule-website-rules";

// Owner (Oct 7, 2026): the schedule pulls from Airtable's Run of Show; these are the website's standing rules on top.
describe("schedule website rules", () => {
  it("never lists Red Carpet, the Speaker Reception, a Pre-Show or operational rows, whatever Airtable says", () => {
    for (const title of ["Red Carpet", "Speaker Reception", "Awards Show Pre-Show", "Pre-Show", "Load In, Summit Rehearsals", "Load Out", "27 Heavens - Potentially cut this"]) {
      expect(isOnWebsiteSchedule({ title }), title).toBe(false);
      expect(isOnWebsiteSchedule({ title, websitePublic: "Public" }), `${title} even when marked Public`).toBe(false);
    }
  });

  it("lists the day's blocks and leaves the segments inside them off until the team marks them Public", () => {
    for (const title of ["Poker Night", "Wellness Activities & Check-In", "Wellness Activity", "Nevada Mental Health Day", "Founders Cocktails", "Founder's Dinner", "Pet Partners Therapy", "Awards Show Doors Open", "Not Alone Awards with iHeartRadio", "Late Night Pickleball + Sauna", "Summit Sessions", "Lunch", "Break", "Dinner - talent", "Evening Talk + Performance/Writer's Round", "Closing Dinner and Performance", "Tennis", "High Tea", "Tennis (ICF Site Visit)"]) {
      expect(isOnWebsiteSchedule({ title }), title).toBe(true);
    }
    for (const title of ["Ray Lewis: Loss, Purpose & Advocacy", "Fitness 1", "Pilates 2", "Song Break", "Hobbies Panel", "Closing Dinner: Welcome & Appreciation", "Dinner & Connection", "Wellness Rooms Open (Approved Hours)", "Auction & Fundraising Appeal"]) {
      expect(isOnWebsiteSchedule({ title }), title).toBe(false);
      expect(isOnWebsiteSchedule({ title, websitePublic: "Public" }), `${title} marked Public`).toBe(true);
    }
    expect(isOnWebsiteSchedule({ title: "Lunch", websitePublic: "Private" })).toBe(false);
  });

  it("keeps the owner's Oct 7 times over Airtable's until lifted, and reads the talent dinner as Dinner", () => {
    expect(pinnedTime({ title: "Not Alone Awards with iHeartRadio", date: "2026-11-02", start: "20:00", end: "10:30 PM" })).toEqual({ start: "19:30", end: "10:00 PM" });
    expect(pinnedTime({ title: "Nevada Mental Health Day", date: "2026-11-02", start: "15:30", end: "6:30 PM" })).toEqual({ start: "15:00", end: "6:30 PM" });
    expect(pinnedTime({ title: "Founders Cocktails", date: "2026-11-02", start: "16:30", end: "5:00 PM" })).toEqual({ start: "16:00", end: "5:00 PM" });
    expect(pinnedTime({ title: "Evening Talk + Performance/Writer's Round", date: "2026-11-03", start: "20:30", end: "9:30 PM" })).toEqual({ start: "20:00", end: "9:30 PM" });
    expect(pinnedTime({ title: "Lunch", date: "2026-11-03", start: "13:00", end: "2:30 PM" })).toEqual({ start: "13:00", end: "2:30 PM" });
    expect(websiteSessionTitle("Dinner - talent")).toBe("Dinner");
    expect(websiteSessionTitle("Summit Sessions")).toBe("Summit Sessions");
  });

  it("recorded Run of Show (Oct 7 read): every block on the schedule that Airtable gives an attire keeps it", () => {
    const listed = airtableRos2026.filter(row => isOnWebsiteSchedule(row) && row.start && row.start !== "00:00");
    const attire = Object.fromEntries(listed.filter(row => row.attire).map(row => [`${row.date} ${row.title}`, row.attire]));
    expect(attire).toEqual({
      "2026-11-01 Poker Night": "Casual - Smart Casual",
      "2026-11-02 Wellness Activities & Check-In": "Chic Business Casual",
      "2026-11-02 Not Alone Awards with iHeartRadio": "Semi-Formal with Flair",
      "2026-11-03 Summit Sessions": "Chic Business Casual",
      "2026-11-04 Summit Sessions": "Chic Business Casual",
      "2026-11-05 Tennis": "Athleisure",
      "2026-11-05 High Tea": "Athleisure"
    });
    expect(airtableRos2026.find(row => row.title === "Red Carpet")?.attire).toBe("Semi-Formal with Flair"); // recorded, never listed
    expect(airtableRos2026.every(row => !row.websitePublic)).toBe(true); // the column was empty on Oct 7
  });
});
