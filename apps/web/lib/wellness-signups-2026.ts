// Public wellness sign-ups, reviewed against the Summit Programming ROS on Oct 26.
// Pet Partners is intentionally absent: its Website Public/Private checkbox is off.
// Times and copy below mirror Airtable while keeping stable IDs for already published sessions.
export type WellnessSession = {
  id: string;
  day: "mon" | "tue" | "wed";
  dayLabel: string;
  title: string;
  time: string;
  start: number;
  end: number;
  note: string;
  dropIn?: boolean;
};

type ClassDef = Omit<WellnessSession, "id" | "day" | "dayLabel"> & { slug: string };

const pilatesYvette = "20-minute Reformer Pilates session with Olympian Yvette Baker. All levels welcome.";
const pilatesAleina = "20-minute Reformer Pilates session with Aleina Lasker. All levels welcome.";
const chiropractic = "20-minute chiropractic session with Dr. Katie Hightower. Waiver required.";
const lifePlan = "Life Plan workshop with Clayton Alenik and Nicole Kalhorn: hands-on tools to map your goals and build a plan for your life.";
const pickleball = "Drop in for a pickleball clinic on the patio with Head Pro George Wong, Tim Blenkiron, and Inspiring Children Foundation youth.";
const sauna = "Nomad Sauna and Cold Creek Plunges are open from 8 to 10am. Waiver required; an attendant is on site.";
const morningYoga = "Start your day feeling amazing. This gentle flow wakes up the body and eases stiffness through slow, intentional movement and simple breathwork. All levels welcome.";

