import { eventPartners2026 } from "../lib/event-partners-2026";
import styles from "./presented-by.module.css";

// Owner (Oct 16): retain Powered by branding and join ICF + NAMI with a plus sign.
export function PresentedBy({ size = "title", tone = "dark", className }: { size?: "title" | "hero"; tone?: "dark" | "light"; className?: string | undefined }) {
  const [icf, nami] = eventPartners2026.presentedBy;
  const logo = tone === "light" ? "light" : "dark";
  return <div className={`${styles.presentedBy} ${size === "hero" ? styles.heroSize : ""} ${tone === "light" ? styles.onLight : ""}${className ? ` ${className}` : ""}`}>
    <span className={styles.label}>Presented by</span>
    <span className={styles.logos}>
      <img className={styles.icf} src={icf.logo[logo]} alt={icf.name} width={icf.logo.width} height={icf.logo.height} />
      <span className={styles.times} aria-hidden="true">+</span>
      <img className={styles.nami} src={nami.logo[logo]} alt={nami.name} width={nami.logo.width} height={nami.logo.height} />
    </span>
  </div>;
}
