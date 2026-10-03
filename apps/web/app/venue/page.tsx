import { SiteImage } from "../../components/site-image";
import { getPublicSnapshotState } from "../../lib/snapshot";
import styles from "./venue.module.css";

export const metadata = { title: "Summit Venue" };

// Official street address published by Wynn Las Vegas. No room is shown: the public Summit
// page names only the resort, so the space inside Wynn stays unannounced here.
// Owner / Ryan (Sept 29, 2026): the room map and directions moved to the private venue guide
// (lib/room-privacy.ts venueGuidePath), reachable only by its link.
const wynnAddress = ["3131 Las Vegas Blvd. South", "Las Vegas, NV 89109"] as const;

export default async function VenuePage() {
  const { snapshot } = await getPublicSnapshotState();
  return <main id="main-content" tabIndex={-1} className={styles.page}>
    <section className={styles.intro} aria-labelledby="venue-title">
      <h1 id="venue-title" className="srOnly">{snapshot.event.venueName}</h1>
      <SiteImage className={styles.photo} src="/images/wynn-las-vegas.webp" alt="Wynn Las Vegas tower above its gardens, waterfall and lagoon" sizes="(max-width: 1240px) calc(100vw - 48px), 1180px" loading="eager" fetchPriority="high" />
      <SiteImage className={styles.logo} src="/images/wynn-las-vegas-logo.png" alt="Wynn Las Vegas" sizes="200px" />
      <p className={styles.message}>Thanks to the Inspiring Children Foundation’s partnership with Wynn Las Vegas, we are proud to host the Not Alone Summit at one of the world’s most celebrated resorts.</p>
      <address className={styles.address}>{wynnAddress.map(line => <span key={line}>{line}</span>)}</address>
    </section>
  </main>;
}
