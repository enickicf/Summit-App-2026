import { notFound } from "next/navigation";
import { SiteImage } from "../../../../components/site-image";
import { TicketConfirmationForm } from "../../../../components/ticket-confirmation-form";
import styles from "../../../../components/ticket-confirmation-form.module.css";
import { getSubmissionStore } from "../../../../lib/staff/store";

export const dynamic = "force-dynamic";
export default async function TicketConfirmationPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const store = await getSubmissionStore();
  const offer = (await store.list("ticketOffer")).find(row => row.confirmationToken === token);
  if (!offer || offer.decision === "declined") notFound();
  const existing = (await store.list("ticketConfirmation")).find(row => row.offerId === offer.id);
  return <main className={styles.page}><div className={styles.shell}><div className={styles.brand}><SiteImage src="/images/NotAloneSummit_Logo_White.png" alt="Not Alone Summit" sizes="140px" /></div><TicketConfirmationForm offer={offer} {...(existing ? { existing } : {})} /></div></main>;
}
