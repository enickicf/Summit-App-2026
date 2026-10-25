import { NextResponse } from "next/server";
import { podcastStaffCookieName, staffCookieName } from "../../../../lib/staff/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const response = new NextResponse(null, { status: 303, headers: { Location: "/staff/login", "Cache-Control": "no-store" } });
  response.cookies.set({ name: staffCookieName, value: "", path: "/", maxAge: 0 });
  response.cookies.set({ name: podcastStaffCookieName, value: "", path: "/", maxAge: 0 });
  return response;
}
