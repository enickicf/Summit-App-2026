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
  // The Awards Show link in the schedule leads to this copy's Awards page (a partner copy stays inside itself).
  const awardsPath = partner?.path ?? "/awards/2026";
  // Owner (Oct 4): the whole talent lineup (the Awards page's list) is on this page too.
  const snapshot = await getSiteSnapshot();
  return <main id="main-content" tabIndex={-1} className={styles.page}>
    <section className={styles.hero} aria-labelledby="community-day-title">
      {/* Imported next to the page (not from /public) so Next measures and optimizes it at build time. */}
      <Image className={styles.heroPhoto} src={heroPhoto} alt={day.heroPhotoAlt} fill sizes="100vw" loading="eager" fetchPriority="high" unoptimized />
      <div className={styles.heroCopy}>
        {/* Ryan via Aphrah/Paige (Oct 5 night): the page is titled "Nevada Mental Health Day"; owner (Oct 6): no
            "Community Day" label above it. Owner (Oct 7): the header was too crowded: it is now the title, the Cohen
            Foundation credit, the ICF | NAMI "Presented by" lockup directly under that credit, and the two buttons.
            The date, venue, times and the Awards Show pointer moved down to the Schedule section. */}
        <h1 id="community-day-title" className={styles.heroTitleMark} aria-label={day.title}>
          <strong>Nevada Mental<br />Health Day</strong>
        </h1>
        <p className={styles.heroPowered}>Powered by<strong>Steven &amp; Alexandra Cohen Foundation</strong></p>
        <PresentedBy className={styles.presentedBy} />
        {over && <p className={styles.when}>{postEventLabel}</p>}
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

    {/* Owner (Oct 7): "The Details" became the Schedule: the date under the heading, then one row per part of the
        day with its room; the Awards Show row's name links to the Awards page. The id stays "schedule" for the menu. */}
    <section className={styles.details} id="schedule" aria-labelledby="schedule-title">
      <h2 id="schedule-title">Schedule</h2>
      <p className={styles.scheduleDate}><time dateTime={day.dateTime}>{day.date}</time></p>
      <dl>{day.details.map(item => <div key={item.label}>
        <dt>{item.link === "awards" ? <a href={awardsPath} target="_blank" rel="noopener">{item.label}</a> : item.label}</dt>
        {/* A value with several parts ("Doors open 6:30 PM · Show 7:30 PM") may only break at its separator, never
            inside a time; each part keeps its trailing dot so a wrapped line never starts with one. */}
        <dd>{item.value.split(" · ").map((part, index, parts) => <span key={part} className={styles.part}>{index < parts.length - 1 ? `${part} · ` : part}</span>)}<span>{item.note}</span></dd>
      </div>)}</dl>
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
