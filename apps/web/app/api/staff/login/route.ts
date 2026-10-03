import { NextResponse } from "next/server";
import { passwordMatches, staffCookieMaxAgeSeconds, staffCookieName, staffPassword, staffSessionToken } from "../../../../lib/staff/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Password-only sign-in for the staff portal (owner, Sept 23). Wrong password -> back to the form.
export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  const candidate = String(form?.get("password") ?? "");
  const configured = staffPassword();
  // Relative redirects: behind the host's proxy the function sees an internal URL, and the browser must stay on the public domain.
  const redirect = (location: string) => new NextResponse(null, { status: 303, headers: { Location: location, "Cache-Control": "no-store" } });
  if (!configured) return redirect("/staff/login?error=unavailable");
  if (!candidate || !passwordMatches(candidate)) return redirect("/staff/login?error=password");
  const response = redirect("/staff");
  response.cookies.set({ name: staffCookieName, value: staffSessionToken(configured), httpOnly: true, sameSite: "lax", secure: new URL(request.url).protocol === "https:", path: "/", maxAge: staffCookieMaxAgeSeconds });
  return response;
}
