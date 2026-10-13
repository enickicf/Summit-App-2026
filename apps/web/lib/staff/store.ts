import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { z } from "zod";
import type { Store } from "@netlify/blobs";
import { signatureMatchesName } from "../morning-workshops";
import { textConsentColumns, textConsentCsvColumns } from "./text-consent";

// Owner (Sept 23): one clean staff portal for the Awards ticket requests (RSVP form) and the new
// nomination form. Submissions are stored in the website's Netlify Blobs store in production (no
// database credentials involved) and in a local JSON file in development and tests.

export const attendanceStatuses = ["attending", "needs_follow_up", "declined"] as const;
export const rsvpAttending = ["", "both", "awards", "community-day"] as const;
export type RsvpAttending = (typeof rsvpAttending)[number];
export const rsvpAttendingLabels: Record<RsvpAttending, string> = { "": "", both: "Awards Show + Community Day", awards: "Awards Show only", "community-day": "Community Day only" };
// Community Day is requested when the form says so (both / community-day) or the older toggle was on.
export const wantsCommunityDay = (record: { attending?: RsvpAttending | undefined; communityDay: boolean }) => record.attending === "both" || record.attending === "community-day" || (!record.attending && record.communityDay);
// The Awards Show is requested unless the guest chose Community Day only.
export const wantsAwardsShow = (record: { attending?: RsvpAttending | undefined }) => record.attending !== "community-day";
export type AttendanceStatus = (typeof attendanceStatuses)[number];

const text = (max: number) => z.string().trim().max(max);
const required = (max: number) => z.string().trim().min(1).max(max);
const personName = (max: number) => z.string().trim().min(2).max(max); // as the RSVP form always required
const email = z.string().trim().toLowerCase().max(254).regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email address.");

// Exactly the RSVP form's fields (Netlify site not-alone-awards-rsvp-2026).
export const rsvpPartners = ["", "nami", "usta"] as const;
export type RsvpPartner = (typeof rsvpPartners)[number];
export const rsvpPartnerLabels: Record<Exclude<RsvpPartner, "">, string> = { nami: "NAMI", usta: "USTA" };
// Owner (Oct 3, 2026): private plain RSVP forms per group; the form's link tags the request (Lake Las Vegas).
// Owner (Oct 7): the Nevada Mental Health Day page's own form ("Community Day & Awards Show") is tagged community-day.
export const rsvpTiers = ["", "lake-las-vegas", "community-day"] as const;
export type RsvpTier = (typeof rsvpTiers)[number];
// Owner (Oct 3, 2026): "How did you hear about us?" on the main RSVP form (required there; older or cached
// forms that do not send it still work and store "").
export const rsvpHeardFrom = ["", "inspiring-children", "nami", "lake-las-vegas", "usta", "other"] as const;
export type RsvpHeardFrom = (typeof rsvpHeardFrom)[number];
export const rsvpHeardFromLabels: Record<Exclude<RsvpHeardFrom, "">, string> = { "inspiring-children": "Inspiring Children", nami: "NAMI", "lake-las-vegas": "Lake Las Vegas", usta: "USTA", other: "Other" };
// Owner (Oct 5, 2026): a request can cover up to ten people, and the form collects the name, email and phone of
// every additional person in the party (the person filling in the form is the first). "guests" holds those
// additional people. Forms from before Oct 5 sent no list, so the field is optional and older records have none.
export const maxPartySize = 10;
export const partyGuestSchema = z.object({ name: personName(180), email, phone: required(80) }).strip();
export type PartyGuest = z.infer<typeof partyGuestSchema>;
export const rsvpPayloadSchema = z.object({
  name: personName(180),
  email,
  phone: text(80).optional().default(""),
  organization: text(240).optional().default(""),
  professionalRole: text(180).optional().default(""),
  // Owner / Ryan (Sept 30): who invited the guest (for seating), and whether the request came through the
  // unlisted VIP RSVP link (VIPs are listed first in the portal). The VIP page sends vip=on.
  invitedBy: text(180).optional().default(""),
  vip: z.preprocess(value => value === true || value === "on" || value === "yes" || value === "true", z.boolean()).optional().default(false),
  // Owner (Oct 2, 2026): requests from a partner's own RSVP form are tagged so staff can find them
  // (today only NAMI, via /rsvp/nami). They land with every other RSVP.
  partner: z.preprocess(value => String(value ?? "").trim().toLowerCase(), z.enum(rsvpPartners)).optional().default(""),
  heardFrom: z.preprocess(value => String(value ?? "").trim().toLowerCase(), z.enum(rsvpHeardFrom)).optional().default(""),
  tier: z.preprocess(value => String(value ?? "").trim().toLowerCase(), z.enum(rsvpTiers)).optional().default(""),
  attendanceStatus: z.enum(attendanceStatuses),
  // Owner (Oct 6, 2026): "What are you attending?" on every form: Awards Show + Community Day, Awards Show only, or
  // Community Day only (a guest may come to Community Day and not the show). Forms from before Oct 6 send only the
  // Community Day toggle (communityDay=on), which still works: no answer means the Awards Show as before.
  attending: z.preprocess(value => value === undefined || value === null ? undefined : String(value).trim().toLowerCase(), z.enum(rsvpAttending)).optional(),
  // Owner (Sept 23): a separate toggle for Community Day (doors 5:30 PM). The form sends "on" when checked.
  communityDay: z.preprocess(value => value === true || value === "on" || value === "yes" || value === "true", z.boolean()).optional().default(false),
  guestCount: z.coerce.number().int().min(1).max(maxPartySize).optional().default(1),
  guests: z.array(partyGuestSchema).max(maxPartySize - 1).optional(),
  notes: text(900).optional().default(""),
  // Owner (Oct 12): optional "text me updates" checkbox (lib/staff/text-consent.ts). Absent on forms from before Oct 12.
  textConsent: z.preprocess(value => value === undefined || value === null || value === "" ? undefined : value === true || value === "on" || value === "yes" || value === "true", z.boolean()).optional(),
  website: text(200).optional().default("") // honeypot: bots fill it, people never see it
}).strip();
export type RsvpPayload = z.infer<typeof rsvpPayloadSchema>;
// True when a form that sends the guest list (Oct 5 onward) does not name everyone in the party. A form from
// before Oct 5 sends no list at all and is still accepted, so a tab left open is never turned away.
export const partyGuestsIncomplete = (payload: Pick<RsvpPayload, "guestCount" | "guests">) => payload.guests !== undefined && payload.guests.length !== payload.guestCount - 1;
// One line per additional guest, for the portal and the spreadsheet: "Name <email> phone".
export const partyGuestLine = (guest: PartyGuest) => `${guest.name} <${guest.email}> ${guest.phone}`;

