import type { EventSnapshot } from "@not-alone/validation";
import source from "../lib/original-sites.json";
import { awardsDisplayPeople } from "../lib/awards-people";
import { personNameKey, portraitImageStyle } from "../lib/person-portraits";
import type { SummitPerson } from "../lib/people";
import { isKeynote, peopleSections } from "../lib/people-sections";
import { originalAsset } from "../lib/original-assets";
import { updatedPortrait } from "../lib/person-portraits";
import { ClassicHeroVideo } from "./classic-hero-video";
import { getSiteImageMetadata, SiteImage } from "./site-image";
import styles from "./classic-summit.module.css";

// The "classic" version of the Summit home: a faithful rebuild of the live ICF Summit page
// (inspiringchildren.org/summit, as published Sept 21, 2026). Section order, wording, people,
// photos, colors and type follow that page; people cards link to ICF's own profile pages.
// Owner (Sept 21): 2025 is a copy-paste identical copy of that page. 2026 is the same page with
// only the attendee sections updated to the current confirmed 2026 guests (same card format and
// ICF headings), in ICF's order and layout.
const icf = "https://www.inspiringchildren.org";
const sections = source.summit.sections;
type Person = (typeof sections)[number]["people"][number];

function leaders(index: number, heading: string, order: string[], current: boolean) {
  const section = sections[index]!;
  const names = section.blocks.filter(block => block.tag === "h4").map(block => block.text);
  const start = section.blocks.findIndex(block => block.tag === "h2" && block.text === heading);
  const next = section.blocks.findIndex((block, position) => position > start && block.tag === "h2");
  const inGroup = section.blocks.slice(start, next < 0 ? undefined : next).filter(block => block.tag === "h4").map(block => block.text);
  return order.filter(name => inGroup.includes(name)).map(name => {
    const position = section.blocks.findIndex(block => block.tag === "h4" && block.text === name);
    return { name, role: section.blocks[position + 1]?.text ?? "", image: (current ? updatedPortrait(name) : undefined) ?? originalAsset(section.images[names.indexOf(name)]!.src) };
  });
}

function Leader({ person, large = false }: { person: { name: string; role: string; image: string }; large?: boolean }) {
  return <article className={styles.leader}>
    <SiteImage className={large ? styles.leaderImageLarge : styles.leaderImage} src={person.image} alt={person.name} sizes="(max-width: 767px) 70vw, 320px" style={portraitImageStyle(person.name, person.image)} />
    <h4>{person.name}</h4>
    <p>{person.role}</p>
  </article>;
}

export function Card({ person }: { person: Person }) {
  const content = <>
    <div className={styles.imageWrap}><SiteImage src={originalAsset(person.image)} alt={person.name} sizes="(max-width: 767px) 90vw, (max-width: 1024px) 45vw, 280px" /></div>
    <div className={styles.infoBox}><p><span className={styles.nameLine}><strong>{person.name}</strong><br /></span>{person.role}</p></div>
  </>;
  return /#$/.test(person.href) || person.href === source.summit.source
    ? <div className={styles.hoverCard}>{content}</div>
    : <a className={styles.hoverCard} href={person.href}>{content}</a>;
}

function CardSection({ index, id }: { index: number; id?: string | undefined }) {
  const section = sections[index]!;
  return <section className={`${styles.section} ${styles.cards}`} id={id}>
    <h2>{section.title}</h2>
    <div className={styles.cardRow}>{section.people.map(person => <Card key={person.name} person={person} />)}</div>
  </section>;
}

// Owner (Sept 21): the same people sections as the Original site on every 2026 website (Keynotes first,
// then Experts, Founders, Hosts, Musicians & Talent, Attendees), in ICF's card format.
const listedCategories = ["Founders", "Founders & Entrepreneurs", "Philanthropists", "Business Leaders", "Business Leaders & Philanthropists", "Musicians", "Comedians", "Athletes", "Entertainers & Athletes", "Experts", "Podcasters", "Talent", "Hosts", "Attendees"] as const;

export function attendeeSections(snapshot: EventSnapshot | null, variant: "summit" | "awards" = "summit") {
  const seen = new Set<string>();
  const people = awardsDisplayPeople(snapshot, { includeCohens: variant === "summit" }).filter(person => {
    const key = personNameKey(person.name);
    if (person.year !== 2026 || seen.has(key)) return false;
    seen.add(key);
    return true;
  }).filter(person => isKeynote(person) || person.categories.some(category => (listedCategories as readonly string[]).includes(category)));
  return peopleSections(people, variant);
}

