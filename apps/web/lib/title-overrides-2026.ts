import { personNameKey } from "./person-portraits";

// Owner-dictated titles that win over Airtable's Title column (and over anything already published) wherever a
// person's title shows: lineup and Founders cards, the Partners page Philanthropists, the profile page, producer
// credits. Keyed by personNameKey(name). lib/airtable-overlay.ts applies them when it builds the 2026 people.
// Ryan Wolfington (Oct 8, 2026): "Take off 'co-founder' for Not Alone... I would put 'Founder, Inspiring Children
// Foundation and Not Alone'." Airtable still reads "President, Jewel Inc. | Founder, Inspiring Children Foundation |
// Co Founder, Not Alone Challenge"; the paste-ready text for the team is in docs/AIRTABLE_PASTE_2026-10-08.md.
export const titleOverrides2026: ReadonlyMap<string, string> = new Map([
  ["Ryan Wolfington", "Founder, Inspiring Children Foundation and Not Alone"],
  // Ryan (Oct 9): Paige's title is the ICF partnerships one ("put ICF partnerships ... manager"); her bio describes her
  // as a member of the ICF team, not an alumna, so she does not get the ICF Alumni line.
  ["Paige Neuenschwander", "ICF Partnerships Manager"],
  // Oct 20: Airtable has no title for Julie Scelfo yet (occupation "Founder, Mothers against media addiction"); this is
  // the organization's own wording (wearemama.org/about).
  ["Julie Scelfo", "Founder & Executive Director, Mothers Against Media Addiction (MAMA)"]
].map(([name, title]) => [personNameKey(name!), title!]));

export function titleOverride2026(name: string): string | undefined {
  return titleOverrides2026.get(personNameKey(name));
}

// Ryan (Oct 9): "put ICF alumni, put that for Trent, put that for Sophie ... I'll do it for all of them"; "if they have a
// second title, put it underneath". Owner (Oct 11): every Inspiring Children Foundation alumnus shows "ICF Alumni" and
// then their title on the line underneath, everywhere a title shows. The list = Trent and Sophie (Ryan) and everyone
// whose Airtable title or bio says they are an ICF alumna/alumnus (read Oct 11).
export const icfAlumni2026 = new Set([
  "Trent Alenik", "Sophie Novak", "Aphrah Brokaw", "Bianca Mok", "Casey Caruso", "Nick Ekern", "Ricky Sypert",
  "Cherrial Odell", "Sydney King", "Max Novak", "Will Elmore Jr."
].map(personNameKey));
export const icfAlumniLabel = "ICF Alumni";
/** The title as the website shows it: the owner's override or Airtable's title, with "ICF Alumni" on its own first
 *  line for alumni (a leading "ICF Alumni," / "ICF Alumni &" in the Airtable title moves to that line). */
export function displayTitle2026(name: string, title: string): string {
  const base = titleOverride2026(name) ?? title;
  if (!icfAlumni2026.has(personNameKey(name))) return base;
  const rest = base.replace(/^\s*ICF Alumn(i|a|us)\b\s*(,|&|and)?\s*/i, "").trim();
  return rest ? `${icfAlumniLabel}\n${rest}` : icfAlumniLabel;
}
/** A title in one line, for alt text, aria labels, meta descriptions and Ask AI answers. */
export const titleOneLine = (title: string) => title.replace(/\s*\n\s*/g, ", ");
