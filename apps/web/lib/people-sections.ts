import type { PersonCategory, SummitPerson } from "./people";
import { personNameKey } from "./person-portraits";
import { listedWithoutPhoto2026 } from "./portrait-overrides";

// Sept 22 meeting (Airtable-driven people display). Airtable's Website Grouping column decides who is
// listed and where; the website renders, in this order:
//   1. the Top 12 (the numeric chip, 1-10 with shared 10s -> 10, 11, 12 in Airtable order)
//   2. A Talent, 3. B Talent, 4. C Talent, 5. D Talent, 6. F Talent (Airtable's row order within each tier)
//   7. Founders, under a visible Founders heading
//   8. Attendees ("X - attendee"), under a visible Attendees heading (Summit only; never on the Awards page)
// Each person appears once. A founder is listed as a founder only, unless they are a headline name
// (Top 12 or A Talent), in which case they are in the lineup as well. Co-chairs, producers and hosts have
// their own sections and are not cards here. A card needs a title, a photo and a bio (completeness gate).
export type SectionVariant = "summit" | "awards";
export const peopleSectionTitles = ["Keynotes", "Lineup", "Musicians", "Speakers", "Founders", "Attendees"] as const;
export type PeopleSectionTitle = typeof peopleSectionTitles[number];

export const keynoteCount = 12;
export const talentTierOrder = ["A", "B", "C", "D", "F"] as const;

// Co-chairs and producers have their own sections; someone with only those credits is not a card.
const creditOnlyCategories: PersonCategory[] = ["Co-Chairs", "Executive Producers", "Producers", "Co-Producers", "Associate Producers"];
const creditOnly = (person: SummitPerson) => person.categories.length > 0 && person.categories.every(c => creditOnlyCategories.includes(c));
// Owner (Sept 22): never listed as founders, whatever Airtable says.
const notFounders2026 = new Set(["Ray Lewis", "Paul Dalio", "Sanem (Sam) Alkan"].map(personNameKey));
// Owner (Sept 22, after launch): off the Awards lineup only. Daniel Gillison stays in the Awards Founders
// section; Wendy and Rahil are off the Awards page entirely. The Summit page is unchanged for all three.
const notInAwardsLineup2026 = new Set(["Daniel Gillison", "Wendy Oliver-Pyatt", "Rahil Briggs"].map(personNameKey));
// Owner (Sept 24): the two Tape Art artists are listed in the Summit lineup (Speakers), not under
// Attendees, although Airtable groups them "X - attendee". Summit page only; the Awards lineup is unchanged.
// Ryan (Oct 8): Raquelle Stevens ("she should be up with these speakers") and Jessica Edwards ("put Jessica Edwards
// up with the other speakers") join them; both are "X - attendee" in Airtable today.
export const summitLineup2026 = new Set(["Michael Townsend", "Leah Smith", "Raquelle Stevens", "Jessica Edwards"].map(personNameKey));
const inSummitLineup = (person: SummitPerson) => summitLineup2026.has(personNameKey(person.name));
// Ryan (Oct 8): "add him to the awards show too". Ben Maxwell is in the Awards lineup whatever his tier chip says,
// once the completeness gate passes (title, photo, bio). Airtable's D-talent chip already puts him there today; this
// keeps him there if the chip ever changes. Awards page only; the Summit follows Airtable alone.
export const awardsLineupAdditions2026 = new Set(["Ben Maxwell"].map(personNameKey));
const inAwardsLineup = (person: SummitPerson) => awardsLineupAdditions2026.has(personNameKey(person.name));
const founderCategories: PersonCategory[] = ["Founders", "Founders & Entrepreneurs", "Business Leaders", "Business Leaders & Philanthropists"];

export type SectionEntry = { person: SummitPerson; role: string };
// heading: null = the group is shown without a heading (owner: the Awards site lists the keynote people
// first but never shows the word "Keynotes").
export type PeopleSection = { title: PeopleSectionTitle; heading?: string | null; people: SectionEntry[] };

// A person's public role for the cards: their role in a non-credit category first; a bare
// producer/co-chair credit is never shown as the role (those credits have their own sections).
const creditTitles = /^(?:executive |co-|associate )?producer$|^co-chair$/i;
function publicRole(person: SummitPerson) {
  const fromCategory = person.categories.filter(c => !creditOnlyCategories.includes(c)).map(c => person.categoryRoles?.[c]).find(Boolean);
  if (fromCategory) return fromCategory;
  return creditTitles.test(person.role.trim()) ? "" : person.role;
}

function roleFor(person: SummitPerson, categories: PersonCategory[]) {
  return categories.map(category => person.categoryRoles?.[category]).find(Boolean) ?? person.role;
}

const byAirtable = (a: SummitPerson, b: SummitPerson) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER);
const tierIndex = (person: SummitPerson) => person.tier ? talentTierOrder.indexOf(person.tier) : talentTierOrder.length;
const byTier = (a: SummitPerson, b: SummitPerson) => tierIndex(a) - tierIndex(b) || byAirtable(a, b);

