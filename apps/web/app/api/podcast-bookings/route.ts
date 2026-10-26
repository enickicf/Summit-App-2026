import { NextResponse } from "next/server";
import { podcasts2026 } from "../../../lib/podcasts-2026";
import { getAirtableTravelWindow } from "../../../lib/airtable";
import { availablePodcastSlots, bookingConflicts, bookingDurationMinutes, latestTravelWindow, podcastRequestConflicts, podcastRequestWindow, shortBookingConflicts, type BookingFormat } from "../../../lib/podcast-booking";
import { getSubmissionStore, newSubmission, podcastBookingPayloadSchema, type PodcastBookingPayload, type PodcastBookingSubmission } from "../../../lib/staff/store";
import { withSubmissionInbox } from "../../../lib/staff/submission-inbox";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store" };
const knownPodcasts = new Set(podcasts2026.map(entry => entry.show));

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams;
  const guestName = query.get("guestName")?.trim() ?? "";
  const format = query.get("format") as BookingFormat | null;
  const podcast = query.get("podcast")?.trim() ?? "";
  if (guestName.length < 2 || !knownPodcasts.has(podcast) || !format || !(format in bookingDurationMinutes)) return NextResponse.json({ ok: false, error: "Please choose a podcast, format and enter the interview guest’s full name." }, { status: 400, headers });
  if (format === "short") return NextResponse.json({ ok: true, shortForm: true, slots: [] }, { headers });
  const entry = podcasts2026.find(candidate => candidate.show === podcast)!;
  const [guestTravel, hostTravel, bookings] = await Promise.all([
    getAirtableTravelWindow(guestName),
    Promise.all(entry.hosts.map(host => getAirtableTravelWindow(host.name))),
    getSubmissionStore().then(store => store.list("podcastBooking"))
  ]);
  const travel = latestTravelWindow([guestTravel, ...hostTravel]);
  const slots = availablePodcastSlots(format, travel, bookings);
  return NextResponse.json({
    ok: true,
    travelVerified: Boolean(guestTravel?.arrivalUtc),
    arrivalKnown: Boolean(guestTravel?.arrivalUtc || guestTravel?.arrivalDate),
    requestWindow: podcastRequestWindow(slots),
    slots
  }, { headers });
}

export async function handlePodcastBookingPost(request: Request) {
  if (Number(request.headers.get("content-length") ?? 0) > 8_000) return NextResponse.json({ ok: false, error: "Request is too large." }, { status: 413, headers });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400, headers }); }
  const rawBookings = body && typeof body === "object" && "bookings" in body && Array.isArray((body as { bookings?: unknown }).bookings)
    ? (body as { bookings: unknown[] }).bookings : [body];
  if (rawBookings.length < 1 || rawBookings.length > 2) return NextResponse.json({ ok: false, error: "Choose one or both interview formats." }, { status: 400, headers });
  const requests: PodcastBookingPayload[] = [];
  for (const value of rawBookings) {
    const parsed = podcastBookingPayloadSchema.safeParse(value);
    if (!parsed.success) return NextResponse.json({ ok: false, error: "Please complete every booking field." }, { status: 400, headers });
    requests.push(parsed.data);
  }
  if (requests.some(data => data.website)) return NextResponse.json({ ok: true }, { headers });
  if (new Set(requests.map(data => data.format)).size !== requests.length) return NextResponse.json({ ok: false, error: "Choose each interview format once." }, { status: 400, headers });
  const first = requests[0]!;
  if (requests.some(data => data.podcast !== first.podcast || data.guestName !== first.guestName || data.email.toLowerCase() !== first.email.toLowerCase())) return NextResponse.json({ ok: false, error: "Both interview formats must be for the same guest and podcast." }, { status: 400, headers });
  if (!knownPodcasts.has(first.podcast)) return NextResponse.json({ ok: false, error: "That podcast is not available." }, { status: 400, headers });

  const store = await getSubmissionStore();
  const bookings = await store.list("podcastBooking");
  const prepared: PodcastBookingSubmission[] = [];
  for (const data of requests) {
    if (data.format === "short") {
      const candidate = { ...data, startUtc: "", endUtc: "", room: "" as const, travelVerified: false, arrivalLocal: "" };
      if (shortBookingConflicts(candidate, bookings)) return NextResponse.json({ ok: false, error: "This short-form interview request has already been received." }, { status: 409, headers });
      const { website: _website, ...payload } = candidate;
      prepared.push(newSubmission(payload));
      continue;
    }
    const entry = podcasts2026.find(candidate => candidate.show === data.podcast)!;
    const [guestTravel, hostTravel] = await Promise.all([
      getAirtableTravelWindow(data.guestName),
      Promise.all(entry.hosts.map(host => getAirtableTravelWindow(host.name)))
    ]);
    const travel = latestTravelWindow([guestTravel, ...hostTravel]);
    const slots = availablePodcastSlots(data.format, travel, bookings);
    const requestWindow = podcastRequestWindow(slots);
    if (!data.room) {
      if (!requestWindow || data.startUtc !== requestWindow.startUtc || data.endUtc !== requestWindow.endUtc) return NextResponse.json({ ok: false, error: "That interview window changed. Please review the current window and try again." }, { status: 409, headers });
      const candidate = { ...data, room: "" as const, travelVerified: Boolean(guestTravel?.arrivalUtc) };
      if (podcastRequestConflicts(candidate, bookings)) return NextResponse.json({ ok: false, error: "This long-form interview request has already been received." }, { status: 409, headers });
      const { website: _website, ...payload } = candidate;
      prepared.push(newSubmission(payload));
      continue;
    }
    const slot = slots.find(item => item.startUtc === data.startUtc && item.endUtc === data.endUtc && item.rooms.some(room => room === data.room));
    const candidate = { ...data, travelVerified: Boolean(guestTravel?.arrivalUtc) };
    if (!slot || bookingConflicts(candidate, bookings)) return NextResponse.json({ ok: false, error: "That room was just taken. Please choose another available room or time." }, { status: 409, headers });
    const { website: _website, ...payload } = candidate;
    prepared.push(newSubmission(payload));
  }
  for (const saved of prepared) await store.add("podcastBooking", saved);
  const answers = prepared.map(saved => ({ id: saved.id, podcast: saved.podcast, guestName: saved.guestName, format: saved.format, startUtc: saved.startUtc, endUtc: saved.endUtc, room: saved.room, travelVerified: saved.travelVerified }));
  return NextResponse.json({ ok: true, booking: answers[0], bookings: answers }, { headers });
}

export const POST = withSubmissionInbox("podcast-bookings", handlePodcastBookingPost);
