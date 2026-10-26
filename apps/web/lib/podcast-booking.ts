import type { AirtableTravelWindow } from "./airtable";
import type { PodcastBookingSubmission } from "./staff/store";

export const podcastRooms = ["Room 1", "Room 2", "Room 3"] as const;
export type PodcastRoom = (typeof podcastRooms)[number];
export type BookingFormat = "short" | "long";
export const bookingDurationMinutes: Record<BookingFormat, number> = { short: 20, long: 75 };

const zone = "America/Los_Angeles";
const longFormDays = ["2026-11-03", "2026-11-04"];

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

function availabilityCutoff(travel: AirtableTravelWindow) {
  return travel.arrivalUtc ? Date.parse(travel.arrivalUtc) + 3 * 60 * 60 * 1000
    : travel.arrivalDate ? localUtc(travel.arrivalDate, 23, 59).getTime() : Number.NEGATIVE_INFINITY;
}

/** Uses the latest recorded arrival across the guest and podcast hosts. Missing travel defaults to 10 AM. */
export function latestTravelWindow(windows: Array<AirtableTravelWindow | null>): AirtableTravelWindow | null {
  return windows.filter((window): window is AirtableTravelWindow => Boolean(window))
    .sort((a, b) => availabilityCutoff(b) - availabilityCutoff(a))[0] ?? null;
}

export function availablePodcastSlots(format: BookingFormat, travel: AirtableTravelWindow | null, bookings: PodcastBookingSubmission[]) {
  const duration = bookingDurationMinutes[format];
  const earliest = travel?.arrivalUtc ? Date.parse(travel.arrivalUtc) + 3 * 60 * 60 * 1000
    : travel?.arrivalDate ? localUtc(travel.arrivalDate, 23, 59).getTime() : null;
  const slots: { startUtc: string; endUtc: string; rooms: PodcastRoom[] }[] = [];
  // Short form has no scheduled time: it happens after the guest's red-carpet walk.
  if (format === "short") return [];
  // Full-length interviews are daytime recordings beginning at 10:00 AM, or after the
  // latest recorded guest/podcast arrival when that is later.
  const windows = longFormDays.map(day => ({ day, start: 10 * 60, end: 17 * 60, step: 90 }));
  for (const { day, start: windowStart, end: windowEnd, step } of windows) {
    for (let minutes = windowStart; minutes + duration <= windowEnd; minutes += step) {
      const start = localUtc(day, Math.floor(minutes / 60), minutes % 60).getTime();
      const end = start + duration * 60_000;
      if (earliest !== null && start < earliest) continue;
      const rooms = podcastRooms.filter(room => !bookings.some(booking => booking.room === room && overlaps(start, end, booking)));
      if (rooms.length) slots.push({ startUtc: new Date(start).toISOString(), endUtc: new Date(end).toISOString(), rooms });
    }
  }
  return slots;
}

export function shortBookingConflicts(candidate: Pick<PodcastBookingSubmission, "guestName" | "podcast" | "format">, bookings: PodcastBookingSubmission[]) {
  return candidate.format === "short" && bookings.some(booking => booking.format === "short"
    && booking.podcast === candidate.podcast && booking.guestName.toLowerCase() === candidate.guestName.toLowerCase());
}

export function bookingConflicts(candidate: Pick<PodcastBookingSubmission, "startUtc" | "endUtc" | "room" | "guestName">, bookings: PodcastBookingSubmission[]) {
  const start = Date.parse(candidate.startUtc), end = Date.parse(candidate.endUtc);
  // Several interviews may run at the same time. A conflict exists only when the selected room is
  // occupied or the same guest would be in two places at once; another room keeps the time available.
  return bookings.some(booking => overlaps(start, end, booking) && (booking.room === candidate.room || booking.guestName.toLowerCase() === candidate.guestName.toLowerCase()));
}