export function isKeynote(person: SummitPerson) {
  return person.rank !== undefined && person.rank <= keynoteCount;
}
// A headline name: Top 12 or A Talent. Founders who are headline names appear in the lineup too.
export function isHeadline(person: SummitPerson) {
  return isKeynote(person) || person.tier === "A";
}
export function isFounder(person: SummitPerson) {
  return !notFounders2026.has(personNameKey(person.name)) && person.categories.some(c => founderCategories.includes(c));
}

// Completeness gate (Sept 22 meeting): a card needs a title, a photo and a bio. Values already on the
// website count (ICF portraits, reviewed photos, interim bios); listedWithoutPhoto2026 is the owner's
// explicit exception. Missing pieces suppress the card until Airtable supplies them.
export function isCompleteCard(person: SummitPerson) {
  const photo = Boolean(person.image) || listedWithoutPhoto2026.has(personNameKey(person.name));
  return photo && Boolean(person.role.trim()) && Boolean(person.bio.trim());
}

// Owner (Oct 7, 2026): in the Founders list the Cohens sit fourth, and Janet Wozniak sits right after Steve (they have
// separate headshots, so they stay two cards side by side). Everyone else keeps Airtable's order.
// Ryan (Oct 9 meeting): the Founders section in his order; couples share one card and sort by either name.
// Founders he did not name keep Airtable order after his list; Ryan Wolfington is always last.
export const founderOrderRyan2026: RegExp[] = [
  /\bcohen\b/, /^jewel\b/, /^steve wozniak\b/, /^janet wozniak\b/, /\bkislinger\b/, /^(melony|adam) (and \w+ )?lewis\b/,
  /\bsobrato\b|\bsabroto\b/, /^jeneva bell\b/, /^miriam isa\b/, /^logan paul\b/,
  // Ryan (Oct 9): "put Dan Gillison ... before Jay McGraw"; Ellie Kanner then comes before the Springers.
  /\bgillison\b/, /^jay mcgraw\b/, /^erica mcgraw\b/, /\bkanner\b/, /\bspringer\b/, /^(winston|cameron) (and \w+ )?kelly\b/,
  // Owner (Oct 11): then the Musks, the Bryan brothers, Sean and Ana Wolfington, Jen Smorgon and Jennifer Donnelly.
  /^christiana musk\b/, /^kimbal musk\b/, /^mike bryan\b/, /^bob bryan\b/, /^(bob|mike) (and \w+ )?bryan\b/, /^(sean|ana) (and \w+ )?wolfington\b/,
  /^jen smorgon\b/, /^jennifer donnelly\b/
];
export function founderOrder2026(founders: SummitPerson[]): SummitPerson[] {
  const rank = (person: SummitPerson) => {
    const key = personNameKey(person.name);
    if (/^ryan wolfington\b/.test(key)) return 10_000;
    const index = founderOrderRyan2026.findIndex(pattern => pattern.test(key));
    return index === -1 ? 1_000 : index;
  };
  return founders.map((person, index) => ({ person, index, rank: rank(person) }))
    .sort((a, b) => a.rank - b.rank || a.index - b.index)
    .map(entry => entry.person);
}

export function peopleSections(people: SummitPerson[], variant: SectionVariant = "summit"): PeopleSection[] {
  const seen = new Set<string>();
  const unique = people.filter(person => { const key = personNameKey(person.name); if (seen.has(key)) return false; seen.add(key); return true; });
  const cards = unique.filter(person => (!creditOnly(person) || isKeynote(person)) && isCompleteCard(person));
  const top = cards.filter(isKeynote).sort((a, b) => a.rank! - b.rank!);
  const tiered = cards.filter(person => !isKeynote(person) && (person.tier || (variant === "summit" && inSummitLineup(person)) || (variant === "awards" && inAwardsLineup(person))) && (!isFounder(person) || isHeadline(person))).sort(byTier);
  const founders = founderOrder2026(cards.filter(isFounder).sort(byAirtable));
  const attendees = cards.filter(person => person.categories.includes("Attendees") && !isKeynote(person) && !person.tier && !isFounder(person) && !inSummitLineup(person)).sort(byAirtable);
  const entry = (person: SummitPerson) => ({ person, role: publicRole(person) });
  const founderSection: PeopleSection = { title: "Founders", people: founders.map(person => ({ person, role: roleFor(person, founderCategories) })) };
  if (variant === "awards") {
    // One ranked lineup without sub-headings (Top 12, then A-F), then Founders. No attendees on the Awards page.
    const lineup = [...top, ...tiered].filter(person => !notInAwardsLineup2026.has(personNameKey(person.name)));
    return [
      { title: "Lineup" as const, heading: null, people: lineup.map(entry) },
      founderSection
    ].filter(section => section.people.length);
  }
  return [
    { title: "Keynotes" as const, people: top.map(entry) },
    { title: "Speakers" as const, heading: "2026 Lineup", people: tiered.map(entry) },
    founderSection,
    { title: "Attendees" as const, people: attendees.map(entry) }
  ].filter(section => section.people.length);
}
