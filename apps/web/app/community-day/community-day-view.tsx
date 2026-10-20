import { InvitationBadge } from "../../components/invitation-badge";
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
import { PoweredBy } from "../../components/powered-by";
import { EventPartners } from "../../components/event-partners";
import { communityDaySchedule2026 } from "../../lib/community-day-schedule-2026";


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
      {partner?.invitationTier && <InvitationBadge tier={partner.invitationTier} />}
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
        {/* Owner (Oct 11): the same header treatment as the Summit and Awards — the stacked Cohen credit and the
            hero-size ICF × NAMI lockup. */}
        <PoweredBy className={styles.heroPowered} />
        {/* Owner (Oct 11): on phones and tablets the date sits level with the Presented-by logos, on the right (the buttons
            below are full width); on computers it is in the header's bottom-right corner. */}
        <div className={styles.lockupRow}>
          <PresentedBy size="hero" className={styles.presentedBy} />
          {/* Owner (Oct 11): as on the Summit and Awards (Ryan, Oct 9), the date and place sit in the header's bottom-right
              corner; small on phones, shrinking with the screen width. */}
          <div className={styles.heroCorner}>
              <p className={`${styles.heroEyebrow} ${styles.heroCornerDate}`}>{over ? postEventLabel : <><span className={styles.heroEyebrowDate}><span className={`${styles.cornerPart} ${styles.cornerFirst}`}>Monday,</span> <span className={styles.cornerPart}>November 2, 2026</span></span><span className={styles.heroEyebrowVenue}>Wynn Las Vegas</span></>}</p>
          </div>
        </div>
        <div className={styles.heroButtons} id="community-day-actions">
          {!over && <a className={styles.button} href={rsvpUrl} target="_blank" rel="noopener">Request free tickets</a>}
          {/* Owner (Oct 8): "Full Schedule" (was "Info") scrolls to the day's full schedule on this page. */}
          <a className={`${styles.button} ${styles.outline}`} href="#schedule">Full Schedule</a>
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

    {/* Owner (Oct 8): the full schedule for the day, like the Summit's, from Airtable's Run of Show: each session with its
        time, room, attire and description; the segments of the Summit Sessions sit under that block; the Awards Show rows
        link to this copy's Awards page. The id stays "schedule" for the menu and the Full Schedule button. */}
    <section className={styles.details} id="schedule" aria-labelledby="schedule-title">
      <h2 id="schedule-title">Schedule</h2>
      <p className={styles.scheduleDate}><time dateTime={day.dateTime}>{day.date}</time></p>
      <ol className={styles.fullSchedule}>{communityDaySchedule2026().map(session => <li key={session.id} className={styles[session.kind]}>
        <p className={styles.sessionTime}>{session.time}</p>
        <div>
          <h3>{session.kind === "awards" ? <a href={awardsPath} target="_blank" rel="noopener">{session.title}</a> : session.title}</h3>
          <p className={styles.sessionMeta}>{[session.room, session.attire && `Attire: ${session.attire}`].filter(Boolean).join(" · ")}</p>
          {session.synopsis && <p className={styles.sessionSynopsis}>{session.synopsis}</p>}
        </div>
      </li>)}</ol>
    </section>

    {!over && <section className={styles.tickets} id="tickets" aria-labelledby="tickets-title">
      <h2 id="tickets-title">Request free tickets</h2>
      <ol className={styles.steps}>{(partner ? [{ title: "Open your invitation form", detail: "Use the invitation-specific RSVP link below and select the events available on that form." }, { title: "Name every ticket holder", detail: "Provide a name, email, phone, organization and title for each person. Check each event and ticket count before submitting." }] : day.tickets.steps).map(step => <li key={step.title}><h3>{step.title}</h3><p>{step.detail}</p></li>)}</ol>
      <a className={`${styles.button} ${styles.solid}`} href={rsvpUrl} target="_blank" rel="noopener">Open the RSVP form<ArrowUpRight size={18} aria-hidden="true" /></a>
      <p className={styles.notice}>{day.tickets.waitingList}</p>
      <p className={styles.questions}>Questions? <Link href="/contact">Contact the Inspiring Children Foundation</Link></p>
    </section>}
  </main>;
}
