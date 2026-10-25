import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SubmissionReviewPortal } from "../../../components/submission-review-portal";
import { isStaffSession, staffCookieName } from "../../../lib/staff/auth";
import { listFailedSubmissions, unresolvedFailures } from "../../../lib/staff/submission-inbox";
import { getSubmissionStore, listAllRsvps } from "../../../lib/staff/store";

export const dynamic = "force-dynamic";

export default async function SubmissionReviewPage() {
  const jar = await cookies();
  if (!isStaffSession(jar.get(staffCookieName)?.value)) redirect("/staff/login");

  const store = await getSubmissionStore();
  const [rsvps, closingDinner, workshops, nominations, failed] = await Promise.all([
    listAllRsvps(store),
    store.list("closingDinner"),
    store.list("workshop"),
    store.list("nomination"),
    listFailedSubmissions().catch(error => { console.error("[staff/submissions] submission inbox unavailable", error instanceof Error ? error.message : error); return null; })
  ]);

  // Include every named guest as well as the person who submitted the form. A later guest registration
  // therefore clears its earlier failed attempt from this review queue.
  const saved = [
    ...rsvps,
    ...rsvps.flatMap(row => (row.guests ?? []).map(guest => ({ ...guest, submittedAt: row.submittedAt }))),
    ...closingDinner,
    ...closingDinner.filter(row => row.bringingGuest).map(row => ({ email: row.guestEmail, phone: row.guestPhone, submittedAt: row.submittedAt })),
    ...workshops.map(row => ({ ...row, email: row.email ?? "", phone: row.phone ?? "" })),
    ...nominations.map(row => ({ email: row.nominatorEmail, phone: row.nominatorPhone, submittedAt: row.submittedAt }))
  ];
  const unresolved = failed ? unresolvedFailures(failed, saved) : null;
  const needsAttention = unresolved ? unresolved.filter(entry => entry.name || entry.email || entry.phone) : null;
  const anonymousFailures = unresolved ? unresolved.length - (needsAttention?.length ?? 0) : 0;

  return <SubmissionReviewPortal needsAttention={needsAttention} anonymousFailures={anonymousFailures} generatedAt={new Date().toISOString()} />;
}
