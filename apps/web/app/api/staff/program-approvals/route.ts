import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { isStaffSession, staffCookieName } from "../../../../lib/staff/auth";
import { getSubmissionStore, programApprovalPayloadSchema, type ProgramApprovalSubmission } from "../../../../lib/staff/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function authorized() {
  const jar = await cookies();
  return isStaffSession(jar.get(staffCookieName)?.value);
}

export async function GET() {
  if (!(await authorized())) return NextResponse.json({ ok: false, error: "Sign in required." }, { status: 401 });
  const store = await getSubmissionStore();
  return NextResponse.json({ ok: true, approvals: await store.list("programApproval") }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  if (!(await authorized())) return NextResponse.json({ ok: false, error: "Sign in required." }, { status: 401 });
  const raw = await request.json().catch(() => ({}));
  const parsed = programApprovalPayloadSchema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid program decision.", details: parsed.error.flatten() }, { status: 400 });
  const store = await getSubmissionStore();
  const existing = (await store.list("programApproval")).find(row => row.sourceKind === parsed.data.sourceKind && row.sourceId === parsed.data.sourceId && row.eventKey === parsed.data.eventKey);
  const now = new Date().toISOString();
  const record: ProgramApprovalSubmission = {
    ...parsed.data,
    id: existing?.id ?? randomUUID(),
    submittedAt: existing?.submittedAt ?? now,
    source: "staff",
    addedBy: existing?.addedBy ?? "Cheryl Operations",
  };
  await store.add("programApproval", record);
  return NextResponse.json({ ok: true, approval: record }, { headers: { "Cache-Control": "no-store" } });
}
