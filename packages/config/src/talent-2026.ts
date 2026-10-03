import { confirmedSummitGuests2026 } from "./confirmed-2026.ts";

// Read-only Airtable "Talent Level" review (Simplified Talent & ROS, Sept 21, 2026). Only talent,
// founders and producers are public guests (owner rule, Sept 18-19). Staff, press and personal
// guests are confirmed attendees but are never listed publicly. This does not grant any show role.
export type TalentLevel2026 = "talent" | "founder" | "producer" | "staff" | "press" | "guest";

const nonPublic: Record<string, TalentLevel2026> = {
  "Nick Dana": "guest", // Airtable occupation: "Caroline Jones Husband" (plus-one)
  "Morgan Marler": "guest",
  "Kase Murray": "guest",
  "Jan Thwaites": "staff",
  "Sally Dewhurst": "staff",
  "Sophie Novak": "staff",
  "Clark Cummings": "staff",
  "Paige Neuenschwander": "staff",
  "Isabella Wolfington": "staff",
  "Bianca Mok": "staff",
  "Harvey Stern": "staff",
  "Cathy Olson": "press",
  "Alexa Price": "press",
  "Taylor Perry": "press",
  "Allison Elbl": "press"
};

const producers = new Set(["Trent Alenik", "Trevor Short", "Aphrah Brokaw"]);

export function talentLevel2026(name: string): TalentLevel2026 {
  if (nonPublic[name]) return nonPublic[name];
  if (producers.has(name)) return "producer";
  return "talent";
}

export function isPublicGuest2026(name: string): boolean {
  return (confirmedSummitGuests2026 as readonly string[]).includes(name) && !nonPublic[name];
}

export const publicGuests2026: string[] = confirmedSummitGuests2026.filter(name => !nonPublic[name]);

// Public category and a short factual role for confirmed talent/founders who have no credit on
// ICF's public Summit/Awards pages. Roles come from Airtable occupation/organization or the
// person's own official page; nothing about a 2026 appearance is implied.
export type PublicCategory2026 = "Founders & Entrepreneurs" | "Philanthropists" | "Musicians" | "Entertainers & Athletes" | "Experts" | "Business Leaders";
export const talentPlacement2026: Record<string, { category: PublicCategory2026; role: string }> = {
  "Ray Lewis": { category: "Philanthropists", role: "Ray of Hope Foundation" },
  "Sanem (Sam) Alkan": { category: "Philanthropists", role: "Resonance Philanthropies" },
  "Miriam Isa": { category: "Philanthropists", role: "Flourish Trust" },
  "Jessica Edwards": { category: "Philanthropists", role: "NAMI" },
  "Sarah Steil": { category: "Musicians", role: "Singer-Songwriter" },
  "Michael Townsend": { category: "Entertainers & Athletes", role: "Tape Art" },
  "Leah Smith": { category: "Entertainers & Athletes", role: "Tape Art" },
  "Rahil Briggs": { category: "Experts", role: "National Director, HealthySteps" },
  "Margaret Hines": { category: "Philanthropists", role: "Kevin & Margaret Hines Foundation" },
  "Jeff Levin": { category: "Business Leaders", role: "Talent Manager" }
};

// Confirmed in the Sept 21 Airtable review but absent from published revision 9. The website lists
// them until staff publish their records; a published or withdrawn staff record always wins.
export const confirmedAwaitingPublication2026 = ["Ray Lewis", "Sarah Gilman", "Rahil Briggs", "Miriam Isa", "Silas Luke Jones", "Bishop Briggs"] as const;
