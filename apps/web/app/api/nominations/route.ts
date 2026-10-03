import { NextResponse } from "next/server";
import { getSubmissionStore, newSubmission, nominationPayloadSchema, type SubmissionStore } from "../../../lib/staff/store";
import { corsHeaders } from "../rsvp/route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Owner (Sept 23): the Awards nomination form (a page on the RSVP site) submits here; nominations
// appear in their own section of the staff portal.
export async function OPTIONS(request: Request) {
  return new Response(null, { status: 204, headers: corsHeaders(request.headers.get("origin")) });
}

export async function handleNominationPost(request: Request, store?: SubmissionStore): Promise<Response> {
  const headers = corsHeaders(request.headers.get("origin"));
  if (Number(request.headers.get("content-length") ?? 0) > 30_000) return NextResponse.json({ ok: false, error: "Request is too large." }, { status: 413, headers });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ ok: false, error: "Invalid nomination." }, { status: 400, headers }); }
  const parsed = nominationPayloadSchema.safeParse(body);
  if (!parsed.success) {
    const field = String(parsed.error.issues[0]?.path[0] ?? "");
    const message: Record<string, string> = {
      nominatorName: "Please enter your name.", nominatorEmail: "Please enter a valid email address.", nomineeName: "Please enter the nominee's name.",
      category: "Please choose an award category.", reason: "Please tell us why they should be honored (up to 2000 characters)."
    };
    return NextResponse.json({ ok: false, error: message[field] ?? "Please check the form and try again." }, { status: 400, headers });
  }
  const { website, ...payload } = parsed.data;
  if (website) return NextResponse.json({ ok: true }, { headers });
  try {
    await (store ?? await getSubmissionStore()).add("nomination", newSubmission(payload));
  } catch (error) {
    console.error("nomination store failed", error instanceof Error ? error.message : error);
    return NextResponse.json({ ok: false, error: "We could not save your nomination. Please try again." }, { status: 500, headers });
  }
  return NextResponse.json({ ok: true }, { headers });
}

export async function POST(request: Request) {
  return handleNominationPost(request);
}