export const nominationPayloadSchema = z.object({
  nominatorName: personName(180),
  nominatorEmail: email,
  nominatorPhone: text(80).optional().default(""),
  relationship: text(180).optional().default(""),
  nomineeName: personName(180),
  nomineeOrganization: text(240).optional().default(""),
  category: required(120),
  reason: required(2000),
  links: text(600).optional().default(""),
  // Owner (Oct 13): the nomination form also carries the optional "text me updates" box (lib/staff/text-consent.ts).
  textConsent: z.preprocess(value => value === undefined || value === null || value === "" ? undefined : value === true || value === "on" || value === "yes" || value === "true", z.boolean()).optional(),
  website: text(200).optional().default("")
}).strip();
export type NominationPayload = z.infer<typeof nominationPayloadSchema>;

// The All In For Mental Health charity poker tournament (Nov 1, 2026), collected by its own site and
// mirrored here so every event's sign-ups sit in one portal, each in its own section.
export const pokerInterestValues = ["player", "table", "spectator", "information"] as const;

export const pokerSponsorshipLevels = {
  title: { label: "Title Sponsor", price: "$100,000", amount: 100_000, seats: 45, tickets: 25 },
  presenting: { label: "Presenting Sponsor", price: "$50,000", amount: 50_000, seats: 36, tickets: 20 },
  premier: { label: "Premier Sponsor", price: "$25,000", amount: 25_000, seats: 27, tickets: 15 },
  champion: { label: "Champion Sponsor", price: "$10,000", amount: 10_000, seats: 18, tickets: 10 },
  table: { label: "Table Sponsor", price: "$4,500", amount: 4_500, seats: 9, tickets: 5 } // owner: $4,500
} as const;
export type PokerSponsorshipLevel = keyof typeof pokerSponsorshipLevels;
export const pokerSponsorshipKeys = Object.keys(pokerSponsorshipLevels) as PokerSponsorshipLevel[];
export type PokerInterest = (typeof pokerInterestValues)[number];

export const pokerPayloadSchema = z.object({
  name: personName(180),
  email,
  phone: text(80).optional().default(""),
  organization: text(240).optional().default(""),
  interest: z.enum(pokerInterestValues),
  sponsorship: z.string().trim().max(40).refine(value => value === "" || (pokerSponsorshipKeys as string[]).includes(value), "Unknown sponsorship level").optional().default(""),
  seats: z.coerce.number().int().min(1).max(10).optional().default(1),
  experience: text(120).optional().default(""),
  notes: text(900).optional().default(""),
  website: text(200).optional().default("") // honeypot
}).strip();
export type PokerPayload = z.infer<typeof pokerPayloadSchema>;

// Oct 9: how a Tennis & High Tea guest gets to the site visit: the shuttle from Wynn valet, or driving themselves.
export const siteVisitTransportValues = ["wynn", "self"] as const;
export type SiteVisitTransport = (typeof siteVisitTransportValues)[number];
export const siteVisitTransportLabels: Record<SiteVisitTransport, string> = { wynn: "Transportation from Wynn", self: "Driving themselves" };

// Oct 9: the Tennis & High Tea form (public/tennis-high-tea, the ICF designer's page, owner: "use this one"). One
// request can pick tennis, high tea or both; the API stores one site-visit sign-up per activity so the portal's
// Tennis & High Tea view and its spreadsheet keep working unchanged.
export const siteVisitFormSchema = z.object({
  name: personName(120),
  email,
  phone: text(40).refine(value => /^[0-9+().\-\s]+$/.test(value) && value.replace(/\D/g, "").length >= 7, "Please enter a phone number."),
  tennis: z.boolean(),
  tea: z.boolean(),
  transport: z.enum(siteVisitTransportValues),
  // Owner (Oct 12): optional "text me updates" checkbox (lib/staff/text-consent.ts). Absent on forms from before Oct 12.
  textConsent: z.preprocess(value => value === undefined || value === null || value === "" ? undefined : value === true || value === "on" || value === "yes" || value === "true", z.boolean()).optional(),
  waiverAccepted: z.preprocess(value => value === true || value === "on" || value === "true", z.boolean()).optional(),
  signature: text(120).optional(),
  waiverVersion: text(40).optional(),
  website: text(200).optional().default("") // honeypot
}).strip();
export type SiteVisitFormPayload = z.infer<typeof siteVisitFormSchema>;

