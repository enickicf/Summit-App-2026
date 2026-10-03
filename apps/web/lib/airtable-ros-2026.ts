// Run of Show as read from Airtable's "Simplified Talent & ROS" page on Sept 21, 2026 (read-only).
// Used until AIRTABLE_TOKEN is configured; after that the live Airtable schedule replaces it.
// Local Las Vegas wall-clock times. Rows with no start time in Airtable are not listed, and a
// start of exactly 12:00 AM (Airtable's blank-time default) is treated as not yet scheduled.
export type RosRow = { recordId: string; date: string; start: string; end: string; title: string; location: string; synopsis: string };
export const airtableRos2026: RosRow[] = [
  { recordId: "recmQQOlKISjNt6m9", date: "2026-11-01", start: "", end: "", title: "Load In, Summit Rehearsals", location: "", synopsis: "" },
  { recordId: "recAFQhFPqSJJfLTQ", date: "2026-11-01", start: "19:00", end: "10 PM", title: "Poker Night", location: "Encore Poker Room", synopsis: "Poker night at the wynn" },
  { recordId: "recLUvdF9JiTLgHrZ", date: "2026-11-02", start: "00:00", end: "", title: "David Eagleman + Geoff Ralston", location: "", synopsis: "David doing a 15 - 20 min panel w Geoff Ralston about AI relationships and the pros and cons of AI." },
  { recordId: "reclVeBIk65F0PrcI", date: "2026-11-02", start: "12:00", end: "5 PM", title: "Wellness and Community Programming", location: "", synopsis: "" },
  { recordId: "recBfBwNj4DA3NMpN", date: "2026-11-02", start: "16:30", end: "5 PM", title: "Founders Cocktails", location: "", synopsis: "" },
  { recordId: "recFbR0gMHc6BrtNw", date: "2026-11-02", start: "17:00", end: "7 PM", title: "Founder's Dinner", location: "", synopsis: "" },
  { recordId: "rectSoCrF1oDC38oB", date: "2026-11-02", start: "17:15", end: "6:15 PM", title: "Speaker Reception", location: "", synopsis: "" },
  { recordId: "recMJDgOPE4fRKAYi", date: "2026-11-02", start: "18:00", end: "7:00 PM", title: "Pet Partners Therapy", location: "", synopsis: "" },
  { recordId: "recZdFECrK1etusbE", date: "2026-11-02", start: "18:15", end: "7:30 PM", title: "Red Carpet", location: "", synopsis: "" },
  { recordId: "recCcLzd0BSsAIoUw", date: "2026-11-02", start: "18:30", end: "", title: "Doors Open", location: "", synopsis: "" },
  { recordId: "recioSuFk9HRFuH3p", date: "2026-11-02", start: "19:00", end: "8 PM", title: "Community Day", location: "", synopsis: "Pre show - Comm day programming" },
  { recordId: "reck9ewbIWiE2Vip3", date: "2026-11-02", start: "19:30", end: "", title: "Pre-Show", location: "", synopsis: "" },
  { recordId: "recglQak7tmxAmtTh", date: "2026-11-02", start: "20:00", end: "10 PM", title: "Awards Show", location: "", synopsis: "" },
  { recordId: "recsMDASLImwkxMtR", date: "2026-11-03", start: "08:00", end: "10 AM", title: "Wellness Activity", location: "", synopsis: "" },
  { recordId: "recxE2y592NSjNvwk", date: "2026-11-03", start: "09:00", end: "10 AM", title: "Pet Partners Therapy", location: "", synopsis: "" },
  { recordId: "recqQIjFXdxr6MotW", date: "2026-11-03", start: "10:30", end: "1:30 PM", title: "Summit Sessions", location: "", synopsis: "" },
  { recordId: "recLFXlYVKjuvciqO", date: "2026-11-03", start: "13:30", end: "3 PM", title: "Lunch", location: "", synopsis: "" },
  { recordId: "recNW0cs1iDUiFD8j", date: "2026-11-03", start: "15:00", end: "5 PM", title: "Summit Sessions", location: "", synopsis: "" },
  { recordId: "recqWqVI7SVLGxzbZ", date: "2026-11-03", start: "17:00", end: "6 PM", title: "Break", location: "", synopsis: "" },
  { recordId: "reckeE9Mq1qxew27Q", date: "2026-11-03", start: "18:30", end: "8 PM", title: "Dinner", location: "", synopsis: "" },
  { recordId: "recY4SSWSkGQ6mjy5", date: "2026-11-03", start: "20:30", end: "9:30 PM", title: "Evening Talk and Performance", location: "", synopsis: "" },
  { recordId: "recWEXmuPj69xtp9K", date: "2026-11-03", start: "22:00", end: "12 AM", title: "Late Night Pickleball and Sauna", location: "", synopsis: "" },
  { recordId: "rec3jSAntClzEBab9", date: "2026-11-04", start: "08:00", end: "10 AM", title: "Wellness Activity", location: "", synopsis: "" },
  { recordId: "rec5TkzYlxyq948U8", date: "2026-11-04", start: "09:00", end: "10 AM", title: "Pet Partners Therapy", location: "", synopsis: "" },
  { recordId: "rec8GNj1nnVeKZwX8", date: "2026-11-04", start: "10:30", end: "1:30 PM", title: "Summit Sessions", location: "", synopsis: "" },
  { recordId: "rec8qpvBq05aeXbXy", date: "2026-11-04", start: "13:30", end: "3 PM", title: "Lunch", location: "", synopsis: "" },
  { recordId: "recqeKNz6IJFAW9mX", date: "2026-11-04", start: "15:00", end: "5 PM", title: "Summit Sessions", location: "", synopsis: "" },
  { recordId: "recvtXIsglNDVaZ8A", date: "2026-11-04", start: "17:00", end: "6 PM", title: "Break", location: "", synopsis: "" },
  { recordId: "rec3fTaKafjwPxspL", date: "2026-11-04", start: "18:30", end: "10 PM", title: "Closing Celebration", location: "", synopsis: "Closing Celebration (Dinner, performance, auction - potentially offsite)" },
  { recordId: "recCLnNju8gSR3n9P", date: "2026-11-05", start: "", end: "", title: "Load Out", location: "", synopsis: "" },
  { recordId: "recRNOcxk1ollwgXL", date: "2026-11-05", start: "10:00", end: "", title: "Tennis", location: "", synopsis: "" },
  { recordId: "recfELG2YN53qesXg", date: "2026-11-05", start: "12:00", end: "", title: "High Tea", location: "", synopsis: "" }
];
