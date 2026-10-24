import type { AirtableTravelWindow } from "./airtable";
import type { PodcastBookingSubmission } from "./staff/store";

export const podcastRooms = ["Room 1", "Room 2", "Room 3"] as const;
export type PodcastRoom = (typeof podcastRooms)[number];
export type BookingFormat = "short" | "long";
export const bookingDurationMinutes: Record<BookingFormat, number> = { short: 20, long: 75 };

const zone = "America/Los_Angeles";
const days = ["2026-11-03", "2026-11-04"];

function localUtc(day: string, hour: number, minute: number) {
  const [year, month, date] = day.split("-").map(Number) as [number, number, number];
  let guess = Date.UTC(year, month - 1, date, hour + 8, minute);
  for (let i = 0; i < 2; i++) {
    const parts = Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone: zone, hourCycle: "h23", year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric" }).formatToParts(new Date(guess)).map(part => [part.type, part.value]));
    guess += Date.UTC(year, month - 1, date, hour, minute) - Date.UTC(+parts.year!, +parts.month! - 1, +parts.day!, +parts.hour!, +parts.minute!);
  }
  return new Date(guess);
}

export function selfReportedTravelWindow(value: string): AirtableTravelWindow | null {
  const match = /^(2026-(?:10|11)-\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const arrival = localUtc(match[1]!, Number(match[2]), Number(match[3]));
  return Number.isFinite(arrival.getTime()) ? { arrivalUtc: arrival.toISOString(), arrivalDate: match[1]!, exact: false } : null;
}

const overlaps = (start: number, end: number, booking: Pick<PodcastBookingSubmission, "startUtc" | "endUtc">) => start < Date.parse(booking.endUtc) && end > Date.parse(booking.startUtc);

export function availablePodcastSlots(format: BookingFormat, travel: AirtableTravelWindow | null, bookings: PodcastBookingSubmission[]) {
  const duration = bookingDurationMinutes[format];
  const earliest = travel?.arrivalUtc ? Date.parse(travel.arrivalUtc) + 3 * 60 * 60 * 1000
    : travel?.arrivalDate ? localUtc(travel.arrivalDate, 23, 59).getTime() : null;
  const slots: { startUtc: string; endUtc: string; rooms: PodcastRoom[] }[] = [];
  for (const day of days) {
    for (let minutes = 9 * 60; minutes + duration <= 17 * 60; minutes += format === "long" ? 90 : 30) {
      const start = localUtc(day, Math.floor(minutes / 60), minutes % 60).getTime();
      const end = start + duration * 60_000;
      if (earliest !== null && start < earliest) continue;
      const rooms = podcastRooms.filter(room => !bookings.some(booking => booking.room === room && overlaps(start, end, booking)));
      if (rooms.length) slots.push({ startUtc: new Date(start).toISOString(), endUtc: new Date(end).toISOString(), rooms });
    }
  }
  return slots;
}

export function bookingConflicts(candidate: Pick<PodcastBookingSubmission, "startUtc" | "endUtc" | "room" | "guestName" | "podcast">, bookings: PodcastBookingSubmission[]) {
  const start = Date.parse(candidate.startUtc), end = Date.parse(candidate.endUtc);
  return bookings.some(booking => overlaps(start, end, booking) && (booking.room === candidate.room || booking.guestName.toLowerCase() === candidate.guestName.toLowerCase() || booking.podcast === candidate.podcast));
}
