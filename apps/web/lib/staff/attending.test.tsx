import { describe, expect, it } from "vitest";
import { comingTo, newSubmission, requestsTickets, rsvpPayloadSchema, rsvpTotals, withRsvpForm, type RsvpSubmission } from "./store";
import { rsvpConfirmationEmail } from "./rsvp-email";

// Owner (Oct 6, 2026): every RSVP form asks "What are you attending?": Awards Show + Community Day, Awards Show only,
// or Community Day only. Older forms (Community Day toggle only) keep working.
const base = { name: "Lisa Lundt", email: "lisa@example.com", phone: "702", organization: "", professionalRole: "", attendanceStatus: "attending" as const, guestCount: 2 };
const rsvp = (over: Partial<RsvpSubmission>): RsvpSubmission => ({ ...newSubmission(rsvpPayloadSchema.parse({ ...base })), ...over });

describe("What are you attending? (owner, Oct 6)", () => {
  it("accepts the three answers and the old toggle", () => {
    expect(rsvpPayloadSchema.parse({ ...base, attending: "community-day" }).attending).toBe("community-day");
    expect(rsvpPayloadSchema.parse({ ...base, attending: "Awards" }).attending).toBe("awards");
    expect(rsvpPayloadSchema.parse({ ...base, communityDay: "on" })).toMatchObject({ communityDay: true });
    expect(rsvpPayloadSchema.parse({ ...base, communityDay: "on" }).attending).toBeUndefined();
    expect(rsvpPayloadSchema.safeParse({ ...base, attending: "maybe" }).success).toBe(false);
  });

  it("a Community Day-only guest is not an Awards Show ticket but is a Community Day ticket", () => {
    const only = rsvp({ attending: "community-day", communityDay: true });
    const both = rsvp({ email: "b@example.com", attending: "both", communityDay: true });
    const show = rsvp({ email: "c@example.com", attending: "awards" });
    const legacy = rsvp({ email: "d@example.com", communityDay: true });
    expect(requestsTickets(only)).toBe(false);
    expect(comingTo(only)).toEqual(["communityDay"]);
    expect(comingTo(both)).toEqual(["awards", "communityDay"]);
    expect(comingTo(show)).toEqual(["awards"]);
    expect(comingTo(legacy)).toEqual(["awards", "communityDay"]);
    const totals = rsvpTotals([only, both, show, legacy]);
    expect(totals.ticketsRequested).toBe(6);
    expect(totals.communityDayTickets).toBe(6);
    expect(totals.communityDayOnlyGuests).toBe(1);
    expect(totals.communityDayOnlyTickets).toBe(2);
    expect(withRsvpForm([only, legacy, show]).map(row => row.attendingLabel)).toEqual(["Community Day only", "Awards Show + Community Day", "Awards Show only"]);
  });

  it("the confirmation email names only what the guest chose", () => {
    const only = rsvpConfirmationEmail(rsvp({ attending: "community-day", communityDay: true }));
    expect(only.subject).toBe("We received your RSVP – Nevada Mental Health Day");
    expect(only.text).toContain("Thank you for your RSVP to Nevada Mental Health Day.");
    expect(only.text).toContain("Attending: Nevada Mental Health Day");
    expect(only.text).not.toContain("Awards Show 7:30");
    const show = rsvpConfirmationEmail(rsvp({ attending: "awards" }));
    expect(show.subject).toBe("We received your RSVP – Not Alone Awards Show");
    expect(show.text).not.toContain("Nevada Mental Health Day");
    const both = rsvpConfirmationEmail(rsvp({ attending: "both", communityDay: true }));
    expect(both.subject).toContain("Nevada Mental Health Day & Not Alone Awards Show");
  });
});
