import type { Metadata } from "next";
import { SiteImage } from "../../../components/site-image";
import { WynnPerspectiveMap } from "../../../components/wynn-map";
import { getPublicSnapshotState } from "../../../lib/snapshot";
import { venueGuidePath } from "../../../lib/room-privacy";
import { formatSessionTimes } from "../../schedule/schedule-presentation";
import styles from "../venue.module.css";

// Owner / Ryan (Sept 29, 2026): the private venue guide. Reached only by this link (lib/room-privacy.ts
// venueGuidePath): not linked from any menu or page, not in the sitemap, never indexed. It carries what
// the public Venue page no longer shows: the Wynn meeting-wing map, the walking directions and the
// room for each published Summit session.
export const metadata: Metadata = { title: "Summit Venue Guide", robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } } };
export const dynamic = "force-dynamic";

const wynnAddress = ["3131 Las Vegas Blvd. South", "Las Vegas, NV 89109"] as const;

export default async function VenueGuidePage() {
  const { snapshot } = await getPublicSnapshotState();
  const sessions = snapshot.scheduleItems
    .filter(item => item.eventId === snapshot.event.id && item.published && item.visibilityScope.id === "public")
    .sort((a, b) => a.startUtc.localeCompare(b.startUtc));
  const named = sessions.map(item => item.locationName.trim()).filter(name => name && !/to be confirmed|pending|tbc|tbd/i.test(name));
  const published = [...new Set(named)];
  const highlighted = new Set(published.map(name => name.toLowerCase()));
  const dayOf = (utc: string) => new Intl.DateTimeFormat("en-US", { timeZone: snapshot.event.timeZone, weekday: "long", month: "long", day: "numeric" }).format(new Date(utc));
  const days = [...new Set(sessions.map(item => dayOf(item.startUtc)))];
  return <main id="main-content" tabIndex={-1} className={styles.page}>
    <section className={styles.intro} aria-labelledby="venue-title">
      <h1 id="venue-title" className="srOnly">{snapshot.event.venueName} venue guide</h1>
      <SiteImage className={styles.photo} src="/images/wynn-las-vegas.webp" alt="Wynn Las Vegas tower above its gardens, waterfall and lagoon" sizes="(max-width: 1240px) calc(100vw - 48px), 1180px" loading="eager" fetchPriority="high" />
      <SiteImage className={styles.logo} src="/images/wynn-las-vegas-logo.png" alt="Wynn Las Vegas" sizes="200px" />
      <p className={styles.message}>Your guide to the Not Alone Summit inside Wynn Las Vegas. This page is shared by invitation only; please do not post the link publicly.</p>
      <address className={styles.address}>{wynnAddress.map(line => <span key={line}>{line}</span>)}</address>
    </section>
    <section className={styles.mapSection} aria-labelledby="venue-map-title">
      <h2 id="venue-map-title">Finding the meeting wing</h2>
      <p>The Wynn meeting wing as you walk in from the casino.{published.length ? " Rooms on the Summit schedule are highlighted." : ""}</p>
      <WynnPerspectiveMap className={styles.map} highlighted={highlighted} />
      <p className={styles.lost}><strong>Lost?</strong> Ask any Wynn team member for {published[0] ? <strong>{published[0]}</strong> : "the Sunset Promenade"}{published[0] ? ", just off the Sunset Promenade" : ""} in the convention area.</p>
      <p className={styles.mapSource}>Drawn from Wynn Las Vegas’s published meeting-space map.</p>
    </section>
    <section className={styles.mapSection} aria-labelledby="venue-rooms-title">
      <h2 id="venue-rooms-title">Where each session is</h2>
      {days.length ? days.map(day => <div key={day} className={styles.rooms}>
        <h3>{day}</h3>
        <ul>{sessions.filter(item => dayOf(item.startUtc) === day).map(item => {
          const times = formatSessionTimes(item, snapshot.event.timeZone);
          const room = item.locationName.trim();
          return <li key={item.id}><span>{item.endUtc === item.startUtc ? times.start : `${times.start} – ${times.end}`}</span> <strong>{item.title}</strong> <em>{!room || /to be confirmed|pending|tbc|tbd/i.test(room) ? "Room to be confirmed" : room}</em></li>;
        })}</ul>
      </div>) : <p>Rooms will be listed here once the schedule is published.</p>}
      <p className={styles.mapSource}>Private guide · {venueGuidePath}</p>
    </section>
  </main>;
}
