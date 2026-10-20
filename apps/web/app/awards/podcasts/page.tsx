import type { Metadata } from "next";
import { awards2026Editorial } from "../../../lib/awards-editorial";
import { bySize, podcasts2026 } from "../../../lib/podcasts-2026";
import { PodcastCard } from "./podcast-card";
import styles from "./podcasts.module.css";

// Owner (Oct 20, 2026): "create a new website page today, for podcasts ... on a separate branch incorporating all u
// know about the awards website". Draft (branch claude/podcasts-page): not linked from any menu and not indexed until
// the owner approves it. Look follows the 2026 Awards page: black, champagne gold, Poppins ExtraBold headings.
export const metadata: Metadata = {
  title: { absolute: "Podcasts and Interviewers · Not Alone Awards 2026" },
  description: "The podcasts and creators recording at the Not Alone Awards and Nevada Mental Health Day, Monday, November 2, 2026 at Wynn Las Vegas.",
  robots: { index: false, follow: false },
  icons: { icon: [{ url: "/icons/awards-48.png", sizes: "48x48", type: "image/png" }], apple: [{ url: "/icons/awards-180.png", sizes: "180x180", type: "image/png" }] }
};

export default function PodcastsPage() {
  // Owner (Oct 20): biggest to smallest (sourced audience figures in lib/podcasts-2026.ts).
  const entries = bySize(podcasts2026);
  return <main id="main-content" tabIndex={-1} className={styles.page}>
    {/* Owner (Oct 20): no hero or intro; the page opens straight on the podcasts, titled "Podcasts and Interviewers". */}
    <section className={`${styles.section} ${styles.first}`} aria-labelledby="podcasts-title">
      <div className={styles.sectionHead}><p className={styles.kicker}>Not Alone Awards 2026</p><h1 id="podcasts-title">Podcasts and Interviewers</h1></div>
      <div className={styles.grid}>{entries.map(entry => <PodcastCard key={entry.show} entry={entry} />)}</div>
      <p className={styles.moreNote}>More podcasts and interviewers to be announced.</p>
    </section>

    <section className={styles.cta} aria-labelledby="cta-title">
      <h2 id="cta-title">Join us at the Not Alone Awards</h2>
      <p>Monday, November 2, 2026 · Encore Theater · Wynn Las Vegas</p>
      <a className={styles.button} href={awards2026Editorial.rsvpUrl} target="_blank" rel="noopener">Request tickets</a>
    </section>
  </main>;
}
