import { eventPartners2026 } from "../lib/event-partners-2026";
import styles from "./presented-by.module.css";

// Owner (Oct 5, 2026): the Community Day header's "Presented by" lockup (Inspiring Children Foundation | NAMI)
// sits at the top of every 2026 page: above the Awards logo on every copy of the Awards site, above the Summit
// logo, and above the Community Day title. The "hero" size is tuned to sit over the event logos without
// crowding them; "title" is the Community Day original. The Cohen Foundation credit is separate and unchanged.
export function PresentedBy({ size = "title", tone = "dark", className }: { size?: "title" | "hero"; tone?: "dark" | "light"; className?: string | undefined }) {
  const [icf, nami] = eventPartners2026.presentedBy;
  const logo = tone === "light" ? "light" : "dark";
  return <div className={`${styles.presentedBy} ${size === "hero" ? styles.heroSize : ""} ${tone === "light" ? styles.onLight : ""}${className ? ` ${className}` : ""}`}>
    <span className={styles.label}>Presented by</span>
    <span className={styles.logos}>
      <img className={styles.icf} src={icf.logo[logo]} alt={icf.name} width={icf.logo.width} height={icf.logo.height} />
      <span className={styles.divider} aria-hidden="true" />
      <img className={styles.nami} src={nami.logo[logo]} alt={nami.name} width={nami.logo.width} height={nami.logo.height} />
    </span>
  </div>;
}
