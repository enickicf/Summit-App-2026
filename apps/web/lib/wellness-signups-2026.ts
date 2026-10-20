// Oct 12 (owner, relaying Kristin Hoover: "Do we have a link for wellness activity sign ups yet?"): the morning
// wellness classes on Tuesday Nov 3 and Wednesday Nov 4, from Airtable's Run of Show (lib/airtable-ros-2026.ts, read
// Oct 8). Guests sign up at notalonesummit.org/wellness (public/wellness); each chosen class is stored as one
// "workshop" record with category "wellness" and listed in the staff portal's Wellness view. Rooms stay private
// (lib/room-privacy.ts), so no room is listed here. Pickleball is drop-in for the whole two hours, so it never
// clashes with a class; the timed classes on the same morning may not overlap.
export type WellnessSession = { id: string; day: "tue" | "wed"; dayLabel: string; title: string; time: string; start: number; end: number; note: string; dropIn?: boolean };

// Oct 20 (owner: "confirm that all the details and all the different options are accurate based upon the most recent
// Airtable uploads"): re-read from Airtable's Run of Show on Oct 20 (read-only interface). The two mornings now differ:
// Tuesday has Reformer Pilates, Nick Kislinger's breathwork and Karena Dawn's movement & breathwork (no fitness);
// Wednesday has Kelly Richardson's fitness and Reformer Pilates (no breathwork). Pickleball is now a drop-in clinic.
// No wellness sign-up had been made before this change, so no stored record points at a removed class.
type ClassDef = { slug: string; title: string; time: string; start: number; end: number; note: string; dropIn?: boolean };
const pilates = "Olympian Yvette Baker leads a revitalizing Reformer Pilates session to awaken your strength and restore your body. All levels welcome.";
const fitness = "A guided fitness session led by Kelly Richardson. All levels welcome.";
const pickleball: ClassDef = { slug: "pickleball", title: "Pickleball Clinic", time: "8:00–10:00 AM", start: 480, end: 600, note: "Drop in with Head Pro George Wong, Tim Blenkiron and Inspiring Children Foundation youth. Come and go any time.", dropIn: true };
const days = [
  { day: "tue", dayLabel: "Tuesday, November 3", key: "nov3", classes: [
    { slug: "pilates-1", title: "Reformer Pilates 1", time: "8:00–8:20 AM", start: 480, end: 500, note: pilates },
    { slug: "breathwork", title: "Breathwork with Nick Kislinger", time: "8:00–8:45 AM", start: 480, end: 525, note: "Flourish Trust Executive Director Nick Kislinger leads a guided breathwork session." },
    { slug: "pilates-2", title: "Reformer Pilates 2", time: "8:30–8:50 AM", start: 510, end: 530, note: pilates },
    { slug: "pilates-3", title: "Reformer Pilates 3", time: "9:00–9:20 AM", start: 540, end: 560, note: pilates },
    { slug: "movement-breathwork", title: "Movement & Breathwork with Karena Dawn", time: "9:00–9:45 AM", start: 540, end: 585, note: "Tone It Up co-founder Karena Dawn leads gentle movement and breathwork to reset body and mind." },
    { slug: "pilates-4", title: "Reformer Pilates 4", time: "9:30–9:50 AM", start: 570, end: 590, note: pilates },
    pickleball
  ] },
  { day: "wed", dayLabel: "Wednesday, November 4", key: "nov4", classes: [
    { slug: "fitness-1", title: "Fitness 1 with Kelly Richardson", time: "8:00–8:20 AM", start: 480, end: 500, note: fitness },
    { slug: "pilates-1", title: "Reformer Pilates 1", time: "8:00–8:20 AM", start: 480, end: 500, note: pilates },
    { slug: "fitness-2", title: "Fitness 2 with Kelly Richardson", time: "8:30–8:50 AM", start: 510, end: 530, note: fitness },
    { slug: "pilates-2", title: "Reformer Pilates 2", time: "8:30–8:50 AM", start: 510, end: 530, note: pilates },
    { slug: "pilates-3", title: "Reformer Pilates 3", time: "9:00–9:20 AM", start: 540, end: 560, note: pilates },
    { slug: "pilates-4", title: "Reformer Pilates 4", time: "9:30–9:50 AM", start: 570, end: 590, note: pilates },
    pickleball
  ] }
] as const satisfies readonly { day: "tue" | "wed"; dayLabel: string; key: string; classes: readonly ClassDef[] }[];

export const wellnessSessions: readonly WellnessSession[] = days.flatMap(({ day, dayLabel, key, classes }) => classes.map(({ slug, ...rest }: ClassDef) => ({ id: `wellness-${key}-${slug}`, day, dayLabel, ...rest })));
export const wellnessSessionById = new Map(wellnessSessions.map(session => [session.id, session]));
export const wellnessSignupsOpen = true;

/** The first pair of chosen classes that overlap on the same morning (drop-in pickleball never counts), or null. */
export function wellnessClash(ids: readonly string[]): [WellnessSession, WellnessSession] | null {
  const chosen = ids.map(id => wellnessSessionById.get(id)).filter((session): session is WellnessSession => Boolean(session && !session.dropIn));
  for (let i = 0; i < chosen.length; i++) for (let j = i + 1; j < chosen.length; j++) {
    const a = chosen[i]!, b = chosen[j]!;
    if (a.day === b.day && a.start < b.end && b.start < a.end) return [a, b];
  }
  return null;
}

// Oct 12 (owner: "put the wellness sign up link on the website as well"): the Summit schedule's "Wellness Activity"
// entries (the Nov 3 and Nov 4 mornings this form covers) carry a "Sign up for wellness classes" button to /wellness.
// Not the Nov 2 "Wellness Activities & Check-In" block, which the form does not cover.
export const wellnessSignupPath = "/wellness";
export const isWellnessSignupEntry = (title: string) => /^wellness activity$/i.test(title.trim());
