import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { communityDay2026 as day } from "../../lib/community-day-2026";
import { isPostEvent, postEventLabel } from "../../lib/event-phase";
import { AwardsGuestDirectory } from "../../components/awards-guest-directory";
import eventStyles from "../../components/original-event-page.module.css";
import { awardsDisplayPeople } from "../../lib/awards-people";
import type { AwardsPartnerSite } from "../../lib/awards-partner-sites";
import { getSiteSnapshot } from "../../lib/snapshot";
import heroPhoto from "./encore-theater-community-day.png";
import styles from "./community-day.module.css";
import { PresentedBy } from "../../components/presented-by";
import { EventPartners } from "../../components/event-partners";


// Owner (Oct 4): the private partner copies (/nami/community-day, ...) are this same page with the ticket
// buttons pointed at that group's own RSVP form. The partner comes from the route, never from a query
// string: the public page is edge-cached and the cache ignores query strings.
export async function CommunityDayView({ partner = null }: { partner?: AwardsPartnerSite | null }) {
  const over = isPostEvent();
  const rsvpUrl = partner?.rsvpUrl ?? day.rsvpUrl;
  // Owner (Oct 4): the whole talent lineup (the Awards page's list) is on this page too.
  const snapshot = await getSiteSnapshot();
  return <main id="main-content" tabIndex={-1} className={styles.page}>
    <section className={styles.hero} aria-labelledby="community-day-title">
      {/* Imported next to the page (not from /public) so Next measures and optimizes it at build time. */}
      <Image className={styles.heroPhoto} src={heroPhoto} alt={day.heroPhotoAlt} fill sizes="100vw" loading="eager" fetchPriority="high" unoptimized />
      <div className={styles.heroCopy}>
        {/* Aphrah (Oct 3): "Presented by ICF & NAMI" in the header: the logo lockup sits above the title (owner, Oct 3: no "Not Alone" mark above the title). */}
        <PresentedBy className={styles.presentedBy} />
        {/* Ryan via Aphrah/Paige (Oct 5 night): the page is titled "Nevada Mental Health Day", with "Community Day" as its
            label; the ICF x NAMI "Presented by" lockup stays on top and the Cohen Foundation credit sits under the title. */}
        {/* Owner (Oct 6): no "Community Day" label above the title; the title alone. */}
        <h1 id="community-day-title" className={styles.heroTitleMark} aria-label={day.title}>
          <strong>Nevada Mental<br />Health Day</strong>
        </h1>
        <p className={styles.heroPowered}>Powered by<strong>Steven &amp; Alexandra Cohen Foundation</strong></p>
        {/* Owner (Sept 29): the date and time must read at a glance the moment the page opens. */}
        {/* Owner (Oct 6): date and venue on one line, then the two parts of the evening each with its name, times in blue,
            so nothing in the header has to be guessed at. */}
        {over ? <p className={styles.when}>{postEventLabel}</p> : <div className={styles.when}>
          <p className={styles.whenLine}><time className={styles.whenDate} dateTime={day.dateTime}>Monday, November 2</time><span className={styles.whenPlace}>{day.venue}</span></p>
          <dl className={styles.whenTimes}>
            <div><dt>Nevada Mental Health Day</dt><dd>{day.heroTime}</dd></div>
            <div><dt>Not Alone Awards Show</dt><dd>{day.heroAwardsShowTime}</dd></div>
          </dl>
        </div>}
        <div className={styles.heroButtons} id="community-day-actions">
          {!over && <a className={styles.button} href={rsvpUrl} target="_blank" rel="noopener">Request free tickets</a>}
          {/* Scrolls down to the "What is Community Day?" section on this page. */}
          <a className={`${styles.button} ${styles.outline}`} href="#what-is-community-day">Info</a>
        </div>
      </div>
    </section>

    <div className={`${eventStyles.page} ${eventStyles.awards} ${eventStyles.currentAwards} ${styles.lineup}`}>
      <AwardsGuestDirectory people={awardsDisplayPeople(snapshot)} available={snapshot?.event.directoryEnabled ?? false} foundingPartners={false} />
    </div>

    <section className={styles.mission} id="what-is-community-day" aria-labelledby="mission-title">
      <h2 id="mission-title">What is Community Day?</h2>
      <p className={styles.missionDescription}>{day.about}</p>
    </section>

    {/* Owner (Oct 5): the shared partner block (Cohen "Powered by", ICF x NAMI "Presented by" in one box, Wynn). */}
    <EventPartners tone="light" id="community-day-partners" />

    <section className={styles.details} id="schedule" aria-labelledby="details-title">
      <h2 id="details-title">The Details</h2>
      <dl>{day.details.map(item => <div key={item.label}><dt>{item.label}</dt><dd className={item.label === "Location" ? styles.locationValue : undefined}>{item.value}{item.note && <span>{item.note}</span>}</dd></div>)}</dl>
    </section>

    {!over && <section className={styles.tickets} id="tickets" aria-labelledby="tickets-title">
      <h2 id="tickets-title">Request free tickets</h2>
      <ol className={styles.steps}>{day.tickets.steps.map(step => <li key={step.title}><h3>{step.title}</h3><p>{step.detail}</p></li>)}</ol>
      <a className={`${styles.button} ${styles.solid}`} href={rsvpUrl} target="_blank" rel="noopener">Open the RSVP form<ArrowUpRight size={18} aria-hidden="true" /></a>
      <p className={styles.notice}>{day.tickets.waitingList}</p>
      <p className={styles.questions}>Questions? <Link href="/contact">Contact the Inspiring Children Foundation</Link></p>
    </section>}
  </main>;
}
