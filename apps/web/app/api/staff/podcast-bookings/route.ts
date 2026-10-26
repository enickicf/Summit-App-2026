import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { availablePodcastSlots } from "../../../../lib/podcast-booking";
import { isPodcastStaffSession, isStaffSession, podcastStaffCookieName, staffCookieName } from "../../../../lib/staff/auth";
import { getSubmissionStore, type PodcastBookingSubmission, type SubmissionStore } from "../../../../lib/staff/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store" };

type MutationResult = { ok: true; action: "rescheduled" | "removed"; record: PodcastBookingSubmission } | { ok: false; status: number; error: string };

export async function mutatePodcastBooking(store: SubmissionStore, id: string, action: string, slotValue = ""): Promise<MutationResult> {
  const bookings = await store.list("podcastBooking");
  const record = bookings.find(booking => booking.id === id);
  if (!record) return { ok: false, status: 404, error: "Podcast booking not found." };

  if (action === "remove") {
    await store.delete("podcastBooking", record);
    return { ok: true, action: "removed", record };
  }
  if (action !== "reschedule") return { ok: false, status: 400, error: "Choose reschedule or remove." };
  if (record.format !== "long") return { ok: false, status: 400, error: "Short-form interviews happen after the red carpet walk and do not have a scheduled time." };

  const separator = slotValue.lastIndexOf("|");
  const startUtc = separator > 0 ? slotValue.slice(0, separator) : "";
  const room = separator > 0 ? slotValue.slice(separator + 1) : "";
  const otherBookings = bookings.filter(booking => booking.id !== record.id);
  const slot = availablePodcastSlots("long", null, otherBookings).find(candidate => candidate.startUtc === startUtc && candidate.rooms.some(candidateRoom => candidateRoom === room));
  if (!slot || !["Room 1", "Room 2", "Room 3"].includes(room)) return { ok: false, status: 409, error: "That room and time are no longer available. Refresh and choose another option." };

  const updated: PodcastBookingSubmission = { ...record, startUtc: slot.startUtc, endUtc: slot.endUtc, room: room as PodcastBookingSubmission["room"] };
  await store.add("podcastBooking", updated);
  return { ok: true, action: "rescheduled", record: updated };
}

async function authorized() {
  const jar = await cookies();
  return isStaffSession(jar.get(staffCookieName)?.value) || isPodcastStaffSession(jar.get(podcastStaffCookieName)?.value);
}

const redirectToPortal = (params: Record<string, string>) => {
  const query = new URLSearchParams(params);
  return new NextResponse(null, { status: 303, headers: { Location: `/staff?${query.toString()}#podcast-bookings`, ...headers } });
};

export async function POST(request: Request) {
  if (!(await authorized())) return NextResponse.json({ ok: false, error: "Sign in required." }, { status: 401, headers });
  const type = request.headers.get("content-type") ?? "";
  const fromForm = !type.includes("application/json");
  let id = "", action = "", slot = "";
  if (fromForm) {
    const form = await request.formData().catch(() => null);
    id = String(form?.get("id") ?? ""); action = String(form?.get("action") ?? ""); slot = String(form?.get("slot") ?? "");
  } else {
    const body = await request.json().catch(() => ({})) as Record<string, unknown>;
    id = String(body.id ?? ""); action = String(body.action ?? ""); slot = String(body.slot ?? "");
  }
  const result = await mutatePodcastBooking(await getSubmissionStore(), id, action, slot);
  if (!result.ok) return fromForm ? redirectToPortal({ podcastError: result.error }) : NextResponse.json(result, { status: result.status, headers });
  return fromForm ? redirectToPortal({ podcastAction: result.action }) : NextResponse.json(result, { headers });
}
