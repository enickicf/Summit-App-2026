import { confirmedAwaitingPublication2026, confirmedSummitGuests2026, isPublicGuest2026, originalProducerCredit, originalProducerCredits, producerCredit2026, talentPlacement2026 } from "@not-alone/config";
import { publishedDirectory } from "@not-alone/domain";
import type { EventSnapshot } from "@not-alone/validation";
import original from "./original-sites.json";
import { originalAsset } from "./original-assets";
import { personNameKey, personPortrait } from "./person-portraits";
import { airtableOverlay } from "./airtable-shared";
import { hiddenUntilPhoto2026, portrait2026 } from "./portrait-overrides";

export type PersonCategory = "Co-Chairs" | "Hosts" | "Founders" | "Mental Health Nonprofit Founding Partners" | "Musicians" | "Entertainers & Athletes" | "Experts" | "Business Leaders & Philanthropists" | "Founders & Entrepreneurs" | "Business Leaders" | "Philanthropists" | "Sponsors" | "Executive Producers" | "Producers" | "Attendees"
  // Airtable "Website Grouping" rubric (Sept 21).
  | "Comedians" | "Athletes" | "Podcasters" | "Talent" | "Co-Producers" | "Associate Producers";
export type SummitPerson = { name: string; slug: string; categories: PersonCategory[]; role: string; bio: string; year: 2025 | 2026; image?: string; order?: number; messageable?: boolean;
  // Role shown when the person is listed under one of their additional categories.
  categoryRoles?: Partial<Record<PersonCategory, string>>;
  // Set when Airtable supplied the listing (grouping, title, bio, headshot); "featured" = A-Talent.
  source?: "airtable"; featured?: boolean;
  // Sept 22 meeting: Airtable's Top 12 rank (1-12) and talent tier (A-F) drive the display order.
  rank?: number; tier?: "A" | "B" | "C" | "D" | "F" };
export const categories: PersonCategory[] = ["Co-Chairs", "Hosts", "Founders", "Founders & Entrepreneurs", "Philanthropists", "Mental Health Nonprofit Founding Partners", "Musicians", "Comedians", "Athletes", "Entertainers & Athletes", "Experts", "Podcasters", "Talent", "Business Leaders & Philanthropists", "Business Leaders", "Sponsors", "Executive Producers", "Co-Producers", "Associate Producers", "Producers", "Attendees"];
const slug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const airtableConfirmedNames = new Set(confirmedSummitGuests2026.map(personNameKey));
// Explicit owner removals from every current public website surface. Keep the underlying
// Airtable/staff records intact; this boundary also protects profiles and Ask AI because
// they consume directoryPeople rather than the operational event record directly.
const excludedFromCurrentWebsites2026 = new Set(["mike tyson"]);
const isCurrentWebsitePerson2026 = (name: string) => !excludedFromCurrentWebsites2026.has(personNameKey(name));

// Attendance is not approval of a speaking, sponsor, host or production role.
export const people2026: SummitPerson[] = confirmedSummitGuests2026.map(name => {
  const credit = producerCredit2026(name);
  return { name, slug: slug(name), categories: credit ? [credit.category] : ["Attendees"], role: credit?.role ?? "Confirmed 2026 summit guest", bio: "", year: 2026, messageable: false };
});

const historicalPeople = original.summit.sections.flatMap(section => section.people.map(person => ({
  name: person.name, slug: `2025-${slug(person.name)}`, categories: [categories.find(category => category === section.title) ?? "Attendees"],
  role: person.role, bio: "", year: 2025 as const, image: originalAsset(person.image), messageable: false
})));
export const people2025: SummitPerson[] = [
  ...historicalPeople.filter((person, index) => historicalPeople.findIndex(other => other.name === person.name) === index && !originalProducerCredit(person.name)),
  ...originalProducerCredits.map(person => ({ name: person.name, slug: `2025-${slug(person.name)}`, categories: [person.category], role: person.role, bio: "", year: 2025 as const, messageable: false }))
];

// Published records win. People confirmed in the latest Airtable review who have no staff record yet
// still appear (talent, founders and producers only; never staff, press or plus-ones).
export function directoryPeople(snapshot: EventSnapshot | null): SummitPerson[] {
  if (!snapshot) return [];
  const reviewed = publishedDirectory(snapshot);
  if (reviewed === null) return [];
  // Airtable connected: its confirmed list and Website Grouping rubric decide who is listed and where.
  const live = airtableOverlay(snapshot)?.people;
  if (live) return reviewed.flatMap(person => {
    if (!isCurrentWebsitePerson2026(person.name)) return [];
    const entry = live.get(personNameKey(person.name));
    if (!entry) return [];
    const reviewed = portrait2026(person.name);
    const image = reviewed === null ? undefined : reviewed ?? person.headshotUrl ?? personPortrait(person.name);
    // Owner (Sept 21, late): no photo, no card (and Hal Fisher off for now).
    if (hiddenUntilPhoto2026(person.name, image)) return [];
    return [{ name: person.name, slug: person.id, role: person.role, bio: person.bio, year: 2026 as const,
      categories: entry.categories as PersonCategory[], source: "airtable" as const, featured: entry.featured, order: entry.rank,
      ...(entry.topRank !== undefined ? { rank: entry.topRank } : {}), ...(entry.tier ? { tier: entry.tier } : {}), ...(image ? { image } : {}) }];
  });
  const published = reviewed.filter(person => isCurrentWebsitePerson2026(person.name) && airtableConfirmedNames.has(personNameKey(person.name)) && isPublicGuest2026(canonicalName(person.name))).map(person => {
    const image = person.headshotUrl || personPortrait(person.name);
    return {
    name: person.name, slug: person.id, role: person.role, bio: person.bio, year: 2026 as const,
    categories: person.directoryCategories?.length ? person.directoryCategories : ["Attendees" as const],
    ...(image ? { image } : {})
    };
  });
  const publishedNames = new Set(published.map(person => personNameKey(person.name)));
  // Only names with no staff record at all are added: a withdrawn, unpublished or other-event record
  // stays authoritative, and an empty published directory is never filled from the list.
  if (!published.length) return [];
  const withheld = new Set(snapshot.speakers.map(person => personNameKey(person.name)));
  const added = confirmedAwaitingPublication2026.filter(name => isPublicGuest2026(name) && !publishedNames.has(personNameKey(name)) && !withheld.has(personNameKey(name))).map(name => {
    const placement = talentPlacement2026[name];
    const credit = producerCredit2026(name);
    const image = personPortrait(name);
    return { name, slug: `2026-${slug(name)}`, role: placement?.role ?? credit?.role ?? "", bio: "", year: 2026 as const,
      categories: [placement?.category ?? credit?.category ?? "Attendees"] as PersonCategory[], ...(image ? { image } : {}) };
  });
  return [...published, ...added];
}

function canonicalName(name: string) {
  const key = personNameKey(name);
  return confirmedSummitGuests2026.find(candidate => personNameKey(candidate) === key) ?? name;
}
