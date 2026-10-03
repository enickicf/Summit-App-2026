import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { isStaffSession, staffCookieName } from "../../../../lib/staff/auth";
import { getSubmissionStore, rsvpPayloadSchema, type RsvpSubmission } from "../../../../lib/staff/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// One-time import of the RSVP rows collected by the previous (Codex-hosted) backend, so the portal
// holds every ticket request from day one. Signed-in staff only; rows already imported are skipped.
const importRowSchema = rsvpPayloadSchema.extend({ id: z.union([z.string(), z.number()]).transform(String), submittedAt: z.string().datetime({ offset: true }) });

export async function POST(request: Request) {
  const jar = await cookies();
  if (!isStaffSession(jar.get(staffCookieName)?.value)) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const body = await request.json().catch(() => null);
  const rows = z.array(importRowSchema).max(2000).safeParse(body);
  if (!rows.success) return NextResponse.json({ error: "Expected an array of RSVP rows." }, { status: 400 });
  const store = await getSubmissionStore();
  const existing = new Set((await store.list("rsvp")).map(record => record.legacyId).filter(Boolean));
  let imported = 0;
  for (const row of rows.data) {
    if (existing.has(row.id)) continue;
    const { website: _website, id, submittedAt, ...payload } = row;
    const record: RsvpSubmission = { ...payload, id: `legacy-${id}`, legacyId: id, submittedAt: new Date(submittedAt).toISOString(), source: "import" };
    await store.add("rsvp", record);
    imported += 1;
  }
  return NextResponse.json({ imported, skipped: rows.data.length - imported });
}
