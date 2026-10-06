// Owner (Sept 28, 2026): guests can sign up from the Summit schedule page (and nowhere else) for
//   - the workshops: "Wellness & Community Programming" (Mon Nov 2) and "Wellness Activity" (Tue Nov 3, Wed Nov 4),
//   - the ICF site visit on Thu Nov 5: "Tennis" and "High Tea", tracked separately in the portal with badges
//     for Tennis, High Tea or both (like Awards / Community Day).
// Sign-ups are name-only; the sign-up is exclusive to Summit attendees (invitation-only) and staff remove
// anyone not on the guest list.
export type WorkshopCategory = "workshop" | "siteVisit";
// Owner (Oct 5, 2026): sign-ups are closed for now ("we're going to sit on this"): no Sign up button on the schedule
// and the API refuses new sign-ups. Flip to true to bring them back (the portal section and stored sign-ups stay).
export const workshopSignupsOpen = false;
export const workshopExclusivityNote = "This is exclusive to attendees of the Not Alone Summit, an invitation-only event. Sign-ups from anyone not on our guest list will be removed.";

export function workshopCategory(title: string): WorkshopCategory | null {
  const t = title.trim().toLowerCase();
  if (/^wellness\b/.test(t)) return "workshop";
  if (/^tennis\b/.test(t) || /^high tea\b/.test(t)) return "siteVisit";
  return null;
}
export const isWorkshopSignup = (item: { title: string }) => workshopSignupsOpen && workshopCategory(item.title) !== null;
export function siteVisitActivity(title: string): "tennis" | "highTea" | null {
  const t = title.trim().toLowerCase();
  return /^tennis\b/.test(t) ? "tennis" : /^high tea\b/.test(t) ? "highTea" : null;
}

export function workshopDayLabel(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat("en-US", { timeZone, weekday: "long", month: "long", day: "numeric" }).format(new Date(iso));
}
export function workshopTimeLabel(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat("en-US", { timeZone, hour: "numeric", minute: "2-digit" }).format(new Date(iso));
}