// Oct 12: the wellness class form (public/wellness, lib/wellness-signups-2026.ts): contact details, the chosen classes
// (ids from wellnessSessions) and the same signed activity waiver as Tennis & High Tea.
export const wellnessFormSchema = z.object({
  name: personName(120),
  email,
  phone: text(40).refine(value => /^[0-9+().\-\s]+$/.test(value) && value.replace(/\D/g, "").length >= 7, "Please enter a phone number."),
  sessions: z.array(text(80)).max(16),
  // Owner (Oct 12): optional "text me updates" checkbox (lib/staff/text-consent.ts). Absent on forms from before Oct 12.
  textConsent: z.preprocess(value => value === undefined || value === null || value === "" ? undefined : value === true || value === "on" || value === "yes" || value === "true", z.boolean()).optional(),
  waiverAccepted: z.preprocess(value => value === true || value === "on" || value === "true", z.boolean()).optional(),
  signature: text(120).optional(),
  waiverVersion: text(40).optional(),
  website: text(200).optional().default("") // honeypot
}).strip();
export type WellnessFormPayload = z.infer<typeof wellnessFormSchema>;

// Owner (Sept 28): morning workshop sign-ups from the Summit schedule page. Name only; the sign-up is
// exclusive to Summit attendees (invitation-only), and anyone not on the guest list is removed by staff.
// Owner (Oct 7): a Tennis / High Tea sign-up also carries a signed waiver: the box ticked (waiverAccepted), the
// full name typed as the signature, and the version of the waiver text that was shown. The three fields are
// optional here because the wellness workshops are name-only; the API requires all three for a site-visit
// sign-up (siteVisitWaiverProblem below).
export const workshopPayloadSchema = z.object({
  sessionId: text(120).min(1),
  sessionTitle: text(160).min(1),
  sessionDay: text(80).optional().default(""),
  sessionTime: text(40).optional().default(""),
  name: personName(120),
  waiverAccepted: z.preprocess(value => value === undefined || value === null ? undefined : value === true || value === "on" || value === "yes" || value === "true", z.boolean()).optional(),
  signature: text(120).optional(),
  waiverVersion: text(40).optional(),
  // Oct 9: the Tennis & High Tea form (/tennis-high-tea, the ICF designer's page) also asks for email, phone and how
  // the guest gets there; sign-ups from the schedule pop-up have none of the three.
  email: email.optional(),
  phone: text(40).optional(),
  transport: z.enum(siteVisitTransportValues).optional(),
  // Owner (Oct 12): optional "text me updates" checkbox (lib/staff/text-consent.ts). Absent on forms from before Oct 12.
  textConsent: z.preprocess(value => value === undefined || value === null || value === "" ? undefined : value === true || value === "on" || value === "yes" || value === "true", z.boolean()).optional(),
  website: text(200).optional().default("") // honeypot
}).strip();
export type WorkshopPayload = z.infer<typeof workshopPayloadSchema>;

/** Why a Tennis / High Tea sign-up cannot be accepted yet, as a message for the guest; null when the waiver is in order. */
export function siteVisitWaiverProblem(payload: Pick<WorkshopPayload, "name" | "waiverAccepted" | "signature" | "waiverVersion">): { field: "waiverAccepted" | "signature" | "waiverVersion"; error: string } | null {
  if (payload.waiverAccepted !== true) return { field: "waiverAccepted", error: "Please read the waiver and tick the box to agree to it." };
  const signature = (payload.signature ?? "").trim();
  if (signature.length < 2 || signature.length > 120) return { field: "signature", error: "Please type your full name to sign the waiver." };
  if (!signatureMatchesName(signature, payload.name)) return { field: "signature", error: "Your signature needs to match the full name you entered. Please type it exactly as above." };
  if (!(payload.waiverVersion ?? "").trim()) return { field: "waiverVersion", error: "Please refresh the page and sign up again." };
  return null;
}

