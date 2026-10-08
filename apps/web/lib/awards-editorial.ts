// Owner-approved promotional credits and timing correction, September 17, 2026.
// This is not an attendance source or a replacement for the published schedule.
export const awards2026Editorial = {
  host: "Loni Love",
  venue: "Encore Theater at Wynn Las Vegas",
  foundation: "Steven & Alexandra Cohen Foundation",
  date: "Monday, November 2, 2026",
  // Owner (Oct 7 meeting): publicly the evening is Doors Open 6:30 PM and the Awards Show 7:30–10:00 PM; no
  // Pre-Show is announced anywhere (supersedes the Sept 21 / Oct 7 Pre-Show lines). These legacy corrections apply
  // only to the old published program notes (lib/awards-program.ts); a published staff session with the same title
  // always wins over these lines, so the Awards Show entry documents the owner's time until a new revision is published.
  eveningTimes: [
    { label: "Doors Open", time: "6:30 PM" },
    { label: "Awards Show", time: "7:30-10:00 PM" }
  ],
  // Owner (Sept 21, later): the Awards hero says only "Doors open 6:00 PM"; the rest of the evening
  // is listed further down the page.
  timeZone: "America/Los_Angeles",
  rsvpUrl: "https://notaloneawards.org/rsvp", // Sept 30: normal address; proxied to the RSVP site (netlify.toml)
  // Owner (Sept 23): the nomination form lives beside the RSVP form and feeds the staff portal.
  nominateUrl: "https://notaloneawards.org/rsvp/nominate",
  // Owner (Sept 21): the free-ticket / "Your support makes it possible" wording lives only on the Netlify
  // RSVP portal (work/awards-rsvp-portal-2026-09-21), not on the websites.
  donateUrl: "https://www.inspiringchildren.org/donate",
  // Official channel, not a verified direct 2026 broadcast link.
  iHeartUrl: "https://www.youtube.com/@iHeartRadio/streams"
} as const;

// Ryan Wolfington, NAS web meeting (September 21, 2026): list Pam & Duncan Goldie-Morrison as
// founders to credit their giving. Editorial credit only; not an attendance record.
export const ownerApprovedFounders2026 = ["Pam & Duncan Goldie-Morrison"] as const;

export const awards2025WinnersSource = "https://shorefire.com/releases/entry/jewel-inspiring-children-foundation-celebrate-mental-health-innovators-with-inaugural-not-alone-awardsin-las-vegas";

export const awards2025Winners = [
  { award: "No Quit Award", recipient: "Kevin Hines", description: "Recognizing resilience and perseverance." },
  { award: "Not Alone Legacy Award", recipient: "Didi Hirsch Mental Health Services" },
  { award: "Not Alone Service Award", recipient: "Atz Kilcher" },
  { award: "The Rudy Award", recipient: "Ozzie Tavares" },
  { award: "Not Alone Pioneer Award", recipient: "NAMI (National Alliance on Mental Illness)", note: "Accepted by CEO Dan Gillison Jr." },
  { award: "The Woz Innovation Award", recipient: "David Eagleman" },
  { award: "The Jewel Never Broken Award", recipient: "The Trevor Project", note: "Accepted by CEO Jaymes Black", description: "Honors the strength to grow and shine through life's challenges." },
  { award: "Not Alone Trailblazers Award", recipient: "Dr. Blaise Aguirre and Marc Brackett" },
  { award: "Not Alone Film of the Year Award", recipient: "Cabrini", note: "Executive producer Eustace Wolfington" },
  { award: "The Not Alone Award", recipient: "Darryl \"DMC\" McDaniels", description: "Recognizing an individual whose life and work embody the very essence of the \"not alone\" mission: connection, courage, and compassion." },
  { award: "Not Alone Album of the Year", recipient: "Rachel Platten" }
] as const;

