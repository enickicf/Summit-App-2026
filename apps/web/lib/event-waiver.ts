import { z } from "zod";
export const eventWaiverVersion = "not-alone-events-2026-10-16";
export const eventWaiverLiability = "Participation is voluntary. I agree to follow event and venue instructions and understand that attendance involves risks, including injury, illness and loss of property. To the extent permitted by law, I release Inspiring Children Foundation, the Not Alone event organizers, participating partners, venues, staff and volunteers from claims arising from my attendance or participation, including ordinary negligence. This does not release gross negligence, intentional misconduct or any liability that cannot legally be waived.";
export const eventWaiverMedia = "I understand that event activities may be photographed, audio-recorded or filmed. I authorize Inspiring Children Foundation and the Not Alone event organizers and their authorized partners to use my name, image, likeness and voice captured at the event in event coverage and educational, promotional and fundraising content, including photographs and video, in any media worldwide, without compensation. This permission does not authorize disclosure of my private health information or use that falsely implies my endorsement of an unrelated product.";
export const eventWaiverSchema = z.discriminatedUnion("status", [
 z.object({status:z.literal("pending"),version:z.literal(eventWaiverVersion)}),
 z.object({status:z.literal("accepted"),version:z.literal(eventWaiverVersion),signature:z.string().trim().min(2).max(180),adultSelf:z.literal(true),liabilityAccepted:z.literal(true),mediaAccepted:z.literal(true),ticketTextConsent:z.literal(true).optional(),electronicConsent:z.literal(true)})
]);
export type EventWaiver = z.infer<typeof eventWaiverSchema>;
// Oct 21 (owner: "Loosen it"): Dr. Pamela M. Donnelly typed her name with "Dr." and signed without it, and Victoria "Tori"
// Smook signed without the nickname; both were refused four times. A signature now matches when it is the same person's
// name once titles (Dr., Mrs. ...), suffixes (Jr., PhD ...), quoted or bracketed nicknames, punctuation, accents and
// case are set aside, or when first and last names agree (a middle name or initial may be left out on either side).
const nameTitles = new Set(["dr","mr","mrs","ms","miss","mx","prof","professor","rev","sir","dame","hon","judge","coach"]);
const nameSuffixes = new Set(["jr","sr","ii","iii","iv","md","phd","psyd","edd","dds","do","rn","np","pa","lcsw","lmft","lpc","esq","mba","ma","ms","msw","cpa"]);
export function nameTokens(value: string): string[] {
  const plain = value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/["“”][^"“”]*["“”]/g, " ").replace(/\([^)]*\)/g, " ").replace(/[^a-z\s-]/g, " ").replace(/-/g, " ");
  const tokens = plain.split(/\s+/).filter(Boolean);
  while (tokens.length > 1 && nameTitles.has(tokens[0]!)) tokens.shift();
  while (tokens.length > 1 && nameSuffixes.has(tokens[tokens.length - 1]!)) tokens.pop();
  return tokens;
}
export function signatureMatchesAttendee(signature: string, name: string): boolean {
  const a = nameTokens(signature), b = nameTokens(name);
  if (!a.length || !b.length) return false;
  if (a.join(" ") === b.join(" ")) return true;
  return a.length >= 2 && b.length >= 2 && a[0] === b[0] && a[a.length - 1] === b[b.length - 1];
}
export function waiverMatchesAttendee(waiver: EventWaiver | undefined, name: string) {
 return !waiver || waiver.status === "pending" || signatureMatchesAttendee(waiver.signature, name);
}
/** The message a guest sees when their waiver is not ready: a signature that names someone else is called out as such. */
export function waiverProblemMessage(waiver: EventWaiver | undefined, name: string): string {
  if (waiver?.status === "accepted" && waiver.ticketTextConsent === true && !waiverMatchesAttendee(waiver, name))
    return `Your waiver signature (“${waiver.signature}”) must be your own name as entered above (“${name.trim()}”). Please type your name the same way in both places.`;
  return "Please personally accept every agreement and sign the waiver before submitting.";
}
export function waiverReadyForSubmission(waiver: EventWaiver | undefined, name: string) {
 return waiver?.status === "accepted" && waiver.ticketTextConsent === true && waiverMatchesAttendee(waiver, name);
}
export function waiverSummary(waiver?: EventWaiver) { return !waiver ? "Not collected (earlier form)" : waiver.status === "pending" ? "Pending — attendee must sign personally" : `Accepted by ${waiver.signature} · ${waiver.version}`; }
