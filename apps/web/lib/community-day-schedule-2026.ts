import { airtableRos2026, type RosRow } from "./airtable-ros-2026";
import { foundersOnly, neverOnWebsite } from "./schedule-website-rules";

// Owner (Oct 8): the Nevada Mental Health Day page gets a full schedule "like the Summit's but with Community Day info":
// the day from Airtable's Run of Show (Oct 8 read, lib/airtable-ros-2026.ts) — Wellness & Check-In, the Summit Sessions
// block in the Margaux Ballroom with every segment inside it, then the Awards Show doors and show at the Encore Theater.
// Rooms are public on this page only (owner, Oct 7). Never listed: the owner's hard exclusions (Red Carpet, Speaker
// Reception, Pre-Show, load-in/out), founders-only events (private), Pet Partners (unticked) and the late-night
// pickleball (Summit guests). The owner's Oct 7 times stay pinned: Wellness & Check-In 12–3 PM on this page, the
// sessions 3–6:30 PM, doors 6:30, show 7:30–10:00 PM.
export type CommunityDaySession = { id: string; time: string; title: string; room: string; attire: string; synopsis: string; kind: "block" | "segment" | "awards" };

const rooms: Record<string, string> = { Margaux: "Margaux Ballroom", LaFleur: "LaFleur", "Encore Theater": "Encore Theater" };
const clock = (hhmm: string) => { const [h, m] = hhmm.split(":").map(Number) as [number, number]; return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`; };
// "3:15–3:20 PM" (one AM/PM when both ends share it), "11:30 AM–12:15 PM" otherwise.
const span = (start: string, end: string) => { if (!end) return clock(start); const from = clock(start); return from.slice(-2) === end.slice(-2) ? `${from.slice(0, -3)}–${end}` : `${from}–${end}`; };
const excluded = /pet partners|late night|pickleball/i;

export function communityDaySchedule2026(rows: RosRow[] = airtableRos2026): CommunityDaySession[] {
  const day = rows.filter(row => row.date === "2026-11-02" && !neverOnWebsite.test(row.title) && !foundersOnly.test(row.title) && !excluded.test(row.title));
  const sessions: Array<CommunityDaySession & { sort: string }> = [];
  for (const row of day) {
    const room = rooms[row.location] ?? row.location;
    const base = { id: row.recordId, room, attire: row.attire ?? "", synopsis: row.synopsis };
    if (/^wellness activit/i.test(row.title)) sessions.push({ ...base, sort: "12:00", time: "12:00–3:00 PM", title: "Wellness & Check-In", kind: "block" });
    else if (/^nevada mental health day$/i.test(row.title)) sessions.push({ ...base, sort: "15:00", time: "3:00–6:30 PM", title: "Summit Sessions", synopsis: "Panels and conversations with the people shaping mental health, in the Margaux Ballroom.", kind: "block" });
    else if (/doors open/i.test(row.title)) sessions.push({ ...base, sort: "18:31", time: "6:30 PM", title: "Awards Show Doors Open", synopsis: "", kind: "awards" });
    else if (/^not alone awards\b/i.test(row.title)) sessions.push({ ...base, sort: "19:30", time: "7:30–10:00 PM", title: "Not Alone Awards Show", synopsis: "", kind: "awards" });
    else if (row.location === "Margaux" && row.start >= "15:00" && row.start <= "18:30") sessions.push({ ...base, sort: row.start, time: span(row.start, row.end), title: row.title, kind: "segment" });
  }
  return sessions.sort((a, b) => a.sort.localeCompare(b.sort) || (a.kind === "block" ? -1 : b.kind === "block" ? 1 : 0)).map(({ sort: _sort, ...session }) => session);
}
