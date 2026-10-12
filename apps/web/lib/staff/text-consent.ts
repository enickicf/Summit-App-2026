// Owner (Oct 12, 2026): every RSVP and sign-up form asks for permission to send text updates about the event, tickets and
// Inspiring Children Foundation news (an optional checkbox, unticked by default). Going forward a ticked box is the
// consent. For now a phone number given on a form also counts as consent to text that guest about the event and their
// ticket only, with an opt-out (reply STOP); news and other ICF updates need the ticked box.
// Only the person who filled in the form gives consent; the extra guests listed in a party do not.
export const textConsentProtocolDate = "2026-10-12";
export const textConsentProtocolNote = `Text message consent protocol in effect from ${textConsentProtocolDate}`;
export const textConsentWording = "Yes, text me updates about the event and my tickets, plus news from the Inspiring Children Foundation. Message frequency varies. Msg & data rates may apply. Reply STOP to opt out, HELP for help. Consent is not required to RSVP.";

// Every text we send ends with this line, and a STOP reply is recorded as an opt-out (lib/staff/store.ts textPreference).
export const textOptOutFooter = "Reply STOP to opt out.";

export type TextConsentStatus = "optedOut" | "checkbox" | "phone" | "none";
export const textConsentLabels: Record<TextConsentStatus, string> = {
  optedOut: "OPTED OUT: do not text",
  checkbox: "Yes: gave consent (event, tickets and ICF news)",
  phone: "Ticket and event texts only (phone given, no consent box yet; opt out any time)",
  none: "No (no phone number)"
};
export const textConsentShortLabels: Record<TextConsentStatus, string> = { optedOut: "Opted out", checkbox: "Yes", phone: "Tickets only", none: "No" };

export type TextPreference = { phone: string; email?: string; choice: "yes" | "no"; submittedAt: string };
const phoneKey = (phone: string | undefined) => (phone ?? "").replace(/\D/g, "").slice(-10);
/** The guest's latest choice on the text-updates page (or recorded by staff), matched by phone number or email. */
export function latestTextPreference(record: { phone?: string | undefined; email?: string | undefined }, preferences: readonly TextPreference[]): TextPreference | null {
  const phone = phoneKey(record.phone), email = (record.email ?? "").trim().toLowerCase();
  const mine = preferences.filter(pref => (phone.length >= 7 && phoneKey(pref.phone) === phone) || (email && (pref.email ?? "").trim().toLowerCase() === email));
  return mine.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))[0] ?? null;
}

type Consentable = { phone?: string | undefined; email?: string | undefined; textConsent?: boolean | undefined; submittedAt: string };
export function textConsentStatus(record: Consentable, preferences: readonly TextPreference[] = []): TextConsentStatus {
  const preference = latestTextPreference(record, preferences);
  if (preference?.choice === "no") return "optedOut";
  const phone = phoneKey(record.phone);
  if (phone.length < 7 && !preference) return "none";
  if (preference?.choice === "yes" || record.textConsent === true) return "checkbox";
  return "phone";
}
/** The spreadsheet columns: consent (or opt-out), the date of that choice and the protocol note. */
export function textConsentColumns(record: Consentable, preferences: readonly TextPreference[] = []) {
  const status = textConsentStatus(record, preferences);
  const preference = latestTextPreference(record, preferences);
  const date = preference && (status === "optedOut" || status === "checkbox") ? preference.submittedAt : record.submittedAt;
  return {
    textMessageConsent: textConsentLabels[status],
    textConsentDate: status === "none" ? "" : date.slice(0, 10),
    textConsentProtocol: textConsentProtocolNote
  };
}
export const textConsentCsvColumns = ["textMessageConsent", "textConsentDate", "textConsentProtocol"];

// Oct 12 (owner): one spreadsheet of everyone we hold a phone number for (the person who filled in each RSVP, Tennis & High
// Tea or Wellness form, plus anyone who used the text-updates page), one row per phone number, with their consent status.
// This is the list to send texts from: never text an "OPTED OUT" row; send news only to "Yes" rows.
export type TextContact = { name: string; email: string; phone: string; submittedAt: string; textConsent?: boolean | undefined; source: string };
export function textContactRows(contacts: readonly TextContact[], preferences: readonly (TextPreference & { name?: string })[]) {
  const byPhone = new Map<string, { name: string; email: string; phone: string; sources: Set<string>; firstAt: string; consentAt: string | null }>();
  const add = (contact: { name: string; email: string; phone: string; submittedAt: string; consent: boolean; source: string }) => {
    const key = phoneKey(contact.phone);
    if (key.length < 7) return;
    const row = byPhone.get(key) ?? { name: contact.name, email: contact.email, phone: contact.phone, sources: new Set<string>(), firstAt: contact.submittedAt, consentAt: null };
    row.sources.add(contact.source);
    if (contact.submittedAt < row.firstAt) row.firstAt = contact.submittedAt;
    if (!row.email && contact.email) row.email = contact.email;
    if (!row.name && contact.name) row.name = contact.name;
    if (contact.consent && (!row.consentAt || contact.submittedAt < row.consentAt)) row.consentAt = contact.submittedAt;
    byPhone.set(key, row);
  };
  for (const contact of contacts) add({ ...contact, consent: contact.textConsent === true });
  for (const pref of preferences) add({ name: pref.name ?? "", email: pref.email ?? "", phone: pref.phone, submittedAt: pref.submittedAt, consent: false, source: "Text updates page / staff" });
  return [...byPhone.values()].map(row => {
    const columns = textConsentColumns({ phone: row.phone, email: row.email, submittedAt: row.consentAt ?? row.firstAt, textConsent: Boolean(row.consentAt) }, preferences);
    return { name: row.name, email: row.email, phone: row.phone, sources: [...row.sources].join("; "), status: textConsentStatus({ phone: row.phone, email: row.email, submittedAt: row.firstAt, textConsent: Boolean(row.consentAt) }, preferences), ...columns };
  }).sort((a, b) => a.name.localeCompare(b.name));
}
export const textContactCsvColumns = ["name", "email", "phone", "sources", ...textConsentCsvColumns];
