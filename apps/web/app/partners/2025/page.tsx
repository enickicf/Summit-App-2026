import { ArrowUpRight } from "lucide-react";
import { SiteImage } from "../../../components/site-image";
import { partnerWithUsUrl, summitPartnerTiers, type SummitPartner } from "../../../lib/summit-partners";
import styles from "../partners.module.css";

// The 2025 partners page, kept exactly as it was (owner, Sept 21, 2026).
export const metadata = { title: "2025 Summit Partners" };

function PartnerCard({ partner, featured }: { partner: SummitPartner; featured: boolean }) {
  const image = <SiteImage src={partner.logo} alt={partner.name} sizes={featured ? "(max-width: 600px) 90vw, 420px" : "(max-width: 600px) 44vw, (max-width: 900px) 30vw, 260px"} />;
  return partner.website
    ? <a className={styles.card} href={partner.website} target="_blank" rel="noreferrer" aria-label={`${partner.name} (opens in a new tab)`}>{image}</a>
    : <div className={styles.card}>{image}</div>;
}

export default function PartnersPage() {
  const featured = summitPartnerTiers.filter(tier => tier.featured);
  const grids = summitPartnerTiers.filter(tier => !tier.featured);
  return <main id="main-content" tabIndex={-1} className={styles.page}>
    <header className={styles.hero}>
      <p>Not Alone Summit</p>
      <h1>Founding Sponsors</h1>
      <span aria-hidden="true" />
      <p className={styles.lead}>The partners who make the Not Alone Summit possible.</p>
    </header>
    <div className={styles.body}>
      <div className={styles.featured}>
        {featured.map(tier => <section key={tier.title} className={styles.tier} aria-labelledby={`tier-${tier.title}`}>
          <h2 id={`tier-${tier.title}`}>{tier.title}</h2>
          {tier.partners.map(partner => <PartnerCard key={partner.name} partner={partner} featured />)}
        </section>)}
      </div>
      {grids.map(tier => <section key={tier.title} className={styles.tier} aria-labelledby={`tier-${tier.title}`}>
        <h2 id={`tier-${tier.title}`}>{tier.title}</h2>
        <div className={styles.grid}>{tier.partners.map(partner => <PartnerCard key={partner.name} partner={partner} featured={false} />)}</div>
      </section>)}
      <section className={styles.cta} aria-labelledby="partner-cta">
        <h2 id="partner-cta">Interested in Becoming Our Partner?</h2>
        <p>Sponsors receive premium brand exposure and alignment with a world-class wellness movement. Sponsors also enjoy VIP access, star treatment, and exclusive experiences with celebrity talent and thought leaders.</p>
        <a className={styles.ctaButton} href={partnerWithUsUrl}>Partner with us <ArrowUpRight size={18} aria-hidden="true" /></a>
      </section>
    </div>
  </main>;
}
