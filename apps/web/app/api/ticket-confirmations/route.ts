import { getSubmissionStore, ticketConfirmationPayloadSchema, type TicketConfirmationSubmission } from "../../../lib/staff/store";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const parsed = ticketConfirmationPayloadSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Please complete every attendee's name, email and phone." }, { status: 400 });
  const store = await getSubmissionStore();
  const offer = (await store.list("ticketOffer")).find(row => row.id === parsed.data.offerId && row.confirmationToken === parsed.data.confirmationToken);
  if (!offer) return NextResponse.json({ ok: false, error: "This confirmation link is invalid or no longer available." }, { status: 404 });
  if (parsed.data.awardsAttendees.length > offer.awardsTicketsOffered || parsed.data.communityDayAttendees.length > offer.communityDayTicketsOffered) {
    return NextResponse.json({ ok: false, error: "The attendee count is greater than the approved ticket offer." }, { status: 409 });
  }
  const existing = (await store.list("ticketConfirmation")).find(row => row.offerId === offer.id);
  let mirrorStatus: TicketConfirmationSubmission["mirrorStatus"] = process.env.TICKET_APPROVAL_API_URL ? "failed" : "not-configured";
  let mirrorError: string | undefined;
  const record: TicketConfirmationSubmission = {
    ...parsed.data,
    externalApprovalId: offer.externalApprovalId,
    id: existing?.id ?? offer.id,
    submittedAt: existing?.submittedAt ?? new Date().toISOString(),
    source: "form",
    mirrorStatus,
  };
  // Save locally first so a temporary approval-site outage cannot lose the guest response.
  await store.add("ticketConfirmation", record);
  const mirrorUrl = process.env.TICKET_APPROVAL_API_URL;
  const mirrorSecret = process.env.TICKET_APPROVAL_SYNC_SECRET;
  if (mirrorUrl && mirrorSecret) {
    try {
      const response = await fetch(mirrorUrl, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${mirrorSecret}` }, body: JSON.stringify({ type: "ticket-confirmation", externalApprovalId: offer.externalApprovalId, response: parsed.data }) });
      if (!response.ok) throw new Error(`Approval site returned ${response.status}`);
      mirrorStatus = "synced";
    } catch (error) { mirrorError = error instanceof Error ? error.message.slice(0, 300) : "Approval sync failed"; }
    await store.add("ticketConfirmation", { ...record, mirrorStatus, ...(mirrorError ? { mirrorError } : {}) });
  }
  return NextResponse.json({ ok: true, mirrorStatus }, { headers: { "Cache-Control": "no-store" } });
}
