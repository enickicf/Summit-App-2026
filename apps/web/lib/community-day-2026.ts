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
  dateTime: "2026-11-02T12:00:00-08:00",
  // Aphrah (Oct 7, 2026; Airtable run of show): the day moves into the Wynn's meeting wing: Wellness Activities & Check-In
  // 12:00-3:00 PM (LaFleur), Summit Sessions 3:30-6:30 PM (Margaux ballroom); the Awards Show follows at the Encore
  // Theater (doors 6:30, Pre-Show 7:30, show 8:00-10:00). Owner (Oct 7): the rooms are public on this page only.
  heroBlocks: [
    { label: "Wellness & Check-In", time: "12–3 PM" },
    { label: "Summit Sessions", time: "3:30–6:30 PM" }
  ],
  heroAwardsLine: "The Not Alone Awards Show follows at the Encore Theater · doors 6:30 PM",
  time: "12:00–6:30 PM",
  doors: "12:00 PM",
  venue: "Wynn Las Vegas",
  // Owner (Oct 7): this page's tickets go to its own form (Community Day & Awards Show), not the Awards Show form.
  rsvpUrl: "https://notaloneawards.org/rsvp/nevada-mental-health-day",
  // This page's own menu has no Summit, Schedule, Directory or Venue tab. The Awards page is labelled "Concert".
  menu: {
    concertUrl: "https://notaloneawards.org/awards/2026"
  },
  // Owner (Sept 29): "What is Community Day?" is answered in one statement that doubles as the mission.
  about: "Nevada Mental Health Day is a free day at the Not Alone Summit dedicated to the Las Vegas organizations making an impact in mental health: wellness rooms and check-in from noon, then panels and conversations that honor the people behind the work.",
  // The details block, in the Awards page's "The Evening" format (label above a large value).
  details: [
    { label: "Date", value: "Monday, Nov 2", note: null },
    { label: "Wellness & Check-In", value: "12–3 PM", note: "LaFleur, Wynn Las Vegas" },
    { label: "Summit Sessions", value: "3:30–6:30 PM", note: "Margaux Ballroom, Wynn Las Vegas" },
    { label: "Awards Show Doors", value: "6:30 PM", note: "Encore Theater" },
    { label: "Awards Show", value: "8:00–10:00 PM", note: "Encore Theater · Pre-Show 7:30 PM" }
  ],
  tickets: {
    steps: [
      { title: "Open the RSVP form", detail: "Add your name, email and phone, choose how many are in your party (up to ten per request), and add the name, email and phone of each guest." },
      { title: "Note your organization", detail: "Enter your organization in the Organization field." },
      { title: "Choose what you are attending", detail: "Turn on one of the three: both Nevada Mental Health Day and the Awards Show, only Nevada Mental Health Day, or only the Awards Show (and not Nevada Mental Health Day)." }
    ],
    // Word for word from the live RSVP form (Sept 28, 2026).
    waitingList: "Submitting this RSVP does not guarantee admission and is not a ticket. Your request will be added to our ticket waiting list. We will email you if your ticket is approved."
  },
  // Owner (Oct 1): selected the Encore Theater community-event concept with children and families in the audience.
  heroPhotoAlt: "Children and families watch a community panel onstage at Encore Theater"
} as const;
