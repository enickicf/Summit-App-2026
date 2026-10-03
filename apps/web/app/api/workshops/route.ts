import { NextResponse } from "next/server";
import { getSubmissionStore, newSubmission, workshopPayloadSchema, type SubmissionStore } from "../../../lib/staff/store";
import { workshopCategory } from "../../../lib/morning-workshops";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Owner (Sept 28): morning workshop sign-ups from the Summit schedule page (same origin; name only).
// Stored for the staff portal's "Summit workshops" section; staff remove anyone not on the guest list.
export async function handleWorkshopPost(request: Request, store?: SubmissionStore): Promise<Response> {
  const headers = { "Cache-Control": "no-store" };
  if (Number(request.headers.get("content-length") ?? 0) > 10_000) return NextResponse.json({ ok: false, error: "Request is too large." }, { status: 413, headers });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400, headers }); }
  const parsed = workshopPayloadSchema.safeParse(body);
  if (!parsed.success) {
    const field = String(parsed.error.issues[0]?.path[0] ?? "");
    return NextResponse.json({ ok: false, field, error: field === "name" ? "Please enter your full name." : "Please check the form and try again." }, { status: 400, headers });
  }
  const { website, ...payload } = parsed.data;
  if (website) return NextResponse.json({ ok: true }, { headers }); // honeypot: pretend success, store nothing
  const category = workshopCategory(payload.sessionTitle);
  if (!category) return NextResponse.json({ ok: false, error: "Sign-ups are only open for the workshops, Tennis and High Tea." }, { status: 400, headers });
  try {
    await (store ?? await getSubmissionStore()).add("workshop", newSubmission({ ...payload, category }));
  } catch (error) {
    console.error("workshop store failed", error instanceof Error ? error.message : error);
    return NextResponse.json({ ok: false, error: "We could not save your sign-up. Please try again." }, { status: 500, headers });
  }
  return NextResponse.json({ ok: true }, { headers });
}

export async function POST(request: Request) {
  return handleWorkshopPost(request);
}
