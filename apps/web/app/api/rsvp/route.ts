import { waiverMatchesAttendee, waiverReadyForSubmission } from "../../../lib/event-waiver";
import { NextResponse } from "next/server";
import { getSubmissionStore, missingVipFields, newRetrySafeSubmission, partyGuestsIncomplete, rsvpPayloadSchema, type SubmissionStore } from "../../../lib/staff/store";
import { sendRsvpConfirmation, type Sender } from "../../../lib/staff/rsvp-email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Owner (Sept 23): the Awards RSVP form (Netlify site not-alone-awards-rsvp-2026) now submits here; the
// request is stored for the staff portal, then a copy is forwarded to the previous Codex-hosted RSVP
// backend so nothing that still reads that store is left behind (best effort, never blocks the guest).
export const legacyRsvpUrl = "https://not-alone-awards-rsvp-2026.sethporterw.chatgpt.site/api/rsvp/";
export const allowedFormOrigins = ["https://not-alone-awards-rsvp-2026.netlify.app", "https://notalonesummit.org", "https://notaloneawards.org", "https://www.notalonesummit.org", "https://www.notaloneawards.org"];

export function corsHeaders(origin: string | null): Record<string, string> {
  const allowed = origin && allowedFormOrigins.includes(origin) ? origin : allowedFormOrigins[0]!;
  return { "Access-Control-Allow-Origin": allowed, "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type", Vary: "Origin", "Cache-Control": "no-store" };
}

export async function OPTIONS(request: Request) {
  return new Response(null, { status: 204, headers: corsHeaders(request.headers.get("origin")) });
}

export async function handleRsvpPost(request: Request, store?: SubmissionStore, forward: (payload: unknown) => Promise<void> = forwardToLegacy, sender?: Sender | null): Promise<Response> {
  const headers = corsHeaders(request.headers.get("origin"));
  if (Number(request.headers.get("content-length") ?? 0) > 20_000) return NextResponse.json({ ok: false, error: "Request is too large." }, { status: 413, headers });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ ok: false, error: "Invalid RSVP submission." }, { status: 400, headers }); }
  const parsed = rsvpPayloadSchema.safeParse(body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const message = issue?.path[0] === "name" ? "Please enter your full name." : issue?.path[0] === "email" ? "Please enter a valid email address." : issue?.path[0] === "attendanceStatus" ? "Please select a valid response." : issue?.path[0] === "guests" ? partyGuestsMessage : "Please check the form and try again.";
    return NextResponse.json({ ok: false, error: message }, { status: 400, headers });
  }
  const { website, ...payload } = parsed.data;
  if (!waiverMatchesAttendee(payload.eventWaiver,payload.name)) return NextResponse.json({ok:false,error:"The waiver must be signed personally by the named attendee."},{status:400,headers});
  if (website) return NextResponse.json({ ok: true }, { headers }); // honeypot: pretend success, store nothing
  // Owner (Oct 5): every additional person in the party needs a name, an email and a phone number.
  if (payload.phone.replace(/\D/g, "").length < 7 || partyGuestsIncomplete(payload)) return NextResponse.json({ ok: false, error: partyGuestsMessage }, { status: 400, headers });
  if(!payload.organization.trim()||!payload.professionalRole.trim()||!payload.invitedBy.trim())return NextResponse.json({ok:false,error:"Please complete your organization, title and who invited you."},{status:400,headers});
  if((payload.guests??[]).some(guest=>!guest.organization?.trim()||!guest.professionalRole?.trim()))return NextResponse.json({ok:false,error:partyGuestsMessage},{status:400,headers});
  const partyEmails=[payload.email,...(payload.guests??[]).map(guest=>guest.email)];
  if(new Set(partyEmails).size!==partyEmails.length)return NextResponse.json({ok:false,error:"Please use a different email address for every person in your party."},{status:400,headers});
  const partyLimit=payload.attending==="community-day"?2:10;
  if(payload.guestCount>partyLimit)return NextResponse.json({ok:false,error:`This RSVP allows up to ${partyLimit} people total.`},{status:400,headers});
  if(payload.guestCount>1&&!payload.groupWaiverAttestation)return NextResponse.json({ok:false,error:"Please complete the required group agreement for every guest in your request."},{status:400,headers});
  if(!waiverReadyForSubmission(payload.eventWaiver,payload.name))return NextResponse.json({ok:false,error:"Please personally accept every agreement and sign the waiver before submitting."},{status:400,headers});
  const missing = missingVipFields(payload);
  if (missing.length) return NextResponse.json({ ok: false, error: `Please add ${missing.join(", ")} so the team can seat you.` }, { status: 400, headers });
  const target = store ?? await getSubmissionStore();
  const record = newRetrySafeSubmission(payload);
  try {
    await target.add("rsvp", record); // Oct 1: VIP and standard requests share one store (the forms differ)
  } catch (error) {
    console.error("rsvp store failed", error instanceof Error ? error.message : error);
    return NextResponse.json({ ok: false, error: "We could not save your RSVP. Please try again." }, { status: 500, headers });
  }
  // The previous backend keeps receiving exactly the fields it always did (no guest list).
  await forward(withoutGuestList(body)).catch(() => undefined);
  // Owner (Sept 28): automatic waiting-list confirmation email; best effort, never fails the guest's RSVP.
  await (sender === undefined ? sendRsvpConfirmation(record, target) : sendRsvpConfirmation(record, target, sender)).catch(() => undefined);
  return NextResponse.json({ ok: true, requestId: record.id }, { headers });
}

const partyGuestsMessage = "Please complete every required field, including a unique email and cell number, for every person in your party.";
function withoutGuestList(body: unknown): unknown {
  if (!body || typeof body !== "object" || Array.isArray(body)) return body;
  const { guests: _guests, ...rest } = body as Record<string, unknown>;
  return rest;
}

async function forwardToLegacy(payload: unknown): Promise<void> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6000);
  try {
    await fetch(legacyRsvpUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload), signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export async function POST(request: Request) {
  return handleRsvpPost(request);
}
