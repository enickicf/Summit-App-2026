import { randomUUID } from "node:crypto";
import { z } from "zod";
import { maxPartySize, type ClosingDinnerSubmission, type RsvpSubmission, type SubmissionStore } from "./store";

// Oct 20, 2026 (Cherrial, approved by the owner): "add a manual add a guest button into the staff portal so we can add in
// guests that Trent sends to us via WhatsApp/text". A staff-added guest is stored like any other RSVP (and, when they come
// to the Closing Dinner, a Closing Dinner request), tagged source "staff" with the staff member who added them, so they
// show in every list, CSV, the full backup and the Mac ledger. Owner: no automatic confirmation email for these guests;
// they get the normal one only when they fill out an RSVP form themselves (and the one-per-person limit never counts a
// staff-added record, so their own RSVP is accepted).
export const staffGuestLists = {
  standard: "Standard",
  vip: "VIP",
  "uber-vip": "Uber VIP",
  nami: "NAMI",
  "nami-vip": "NAMI VIP",
  "lake-las-vegas": "Lake Las Vegas",
  "lake-las-vegas-vip": "Lake Las Vegas VIP",
  usta: "USTA"
} as const;
export const staffGuestEvents = {
  awards: "Awards Show only",
  both: "Awards Show + Nevada Mental Health Day",
  "community-day": "Nevada Mental Health Day only",
  none: "Closing Dinner only"
} as const;

const trimmed = (max: number) => z.string().trim().max(max);
const flag = z.preprocess(value => value === true || value === "on" || value === "yes" || value === "true", z.boolean());
export const staffGuestSchema = z.object({
  name: z.string().trim().min(2, "Please enter the guest's full name.").max(180),
  email: z.string().trim().toLowerCase().max(254).regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter the guest's email address."),
  phone: trimmed(80).optional().default(""),
  organization: trimmed(240).optional().default(""),
  professionalRole: trimmed(180).optional().default(""),
  invitedBy: trimmed(180).optional().default(""),
  list: z.enum(Object.keys(staffGuestLists) as [keyof typeof staffGuestLists, ...(keyof typeof staffGuestLists)[]]).default("standard"),
  events: z.enum(Object.keys(staffGuestEvents) as [keyof typeof staffGuestEvents, ...(keyof typeof staffGuestEvents)[]]).default("awards"),
  closingDinner: flag.optional().default(false),
  guestCount: z.coerce.number().int().min(1).max(maxPartySize).default(1),
  notes: trimmed(900).optional().default(""),
  addedBy: z.string().trim().min(2, "Please enter your name (who is adding this guest).").max(120),
  allowDuplicate: flag.optional().default(false)
}).refine(input => input.events !== "none" || input.closingDinner, { message: "Choose at least one event for this guest.", path: ["events"] });
export type StaffGuestInput = z.infer<typeof staffGuestSchema>;

const listFields: Record<keyof typeof staffGuestLists, Partial<RsvpSubmission>> = {
  standard: {},
  vip: { vip: true },
  "uber-vip": { vip: true, invitationLevel: "uber-vip" },
  nami: { partner: "nami" },
  "nami-vip": { partner: "nami", vip: true },
  "lake-las-vegas": { tier: "lake-las-vegas" },
  "lake-las-vegas-vip": { tier: "lake-las-vegas", vip: true },
  usta: { partner: "usta" }
};

export function staffGuestRecords(input: StaffGuestInput, now = new Date()): { rsvp?: RsvpSubmission; dinner?: ClosingDinnerSubmission } {
  const base = { id: randomUUID(), submittedAt: now.toISOString(), source: "staff" as const, addedBy: input.addedBy };
  const out: { rsvp?: RsvpSubmission; dinner?: ClosingDinnerSubmission } = {};
  if (input.events !== "none") {
    out.rsvp = {
      ...base, name: input.name, email: input.email, phone: input.phone, organization: input.organization, professionalRole: input.professionalRole,
      invitedBy: input.invitedBy, vip: false, partner: "", heardFrom: "", tier: "", ...listFields[input.list],
      attendanceStatus: "attending", attending: input.events, communityDay: input.events !== "awards", guestCount: input.guestCount,
      guests: [], notes: input.notes
    } as RsvpSubmission;
  }
  if (input.closingDinner) {
    out.dinner = {
      ...base, id: randomUUID(), name: input.name, email: input.email, phone: input.phone, organization: input.organization,
      professionalRole: input.professionalRole, bringingGuest: false, guestName: "", guestEmail: "", guestPhone: "", notes: input.notes
    } as ClosingDinnerSubmission;
  }
  return out;
}

const digits = (value?: string) => { const d = (value ?? "").replace(/\D/g, ""); return d.length >= 7 ? d.slice(-10) : ""; };
/** Active RSVPs / Closing Dinner requests that already carry this guest's email or phone. */
export async function existingGuestRecords(store: SubmissionStore, input: Pick<StaffGuestInput, "email" | "phone">) {
  const email = input.email.toLowerCase(), phone = digits(input.phone);
  const [rsvps, dinners] = await Promise.all([store.list("rsvp"), store.list("closingDinner")]);
  return [...rsvps, ...dinners].filter(record => !record.removedAt && ((record.email ?? "").toLowerCase() === email || (phone && digits(record.phone) === phone)));
}

export type StaffGuestResult = { ok: true; added: string[] } | { ok: false; status: number; error: string };
export async function addStaffGuest(store: SubmissionStore, raw: Record<string, unknown>, now = new Date()): Promise<StaffGuestResult> {
  const parsed = staffGuestSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, status: 400, error: parsed.error.issues[0]?.message ?? "Please check the guest's details." };
  const input = parsed.data;
  if (!input.allowDuplicate) {
    const existing = await existingGuestRecords(store, input);
    if (existing.length) return { ok: false, status: 409, error: `${existing[0]!.name} is already on file with this email or phone (added ${new Date(existing[0]!.submittedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "America/Los_Angeles" })}). Tick "Add anyway" to add a second record.` };
  }
  const { rsvp, dinner } = staffGuestRecords(input, now);
  const added: string[] = [];
  if (rsvp) { await store.add("rsvp", rsvp); added.push(staffGuestEvents[input.events]); }
  if (dinner) { await store.add("closingDinner", dinner); added.push("Closing Dinner"); }
  return { ok: true, added };
}
