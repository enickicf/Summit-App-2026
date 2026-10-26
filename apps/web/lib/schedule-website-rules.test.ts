import { describe, expect, it } from "vitest";
import { airtableRos2026 } from "./airtable-ros-2026";
import { isOnWebsiteSchedule, pinnedTime, privateEventScope, websiteSessionSynopsis, websiteSessionTitle } from "./schedule-website-rules";

// Owner (Oct 7, 2026): the schedule pulls from Airtable's Run of Show; these are the website's standing rules on top.
describe("schedule website rules", () => {
  it("never lists private founder events, Red Carpet, the Speaker Reception, a Pre-Show or operational rows, whatever Airtable says", () => {
    for (const title of ["Founders Cocktails", "Founder's Dinner", "Founder’s Dinner", "Red Carpet", "Speaker Reception", "Awards Show Pre-Show", "Pre-Show", "Psychedelic Breakthroughs: Gov. Rick Perry & Bryan Hubbard", "Governor Rick Perry Conversation", "Load In, Summit Rehearsals", "Load Out", "27 Heavens - Potentially cut this"]) {
      expect(isOnWebsiteSchedule({ title }), title).toBe(false);
      expect(isOnWebsiteSchedule({ title, websitePublic: "Public" }), `${title} even when marked Public`).toBe(false);
    }
  });

  it("lists the day's blocks and leaves the segments inside them off until the team marks them Public", () => {
    for (const title of ["Poker Night", "Wellness Activities & Check-In", "Wellness Activity", "Wellness Room Open", "Wellness Room: Drop-In", "Nevada Mental Health Day", "Pet Partners Therapy", "Awards Show Doors Open", "Not Alone Awards with iHeartRadio", "Late Night Pickleball + Sauna", "Summit Sessions", "Morning Summit Sessions", "Afternoon Summit Sessions", "Lunch", "Break", "Dinner - talent", "Evening", "Evening Talk + Performance/Writer's Round", "Closing Dinner and Performance", "Tennis", "High Tea", "Tennis (ICF Site Visit)"]) {
      expect(isOnWebsiteSchedule({ title }), title).toBe(true);
    }
    for (const title of ["Ray Lewis: Loss, Purpose & Advocacy", "Fitness 1", "Pilates 2", "Song Break", "Hobbies Panel", "Closing Dinner: Welcome & Appreciation", "Dinner & Connection", "Auction & Fundraising Appeal"]) {
      expect(isOnWebsiteSchedule({ title }), title).toBe(false);
      expect(isOnWebsiteSchedule({ title, websitePublic: "Public" }), `${title} marked Public`).toBe(true);
    }
    expect(isOnWebsiteSchedule({ title: "Lunch", websitePublic: "Private" })).toBe(false);
    // The Airtable checkbox: ticked rows are on, unticked rows are off, whatever the title.
    expect(isOnWebsiteSchedule({ title: "Pet Partners Therapy", websitePublic: "" })).toBe(false);
    expect(isOnWebsiteSchedule({ title: "Pet Partners Therapy", websitePublic: "checked" })).toBe(true);
    expect(isOnWebsiteSchedule({ title: "Song Break", websitePublic: "true" })).toBe(true); // live API value
    expect(isOnWebsiteSchedule({ title: "Red Carpet", websitePublic: "checked" })).toBe(false); // owner rule wins
  });

  it("keeps the owner's Oct 7 times over Airtable's until lifted, and reads the talent dinner as Dinner", () => {
    expect(pinnedTime({ title: "Not Alone Awards with iHeartRadio", date: "2026-11-02", start: "20:00", end: "10:30 PM" })).toEqual({ start: "20:00", end: "10:00 PM" });
    expect(pinnedTime({ title: "Nevada Mental Health Day", date: "2026-11-02", start: "15:30", end: "6:30 PM" })).toEqual({ start: "14:30", end: "6:30 PM" });
    expect(pinnedTime({ title: "Founders Cocktails", date: "2026-11-02", start: "16:30", end: "5:00 PM" })).toEqual({ start: "16:00", end: "5:00 PM" });
    expect(pinnedTime({ title: "Evening Talk + Performance/Writer's Round", date: "2026-11-03", start: "20:30", end: "9:30 PM" })).toEqual({ start: "20:00", end: "9:30 PM" });
    expect(pinnedTime({ title: "Lunch", date: "2026-11-03", start: "13:00", end: "2:30 PM" })).toEqual({ start: "13:00", end: "2:30 PM" });
    expect(websiteSessionTitle("Dinner - talent")).toBe("Dinner");
    expect(websiteSessionTitle("Summit Sessions")).toBe("Summit Sessions");
    expect(websiteSessionSynopsis("Dinner for Summit talent.")).toBe(""); // Oct 8: not a talent-only dinner
    expect(websiteSessionSynopsis("Lunch for Summit guests.")).toBe("Lunch for Summit guests.");
  });

  it("marks founders rows with the canonical founders scope (red asterisk) and other private rows as invite only (Ryan, Oct 8)", () => {
    for (const title of ["Founders Cocktails", "Founder's Dinner", "Founder’s Dinner", " founders cocktails "]) {
      expect(privateEventScope(title), title).toEqual({ id: "founders", label: "Founders only" });
    }
    expect(privateEventScope("Dinner - talent")).toEqual({ id: "invite-only", label: "Invite only" });
    for (const title of ["Dinner", "Lunch", "Summit Sessions", "Awards Show", "Closing Dinner and Performance"]) expect(privateEventScope(title), title).toBeNull();
  });

  it("recorded Run of Show keeps Bianca's reviewed public blocks and excludes Pet Partners", () => {
    const listed = airtableRos2026.filter(row => isOnWebsiteSchedule(row) && row.start && row.start !== "00:00");
    const attire = Object.fromEntries(listed.filter(row => row.attire).map(row => [`${row.date} ${row.title}`, row.attire]));
    expect(attire["2026-11-02 Wellness Room Open"]).toBe("Athleisure");
    expect(attire["2026-11-02 Nevada Mental Health Day"]).toBe("Smart casual");
    expect(attire["2026-11-04 Closing Dinner and Performance"]).toBe("Cocktail attire");
    expect(airtableRos2026.find(row => row.title === "Red Carpet")?.attire).toBe("Semi-Formal with Flair"); // recorded, never listed
    expect(airtableRos2026.filter(row => row.websitePublic === "checked").length).toBeGreaterThan(21);
    expect(airtableRos2026.filter(row => row.title === "Pet Partners Therapy").every(row => row.websitePublic === "")).toBe(true);
    expect(airtableRos2026.find(row => row.recordId === "recjN9zk2HKJmKSrl")?.synopsis).toContain("Honest conversations about loss");
    expect(airtableRos2026.find(row => row.recordId === "rec6hfpkHc1c5YoKD")?.synopsis).toContain("performance by Jewel");
  });
});
