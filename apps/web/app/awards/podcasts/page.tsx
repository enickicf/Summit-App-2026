import type { Metadata } from "next";
import { SiteImage } from "../../../components/site-image";
import { awards2026Editorial } from "../../../lib/awards-editorial";
import { initials, podcasts2026, type PodcastEntry } from "../../../lib/podcasts-2026";
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

function Card({ entry }: { entry: PodcastEntry }) {
  return <article className={styles.card}>
    <div className={styles.cardMedia}>
      {entry.image
        ? <SiteImage src={entry.image} alt={entry.hosts.join(" and ")} sizes="(max-width: 700px) 100vw, 360px" className={styles.cardImage} />
        : <span className={styles.monogram} aria-hidden="true">{initials(entry.show)}</span>}
    </div>
    <div className={styles.cardBody}>
      <p className={styles.cardKicker}>{entry.kind === "creator" ? "Creator" : "Podcast"}</p>
      <h3>{entry.show}</h3>
      {entry.kind === "podcast" && <p className={styles.hosts}>with {entry.hosts.join(" and ")}</p>}
      {entry.kind === "creator" && <p className={styles.hosts}>Social media creator and interviewer</p>}
      <ul className={styles.roles} aria-label="At the event">{entry.roles.map(role => <li key={role}>{role}</li>)}</ul>
    </div>
  </article>;
}

export default function PodcastsPage() {
  const shows = podcasts2026.filter(entry => entry.kind === "podcast");
  const creators = podcasts2026.filter(entry => entry.kind === "creator");
  return <main id="main-content" tabIndex={-1} className={styles.page}>
    {/* Owner (Oct 20): no hero or intro; the page opens straight on the podcasts, titled "Podcasts and Interviewers". */}
    <section className={`${styles.section} ${styles.first}`} aria-labelledby="podcasts-title">
      <div className={styles.sectionHead}><p className={styles.kicker}>Not Alone Awards 2026</p><h1 id="podcasts-title">Podcasts and Interviewers</h1></div>
      <div className={styles.grid}>{[...shows, ...creators].map(entry => <Card key={entry.show} entry={entry} />)}</div>
      <p className={styles.more}>More podcasts and interviewers to be announced.</p>
    </section>

    <section className={styles.cta} aria-labelledby="cta-title">
      <h2 id="cta-title">Join us at the Not Alone Awards</h2>
      <p>Monday, November 2, 2026 · Encore Theater · Wynn Las Vegas</p>
      <a className={styles.button} href={awards2026Editorial.rsvpUrl} target="_blank" rel="noopener">Request tickets</a>
    </section>
  </main>;
}
