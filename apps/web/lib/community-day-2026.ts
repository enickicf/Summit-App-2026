import { awards2026Editorial } from "./awards-editorial";

// Community Day page (/community-day, Summit site). Owner (Sept 28): simple and about Community Day only.
// The page never compares it with the other events; what it is (its mission, time and free tickets)
// makes it obvious. Facts come only from owner sources; nothing is inferred:
// - the owner's Community Day invitation (Outreach OS campaign "Community Day — Nevada mental health orgs &
//   individuals", Sept 28, 2026): the panel + community activation, the Las Vegas organizations it is for,
//   free tickets for "you, your team, and the people you serve";
// - the Awards page (lib/awards-editorial.ts): date, venue, doors 5:30, Community Day 5:45-7:15;
// - the live RSVP form (not-alone-awards-rsvp-2026.netlify.app, read Sept 28): the Organization field,
//   the Community Day toggle, the party size and the waiting-list notice.
// The "What is Community Day?" statement was written for the owner's review (Sept 29) from those same facts.
export const communityDay2026 = {
  name: "Community Day",
  // Ryan (Oct 5, via Aphrah and Paige): the page title is "Nevada Mental Health Day"; "Community Day" is the label.
  title: "Nevada Mental Health Day",
  date: awards2026Editorial.date,
  dateTime: "2026-11-02T17:30:00-08:00",
  // Owner (Oct 1): Community Day runs 5:45–7:15 PM; doors remain 5:30 PM.
  heroTime: "5:45–7:15 PM",
  time: "5:45–7:15 PM",
  doors: "5:30 PM",
  venue: awards2026Editorial.venue,
  rsvpUrl: awards2026Editorial.rsvpUrl,
  // This page's own menu has no Summit, Schedule, Directory or Venue tab. The Awards page is labelled "Concert".
  menu: {
    concertUrl: "https://notaloneawards.org/awards/2026"
  },
  // Owner (Sept 29): "What is Community Day?" is answered in one statement that doubles as the mission.
  about: "The Not Alone Community Day is a free evening dedicated to the Las Vegas organizations making an impact in mental health, with a panel and a community activation that honors the people behind the work.",
  // The details block, in the Awards page's "The Evening" format (label above a large value).
  details: [
    { label: "Date", value: "Monday, Nov 2", note: null },
    { label: "Doors Open", value: "5:30 PM", note: null },
    { label: "Community Day", value: "5:45–7:15 PM", note: null },
    { label: "Awards Show", value: "7:30 PM", note: null },
    { label: "Location", value: "Encore Theater, Wynn Las Vegas", note: null }
  ],
  tickets: {
    steps: [
      { title: "Open the RSVP form", detail: "Add your name, email and phone, choose how many are in your party (up to ten per request), and add the name, email and phone of each guest." },
      { title: "Note your organization", detail: "Enter your organization in the Organization field." },
      { title: "Choose what you are attending", detail: "Pick “Awards Show + Community Day” or “Community Day only.”" }
    ],
    // Word for word from the live RSVP form (Sept 28, 2026).
    waitingList: "Submitting this RSVP does not guarantee admission and is not a ticket. Your request will be added to our ticket waiting list. We will email you if your ticket is approved."
  },
  // Owner (Oct 1): selected the Encore Theater community-event concept with children and families in the audience.
  heroPhotoAlt: "Children and families watch a community panel onstage at Encore Theater"
} as const;