export function AttendeeCard({ person, role, awards = false }: { person: SummitPerson; role: string; awards?: boolean }) {
  const image = person.image ?? updatedPortrait(person.name);
  return <a className={styles.hoverCard} href={`/directory/${encodeURIComponent(person.slug)}${awards ? "?from=awards" : ""}`}>
    <div className={styles.imageWrap}>{!image ? <span className={styles.noPhoto} aria-hidden="true" />
      : getSiteImageMetadata(image) ? <SiteImage src={image} alt={person.name} sizes="(max-width: 767px) 90vw, (max-width: 1024px) 45vw, 280px" style={portraitImageStyle(person.name, image)} />
      // Airtable and approved public portraits are served from their own URLs.
      : <img src={image} alt={person.name} style={portraitImageStyle(person.name, image)} loading="lazy" decoding="async" width={500} height={500} />}</div>
    <div className={styles.infoBox}><p><span className={styles.nameLine}><strong>{person.name}</strong><br /></span>{role}</p></div>
  </a>;
}

export function ClassicSummitPage({ year = 2026, snapshot = null }: { year?: 2025 | 2026; snapshot?: EventSnapshot | null }) {
  const current = year === 2026;
  const coChairs = leaders(4, "Co-Chairs", ["Jewel", "Steve Wozniak", "Cherrial Odell"], current);
  const [summitHost] = leaders(4, "Summit Host", ["Jason Kennedy"], current);
  const [awardsHost] = leaders(4, "Awards Host", ["Loni Love"], current);
  const originalExecutive = leaders(13, "Executive Producers", ["Jewel", "Ryan Wolfington", "Dr. George Rapier III", "Trevor Short"], current);
  const originalProducers = leaders(13, "Producers", ["Aphrah Brokaw", "Trent Alenik"], current);
  const originalProduction = [...originalExecutive, ...originalProducers];
  const pickProduction = (names: string[]) => names.flatMap(name => originalProduction.filter(person => person.name === name));
  const executive = current ? pickProduction(["Aphrah Brokaw", "Jewel", "Ryan Wolfington"]) : originalExecutive;
  const producers = current ? pickProduction(["Trevor Short", "Trent Alenik"]) : originalProducers;
  const attendees2026 = current ? attendeeSections(snapshot) : [];
  // Without a 2026 guest list the ICF page's own attendee sections are shown. ICF Alumni stays from ICF.
  // ICF Alumni has no 2026 source of its own, so ICF's current alumni list stays.
  const attendees = attendees2026.length
    ? [...attendees2026.map((section, index) => <section key={section.title} className={`${styles.section} ${styles.cards}`} id={index === 0 ? "speakers" : undefined}>
      {section.heading !== null && <h2>{section.heading ?? section.title}</h2>}
      <div className={styles.cardRow}>{section.people.map(({ person, role }) => <AttendeeCard key={person.slug} person={person} role={role} />)}</div>
    </section>), <CardSection key={12} index={12} />]
    : [7, 8, 9, 10, 11, 12].map(index => <CardSection key={index} index={index} id={index === 7 ? "speakers" : undefined} />);
  const featuring = sections[5]!.blocks.filter(block => block.tag === "h3").map(block => block.text);
  const located = sections[6]!.blocks;
  const categories = [...new Set(located.slice(3).map(block => block.text))];

  return <main id="main-content" tabIndex={-1} className={styles.page}>
    <section className={styles.hero} aria-label="Not Alone Summit">
      <ClassicHeroVideo desktop="/videos/classic-hero-desktop.mp4" mobile="/videos/classic-hero-mobile.mp4" poster="/classic/hero-fallback.webp" />
      <h1 className={styles.hidden}>Not Alone Summit</h1>
    </section>


    <section className={`${styles.section} ${styles.split} ${styles.about}`} id="about">
      <div className={styles.splitText}>
        {/* Owner (Sept 21, later): this version is copy-paste identical to ICF, so ICF's quote stays. */}
        <h2>{sections[1]!.blocks[0]!.text}</h2>
        <p className={styles.large}>Building on the success of <a href={`${icf}/notalone`}><strong>NotAloneChallenge.org</strong></a>, the Inspiring Children Foundation is launching the <strong>Not Alone Summit</strong>, presented by <strong>Villa Bibbiani</strong> and powered by the <strong>Steven &amp; Alexandra Cohen Foundation</strong>, hosted at <strong>Wynn Las Vegas.</strong> The Not Alone Summit is a premier national convening designed to bring together leading CEOs, artists, athletes, philanthropists, clinicians, researchers, and youth ambassadors to advance emotional and mental health.</p>
        <p className={styles.large}>{sections[1]!.blocks[2]!.text}</p>
      </div>
      <div className={styles.splitMedia}><SiteImage className={styles.cohenLogo} src={originalAsset(sections[1]!.images[0]!.src)} alt="Steven & Alexandra Cohen Foundation" sizes="270px" /></div>
    </section>

    <section className={`${styles.section} ${styles.lavender} ${styles.split} ${styles.reverse}`} id="not-alone-program">
      <div className={styles.splitMedia}><SiteImage className={styles.icfLogo} src={originalAsset(sections[2]!.images[0]!.src)} alt="Inspiring Children Foundation" sizes="(max-width: 767px) 80vw, 434px" /></div>
      <div className={styles.splitText}>
        <p><strong>The Not Alone Program,</strong> which includes the <a href={`${icf}/notalone`}>Challenge,</a> Summit, and <a href="/awards/2026">Awards Show,</a> is produced by the <a href={`${icf}/home`}>Inspiring Children Foundation</a> (ICF) — a 501(c)(3) nonprofit that has spent the last 25 years helping at-risk youth facing financial hardship, anxiety, depression, and suicidal ideation, achieving tremendous outcomes.</p>
        <p>{sections[2]!.blocks[1]!.text}</p>
        <p>{sections[2]!.blocks[2]!.text}</p>
      </div>
    </section>

    <section className={`${styles.section} ${styles.sponsor}`}>
      <h3>Sponsored By</h3>
      <SiteImage className={styles.wynnLogo} src={originalAsset(sections[3]!.images[0]!.src)} alt="Wynn Resorts" sizes="327px" />
    </section>

    <section className={`${styles.section} ${styles.lavender} ${styles.leadership}`} id="co-chairs">
      <h2>Co-Chairs</h2>
      <div className={styles.leaderRow}>{coChairs.map(person => <Leader key={person.name} person={person} />)}</div>
      <div className={styles.hostRow}>
        {summitHost && <div><h2>Summit Host</h2><Leader person={summitHost} large /></div>}
        {awardsHost && <div><h2>Awards Host</h2><Leader person={awardsHost} large /></div>}
      </div>
    </section>

    <section className={`${styles.section} ${styles.featuring}`} aria-labelledby="classic-featuring">
      <SiteImage className={styles.featuringImage} src={originalAsset("https://images.squarespace-cdn.com/content/v1/628691b65c3a24383d0eac0a/8b90c68c-6294-42ba-98a7-993f0d2e15f3/Jewel+speaking+TWE+1+higher+res+edit.jpg")} alt="" fill sizes="100vw" />
      <div className={styles.featuringContent}>
        <h2 id="classic-featuring">Featuring:</h2>
        <ul>{featuring.map((item, index) => <li key={item}><h3 className={index % 2 === 0 ? styles.blue : undefined}><strong>{item}</strong></h3></li>)}</ul>
      </div>
    </section>

    <section className={`${styles.section} ${styles.lavender} ${styles.split} ${styles.venue}`} id="venue">
      <div className={styles.splitText}>
        <h3><strong>Located at </strong><a href="https://www.wynnlasvegas.com/" target="_blank" rel="noreferrer"><strong>Wynn Las Vegas</strong></a></h3>
        <p className={styles.large}><strong><em>{located[1]!.text}</em></strong></p>
        <p className={styles.large}>{located[2]!.text}</p>
        <ul className={styles.bullets}>{categories.map(item => <li key={item}><p>{item}</p></li>)}</ul>
      </div>
      <div className={styles.splitMedia}><SiteImage className={styles.wynnPhoto} src={originalAsset(sections[6]!.images[0]!.src)} alt="Exterior of Wynn Las Vegas" sizes="(max-width: 767px) 90vw, 601px" /></div>
    </section>

    {/* Owner (Sept 21): identical to ICF's page; on 2026 only the attendee sections are updated. */}
    {attendees}

    <section className={`${styles.section} ${styles.lavender} ${styles.leadership}`} id="producers">
      <h2>Executive Producers</h2>
      <div className={styles.leaderRow}>{executive.map(person => <Leader key={person.name} person={person} />)}</div>
      <h2>Producers</h2>
      <div className={styles.leaderRow}>{producers.map(person => <Leader key={person.name} person={person} large />)}</div>
    </section>

    <section className={`${styles.section} ${styles.thankYou}`} id="contact">
      <SiteImage className={styles.thankYouBackground} src={originalAsset(sections[14]!.images[0]!.src)} alt="" fill sizes="100vw" />
      <SiteImage className={styles.heartGraphic} src={originalAsset(sections[14]!.images[1]!.src)} alt="" sizes="303px" />
      <h4>{sections[14]!.blocks[0]!.text}</h4>
      <a className={styles.contactButton} href="/contact">Contact Us</a>
    </section>
  </main>;
}
