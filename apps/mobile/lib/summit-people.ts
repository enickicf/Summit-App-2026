import generated from "./summit-content.generated.json";

// Reviewed 2026 people and Awards copy, exported from the website's editorial sources by
// scripts/export-website-content.ts (app-only; the website is not changed). Regenerate when the
// website's approved list or Airtable talent changes, then run scripts/bundle-headshots.py.
export type SummitGuest = { name: string; category: string; role: string; bio: string; image: string | null; zoom: number; imageSource?: string | null };

export const summitGuests: SummitGuest[] = generated.people;
export const guestCategories: string[] = generated.sections;
export const coChairs = summitGuests.filter(person => person.category === "Co-Chairs");
export const awardsContent = generated.awards;

export function guestsIn(category: string) {
  return summitGuests.filter(person => person.category === category);
}

export function initials(name: string) {
  const parts = name.replace(/\([^)]*\)/g, "").replace(/^Dr\.\s*/i, "").replace(/&/g, " ").trim().split(/\s+/);
  return [parts[0]?.[0], parts.length > 1 ? parts.at(-1)?.[0] : ""].join("").toUpperCase();
}
