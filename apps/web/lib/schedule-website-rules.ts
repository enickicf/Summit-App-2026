import type { ScheduleItem } from "@not-alone/validation";

// Owner (Oct 7, 2026): the Summit and Awards schedules pull from Airtable's Run of Show, with every Airtable
// refresh carrying the Attire column along, and with the owner's standing exceptions applied on top so that a
// refresh never undoes them. This module holds those rules; lib/airtable-overlay.ts applies them.

// Hard rules from the owner: never on the website, whatever Airtable says.
//  - Red Carpet ("hard rule, do not pull that from Airtable or anywhere"), Oct 7.
//  - Speaker Reception ("cut the speaker reception"), Oct 7.
//  - Pre-Show ("we're not gonna say there's a pre-show, we're just gonna say 7:30"), Oct 7.
//  - Founders cocktails and Founder's Dinner (owner: remove both from the Summit website schedule), Oct 16.
//  - Operational rows (load-in/out, rehearsals) and anything the team has flagged as a possible cut.
export const neverOnWebsite = /\bred carpet\b|\bspeaker reception\b|\bpre[- ]?show\b|\bfounders? cocktails?\b|\bfounder['’]?s dinner\b|\bload[- ]?(?:in|out)\b|rehearsal|potentially cut/i;

// Which Run of Show rows are events on the public schedule. Airtable lists every segment of the day (each panel,
// song break and fitness class) under its parent block; the website lists the blocks, as the owner's schedule
// always has. The "Website Public/Private" column overrides this once the team fills it in: "Public" lists a
// row whatever its title, "Private" hides it.
export const scheduleBlockTitles: RegExp[] = [
  /^poker night$/i,
  /^wellness activit/i, // "Wellness Activity", "Wellness Activities & Check-In"
  /^nevada mental health day$/i,
  /^pet partners therapy$/i,
  /^(?:awards show )?doors open$/i,
  /^not alone awards\b|^awards show$/i,
  /^late night pickleball/i,
  /^summit sessions$/i,
  /^lunch$/i,
  /^break$/i,
  /^dinner(?:\s*-\s*talent)?$/i, // "Dinner" / "Dinner - talent"; not the closing dinner's "Dinner & Connection" segment
  /^evening talk/i,
  /^closing (?:dinner|celebration)\b(?!.*:)/i, // "Closing Dinner and Performance", not its "Closing Dinner: Welcome" segment
  /^tennis\b/i,
  /^high tea\b/i
];

// Airtable's "Website Public/Private" column is a CHECKBOX (found Oct 8, after the team pointed out an unchecked Pet
// Partners row on the site): ticked = on the public website, unticked = not. When a row carries that information
// (recorded read: "checked" / ""; live API: "true" / "") it decides; the block list above is only the fallback for
// sources without it (the Google Doc schedule).
export type RosVisibility = { title: string; websitePublic?: string | undefined; date?: string | undefined };

// Owner (Oct 19): Late Night Pickleball runs Monday and Tuesday nights. Ricky (6:28 PM): "the website shows late
// night pickleball on Tuesday & Wednesday, I thought it was Mon and Tuesday"; Aubrey says Mon and Tue too. Airtable
// still has the Nov 2 row unchecked and the Nov 4 row checked, and the owner said to override the website and have
// the team correct Airtable ("make it Monday/Tuesday. Just override whatever Airtable says"). These days win over
// the checkbox until Airtable agrees, at which point the rule simply stops changing anything.
export const ownerScheduleDays: Array<{ title: RegExp; days: readonly string[] }> = [
  { title: /^late night pickleball/i, days: ["2026-11-02", "2026-11-03"] }
];
const checkedValues = new Set(["checked", "true", "public", "yes", "1", "x"]);
export function isOnWebsiteSchedule(row: RosVisibility): boolean {
  const title = row.title.trim();
  if (neverOnWebsite.test(title)) return false;
  const ownerDays = ownerScheduleDays.find(entry => entry.title.test(title));
  if (ownerDays && row.date) return ownerDays.days.includes(row.date);
  if (row.websitePublic !== undefined) {
    const flag = row.websitePublic.trim().toLowerCase();
    if (flag === "private") return false;
    return checkedValues.has(flag);
  }
  return scheduleBlockTitles.some(pattern => pattern.test(title));
}

// Airtable synopses that must not be shown as written (Payton/Jan, Oct 8: the Nov 3 dinner is for every Summit guest,
// not "talent"; Bianca took the note out of the title but the synopsis still says it). Until Airtable is corrected the
// website shows the title alone.
const suppressedSynopses = [/^dinner for summit talent\.?$/i];
// Owner (Oct 21): "take who's doing the writers round on Tuesday off of the website for now": the Nov 3 evening
// performance shows no performer names (title and synopsis) until the owner lifts this. Airtable keeps the names.
const replacedSynopses: Array<[RegExp, string]> = [
  [/^grammy-nominated singer-songwriter jp saxe opens an evening/i, "An evening of stories and songs. Performers to be announced."]
];
export function websiteSessionSynopsis(synopsis: string): string {
  const text = synopsis.trim();
  const replaced = replacedSynopses.find(([pattern]) => pattern.test(text));
  if (replaced) return replaced[1];
  return suppressedSynopses.some(pattern => pattern.test(text)) ? "" : text;
}

// Airtable's working labels that read differently on the website: the owner's schedule calls the talent dinner
// "Dinner", and the show is "Awards Show" (owner, Oct 7: "just put show, 7:30"); the Awards page's hero, program
// and Ask AI all key on the title "Awards Show". The iHeartRadio credit has its own band on the Awards page.
const displayTitles: Array<[RegExp, string]> = [
  [/^dinner\s*-\s*talent$/i, "Dinner"],
  [/^not alone awards\b/i, "Awards Show"],
  // Owner (Oct 21): no performer names on the Tuesday writers' round for now.
  [/^evening performance:.*writers'? round$/i, "Evening Performance: Writers' Round"]
];
export function websiteSessionTitle(title: string): string {
  const match = displayTitles.find(([pattern]) => pattern.test(title.trim()));
  return match ? match[1] : title.trim();
}

// Owner-dictated times (Oct 7) that stay put through Airtable refreshes until the owner lifts them: the Awards
// Show is 7:30-10:00 PM with doors at 6:30 (no pre-show), Nevada Mental Health Day starts at 2:30 (owner, Oct 19,
// taking Ryan's "change to 230pm on all" for the website; the invite templates keep their own wording), Founders
// Cocktails at 4:00, the Tuesday evening performance at 8:00. Airtable already agrees; this is the safety net.
export const ownerPinnedTimes: Array<{ title: RegExp; date: string; start?: string; end?: string }> = [
  { title: /^not alone awards\b|^awards show$/i, date: "2026-11-02", start: "19:30", end: "10:00 PM" },
  { title: /^(?:awards show )?doors open$/i, date: "2026-11-02", start: "18:30" },
  { title: /^nevada mental health day$/i, date: "2026-11-02", start: "14:30", end: "6:30 PM" },
  { title: /^founders? cocktails$/i, date: "2026-11-02", start: "16:00" },
  { title: /^evening talk/i, date: "2026-11-03", start: "20:00" }
];
// `date` is the session's local (Las Vegas) day as YYYY-MM-DD; `start` a 24-hour "HH:MM"; `end` Airtable's end text.
export function pinnedTime(row: { title: string; date: string; start: string; end: string }): { start: string; end: string } {
  const pin = ownerPinnedTimes.find(entry => entry.date === row.date && entry.title.test(row.title.trim()));
  return { start: pin?.start ?? row.start, end: pin?.end ?? row.end };
}

// Owner (Oct 7): private events say so instead of hiding. Ryan (Oct 8): "make sure a founders-only event is marked with
// a red asterisk", so the founders rows (Founders Cocktails, Founder's Dinner) carry the canonical "founders" scope that
// app/schedule/schedule-presentation.ts isFoundersOnly() recognises and components/schedule-browser.tsx marks with the
// asterisk; any other private row (the talent dinner, if Airtable ever names it that again) reads "Invite only".
export const foundersOnly = /founder/i;
export const foundersOnlyScope = { id: "founders", label: "Founders only" } as const;
export const inviteOnly = /founder|^dinner\s*-\s*talent$/i;
export const inviteOnlyScope = { id: "invite-only", label: "Invite only" } as const;
export function privateEventScope(title: string): typeof foundersOnlyScope | typeof inviteOnlyScope | null {
  const text = title.trim();
  if (foundersOnly.test(text)) return foundersOnlyScope;
  return inviteOnly.test(text) ? inviteOnlyScope : null;
}

// Attire rides on the schedule item; the shared schema has no field for it, so it travels as an extra property.
export type ScheduleItemWithAttire = ScheduleItem & { attire?: string };
export const sessionAttire = (item: ScheduleItem): string | null => (item as ScheduleItemWithAttire).attire?.trim() || null;
