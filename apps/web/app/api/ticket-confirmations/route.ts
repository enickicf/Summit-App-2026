import { getSubmissionStore, ticketConfirmationPayloadSchema, type TicketConfirmationSubmission } from "../../../lib/staff/store";
import { signatureMatchesAttendee } from "../../../lib/event-waiver";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const parsed = ticketConfirmationPayloadSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Please complete every attendee's name, email and phone." }, { status: 400 });
  const store = await getSubmissionStore();
  const offer = (await store.list("ticketOffer")).find(row => row.id === parsed.data.offerId && row.confirmationToken === parsed.data.confirmationToken);
  if (!offer || offer.decision === "declined") return NextResponse.json({ ok: false, error: "This confirmation link is invalid or no longer available." }, { status: 404 });
  if (parsed.data.awardsAttendees.length > offer.awardsTicketsOffered || parsed.data.communityDayAttendees.length > offer.communityDayTicketsOffered) {
    return NextResponse.json({ ok: false, error: "The attendee count is greater than the approved ticket offer." }, { status: 409 });
  }
  const existing = (await store.list("ticketConfirmation")).find(row => row.offerId === offer.id);
  const submittedAttendees = [...parsed.data.awardsAttendees, ...parsed.data.communityDayAttendees];
  const allowedIds = new Set([...(offer.awardsAttendees ?? []), ...(offer.communityDayAttendees ?? [])].map(row => row.id));
  if (allowedIds.size && submittedAttendees.some(row => !row.id || !allowedIds.has(row.id))) {
    return NextResponse.json({ ok: false, error: "An attendee is not part of this ticket offer." }, { status: 409 });
  }
  const mergedWaivers = [...(existing?.waivers ?? [])];
  const mergedSmsConsents = [...(existing?.smsConsents ?? [])];
  for (const submittedWaiver of parsed.data.waivers) {
    const waiver = { ...submittedWaiver, acceptedAt: new Date().toISOString() };
    const person = submittedAttendees.find(row => row.id === waiver.personId);
    if (!person || person.email !== waiver.email || !signatureMatchesAttendee(waiver.signature, person.name)) {
      return NextResponse.json({ ok: false, error: "Each waiver signature must match that attendee's name and email." }, { status: 400 });
    }
    const at = mergedWaivers.findIndex(row => row.personId === waiver.personId);
    if (at === -1) mergedWaivers.push(waiver); else mergedWaivers[at] = waiver;
  }
  for (const submittedConsent of parsed.data.smsConsents) {
    const person = submittedAttendees.find(row => row.id === submittedConsent.personId);
    if (!person || person.phone !== submittedConsent.phone) {
      return NextResponse.json({ ok: false, error: "Text consent must match the attendee and phone number." }, { status: 400 });
    }
    const consent = { ...submittedConsent, recordedAt: new Date().toISOString() };
    const at = mergedSmsConsents.findIndex(row => row.personId === consent.personId && row.scope === consent.scope);
    if (at === -1) mergedSmsConsents.push(consent); else mergedSmsConsents[at] = consent;
  }
  const sourceWaivers = new Set([...(offer.awardsAttendees ?? []), ...(offer.communityDayAttendees ?? [])].filter(row => row.waiverComplete).map(row => row.id));
  const completedWaivers = new Set([...sourceWaivers, ...mergedWaivers.map(row => row.personId)]);
  const pendingWaiverIds = [...new Set(submittedAttendees.map(row => row.id).filter(id => id && !completedWaivers.has(id)))];
  let mirrorStatus: TicketConfirmationSubmission["mirrorStatus"] = process.env.TICKET_APPROVAL_API_URL ? "failed" : "not-configured";
  let mirrorError: string | undefined;
  const record: TicketConfirmationSubmission = {
    ...parsed.data,
    waivers: mergedWaivers,
    smsConsents: mergedSmsConsents,
    pendingWaiverIds,
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
  return NextResponse.json({ ok: true, mirrorStatus, pendingWaiverIds }, { headers: { "Cache-Control": "no-store" } });
}
