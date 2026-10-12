// Oct 12 (owner, relaying Kristin Hoover: "Do we have a link for wellness activity sign ups yet?"): the morning
// wellness classes on Tuesday Nov 3 and Wednesday Nov 4, from Airtable's Run of Show (lib/airtable-ros-2026.ts, read
// Oct 8). Guests sign up at notalonesummit.org/wellness (public/wellness); each chosen class is stored as one
// "workshop" record with category "wellness" and listed in the staff portal's Wellness view. Rooms stay private
// (lib/room-privacy.ts), so no room is listed here. Pickleball is drop-in for the whole two hours, so it never
// clashes with a class; the timed classes on the same morning may not overlap.
export type WellnessSession = { id: string; day: "tue" | "wed"; dayLabel: string; title: string; time: string; start: number; end: number; note: string; dropIn?: boolean };

const days = [{ day: "tue", dayLabel: "Tuesday, November 3", key: "nov3" }, { day: "wed", dayLabel: "Wednesday, November 4", key: "nov4" }] as const;
const classes = [
  { slug: "fitness-1", title: "Fitness 1", time: "8:00–8:20 AM", start: 480, end: 500, note: "A guided fitness session for guests of all levels." },
  { slug: "pilates-1", title: "Pilates 1", time: "8:00–8:20 AM", start: 480, end: 500, note: "Led by Olympian Yvette Baker. All levels welcome." },
  { slug: "fitness-2", title: "Fitness 2", time: "8:30–8:50 AM", start: 510, end: 530, note: "A guided fitness session for guests of all levels." },
  { slug: "pilates-2", title: "Pilates 2", time: "8:30–8:50 AM", start: 510, end: 530, note: "Led by Olympian Yvette Baker. All levels welcome." },
  { slug: "pilates-3", title: "Pilates 3", time: "9:00–9:20 AM", start: 540, end: 560, note: "Led by Olympian Yvette Baker. All levels welcome." },
  { slug: "movement-breathwork", title: "Movement & Breathwork", time: "9:00–9:45 AM", start: 540, end: 585, note: "Gentle movement and breathwork to reset body and mind." },
  { slug: "pilates-4", title: "Pilates 4", time: "9:30–9:50 AM", start: 570, end: 590, note: "Led by Olympian Yvette Baker. All levels welcome." },
  { slug: "pickleball", title: "Pickleball", time: "8:00–10:00 AM", start: 480, end: 600, note: "Drop-in pickleball. Come and go any time.", dropIn: true }
] as const;

export const wellnessSessions: readonly WellnessSession[] = days.flatMap(({ day, dayLabel, key }) => classes.map(({ slug, ...rest }) => ({ id: `wellness-${key}-${slug}`, day, dayLabel, ...rest })));
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
