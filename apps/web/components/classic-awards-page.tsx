import type { EventSnapshot } from "@not-alone/validation";
import source from "../lib/original-sites.json";
import { originalAsset } from "../lib/original-assets";
import { awards2026Editorial } from "../lib/awards-editorial";
import { AttendeeCard, Card, attendeeSections } from "./classic-summit-page";
import { SiteImage } from "./site-image";
import styles from "./classic-summit.module.css";

// The "classic" (Unoriginal) Awards pages: word-for-word copies of the live ICF Awards page
// (inspiringchildren.org/awards, captured Sept 16, 2026). Owner (Sept 21): copy it verbatim; the
// 2026 page differs only in its attendee sections, which list the current confirmed 2026 guests.
const sections = source.awards.sections;

function Mission() {
  // The first paragraph carries ICF's bold names; the rest are ICF's text as captured.
  const rest = sections[1]!.blocks.slice(1);
  return <section className={`${styles.section} ${styles.awardsMission}`}>
    <p>Presenting the Not Alone Awards Show, powered by the <strong>Steven &amp; Alexandra Cohen Foundation</strong>, broadcast live on <strong>iHeartRadio</strong>, and hosted by <strong>Wynn Resorts</strong>.</p>
    {rest.map(block => <p key={block.text}>{block.text}</p>)}
  </section>;
}

export function ClassicAwardsPage({ year = 2026, snapshot = null }: { year?: 2025 | 2026; snapshot?: EventSnapshot | null }) {
  const attendees2026 = year === 2026 ? attendeeSections(snapshot, "awards") : [];
  const host = sections[3]!.people[0]!;
  const why = sections[10]!.blocks.slice(1);
  const awards = sections[11]!.blocks.slice(1);
  return <main id="main-content" tabIndex={-1} className={styles.page}>
    <section className={styles.awardsHero} aria-label="Not Alone Awards">
      <h1 className={styles.hidden}>Not Alone Awards</h1>
      <SiteImage className={styles.awardsLogo} src={originalAsset(sections[0]!.images[0]!.src)} alt="Not Alone Awards, powered by Steven & Alexandra Cohen Foundation" sizes="(max-width: 767px) 80vw, 420px" loading="eager" />
      {sections[0]!.blocks.map(block => <p key={block.text}>{block.text}</p>)}
    </section>

    <Mission />

    <section className={`${styles.section} ${styles.cards} ${styles.awardsHost}`}>
      <h3>Host</h3>
      <div className={styles.hostCard}><Card person={host} /></div>
    </section>

    <section className={`${styles.section} ${styles.awardsBlack} ${styles.awardsWhen}`}>
      <h4><strong>When:</strong> Monday, November 2nd</h4>
      <h4><strong>Where:</strong> Wynn Las Vegas</h4>
      <h4><strong>RSVP Below ⬇️</strong></h4>
      <a className={styles.rsvpButton} href={awards2026Editorial.rsvpUrl}>RSVP HERE</a>
    </section>

    {attendees2026.length
      ? attendees2026.map(section => <section key={section.title} className={`${styles.section} ${styles.cards}`} aria-label={section.title}>
        {section.heading !== null && <h2>{section.heading ?? section.title}</h2>}
        <div className={styles.cardRow}>{section.people.map(({ person, role }) => <AttendeeCard key={person.slug} person={person} role={role} awards />)}</div>
      </section>)
      : sections.slice(5, 10).map(section => <section key={section.id} className={`${styles.section} ${styles.cards}`}>
        <h2>{section.title}</h2>
        <div className={styles.cardRow}>{section.people.map(person => <Card key={person.name} person={person} />)}</div>
      </section>)}

    <section className={`${styles.section} ${styles.awardsBlack} ${styles.whyItMatters}`}>
      <h3>Why It Matters</h3>
      <div>{[0, 2, 4].map(index => <div key={why[index]!.text}><h4>{why[index]!.text}</h4><p>{why[index + 1]!.text}</p></div>)}</div>
    </section>

    <section className={`${styles.section} ${styles.awardsList}`}>
      <h3>Awards</h3>
      {awards.filter((_, index) => index % 2 === 0).map((block, index) => <div key={block.text}><p><strong>{block.text}</strong></p><p>{awards[index * 2 + 1]!.text}</p></div>)}
    </section>

    <section className={`${styles.section} ${styles.awardsBlack} ${styles.awardsClosing}`}>
      <h4>{sections[12]!.blocks[0]!.text}</h4>
    </section>

    {/* Owner (Sept 21): the no-solicitation notice goes at the bottom, not near the top. */}
    <section className={`${styles.section} ${styles.awardsBlack} ${styles.noSolicitation}`} id="no-solicitation">
      <h4><strong>No Solicitation, Only Connection.</strong> We have a very strict No Pitch, No Solicitation Policy.</h4>
      <p>{sections[2]!.blocks[1]!.text}</p>
    </section>
  </main>;
}
