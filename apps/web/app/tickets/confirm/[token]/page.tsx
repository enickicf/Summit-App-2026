import { notFound } from "next/navigation";
import { SiteImage } from "../../../../components/site-image";
import { TicketConfirmationForm } from "../../../../components/ticket-confirmation-form";
import styles from "../../../../components/ticket-confirmation-form.module.css";
import { getSubmissionStore } from "../../../../lib/staff/store";

export const dynamic = "force-dynamic";
export const metadata = { title: "Confirm your tickets · Not Alone", robots: { index: false, follow: false } };

export default async function TicketConfirmationPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const store = await getSubmissionStore();
  const offer = (await store.list("ticketOffer")).find(row => row.confirmationToken === token);
  if (!offer || offer.decision !== "approved") notFound();
  const existing = (await store.list("ticketConfirmation")).find(row => row.offerId === offer.id);
  return <main className={styles.page} id="main-content">
    <div className={styles.shell}>
      <header className={styles.masthead}>
        <SiteImage className={styles.summitLogo} src="/images/NotAloneSummit_Logo_White.png" alt="Not Alone Summit" sizes="170px" />
        <div className={styles.presenters}><span>Presented by</span><div>
          <SiteImage src="/images/icf-logo-white.png" alt="Inspiring Children Foundation" sizes="90px" />
          <b aria-hidden="true">+</b>
          <SiteImage src="/2026-partners/nami-white.png" alt="NAMI — National Alliance on Mental Illness" sizes="150px" />
        </div></div>
      </header>
      <TicketConfirmationForm offer={offer} {...(existing ? { existing } : {})} />
      <footer className={styles.footer}>Questions? Call or text <a href="tel:+17028634140">702-863-4140</a> or email <a href="mailto:ambassador@inspiringchildren.org">ambassador@inspiringchildren.org</a>.</footer>
    </div>
  </main>;
}
