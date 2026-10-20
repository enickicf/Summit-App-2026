import { getSubmissionStore, type SubmissionStore } from "./store";

// Owner (Oct 20, 2026): "No other numbers should be able to submit more than one application or RSVP ... However,
// ambassador@inspiringchildren.org, music@inspiringchildren.org, my phone number ... and Cherrial Odell's phone number
// ... can submit as many submissions as they want."
//
// One submission per form type per person: a request whose email OR phone (last 10 digits) already has an active
// (not removed) record from the same form type is refused with 409 and a message telling the guest we already have
// their request. Nothing is lost: the refused body is still in the submission inbox (received/ and failed/).
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

let testStore: SubmissionStore | null = null;
export function setLimitStoreForTests(store: SubmissionStore | null) { testStore = store; cache.clear(); }

// Earlier submissions per form type, read from the staff store and kept for 90 seconds per server instance (reading
// every record on every request would slow guests down). Requests accepted by this instance are added at once.
type Seen = { at: number; emails: Map<string, AnyRecord>; phones: Map<string, AnyRecord> };
const cache = new Map<string, Seen>();
const cacheMs = 90_000;

async function earlierSubmissions(endpoint: string, scope: Scope): Promise<Seen> {
  const cached = cache.get(endpoint);
  if (cached && Date.now() - cached.at < cacheMs) return cached;
  const store = testStore ?? await getSubmissionStore();
  const seen: Seen = { at: Date.now(), emails: new Map(), phones: new Map() };
  for (const kind of scope.kinds) {
    const records = await store.list(kind as "rsvp") as unknown as AnyRecord[];
    for (const record of records) {
      if (record.removedAt || (scope.keep && !scope.keep(record))) continue;
      remember(seen, scope.contact ? scope.contact(record) : { email: str(record.email), phone: str(record.phone) }, record);
    }
  }
  cache.set(endpoint, seen);
  return seen;
}
function remember(seen: Seen, contact: Contact, record: AnyRecord) {
  const email = normalEmail(contact.email), phone = normalPhone(contact.phone);
  if (email && !seen.emails.has(email)) seen.emails.set(email, record);
  if (phone && !seen.phones.has(phone)) seen.phones.set(phone, record);
}

const requestIdOf = (body: string) => { try { const parsed = JSON.parse(body) as Record<string, unknown>; return str(parsed.requestId) || str((parsed.requester as Record<string, unknown> | undefined)?.requestId); } catch { return ""; } };
const shortDate = (iso?: string) => { const date = iso ? new Date(iso) : null; return date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString("en-US", { month: "long", day: "numeric", timeZone: "America/Los_Angeles" }) : ""; };

/** Returns the 409 answer for a second submission, or null when the request may go ahead. Fails open on any error. */
export async function checkSubmissionLimit(endpoint: string, body: string, contact: Contact): Promise<Response | null> {
  const scope = limitedEndpoints[endpoint];
  if (!scope || isUnlimitedSubmitter(contact)) return null;
  const email = normalEmail(contact.email), phone = normalPhone(contact.phone);
  if (!email && !phone) return null; // the handler refuses it for the missing details
  try {
    const seen = await earlierSubmissions(endpoint, scope);
    const earlier = (email && seen.emails.get(email)) || (phone && seen.phones.get(phone)) || null;
    if (!earlier) return null;
    const requestId = requestIdOf(body);
    if (requestId && (earlier.id === requestId || str(earlier.invitationRequestId) === requestId)) return null; // a retry of the same request
    const when = shortDate(earlier.submittedAt);
    return Response.json({
      ok: false, code: "already-submitted",
      error: `We already have your ${scope.label}${when ? ` from ${when}` : ""}. Each person can send one. To change it, please email music@inspiringchildren.org.`
    }, { status: 409, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error(`[submission-limit] ${endpoint}: check skipped`, error instanceof Error ? error.message : error);
    return null; // never lose a guest's request because the check itself failed
  }
}

/** Called after a 2xx answer so a second request on the same instance is refused straight away. */
export function rememberAccepted(endpoint: string, body: string, contact: Contact) {
  const seen = cache.get(endpoint);
  if (!seen || !limitedEndpoints[endpoint]) return;
  remember(seen, contact, { id: requestIdOf(body), submittedAt: new Date().toISOString() });
}
