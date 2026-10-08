import { personNameKey } from "./person-portraits";

// Ryan Wolfington's producer-credit decisions (meeting of Oct 8, 2026). components/original-event-page.tsx
// (ProducerCredits2026) applies them with applyProducerCreditRules() after it has built its groups.

export type ProducerCreditPerson = { name: string; role: string; image?: string | undefined };
export type ProducerCreditGroup = { title: string; photos: boolean; people: ProducerCreditPerson[] };

// (a) Owner additions. Ryan: "put Raquelle Stevens as a producer" (and she stays in the lineup as a speaker too:
// "that's fine, as well as a speaker"). She is credited as a name card in the Producers group with her Airtable
// title as the role whenever the Airtable overlay is the source and her record is listed; once the team adds
// "Producer" to her Website Grouping in Airtable the overlay credits her itself and this entry is a no-op.
export const ownerProducerCredits2026: ReadonlyArray<{ name: string; group: string }> = [
  { name: "Raquelle Stevens", group: "Producers" }
];

// (b) Ryan asked to be taken off the producer credits ("you can just take me off... I didn't even want to be on
// that"). He remains a Founder everywhere else (Founders section, Partners page, profile). The owner can empty
// this set to put him back.
export const producerCreditsHidden2026 = new Set(["Ryan Wolfington"].map(personNameKey));
export const isHiddenProducerCredit = (name: string) => producerCreditsHidden2026.has(personNameKey(name));

// (c) Ryan: "put them in alphabetical order". Alphabetical by SURNAME: the last word of the name, ignoring
// suffixes (Jr., Sr., II, III, IV, academic letters) and a parenthetical (DMC); a single-word name (Jewel) is its
// own surname; a couple ("Steven & Alexandra Cohen", "Jay and Erica McGraw") sorts by the first person's surname,
// which is the shared one when the first part is a bare first name. Ties keep their incoming order (stable).
const suffixes = new Set(["jr", "sr", "ii", "iii", "iv", "phd", "md", "mft", "lmft", "esq", "cpa"]);
export function surnameOf(name: string): string {
  const cleaned = name.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\([^)]*\)/g, " ").replace(/["“”]/g, " ").replace(/[.,]/g, " ").trim();
  const words = (text: string) => text.split(/\s+/).filter(word => word && !suffixes.has(word.toLowerCase()));
  const parts = cleaned.split(/\s+(?:&|and)\s+/i);
  const first = words(parts[0] ?? "");
  const chosen = parts.length > 1 && first.length > 1 ? first : words(cleaned);
  return (chosen.at(-1) ?? cleaned).toLowerCase();
}
export function sortProducerCredits<P extends { name: string }>(people: readonly P[]): P[] {
  return [...people].sort((a, b) => surnameOf(a.name).localeCompare(surnameOf(b.name), "en", { sensitivity: "base" }));
}

// The three rules together, for the component: merge the owner additions (Airtable source only), drop the hidden
// names, sort every group by surname. Groups keep their order, titles and photo setting; a group may come back empty.
export function applyProducerCreditRules<G extends ProducerCreditGroup>(groups: readonly G[], live?: ReadonlyMap<string, { title: string; occupation: string }> | null): G[] {
  const merged = groups.map(group => ({ ...group, people: [...group.people] }));
  if (live) {
    for (const credit of ownerProducerCredits2026) {
      const key = personNameKey(credit.name);
      const record = live.get(key);
      const group = merged.find(entry => entry.title === credit.group);
      if (!record || !group || group.people.some(person => personNameKey(person.name) === key)) continue;
      group.people.push({ name: credit.name, role: record.title || record.occupation || "" } as G["people"][number]);
    }
  }
  return merged.map(group => ({ ...group, people: sortProducerCredits(group.people.filter(person => !isHiddenProducerCredit(person.name))) }));
}
