import { awards2026Editorial } from "../awards-editorial";
import { newSubmission, wantsCommunityDay, type RsvpAttending, type RsvpEmailRecord, type RsvpSubmission, type SubmissionStore } from "./store";

// Owner (Sept 28, 2026; wording Oct 3): every Awards RSVP gets an automatic confirmation email. It thanks the guest,
// says plainly that the RSVP is not a ticket, that they are on the waiting list, and that the team will
// reach out about their ticket. Facts here are the approved Awards facts only (date, venue, evening times).
export type RsvpEmailInput = Pick<RsvpSubmission, "name" | "email" | "guestCount" | "communityDay" | "attendanceStatus"> & { attending?: RsvpAttending | undefined };
// Oct 6: three cases: Awards Show + Community Day, Awards Show only, Community Day only.
type Plan = "both" | "awards" | "communityDay";
const planFor = (guest: { attending?: RsvpAttending | undefined; communityDay: boolean }): Plan => guest.attending === "community-day" ? "communityDay" : wantsCommunityDay(guest) ? "both" : "awards";
export type RenderedEmail = { subject: string; text: string; html: string };

// Aphrah (Oct 3, 2026): Community Day 5:45–7:15 PM; the Awards Show starts at 7:30 PM.
const evening = "Doors open 5:30 PM · Community Day 5:45–7:15 PM · Awards Show 7:30–10:00 PM";
const showOnlyEvening = "Doors open 5:30 PM · Awards Show 7:30–10:00 PM";
const communityDayOnlyEvening = "Doors open 5:30 PM · Community Day 5:45–7:15 PM";
// Owner (Oct 4, 2026): a guest who asked for Community Day is confirmed for Community Day and the Not Alone
// Awards Show; everyone else for the Not Alone Awards Show only.
const eventsFor = (plan: Plan) => plan === "both" ? "Community Day and the Not Alone Awards Show" : plan === "communityDay" ? "Community Day" : "the Not Alone Awards Show";
const firstName = (name: string) => name.trim().split(/\s+/)[0] || "there";
const esc = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function rsvpConfirmationEmail(guest: RsvpEmailInput): RenderedEmail {
  const party = guest.guestCount === 1 ? "1 guest (you)" : `${guest.guestCount} guests`;
  const plan = planFor(guest);
  const events = eventsFor(plan);
  const attending = plan === "both" ? "Community Day + Not Alone Awards Show" : plan === "communityDay" ? "Community Day" : "Not Alone Awards Show";
  const eveningLine = plan === "both" ? evening : plan === "communityDay" ? communityDayOnlyEvening : showOnlyEvening;
  const subject = plan === "both" ? "We received your RSVP – Community Day & Not Alone Awards Show" : plan === "communityDay" ? "We received your RSVP – Community Day" : "We received your RSVP – Not Alone Awards Show";
  const lines = [
    `Hi ${firstName(guest.name)},`,
    "",
    `Thank you for your RSVP to ${events}. This email confirms we received your submission.`,
    "",
    "Your request is on our ticket waiting list. Seating at the Encore Theater is limited, and this RSVP is not a ticket. If you are removed from the waiting list, we will reach out by email with your tickets. Nothing more is needed from you right now.",
    "",
    "Your request",
    `Name: ${guest.name}`,
    `Party size: ${party}`,
    `Attending: ${attending}`,
    "",
    "The evening",
    `${awards2026Editorial.date} · ${awards2026Editorial.venue}`,
    eveningLine,
    "",
    "This ticket is free. Your support makes it possible.",
    `Support Inspiring Children Foundation: ${awards2026Editorial.donateUrl}`,
    "",
    "Questions? Just reply to this email.",
    "",
    "With gratitude,",
    "The Not Alone Awards team",
    "Inspiring Children Foundation",
    "https://notaloneawards.org"
  ];
  const html = `<!doctype html><html><body style="margin:0;padding:0;background:#f4f5fa;font-family:Helvetica,Arial,sans-serif;color:#1c1a2e">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f5fa;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden">
<tr><td style="background:#1c1a2e;padding:28px 32px;text-align:center"><img src="https://notaloneawards.org/images/na-awards-logo-white.png" alt="Not Alone Awards" width="220" style="width:220px;max-width:70%;height:auto;display:inline-block"><p style="margin:14px 0 0;color:#bdc7c5;font-size:13px;letter-spacing:0.04em;text-transform:uppercase">Powered by the Steven &amp; Alexandra Cohen Foundation</p></td></tr>
<tr><td style="padding:32px 32px 8px;font-size:17px;line-height:1.6">
<p style="margin:0 0 16px">Hi ${esc(firstName(guest.name))},</p>
<p style="margin:0 0 16px">Thank you for your RSVP to ${plan === "both" ? "<strong>Community Day</strong> and the <strong>Not Alone Awards Show</strong>" : plan === "communityDay" ? "<strong>Community Day</strong>" : "the <strong>Not Alone Awards Show</strong>"}. This email confirms we received your submission.</p>
<p style="margin:0 0 16px;padding:16px 18px;background:#f4f5fa;border-left:4px solid #4a5faa;border-radius:8px">Your request is on our <strong>ticket waiting list</strong>. Seating at the Encore Theater is limited, and this RSVP is not a ticket. <strong>If you are removed from the waiting list, we will reach out by email with your tickets.</strong> Nothing more is needed from you right now.</p>
</td></tr>
<tr><td style="padding:8px 32px">
<table role="presentation" cellspacing="0" cellpadding="0" style="font-size:15px;line-height:1.6;color:#1c1a2e"><tr><td style="padding:0 0 6px;color:#4a5faa;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:0.06em">Your request</td></tr>
<tr><td>${esc(guest.name)} &middot; ${esc(party)} &middot; ${esc(attending)}</td></tr></table>
</td></tr>
<tr><td style="padding:20px 32px 8px">
<table role="presentation" cellspacing="0" cellpadding="0" style="font-size:15px;line-height:1.6;color:#1c1a2e"><tr><td style="padding:0 0 6px;color:#4a5faa;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:0.06em">The evening</td></tr>
<tr><td><strong>${esc(awards2026Editorial.date)}</strong><br>${esc(awards2026Editorial.venue)}<br>${esc(eveningLine)}</td></tr></table>
</td></tr>
<tr><td style="padding:24px 32px 8px;text-align:center"><p style="margin:0 0 12px;font-size:16px;font-weight:700">This ticket is free. Your support makes it possible.</p><a href="${awards2026Editorial.donateUrl}" style="display:inline-block;background:#4a5faa;color:#ffffff;text-decoration:none;font-weight:700;padding:12px 26px;border-radius:999px;font-size:15px">Support Inspiring Children Foundation</a></td></tr>
<tr><td style="padding:24px 32px 32px;font-size:15px;line-height:1.6"><p style="margin:0 0 14px">Questions? Just reply to this email.</p><p style="margin:0">With gratitude,<br><strong>The Not Alone Awards team</strong><br>Inspiring Children Foundation</p></td></tr>
<tr><td style="background:#f4f5fa;padding:16px 32px;text-align:center;font-size:12px;color:#666666"><a href="https://notaloneawards.org" style="color:#4a5faa;text-decoration:none">notaloneawards.org</a> &middot; <a href="https://notalonesummit.org" style="color:#4a5faa;text-decoration:none">notalonesummit.org</a></td></tr>
</table></td></tr></table></body></html>`;
  return { subject, text: lines.join("\n"), html };
}

