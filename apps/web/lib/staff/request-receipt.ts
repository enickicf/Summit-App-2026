import { createHash } from "node:crypto";
import { defaultSender, type Sender, type RenderedEmail } from "./rsvp-email";
import { newSubmission, type SubmissionStore } from "./store";
import type { InvitationPayload } from "./invitation-rsvp";

export const receiptStatus = "We’ve received your ticket request. Your tickets are not yet confirmed. When they’re confirmed, our team will contact you by email and/or text with confirmation and ticketing information. Please complete any pending personal waiver using the private link provided after registration.";
const escapeHtml = (s: string) => s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
export function requestReceipt(name: string, events: string[]): RenderedEmail {
  const subject = "We received your request – Not Alone";
  const greeting = `Hi ${name.trim().split(/\s+/)[0] || "there"},`;
  const text = [greeting,"",receiptStatus,"","Your request",...events,"","Questions? Just reply to this email.","","With gratitude,","The Not Alone team","Inspiring Children Foundation"].join("\n");
  const html = `<!doctype html><html><body style="margin:0;background:#f4f4f6;font-family:Arial,sans-serif;color:#202024"><div style="max-width:560px;margin:24px auto;padding:32px;background:#fff"><h1 style="font-size:24px">We received your request</h1><p>${escapeHtml(greeting)}</p><p style="font-size:16px;line-height:1.6">${escapeHtml(receiptStatus)}</p><h2 style="font-size:18px">Your request</h2><ul>${events.map(e=>`<li style="margin:8px 0;line-height:1.5">${escapeHtml(e)}</li>`).join("")}</ul><p>Questions? Just reply to this email.</p><p>With gratitude,<br>The Not Alone team<br>Inspiring Children Foundation</p></div></body></html>`;
  return {subject,text,html};
}
// Only called after all request records are saved. Receipts never grant admission.
// A stable receipt ID prevents normal retries from emailing the requester twice.
export async function sendRequestReceipt(id: string, name: string, email: string, events: string[], store: SubmissionStore, sender: Sender | null = defaultSender()) {
  if (!sender) return "no-mailer";
  try {
    if ((await store.list("rsvpEmail")).some(r=>r.id===id)) return "skipped";
    const rendered = requestReceipt(name,events);
    await sender({to:email,...rendered});
    await store.add("rsvpEmail",{...newSubmission({email,subject:rendered.subject,rsvpId:id}),id});
    return "sent";
  } catch { console.error("Request receipt could not be delivered; saved RSVP is intact."); return "failed"; }
}
export function sendInvitationReceipt(p: InvitationPayload, store: SubmissionStore, sender?: Sender | null) {
  const events = [p.day.length ? `Nevada Mental Health Day: ${p.day.length} ticket(s)` : "",p.awards.length ? `Not Alone Awards Show: ${p.awards.length} ticket(s)` : "",p.dinner.length ? `Closing dinner with Jewel: ${p.dinner.length} seat(s)` : ""].filter(Boolean);
  const id = `invitation-receipt-${createHash("sha256").update(JSON.stringify(p)).digest("hex")}`;
  return sendRequestReceipt(id,p.requester.name,p.requester.email,events,store,sender);
}
