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
        <div className={styles.presentedBy}>
          <span className={styles.presentedLabel}>Presented by</span>
          <span className={styles.presentedLogos}>
            <img className={styles.presentedIcf} src="/images/icf-logo-white.png" alt="Inspiring Children Foundation" width={1500} height={1136} />
            <span className={styles.presentedDivider} aria-hidden="true" />
            <img className={styles.presentedNami} src="/2026-partners/nami-white.png" alt="NAMI, National Alliance on Mental Illness" width={1851} height={712} />
          </span>
        </div>
        <h1 id="community-day-title" className={styles.heroTitleMark} aria-label={day.name}>
          <strong>Community<br />Day</strong>
        </h1>
        {/* Owner (Sept 29): the date and time must read at a glance the moment the page opens. */}
        {over ? <p className={styles.when}>{postEventLabel}</p> : <p className={styles.when}>
          <time className={styles.whenDate} dateTime={day.dateTime}>Monday, November 2</time>
          <span className={styles.whenTime}>{day.heroTime}</span>
          <span className={styles.whenPlace}>{day.venue}</span>
        </p>}
        <div className={styles.heroButtons} id="community-day-actions">
          {!over && <a className={styles.button} href={rsvpUrl}>Request free tickets</a>}
          {/* Scrolls down to the "What is Community Day?" section on this page. */}
          <a className={`${styles.button} ${styles.outline}`} href="#what-is-community-day">Info</a>
        </div>
      </div>
    </section>

    <div className={`${eventStyles.page} ${eventStyles.awards} ${eventStyles.currentAwards} ${styles.lineup}`}>
      <AwardsGuestDirectory people={awardsDisplayPeople(snapshot)} available={snapshot?.event.directoryEnabled ?? false} />
    </div>

    <section className={styles.mission} id="what-is-community-day" aria-labelledby="mission-title">
      <h2 id="mission-title">What is Community Day?</h2>
      <p className={styles.occasion}>In honor of Nevada Mental Health Day</p>
      <p className={styles.missionDescription}>{day.about}</p>
    </section>

    <section className={styles.partners} aria-labelledby="community-partners-title">
      <h2 id="community-partners-title">Presented With Our Community Partners</h2>
      <div className={styles.partnerGrid}>
        {day.partners.map(partner => <div
          className={`${styles.partnerCard} ${partner.featured ? styles.featuredPartner : ""} ${partner.name === "Wynn Las Vegas" ? styles.wynnPartner : ""} ${partner.name === "Inspiring Children Foundation" ? styles.icfPartner : ""}`}
          key={partner.name}
        >
          <span>{partner.role}</span>
          <div className={styles.partnerLogo}>
            <Image src={partner.logo} alt={partner.name} fill sizes={partner.featured ? "(max-width: 760px) 72vw, 380px" : "(max-width: 760px) 64vw, 280px"} />
          </div>
        </div>)}
      </div>
    </section>

    <section className={styles.details} id="schedule" aria-labelledby="details-title">
      <h2 id="details-title">The Details</h2>
      <dl>{day.details.map(item => <div key={item.label}><dt>{item.label}</dt><dd className={item.label === "Location" ? styles.locationValue : undefined}>{item.value}{item.note && <span>{item.note}</span>}</dd></div>)}</dl>
    </section>

    {!over && <section className={styles.tickets} id="tickets" aria-labelledby="tickets-title">
      <h2 id="tickets-title">Request free tickets</h2>
      <ol className={styles.steps}>{day.tickets.steps.map(step => <li key={step.title}><h3>{step.title}</h3><p>{step.detail}</p></li>)}</ol>
      <a className={`${styles.button} ${styles.solid}`} href={rsvpUrl}>Open the RSVP form<ArrowUpRight size={18} aria-hidden="true" /></a>
      <p className={styles.notice}>{day.tickets.waitingList}</p>
      <p className={styles.questions}>Questions? <Link href="/contact">Contact the Inspiring Children Foundation</Link></p>
    </section>}
  </main>;
}