// SMTP sender (Gmail / Google Workspace app password by default). All server-only; unset = no email is sent.
export type MailerConfig = { host: string; port: number; user: string; pass: string; from: string; replyTo: string; bcc?: string };
export type MailerEnv = Partial<Record<"RSVP_EMAIL_SMTP_HOST" | "RSVP_EMAIL_SMTP_PORT" | "RSVP_EMAIL_SMTP_USER" | "RSVP_EMAIL_SMTP_PASS" | "RSVP_EMAIL_FROM" | "RSVP_EMAIL_REPLY_TO" | "RSVP_EMAIL_BCC", string | undefined>>;
export function mailerFromEnv(env: MailerEnv = process.env as MailerEnv): MailerConfig | null {
  const user = env.RSVP_EMAIL_SMTP_USER?.trim(), pass = env.RSVP_EMAIL_SMTP_PASS?.trim();
  if (!user || !pass) return null;
  const bcc = env.RSVP_EMAIL_BCC?.trim();
  return { host: env.RSVP_EMAIL_SMTP_HOST?.trim() || "smtp.gmail.com", port: Number(env.RSVP_EMAIL_SMTP_PORT) || 465, user, pass, from: env.RSVP_EMAIL_FROM?.trim() || `Not Alone Awards <${user}>`, replyTo: env.RSVP_EMAIL_REPLY_TO?.trim() || user, ...(bcc ? { bcc } : {}) };
}