export type Submission<T> = T & { id: string; submittedAt: string; source: "form" | "import"; legacyId?: string };
// Owner (Sept 28): a request can be removed from the working lists (test entries) without being deleted; it
// stays in the store with removedAt/removedReason and is shown under "Removed guests" in the portal.
// invitedBy / vip arrived Sept 30; records stored before then have neither (read as "" / false).
export type RsvpSubmission = Submission<Omit<RsvpPayload, "website" | "invitedBy" | "vip" | "partner" | "heardFrom" | "tier">> & { invitedBy?: string; vip?: boolean; partner?: RsvpPartner; heardFrom?: RsvpHeardFrom; tier?: RsvpTier; removedAt?: string; removedReason?: string };
export type NominationSubmission = Submission<Omit<NominationPayload, "website">>;
export type PokerSubmission = Submission<Omit<PokerPayload, "website">> & { removedAt?: string; removedReason?: string };
// Oct 7: waiverAccepted / signature / waiverVersion / waiverAcceptedAt are set on Tennis / High Tea sign-ups from Oct 7
// onward; sign-ups stored before then (and wellness sign-ups) have none of them.
export type WorkshopSubmission = Submission<Omit<WorkshopPayload, "website"> & { category: "workshop" | "siteVisit" | "wellness"; waiverAcceptedAt?: string }>;
// Sept 28: one record per confirmation email sent for an RSVP (id = the RSVP id, submittedAt = when it was sent).
// Oct 12 (owner): text message preferences. "yes" = gave consent on the text-updates page; "no" = opted out (on that page,
// by replying STOP, or recorded by staff). The latest record for a phone number or email wins, and an opt-out overrides
// any consent given on a form, so the guest is never texted again until they say yes.
export const textPreferenceSchema = z.object({
  name: text(180).optional().default(""),
  email: z.union([email, z.literal("")]).optional().default(""),
  phone: text(40).refine(value => value.replace(/\D/g, "").length >= 7, "Please enter a phone number."),
  choice: z.enum(["yes", "no"]),
  website: text(200).optional().default("") // honeypot
}).strip();
// Owner / Ryan (Oct 13): the closing night dinner and live performance with Jewel (Wed Nov 4, 7:00-10:00 PM, Margaux
// Ballroom). Unlisted request form on the RSVP site (closing-dinner-yiqy7fw0j3). A request is not a seat: space is limited,
// first come first served, and the team emails the guest if a spot is secured. One request = the guest, plus one guest
// if they bring one (name, email and phone then required).
export const closingDinnerPayloadSchema = z.object({
  name: personName(180),
  email,
  phone: text(80).refine(value => value.replace(/\D/g, "").length >= 7, "Please enter a phone number."),
  organization: required(240),
  professionalRole: required(180),
  bringingGuest: z.preprocess(value => value === true || value === "on" || value === "yes" || value === "true", z.boolean()).optional().default(false),
  guestName: text(180).optional().default(""),
  guestEmail: z.union([email, z.literal("")]).optional().default(""),
  guestPhone: text(80).optional().default(""),
  notes: text(900).optional().default(""),
  textConsent: z.preprocess(value => value === undefined || value === null || value === "" ? undefined : value === true || value === "on" || value === "yes" || value === "true", z.boolean()).optional(),
  website: text(200).optional().default("") // honeypot
}).strip();
export type ClosingDinnerPayload = z.infer<typeof closingDinnerPayloadSchema>;
/** Which guest field is missing when the guest is bringing someone; null when complete (or no guest). */
export function closingDinnerGuestProblem(payload: Pick<ClosingDinnerPayload, "bringingGuest" | "guestName" | "guestEmail" | "guestPhone">): { field: string; error: string } | null {
  if (!payload.bringingGuest) return null;
  if (payload.guestName.trim().length < 2) return { field: "guestName", error: "Please add your guest\u2019s full name." };
  if (!payload.guestEmail) return { field: "guestEmail", error: "Please add your guest\u2019s email address." };
  if (payload.guestPhone.replace(/\D/g, "").length < 7) return { field: "guestPhone", error: "Please add your guest\u2019s phone number." };
  return null;
}
export type ClosingDinnerSubmission = Submission<Omit<ClosingDinnerPayload, "website">> & { removedAt?: string; removedReason?: string };
export const closingDinnerSeats = (record: Pick<ClosingDinnerSubmission, "bringingGuest">) => record.bringingGuest ? 2 : 1;
export function closingDinnerTotals(records: ClosingDinnerSubmission[]) {
  const latestByEmail = new Map<string, ClosingDinnerSubmission>();
  for (const record of byNewest(records)) if (!latestByEmail.has(record.email)) latestByEmail.set(record.email, record);
  const latest = [...latestByEmail.values()];
  return { formsSubmitted: records.length, requests: latest.length, seatsRequested: latest.reduce((total, record) => total + closingDinnerSeats(record), 0), withGuest: latest.filter(record => record.bringingGuest).length };
}
export const closingDinnerCsvColumns = ["submittedAt", "name", "email", "phone", "organization", "professionalRole", "bringingGuest", "seats", "guestName", "guestEmail", "guestPhone", "notes", "textMessageConsent", "textConsentDate", "textConsentProtocol", "source", "id", "removedAt", "removedReason"];
export type TextPreferenceRecord = Submission<Omit<z.infer<typeof textPreferenceSchema>, "website"> & { via: "page" | "staff" | "stop-reply"; note?: string }>;
export type RsvpEmailRecord = Submission<{ email: string; subject: string; rsvpId: string }>;

// "vipRsvp" (Sept 30): requests from the unlisted VIP link, kept apart from the mass RSVPs and shown only in the VIP portal.
// "textPreference" (Oct 12): a guest's text message choice (yes / opt out) from the text-updates page or recorded by staff.
// "closingDinner" (Oct 13): requests for the Nov 4 closing night dinner with Jewel.
export type SubmissionKind = "rsvp" | "nomination" | "poker" | "rsvpEmail" | "workshop" | "vipRsvp" | "textPreference" | "closingDinner";
export type AnySubmission = RsvpSubmission | NominationSubmission | PokerSubmission | RsvpEmailRecord | WorkshopSubmission | TextPreferenceRecord | ClosingDinnerSubmission;
export interface SubmissionStore {
  add(kind: "rsvp", record: RsvpSubmission): Promise<void>;
  add(kind: "nomination", record: NominationSubmission): Promise<void>;
  add(kind: "poker", record: PokerSubmission): Promise<void>;
  add(kind: "rsvpEmail", record: RsvpEmailRecord): Promise<void>;
  add(kind: "workshop", record: WorkshopSubmission): Promise<void>;
  add(kind: "vipRsvp", record: RsvpSubmission): Promise<void>;
  add(kind: "textPreference", record: TextPreferenceRecord): Promise<void>;
  add(kind: "closingDinner", record: ClosingDinnerSubmission): Promise<void>;
  list(kind: "rsvp"): Promise<RsvpSubmission[]>;
  list(kind: "nomination"): Promise<NominationSubmission[]>;
  list(kind: "poker"): Promise<PokerSubmission[]>;
  list(kind: "rsvpEmail"): Promise<RsvpEmailRecord[]>;
  list(kind: "workshop"): Promise<WorkshopSubmission[]>;
  list(kind: "vipRsvp"): Promise<RsvpSubmission[]>;
  list(kind: "textPreference"): Promise<TextPreferenceRecord[]>;
  list(kind: "closingDinner"): Promise<ClosingDinnerSubmission[]>;
  // Sept 28 (owner): permanent deletion of test entries; the route only allows it for records already marked removed.
  delete(kind: SubmissionKind, record: { id: string; submittedAt: string }): Promise<void>;
}

