import { eventPartners2026 } from "../lib/event-partners-2026";
import styles from "./presented-by.module.css";

// Owner (Oct 5, 2026): the Community Day header's "Presented by" lockup (Inspiring Children Foundation × NAMI)
// sits at the top of every 2026 page: on every copy of the Awards site, on the Summit page, and above the
// Community Day title. Owner (Oct 7 meeting): the two logos are joined by a "×" (the partner block's multiplication
// sign, never a divider line), and in the Summit and Awards heroes the lockup sits directly UNDER the Cohen
// Foundation "Powered by" credit (event logo -> Powered by -> Presented by). The "hero" size is tuned to sit with
// the event logos without crowding them; "title" is the Community Day original. The Cohen credit is unchanged.
export function PresentedBy({ size = "title", tone = "dark", className }: { size?: "title" | "hero"; tone?: "dark" | "light"; className?: string | undefined }) {
  const [icf, nami] = eventPartners2026.presentedBy;
  const logo = tone === "light" ? "light" : "dark";
  return <div className={`${styles.presentedBy} ${size === "hero" ? styles.heroSize : ""} ${tone === "light" ? styles.onLight : ""}${className ? ` ${className}` : ""}`}>
    <span className={styles.label}>Presented by</span>
    <span className={styles.logos}>
      <img className={styles.icf} src={icf.logo[logo]} alt={icf.name} width={icf.logo.width} height={icf.logo.height} />
      <span className={styles.times} aria-hidden="true">×</span>
      <img className={styles.nami} src={nami.logo[logo]} alt={nami.name} width={nami.logo.width} height={nami.logo.height} />
    </span>
  </div>;
}
