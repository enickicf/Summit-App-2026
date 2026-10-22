// Ryan's approved Summit narrative (owner, Oct 7, 2026: "These are final"), placed per Ryan's Oct 8 review:
// - the paragraph and the Goals sit on the Summit page below Who's Coming (after Founders and Attendees), the
//   Goals in their own blue band;
// - the Awards sentence ("Through the Not Alone Awards…") sits on the Awards page right after the broadcast band
//   and is no longer on the Summit page;
// - the Jewel quote stays on the Summit page.
// The text is used exactly as written. The 2025 archive, the Nevada Mental Health Day page, the schedule, the
// people sections and the RSVP forms are not touched by it.
// Owner (Oct 22): Ryan's statement is off the Summit page for now; it goes back on Oct 23 at 4:45 PM PT.
// To put it back, set this to true and deploy.
export const summitStatementShown = false;

export const summitNarrative2026 = {
  intro: [
    "Bringing together the people shaping the future of mental health—clinical experts, lived-experience leaders, nonprofit organizations, artists, philanthropists, funders, innovators, policymakers, and young people—to share what works, spark collaboration, and build a more connected national mental-health system."
  ],
  awardsSentence: "Through the Not Alone Awards, we honor the pioneers, advocates, and warriors who fight for mental health every day.",
  goalsHeading: "Goals",
  goals: [
    "Connect the people doing the work.",
    "Learn from the best ideas.",
    "Collaborate across silos.",
    "Celebrate mental-health warriors.",
    "Build a stronger national mental-health system."
  ],
  quote: {
    text: "The mental-health space is siloed. We're bringing leaders together to share what works, honor the warriors, and inspire a stronger national system.",
    attribution: "Jewel"
  },
  // Ryan (Oct 8): the Not Alone Program statement, word for word, on the Summit and Awards pages.
  programStatement: "The Not Alone Program, which includes the Challenge, Summit, and Awards Show, is produced by and a program of the Inspiring Children Foundation."
} as const;
