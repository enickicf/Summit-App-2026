import { getSubmissionStore, type SubmissionStore } from "./store";

// Owner (Oct 20, 2026): "No other numbers should be able to submit more than one application or RSVP ... However,
// ambassador@inspiringchildren.org, music@inspiringchildren.org, my phone number ... and Cherrial Odell's phone number
// ... can submit as many submissions as they want."
//
// Owner (Oct 20, later): guests who used the old forms (no details for each guest) must be able to send the form again,
// so each person may submit each form type up to THREE times (submissionsPerPerson); a fourth request whose email OR phone
// (last 10 digits) matches is refused with 409 and a message telling the guest we already have their request. On the RSVP
// forms (rsvp, closing-dinner, invitation-rsvp) a new submission REPLACES the earlier one (replaceEarlierSubmissions):
// the older record is marked removed with the reason "Replaced by an updated submission" and replacedBy = the new id, so
// lists and totals show one up-to-date record per person; nothing is deleted. Nothing is lost: the refused body is still in the submission inbox (received/ and failed/).
// Never limited: a retry of the same request (same requestId, which the handlers already store once), the attendee
// waiver (it completes an existing RSVP), text preferences (an opt-out must always go through) and the closed Summit
// workshop sign-up (one request per session). Exempt from the limit (unlimited tests): the addresses and phone numbers
// below plus SUBMISSION_TEST_ALLOWLIST (comma-separated emails / phone numbers, set on Netlify; the phone numbers live
// there, not in the source).
export const unlimitedSubmitters = ["ambassador@inspiringchildren.org", "music@inspiringchildren.org"];

type Contact = { email: string; phone: string };
type AnyRecord = Record<string, unknown> & { id?: string; submittedAt?: string; removedAt?: string };
type Scope = { kinds: ("rsvp" | "closingDinner" | "nomination" | "poker" | "workshop")[]; keep?: (record: AnyRecord) => boolean; contact?: (record: AnyRecord) => Contact; label: string };

const str = (value: unknown) => (typeof value === "string" ? value : "");
const fromInvitation = (record: AnyRecord) => Boolean(str(record.invitationRequestId));
export const limitedEndpoints: Record<string, Scope> = {
  rsvp: { kinds: ["rsvp"], keep: record => !fromInvitation(record), label: "RSVP" },
  "closing-dinner": { kinds: ["closingDinner"], keep: record => !fromInvitation(record), label: "Closing Dinner request" },
  "invitation-rsvp": { kinds: ["rsvp", "closingDinner"], keep: fromInvitation, contact: record => ({ email: str(record.requesterEmail) || str(record.email), phone: str(record.requesterPhone) || str(record.phone) }), label: "invitation RSVP" },
  nominations: { kinds: ["nomination"], contact: record => ({ email: str(record.nominatorEmail), phone: str(record.nominatorPhone) }), label: "nomination" },
  poker: { kinds: ["poker"], label: "request" },
  wellness: { kinds: ["workshop"], keep: record => record.category === "wellness", label: "wellness sign-up" },
  "site-visit": { kinds: ["workshop"], keep: record => record.category === "siteVisit", label: "Tennis & High Tea sign-up" }
};

export const normalEmail = (value: string) => value.trim().toLowerCase();
export const normalPhone = (value: string) => { const digits = value.replace(/\D/g, ""); return digits.length >= 7 ? digits.slice(-10) : ""; };

export function isUnlimitedSubmitter(contact: Contact, extra = process.env.SUBMISSION_TEST_ALLOWLIST ?? ""): boolean {
  const entries = [...unlimitedSubmitters, ...extra.split(",")].map(entry => entry.trim()).filter(Boolean);
  const emails = new Set(entries.filter(entry => entry.includes("@")).map(normalEmail));
  const phones = new Set(entries.filter(entry => !entry.includes("@")).map(normalPhone).filter(Boolean));
  const email = normalEmail(contact.email), phone = normalPhone(contact.phone);
  return (Boolean(email) && emails.has(email)) || (Boolean(phone) && phones.has(phone));
}

