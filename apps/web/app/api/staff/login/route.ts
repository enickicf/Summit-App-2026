import { NextResponse } from "next/server";
import { passwordMatches, podcastStaffCookieName, podcastStaffPassword, podcastStaffPasswordMatches, podcastStaffSessionToken, staffCookieMaxAgeSeconds, staffCookieName, staffPassword, staffSessionToken } from "../../../../lib/staff/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Password-only sign-in for the staff portal (owner, Sept 23). Wrong password -> back to the form.
export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  const candidate = String(form?.get("password") ?? "");
  const configured = staffPassword();
  const podcastConfigured = podcastStaffPassword();
  // Relative redirects: behind the host's proxy the function sees an internal URL, and the browser must stay on the public domain.
  const redirect = (location: string) => new NextResponse(null, { status: 303, headers: { Location: location, "Cache-Control": "no-store" } });
  if (!configured && !podcastConfigured) return redirect("/staff/login?error=unavailable");
  const secure = new URL(request.url).protocol === "https:";
  const fullAccess = Boolean(configured && candidate && passwordMatches(candidate));
  const podcastAccess = Boolean(podcastConfigured && candidate && podcastStaffPasswordMatches(candidate));
  if (!fullAccess && !podcastAccess) return redirect("/staff/login?error=password");
  const response = redirect(fullAccess ? "/staff" : "/staff#podcasts");
  if (fullAccess && configured) {
    response.cookies.set({ name: staffCookieName, value: staffSessionToken(configured), httpOnly: true, sameSite: "lax", secure, path: "/", maxAge: staffCookieMaxAgeSeconds });
    response.cookies.set({ name: podcastStaffCookieName, value: "", path: "/", maxAge: 0 });
  } else if (podcastConfigured) {
    response.cookies.set({ name: podcastStaffCookieName, value: podcastStaffSessionToken(podcastConfigured), httpOnly: true, sameSite: "lax", secure, path: "/", maxAge: staffCookieMaxAgeSeconds });
    response.cookies.set({ name: staffCookieName, value: "", path: "/", maxAge: 0 });
  }
  return response;
}
