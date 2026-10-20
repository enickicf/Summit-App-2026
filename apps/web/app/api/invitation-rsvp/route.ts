import { withSubmissionInbox } from "../../../lib/staff/submission-inbox";
import {invitationWaiverLinks,sendWaiverLinks} from "../../../lib/staff/attendee-waiver";
import { sendInvitationReceipt } from "../../../lib/staff/request-receipt";
import type { Sender } from "../../../lib/staff/rsvp-email";
import { invitationSchema, saveInvitation } from "../../../lib/staff/invitation-rsvp";
import { getSubmissionStore, type SubmissionStore } from "../../../lib/staff/store";
import { corsHeaders } from "../rsvp/route";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function OPTIONS(request: Request) { return new Response(null, { status: 204, headers: corsHeaders(request.headers.get("origin")) }); }
export async function handleInvitationPost(request: Request, store?: SubmissionStore, sender?: Sender | null): Promise<Response> {
  const headers = corsHeaders(request.headers.get("origin"));
  const respond = (body: object, status = 200) => Response.json(body, { status, headers });
  let body: unknown;
  try { const raw = await request.text(); if (raw.length > 30000) return respond({ ok: false, error: "Request is too large." }, 413); body = JSON.parse(raw); }
  catch { return respond({ ok: false, error: "Invalid RSVP request." }, 400); }
  const parsed = invitationSchema.safeParse(body);
  if (!parsed.success) return respond({ ok: false, error: parsed.error.issues[0]?.code === "custom" ? parsed.error.issues[0].message : "Please provide a name, valid email, phone, organization and title for every ticket holder, within the event limits." }, 400);
  const p = parsed.data;
  if (p.website) return respond({ ok: true });
  const age = Date.now() - Date.parse(p.requestedAt);
  if (age < -300000 || age > 30 * 86400000) return respond({ ok: false, error: "Please check your device date and reload the form before submitting." }, 400);
  try { const target = store ?? await getSubmissionStore(); const counts = await saveInvitation(p, target); await sendInvitationReceipt(p, target, sender); const waiverLinks=await invitationWaiverLinks(p,target);const waiverEmailStatus=await sendWaiverLinks(waiverLinks,target,sender); return respond({ ok: true, counts, requestId: p.requestId, waiverLinks:waiverLinks.map(({name,url})=>({name,url})),waiverEmailStatus }); }
  catch { return respond({ ok: false, retryable: true, error: "We could not finish saving every event. Keep this page open and retry the same request; any saved entries will not be duplicated." }, 503); }
}
async function postWithoutInbox(request: Request) { return handleInvitationPost(request); }

// Oct 19: every request is stored in the submission inbox before validation (lib/staff/submission-inbox.ts).
export const POST = withSubmissionInbox("invitation-rsvp", postWithoutInbox);