const keyFor = (record: { submittedAt: string; id: string }) => `${record.submittedAt}-${record.id}`;
const byNewest = <T extends { submittedAt: string }>(records: T[]) => [...records].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));

export function memorySubmissionStore(initial: { rsvp?: RsvpSubmission[]; nomination?: NominationSubmission[]; poker?: PokerSubmission[]; rsvpEmail?: RsvpEmailRecord[]; workshop?: WorkshopSubmission[]; vipRsvp?: RsvpSubmission[]; textPreference?: TextPreferenceRecord[]; closingDinner?: ClosingDinnerSubmission[] } = {}): SubmissionStore {
  const data = { rsvp: new Map<string, RsvpSubmission>(), nomination: new Map<string, NominationSubmission>(), poker: new Map<string, PokerSubmission>(), rsvpEmail: new Map<string, RsvpEmailRecord>(), workshop: new Map<string, WorkshopSubmission>(), vipRsvp: new Map<string, RsvpSubmission>(), textPreference: new Map<string, TextPreferenceRecord>(), closingDinner: new Map<string, ClosingDinnerSubmission>() };
  for (const record of initial.closingDinner ?? []) data.closingDinner.set(keyFor(record), record);
  for (const record of initial.vipRsvp ?? []) data.vipRsvp.set(keyFor(record), record);
  for (const record of initial.textPreference ?? []) data.textPreference.set(keyFor(record), record);
  for (const record of initial.rsvp ?? []) data.rsvp.set(keyFor(record), record);
  for (const record of initial.nomination ?? []) data.nomination.set(keyFor(record), record);
  for (const record of initial.poker ?? []) data.poker.set(keyFor(record), record);
  for (const record of initial.rsvpEmail ?? []) data.rsvpEmail.set(keyFor(record), record);
  for (const record of initial.workshop ?? []) data.workshop.set(keyFor(record), record);
  return {
    async add(kind: SubmissionKind, record: AnySubmission) { (data[kind] as Map<string, typeof record>).set(keyFor(record), record); },
    async list(kind: SubmissionKind) { return byNewest([...data[kind].values()]) as never; },
    async delete(kind: SubmissionKind, record: { id: string; submittedAt: string }) { data[kind].delete(keyFor(record)); }
  } as SubmissionStore;
}

// Development/test store: one JSON file, never committed (work/ is local operational data).
export function fileSubmissionStore(file: string): SubmissionStore {
  const empty = () => ({ rsvp: [] as RsvpSubmission[], nomination: [] as NominationSubmission[], poker: [] as PokerSubmission[], rsvpEmail: [] as RsvpEmailRecord[], workshop: [] as WorkshopSubmission[], vipRsvp: [] as RsvpSubmission[], textPreference: [] as TextPreferenceRecord[], closingDinner: [] as ClosingDinnerSubmission[] });
  const read = (): ReturnType<typeof empty> => {
    // A store file written before a kind existed simply has no list for it.
    try { return existsSync(file) ? { ...empty(), ...JSON.parse(readFileSync(file, "utf8")) } : empty(); } catch { return empty(); }
  };
  const write = (data: ReturnType<typeof read>) => { mkdirSync(dirname(file), { recursive: true }); writeFileSync(file, JSON.stringify(data, null, 2)); };
  return {
    async add(kind: SubmissionKind, record: AnySubmission) {
      const data = read();
      const list = data[kind] as AnySubmission[];
      const at = list.findIndex(item => keyFor(item) === keyFor(record));
      if (at === -1) list.push(record); else list[at] = record;
      write(data);
    },
    async list(kind: SubmissionKind) { return byNewest(read()[kind] as AnySubmission[]) as never; },
    async delete(kind: SubmissionKind, record: { id: string; submittedAt: string }) { const data = read(); (data as Record<string, AnySubmission[]>)[kind] = (data[kind] as AnySubmission[]).filter(item => keyFor(item) !== keyFor(record)); write(data); }
  } as SubmissionStore;
}

