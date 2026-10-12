import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { isStaffSession, staffCookieName } from "../../../../lib/staff/auth";
import { getSubmissionStore, newSubmission, textPreferenceSchema } from "../../../../lib/staff/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Oct 12 (owner): staff record a text opt-out (someone replied STOP, or asked by email or phone) or a spoken yes, from the
// portal's Texts view. The latest choice for a phone number or email wins everywhere (portal and spreadsheets).
export async function POST(request: Request) {
  const jar = await cookies();
  if (!isStaffSession(jar.get(staffCookieName)?.value)) return NextResponse.json({ ok: false, error: "Sign in required." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  const form = await request.formData().catch(() => null);
  const via = String(form?.get("via") ?? "staff") === "stop-reply" ? "stop-reply" as const : "staff" as const;
  const parsed = textPreferenceSchema.safeParse({ name: form?.get("name") ?? "", email: form?.get("email") ?? "", phone: form?.get("phone") ?? "", choice: form?.get("choice") ?? "no" });
  if (!parsed.success) return NextResponse.json({ ok: false, error: "A phone number (7+ digits) and a choice are required." }, { status: 400, headers: { "Cache-Control": "no-store" } });
  const { website: _website, ...preference } = parsed.data;
  const note = String(form?.get("note") ?? "").trim().slice(0, 300);
  await (await getSubmissionStore()).add("textPreference", newSubmission({ ...preference, via, ...(note ? { note } : {}) }));
  return new NextResponse(null, { status: 303, headers: { Location: "/staff#texts", "Cache-Control": "no-store" } });
}
