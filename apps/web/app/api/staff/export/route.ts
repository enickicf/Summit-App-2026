import { cookies } from "next/headers";
import { isStaffSession, staffCookieName } from "../../../../lib/staff/auth";
import { activeRsvps, getSubmissionStore, listAllRsvps, rsvpExportForms, rsvpsOfForm, type RsvpExportForm, withRsvpForm, nominationCsvColumns, pokerCsvColumns, rsvpCsvColumns, siteVisitCsvColumns, toCsv, wellnessCsvColumns, workshopCsvColumns } from "../../../../lib/staff/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// CSV export for the staff portal (signed-in staff only).
export async function GET(request: Request) {
  const jar = await cookies();
  if (!isStaffSession(jar.get(staffCookieName)?.value)) return new Response("Sign in required.", { status: 401, headers: { "Cache-Control": "no-store" } });
  const kind = new URL(request.url).searchParams.get("kind");
  const store = await getSubmissionStore();
  const stamp = new Date().toISOString().slice(0, 10);
  // Owner (Sept 28): one JSON file with everything (incl. removed requests and the confirmation-email log) for backups.
  if (kind === "all") {
    const [rsvp, nomination, poker, rsvpEmail, workshop] = await Promise.all([listAllRsvps(store), store.list("nomination"), store.list("poker"), store.list("rsvpEmail"), store.list("workshop")]);
    const body = JSON.stringify({ exportedAt: new Date().toISOString(), site: "notalonesummit.org/staff", rsvp, nomination, poker, rsvpEmail, workshop }, null, 2);
    return new Response(body, { headers: { "Content-Type": "application/json; charset=utf-8", "Content-Disposition": `attachment; filename="not-alone-staff-portal-backup-${stamp}.json"`, "Cache-Control": "no-store" } });
  }
  if (kind === "nominations") {
    const csv = toCsv(await store.list("nomination"), nominationCsvColumns);
    return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="not-alone-awards-nominations-${stamp}.csv"`, "Cache-Control": "no-store" } });
  }
  if (kind === "site-visit") {
    // Oct 7: with the signed waiver columns (waiverAccepted, signature, waiverVersion).
    const csv = toCsv((await store.list("workshop")).filter(row => row.category === "siteVisit"), siteVisitCsvColumns);
    return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="not-alone-summit-tennis-high-tea-signups-${stamp}.csv"`, "Cache-Control": "no-store" } });
  }
  // Oct 12: the morning wellness classes (notalonesummit.org/wellness), with contact details and the signed waiver.
  if (kind === "wellness") {
    const csv = toCsv((await store.list("workshop")).filter(row => row.category === "wellness"), wellnessCsvColumns);
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
    return new Response(toCsv(withRsvpForm(rows), rsvpCsvColumns), { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="not-alone-rsvps-${form}-${stamp}.csv"`, "Cache-Control": "no-store" } });
  }
  const csv = toCsv(withRsvpForm(await listAllRsvps(store)), rsvpCsvColumns);
  return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="not-alone-awards-tickets-${stamp}.csv"`, "Cache-Control": "no-store" } });
}