// Sept 29, 2026: a portal page load reads one blob per submission, and a single transient Blobs
// failure (network blip, 5xx, rate limit) used to take the whole page down ("This page could not
// load", about one load in eight once the store held 30+ records). Every Blobs call is now retried
// with a short backoff, and reads run a few at a time instead of all at once.
export const blobsRetryDelaysMs = [250, 750, 1500];
export async function withRetry<T>(operation: () => Promise<T>, delays: readonly number[] = blobsRetryDelaysMs): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= delays.length; attempt += 1) {
    try { return await operation(); }
    catch (error) { lastError = error; if (attempt < delays.length) await new Promise(resolve => setTimeout(resolve, delays[attempt])); }
  }
  throw lastError;
}
export async function mapWithConcurrency<T, R>(items: readonly T[], limit: number, task: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  const worker = async () => { while (next < items.length) { const index = next; next += 1; results[index] = await task(items[index] as T); } };
  await Promise.all(Array.from({ length: Math.max(1, Math.min(limit, items.length)) }, worker));
  return results;
}

// Production store: Netlify Blobs (site-scoped, strongly consistent), one JSON blob per submission.
export function netlifyBlobsSubmissionStore(store: Pick<Store, "setJSON" | "list" | "get" | "delete">): SubmissionStore {
  return {
    async add(kind: SubmissionKind, record: AnySubmission) { await withRetry(() => store.setJSON(`${kind}/${keyFor(record)}.json`, record)); },
    async list(kind: SubmissionKind) {
      const { blobs } = await withRetry(() => store.list({ prefix: `${kind}/` }));
      const records: unknown[] = await mapWithConcurrency(blobs, 8, blob => withRetry(() => store.get(blob.key, { type: "json" })));
      return byNewest(records.filter((record): record is AnySubmission => Boolean(record && typeof record === "object" && "id" in record))) as never;
    },
    async delete(kind: SubmissionKind, record: { id: string; submittedAt: string }) { await withRetry(() => store.delete(`${kind}/${keyFor(record)}.json`)); }
  } as SubmissionStore;
}

// Owner (Sept 30, 2026): "so we never lose the info no matter what". Every record written to the portal
// store is first copied to a second, append-only Blobs store (`staff-portal-journal`): one new blob per
// write, never updated and never deleted by any portal action (remove, restore, permanent delete all leave
// the journal alone). It has no web endpoint; it is read only with the owner's Netlify account, for recovery.
export function journaledStore(store: SubmissionStore, journal: { setJSON(key: string, value: unknown): Promise<unknown> }, now: () => Date = () => new Date()): SubmissionStore {
  return {
    async add(kind: SubmissionKind, record: AnySubmission) {
      await withRetry(() => journal.setJSON(`${kind}/${keyFor(record)}/${now().toISOString()}.json`, record)).catch(error => console.error("journal write failed", error instanceof Error ? error.message : error));
      await (store.add as (kind: SubmissionKind, record: AnySubmission) => Promise<void>)(kind, record);
    },
    list: ((kind: SubmissionKind) => (store.list as (kind: SubmissionKind) => Promise<AnySubmission[]>)(kind)) as SubmissionStore["list"],
    delete: (kind, record) => store.delete(kind, record)
  } as SubmissionStore;
}

// On Netlify the store is created for each request and never kept. Netlify gives every request a fresh,
// short-lived storage token, and a Blobs store keeps the token it was created with. Until Oct 5, 2026 one store
// was kept for the life of a server instance, so about half an hour in every storage call on that instance began
// to fail ("Failed to decode token: Token expired", HTTP 401) until the instance was replaced: the staff portal
// and its export returned errors in bursts, and RSVP saves failed on Sept 28-30 (Netlify function log). Only the
// local file store (development and tests) is kept, since it has no token.
let cachedFileStore: SubmissionStore | null = null;
export async function getSubmissionStore(): Promise<SubmissionStore> {
  if (process.env.NETLIFY === "true" || process.env.NETLIFY_BLOBS_CONTEXT) {
    const { getStore } = await import("@netlify/blobs");
    return journaledStore(netlifyBlobsSubmissionStore(getStore({ name: "staff-portal", consistency: "strong" })), getStore({ name: "staff-portal-journal", consistency: "strong" }));
  }
  cachedFileStore ??= fileSubmissionStore(process.env.STAFF_PORTAL_FILE ?? join(process.cwd(), "work", "staff-portal-store.json"));
  return cachedFileStore;
}

export function newSubmission<T extends object>(payload: T, now: Date = new Date()): Submission<T> {
  return { ...payload, id: randomUUID(), submittedAt: now.toISOString(), source: "form" };
}

