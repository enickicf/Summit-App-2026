// Owner (Oct 22, 2026): the Summit's nonpartisan statement at the end of the producers band on the Summit page and every
// Awards copy, in the owner's final wording (Ryan's earlier version named the Steven & Alexandra Cohen Foundation; this one
// does not). It reads as a natural closing statement that has always been there, not as a warning: no box, badge or
// "notice" label, just a short rule, the opening sentence a little stronger, and the rest in the page's own body type.
// It appears from Friday Oct 23, 2026 at 9:00 AM Las Vegas time (owner: "this goes live in the morning ... like 9 am"),
// without a deploy: the pages render per request, and the edge cache holds a page at most 5 minutes.
export const siteStatement2026 = {
  showFrom: "2026-10-23T16:00:00.000Z", // 9:00 AM PDT
  paragraphs: [
    "The Not Alone Summit brings people together to advance mental health, well-being, and human connection across diverse backgrounds and perspectives. The Summit is nonpartisan.",
    "Views expressed by speakers and participants are their own and do not necessarily reflect those of Inspiring Children Foundation or the Summit’s organizers, sponsors, partners, or other participants.",
    "An invitation, appearance, sponsorship, or participation does not constitute endorsement of any individual’s political views, affiliations, candidates, or activities."
  ]
} as const;

export const siteStatementShown = (now: Date = new Date()) => now.getTime() >= Date.parse(siteStatement2026.showFrom);
