import { describe, expect, it } from "vitest";
import { programApprovalCandidates } from "./cheryl-operations";
import { memorySubmissionStore, programApprovalPayloadSchema, type ClosingDinnerSubmission, type PokerSubmission, type ProgramApprovalSubmission, type WorkshopSubmission } from "./store";

describe("Cheryl Operations", () => {
  it("builds review candidates for every non-ticket program and flags legacy contact gaps", () => {
    const common = { submittedAt: "2026-10-24T20:00:00.000Z", source: "form" as const };
    const dinner = { ...common, id: "dinner", name: "Dinner Guest", email: "dinner@example.com", phone: "7025551212", organization: "ICF", professionalRole: "Guest", bringingGuest: false, guestName: "", guestEmail: "", guestPhone: "", notes: "", textConsent: false } as ClosingDinnerSubmission;
    const wellness = { ...common, id: "wellness", sessionId: "breathwork", sessionTitle: "Breathwork", sessionDay: "Nov 2", sessionTime: "10 AM", name: "Wellness Guest", email: "wellness@example.com", phone: "7025553434", category: "wellness" as const, waiverAccepted: true, signature: "Wellness Guest", waiverVersion: "v1" } as WorkshopSubmission;
    const workshop = { ...common, id: "workshop", sessionId: "leaders", sessionTitle: "Leaders Session", sessionDay: "Nov 3", sessionTime: "10 AM", name: "Legacy Guest", category: "workshop" as const } as WorkshopSubmission;
    const poker = { ...common, id: "poker", name: "Poker Guest", email: "poker@example.com", phone: "7025555656", organization: "", interest: "player" as const, sponsorship: "", seats: 2, experience: "", notes: "" } as PokerSubmission;
    const rows = programApprovalCandidates({ closingDinner: [dinner], workshops: [wellness, workshop], poker: [poker] });
    expect(rows.map(row => row.eventLabel)).toEqual(expect.arrayContaining(["Closing Dinner with Jewel", "Wellness · Breathwork", "Summit Workshop · Leaders Session", "All In for Mental Health Poker"]));
    expect(rows.find(row => row.sourceId === "workshop")).toMatchObject({ formVersion: "legacy", missingDetails: ["email", "phone"] });
  });

  it("stores a separate journal-compatible decision without changing the source request", async () => {
    const parsed = programApprovalPayloadSchema.parse({ sourceKind: "workshop", sourceId: "source-1", eventKey: "wellness-1", eventLabel: "Wellness · Yoga", name: "Guest Person", email: "guest@example.com", phone: "7025551212", form: "Wellness", requestedQuantity: 1, approvedQuantity: 1, decision: "approved", fulfillment: "check-in", confirmationStatus: "ready", missingDetails: [], formVersion: "current", notes: "Reviewed with Ryan", reviewedAt: "2026-10-24T20:05:00.000Z" });
    const record: ProgramApprovalSubmission = { ...parsed, id: "approval-1", submittedAt: "2026-10-24T20:05:00.000Z", source: "staff" };
    const store = memorySubmissionStore();
    await store.add("programApproval", record);
    await expect(store.list("programApproval")).resolves.toEqual([record]);
  });
});