// The portal's headline numbers. Owner (Sept 30): a ticket request means the guest plans to attend, so
// tickets requested = party sizes of every request (only an explicit legacy "unable to attend" is left out),
// counting each email once (its latest request) so a repeat submission does not double count.
// Oct 6: Awards Show tickets only; a "Community Day only" request counts under Community Day, not here.
export const requestsTickets = (record: Pick<RsvpSubmission, "attendanceStatus"> & { attending?: RsvpAttending | undefined }) => record.attendanceStatus !== "declined" && wantsAwardsShow(record);
export function rsvpTotals(records: RsvpSubmission[]) {
  const latestByEmail = new Map<string, RsvpSubmission>();
  for (const record of byNewest(records)) if (!latestByEmail.has(record.email)) latestByEmail.set(record.email, record);
  const latest = [...latestByEmail.values()];
  const count = (status: AttendanceStatus) => latest.filter(record => record.attendanceStatus === status).length;
  const communityDay = latest.filter(wantsCommunityDay);
  const communityDayOnly = communityDay.filter(record => !wantsAwardsShow(record));
  const vip = latest.filter(record => record.vip);
  const nami = latest.filter(record => record.partner === "nami");
  const usta = latest.filter(record => record.partner === "usta");
  const lakeLasVegas = latest.filter(record => record.tier === "lake-las-vegas");
  return {
    lakeLasVegasGuests: lakeLasVegas.length,
    lakeLasVegasTickets: lakeLasVegas.filter(requestsTickets).reduce((total, record) => total + record.guestCount, 0),
    namiGuests: nami.length,
    namiTickets: nami.filter(requestsTickets).reduce((total, record) => total + record.guestCount, 0),
    ustaGuests: usta.length,
    ustaTickets: usta.filter(requestsTickets).reduce((total, record) => total + record.guestCount, 0),
    vipGuests: vip.length,
    vipTickets: vip.filter(requestsTickets).reduce((total, record) => total + record.guestCount, 0),
    formsSubmitted: records.length,
    uniqueGuests: latest.length,
    ticketsRequested: latest.filter(requestsTickets).reduce((total, record) => total + record.guestCount, 0),
    attending: count("attending"),
    moreInformation: count("needs_follow_up"),
    unable: count("declined"),
    // Community Day is asked separately (from Sept 23); requests before that have no answer and count as "no".
    communityDayGuests: communityDay.length,
    communityDayTickets: communityDay.reduce((total, record) => total + record.guestCount, 0),
    // Oct 6: guests coming to Community Day but not the Awards Show.
    communityDayOnlyGuests: communityDayOnly.length,
    communityDayOnlyTickets: communityDayOnly.reduce((total, record) => total + record.guestCount, 0)
  };
}

export const activeRsvps = (records: RsvpSubmission[]) => records.filter(record => !record.removedAt);
export const vipRsvps = (records: RsvpSubmission[]) => records.filter(record => Boolean(record.vip));
export const namiRsvps = (records: RsvpSubmission[]) => records.filter(record => record.partner === "nami");
export const ustaRsvps = (records: RsvpSubmission[]) => records.filter(record => record.partner === "usta");
export const lakeLasVegasRsvps = (records: RsvpSubmission[]) => records.filter(record => record.tier === "lake-las-vegas");
// Owner (Oct 2): every request shows which form it came through. NAMI wins over VIP if both were ever set.
// Owner (Oct 3): NAMI VIP and Lake Las Vegas VIP are private VIP forms tagged with their group as well.
export type RsvpForm = "Standard" | "VIP" | "NAMI" | "NAMI VIP" | "USTA" | "Lake Las Vegas" | "Lake Las Vegas VIP" | "Community Day";
export function rsvpForm(record: Pick<RsvpSubmission, "vip" | "partner" | "tier">): RsvpForm {
  if (record.partner === "nami") return record.vip ? "NAMI VIP" : "NAMI";
  if (record.partner === "usta") return "USTA";
  if (record.tier === "lake-las-vegas") return record.vip ? "Lake Las Vegas VIP" : "Lake Las Vegas";
  if (record.tier === "community-day") return "Community Day";
  return record.vip ? "VIP" : "Standard";
}
// Owner (Oct 3): one spreadsheet per form, for seating.
export const rsvpExportForms = { vip: "VIP", "nami-vip": "NAMI VIP", "lake-las-vegas-vip": "Lake Las Vegas VIP", "lake-las-vegas": "Lake Las Vegas", nami: "NAMI", usta: "USTA", standard: "Standard" } as const;
export type RsvpExportForm = keyof typeof rsvpExportForms;
export const rsvpsOfForm = (records: RsvpSubmission[], form: RsvpExportForm) => records.filter(record => rsvpForm(record) === rsvpExportForms[form]);
export const withRsvpForm = (records: RsvpSubmission[], textPreferences: readonly TextPreferenceRecord[] = []) => records.map(record => ({ ...record, form: rsvpForm(record), attendingLabel: record.attending ? rsvpAttendingLabels[record.attending] : (record.communityDay ? rsvpAttendingLabels.both : ""), heardFromLabel: record.heardFrom ? rsvpHeardFromLabels[record.heardFrom] : "", guestDetails: (record.guests ?? []).map(partyGuestLine).join("; "), ...textConsentColumns(record, textPreferences) }));
// Owner (Sept 30): the mass RSVP lists never include a VIP request, and the VIP portal reads only VIP requests.
// Owner (Oct 1, 2026, superseding the Sept 30 split): "make the backend of the VIP RSVP the same now since
// we are upping security, but make the forms still different". All RSVPs, VIP or not, live under "rsvp" and
// show in the one staff portal (VIP first, in its own section). Any record still stored under the old
// "vipRsvp" kind is moved back the first time the portal reads the store; nothing is lost.
export async function listAllRsvps(store: SubmissionStore): Promise<RsvpSubmission[]> {
  const parked = await store.list("vipRsvp");
  for (const record of parked) { await store.add("rsvp", { ...record, vip: true }); await store.delete("vipRsvp", record); }
  return store.list("rsvp");
}
export const listMassRsvps = listAllRsvps; // kept name for older imports
// VIP requests live under their own kind. A VIP request stored with the mass RSVPs (the few hours on
// Sept 30 before the split) is moved across the first time the VIP portal reads the store.
export async function listVipRsvps(store: SubmissionStore): Promise<RsvpSubmission[]> {
  return (await listAllRsvps(store)).filter(record => record.vip);
}
// Owner / Ryan (Sept 30): a VIP request must say the organization, the title and who invited the guest.
export function missingVipFields(record: Pick<RsvpSubmission, "vip" | "organization" | "professionalRole" | "invitedBy">): string[] {
  if (!record.vip) return [];
  return [["your organization", record.organization], ["your title", record.professionalRole], ["who invited you", record.invitedBy]].filter(([, value]) => !String(value ?? "").trim()).map(([label]) => label as string);
}
export const removedRsvps = (records: RsvpSubmission[]) => records.filter(record => Boolean(record.removedAt));
export const activeOf = <T extends { removedAt?: string }>(records: T[]) => records.filter(record => !record.removedAt);
export const removedOf = <T extends { removedAt?: string }>(records: T[]) => records.filter(record => Boolean(record.removedAt));

