import { awards2026Editorial } from "./awards-editorial";

// Nevada Mental Health Day page (/community-day, Summit site; "Community Day" is the label the team and the staff
// portal keep). Owner (Sept 28): simple and about this day only. Facts come only from owner sources; nothing is
// inferred:
// - the owner's Community Day invitation (Outreach OS campaign "Community Day — Nevada mental health orgs &
//   individuals", Sept 28, 2026): the panel + community activation, the Las Vegas organizations it is for,
//   free tickets for "you, your team, and the people you serve";
// - Aphrah (Oct 7, 2026; Airtable run of show) and the owner (Oct 7): Wellness & Check-In 12–3 PM (LaFleur),
//   Summit Sessions 3–6:30 PM (Margaux Ballroom; the owner moved the start from 3:30 to 3:00 the same day); the
//   Not Alone Awards Show follows at the Encore Theater, doors 6:30 PM, show 7:30–10:00 PM. No Pre-Show any more.
// - the live RSVP form (notaloneawards.org/rsvp/nevada-mental-health-day): the Organization field, the three
//   attendance toggles, the party size and the waiting-list notice.
// The "What is Community Day?" statement was written for the owner's review (Sept 29) from those same facts.
export type CommunityDayScheduleRow = { label: string; value: string; note: string; link: "awards" | null };

export const communityDay2026 = {
  name: "Community Day",
  // Ryan (Oct 5, via Aphrah and Paige): the page title is "Nevada Mental Health Day"; "Community Day" is the label.
  title: "Nevada Mental Health Day",
  // Owner (Oct 7): the header is the title, the Cohen credit and the ICF | NAMI lockup only; the date, time and
  // rooms live in the Schedule section and the page metadata.
  date: awards2026Editorial.date,
  dateTime: "2026-11-02T12:00:00-08:00",
  time: "12:00–6:30 PM",
  venue: "Wynn Las Vegas",
  // Owner (Oct 7): this page's tickets go to its own form (Nevada Mental Health Day & Awards Show), not the Awards Show form.
  rsvpUrl: "https://notaloneawards.org/rsvp/nevada-mental-health-day",
  // This page's own menu: NV Mental Health Day, Schedule, Tickets, Awards and the Donate sticker (owner, Oct 7).
  // The public page's Awards link goes to the Awards site; a partner copy's goes back to that copy.
  menu: {
    awardsUrl: "https://notaloneawards.org/awards/2026"
  },
  // Owner (Sept 29): "What is Community Day?" is answered in one statement that doubles as the mission.
  about: "Nevada Mental Health Day is a free day at the Not Alone Summit dedicated to the Las Vegas organizations making an impact in mental health: wellness rooms and check-in from noon, then panels and conversations that honor the people behind the work.",
  // The Schedule block, in the Awards page's "The Evening" format (label above a large value, venue note under it).
  // Owner (Oct 7): the date sits under the heading, each row names its room; rooms are public on this page only.
  // The Awards Show row's label links to that copy's Awards page (the view adds the link).
  details: [
    { label: "Wellness & Check-In", value: "12–3 PM", note: "LaFleur, Wynn Las Vegas", link: null },
    { label: "Summit Sessions", value: "3–6:30 PM", note: "Margaux Ballroom, Wynn Las Vegas", link: null },
    { label: "Not Alone Awards Show", value: "Doors open 6:30 PM · Show 7:30 PM", note: "Encore Theater", link: "awards" }
  ] satisfies readonly CommunityDayScheduleRow[],
  tickets: {
    steps: [
      { title: "Open the RSVP form", detail: "Choose your party size and add the name, email, phone, organization and title of every ticket holder." },
      { title: "Note your organization", detail: "Enter your organization in the Organization field." },
      { title: "Keep your event requests separate", detail: "This form requests Nevada Mental Health Day tickets only. Awards Show tickets require the separate Awards RSVP form." }
    ],
    // Word for word from the live RSVP form (Sept 28, 2026).
    waitingList: "Submitting this RSVP does not guarantee admission and is not a ticket. Your request will be added to our ticket waiting list. We will email you if your ticket is approved."
  },
  // Owner (Oct 1): selected the Encore Theater community-event concept with children and families in the audience.
  heroPhotoAlt: "Children and families watch a community panel onstage at Encore Theater"
} as const;
