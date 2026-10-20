import { z } from "zod";
export const eventWaiverVersion = "not-alone-events-2026-10-16";
export const eventWaiverLiability = "Participation is voluntary. I agree to follow event and venue instructions and understand that attendance involves risks, including injury, illness and loss of property. To the extent permitted by law, I release Inspiring Children Foundation, the Not Alone event organizers, participating partners, venues, staff and volunteers from claims arising from my attendance or participation, including ordinary negligence. This does not release gross negligence, intentional misconduct or any liability that cannot legally be waived.";
export const eventWaiverMedia = "I understand that event activities may be photographed, audio-recorded or filmed. I authorize Inspiring Children Foundation and the Not Alone event organizers and their authorized partners to use my name, image, likeness and voice captured at the event in event coverage and educational, promotional and fundraising content, including photographs and video, in any media worldwide, without compensation. This permission does not authorize disclosure of my private health information or use that falsely implies my endorsement of an unrelated product.";
export const eventWaiverSchema = z.discriminatedUnion("status", [
 z.object({status:z.literal("pending"),version:z.literal(eventWaiverVersion)}),
 z.object({status:z.literal("accepted"),version:z.literal(eventWaiverVersion),signature:z.string().trim().min(2).max(180),adultSelf:z.literal(true),liabilityAccepted:z.literal(true),mediaAccepted:z.literal(true),ticketTextConsent:z.literal(true).optional(),electronicConsent:z.literal(true)})
]);
export type EventWaiver = z.infer<typeof eventWaiverSchema>;
export function waiverMatchesAttendee(waiver: EventWaiver | undefined, name: string) {
 const normalize=(s:string)=>s.normalize("NFKC").toLowerCase().replace(/\s+/g," ").trim();
 return !waiver || waiver.status === "pending" || normalize(waiver.signature)===normalize(name);
}
export function waiverReadyForSubmission(waiver: EventWaiver | undefined, name: string) {
 return waiver?.status === "accepted" && waiver.ticketTextConsent === true && waiverMatchesAttendee(waiver, name);
}
export function waiverSummary(waiver?: EventWaiver) { return !waiver ? "Not collected (earlier form)" : waiver.status === "pending" ? "Pending — attendee must sign personally" : `Accepted by ${waiver.signature} · ${waiver.version}`; }
