import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { isStaffSession, staffCookieName } from "../../../../lib/staff/auth";
import { getSubmissionStore } from "../../../../lib/staff/store";
import { addStaffGuest } from "../../../../lib/staff/staff-guest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Oct 20 (Cherrial, owner approved): staff add a guest by hand (guests Trent sends by WhatsApp / text). Staff sign-in
// required. No confirmation email is sent. The portal form posts here and comes back to the "Add a guest" box.
export async function POST(request: Request) {
  const jar = await cookies();
  if (!isStaffSession(jar.get(staffCookieName)?.value)) return NextResponse.json({ ok: false, error: "Sign in required." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  const isJson = (request.headers.get("content-type") ?? "").includes("application/json");
  const raw = isJson ? await request.json().catch(() => ({})) as Record<string, unknown> : Object.fromEntries((await request.formData().catch(() => new FormData())).entries());
  const result = await addStaffGuest(await getSubmissionStore(), raw);
  if (isJson) return NextResponse.json(result, { status: result.ok ? 201 : result.status, headers: { "Cache-Control": "no-store" } });
  const params = result.ok ? `added=${encodeURIComponent(String(raw.name ?? "").trim())}&to=${encodeURIComponent(result.added.join(" + "))}` : `addGuestError=${encodeURIComponent(result.error)}`;
  return new NextResponse(null, { status: 303, headers: { Location: `/staff?${params}#add-guest`, "Cache-Control": "no-store" } });
}
