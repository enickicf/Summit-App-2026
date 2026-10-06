import { eventPartners2026 } from "../lib/event-partners-2026";
import styles from "./event-partners.module.css";

// Owner (Oct 5, 2026): the Community Day page's partner block is the model for every 2026 page. Cards: the
// Cohen Foundation ("Powered by", full width), the Inspiring Children Foundation x NAMI together in ONE box
// ("Presented by"), and Wynn Las Vegas in its own box ("Host venue"). "light" is the Community Day / Summit
// look; "dark" recolors it for the black Awards page. Replaces the Sept 23 "Founding Partners" block.
export function EventPartners({ tone = "light", heading = "Our Partners", headingLevel = "h2", id = "partners" }: { tone?: "light" | "dark"; heading?: string; headingLevel?: "h2" | "h3"; id?: string }) {
  const Heading = headingLevel;
  const { poweredBy, presentedBy, hostVenue } = eventPartners2026;
  const logo = tone === "dark" ? "dark" : "light";
  const titleId = `${id}-title`;
  return <section className={`${styles.partners} ${tone === "dark" ? styles.dark : ""}`} id={id} aria-labelledby={titleId}>
    <Heading id={titleId} className={styles.heading}>{heading}</Heading>
    <div className={styles.grid}>
      <div className={`${styles.card} ${styles.featured}`}>
        <span className={styles.role}>Powered by</span>
        <span className={`${styles.logo} ${styles.cohen}`}><img src={poweredBy.logo[logo]} alt={poweredBy.name} width={poweredBy.logo.width} height={poweredBy.logo.height} loading="lazy" /></span>
      </div>
      <div className={`${styles.card} ${styles.presented}`}>
        <span className={styles.role}>Presented by</span>
        <div className={styles.pair}>
          <span className={`${styles.logo} ${styles.icf}`}><img src={presentedBy[0].logo[logo]} alt={presentedBy[0].name} width={presentedBy[0].logo.width} height={presentedBy[0].logo.height} loading="lazy" /></span>
          <span className={styles.times} aria-hidden="true">×</span>
          <span className={`${styles.logo} ${styles.nami}`}><img src={presentedBy[1].logo[logo]} alt={presentedBy[1].name} width={presentedBy[1].logo.width} height={presentedBy[1].logo.height} loading="lazy" /></span>
        </div>
      </div>
      <div className={`${styles.card} ${styles.venue}`}>
        <span className={styles.role}>Host venue</span>
        <span className={`${styles.logo} ${styles.wynn}`}><img src={hostVenue.logo[logo]} alt={hostVenue.name} width={hostVenue.logo.width} height={hostVenue.logo.height} loading="lazy" /></span>
      </div>
    </div>
  </section>;
}
