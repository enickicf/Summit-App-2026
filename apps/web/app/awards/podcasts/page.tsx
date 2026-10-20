import type { Metadata } from "next";
import { PoweredBy } from "../../../components/powered-by";
import { PresentedBy } from "../../../components/presented-by";
import { SiteImage } from "../../../components/site-image";
import { awards2026Editorial } from "../../../lib/awards-editorial";
import { initials, podcasts2026, type PodcastEntry } from "../../../lib/podcasts-2026";
import styles from "./podcasts.module.css";

// Owner (Oct 20, 2026): "create a new website page today, for podcasts ... on a separate branch incorporating all u
// know about the awards website". Draft (branch claude/podcasts-page): not linked from any menu and not indexed until
// the owner approves it. Look follows the 2026 Awards page: black, champagne gold, Poppins ExtraBold headings.
export const metadata: Metadata = {
  title: { absolute: "Podcasts & Media · Not Alone Awards 2026" },
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
    <section className={styles.hero} aria-labelledby="podcasts-title">
      <p className={styles.eyebrow}>Monday, November 2, 2026 · Wynn Las Vegas</p>
      <SiteImage src="/images/na-awards-logo-white.png" alt="Not Alone Awards" sizes="(max-width: 600px) 150px, 200px" className={styles.logo} loading="eager" />
      <h1 id="podcasts-title">Podcasts <span>&amp; Media</span></h1>
      <p className={styles.lede}>The shows and creators recording at Nevada Mental Health Day and the Not Alone Awards: conversations with the people advancing mental health, recorded live in Las Vegas.</p>
      <div className={styles.credits}>
        <PoweredBy className={styles.poweredBy} />
        <PresentedBy size="hero" tone="dark" />
      </div>
    </section>

    <section className={styles.how} aria-labelledby="how-title">
      <h2 id="how-title" className={styles.visuallyHidden}>How podcasts take part</h2>
      <div className={styles.howGrid}>
        <div><span className={styles.howNumber}>01</span><h3>Daytime recordings</h3><p>Full-length episodes recorded on Monday, November 2, during Nevada Mental Health Day.</p></div>
        <div><span className={styles.howNumber}>02</span><h3>Red carpet</h3><p>Short interviews with talent and honorees on the red carpet before the Awards Show.</p></div>
        <div><span className={styles.howNumber}>03</span><h3>Recorded at Not Alone</h3><p>Every episode is recorded at the Not Alone Summit &amp; Awards, powered by the {awards2026Editorial.foundation} and presented by the Inspiring Children Foundation + NAMI.</p></div>
      </div>
    </section>

    <section className={styles.section} aria-labelledby="shows-title">
      <div className={styles.sectionHead}><p className={styles.kicker}>2026</p><h2 id="shows-title">The Podcasts</h2></div>
      <div className={styles.grid}>{shows.map(entry => <Card key={entry.show} entry={entry} />)}</div>
    </section>

    <section className={styles.section} aria-labelledby="creators-title">
      <div className={styles.sectionHead}><p className={styles.kicker}>On the ground</p><h2 id="creators-title">Creators &amp; Interviewers</h2></div>
      <div className={styles.grid}>{creators.map(entry => <Card key={entry.show} entry={entry} />)}</div>
      <p className={styles.more}>More podcasts and creators to be announced.</p>
    </section>

    <section className={styles.cta} aria-labelledby="cta-title">
      <h2 id="cta-title">Join us at the Not Alone Awards</h2>
      <p>Monday, November 2, 2026 · Encore Theater · Wynn Las Vegas</p>
      <a className={styles.button} href={awards2026Editorial.rsvpUrl} target="_blank" rel="noopener">Request tickets</a>
    </section>
  </main>;
}
