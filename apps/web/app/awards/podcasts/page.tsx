import type { Metadata } from "next";
import { bySize, podcasts2026 } from "../../../lib/podcasts-2026";
import { PodcastCard } from "./podcast-card";
import styles from "./podcasts.module.css";

// Owner (Oct 20, 2026): "create a new website page today, for podcasts ... on a separate branch incorporating all u
// know about the awards website". Draft (branch claude/podcasts-page): not linked from any menu and not indexed until
// the owner approves it. Look follows the 2026 Awards page: black, champagne gold, Poppins ExtraBold headings.
export const metadata: Metadata = {
  title: { absolute: "Podcast Interviewers · Not Alone Awards" },
  description: "The podcasts and creators recording at the Not Alone Awards and Nevada Mental Health Day, Monday, November 2, 2026 at Wynn Las Vegas.",
  robots: { index: false, follow: false },
  icons: { icon: [{ url: "/icons/awards-48.png", sizes: "48x48", type: "image/png" }], apple: [{ url: "/icons/awards-180.png", sizes: "180x180", type: "image/png" }] }
};

export default function PodcastsPage() {
  // Owner (Oct 20): biggest to smallest (sourced audience figures in lib/podcasts-2026.ts).
  const entries = bySize(podcasts2026);
  return <main id="main-content" tabIndex={-1} className={styles.page}>
    {/* Owner (Oct 20): no hero or intro; the page opens straight on the podcasts. */}
    <section className={`${styles.section} ${styles.first}`} aria-labelledby="podcasts-title">
      {/* Owner (Oct 20): no "Not Alone Awards 2026" line; the page starts right at the top with "Podcast Interviewers", and the
          "to be announced" line sits under it in the Awards lineup style (18px bold lavender, centered). */}
      <div className={styles.sectionHead}><h1 id="podcasts-title">Podcast Interviewers</h1><p className={styles.announcement}>Explore each show, then book a short-form or long-form interview.</p></div>
      <div className={styles.grid}>{entries.map(entry => <PodcastCard key={entry.show} entry={entry} />)}</div>
    </section>

    <section className={styles.cta} aria-labelledby="cta-title">
      <h2 id="cta-title">Private interview scheduling</h2>
      <p>Short-form interviews happen after each guest’s red carpet walk, with no time selection. Long-form times account for recorded guest and podcast arrivals; when no arrival is on file, availability begins at 10:00 AM. Recording Rooms 1–3 are reserved here, with exact locations announced closer to the event.</p>
    </section>
  </main>;
}