export const attendanceLabels: Record<AttendanceStatus, string> = { attending: "Yes, plans to attend", needs_follow_up: "Wants more information", declined: "Unable to attend" };

function csvCell(value: unknown): string {
  const text = value === undefined || value === null ? "" : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replaceAll("\"", "\"\"")}"` : text;
}
export function toCsv(rows: Record<string, unknown>[], columns: string[]): string {
  return [columns.join(","), ...rows.map(row => columns.map(column => csvCell(row[column])).join(","))].join("\r\n") + "\r\n";
}
export const rsvpCsvColumns = ["submittedAt", "form", "name", "email", "phone", "organization", "professionalRole", "invitedBy", "heardFromLabel", "vip", "partner", "tier", "attendanceStatus", "attendingLabel", "communityDay", "guestCount", "guestDetails", ...textConsentCsvColumns, "notes", "source", "id", "removedAt", "removedReason"];

// Which part(s) of the evening a request covers: the Awards Show (their response) and/or Community Day (the toggle).
export function comingTo(record: Pick<RsvpSubmission, "attendanceStatus" | "communityDay"> & { attending?: RsvpAttending | undefined }): ("awards" | "communityDay")[] {
  return [...(requestsTickets(record) ? ["awards" as const] : []), ...(wantsCommunityDay(record) ? ["communityDay" as const] : [])];
}
export const nominationCsvColumns = ["submittedAt", "nomineeName", "nomineeOrganization", "category", "reason", "links", "nominatorName", "nominatorEmail", "nominatorPhone", "relationship", "source", "id"];

// The poker tournament's own totals. Seats are counted once per email (their latest request), so a
// guest who submits twice is one guest — the same rule the ticket totals use.
export const pokerSeatInterests: PokerInterest[] = ["player", "table"];

export function pokerTotals(records: PokerSubmission[]) {
  const latestByEmail = new Map<string, PokerSubmission>();
  for (const record of byNewest(records)) if (!latestByEmail.has(record.email)) latestByEmail.set(record.email, record);
  const latest = [...latestByEmail.values()];
  const count = (interest: PokerInterest) => latest.filter(record => record.interest === interest).length;
  return {
    formsSubmitted: records.length,
    uniqueGuests: latest.length,
    seatsRequested: latest.filter(record => pokerSeatInterests.includes(record.interest)).reduce((total, record) => total + record.seats, 0),
    players: count("player"),
    tableSponsors: count("table"),
    spectators: count("spectator"),
    moreInformation: count("information")
  };
}

export const pokerInterestLabels: Record<PokerInterest, string> = {
  player: "Reserving a seat",
  table: "Sponsoring a table",
  spectator: "Attending, not playing",
  information: "Wants more information"
};

export const workshopCsvColumns = ["submittedAt", "name", "category", "sessionTitle", "sessionDay", "sessionTime", "sessionId", "source", "id"];
// Oct 7: the Tennis / High Tea spreadsheet also carries the signed waiver (empty for sign-ups from before Oct 7).
export const siteVisitCsvColumns = [...workshopCsvColumns, "waiverAccepted", "signature", "waiverVersion", "email", "phone", "transport"];
export const wellnessCsvColumns = ["submittedAt", "sessionDay", "sessionTime", "sessionTitle", "name", "email", "phone", "waiverAccepted", "signature", "waiverVersion", "sessionId", "id"];
export const pokerCsvColumns = ["submittedAt", "name", "email", "phone", "organization", "interest", "sponsorship", "seats", "experience", "notes", "source", "id", "removedAt", "removedReason"];

/** A sponsor is anyone who asked for a level; their pledged value is the matrix's own figure. */
export function isPokerSponsor(record: Pick<PokerSubmission, "interest" | "sponsorship">): boolean {
  return record.interest === "table" && Boolean(record.sponsorship);
}
export function pokerSponsorshipTotals(records: PokerSubmission[]) {
  const latestByEmail = new Map<string, PokerSubmission>();
  for (const record of byNewest(records)) if (!latestByEmail.has(record.email)) latestByEmail.set(record.email, record);
  const sponsors = [...latestByEmail.values()].filter(isPokerSponsor);
  return {
    sponsors: sponsors.length,
    pledged: sponsors.reduce((total, record) => total + (pokerSponsorshipLevels[record.sponsorship as PokerSponsorshipLevel]?.amount ?? 0), 0),
    reservedSeats: sponsors.reduce((total, record) => total + (pokerSponsorshipLevels[record.sponsorship as PokerSponsorshipLevel]?.seats ?? 0), 0),
    awardsTickets: sponsors.reduce((total, record) => total + (pokerSponsorshipLevels[record.sponsorship as PokerSponsorshipLevel]?.tickets ?? 0), 0)
  };
}
