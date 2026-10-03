import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { isStaffSession, staffCookieName } from "../../../../lib/staff/auth";
import { getSubmissionStore } from "../../../../lib/staff/store";
import { backfillRsvpConfirmations, defaultSender, rsvpConfirmationEmail, sampleRsvpForPreview } from "../../../../lib/staff/rsvp-email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Staff-only (Sept 28): preview the RSVP confirmation email, send a test copy, or send it once to everyone
// who RSVPed before the automatic email existed.
async function signedIn() { const jar = await cookies(); return isStaffSession(jar.get(staffCookieName)?.value); }
const noStore = { "Cache-Control": "no-store" };

export async function GET(request: Request) {
  if (!(await signedIn())) return new Response("Sign in required.", { status: 401, headers: noStore });
  const url = new URL(request.url);
  const name = url.searchParams.get("name")?.trim() || sampleRsvpForPreview.name;
  const rendered = rsvpConfirmationEmail({ ...sampleRsvpForPreview, name });
  return new Response(url.searchParams.get("format") === "text" ? rendered.text : rendered.html, { headers: { "Content-Type": url.searchParams.get("format") === "text" ? "text/plain; charset=utf-8" : "text/html; charset=utf-8", ...noStore } });
}

export async function POST(request: Request) {
  if (!(await signedIn())) return NextResponse.json({ ok: false, error: "Sign in required." }, { status: 401, headers: noStore });
  let body: { mode?: string; to?: string; name?: string } = {};
  try { body = await request.json(); } catch { /* empty body */ }
  const sender = defaultSender();
  if (!sender) return NextResponse.json({ ok: false, error: "No email sender is configured (RSVP_EMAIL_SMTP_USER / RSVP_EMAIL_SMTP_PASS)." }, { status: 503, headers: noStore });
  if (body.mode === "test") {
    const to = body.to?.trim();
    if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) return NextResponse.json({ ok: false, error: "Provide a valid test address in \"to\"." }, { status: 400, headers: noStore });
    const rendered = rsvpConfirmationEmail({ ...sampleRsvpForPreview, name: body.name?.trim() || sampleRsvpForPreview.name, email: to });
    await sender({ to, ...rendered });
    return NextResponse.json({ ok: true, sent: to }, { headers: noStore });
  }
  if (body.mode === "backfill") {
    const result = await backfillRsvpConfirmations(await getSubmissionStore(), sender);
    return NextResponse.json({ ok: true, ...result }, { headers: noStore });
  }
  return NextResponse.json({ ok: false, error: "mode must be \"test\" or \"backfill\"." }, { status: 400, headers: noStore });
}
