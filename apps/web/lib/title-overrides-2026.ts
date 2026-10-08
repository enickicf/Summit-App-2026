import { personNameKey } from "./person-portraits";

// Owner-dictated titles that win over Airtable's Title column (and over anything already published) wherever a
// person's title shows: lineup and Founders cards, the Partners page Philanthropists, the profile page, producer
// credits. Keyed by personNameKey(name). lib/airtable-overlay.ts applies them when it builds the 2026 people.
// Ryan Wolfington (Oct 8, 2026): "Take off 'co-founder' for Not Alone... I would put 'Founder, Inspiring Children
// Foundation and Not Alone'." Airtable still reads "President, Jewel Inc. | Founder, Inspiring Children Foundation |
// Co Founder, Not Alone Challenge"; the paste-ready text for the team is in docs/AIRTABLE_PASTE_2026-10-08.md.
export const titleOverrides2026: ReadonlyMap<string, string> = new Map([
  ["Ryan Wolfington", "Founder, Inspiring Children Foundation and Not Alone"]
].map(([name, title]) => [personNameKey(name!), title!]));

export function titleOverride2026(name: string): string | undefined {
  return titleOverrides2026.get(personNameKey(name));
}