export const submissionsPerPerson = 3;
// Endpoints whose resubmission replaces the earlier record (one up-to-date RSVP per person). Sign-ups that store one
// record per class (wellness, Tennis & High Tea), nominations and poker enquiries keep every submission.
export const replacingEndpoints = new Set(["rsvp", "closing-dinner", "invitation-rsvp"]);
const replacedReason = "Replaced by an updated submission";

let testStore: SubmissionStore | null = null;
export function setLimitStoreForTests(store: SubmissionStore | null) { testStore = store; cache.clear(); }

// Earlier submissions per form type, read from the staff store and kept for 90 seconds per server instance (reading
// every record on every request would slow guests down). Requests accepted by this instance are added at once.
// A submission counts while it is active or was replaced by a newer one; a record staff removed does not count.
type Seen = { at: number; emails: Map<string, AnyRecord[]>; phones: Map<string, AnyRecord[]> };
const cache = new Map<string, Seen>();
const cacheMs = 90_000;
const counts = (record: AnyRecord) => !record.removedAt || Boolean(record.replacedBy);

async function earlierSubmissions(endpoint: string, scope: Scope): Promise<Seen> {
  const cached = cache.get(endpoint);
  if (cached && Date.now() - cached.at < cacheMs) return cached;
  const store = testStore ?? await getSubmissionStore();
  const seen: Seen = { at: Date.now(), emails: new Map(), phones: new Map() };
  for (const kind of scope.kinds) {
    const records = await store.list(kind as "rsvp") as unknown as AnyRecord[];
    for (const record of records) {
      // Oct 20: a guest staff added by hand may still send their own RSVP (and gets the normal confirmation then).
      if (!counts(record) || record.source === "staff" || (scope.keep && !scope.keep(record))) continue;
      remember(seen, contactOf(scope, record), record);
    }
  }
  cache.set(endpoint, seen);
  return seen;
}
const contactOf = (scope: Scope, record: AnyRecord): Contact => scope.contact ? scope.contact(record) : { email: str(record.email), phone: str(record.phone) };
function remember(seen: Seen, contact: Contact, record: AnyRecord) {
  const email = normalEmail(contact.email), phone = normalPhone(contact.phone);
  if (email) seen.emails.set(email, [...(seen.emails.get(email) ?? []), record]);
  if (phone) seen.phones.set(phone, [...(seen.phones.get(phone) ?? []), record]);
}
/** One entry per submission (an invitation request writes several records with one invitationRequestId). */
function submissionsOf(seen: Seen, contact: Contact): AnyRecord[] {
  const email = normalEmail(contact.email), phone = normalPhone(contact.phone);
  const all = [...(email ? seen.emails.get(email) ?? [] : []), ...(phone ? seen.phones.get(phone) ?? [] : [])];
  const bySubmission = new Map<string, AnyRecord>();
  for (const record of all) bySubmission.set(str(record.invitationRequestId) || str(record.id) || str(record.submittedAt), record);
  return [...bySubmission.values()];
}

const requestIdOf = (body: string) => { try { const parsed = JSON.parse(body) as Record<string, unknown>; return str(parsed.requestId) || str((parsed.requester as Record<string, unknown> | undefined)?.requestId); } catch { return ""; } };
const shortDate = (iso?: string) => { const date = iso ? new Date(iso) : null; return date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString("en-US", { month: "long", day: "numeric", timeZone: "America/Los_Angeles" }) : ""; };

