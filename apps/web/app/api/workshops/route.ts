import { sendRequestReceipt } from "../../../lib/staff/request-receipt";
import type { Sender } from "../../../lib/staff/rsvp-email";
import { NextResponse } from "next/server";
import { getSubmissionStore, newSubmission, siteVisitWaiverProblem, workshopPayloadSchema, type SubmissionStore } from "../../../lib/staff/store";
import { signupOpenByCategory, waiverRequiredFor, workshopCategory } from "../../../lib/morning-workshops";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Owner (Sept 28): sign-ups from the Summit schedule page (same origin). Stored for the staff portal's
// "Summit workshops" and "Tennis & High Tea" sections; staff remove anyone not on the guest list.
// Owner (Oct 5): the wellness workshop sign-ups are closed (410). Owner (Oct 7): Tennis / High Tea are open
// again and must carry the signed waiver (lib/morning-workshops.ts siteVisitWaiver).
export async function handleWorkshopPost(request: Request, store?: SubmissionStore, sender?: Sender | null): Promise<Response> {
  const headers = { "Cache-Control": "no-store" };
  if (Number(request.headers.get("content-length") ?? 0) > 10_000) return NextResponse.json({ ok: false, error: "Request is too large." }, { status: 413, headers });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400, headers }); }
  const parsed = workshopPayloadSchema.safeParse(body);
  if (!parsed.success) {
    const field = String(parsed.error.issues[0]?.path[0] ?? "");
    return NextResponse.json({ ok: false, field, error: field === "name" ? "Please enter your full name." : "Please check the form and try again." }, { status: 400, headers });
  }
  const { website, waiverAccepted, signature, waiverVersion, ...payload } = parsed.data;
  if (website) return NextResponse.json({ ok: true }, { headers }); // honeypot: pretend success, store nothing
  const category = workshopCategory(payload.sessionTitle);
  if (!category) return NextResponse.json({ ok: false, error: "Sign-ups are only open for Tennis and High Tea." }, { status: 400, headers });
  if (!signupOpenByCategory[category]) return NextResponse.json({ ok: false, error: "Sign-ups are not open for this session at the moment." }, { status: 410, headers });
  const now = new Date();
  let waiver: { waiverAccepted: true; signature: string; waiverVersion: string; waiverAcceptedAt: string } | Record<never, never> = {};
  if (waiverRequiredFor(category)) {
    const problem = siteVisitWaiverProblem({ name: payload.name, waiverAccepted, signature, waiverVersion });
    if (problem) return NextResponse.json({ ok: false, ...problem }, { status: 400, headers });
    waiver = { waiverAccepted: true, signature: (signature ?? "").trim(), waiverVersion: (waiverVersion ?? "").trim(), waiverAcceptedAt: now.toISOString() };
  }
  const target = store ?? await getSubmissionStore();
  const saved = newSubmission({ ...payload, category, ...waiver }, now);
  try {
    await target.add("workshop", saved);
  } catch (error) {
    console.error("workshop store failed", error instanceof Error ? error.message : error);
    return NextResponse.json({ ok: false, error: "We could not save your sign-up. Please try again." }, { status: 500, headers });
  }
  if (saved.email) await sendRequestReceipt(saved.id, saved.name, saved.email, [payload.sessionTitle], target, sender);
  return NextResponse.json({ ok: true }, { headers });
}

export async function POST(request: Request) {
  return handleWorkshopPost(request);
}
