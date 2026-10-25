import { describe, expect, it } from "vitest";
import { memorySubmissionStore, ticketConfirmationPayloadSchema, ticketOfferPayloadSchema, type TicketConfirmationSubmission, type TicketOfferSubmission } from "./store";

const offer: TicketOfferSubmission = {
  id: "04ce66a3-fab8-4dce-94b2-b03b301e5060", submittedAt: "2026-10-24T23:00:00.000Z", source: "staff",
  externalApprovalId: "approval-123", sourceRsvpId: "rsvp-456", confirmationToken: "6070fb71-7f20-4ac6-b7f1-f9f4c6817e9d",
  name: "Guest One", email: "guest@example.com", phone: "7025550100", organization: "Example", professionalRole: "Founder",
  decision: "approved", awardsTicketsOffered: 2, communityDayTicketsOffered: 1, awardsAttendees: [], communityDayAttendees: [], approvalUpdatedAt: "2026-10-24T22:59:00.000Z",
};

describe("ticket approval and confirmation records", () => {
  it("keeps separate ticket allocations for the two events", () => {
    expect(ticketOfferPayloadSchema.parse(offer)).toMatchObject({ awardsTicketsOffered: 2, communityDayTicketsOffered: 1 });
  });

  it("stores a decline with zero tickets and rejects a zero-ticket approval", () => {
    expect(ticketOfferPayloadSchema.safeParse({ ...offer, decision: "declined", awardsTicketsOffered: 0, communityDayTicketsOffered: 0 }).success).toBe(true);
    expect(ticketOfferPayloadSchema.safeParse({ ...offer, decision: "approved", awardsTicketsOffered: 0, communityDayTicketsOffered: 0 }).success).toBe(false);
  });

  it("requires contact details for every confirmed attendee", () => {
    const result = ticketConfirmationPayloadSchema.safeParse({ offerId: offer.id, confirmationToken: offer.confirmationToken, name: offer.name, email: offer.email, phone: offer.phone, awardsAttendees: [{ name: "Guest One", email: "", phone: "" }], communityDayAttendees: [] });
    expect(result.success).toBe(false);
  });

  it("stores the response without modifying the approval offer", async () => {
    const store = memorySubmissionStore({ ticketOffer: [offer] });
    const response: TicketConfirmationSubmission = {
      id: offer.id, submittedAt: "2026-10-24T23:30:00.000Z", source: "form", offerId: offer.id,
      confirmationToken: offer.confirmationToken, externalApprovalId: offer.externalApprovalId,
      name: offer.name, email: offer.email, phone: offer.phone, organization: offer.organization, professionalRole: offer.professionalRole,
      awardsAttendees: [{ id: "guest-one", name: "Guest One", email: "guest@example.com", phone: "7025550100", organization: "Example", professionalRole: "Founder" }],
      communityDayAttendees: [], waivers: [], smsConsents: [], pendingWaiverIds: ["guest-one"], notes: "", mirrorStatus: "not-configured",
    };
    await store.add("ticketConfirmation", response);
    expect(await store.list("ticketOffer")).toEqual([offer]);
    expect((await store.list("ticketConfirmation"))[0]).toMatchObject({ offerId: offer.id, mirrorStatus: "not-configured" });
  });
});
