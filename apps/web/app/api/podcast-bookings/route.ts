import { NextResponse } from "next/server";
import { podcasts2026 } from "../../../lib/podcasts-2026";
import { getAirtableTravelWindow } from "../../../lib/airtable";
import { availablePodcastSlots, bookingConflicts, bookingDurationMinutes, latestTravelWindow, shortBookingConflicts, type BookingFormat } from "../../../lib/podcast-booking";
import { getSubmissionStore, newSubmission, podcastBookingPayloadSchema } from "../../../lib/staff/store";
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
  return NextResponse.json({
    ok: true,
    travelVerified: Boolean(guestTravel?.arrivalUtc),
    arrivalKnown: Boolean(guestTravel?.arrivalUtc || guestTravel?.arrivalDate),
    slots: availablePodcastSlots(format, travel, bookings)
  }, { headers });
}

export async function handlePodcastBookingPost(request: Request) {
  if (Number(request.headers.get("content-length") ?? 0) > 8_000) return NextResponse.json({ ok: false, error: "Request is too large." }, { status: 413, headers });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400, headers }); }
  const parsed = podcastBookingPayloadSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Please complete every booking field." }, { status: 400, headers });
  if (parsed.data.website) return NextResponse.json({ ok: true }, { headers });
  if (!knownPodcasts.has(parsed.data.podcast)) return NextResponse.json({ ok: false, error: "That podcast is not available." }, { status: 400, headers });

  const store = await getSubmissionStore();
  const bookings = await store.list("podcastBooking");
  if (parsed.data.format === "short") {
    const candidate = { ...parsed.data, startUtc: "", endUtc: "", room: "" as const, travelVerified: false, arrivalLocal: "" };
    if (shortBookingConflicts(candidate, bookings)) return NextResponse.json({ ok: false, error: "This short-form interview request has already been received." }, { status: 409, headers });
    const { website: _website, ...payload } = candidate;
    const saved = newSubmission(payload);
    await store.add("podcastBooking", saved);
    return NextResponse.json({ ok: true, booking: { id: saved.id, podcast: saved.podcast, guestName: saved.guestName, format: saved.format, startUtc: "", endUtc: "", room: "", travelVerified: false } }, { headers });
  }
  const entry = podcasts2026.find(candidate => candidate.show === parsed.data.podcast)!;
  const [guestTravel, hostTravel] = await Promise.all([
    getAirtableTravelWindow(parsed.data.guestName),
    Promise.all(entry.hosts.map(host => getAirtableTravelWindow(host.name)))
  ]);
  const travel = latestTravelWindow([guestTravel, ...hostTravel]);
  const slots = availablePodcastSlots(parsed.data.format, travel, bookings);
  const slot = slots.find(item => item.startUtc === parsed.data.startUtc && item.endUtc === parsed.data.endUtc && item.rooms.some(room => room === parsed.data.room));
  const candidate = { ...parsed.data, travelVerified: Boolean(guestTravel?.arrivalUtc) };
  if (!slot || bookingConflicts(candidate, bookings)) return NextResponse.json({ ok: false, error: "That time or room was just taken. Please choose another option." }, { status: 409, headers });
  const { website: _website, ...payload } = candidate;
  const saved = newSubmission(payload);
  await store.add("podcastBooking", saved);
  return NextResponse.json({ ok: true, booking: { id: saved.id, podcast: saved.podcast, guestName: saved.guestName, format: saved.format, startUtc: saved.startUtc, endUtc: saved.endUtc, room: saved.room, travelVerified: saved.travelVerified } }, { headers });
}

export const POST = withSubmissionInbox("podcast-bookings", handlePodcastBookingPost);
