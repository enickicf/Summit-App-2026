import { SiteImage } from "./site-image";
import styles from "./site-shell.module.css";

export function BrandMark({ awards = false, light = false }: { awards?: boolean; light?: boolean }) {
  return <span className={`${styles.brandMark} ${awards ? styles.awardsMark : styles.summitMark}`}>
    <SiteImage src={awards ? "/images/NotAloneAwards_Logo_White.png" : light ? "/images/NotAloneSummit_Logo_White.png" : "/images/NotAloneSummit_Logo_Black.png"} alt={awards ? "Not Alone Awards" : "Not Alone Summit"} sizes="156px" loading="eager" />
  </span>;
}