/** Returns the 409 answer for a fourth submission, or null when the request may go ahead. Fails open on any error. */
export async function checkSubmissionLimit(endpoint: string, body: string, contact: Contact): Promise<Response | null> {
  const scope = limitedEndpoints[endpoint];
  if (!scope || isUnlimitedSubmitter(contact)) return null;
  const email = normalEmail(contact.email), phone = normalPhone(contact.phone);
  if (!email && !phone) return null; // the handler refuses it for the missing details
  try {
    const earlier = submissionsOf(await earlierSubmissions(endpoint, scope), contact);
    const requestId = requestIdOf(body);
    if (requestId && earlier.some(record => record.id === requestId || str(record.invitationRequestId) === requestId)) return null; // a retry of the same request
    if (earlier.length < submissionsPerPerson) return null;
    const latest = earlier.map(record => str(record.submittedAt)).sort().at(-1);
    const when = shortDate(latest);
    return Response.json({
      ok: false, code: "already-submitted",
      error: `We already have your ${scope.label}${when ? ` (last updated ${when})` : ""}. To change it again, please email music@inspiringchildren.org.`
    }, { status: 409, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error(`[submission-limit] ${endpoint}: check skipped`, error instanceof Error ? error.message : error);
    return null; // never lose a guest's request because the check itself failed
  }
}

/** Called after a 2xx answer so the next request on the same instance is counted straight away. */
export function rememberAccepted(endpoint: string, body: string, contact: Contact) {
  const seen = cache.get(endpoint);
  if (!seen || !limitedEndpoints[endpoint]) return;
  remember(seen, contact, { id: requestIdOf(body) || `accepted-${Date.now()}`, submittedAt: new Date().toISOString() });
}

/**
 * Owner (Oct 20): a guest's new RSVP replaces their earlier one instead of sitting beside it as a duplicate. After a
 * saved request, every earlier active record from the same form type with the same email or phone (not added by staff)
 * is marked removed with reason "Replaced by an updated submission" and replacedBy = the new record's id; the new records
 * get firstSubmittedAt (the earliest date) and replaces (the earlier ids). Never throws (a failure here is logged and the guest still sees their saved request).
 */
export async function replaceEarlierSubmissions(endpoint: string, startedAt: string, contact: Contact, body = ""): Promise<number> {
  const scope = limitedEndpoints[endpoint];
  if (!scope || !replacingEndpoints.has(endpoint)) return 0;
  const email = normalEmail(contact.email), phone = normalPhone(contact.phone);
  if (!email && !phone) return 0;
  try {
    const store = testStore ?? await getSubmissionStore();
    let replaced = 0;
    const lists = await Promise.all(scope.kinds.map(async kind => ({ kind, records: await store.list(kind as "rsvp") as unknown as AnyRecord[] })));
    const mine = (record: AnyRecord) => {
      if (record.removedAt || record.source === "staff" || (scope.keep && !scope.keep(record))) return false;
      const c = contactOf(scope, record);
      return (Boolean(email) && normalEmail(c.email) === email) || (Boolean(phone) && normalPhone(c.phone) === phone);
    };
    // The new records are found by the request's id (forms send requestId, and the stored record's id or invitationRequestId
    // is that id; its submittedAt is the browser's clock, so a date comparison alone could pick the wrong one). Requests
    // without an id (older cached forms) fall back to "saved since this request arrived".
    const requestId = requestIdOf(body);
    const isFresh = (record: AnyRecord) => requestId ? (record.id === requestId || str(record.invitationRequestId) === requestId) : str(record.submittedAt) >= startedAt;
    const fresh = lists.flatMap(({ kind, records }) => records.filter(record => mine(record) && isFresh(record)).map(record => ({ kind, record })));
    const older = lists.flatMap(({ kind, records }) => records.filter(record => mine(record) && !isFresh(record)).map(record => ({ kind, record })));
    if (!fresh.length || !older.length) return 0;
    const newest = fresh.map(({ record }) => record).sort((a, b) => str(b.submittedAt).localeCompare(str(a.submittedAt)))[0]!;
    const replacedBy = str(newest.invitationRequestId) || str(newest.id);
    const now = new Date().toISOString();
    for (const { kind, record } of older) {
      await store.add(kind as "rsvp", { ...record, removedAt: now, removedReason: `${replacedReason} (${shortDate(now) || now.slice(0, 10)})`, replacedBy } as never);
      replaced++;
    }
    const first = [...older, ...fresh].map(({ record }) => str(record.firstSubmittedAt) || str(record.submittedAt)).sort()[0];
    const replaces = older.flatMap(({ record }) => [str(record.id), ...(Array.isArray(record.replaces) ? record.replaces as string[] : [])]); // the whole chain of earlier versions
    for (const { kind, record } of fresh) await store.add(kind as "rsvp", { ...record, firstSubmittedAt: first, replaces: [...new Set([...(Array.isArray(record.replaces) ? record.replaces as string[] : []), ...replaces])] } as never);
    cache.delete(endpoint);
    return replaced;
  } catch (error) {
    console.error(`[submission-limit] ${endpoint}: could not mark earlier submissions replaced`, error instanceof Error ? error.message : error);
    return 0;
  }
}
