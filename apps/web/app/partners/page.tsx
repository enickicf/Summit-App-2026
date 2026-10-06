import { ArrowUpRight } from "lucide-react";
import { isFounder } from "../../lib/people-sections";
import { SiteImage } from "../../components/site-image";
import Link from "next/link";
import { partnerWithUsUrl, summitPartnerTiers, type SummitPartner } from "../../lib/summit-partners";
import { getPublicSnapshotState } from "../../lib/snapshot";
import { airtableOverlay } from "../../lib/airtable-shared";
import { partnerLogo2026 } from "../../lib/partner-logos-2026";
import { awardsDisplayPeople, philanthropistDisplayPeople } from "../../lib/awards-people";
import { personInitials } from "../../lib/person-portraits";
import styles from "./partners.module.css";

export const metadata = { title: "2026 Summit Partners" };
export const dynamic = "force-dynamic";

// 2026: the Presenting and Premier sponsors, then the partners listed in Airtable's "Simplified
// Partners" sheet (grouped by its Select value), updated automatically. 2025 lives at /partners/2025.
// Only partners whose Airtable Status is Confirmed are listed (pending, declined and cancelled are not).
const confirmed = /^\s*confirmed/i;

function PartnerCard({ partner, featured }: { partner: SummitPartner; featured: boolean }) {
  const image = <SiteImage src={partner.logo} alt={partner.name} sizes={featured ? "(max-width: 600px) 90vw, 420px" : "(max-width: 600px) 44vw, (max-width: 900px) 30vw, 260px"} />;
  return partner.website
    ? <a className={styles.card} href={partner.website} target="_blank" rel="noreferrer" aria-label={`${partner.name} (opens in a new tab)`}>{image}</a>
    : <div className={styles.card}>{image}</div>;
}

