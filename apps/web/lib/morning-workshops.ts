// Owner (Sept 28, 2026): guests can sign up from the Summit schedule page (and nowhere else) for
//   - the workshops: "Wellness & Community Programming" (Mon Nov 2) and "Wellness Activity" (Tue Nov 3, Wed Nov 4),
//   - the ICF site visit on Thu Nov 5: "Tennis" and "High Tea", tracked separately in the portal with badges
//     for Tennis, High Tea or both (like Awards / Community Day).
// Sign-ups are name-only; the sign-up is exclusive to Summit attendees (invitation-only) and staff remove
// anyone not on the guest list.
export type WorkshopCategory = "workshop" | "siteVisit";
// Owner (Oct 5, 2026): the wellness workshop sign-ups are closed for now ("we're going to sit on this"): no Sign up
// button on the schedule and the API refuses them (410). The portal section and stored sign-ups stay.
// Owner (Oct 7, 2026): the Tennis / High Tea sign-up returns, on this website, with a waiver to sign ("enter your
// name, here's a waiver to sign, boom"). Flip a category here to open or close it.
export const signupOpenByCategory: Readonly<Record<WorkshopCategory, boolean>> = { workshop: false, siteVisit: true };
export const workshopExclusivityNote = "This is exclusive to attendees of the Not Alone Summit, an invitation-only event. Sign-ups from anyone not on our guest list will be removed.";

export function workshopCategory(title: string): WorkshopCategory | null {
  const t = title.trim().toLowerCase();
  if (/^wellness\b/.test(t)) return "workshop";
  if (/^tennis\b/.test(t) || /^high tea\b/.test(t)) return "siteVisit";
  return null;
}
export function signupOpenFor(title: string): boolean {
  const category = workshopCategory(title);
  return category !== null && signupOpenByCategory[category];
}
export const isWorkshopSignup = (item: { title: string }) => signupOpenFor(item.title);
export function siteVisitActivity(title: string): "tennis" | "highTea" | null {
  const t = title.trim().toLowerCase();
  return /^tennis\b/.test(t) ? "tennis" : /^high tea\b/.test(t) ? "highTea" : null;
}

// Owner (Oct 7): every Tennis / High Tea sign-up carries a signed waiver: the text below is shown in the form, the
// guest ticks "I have read and agree to the waiver" and types their full name as the signature. Plain and short for
// now (legal will review the wording later); bump the version whenever the text changes, so each stored sign-up
// records which text the guest agreed to.
export const siteVisitWaiver = {
  version: "2026-10-07",
  text: "Participation in this activity is voluntary and at my own risk. I confirm that I am physically able to take part, that I will follow the instructions of the hosts and venue staff, and I release the Inspiring Children Foundation, the Not Alone Summit and their partners and venues from liability for any injury or loss arising from my participation, to the extent permitted by law."
} as const;
// The wellness workshops (if they ever reopen) stay name-only; only the site visit asks for the waiver.
export const waiverRequiredFor = (category: WorkshopCategory | null): boolean => category === "siteVisit";

// The typed signature must be the guest's full name as entered: compared after trimming, collapsing spaces and
// ignoring case, so "lisa  lundt" signs for "Lisa Lundt" but "Lisa L" does not.
const normalizeName = (value: string) => value.normalize("NFKC").trim().replace(/\s+/g, " ").toLowerCase();
export function signatureMatchesName(signature: string, name: string): boolean {
  const normalized = normalizeName(signature);
  return normalized.length > 0 && normalized === normalizeName(name);
}

export function workshopDayLabel(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat("en-US", { timeZone, weekday: "long", month: "long", day: "numeric" }).format(new Date(iso));
}
export function workshopTimeLabel(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat("en-US", { timeZone, hour: "numeric", minute: "2-digit" }).format(new Date(iso));
}
