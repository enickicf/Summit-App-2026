import Link from "next/link";
import { Heart } from "lucide-react";
import styles from "./summit-refresh.module.css";

// Owner (Sept 23): Summit menu = "Summit" (list: 2026 / 2025), Schedule, "Directory" (list: Who's Coming /
// Partners / Philanthropists), Venue, Awards, and a Donate sticker on the far right in ICF's own style
// (blue pill with the heart, as on inspiringchildren.org). Ask AI left the menu for the floating widget.
export function SummitNavigation({ year, pathname }: { year: 2025 | 2026; pathname: string }) {
  const home = year === 2025 ? "/2025" : "/";
  const partners = year === 2025 ? "/partners/2025" : "/partners";
  return <div className={styles.summitHeader}>
    {/* Owner (Sept 21): no logo bar; the hero already carries the logo, so the menu comes straight in. */}
    <nav className={styles.navigation} aria-label="Summit navigation" id="main-navigation">
      <div className={styles.navMenu}><Link href="/" aria-current={pathname === "/" ? "page" : undefined} aria-haspopup="true">Summit</Link>
        <div className={styles.navMenuList}><Link href="/">2026</Link><Link href="/2025" aria-current={pathname === "/2025" ? "page" : undefined}>2025</Link></div></div>
      <Link href="/schedule" aria-current={pathname === "/schedule" ? "page" : undefined}>Schedule</Link>
      <div className={styles.navMenu}><Link href={partners} aria-current={pathname.startsWith("/partners") ? "page" : undefined} aria-haspopup="true">Directory</Link>
        <div className={styles.navMenuList}>
          <Link href={`${home}#directory`}>Who&rsquo;s Coming</Link>
          <Link href={partners}>Partners</Link>
          <Link href="/partners#philanthropists">Philanthropists</Link>
        </div></div>
      <Link href="/venue" aria-current={pathname === "/venue" ? "page" : undefined}>Venue</Link>
      <Link href={`/awards/${year}`}>Awards</Link>
      <a className={styles.donateButton} href="https://www.inspiringchildren.org/donate"><Heart size={16} fill="currentColor" aria-hidden="true" />Donate</a>
    </nav>
  </div>;
}
