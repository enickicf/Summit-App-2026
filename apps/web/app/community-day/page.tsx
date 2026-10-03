import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Heart } from "lucide-react";
import { communityDay2026 as day } from "../../lib/community-day-2026";
import { isPostEvent, postEventLabel } from "../../lib/event-phase";
import heroPhoto from "./encore-theater-community-day.png";
import styles from "./community-day.module.css";

export const metadata: Metadata = {
  title: "Community Day",
  description: `${day.name}, ${day.date}, ${day.heroTime} at ${day.venue}. ${day.about}`
};
// Checks the clock on every request: from Nov 6, 2026 the ticket request leaves the page and the hero reads
// "2027 — To Be Announced Soon.", like the other 2026 heroes (lib/event-phase.ts).
export const dynamic = "force-dynamic";

export default function CommunityDayPage() {
  const over = isPostEvent();
  return <main id="main-content" tabIndex={-1} className={styles.page}>
    <section className={styles.hero} aria-labelledby="community-day-title">
      {/* Imported next to the page (not from /public) so Next measures and optimizes it at build time. */}
      <Image className={styles.heroPhoto} src={heroPhoto} alt={day.heroPhotoAlt} fill sizes="100vw" loading="eager" fetchPriority="high" unoptimized />
      <div className={styles.heroCopy}>
        <h1 id="community-day-title" className={styles.heroTitleMark} aria-label={day.name}>
          <span className={styles.notAloneMark}>
            <Heart fill="url(#community-day-heart)" aria-hidden="true" strokeWidth={1.5}>
              <defs><linearGradient id="community-day-heart" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#8fb1e0" /><stop offset="55%" stopColor="#b99edb" /><stop offset="100%" stopColor="#f1bf7b" /></linearGradient></defs>
            </Heart>
            Not Alone
          </span>
          <strong>Community<br />Day</strong>
        </h1>
        {/* Owner (Sept 29): the date and time must read at a glance the moment the page opens. */}
        {over ? <p className={styles.when}>{postEventLabel}</p> : <p className={styles.when}>
          <time className={styles.whenDate} dateTime={day.dateTime}>Monday, November 2</time>
          <span className={styles.whenTime}>{day.heroTime}</span>
          <span className={styles.whenPlace}>{day.venue}</span>
        </p>}
        <div className={styles.heroButtons} id="community-day-actions">
          {!over && <a className={styles.button} href={day.rsvpUrl}>Request free tickets</a>}
          {/* Scrolls down to the "What is Community Day?" section on this page. */}
          <a className={`${styles.button} ${styles.outline}`} href="#what-is-community-day">Info</a>
        </div>
      </div>
    </section>

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

    <section className={styles.details} aria-labelledby="details-title">
      <h2 id="details-title">The Details</h2>
      <dl>{day.details.map(item => <div key={item.label}><dt>{item.label}</dt><dd className={item.label === "Location" ? styles.locationValue : undefined}>{item.value}{item.note && <span>{item.note}</span>}</dd></div>)}</dl>
    </section>

    {!over && <section className={styles.tickets} id="tickets" aria-labelledby="tickets-title">
      <h2 id="tickets-title">Request free tickets</h2>
      <ol className={styles.steps}>{day.tickets.steps.map(step => <li key={step.title}><h3>{step.title}</h3><p>{step.detail}</p></li>)}</ol>
      <a className={`${styles.button} ${styles.solid}`} href={day.rsvpUrl}>Open the RSVP form<ArrowUpRight size={18} aria-hidden="true" /></a>
      <p className={styles.notice}>{day.tickets.waitingList}</p>
      <p className={styles.questions}>Questions? <Link href="/contact">Contact the Inspiring Children Foundation</Link></p>
    </section>}
  </main>;
}
