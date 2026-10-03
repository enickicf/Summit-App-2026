import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { z } from "zod";
import type { Store } from "@netlify/blobs";

// Owner (Sept 23): one clean staff portal for the Awards ticket requests (RSVP form) and the new
// nomination form. Submissions are stored in the website's Netlify Blobs store in production (no
// database credentials involved) and in a local JSON file in development and tests.

export const attendanceStatuses = ["attending", "needs_follow_up", "declined"] as const;
export type AttendanceStatus = (typeof attendanceStatuses)[number];

const text = (max: number) => z.string().trim().max(max);
const required = (max: number) => z.string().trim().min(1).max(max);
const personName = (max: number) => z.string().trim().min(2).max(max); // as the RSVP form always required
const email = z.string().trim().toLowerCase().max(254).regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email address.");

// Exactly the RSVP form's fields (Netlify site not-alone-awards-rsvp-2026).
export const rsvpPartners = ["", "nami"] as const;
export type RsvpPartner = (typeof rsvpPartners)[number];
export const rsvpPartnerLabels: Record<Exclude<RsvpPartner, "">, string> = { nami: "NAMI" };
// Owner (Oct 3, 2026): "How did you hear about us?" on the main RSVP form (required there; older or cached
// forms that do not send it still work and store "").
export const rsvpHeardFrom = ["", "inspiring-children", "nami", "lake-las-vegas", "other"] as const;
export type RsvpHeardFrom = (typeof rsvpHeardFrom)[number];
export const rsvpHeardFromLabels: Record<Exclude<RsvpHeardFrom, "">, string> = { "inspiring-children": "Inspiring Children", nami: "NAMI", "lake-las-vegas": "Lake Las Vegas", other: "Other" };
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
  attendanceStatus: z.enum(attendanceStatuses),
  // Owner (Sept 23): a separate toggle for Community Day (doors 5:30 PM). The form sends "on" when checked.
  communityDay: z.preprocess(value => value === true || value === "on" || value === "yes" || value === "true", z.boolean()).optional().default(false),
  guestCount: z.coerce.number().int().min(1).max(10).optional().default(1),
  notes: text(900).optional().default(""),
  website: text(200).optional().default("") // honeypot: bots fill it, people never see it
}).strip();
export type RsvpPayload = z.infer<typeof rsvpPayloadSchema>;

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

// Owner (Sept 28): morning workshop sign-ups from the Summit schedule page. Name only; the sign-up is
// exclusive to Summit attendees (invitation-only), and anyone not on the guest list is removed by staff.
export const workshopPayloadSchema = z.object({
  sessionId: text(120).min(1),
  sessionTitle: text(160).min(1),
  sessionDay: text(80).optional().default(""),
  sessionTime: text(40).optional().default(""),
  name: personName(120),
  website: text(200).optional().default("") // honeypot
}).strip();
export type WorkshopPayload = z.infer<typeof workshopPayloadSchema>;

export type Submission<T> = T & { id: string; submittedAt: string; source: "form" | "import"; legacyId?: string };
// Owner (Sept 28): a request can be removed from the working lists (test entries) without being deleted; it
// stays in the store with removedAt/removedReason and is shown under "Removed guests" in the portal.
// invitedBy / vip arrived Sept 30; records stored before then have neither (read as "" / false).
export type RsvpSubmission = Submission<Omit<RsvpPayload, "website" | "invitedBy" | "vip" | "partner" | "heardFrom">> & { invitedBy?: string; vip?: boolean; partner?: RsvpPartner; heardFrom?: RsvpHeardFrom; removedAt?: string; removedReason?: string };
export type NominationSubmission = Submission<Omit<NominationPayload, "website">>;
export type PokerSubmission = Submission<Omit<PokerPayload, "website">> & { removedAt?: string; removedReason?: string };
export type WorkshopSubmission = Submission<Omit<WorkshopPayload, "website"> & { category: "workshop" | "siteVisit" }>;
// Sept 28: one record per confirmation email sent for an RSVP (id = the RSVP id, submittedAt = when it was sent).
export type RsvpEmailRecord = Submission<{ email: string; subject: string; rsvpId: string }>;

// "vipRsvp" (Sept 30): requests from the unlisted VIP link, kept apart from the mass RSVPs and shown only in the VIP portal.
export type SubmissionKind = "rsvp" | "nomination" | "poker" | "rsvpEmail" | "workshop" | "vipRsvp";
export type AnySubmission = RsvpSubmission | NominationSubmission | PokerSubmission | RsvpEmailRecord | WorkshopSubmission;
export interface SubmissionStore {
  add(kind: "rsvp", record: RsvpSubmission): Promise<void>;
  add(kind: "nomination", record: NominationSubmission): Promise<void>;
  add(kind: "poker", record: PokerSubmission): Promise<void>;
  add(kind: "rsvpEmail", record: RsvpEmailRecord): Promise<void>;
  add(kind: "workshop", record: WorkshopSubmission): Promise<void>;
  add(kind: "vipRsvp", record: RsvpSubmission): Promise<void>;
  list(kind: "rsvp"): Promise<RsvpSubmission[]>;
  list(kind: "nomination"): Promise<NominationSubmission[]>;
  list(kind: "poker"): Promise<PokerSubmission[]>;
  list(kind: "rsvpEmail"): Promise<RsvpEmailRecord[]>;
  list(kind: "workshop"): Promise<WorkshopSubmission[]>;
  list(kind: "vipRsvp"): Promise<RsvpSubmission[]>;
  // Sept 28 (owner): permanent deletion of test entries; the route only allows it for records already marked removed.
  delete(kind: SubmissionKind, record: { id: string; submittedAt: string }): Promise<void>;
}

