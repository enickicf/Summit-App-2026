// Owner (Sept 28): the charity poker tournament has its own separate website and its own RSVP form.
// The Summit schedule is the ONLY place on this site that links to it — "have it on the schedule, but
// not everywhere" — and only on the Poker Night entry itself.
export const pokerNight = {
  site: "https://all-in-for-mental-health.netlify.app",
  // Sept 29 (owner): the schedule sends people to the poker site itself — "send it to the netlify
  // website we built, they can find RSVP there" — rather than to a form link that can change.
  rsvp: "https://all-in-for-mental-health.netlify.app",
  label: "All In For Mental Health",
  // Sept 28 (website session): the poker site is built but not deployed yet, so its links are hidden on the
  // schedule until it exists (they went live and 404ed). Flip to true once the site is up.
  live: true
} as const;

/** True only for the schedule entry that is the charity poker tournament. */
export function isPokerNight(title: string): boolean {
  return /\bpoker\b/i.test(title);
}
