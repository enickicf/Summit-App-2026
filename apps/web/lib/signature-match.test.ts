import { describe, expect, it } from "vitest";
import { signatureMatchesAttendee, waiverProblemMessage } from "./event-waiver";

// Oct 21 (owner: "Loosen it"): titles, nicknames and middle names no longer block a guest's own signature.
describe("waiver signature matches the attendee's name", () => {
  it("accepts the real cases that were refused on Oct 20-21", () => {
    expect(signatureMatchesAttendee("Pamela M. Donnelly", "Dr. Pamela M. Donnelly")).toBe(true);
    expect(signatureMatchesAttendee("Victoria Smook", 'Victoria "Tori" Smook')).toBe(true);
  });
  it("ignores case, accents, punctuation, suffixes and a missing middle name", () => {
    expect(signatureMatchesAttendee("jose garcia", "José García")).toBe(true);
    expect(signatureMatchesAttendee("Pamela Donnelly", "Pamela M. Donnelly")).toBe(true);
    expect(signatureMatchesAttendee("Mary-Kate Olsen", "Mary Kate Olsen")).toBe(true);
    expect(signatureMatchesAttendee("John Smith", "John Smith Jr.")).toBe(true);
    expect(signatureMatchesAttendee("Jane Doe", "Jane Doe, PhD")).toBe(true);
  });
  it("still refuses someone else's name", () => {
    expect(signatureMatchesAttendee("Annabel Berthold", "Pamela Donnelly")).toBe(false);
    expect(signatureMatchesAttendee("Pamela Smith", "Pamela Donnelly")).toBe(false);
    expect(signatureMatchesAttendee("Pam", "Pamela Donnelly")).toBe(false);
  });
  it("tells the guest when the signature is the problem", () => {
    const waiver = { status: "accepted", version: "x", signature: "Annabel Berthold", adultSelf: true, liabilityAccepted: true, mediaAccepted: true, ticketTextConsent: true, electronicConsent: true } as never;
    expect(waiverProblemMessage(waiver, "Pamela Donnelly")).toMatch(/signature .* must be your own name/);
  });
});
