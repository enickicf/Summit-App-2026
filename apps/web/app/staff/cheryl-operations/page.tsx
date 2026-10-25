import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CherylOperations } from "../../../components/cheryl-operations";
import { isStaffSession, staffCookieName } from "../../../lib/staff/auth";
import { programApprovalCandidates } from "../../../lib/staff/cheryl-operations";
import { getSubmissionStore, listAllRsvps } from "../../../lib/staff/store";
import { ticketApprovalCandidates } from "../../../lib/staff/ticket-approval";
import styles from "../staff.module.css";

export const dynamic = "force-dynamic";

export default async function CherylOperationsPage() {
  const jar = await cookies();
  if (!isStaffSession(jar.get(staffCookieName)?.value)) redirect("/staff/login");
  const store = await getSubmissionStore();
  const [rsvps, closingDinner, workshops, poker, offers, confirmations, programApprovals] = await Promise.all([
    listAllRsvps(store), store.list("closingDinner"), store.list("workshop"), store.list("poker"),
    store.list("ticketOffer"), store.list("ticketConfirmation"), store.list("programApproval"),
  ]);
  return <main className={`${styles.page} ${styles.opsPage}`}><CherylOperations
    ticketCandidates={ticketApprovalCandidates(rsvps)}
    programCandidates={programApprovalCandidates({ closingDinner, workshops, poker })}
    initialOffers={offers}
    confirmations={confirmations}
    initialProgramApprovals={programApprovals}
  /></main>;
}
