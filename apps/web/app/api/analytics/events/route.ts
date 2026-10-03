import { NextResponse } from "next/server";
import { analyticsLimits } from "../../../../lib/analytics/contract";
import { prepareBatch, supabaseAnalyticsStore, type AnalyticsStore } from "../../../../lib/analytics/ingest";
import { awardsSiteUrl, siteMetadataPolicy } from "../../../../lib/site-metadata";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const noStore = { "Cache-Control": "no-store" };

function allowedOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true; // same-origin requests without an Origin header (older beacons)
  let originHost: string;
  try { originHost = new URL(origin).host; } catch { return false; }
  const hosts = new Set<string>();
  for (const header of ["host", "x-forwarded-host"]) {
    const value = request.headers.get(header);
    if (value) hosts.add(value.split(",")[0]!.trim());
  }
  hosts.add(siteMetadataPolicy().origin.host);
  hosts.add(new URL(awardsSiteUrl).host);
  hosts.add(`www.${new URL(awardsSiteUrl).host}`);
  try { hosts.add(new URL(request.url).host); } catch { /* ignore */ }
  return hosts.has(originHost);
}

export async function handleAnalyticsPost(request: Request, store: AnalyticsStore | null = supabaseAnalyticsStore()): Promise<Response> {
  if (!allowedOrigin(request)) return NextResponse.json({ error: "forbidden_origin" }, { status: 403, headers: noStore });
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > analyticsLimits.maxBodyBytes) return NextResponse.json({ error: "too_large" }, { status: 413, headers: noStore });
  const text = await request.text();
  if (text.length > analyticsLimits.maxBodyBytes) return NextResponse.json({ error: "too_large" }, { status: 413, headers: noStore });
  let body: unknown;
  try { body = JSON.parse(text); } catch { return NextResponse.json({ error: "invalid_json" }, { status: 400, headers: noStore }); }

  const prepared = prepareBatch(body);
  if (!prepared.ok) return NextResponse.json({ error: prepared.error }, { status: 400, headers: noStore });
  // Not configured (no server Supabase settings): accept and drop so the site never errors.
  if (!store) return NextResponse.json({ accepted: prepared.events.length, stored: 0, dropped: prepared.dropped, disabled: true }, { headers: noStore });
  if (prepared.events.length === 0) return NextResponse.json({ accepted: 0, stored: 0, dropped: prepared.dropped }, { headers: noStore });
  try {
    const stored = await store.ingest(prepared.session, prepared.events);
    return NextResponse.json({ accepted: prepared.events.length, stored, dropped: prepared.dropped }, { headers: noStore });
  } catch (error) {
    console.error("analytics ingest failed", error instanceof Error ? error.message : error);
    // 503 tells the browser to retry with the same event IDs; the database keeps each ID once.
    return NextResponse.json({ error: "unavailable" }, { status: 503, headers: noStore });
  }
}

export async function POST(request: Request) {
  return handleAnalyticsPost(request);
}
