import { signatureMatchesAttendee } from "../event-waiver";
import { currentRequests, requestsTickets, wantsCommunityDay, type RsvpSubmission } from "./store";

export type ApprovalAttendee = {
  id: string;
  name: string;
  email: string;
  phone: string;
  organization: string;
  professionalRole: string;
  waiverComplete: boolean;
};

export type TicketApprovalCandidate = {
  id: string;
  sourceRsvpId: string;
  name: string;
  email: string;
  phone: string;
  organization: string;
  professionalRole: string;
  form: string;
  awardsRequested: number;
  communityDayRequested: number;
  awardsAttendees: ApprovalAttendee[];
  communityDayAttendees: ApprovalAttendee[];
  missingDetails: string[];
  formVersion: "current" | "legacy";
  submittedAt: string;
};

const key = (value: string | undefined) => (value ?? "").trim().toLowerCase();
const waiverComplete = (record: { eventWaiver?: RsvpSubmission["eventWaiver"]; name: string }) =>
  record.eventWaiver?.status === "accepted" && signatureMatchesAttendee(record.eventWaiver.signature, record.name);
const attendee = (record: Pick<RsvpSubmission, "id" | "name" | "email" | "phone" | "organization" | "professionalRole" | "eventWaiver">): ApprovalAttendee => ({
  id: record.id,
  name: record.name,
  email: record.email,
  phone: record.phone,
  organization: record.organization,
  professionalRole: record.professionalRole,
  waiverComplete: waiverComplete(record),
});
const party = (record: RsvpSubmission): ApprovalAttendee[] => [
  attendee(record),
  ...(record.guests ?? []).map((guest, index) => ({
    id: `${record.id}:guest:${index}`,
    name: guest.name,
    email: guest.email,
    phone: guest.phone,
    organization: guest.organization ?? "",
    professionalRole: guest.professionalRole ?? "",
    waiverComplete: guest.eventWaiver?.status === "accepted" && signatureMatchesAttendee(guest.eventWaiver.signature, guest.name),
  })),
];
const unique = (rows: ApprovalAttendee[]) => [...new Map(rows.map(row => [key(row.email) || row.id, row])).values()];
const pad = (rows: ApprovalAttendee[], count: number, prefix: string) => Array.from({ length: count }, (_, index) => rows[index] ?? ({ id: `${prefix}:missing:${index}`, name: "", email: "", phone: "", organization: "", professionalRole: "", waiverComplete: false }));
const missingFor = (rows: ApprovalAttendee[], expected: number) => {
  const missing: string[] = [];
  if (rows.length < expected) missing.push(`${expected - rows.length} attendee record${expected - rows.length === 1 ? "" : "s"}`);
  rows.slice(0, expected).forEach((row, index) => {
    if (!row.name.trim()) missing.push(`attendee ${index + 1} name`);
    if (!row.email.trim()) missing.push(`attendee ${index + 1} email`);
    if (row.phone.replace(/\D/g, "").length < 7) missing.push(`attendee ${index + 1} phone`);
    if (!row.waiverComplete) missing.push(`attendee ${index + 1} waiver`);
  });
  return missing;
};

/**
 * Builds one approval row per real invitation party. Combined VIP submissions are grouped by
 * invitationRequestId; ordinary forms are grouped by requester email. Each event keeps its own
 * newest request so an Awards-only update never erases a Nevada Mental Health Day request.
 */
export function ticketApprovalCandidates(records: RsvpSubmission[]): TicketApprovalCandidate[] {
  const active = records.filter(record => !record.removedAt && record.attendanceStatus !== "declined");
  const invitationGroups = new Map<string, RsvpSubmission[]>();
  const ordinary: RsvpSubmission[] = [];
  for (const record of active) {
    if (record.invitationRequestId) {
      const list = invitationGroups.get(record.invitationRequestId) ?? [];
      list.push(record);
      invitationGroups.set(record.invitationRequestId, list);
    } else ordinary.push(record);
  }

  const out: TicketApprovalCandidate[] = [];
  for (const [invitationId, rows] of invitationGroups) {
    const newest = [...rows].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))[0]!;
    const awardsRows = unique(rows.filter(requestsTickets).map(attendee));
    const dayRows = unique(rows.filter(wantsCommunityDay).map(attendee));
    const name = newest.requesterName || newest.name;
    const email = newest.requesterEmail || newest.email;
    const missingDetails = [...missingFor(awardsRows, awardsRows.length), ...missingFor(dayRows, dayRows.length)];
    out.push({
      id: `invitation:${invitationId}`,
      sourceRsvpId: newest.id,
      name,
      email,
      phone: newest.requesterPhone || newest.phone,
      organization: newest.requesterOrganization || newest.organization,
      professionalRole: newest.requesterProfessionalRole || newest.professionalRole,
      form: newest.invitationLevel === "uber-vip" ? "Uber VIP" : "VIP",
      awardsRequested: awardsRows.length,
      communityDayRequested: dayRows.length,
      awardsAttendees: awardsRows,
      communityDayAttendees: dayRows,
      missingDetails,
      formVersion: missingDetails.length ? "legacy" : "current",
      submittedAt: newest.submittedAt,
    });
  }

  const { awards, communityDay, latest } = currentRequests(ordinary);
  const emails = new Set([...awards, ...communityDay, ...latest].map(record => key(record.email)));
  for (const email of emails) {
    const awardsRecord = awards.find(record => key(record.email) === email && requestsTickets(record));
    const dayRecord = communityDay.find(record => key(record.email) === email && wantsCommunityDay(record));
    const newest = latest.find(record => key(record.email) === email) ?? awardsRecord ?? dayRecord;
    if (!newest) continue;
    const awardsCount = awardsRecord?.guestCount ?? 0;
    const dayCount = dayRecord?.guestCount ?? 0;
    const awardsAttendees = awardsRecord ? pad(unique(party(awardsRecord)), awardsCount, `${newest.id}:awards`) : [];
    const communityDayAttendees = dayRecord ? pad(unique(party(dayRecord)), dayCount, `${newest.id}:day`) : [];
    const missingDetails = [...missingFor(awardsAttendees, awardsCount), ...missingFor(communityDayAttendees, dayCount)];
    out.push({
      id: `rsvp:${email}`,
      sourceRsvpId: newest.id,
      name: newest.name,
      email: newest.email,
      phone: newest.phone,
      organization: newest.organization,
      professionalRole: newest.professionalRole,
      form: newest.vip ? "VIP" : newest.partner?.toUpperCase() || (newest.tier === "lake-las-vegas" ? "Lake Las Vegas" : "Standard"),
      awardsRequested: awardsCount,
      communityDayRequested: dayCount,
      awardsAttendees,
      communityDayAttendees,
      missingDetails,
      formVersion: missingDetails.length ? "legacy" : "current",
      submittedAt: newest.submittedAt,
    });
  }
  return out.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
}