export type Sender = (message: { to: string; subject: string; text: string; html: string }) => Promise<void>;
export function smtpSender(config: MailerConfig): Sender {
  return async message => {
    const { createTransport } = await import("nodemailer");
    const transport = createTransport({ host: config.host, port: config.port, secure: config.port === 465, auth: { user: config.user, pass: config.pass }, connectionTimeout: 8000, greetingTimeout: 8000, socketTimeout: 12000 });
    await transport.sendMail({ from: config.from, to: message.to, replyTo: config.replyTo, ...(config.bcc ? { bcc: config.bcc } : {}), subject: message.subject, text: message.text, html: message.html });
  };
}
export function defaultSender(): Sender | null { const config = mailerFromEnv(); return config ? smtpSender(config) : null; }

// Owner (Oct 3, 2026): everyone who fills out an RSVP form gets the confirmation (only a legacy explicit
// "unable to attend" record, which the forms no longer offer, is skipped).
export const wantsConfirmation = (record: Pick<RsvpSubmission, "attendanceStatus">) => record.attendanceStatus !== "declined";

// Sends the confirmation for one stored RSVP and records that it was sent. Never throws to the caller's guest.
export async function sendRsvpConfirmation(record: RsvpSubmission, store: SubmissionStore, sender: Sender | null = defaultSender()): Promise<"sent" | "skipped" | "no-mailer" | "failed"> {
  if (!wantsConfirmation(record)) return "skipped";
  if (!sender) return "no-mailer";
  const rendered = rsvpConfirmationEmail(record);
  try {
    await sender({ to: record.email, ...rendered });
    const sent: RsvpEmailRecord = { ...newSubmission({ email: record.email, subject: rendered.subject, rsvpId: record.id }), id: record.id };
    await store.add("rsvpEmail", sent);
    return "sent";
  } catch (error) {
    console.error("rsvp confirmation email failed", error instanceof Error ? error.message : error);
    return "failed";
  }
}

// One-time catch-up for everyone who RSVPed before the email existed: one email per guest address (their
// latest "plan to attend" request), skipping anyone already emailed.
export async function backfillRsvpConfirmations(store: SubmissionStore, sender: Sender | null = defaultSender()): Promise<{ sent: string[]; skipped: number; failed: string[]; noMailer: boolean }> {
  if (!sender) return { sent: [], skipped: 0, failed: [], noMailer: true };
  const already = new Set((await store.list("rsvpEmail")).map(record => record.email.toLowerCase()));
  const latestByEmail = new Map<string, RsvpSubmission>();
  for (const record of await store.list("rsvp")) { // newest first
    if (!wantsConfirmation(record)) continue;
    const key = record.email.toLowerCase();
    if (!latestByEmail.has(key)) latestByEmail.set(key, record);
  }
  const sent: string[] = [], failed: string[] = []; let skipped = 0;
  for (const [key, record] of latestByEmail) {
    if (already.has(key)) { skipped++; continue; }
    const result = await sendRsvpConfirmation(record, store, sender);
    if (result === "sent") sent.push(record.email); else if (result === "failed") failed.push(record.email); else skipped++;
  }
  return { sent, skipped, failed, noMailer: false };
}

export const sampleRsvpForPreview: RsvpEmailInput = { name: "Sample Guest", email: "guest@example.com", guestCount: 2, communityDay: true, attendanceStatus: "attending" };
