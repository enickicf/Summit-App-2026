import { randomUUID, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { isStaffSession, staffCookieName } from "../../../../lib/staff/auth";
import { getSubmissionStore, ticketOfferPayloadSchema, type TicketOfferSubmission } from "../../../../lib/staff/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function secretMatches(request: Request) {
  const configured = process.env.TICKET_APPROVAL_SYNC_SECRET ?? "";
  const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (!configured || configured.length !== supplied.length) return false;
  return timingSafeEqual(Buffer.from(configured), Buffer.from(supplied));
}

async function authorized(request: Request) {
  if (secretMatches(request)) return true;
  const jar = await cookies();
  return isStaffSession(jar.get(staffCookieName)?.value);
}

export async function GET(request: Request) {
  if (!(await authorized(request))) return NextResponse.json({ ok: false, error: "Sign in required." }, { status: 401 });
  const store = await getSubmissionStore();
  const [offers, confirmations] = await Promise.all([store.list("ticketOffer"), store.list("ticketConfirmation")]);
  return NextResponse.json({ ok: true, offers, confirmations }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  if (!(await authorized(request))) return NextResponse.json({ ok: false, error: "Sign in required." }, { status: 401 });
  const raw = await request.json().catch(() => ({})) as Record<string, unknown>;
  const store = await getSubmissionStore();
  const existing = (await store.list("ticketOffer")).find(row => row.externalApprovalId === String(raw.externalApprovalId ?? ""));
  const parsed = ticketOfferPayloadSchema.safeParse({
    ...existing,
    ...raw,
    confirmationToken: existing?.confirmationToken ?? raw.confirmationToken ?? randomUUID(),
  });
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid ticket offer.", details: parsed.error.flatten() }, { status: 400 });
  const now = new Date().toISOString();
  const record: TicketOfferSubmission = {
    ...parsed.data,
    id: existing?.id ?? randomUUID(),
    submittedAt: existing?.submittedAt ?? now,
    source: "staff",
    addedBy: existing?.addedBy ?? "ticket approval sync",
  };
  await store.add("ticketOffer", record);
  return NextResponse.json({ ok: true, offer: record, confirmationPath: `/tickets/confirm/${record.confirmationToken}` }, { headers: { "Cache-Control": "no-store" } });
}