// Owner (Sept 21, late): the Awards page's "The Evening" block, exactly as the owner wrote it.
// Owner (Oct 7 meeting): Doors Open 6:30 PM, Awards Show 7:30 PM-10:00 PM at the Encore Theater; no Pre-Show row.
// Community Day (now Nevada Mental Health Day, daytime, in the Margaux ballroom) is no longer on the Awards page.
export const awards2026Evening = [
  { label: "Doors Open", time: "6:30 PM" },
  { label: "Awards Show", time: "7:30 PM-10:00 PM" }
] as const;

// Sept 21 meeting direction, using ICF's own published wording (inspiringchildren.org/awards).
export const awards2026Program = {
  tagline: "Celebrating Pioneers in Human Development & Mental Health",
  broadcast: "Broadcast on iHeartRadio's Coffee House Channel and YouTube",
  programStatement: "The Not Alone Awards are part of the Not Alone Program, which includes the Not Alone Challenge, the Not Alone Summit, and the Awards Show. It is produced by the Inspiring Children Foundation, a 501(c)(3) nonprofit that has spent 25 years helping at-risk youth heal, grow, and thrive.",
  challengeUrl: "https://www.inspiringchildren.org/notalone",
  toolkitUrl: "https://www.inspiringchildren.org/notalonetools",
  noSolicitation: {
    title: "No Solicitation, Only Connection.",
    body: "We have a very strict No Pitch, No Solicitation Policy. This is a collection of highly successful, purpose-driven individuals who come to heal, grow, and celebrate mental health. Our time is devoted to authenticity, presence, and meaningful human connection. We request that all guests honor this intention by refraining from pitching, selling, or networking. Thank you."
  }
} as const;

// 2026 award categories as published on inspiringchildren.org/awards (captured Sept 19, 2026).
// Honorees are not announced here.
export const awards2026Categories = [
  ["Bold Stand to Reduce Stigma", "Recognizing those who courageously break silence, challenge stereotypes, and inspire understanding around mental health."],
  ["Grassroots Leadership in Mental Health", "Celebrating local and community-driven leaders who uplift others through service, mentorship, and impact."],
  ["Legacy Advocacy and Transformation", "Honoring those whose lifelong commitment has reshaped the conversation on mental health and human potential."],
  ["Music That Moved the World", "For musicians whose songs have inspired healing, unity, and emotional connection across generations."],
  ["Film or Series Changing Perception", "Celebrating filmmakers and storytellers who elevate awareness, empathy, and understanding through powerful narratives."],
  ["Artist Weaving Wellness into Live Experience", "Honoring performers who infuse their concerts, events, or installations with messages of well-being and connection."],
  ["Youth-Led Impact", "Recognizing young leaders who are transforming the future of mental health through creativity, courage, and action."],
  ["Breakthrough Tools or Approaches for Mental Well-Being", "Celebrating innovative technologies, therapies, or practices that expand access and improve outcomes."],
  ["Public Figure Shifting Conversations on Mental Health", "For leaders and influencers using their platforms to champion honesty, compassion, and awareness."],
  ["Clinical Excellence Award", "For professionals redefining care through evidence-based innovation and human-centered practice."],
  ["Scientific Breakthrough Award", "Honoring researchers advancing our understanding of the mind, brain, and behavior."],
  ["Technology for Humanity Award", "Recognizing innovators developing tools that make mental health support more accessible and effective."],
  ["Philanthropy and Impact Award", "Celebrating those funding, supporting, and fueling transformative mental health initiatives."],
  ["Advocacy and Public Policy Award", "For leaders creating systemic change and driving mental health to the forefront of society."],
  ["Creative Expression Award", "Honoring artists, musicians, and storytellers whose work inspires hope, healing, and unity."],
  ["Entrepreneur of Hope Award", "Recognizing innovators turning bold ideas into sustainable solutions for emotional and social well-being."],
  ["Lived Experience Award", "Celebrating individuals whose personal journeys have brought greater understanding, compassion, and healing to others."],
  ["Legacy Award", "Honoring those whose vision and lifetime contributions have redefined what it means to be Not Alone."]
] as const;
