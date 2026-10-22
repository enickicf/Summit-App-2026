import { eventWaiverSchema, waiverMatchesAttendee, waiverProblemMessage, waiverReadyForSubmission } from "../event-waiver";
import { createHash } from "node:crypto";
import { z } from "zod";
import { rsvpPayloadSchema, closingDinnerPayloadSchema, type SubmissionStore } from "./store";

const person = z.object({
  eventWaiver: eventWaiverSchema.optional(),
  name: z.string().trim().min(2).max(180),
  email: z.email().trim().toLowerCase().max(254),
  phone: z.string().trim().max(80).refine(v => v.replace(/\D/g, "").length >= 7),
  organization: z.string().trim().min(1).max(240),
  professionalRole: z.string().trim().min(1).max(180)
});
export const invitationSchema = z.object({
  requestId: z.uuid(), requestedAt: z.iso.datetime(), level: z.enum(["vip", "uber-vip"]),
  requester: person, invitedBy: z.string().trim().min(1).max(180),
  day: z.array(person).max(2), awards: z.array(person).max(2), dinner: z.array(person).max(2),
  groupWaiverAttestation: z.boolean().default(false), groupEventTextConsent: z.boolean().optional(), notes: z.string().trim().max(600).default(""), textConsent: z.boolean().default(false), website: z.string().max(200).default("")
}).superRefine((p, ctx) => {
  if (!p.day.length && !p.awards.length && !p.dinner.length) ctx.addIssue({ code: "custom", message: "Choose at least one event." });
  if (!waiverReadyForSubmission(p.requester.eventWaiver,p.requester.name)) ctx.addIssue({ code: "custom", message: waiverProblemMessage(p.requester.eventWaiver,p.requester.name) });
  if (p.level === "vip" && p.dinner.length) ctx.addIssue({ code: "custom", message: "Closing dinner is available only on the Uber VIP invitation." });
  const known = new Map<string, string>();
  for (const event of ["day", "awards", "dinner"] as const) {
    const emails = new Set<string>();
    for (const guest of p[event]) {
      if (emails.has(guest.email)) ctx.addIssue({ code: "custom", message: "List each person only once per event, using their own email." });
      emails.add(guest.email);
      if (!waiverMatchesAttendee(guest.eventWaiver,guest.name)) ctx.addIssue({code:"custom",message:"The waiver must be signed personally by the named attendee."});
      const {eventWaiver: _waiver,...identity}=guest;
      const details = JSON.stringify(identity);
      if (known.has(guest.email) && known.get(guest.email) !== details) ctx.addIssue({ code: "custom", message: "Use matching contact details for a person attending more than one event." });
      known.set(guest.email, details);
    }
  }
  if(known.size>2)ctx.addIssue({code:"custom",message:"This invitation covers you and one guest: two people maximum across all events."});
  if(known.size>1&&!p.groupWaiverAttestation)ctx.addIssue({code:"custom",message:"Please complete the required group agreement for your guest."});
  if(!known.has(p.requester.email))ctx.addIssue({code:"custom",message:"Select at least one event for yourself."});
});
export type InvitationPayload = z.infer<typeof invitationSchema>;

// One record per named ticket holder, with explicit event membership. This keeps
// existing portal totals/exports correct even when event party sizes differ.
// A frozen request timestamp + deterministic IDs make partial-save retries safe.
export async function saveInvitation(p: InvitationPayload, store: SubmissionStore) {
  const fingerprint = createHash("sha256").update(JSON.stringify(p)).digest("hex");
  const recordMeta = (kind: string, email: string) => ({
    id: `invite-${createHash("sha256").update(`${fingerprint}:${kind}:${email}`).digest("hex")}`,
    submittedAt: p.requestedAt, receivedAt: new Date().toISOString(), source: "form" as const,
    invitationLevel: p.level, invitationRequestId: p.requestId,
    requesterName: p.requester.name, requesterEmail: p.requester.email, requesterPhone: p.requester.phone, requesterOrganization: p.requester.organization, requesterProfessionalRole: p.requester.professionalRole
  });
  const notes = [`${p.level === "uber-vip" ? "Uber VIP" : "VIP"} invitation. Requester: ${p.requester.email}.`, p.notes].filter(Boolean).join("\n");
  const accepted = new Map([...p.day,...p.awards,...p.dinner].filter(g=>g.eventWaiver?.status==="accepted").map(g=>[g.email,g.eventWaiver]));
  const people = new Map([...p.day, ...p.awards].map(g => [g.email, {...g,eventWaiver:accepted.get(g.email)??g.eventWaiver}]));
  const plans = [...people.values()].map(g => {
    const day = p.day.some(x => x.email === g.email), awards = p.awards.some(x => x.email === g.email);
    const { website: _, ...payload } = rsvpPayloadSchema.parse({ ...g, vip: true, invitedBy: p.invitedBy, attendanceStatus: "attending", attending: day && awards ? "both" : day ? "community-day" : "awards", communityDay: day, guestCount: 1, guests: [], notes, groupWaiverAttestation:p.groupWaiverAttestation, groupEventTextConsent:g.eventWaiver?.status==="accepted"&&g.eventWaiver.ticketTextConsent===true, textConsent: g.email === p.requester.email ? p.textConsent : undefined });
    return { ...payload, ...recordMeta("rsvp", g.email) };
  });
  const dinners = p.dinner.map(g => {
    const waiver=accepted.get(g.email)??g.eventWaiver;
    const { website: _, ...payload } = closingDinnerPayloadSchema.parse({ ...g, eventWaiver:waiver, bringingGuest: false, notes, groupWaiverAttestation:p.groupWaiverAttestation, groupEventTextConsent:waiver?.status==="accepted"&&waiver.ticketTextConsent===true, textConsent: g.email === p.requester.email ? p.textConsent : undefined });
    return { ...payload, ...recordMeta("dinner", g.email) };
  });
  // Validate/build the entire request before writing anything. Successful writes
  // survive a partial failure; retry writes the same keys, never new guests.
  const prior=await store.list("rsvp");
  for (const record of plans) {const existing=prior.find(r=>r.id===record.id);await store.add("rsvp",existing?.eventWaiver?.status==="accepted"?{...existing,...record,eventWaiver:existing.eventWaiver}:record);}
  const priorDinner=await store.list("closingDinner");
  for (const record of dinners) {const existing=priorDinner.find(r=>r.id===record.id);await store.add("closingDinner",existing?.eventWaiver?.status==="accepted"?{...existing,...record,eventWaiver:existing.eventWaiver}:record);}
  return { day: p.day.length, awards: p.awards.length, dinner: p.dinner.length };
}