const keyFor = (record: { submittedAt: string; id: string }) => `${record.submittedAt}-${record.id}`;
const byNewest = <T extends { submittedAt: string }>(records: T[]) => [...records].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));

export function memorySubmissionStore(initial: { rsvp?: RsvpSubmission[]; nomination?: NominationSubmission[]; poker?: PokerSubmission[]; rsvpEmail?: RsvpEmailRecord[]; workshop?: WorkshopSubmission[]; vipRsvp?: RsvpSubmission[] } = {}): SubmissionStore {
  const data = { rsvp: new Map<string, RsvpSubmission>(), nomination: new Map<string, NominationSubmission>(), poker: new Map<string, PokerSubmission>(), rsvpEmail: new Map<string, RsvpEmailRecord>(), workshop: new Map<string, WorkshopSubmission>(), vipRsvp: new Map<string, RsvpSubmission>() };
  for (const record of initial.vipRsvp ?? []) data.vipRsvp.set(keyFor(record), record);
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
  const empty = () => ({ rsvp: [] as RsvpSubmission[], nomination: [] as NominationSubmission[], poker: [] as PokerSubmission[], rsvpEmail: [] as RsvpEmailRecord[], workshop: [] as WorkshopSubmission[], vipRsvp: [] as RsvpSubmission[] });
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

let cached: SubmissionStore | null = null;
export async function getSubmissionStore(): Promise<SubmissionStore> {
  if (cached) return cached;
  if (process.env.NETLIFY === "true" || process.env.NETLIFY_BLOBS_CONTEXT) {
    const { getStore } = await import("@netlify/blobs");
    cached = journaledStore(netlifyBlobsSubmissionStore(getStore({ name: "staff-portal", consistency: "strong" })), getStore({ name: "staff-portal-journal", consistency: "strong" }));
    return cached;
  }
  cached = fileSubmissionStore(process.env.STAFF_PORTAL_FILE ?? join(process.cwd(), "work", "staff-portal-store.json"));
  return cached;
}

export function newSubmission<T extends object>(payload: T, now: Date = new Date()): Submission<T> {
  return { ...payload, id: randomUUID(), submittedAt: now.toISOString(), source: "form" };
}

// The portal's headline numbers. Owner (Sept 30): a ticket request means the guest plans to attend, so
// tickets requested = party sizes of every request (only an explicit legacy "unable to attend" is left out),
// counting each email once (its latest request) so a repeat submission does not double count.
export const requestsTickets = (record: Pick<RsvpSubmission, "attendanceStatus">) => record.attendanceStatus !== "declined";
export function rsvpTotals(records: RsvpSubmission[]) {
  const latestByEmail = new Map<string, RsvpSubmission>();
  for (const record of byNewest(records)) if (!latestByEmail.has(record.email)) latestByEmail.set(record.email, record);
  const latest = [...latestByEmail.values()];
  const count = (status: AttendanceStatus) => latest.filter(record => record.attendanceStatus === status).length;
  const communityDay = latest.filter(record => record.communityDay);
  const vip = latest.filter(record => record.vip);
  const nami = latest.filter(record => record.partner === "nami");
  return {
    namiGuests: nami.length,
    namiTickets: nami.filter(requestsTickets).reduce((total, record) => total + record.guestCount, 0),
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
    communityDayTickets: communityDay.reduce((total, record) => total + record.guestCount, 0)
  };
}

export const activeRsvps = (records: RsvpSubmission[]) => records.filter(record => !record.removedAt);
export const vipRsvps = (records: RsvpSubmission[]) => records.filter(record => Boolean(record.vip));
export const namiRsvps = (records: RsvpSubmission[]) => records.filter(record => record.partner === "nami");
// Owner (Oct 2): every request shows which form it came through. NAMI wins over VIP if both were ever set.
export type RsvpForm = "Standard" | "VIP" | "NAMI";
export function rsvpForm(record: Pick<RsvpSubmission, "vip" | "partner">): RsvpForm {
  return record.partner === "nami" ? "NAMI" : record.vip ? "VIP" : "Standard";
}
export const withRsvpForm = (records: RsvpSubmission[]) => records.map(record => ({ ...record, form: rsvpForm(record), heardFromLabel: record.heardFrom ? rsvpHeardFromLabels[record.heardFrom] : "" }));
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
export const rsvpCsvColumns = ["submittedAt", "form", "name", "email", "phone", "organization", "professionalRole", "invitedBy", "heardFromLabel", "vip", "partner", "attendanceStatus", "communityDay", "guestCount", "notes", "source", "id", "removedAt", "removedReason"];

// Which part(s) of the evening a request covers: the Awards Show (their response) and/or Community Day (the toggle).
export function comingTo(record: Pick<RsvpSubmission, "attendanceStatus" | "communityDay">): ("awards" | "communityDay")[] {
  return [...(requestsTickets(record) ? ["awards" as const] : []), ...(record.communityDay ? ["communityDay" as const] : [])];
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
