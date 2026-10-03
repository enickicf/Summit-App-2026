import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Owner (Oct 1, 2026): the separate VIP portal is retired; VIP RSVPs live in the staff portal.
const gone = () => NextResponse.json({ ok: false, error: "The VIP portal moved into the staff portal: notalonesummit.org/staff#vip" }, { status: 410, headers: { "Cache-Control": "no-store" } });
export const GET = gone;
export const POST = gone;
