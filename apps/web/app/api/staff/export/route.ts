import { waiverSummary } from "../../../../lib/event-waiver";
import { cookies } from "next/headers";
import { inboxCsvColumns, listFailedSubmissions, listReceivedSubmissions } from "../../../../lib/staff/submission-inbox";
import { textConsentColumns, textConsentCsvColumns, textContactCsvColumns, textContactRows, type TextContact } from "../../../../lib/staff/text-consent";
import { isPodcastStaffSession, isStaffSession, podcastStaffCookieName, staffCookieName } from "../../../../lib/staff/auth";
import { activeOf, activeRsvps, closingDinnerCsvColumns, closingDinnerSeats, getSubmissionStore, listAllRsvps, rsvpExportForms, rsvpsOfForm, type RsvpExportForm, withRsvpForm, nominationCsvColumns, pokerCsvColumns, rsvpCsvColumns, siteVisitCsvColumns, toCsv, wellnessCsvColumns, workshopCsvColumns } from "../../../../lib/staff/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// CSV export for the staff portal (signed-in staff only).
export async function GET(request: Request) {
  const jar = await cookies();
  const kind = new URL(request.url).searchParams.get("kind");
  const fullAccess = isStaffSession(jar.get(staffCookieName)?.value);
  const podcastAccess = isPodcastStaffSession(jar.get(podcastStaffCookieName)?.value);
  if (!fullAccess && !(podcastAccess && kind === "podcast-bookings")) return new Response("Sign in required.", { status: 401, headers: { "Cache-Control": "no-store" } });
  const store = await getSubmissionStore();
  // Oct 12: text message opt-outs and consents override what the forms recorded (lib/staff/text-consent.ts).
  const textPreferences = await store.list("textPreference");
  const stamp = new Date().toISOString().slice(0, 10);
  // Owner (Sept 28): one JSON file with everything (incl. removed requests and the confirmation-email log) for backups.
  if (kind === "all") {
    const [rsvp, nomination, poker, rsvpEmail, workshop, closingDinner, podcastBooking] = await Promise.all([listAllRsvps(store), store.list("nomination"), store.list("poker"), store.list("rsvpEmail"), store.list("workshop"), store.list("closingDinner"), store.list("podcastBooking")]);
    const textPreference = textPreferences;
    // Oct 19: the submission inbox (every request as sent, and every request that was not saved).
    const [submissionInboxFailed, submissionInboxReceived] = await Promise.all([listFailedSubmissions().catch(() => null), listReceivedSubmissions().catch(() => null)]);
    const body = JSON.stringify({ exportedAt: new Date().toISOString(), site: "notalonesummit.org/staff", rsvp, nomination, poker, rsvpEmail, workshop, textPreference, closingDinner, podcastBooking, submissionInboxFailed, submissionInboxReceived }, null, 2);
    return new Response(body, { headers: { "Content-Type": "application/json; charset=utf-8", "Content-Disposition": `attachment; filename="not-alone-staff-portal-backup-${stamp}.json"`, "Cache-Control": "no-store" } });
  }
  // Oct 19: submission inbox spreadsheets: kind=inbox = requests that were NOT saved; kind=inbox-all = every request received.
  if (kind === "inbox" || kind === "inbox-all") {
    const rows = kind === "inbox" ? await listFailedSubmissions() : await listReceivedSubmissions();
    return new Response(toCsv(rows, inboxCsvColumns), { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="not-alone-${kind === "inbox" ? "submissions-not-saved" : "every-submission-received"}-${stamp}.csv"`, "Cache-Control": "no-store" } });
  }
  // Oct 12 (owner): everyone we hold a phone number for, one row per number, with text message consent / opt-out.
  if (kind === "texts") {
    const [rsvp, workshop, closingDinner, nomination] = await Promise.all([listAllRsvps(store), store.list("workshop"), store.list("closingDinner"), store.list("nomination")]);
    const contacts: TextContact[] = [
      ...nomination.filter(row => row.nominatorPhone).map(row => ({ name: row.nominatorName, email: row.nominatorEmail, phone: row.nominatorPhone, submittedAt: row.submittedAt, textConsent: row.textConsent, source: "Award nomination" })),
      ...activeOf(closingDinner).map(row => ({ name: row.name, email: row.email, phone: row.phone, submittedAt: row.submittedAt, textConsent: row.textConsent, groupEventTextConsent:row.groupEventTextConsent, source: "Closing Dinner request" })),
      ...activeRsvps(rsvp).flatMap(row => (row.guests ?? []).map(g => ({...g,submittedAt:row.submittedAt,groupEventTextConsent:row.groupEventTextConsent,source:"RSVP guest"}))),
      ...activeOf(closingDinner).filter(row=>row.bringingGuest).map(row=>({name:row.guestName,email:row.guestEmail,phone:row.guestPhone,submittedAt:row.submittedAt,groupEventTextConsent:row.groupEventTextConsent,source:"Closing dinner guest"})),
      ...activeRsvps(rsvp).map(row => ({ name: row.name, email: row.email, phone: row.phone, submittedAt: row.submittedAt, textConsent: row.textConsent, groupEventTextConsent:row.groupEventTextConsent, source: "Awards / Community Day RSVP" })),
      ...workshop.filter(row => row.phone).map(row => ({ name: row.name, email: row.email ?? "", phone: row.phone ?? "", submittedAt: row.submittedAt, textConsent: row.textConsent, source: row.category === "wellness" ? "Wellness classes" : "Tennis & High Tea" }))
    ];
    const csv = toCsv(textContactRows(contacts, textPreferences), textContactCsvColumns);
    return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="not-alone-text-message-consent-${stamp}.csv"`, "Cache-Control": "no-store" } });
  }
  // Oct 13 (owner / Ryan): the Nov 4 closing night dinner requests, one row per request with the guest's guest.
  if (kind === "closing-dinner") {
    const rows = (await store.list("closingDinner")).map(row => ({ ...row, seats: closingDinnerSeats(row), waiverStatus:waiverSummary(row.eventWaiver), guestWaiverStatus:row.bringingGuest?waiverSummary(row.guestEventWaiver):"", waiverRecord:JSON.stringify(row.eventWaiver??null), guestWaiverRecord:JSON.stringify(row.guestEventWaiver??null), ...textConsentColumns(row, textPreferences) }));
    return new Response(toCsv(rows, closingDinnerCsvColumns), { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="not-alone-closing-dinner-requests-${stamp}.csv"`, "Cache-Control": "no-store" } });
  }
  if (kind === "podcast-bookings") {
    const rows = await store.list("podcastBooking");
    return new Response(toCsv(rows, ["submittedAt", "podcast", "guestName", "email", "format", "startUtc", "endUtc", "room", "travelVerified", "arrivalLocal", "source", "id"]), { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="not-alone-podcast-bookings-${stamp}.csv"`, "Cache-Control": "no-store" } });
  }
  if (kind === "nominations") {
    const csv = toCsv((await store.list("nomination")).map(row => ({ ...row, ...textConsentColumns({ phone: row.nominatorPhone, email: row.nominatorEmail, submittedAt: row.submittedAt, textConsent: row.textConsent }, textPreferences) })), [...nominationCsvColumns, ...textConsentCsvColumns]);
    return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="not-alone-awards-nominations-${stamp}.csv"`, "Cache-Control": "no-store" } });
  }
  if (kind === "site-visit") {
    // Oct 7: with the signed waiver columns (waiverAccepted, signature, waiverVersion).
    const csv = toCsv((await store.list("workshop")).filter(row => row.category === "siteVisit").map(row => ({ ...row, ...textConsentColumns(row, textPreferences) })), [...siteVisitCsvColumns, ...textConsentCsvColumns]);
    return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="not-alone-summit-tennis-high-tea-signups-${stamp}.csv"`, "Cache-Control": "no-store" } });
  }
  // Oct 12: the morning wellness classes (notalonesummit.org/wellness), with contact details and the signed waiver.
  if (kind === "wellness") {
    const csv = toCsv((await store.list("workshop")).filter(row => row.category === "wellness").map(row => ({ ...row, ...textConsentColumns(row, textPreferences) })), [...wellnessCsvColumns, ...textConsentCsvColumns]);
    return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="not-alone-summit-wellness-signups-${stamp}.csv"`, "Cache-Control": "no-store" } });
  }
  if (kind === "workshops") {
    const csv = toCsv((await store.list("workshop")).filter(row => row.category !== "siteVisit" && row.category !== "wellness"), workshopCsvColumns);
    return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="not-alone-summit-workshop-signups-${stamp}.csv"`, "Cache-Control": "no-store" } });
  }
  if (kind === "poker") {
    const csv = toCsv(await store.list("poker"), pokerCsvColumns);
    return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="all-in-poker-seat-requests-${stamp}.csv"`, "Cache-Control": "no-store" } });
  }
  // Owner (Oct 3): one seating spreadsheet per form (VIP / Lake Las Vegas / NAMI / Standard), active requests only.
  const form = new URL(request.url).searchParams.get("form");
  if (form && form in rsvpExportForms) {
    const rows = rsvpsOfForm(activeRsvps(await listAllRsvps(store)), form as RsvpExportForm);
    return new Response(toCsv(withRsvpForm(rows, textPreferences), rsvpCsvColumns), { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="not-alone-rsvps-${form}-${stamp}.csv"`, "Cache-Control": "no-store" } });
  }
  const csv = toCsv(withRsvpForm(await listAllRsvps(store), textPreferences), rsvpCsvColumns);
  return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="not-alone-awards-tickets-${stamp}.csv"`, "Cache-Control": "no-store" } });
}
