import {
  closingDinnerSeats,
  excludedFromPortalTotals,
  type ClosingDinnerSubmission,
  type PokerSubmission,
  type ProgramApprovalSubmission,
  type WorkshopSubmission,
} from "./store";

export type ProgramApprovalCandidate = {
  id: string;
  sourceKind: "closingDinner" | "workshop" | "poker";
  sourceId: string;
  eventKey: string;
  eventLabel: string;
  name: string;
  email: string;
  phone: string;
  form: string;
  requestedQuantity: number;
  fulfillment: "ticket" | "check-in" | "reservation";
  missingDetails: string[];
  formVersion: "current" | "legacy";
  submittedAt: string;
  excludedFromTotals: boolean;
};

const identity = (value: string | undefined) => (value ?? "").trim().toLowerCase();
const contactGaps = (email: string | undefined, phone: string | undefined) => {
  const gaps: string[] = [];
  if (!identity(email)) gaps.push("email");
  if ((phone ?? "").replace(/\D/g, "").length < 7) gaps.push("phone");
  return gaps;
};

export function programApprovalCandidates(input: {
  closingDinner: ClosingDinnerSubmission[];
  workshops: WorkshopSubmission[];
  poker: PokerSubmission[];
}): ProgramApprovalCandidate[] {
  const candidates: ProgramApprovalCandidate[] = [];
  const latestDinner = new Map<string, ClosingDinnerSubmission>();
  for (const row of [...input.closingDinner].filter(row => !row.removedAt).sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))) {
    const key = identity(row.email) || row.id;
    if (!latestDinner.has(key)) latestDinner.set(key, row);
  }
  for (const row of latestDinner.values()) {
    const missing = contactGaps(row.email, row.phone);
    if (row.bringingGuest) {
      if (!row.guestName.trim()) missing.push("guest name");
      if (!identity(row.guestEmail)) missing.push("guest email");
      if (row.guestPhone.replace(/\D/g, "").length < 7) missing.push("guest phone");
    }
    candidates.push({
      id: `closingDinner:${row.id}:closing-dinner`, sourceKind: "closingDinner", sourceId: row.id,
      eventKey: "closing-dinner", eventLabel: "Closing Dinner with Jewel", name: row.name, email: row.email,
      phone: row.phone, form: row.invitationLevel === "uber-vip" ? "Uber VIP closing dinner" : "Closing Dinner",
      requestedQuantity: closingDinnerSeats(row), fulfillment: "reservation", missingDetails: missing,
      formVersion: missing.length ? "legacy" : "current", submittedAt: row.submittedAt,
      excludedFromTotals: excludedFromPortalTotals(row),
    });
  }

  for (const row of input.workshops) {
    const missing = contactGaps(row.email, row.phone);
    if ((row.category === "siteVisit" || row.category === "wellness") && row.waiverAccepted !== true) missing.push("waiver");
    const eventLabel = row.category === "wellness" ? `Wellness · ${row.sessionTitle}` : row.category === "siteVisit" ? `Site Visit · ${row.sessionTitle}` : `Summit Workshop · ${row.sessionTitle}`;
    candidates.push({
      id: `workshop:${row.id}:${row.sessionId}`, sourceKind: "workshop", sourceId: row.id,
      eventKey: row.sessionId, eventLabel, name: row.name, email: row.email ?? "", phone: row.phone ?? "",
      form: row.category === "wellness" ? "Wellness" : row.category === "siteVisit" ? "Tennis & High Tea" : "Summit schedule",
      requestedQuantity: 1, fulfillment: "check-in", missingDetails: missing,
      formVersion: missing.length ? "legacy" : "current", submittedAt: row.submittedAt,
      excludedFromTotals: excludedFromPortalTotals(row),
    });
  }

  for (const row of input.poker.filter(row => !row.removedAt)) {
    const missing = contactGaps(row.email, row.phone);
    candidates.push({
      id: `poker:${row.id}:poker`, sourceKind: "poker", sourceId: row.id,
      eventKey: "poker", eventLabel: "All In for Mental Health Poker", name: row.name, email: row.email,
      phone: row.phone, form: row.sponsorship ? "Poker sponsorship" : "Poker request",
      requestedQuantity: row.seats, fulfillment: "reservation", missingDetails: missing,
      formVersion: missing.length ? "legacy" : "current", submittedAt: row.submittedAt,
      excludedFromTotals: excludedFromPortalTotals(row),
    });
  }
  return candidates.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
}

export function latestProgramApproval(candidate: ProgramApprovalCandidate, approvals: ProgramApprovalSubmission[]) {
  return approvals
    .filter(row => row.sourceKind === candidate.sourceKind && row.sourceId === candidate.sourceId && row.eventKey === candidate.eventKey)
    .sort((a, b) => b.reviewedAt.localeCompare(a.reviewedAt))[0];
}