const days = [
  {
    day: "mon", dayLabel: "Monday, November 2", key: "nov2", classes: [
      { slug: "breathwork", title: "Breathwork with Nick Kislinger", time: "1:30–2:30 PM", start: 810, end: 870, note: "Flourish Trust Executive Director Nick Kislinger leads a guided breathwork session." }
    ]
  },
  {
    day: "tue", dayLabel: "Tuesday, November 3", key: "nov3", classes: [
      { slug: "pilates-1", title: "Reformer Pilates with Olympian Yvette Baker", time: "8:00–8:20 AM", start: 480, end: 500, note: pilatesYvette },
      { slug: "breathwork", title: "Breathwork with Nick Kislinger", time: "8:00–8:45 AM", start: 480, end: 525, note: "Flourish Trust Executive Director Nick Kislinger leads a guided breathwork session." },
      { slug: "morning-yoga", title: "Morning Yoga Flow: Wake Up and Ground", time: "8:00–8:20 AM", start: 480, end: 500, note: morningYoga },
      { slug: "pilates-2", title: "Reformer Pilates with Olympian Yvette Baker", time: "8:30–8:50 AM", start: 510, end: 530, note: pilatesYvette },
      { slug: "fitness", title: "Fitness with Kelly Richardson", time: "8:30–8:50 AM", start: 510, end: 530, note: "Fitness professional Kelly Richardson leads a morning yoga session. All levels welcome." },
      { slug: "pilates-3", title: "Reformer Pilates with Olympian Yvette Baker", time: "9:00–9:20 AM", start: 540, end: 560, note: pilatesYvette },
      { slug: "movement-breathwork", title: "Move Together, Breathe Together with Karena Dawn", time: "9:00–9:45 AM", start: 540, end: 585, note: "Tone It Up co-founder Karena Dawn leads gentle movement and breathwork to reset body and mind." },
      { slug: "life-plan", title: "Life Plan Session", time: "9:00–9:45 AM", start: 540, end: 585, note: lifePlan },
      { slug: "inspire-cards", title: "Inspire Cards with Cherrial Odell", time: "9:00–9:45 AM", start: 540, end: 585, note: "A guided conversation using prompt cards to connect and share." },
      { slug: "pilates-4", title: "Reformer Pilates with Olympian Yvette Baker", time: "9:30–9:50 AM", start: 570, end: 590, note: pilatesYvette },
      { slug: "pickleball", title: "Pickleball Clinic", time: "8:00–10:00 AM", start: 480, end: 600, note: pickleball, dropIn: true },
      { slug: "sauna-cold-plunge", title: "Sauna & Cold Plunge", time: "8:00–10:00 AM", start: 480, end: 600, note: sauna, dropIn: true }
    ]
  },
  {
    day: "wed", dayLabel: "Wednesday, November 4", key: "nov4", classes: [
      { slug: "pilates-1", title: "Reformer Pilates with Aleina Lasker", time: "8:00–8:20 AM", start: 480, end: 500, note: pilatesAleina },
      { slug: "chiro-1", title: "Chiropractic with Dr. Katie Hightower", time: "8:00–8:20 AM", start: 480, end: 500, note: chiropractic },
      { slug: "morning-yoga", title: "Morning Yoga Flow: Wake Up and Ground", time: "8:00–8:20 AM", start: 480, end: 500, note: morningYoga },
      { slug: "pilates-2", title: "Reformer Pilates with Aleina Lasker", time: "8:30–8:50 AM", start: 510, end: 530, note: pilatesAleina },
      { slug: "chiro-2", title: "Chiropractic with Dr. Katie Hightower", time: "8:30–8:50 AM", start: 510, end: 530, note: chiropractic },
      { slug: "yoga-pilates-fusion", title: "Yoga Pilates Fusion: Strength, Balance, and Core", time: "8:30–8:50 AM", start: 510, end: 530, note: "A full-body class blending yoga flow with Pilates precision, focused core work, balance, and breath. All levels welcome." },
      { slug: "pilates-3", title: "Reformer Pilates with Aleina Lasker", time: "9:00–9:20 AM", start: 540, end: 560, note: pilatesAleina },
      { slug: "chiro-3", title: "Chiropractic with Dr. Katie Hightower", time: "9:00–9:20 AM", start: 540, end: 560, note: chiropractic },
      { slug: "fitness-1", title: "Fitness with Kelly Richardson", time: "9:00–9:20 AM", start: 540, end: 560, note: "Fitness professional Kelly Richardson leads a 20-minute morning fitness session. All levels welcome." },
      { slug: "mindsurf", title: "Mindsurf with Jen Smorgon", time: "9:00–9:30 AM", start: 540, end: 570, note: "Founder and meditation teacher Jen Smorgon leads a guided Mindsurf session." },
      { slug: "inspire-cards", title: "Inspire Cards with Cherrial Odell", time: "9:00–9:45 AM", start: 540, end: 585, note: "A longer guided conversation using prompt cards to connect and share." },
      { slug: "pilates-4", title: "Reformer Pilates with Aleina Lasker", time: "9:30–9:50 AM", start: 570, end: 590, note: pilatesAleina },
      { slug: "chiro-4", title: "Chiropractic with Dr. Katie Hightower", time: "9:30–9:50 AM", start: 570, end: 590, note: chiropractic },
      { slug: "fitness-2", title: "Fitness with Kelly Richardson", time: "9:30–9:50 AM", start: 570, end: 590, note: "Fitness professional Kelly Richardson leads a 20-minute morning fitness session. All levels welcome." },
      { slug: "life-plan", title: "Life Plan Session", time: "9:30–9:50 AM", start: 570, end: 590, note: lifePlan },
      { slug: "pickleball", title: "Pickleball Clinic", time: "8:00–10:00 AM", start: 480, end: 600, note: pickleball, dropIn: true },
      { slug: "sauna-cold-plunge", title: "Sauna & Cold Plunge", time: "8:00–10:00 AM", start: 480, end: 600, note: sauna, dropIn: true }
    ]
  }
] as const satisfies readonly { day: "mon" | "tue" | "wed"; dayLabel: string; key: string; classes: readonly ClassDef[] }[];

export const wellnessSessions: readonly WellnessSession[] = days.flatMap(({ day, dayLabel, key, classes }) =>
  classes.map(({ slug, ...rest }: ClassDef) => ({ id: `wellness-${key}-${slug}`, day, dayLabel, ...rest }))
);
export const wellnessSessionById = new Map(wellnessSessions.map(session => [session.id, session]));
export const wellnessSignupsOpen = true;

/** The first pair of selected timed classes that overlap on the same day, or null. */
export function wellnessClash(ids: readonly string[]): [WellnessSession, WellnessSession] | null {
  const chosen = ids.map(id => wellnessSessionById.get(id)).filter((session): session is WellnessSession => Boolean(session && !session.dropIn));
  for (let i = 0; i < chosen.length; i++) for (let j = i + 1; j < chosen.length; j++) {
    const a = chosen[i]!, b = chosen[j]!;
    if (a.day === b.day && a.start < b.end && b.start < a.end) return [a, b];
  }
  return null;
}

export const wellnessSignupPath = "/wellness";
export const isWellnessSignupEntry = (title: string) => /^wellness (?:activit(?:y|ies & check-in)|rooms?(?:: drop-in| open)(?: \(approved hours\))?)$/i.test(title.trim());
