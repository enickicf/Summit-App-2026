import type { EventSnapshot } from "@not-alone/validation";

// Owner direction (Sept 18, 2026), attendee app only. The website and the shared/published data are
// intentionally left as they are; these rules shape what the app presents from that data.

// Mike's Bikes (Community Ride, Sponsor and Talent Dinner) is no longer happening.
const cancelledProgram = /mike'?s bikes/i;

// Public 2026 guests in the app: Airtable "Confirmed Attendance" rows whose Talent Level is Talent,
// Founder or Musician (read-only review, Sept 18), plus the original ICF producer credits
// (packages/config/src/producer-credits.ts). Staff, press, contractors and plain attendees are not
// presented as guests. Update this list from Airtable when new talent is confirmed.
export const appPublicGuests2026 = [
  "Jason Kennedy", "Loni Love", "Anthony Ramos", "Rahil Briggs", "Ray Lewis", "Steve Wozniak", "Mike Majlak",
  "Kevin Hines", "Ryan Wolfington", "Jewel", "Caroline Jones", "Sarah Steil", "Lexi Hensler", "Jon Hershfield",
  "Nick Kislinger", "Sanem (Sam) Alkan", "Daniel Gillison", "Wendy Oliver-Pyatt", "Brandon Saho", "Michael Townsend",
  "Leah Smith", "Margaret Hines", "Caroline Silby", "Jessica Edwards", "Marc Brackett", "Ellie Kanner", "Noah Springer",
  "Melinda Springer", "Alana Springsteen", "David Eagleman", "Bob Bryan", "Mike Bryan", "Blaise Aguirre", "Jen Smorgen",
  "Sean Wolfington", "Ana Wolfington", "Janet Wozniak", "Jeff Levin", "Mike Tyson", "Darryl McDaniels (DMC)",
  "Sarah Gilman", "Miriam Isa",
  // Producers (ICF producer credits)
  "Trevor Short", "Aphrah Brokaw", "Trent Alenik"
] as const;

const key = (name: string) => name.toLowerCase().replace(/\([^)]*\)/g, "").replace(/[^a-z]+/g, " ").trim();
const publicGuestKeys = new Set(appPublicGuests2026.map(key));

export function applyAppContentRules(snapshot: EventSnapshot): EventSnapshot {
  const speakers = snapshot.speakers.filter(speaker => publicGuestKeys.has(key(speaker.name)));
  const speakerIds = new Set(speakers.map(speaker => speaker.id));
  return {
    ...snapshot,
    speakers,
    scheduleItems: snapshot.scheduleItems
      .filter(item => !cancelledProgram.test(item.title))
      .map(item => ({ ...item, speakerIds: item.speakerIds.filter(id => speakerIds.has(id)) })),
    contentPages: snapshot.contentPages.map(page => /^schedule-pending-/.test(page.slug)
      ? { ...page, body: page.body.split(/\r?\n\s*\r?\n/).filter(block => !cancelledProgram.test(block)).join("\n\n") }
      : page)
  };
}