export default async function PartnersPage() {
  const { snapshot } = await getPublicSnapshotState();
  const featured = summitPartnerTiers.filter(tier => tier.featured);
  const all = (airtableOverlay(snapshot)?.partners ?? []).filter(partner => confirmed.test(partner.status));
  // Sept 22 meeting: Founding Partners first (the Cohen Foundation and NAMI; never Wynn), then Wynn and
  // Fanatics, then the brands in their Airtable groups with Vendors before the Gifting Suite.
  // Oct 3: Airtable renamed Fanatics to "Fanatics Foundation"; either name takes the Sponsor spot.
  const isNami = (name: string) => name.trim().toLowerCase() === "nami";
  const isFanatics = (name: string) => ["fanatics", "fanatics foundation"].includes(name.trim().toLowerCase());
  const topAirtable = [all.find(partner => isNami(partner.name)), all.find(partner => isFanatics(partner.name))].filter((p): p is NonNullable<typeof p> => Boolean(p));
  const partners = all.filter(partner => !topAirtable.includes(partner));
  // Airtable's "Partner" (singular) joins the Partners group; "Curriculum Partner" follows it.
  const groupOf = (partner: { group: string }) => !partner.group || partner.group === "Partner" ? "Partners" : partner.group;
  const groupOrder = ["Sponsors", "Partners", "Curriculum Partner", "Vendors", "Gifting Suite"];
  const groups = [...new Set(partners.map(groupOf))]
    .sort((a, b) => (groupOrder.indexOf(a) + 1 || 99) - (groupOrder.indexOf(b) + 1 || 99))
    .map(title => ({
      title: title === "Gifting Suite" ? "Gifting Suite Partners" : title,
      partners: partners.filter(partner => groupOf(partner) === title)
    }));
  // Sept 22 meeting: confirmed people grouped "Philanthropist" in Airtable, listed on this page.
  // Owner / Ryan (Sept 29): every founder is listed here as well, founders first, then the other philanthropists.
  // Owner (Oct 5): couples are one card here ("Sean and Ana Wolfington", "Steve and Janet Wozniak"), as in Founders.
  const everyone = philanthropistDisplayPeople(awardsDisplayPeople(snapshot));
  const founders = everyone.filter(isFounder);
  const philanthropists = [...founders, ...everyone.filter(person => person.categories.includes("Philanthropists") && !founders.includes(person))].filter((person, index, list) => list.findIndex(other => other.slug === person.slug) === index);
  const nami = topAirtable.find(partner => isNami(partner.name));
  const fanatics = topAirtable.find(partner => isFanatics(partner.name));
  const logoCard = (partner: { recordId: string; name: string }, logo = partnerLogo2026(partner.name)!) => <div className={`${styles.card} ${styles.logoCard} ${styles.topCard}`}><SiteImage src={logo} alt={partner.name} sizes="(max-width: 600px) 90vw, 420px" /></div>;
  return <main id="main-content" tabIndex={-1} className={styles.page}>
    <header className={styles.hero}>
      <p>Not Alone Summit 2026</p>
      <h1>Partners</h1>
      <span aria-hidden="true" />
      <p className={styles.lead}>The partners who make the Not Alone Summit possible.</p>
    </header>
    <div className={styles.body}>
      {/* Owner (Oct 5): no "Founding Partners" / "community partner" wording anywhere: the Cohen Foundation is
          "Powered by" and the Inspiring Children Foundation x NAMI are "Presented by". */}
      <section className={styles.tier} id="founding-partners" aria-labelledby="tier-founding">
        <h2 id="tier-founding">Powered by</h2>
        <div className={styles.featured}>
          <PartnerCard partner={featured[0]!.partners[0]!} featured />
        </div>
      </section>
      <section className={styles.tier} id="presented-by" aria-labelledby="tier-presented">
        <h2 id="tier-presented">Presented by</h2>
        <div className={styles.featured}>
          {logoCard({ recordId: "icf", name: "Inspiring Children Foundation" }, "/images/icf-logo.webp")}
          {nami && logoCard(nami)}
        </div>
      </section>
      <div className={styles.featured}>
        {[
          { title: featured[1]!.title, card: <PartnerCard partner={featured[1]!.partners[0]!} featured /> },
          ...(fanatics ? [{ title: "Sponsor", card: logoCard(fanatics) }] : [])
        ].map(tier => <section key={tier.title} className={styles.tier} aria-labelledby={`tier-${tier.title}`}>
          <h2 id={`tier-${tier.title}`}>{tier.title}</h2>
          {tier.card}
        </section>)}
      </div>
      <div id="brands" tabIndex={-1} className={styles.brands}>
      {groups.map(group => <section key={group.title} className={styles.tier} aria-labelledby={`tier-${group.title}`}>
        <h2 id={`tier-${group.title}`}>{group.title}</h2>
        <div className={styles.grid}>{group.partners.map(partner => {
          const logo = partnerLogo2026(partner.name);
          return logo
            ? <div key={partner.recordId} className={`${styles.card} ${styles.logoCard}`}><SiteImage src={logo} alt={partner.name} sizes="(max-width: 600px) 40vw, 220px" /></div>
            : <div key={partner.recordId} className={`${styles.card} ${styles.nameCard}`}><span>{partner.name}</span></div>;
        })}</div>
      </section>)}
      </div>
      {!groups.length && <p className={styles.archiveLink}>More 2026 partners will be announced.</p>}
      <section className={styles.tier} id="philanthropists" tabIndex={-1} aria-labelledby="tier-philanthropists">
        <h2 id="tier-philanthropists">Philanthropists</h2>
        {philanthropists.length
          ? <div className={styles.people}>{philanthropists.map(person => <Link key={person.slug} href={`/directory/${person.slug}`} className={styles.person}>
              <span className={styles.personPortrait} aria-hidden="true">{person.image ? <SiteImage src={person.image} alt="" sizes="(max-width: 600px) 44vw, 200px" /> : <span>{personInitials(person.name)}</span>}</span>
              <span className={styles.personName}>{person.name}</span>
              {person.role && <span className={styles.personRole}>{person.role}</span>}
            </Link>)}</div>
          : <p className={styles.archiveLink}>Philanthropists will be announced.</p>}
      </section>
      <p className={styles.archiveLink}><Link href="/partners/2025">View the 2025 Summit partners</Link></p>
      <section className={styles.cta} aria-labelledby="partner-cta">
        <h2 id="partner-cta">Interested in Becoming Our Partner?</h2>
        <p>Sponsors receive premium brand exposure and alignment with a world-class wellness movement. Sponsors also enjoy VIP access, star treatment, and exclusive experiences with celebrity talent and thought leaders.</p>
        <a className={styles.ctaButton} href={partnerWithUsUrl}>Partner with us <ArrowUpRight size={18} aria-hidden="true" /></a>
      </section>
    </div>
  </main>;
}
