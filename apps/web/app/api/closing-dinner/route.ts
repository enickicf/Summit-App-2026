import { withSubmissionInbox } from "../../../lib/staff/submission-inbox";
import {dinnerWaiverLinks,sendWaiverLinks} from "../../../lib/staff/attendee-waiver";
import { waiverMatchesAttendee, waiverProblemMessage, waiverReadyForSubmission } from "../../../lib/event-waiver";
import { sendRequestReceipt } from "../../../lib/staff/request-receipt";
import type { Sender } from "../../../lib/staff/rsvp-email";
import { NextResponse } from "next/server";
import { closingDinnerGuestProblem, closingDinnerPayloadSchema, getSubmissionStore, newRetrySafeSubmission, type SubmissionStore } from "../../../lib/staff/store";
import { corsHeaders } from "../rsvp/route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Owner / Ryan (Oct 13): the closing night dinner request form (RSVP site, closing-dinner-yiqy7fw0j3) posts here, through the
// RSVP site's proxy or directly on notaloneawards.org/rsvp/... . Stored as kind "closingDinner" for the staff portal's
// Closing Dinner tab. A request is not a confirmed seat; a receipt is emailed after saving.
export async function OPTIONS(request: Request) {
  return new Response(null, { status: 204, headers: corsHeaders(request.headers.get("origin")) });
}

const messages: Record<string, string> = {
  name: "Please enter your full name.",
  email: "Please enter a valid email address.",
  phone: "Please enter a phone number.",
  organization: "Please add your organization.",
  professionalRole: "Please add your title.",
  guestEmail: "Please add a valid email address for your guest."
};

export async function handleClosingDinnerPost(request: Request, store?: SubmissionStore, sender?: Sender | null): Promise<Response> {
  const headers = corsHeaders(request.headers.get("origin"));
  if (Number(request.headers.get("content-length") ?? 0) > 10_000) return NextResponse.json({ ok: false, error: "Request is too large." }, { status: 413, headers });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400, headers }); }
  const parsed = closingDinnerPayloadSchema.safeParse(body);
  if (!parsed.success) {
    const field = String(parsed.error.issues[0]?.path[0] ?? "");
    return NextResponse.json({ ok: false, field, error: messages[field] ?? "Please check the form and try again." }, { status: 400, headers });
  }
  const { website, ...payload } = parsed.data;
  if (!waiverMatchesAttendee(payload.eventWaiver,payload.name)) return NextResponse.json({ok:false,error:"The waiver must be signed personally by the named attendee."},{status:400,headers});
  if (website) return NextResponse.json({ ok: true }, { status: 201, headers }); // honeypot: pretend success, store nothing
  if (!waiverReadyForSubmission(payload.eventWaiver,payload.name)) return NextResponse.json({ok:false,error:waiverProblemMessage(payload.eventWaiver,payload.name)},{status:400,headers});
  if (payload.bringingGuest && !waiverMatchesAttendee(payload.guestEventWaiver,payload.guestName)) return NextResponse.json({ok:false,error:"The guest waiver must be signed personally by the named guest."},{status:400,headers});
  if (payload.bringingGuest && !payload.groupWaiverAttestation) return NextResponse.json({ok:false,error:"Please complete the required group agreement for your guest."},{status:400,headers});
  const problem = closingDinnerGuestProblem(payload);
  if (problem) return NextResponse.json({ ok: false, ...problem }, { status: 400, headers });
  const record = payload.bringingGuest ? payload : { ...payload, guestName: "", guestEmail: "", guestPhone: "" };
  const target = store ?? await getSubmissionStore();
  const saved = newRetrySafeSubmission(record);
  try {
    await target.add("closingDinner", saved);
  } catch (error) {
    console.error("closing dinner store failed", error instanceof Error ? error.message : error);
    return NextResponse.json({ ok: false, error: "We couldn’t save your request. Please try again; your details are still here." }, { status: 500, headers });
  }
  await sendRequestReceipt(saved.id, saved.name, saved.email, [`Closing dinner with Jewel: ${record.bringingGuest ? 2 : 1} seat(s)`], target, sender);
  const links=await dinnerWaiverLinks(saved);const waiverEmailStatus=await sendWaiverLinks(links,target,sender);
  return NextResponse.json({ ok: true,requestId:saved.id,waiverLinks:links.map(({name,url})=>({name,url})),waiverEmailStatus }, { status: 201, headers });
}

async function postWithoutInbox(request: Request) {
  return handleClosingDinnerPost(request);
}

// Oct 19: every request is stored in the submission inbox before validation (lib/staff/submission-inbox.ts).
export const POST = withSubmissionInbox("closing-dinner", postWithoutInbox);
