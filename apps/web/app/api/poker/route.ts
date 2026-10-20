import { sendRequestReceipt } from "../../../lib/staff/request-receipt";
import type { Sender } from "../../../lib/staff/rsvp-email";
import { NextResponse } from "next/server";
import { getSubmissionStore, newSubmission, pokerPayloadSchema, type SubmissionStore } from "../../../lib/staff/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Owner (Sept 28): the All In For Mental Health charity poker tournament (Nov 1, 2026) has its own
// separate website and its own seat request form. That site stores each request itself and mirrors it
// here, so the team reads every event's sign-ups in one portal with poker in its own section, apart
// from the Awards tickets and Community Day.
export const allowedPokerOrigins = [
  "https://all-in-for-mental-health.netlify.app",
  "https://notalonesummit.org",
  "https://www.notalonesummit.org"
];

export function pokerCorsHeaders(origin: string | null): Record<string, string> {
  const allowed = origin && allowedPokerOrigins.includes(origin) ? origin : allowedPokerOrigins[0]!;
  return { "Access-Control-Allow-Origin": allowed, "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type", Vary: "Origin", "Cache-Control": "no-store" };
}

export async function OPTIONS(request: Request) {
  return new Response(null, { status: 204, headers: pokerCorsHeaders(request.headers.get("origin")) });
}

export async function handlePokerPost(request: Request, store?: SubmissionStore, sender?: Sender | null): Promise<Response> {
  const headers = pokerCorsHeaders(request.headers.get("origin"));
  if (Number(request.headers.get("content-length") ?? 0) > 20_000) return NextResponse.json({ ok: false, error: "Request is too large." }, { status: 413, headers });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400, headers }); }
  const parsed = pokerPayloadSchema.safeParse(body);
  if (!parsed.success) {
    const field = String(parsed.error.issues[0]?.path[0] ?? "");
    const message: Record<string, string> = {
      name: "Please enter your full name.",
      email: "Please enter a valid email address.",
      interest: "Please tell us how you would like to take part.",
      sponsorship: "Please choose a sponsorship level we offer.",
      seats: "Please choose between 1 and 10 seats."
    };
    return NextResponse.json({ ok: false, field, error: message[field] ?? "Please check the form and try again." }, { status: 400, headers });
  }
  const { website, ...payload } = parsed.data;
  if (website) return NextResponse.json({ ok: true }, { headers }); // honeypot: answer normally, store nothing
  const target = store ?? await getSubmissionStore();
  const saved = newSubmission(payload);
  try {
    await target.add("poker", saved);
  } catch (error) {
    console.error("poker store failed", error instanceof Error ? error.message : error);
    return NextResponse.json({ ok: false, error: "We could not save your request. Please try again." }, { status: 500, headers });
  }
  await sendRequestReceipt(saved.id, saved.name, saved.email, ["All In for Mental Health poker event"], target, sender);
  return NextResponse.json({ ok: true }, { headers });
}

export async function POST(request: Request) {
  return handlePokerPost(request);
}
