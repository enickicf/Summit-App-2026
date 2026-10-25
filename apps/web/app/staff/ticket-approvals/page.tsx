import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { TicketApprovalWorkbench } from "../../../components/ticket-approval-workbench";
import { isStaffSession, staffCookieName } from "../../../lib/staff/auth";
import { getSubmissionStore, listAllRsvps } from "../../../lib/staff/store";
import { ticketApprovalCandidates } from "../../../lib/staff/ticket-approval";
import styles from "../staff.module.css";

export const dynamic = "force-dynamic";

export default async function TicketApprovalsPage() {
  const jar = await cookies();
  if (!isStaffSession(jar.get(staffCookieName)?.value)) redirect("/staff/login");
  const store = await getSubmissionStore();
  const [rsvps, offers, confirmations] = await Promise.all([listAllRsvps(store), store.list("ticketOffer"), store.list("ticketConfirmation")]);
  return <main className={styles.page}><TicketApprovalWorkbench candidates={ticketApprovalCandidates(rsvps)} initialOffers={offers} confirmations={confirmations}/></main>;
}
