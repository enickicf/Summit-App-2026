import type { RosRow } from "./airtable-ros-2026";
import { airtableRos2026 } from "./airtable-ros-2026";

// Owner (Sept 22, 2026): until told otherwise, the website schedule follows the owner's Google Doc
// (docs.google.com/document/d/1h4Ul1SglhgGpTBzflLsCzmx6UDz3tckaFXtqgTeBF84), NOT Airtable's Run of Show.
// Read from the doc's text export on Sept 22. Las Vegas wall-clock times; an empty end = none given.
// Rooms are not in the doc: a room recorded in Airtable for the same title on the same day is kept.
export const scheduleDocSourceUrl = "https://docs.google.com/document/d/1h4Ul1SglhgGpTBzflLsCzmx6UDz3tckaFXtqgTeBF84/edit";
export const scheduleDocReadAt = "2026-09-22";
const rows: Array<[date: string, start: string, end: string, title: string]> = [
  ["2026-11-01", "19:00", "", "Poker Night"],
  ["2026-11-02", "12:00", "3:00 PM", "Wellness Activities & Check-In"],
  ["2026-11-02", "15:30", "6:30 PM", "Nevada Mental Health Day"],
  ["2026-11-02", "17:45", "6:15 PM", "Speaker Reception"],
  ["2026-11-02", "18:15", "7:30 PM", "Red Carpet"],
  ["2026-11-02", "18:30", "", "Awards Show Doors Open"],
  ["2026-11-02", "19:30", "8:00 PM", "Pre-Show"],
  ["2026-11-02", "20:00", "10:00 PM", "Awards Show"],
  ["2026-11-03", "08:00", "10:00 AM", "Wellness Activity"],
  ["2026-11-03", "10:30", "1:00 PM", "Summit Sessions"],
  ["2026-11-03", "13:30", "2:30 PM", "Lunch"],
  ["2026-11-03", "15:00", "5:00 PM", "Summit Sessions"],
  ["2026-11-03", "17:00", "6:00 PM", "Break"],
  ["2026-11-03", "18:30", "8:00 PM", "Dinner"],
  ["2026-11-03", "20:30", "9:30 PM", "Evening Talk + Performance"],
  ["2026-11-03", "22:00", "12:00 AM", "Late Night Pickleball + Sauna"],
  ["2026-11-04", "08:00", "10:00 AM", "Wellness Activity"],
  ["2026-11-04", "10:30", "1:00 PM", "Summit Sessions"],
  ["2026-11-04", "13:30", "2:30 PM", "Lunch"],
  ["2026-11-04", "15:00", "5:00 PM", "Summit Sessions"],
  ["2026-11-04", "17:00", "6:00 PM", "Break"],
  ["2026-11-04", "18:30", "10:00 PM", "Closing Dinner & Performance"],
  ["2026-11-05", "10:00", "", "Tennis (ICF Site Visit)"],
  ["2026-11-05", "11:30", "", "High Tea (ICF Site Visit)"]
];
const key = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const roomFor = (date: string, title: string) => airtableRos2026.find(row => row.date === date && key(row.title).replace(/ and | \+ /g, " ") === key(title).replace(/ and | \+ /g, " "))?.location ?? "";
export const scheduleDoc2026: RosRow[] = rows.map(([date, start, end, title], index) => ({
  recordId: `doc-${date}-${String(index).padStart(2, "0")}`, date, start, end, title, location: roomFor(date, title), synopsis: ""
}));
