import { NextResponse } from "next/server";
import { getSubmissionStore, newSubmission, textPreferenceSchema, type SubmissionStore } from "../../../lib/staff/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Oct 12 (owner: "initialize a new way to get text consent in the next wave from the people we do not have it from"): the
// public text-updates page (public/text-updates) posts here. "yes" gives consent; "no" opts out. Same origin only.
export async function handleTextPreferencePost(request: Request, store?: SubmissionStore): Promise<Response> {
  const headers = { "Cache-Control": "no-store" };
  if (Number(request.headers.get("content-length") ?? 0) > 5_000) return NextResponse.json({ error: "Request is too large." }, { status: 413, headers });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400, headers }); }
  const parsed = textPreferenceSchema.safeParse(body);
  if (!parsed.success) {
    const field = String(parsed.error.issues[0]?.path[0] ?? "");
    const messages: Record<string, string> = { phone: "Please enter your mobile number.", email: "Please enter a valid email address.", choice: "Please choose yes or no." };
    return NextResponse.json({ field, error: messages[field] ?? "Please check the form and try again." }, { status: 400, headers });
  }
  const { website, ...preference } = parsed.data;
  if (website) return NextResponse.json({ ok: true }, { status: 201, headers }); // honeypot
  try {
    await (store ?? await getSubmissionStore()).add("textPreference", newSubmission({ ...preference, via: "page" as const }));
  } catch (error) {
    console.error("text preference store failed", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "We couldn’t save your choice. Please try again." }, { status: 500, headers });
  }
  return NextResponse.json({ ok: true }, { status: 201, headers });
}

export async function POST(request: Request) {
  return handleTextPreferencePost(request);
}
