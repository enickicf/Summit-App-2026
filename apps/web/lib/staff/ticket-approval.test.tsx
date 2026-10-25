import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { TicketApprovalWorkbench } from "../../components/ticket-approval-workbench";
import { TicketConfirmationForm } from "../../components/ticket-confirmation-form";
import type { RsvpSubmission } from "./store";
import { ticketApprovalCandidates } from "./ticket-approval";

const row = (overrides: Partial<RsvpSubmission> = {}): RsvpSubmission => ({
  id: "rsvp-1", submittedAt: "2026-10-24T18:00:00.000Z", source: "form", name: "Alex Guest", email: "alex@example.com", phone: "7025550100", organization: "Example", professionalRole: "Founder", invitedBy: "", vip: false, partner: "", heardFrom: "", tier: "", attendanceStatus: "attending", attending: "awards", communityDay: false, guestCount: 1, guests: [], groupWaiverAttestation: false, notes: "", ...overrides,
});

describe("ticket approval candidates", () => {
  it("keeps the newest request for each event without erasing the other event", () => {
    const awards = row({ id: "awards", guestCount: 3, guests: [
      { name: "Guest Two", email: "two@example.com", phone: "7025550102", organization: "", professionalRole: "" },
      { name: "Guest Three", email: "three@example.com", phone: "7025550103", organization: "", professionalRole: "" },
    ] });
    const day = row({ id: "day", submittedAt: "2026-10-24T19:00:00.000Z", attending: "community-day", communityDay: true, guestCount: 2, guests: [{ name: "Guest Two", email: "two@example.com", phone: "7025550102", organization: "", professionalRole: "" }] });
    expect(ticketApprovalCandidates([awards, day])[0]).toMatchObject({ awardsRequested: 3, communityDayRequested: 2 });
  });

  it("groups a combined VIP invitation into one party", () => {
    const requester = row({ id: "vip-a", invitationLevel: "vip", invitationRequestId: "invite-1", requesterName: "Alex Guest", requesterEmail: "alex@example.com", requesterPhone: "7025550100", requesterOrganization: "Example", requesterProfessionalRole: "Founder", vip: true, attending: "both", communityDay: true });
    const guest = row({ id: "vip-b", name: "Taylor Guest", email: "taylor@example.com", phone: "7025550101", invitationLevel: "vip", invitationRequestId: "invite-1", requesterName: "Alex Guest", requesterEmail: "alex@example.com", requesterPhone: "7025550100", requesterOrganization: "Example", requesterProfessionalRole: "Founder", vip: true, attending: "awards" });
    const result = ticketApprovalCandidates([requester, guest]);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ form: "VIP", awardsRequested: 2, communityDayRequested: 1, name: "Alex Guest" });
  });

  it("renders the protected decision workspace and personal confirmation controls", () => {
    const candidate = ticketApprovalCandidates([row()])[0]!;
    const workbench = renderToStaticMarkup(<TicketApprovalWorkbench candidates={[candidate]} initialOffers={[]} confirmations={[]}/>);
    expect(workbench).toContain("Ticket approvals");
    expect(workbench).toContain("Approve allocation");
    const offer = {
      id: "04ce66a3-fab8-4dce-94b2-b03b301e5060", submittedAt: "2026-10-24T23:00:00.000Z", source: "staff" as const,
      externalApprovalId: candidate.id, sourceRsvpId: candidate.sourceRsvpId, confirmationToken: "6070fb71-7f20-4ac6-b7f1-f9f4c6817e9d",
      name: candidate.name, email: candidate.email, phone: candidate.phone, organization: candidate.organization, professionalRole: candidate.professionalRole,
      decision: "approved" as const, awardsTicketsOffered: 1, communityDayTicketsOffered: 0,
      awardsAttendees: candidate.awardsAttendees, communityDayAttendees: [], approvalUpdatedAt: "2026-10-24T23:00:00.000Z",
    };
    const confirmation = renderToStaticMarkup(<TicketConfirmationForm offer={offer}/>);
    expect(confirmation).toContain("Who is completing this form?");
    expect(confirmation).toContain("complete waivers later");
    expect(confirmation).toContain("Submit confirmation");
  });
});
