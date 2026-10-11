import Link from "next/link";
import { displayTitle2026, icfAlumni2026 } from "../lib/title-overrides-2026";
import { airtableTalent2026 } from "../lib/airtable-talent-2026";
import { RoleLines } from "./role-lines";
import { ArrowDown, ArrowUpRight, Play } from "lucide-react";
import type { EventSnapshot } from "@not-alone/validation";
import source from "../lib/original-sites.json";
import { summit2025Leadership, summit2025Directory, summit2025Recap, ownerApprovedCoChairs2026 } from "../lib/content";
import { directoryPeople } from "../lib/people";
import { originalAsset } from "../lib/original-assets";
import { awardsDate, awardsHeroTimes, publicAwardsShow, awardsPromotionalProgram } from "../lib/awards-program";
import { isPostEvent, postEventLabel } from "../lib/event-phase";
import { awards2026Editorial, awards2026Evening, awards2026Program, awards2025Winners, awards2025WinnersSource } from "../lib/awards-editorial";
import { awardsDisplayPeople, awardsPeople } from "../lib/awards-people";
import { archiveSlug } from "../app/directory/[slug]/archive-profile";
import { producerCredits2026 } from "@not-alone/config";
import { personNameKey as normalizePersonName, updatedPortrait } from "../lib/person-portraits";
import { airtableOverlay } from "../lib/airtable-shared";
import { Directory } from "./directory";
import { AwardsHighlights } from "./awards-highlights";
import { AwardsGuestDirectory } from "./awards-guest-directory";
import { getSiteImageMetadata, SiteImage } from "./site-image";
import { CurrentEventUpdates } from "./current-event-updates";
import { ScheduleBrowser } from "./schedule-browser";
import { groupPublishedProgramByDay } from "@not-alone/domain";
import styles from "./original-event-page.module.css";
import { HeroRecap, SummitVideo } from "./summit-video";
import { HighlightsVideo } from "./highlights-video";
import { AwardsInfoButton } from "./awards-info-button";
import { PresentedBy } from "./presented-by";
import { PoweredBy } from "./powered-by";
import { awardsDoorsOpen2026, awardsShowStart2026 } from "../lib/event-partners-2026";
import summitStyles from "./summit-theme.module.css";
import { EventPartners } from "./event-partners";
import { summitNarrative2026 } from "../lib/summit-narrative-2026";
import { applyProducerCreditRules } from "../lib/producer-credits-2026";

type SourceSection = (typeof source.summit.sections)[number];
function localSections(sections: SourceSection[]): SourceSection[] {
  return sections.map(section => ({ ...section,
    images: section.images.map(image => ({ ...image, src: originalAsset(image.src) })),
    people: section.people.map(person => ({ ...person, image: originalAsset(person.image) }))
  }));
}
const summit = localSections(source.summit.sections);
// Inaugural Summit dates as reported (Wynn Las Vegas, November 10-13, 2025).
const summit2025Dates = "November 10–13, 2025";
// Owner (Sept 21): the hero already shows the year as its gold label, so the date beside it omits it.
const withoutYear = (label: string, year: number) => label.replace(new RegExp(`,?\\s*${year}\\b`), "").trim();
const awards = localSections(source.awards.sections);
const awardsRsvpUrl = awards2026Editorial.rsvpUrl;
// Owner (Sept 23): the Awards page's "Producer" credits (singular heading), above "Producers".
const awardsProducer2026 = [{ name: "Ryan Oz", role: "" }, { name: "Deb Cullen", role: "" }];
const confirmedOriginalAliases = new Map<string, string[]>([
  ["alex cohen", ["alexandra cohen"]],
  ["steven and alexandra cohen", ["steven cohen", "alexandra cohen"]],
  ["bob and mike bryan", ["bob bryan", "mike bryan"]],
  ["melinda and noah springer", ["melinda springer", "noah springer"]],
  ["sean and ana wolfington", ["sean wolfington", "ana wolfington"]],
  ["janet and steve wozniak", ["janet wozniak", "steve wozniak"]],
  ["jen smorgon", ["jennifer smorgon"]],
  ["jennifer smorgon", ["jen smorgen"]],
  ["darryl mcdaniels", ["darryl mcdaniels dmc"]],
  ["daniel h gillison", ["daniel gillison"]],
  ["daniel h gillison jr", ["daniel gillison"]],
  ["wendy oliver pyatt", ["wendy oliver-pyatt"]],
  ["marc brackett", ["marc brackett"]],
  ["blaise aguirre", ["blaise aguirre"]],
  ["david eagleman", ["david eagleman"]],
  ["jon hershfield", ["jon hershfield"]],
  ["kevin hines", ["kevin hines"]],
  ["mike majlak", ["mike majlak"]]
]);

function isConfirmed2026OriginalPerson(name: string, confirmedNames: Set<string>) {
  const normalized = normalizePersonName(name);
  if (confirmedNames.has(normalized)) return true;
  return confirmedOriginalAliases.get(normalized)?.every(alias => confirmedNames.has(normalizePersonName(alias))) ?? false;
}

function uniquePeople(people: ReturnType<typeof directoryPeople>) {
  const seen = new Set<string>();
  return people.filter(person => {
    const key = normalizePersonName(person.name);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function YearNavigation({ year }: { year: 2025 | 2026 }) {
  return <nav className={styles.years} aria-label="Summit year">
    {([2026, 2025] as const).map(value => <Link key={value} aria-current={year === value ? "page" : undefined} href={value === 2025 ? "/2025" : "/"}>{value}{value === 2025 ? " archive" : ""}</Link>)}
    {/* Owner (Oct 5): the Summit links to the Awards in a new tab. */}
    <a href={`/awards/${year}`} target="_blank" rel="noopener">Awards</a>
    {year === 2026 && <Link href="/schedule">Event schedule</Link>}
  </nav>;
}

function Copy({ section }: { section: SourceSection }) {
  return <>{section.blocks.map((block, index) => block.tag.startsWith("h")
    ? <h2 key={index}>{block.text}</h2> : <p key={index}>{block.text}</p>)}</>;
}

// Archive intro keeps the exact source wording; only the quoted phrase gets the script face.
function Portraits({ section, awardsContext = false }: { section: SourceSection; awardsContext?: boolean }) {
  if (!section.people.length) return null;
  return <section className={`${styles.band} ${styles.portraitSection}`}><h2>{section.title}</h2>
    <div className={styles.portraits}>{section.people.map(person => {
      const card = <><SiteImage src={person.image} alt={person.name} sizes="(max-width: 600px) 44vw, (max-width: 900px) 30vw, (max-width: 1240px) 22vw, 280px" /><div><h3>{person.name}</h3><p>{person.role}</p></div></>;
      const hasProfile = ![source.summit.source, source.awards.source].includes(person.href.split("#")[0]!);
      return awardsContext ? <Link href={`/directory/${archiveSlug(person.name)}?from=awards`} prefetch={false} key={person.name} aria-label={`${person.name}, ${person.role}`}>{card}</Link> : hasProfile ? <a href={person.href} key={person.name} aria-label={`${person.name}, ${person.role}`}>{card}</a> : <article key={person.name}>{card}</article>;
    })}</div>
  </section>;
}

function AwardCategories() {
  const categories = awards[11]!.blocks.slice(1);
  return <div className={styles.categories}>{categories.filter((_, index) => index % 2 === 0).map((block, index) => <article key={block.text}><h3>{block.text}</h3><p>{categories[index * 2 + 1]?.text}</p></article>)}</div>;
}

// summitLinks (Ryan, Oct 8: every face opens a bio): the Summit co-chair cards link to the Summit-context profile.
type LeadershipProps = { producers?: boolean; chairsOnly?: boolean; hostsOnly?: boolean; confirmedNames?: Set<string>; awardsProfiles?: ReturnType<typeof awardsPeople>; summitLinks?: boolean };

function currentCoChairNames(snapshot: EventSnapshot | null, confirmedNames: Set<string>) {
  const names = new Set(confirmedNames);
  if (!snapshot?.event.directoryEnabled || !names.size) return names;
  for (const name of ownerApprovedCoChairs2026) {
    const key = normalizePersonName(name);
    const records = snapshot.speakers.filter(person => person.eventId === snapshot.event.id && normalizePersonName(person.name) === key);
    // Credit approval is separate from attendance; honor an explicitly hidden record.
    if (!records.length || records.some(person => person.published)) names.add(key);
  }
  return names;
}

function coChairRole2026(name: string, role: string): string {
  if (!icfAlumni2026.has(normalizePersonName(name))) return role;
  const recorded = airtableTalent2026.find(person => normalizePersonName(person.name) === normalizePersonName(name))?.title;
  return displayTitle2026(name, recorded || "");
}

function leadershipGroups({ producers = false, chairsOnly = false, hostsOnly = false, confirmedNames }: LeadershipProps) {
  const all = producers ? summit2025Directory.filter(group => /Producers/.test(group.title)) : summit2025Leadership;
  const images = summit[producers ? 13 : 4]!.images;
  let position = 0;
  // Photo positions follow ICF's section order, so they are assigned before any group is left out.
  return all.map(group => ({ ...group,
    // 2025 archive credits keep ICF's own photos exactly; newer owner-approved portraits apply to 2026 only.
    // Oct 11 (owner): on the 2026 pages an ICF alumnus shows "ICF Alumni" with their Airtable title underneath
    // (Cherrial's co-chair card), as everywhere else; the 2025 archive keeps ICF's own wording.
    people: group.people.map(person => { const source = images[position++]!.src; return { ...person, role: confirmedNames ? coChairRole2026(person.name, person.role) : person.role, image: (confirmedNames && updatedPortrait(person.name)) || source }; })
      .filter(person => !confirmedNames || isConfirmed2026OriginalPerson(person.name, confirmedNames))
  })).filter(group => (!chairsOnly || group.title === "Co-Chairs") && (!hostsOnly || group.title !== "Co-Chairs"))
    .filter(group => group.people.length > 0);
}

// Owner (Sept 22): the Summit page lists its hosts (Jason Kennedy as Summit host, with Loni Love) at the
// bottom, after the producers. A host can also appear elsewhere (Jason is a keynote too).
const hostRoles2026: Record<string, string> = { "jason kennedy": "Summit Host", "loni love": "Awards Host" };
function Hosts2026({ profiles }: { profiles: ReturnType<typeof awardsPeople> }) {
  const hosts = Object.keys(hostRoles2026).map(key => profiles.find(person => normalizePersonName(person.name) === key)).filter((person): person is NonNullable<typeof person> => Boolean(person && person.image));
  if (!hosts.length) return null;
  return <section className={`${styles.band} ${styles.leadership}`} id="hosts">
    <div><h2>Hosts</h2><div className={styles.leaders}>
      {hosts.map(person => <article key={person.slug}><Link href={`/directory/${encodeURIComponent(person.slug)}`} prefetch={false} aria-label={`Meet ${person.name}`}>
        <SiteImage src={person.image!} alt={person.name} sizes="(max-width: 600px) 230px, 250px" /><h3>{person.name}</h3><p>{hostRoles2026[normalizePersonName(person.name)]}</p>
      </Link></article>)}
    </div></div>
  </section>;
}

function Leadership(props: LeadershipProps) {
  const groups = leadershipGroups(props);
  if (!groups.length) return null;
  const { producers = false } = props;
  return <section className={`${styles.band} ${styles.leadership}`} id={producers ? "producers" : props.hostsOnly ? "hosts" : "leadership"}>
    {groups.map(group => {
      // Owner (Oct 4): in the producer credits only Executive Producers keep headshots; Producers are name cards.
      const photos = !(producers && group.title === "Producers");
      return <div key={group.title}><h2>{group.title}</h2><div className={photos ? styles.leaders : styles.creditNames}>
      {group.people.map(person => {
        const profile = props.awardsProfiles?.find(profile => normalizePersonName(profile.name) === normalizePersonName(person.name));
        const card = <>{photos && <SiteImage src={person.image} alt={person.name} sizes="(max-width: 600px) 230px, 250px" />}<h3>{person.name}</h3><p><RoleLines text={person.role} /></p></>;
        return <article key={person.name}>{profile ? <Link href={`/directory/${encodeURIComponent(profile.slug)}${props.summitLinks ? "" : "?from=awards"}`} prefetch={false} aria-label={`Meet ${person.name}`}>{card}</Link> : card}</article>;
      })}
    </div></div>;
    })}
  </section>;
}

// 2026 production credits (NAS web meeting, Sept 21): Producers first, then Executive Producers.
// Photos and one-line descriptions are ICF's own; only confirmed people are shown.
function ProducerCredits2026({ confirmedNames, profiles, awardsContext = false, snapshot = null }: { confirmedNames: Set<string>; profiles: ReturnType<typeof awardsPeople>; awardsContext?: boolean; snapshot?: EventSnapshot | null }) {
  const section = summit[13]!;
  const heads = section.blocks.filter(block => block.tag === "h4").map(block => block.text);
  const described = (name: string) => section.blocks[section.blocks.findIndex(block => block.tag === "h4" && block.text === name) + 1]?.text ?? "";
  const live = airtableOverlay(snapshot)?.people;
  // Airtable connected: Executive Producers (with photos), then Co-Producers and Associate Producers by
  // name only (meeting: no photos below co-producer level). Otherwise the Sept 21 meeting credits.
  const groups: { title: string; photos: boolean; people: { name: string; role: string; image?: string | undefined }[] }[] = live
    // Owner (Sept 21): no photos after Executive Producers for now.
    ? (["Executive Producers", "Producers", "Co-Producers", "Associate Producers"] as const).map(title => ({ title, photos: title === "Executive Producers",
      // A-Talent first, then Airtable's own order (the owner's ranking), as in every other category.
      people: [...live.values()].filter(person => person.categories.includes(title))
        .sort((a, b) => Number(b.featured) - Number(a.featured) || a.rank - b.rank).map(person => {
        const profile = profiles.find(entry => normalizePersonName(entry.name) === normalizePersonName(person.name));
        return { name: person.name, role: person.title || person.occupation, image: profile?.image };
      }) }))
    // Owner (Oct 4): headshots only for Executive Producers; every other producer credit is a name card.
    : (["Producers", "Executive Producers"] as const).map(title => ({ title, photos: title === "Executive Producers",
      people: producerCredits2026.filter(person => person.category === title && confirmedNames.has(normalizePersonName(person.name)))
        .map(person => ({ name: person.name, role: described(person.name), image: section.images[heads.indexOf(person.name)]?.src })) }));
  // Owner (Sept 23, Awards site): a "Producer" heading (singular) for Ryan Oz and Deb Cullen sits above
  // "Producers"; neither has a usable photo yet (Airtable has none), so they are name cards until one arrives.
  // Airtable spells her "Deb Cullen" (Co-Producer); "Ryan Oz" is the owner's spelling, to be confirmed.
  if (awardsContext) {
    const producer = awardsProducer2026.map(person => ({ name: person.name, role: person.role, image: profiles.find(entry => normalizePersonName(entry.name) === normalizePersonName(person.name))?.image }));
    const producerNames = new Set(producer.map(person => normalizePersonName(person.name)));
    for (const group of groups) group.people = group.people.filter(person => !producerNames.has(normalizePersonName(person.name)));
    const at = groups.findIndex(group => group.title === "Producers");
    groups.splice(at === -1 ? groups.length : at, 0, { title: "Producer", photos: false, people: producer });
  }
  // Ryan (Oct 8): Raquelle Stevens credited as a Producer (Airtable source), Ryan off the credits, every group
  // alphabetical by surname (lib/producer-credits-2026.ts).
  const shown = applyProducerCreditRules(groups, live).filter(group => group.people.length);
  if (!shown.length) return null;
  const imageFor = (image: string) => getSiteImageMetadata(image)
    ? (alt: string) => <SiteImage src={image} alt={alt} sizes="(max-width: 600px) 230px, 250px" />
    : (alt: string) => <img src={image} alt={alt} loading="lazy" decoding="async" width={250} height={250} />;
  return <section className={`${styles.band} ${styles.leadership}`} id="producers">
    {shown.map(group => <div key={group.title}><h2>{group.title}</h2><div className={group.photos ? styles.leaders : styles.creditNames}>
      {group.people.map(person => {
        const profile = profiles.find(entry => normalizePersonName(entry.name) === normalizePersonName(person.name));
        const card = <>{group.photos && person.image && imageFor(person.image)(person.name)}<h3>{person.name}</h3>{person.role && <p><RoleLines text={person.role} /></p>}</>;
        return <article key={person.name}>{profile ? <Link href={`/directory/${encodeURIComponent(profile.slug)}${awardsContext ? "?from=awards" : ""}`} prefetch={false} aria-label={`Meet ${person.name}`}>{card}</Link> : card}</article>;
      })}
    </div></div>)}
  </section>;
}

export function OriginalSummitPage({ year, snapshot = null }: { year: 2025 | 2026; snapshot?: EventSnapshot | null }) {
  const archive = year === 2025;
  const venue = snapshot?.event.venueName;
  const reviewedPeople = uniquePeople(awardsDisplayPeople(snapshot));
  const confirmedNames = new Set(reviewedPeople.map(person => normalizePersonName(person.name)));
  const coChairNames = currentCoChairNames(snapshot, confirmedNames);
  // Owner (Sept 21): co-chairs and producers also appear in their other categories (e.g. Jewel in Musicians).
  const guests = reviewedPeople;
  // Owner (Sept 21): the hero shows only the main Summit dates.
  const heroDates = { main: (snapshot?.event.dateLabel ?? "").split(" · ")[0] || "2026 dates to be announced" };
  return <main id="main-content" tabIndex={-1} className={`${styles.page} ${archive ? "" : styles.refined} ${summitStyles.summit}`}>
    {!archive && <CurrentEventUpdates snapshot={snapshot} initialNowUtc={new Date().toISOString()} />}
    {/* Owner (Sept 21): same hero format as the Awards site (logo, larger foundation credit, date and
        venue, one action), over the 2025 Summit recap with its Villa Bibbiani segments skipped. */}
    <section className={`${summitStyles.hero} ${summitStyles.heroFormat}${archive ? "" : ` ${summitStyles.heroWithCorner}`}`} aria-labelledby="summit-title">
      <SummitVideo background />
      <div className={summitStyles.heroCopy}>
        {/* Owner (Oct 8): a two-line date block above the logo, about the width of the stack below it: the dates in bold
            white, the venue in pearl spaced capitals. From Nov 6, 2026 it reads "2027 — To Be Announced Soon." 2026 only. */}
        {!archive && <p className={`${summitStyles.heroDate} ${summitStyles.heroEyebrow} ${summitStyles.heroEyebrowTop}`}>{isPostEvent() ? postEventLabel : <><span className={summitStyles.heroEyebrowDate}>{withoutYear(heroDates.main, year).replace("-", "–")}, {year}</span><span className={summitStyles.heroDateVenue}>{venue ?? "Venue to be announced"}</span></>}</p>}
        <h1 id="summit-title" className={summitStyles.heroLogo}>
          <SiteImage src="/images/summit-logo.png" alt="" sizes="(max-width: 600px) 170px, 250px" loading="eager" fetchPriority="high" />
          <span className={styles.hidden}>Not Alone Summit {year}</span>
        </h1>
        {/* Owner (Oct 8): the credit is a compact stack, "Powered by" over "Steven & Alexandra" / "Cohen Foundation". */}
        <PoweredBy className={summitStyles.heroPowered} />
        {/* Owner (Oct 7 meeting): "Presented by" Inspiring Children Foundation × NAMI directly under the Cohen credit
            (Summit logo -> Powered by -> Presented by); 2026 only. */}
        {!archive && <PresentedBy size="hero" />}
        {/* Owner (Sept 23): date and venue on one line, in the Awards hero's format ("November 2–4 | Wynn Las Vegas");
            from Nov 6, 2026 the 2026 page reads "2027 — To Be Announced Soon." by itself (lib/event-phase.ts). */}
        {archive && <p className={summitStyles.heroDate}><span className={summitStyles.heroEdition}>{year}</span>{withoutYear(summit2025Dates, year)}<span className={summitStyles.heroDateVenue}> | Wynn Las Vegas</span></p>}
        {/* Owner (Oct 8): the hero ends on the Presented-by lockup. */}
      </div>
      {/* Ryan (Oct 9 call): on computers the dates and venue sit in the hero's bottom-right corner with the Schedule
          button on top of them; on phones they stay at the top of the stack (the eyebrow above the logo). 2026 only. */}
      {!archive && <div className={summitStyles.heroCorner}>
        <a className={summitStyles.heroCornerButton} href="#schedule">Schedule</a>
        <p className={`${summitStyles.heroDate} ${summitStyles.heroEyebrow} ${summitStyles.heroCornerDate}`}>{isPostEvent() ? postEventLabel : <><span className={summitStyles.heroEyebrowDate}>{withoutYear(heroDates.main, year).replace("-", "–")}, {year}</span><span className={summitStyles.heroDateVenue}>{venue ?? "Venue to be announced"}</span></>}</p>
      </div>}
    </section>
    {/* Owner (Sept 21): the recap player is removed for now; it will move to a new location. */}
    {/* Owner (Sept 21): ICF-style two-column introduction (bold heading and rich text; Not Alone logo
        carrying the Cohen Foundation credit), without the Davos quote or Villa Bibbiani. */}
    {archive ? <section className={`${styles.band} ${summitStyles.introSplit}`} id="about">
      <div className={summitStyles.introText}>
        <h2>A National Convening for <span className={summitStyles.introAccent}>Mental Health</span> and Connection</h2>
        <p>Building on the success of <a href="https://www.inspiringchildren.org/notalone"><strong>NotAloneChallenge.org</strong></a>, the Inspiring Children Foundation launched the <strong>Not Alone Summit</strong>, powered by the <strong>Steven &amp; Alexandra Cohen Foundation</strong>, hosted at <strong>Wynn Las Vegas.</strong> The Not Alone Summit is a premier national convening designed to bring together leading CEOs, artists, athletes, philanthropists, clinicians, researchers, and youth ambassadors to advance emotional and mental health.</p>
        <p>{summit[1]!.blocks[2]!.text}</p>
      </div>
      <div className={summitStyles.introBrand}>
        <SiteImage className={summitStyles.introLogo} src="/images/na-summit-logo-black-2.png" alt="Not Alone Summit" sizes="(max-width: 900px) 200px, 260px" />
        <p className={summitStyles.introPowered}>Powered by<strong>Steven &amp; Alexandra Cohen Foundation</strong></p>
      </div>
    </section>
    /* Ryan (Oct 8): on the 2026 page the introduction is just the headline, "real nice and thin" (the logo and the
       repeated "Powered by" credit are gone — "we don't need to re-say that"), then straight into Who's Coming. */
    : <section className={`${styles.band} ${summitStyles.introThin} ${summitStyles.introBar}`} id="about">
      {/* Owner (Oct 8): the band holds the headline alone, with tight padding; the dates and venue sit at the top of the
          hero and the schedule is reached from the menu. */}
      <h2>A National Convening for <span className={summitStyles.introAccent}>Mental Health</span> and Connection</h2>
    </section>}
    {/* Owner (Sept 21): co-chairs sit just above the producers on every site; 2025 hosts keep their place. */}
    {archive && <Leadership hostsOnly />}
    <div id={archive ? "directory" : undefined} className={archive ? `directorySection ${summitStyles.archiveDirectory}` : undefined}>{archive ? <><div className="sectionHeading"><p className="eyebrow">2025 Summit</p><h2>Meet Our Guests</h2></div>{summit.slice(7, 13).map(section => <Portraits key={section.id} section={section} />)}</> : <>
      <Directory people2026={guests} available={snapshot?.event.directoryEnabled ?? false} simplified />
    </>}</div>
    {/* Ryan (Oct 8): the narrative paragraph and the Goals come after Who's Coming (Founders, then Attendees): the
        paragraph on its own, the Goals in a blue band with large white type, then Jewel's quote, then Our Partners. */}
    {!archive && <section className={`${styles.band} ${summitStyles.narrativeBand}`} id="about-summit" aria-label="About the Not Alone Summit">
      {/* Owner (Oct 8): the paragraph reads as an opening statement — left-aligned on a narrow measure, its opening phrase
          (up to the first dash) in bold Summit blue; the words are Ryan's, unchanged. */}
      {summitNarrative2026.intro.map(paragraph => { const cut = paragraph.indexOf("—"); return <p key={paragraph.slice(0, 24)}>{cut > 0 ? <><strong className={summitStyles.narrativeLede}>{paragraph.slice(0, cut)}</strong>{paragraph.slice(cut)}</> : paragraph}</p>; })}
    </section>}
    {!archive && <section className={`${styles.band} ${summitStyles.goalsBand}`} id="goals" aria-labelledby="summit-goals-title">
      <h2 id="summit-goals-title">{summitNarrative2026.goalsHeading}</h2>
      {/* Owner (Oct 8): the five goals run across the band as equal columns (number, thin rule, goal); a left-aligned list
          with a number column on phones. */}
      <ol>{summitNarrative2026.goals.map((goal, index) => <li key={goal}><span className={summitStyles.goalNumber} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><span className={summitStyles.goalText}>{goal}</span></li>)}</ol>
    </section>}
    {!archive && <section className={`${styles.band} ${summitStyles.pullQuote}`} id="jewel-quote" aria-label="Quote from Jewel">
      <blockquote><p>“{summitNarrative2026.quote.text}”</p><footer>—{summitNarrative2026.quote.attribution}</footer></blockquote>
    </section>}
    {!archive && <EventPartners tone="light" id="summit-partners" />}
    {/* Owner (Sept 21): the 2025 highlight film, big, on the page (play button, no trip to YouTube). */}
    <HighlightsVideo video="summit" />
    {/* Owner (Sept 21, late): the schedule sits right above the co-chairs. */}
    {!archive && snapshot && <section className={`${styles.band} ${summitStyles.scheduleBand}`} id="schedule" aria-labelledby="summit-schedule-title">
      <h2 id="summit-schedule-title">Schedule</h2>
      <p className={summitStyles.scheduleDates}>{heroDates.main} · {snapshot.event.venueName}</p>
      <ScheduleBrowser days={groupPublishedProgramByDay(snapshot)} eventTimeZone={snapshot.event.timeZone} initialNowUtc={new Date().toISOString()} />
    </section>}
    {/* Owner (Sept 22): hosts sit just above the co-chairs. */}
    {!archive && <Hosts2026 profiles={reviewedPeople} />}
    <Leadership {...(archive ? { chairsOnly: true } : { chairsOnly: true, confirmedNames: coChairNames, awardsProfiles: reviewedPeople, summitLinks: true })} />
    {archive ? <Leadership producers /> : <ProducerCredits2026 confirmedNames={confirmedNames} profiles={reviewedPeople} snapshot={snapshot} />}
    {!archive && <>
      <section className={`${styles.band} ${styles.foundation} ${summitStyles.programFooter}`} id="not-alone-program"><SiteImage src={summit[2]!.images[0]!.src} alt="Inspiring Children Foundation" sizes="220px" /><div>
        <h2>This Summit is part of the Not Alone Program</h2>
        {/* Ryan (Oct 8): the program statement, word for word. */}
        <p>{summitNarrative2026.programStatement}</p>
        <div className={summitStyles.programLinks}>
          <a className={styles.action} href={awards2026Program.challengeUrl} target="_blank" rel="noreferrer">Join the Not Alone Challenge <ArrowUpRight size={17} aria-hidden="true" /></a>
          <a className={styles.textAction} href={awards2026Program.toolkitUrl} target="_blank" rel="noreferrer">Get the free Not Alone toolkit <ArrowUpRight size={17} aria-hidden="true" /></a>
        </div>
      </div></section>
      {/* Ryan (Oct 8): "No solicitation, only connection" sits at the bottom of the page. */}
      <section className={`${styles.band} ${summitStyles.noSolicitation}`} id="no-solicitation" aria-labelledby="summit-no-solicitation-title"><h2 id="summit-no-solicitation-title">{awards2026Program.noSolicitation.title}</h2><p>{awards2026Program.noSolicitation.body}</p></section>
    </>}
    <section className={`${styles.band} ${styles.closing}`} id="rsvp"><SiteImage src={summit[14]!.images[1]!.src} alt="" sizes="250px" /><h2>Thank you for your interest!</h2><p>{archive ? "Explore the 2025 Not Alone Awards and the people behind the gathering." : "Please contact us to inquire about attendance."}</p>{archive ? <a href="/awards/2025" className={styles.action} target="_blank" rel="noopener">2025 Not Alone Awards</a> : <Link href="/contact" className={styles.action}>Contact Us</Link>}</section>
  </main>;
}

// rsvpUrl (owner, Oct 4): the private partner copies of this page (/nami, /lakelasvegas, ...) send their RSVP
// buttons to that group's own form; everything else is identical.
type AwardsPageProps = { year: 2025 | 2026; program?: EventSnapshot["contentPages"][number] | null; snapshot?: EventSnapshot | null; rsvpUrl?: string | undefined };

// Owner (Oct 11): the Awards hero date and venue are split at their first separator so phones can show the Summit's
// two-line format (the separator stays in the first part for ", " and is its own span for " · ").
function StackedParts({ text, split, className }: { text: string; split: string; className?: string | undefined }) {
  const at = text.indexOf(split);
  if (at === -1) return <>{text}</>;
  const keep = split.trim() === "," ? "," : "";
  // Owner (Oct 11): on phones the first part ("Monday," / "Encore Theater") is left out so the corner reads exactly like
  // the Summit's — "NOVEMBER 2, 2026" over "WYNN LAS VEGAS" at the same sizes.
  return <><span className={`${className ?? ""} ${styles.cornerFirst}`}>{text.slice(0, at)}{keep}</span>{keep ? " " : <span className={styles.cornerSep}>{split}</span>}<span className={className}>{text.slice(at + split.length)}</span></>;
}

function CurrentAwardsPage({ program, snapshot = null, rsvpUrl = awardsRsvpUrl }: Omit<AwardsPageProps, "year">) {
  const reviewedPeople = awardsPeople(snapshot);
  const displayPeople = awardsDisplayPeople(snapshot);
  const confirmedNames = new Set(reviewedPeople.map(person => normalizePersonName(person.name)));
  const coChairNames = currentCoChairNames(snapshot, confirmedNames);
  const available = snapshot?.event.directoryEnabled ?? false;
  const show = publicAwardsShow(snapshot);
  const canceled = show?.status === "canceled";
  const date = canceled ? "Awards Show canceled" : show ? awardsDate(show) : "Date to be confirmed";
  const publishedRoom = show?.locationName && !/to be confirmed|pending|tbc|tbd/i.test(show.locationName) ? show.locationName : null;
  // Airtable's room for the show is "Encore Theater"; the public venue line keeps the resort ("Encore Theater at Wynn Las Vegas").
  const venue = publishedRoom && !/^encore theater$/i.test(publishedRoom.trim()) ? publishedRoom
    : (snapshot?.event.venueName && !/wynn las vegas/i.test(snapshot.event.venueName) ? snapshot.event.venueName : awards2026Editorial.venue);
  const approvedProgram = program?.published ? program : null;
  const programBody = approvedProgram ? awardsPromotionalProgram(approvedProgram.body, snapshot) : null;
  // Owner (Sept 21, late): "The Evening" shows exactly these two lines.
  const eveningTimes = canceled ? [] : awards2026Evening;
  const host = reviewedPeople.find(person => person.name === awards2026Editorial.host);
  return <main id="main-content" tabIndex={-1} className={`${styles.page} ${styles.awards} ${styles.currentAwards}`}>
    <section className={`${styles.awardsHero} ${styles.awardsHeroStack}`} id="awards-program" aria-labelledby="awards-title">
      <SiteImage className={styles.heroScene} src="/images/wynn-las-vegas.webp" alt="Wynn Las Vegas overlooking its gardens and waterfall" sizes="100vw" loading="eager" fetchPriority="high" />
      {/* Owner (Sept 21): the hero goes straight into the 2025 Awards highlights; the Wynn photo is kept
          only for visitors who ask their device to reduce motion. */}
      <HeroRecap video="awards" poster={null} className={styles.heroVideo} />
      {/* Owner (Oct 8): the Summit hero's format, exactly — one left-hand stack: a two-line date block (bold white date,
          venue in spaced capitals), the Awards logo, the Cohen credit, then the Inspiring Children Foundation × NAMI
          lockup. Nothing else; the hero is only as tall as its stack. From Nov 6, 2026 the date block reads
          "2027 — To Be Announced Soon." (lib/event-phase.ts). */}
      <div className={`${styles.heroContent} ${styles.heroStack}`}>
        <h1 id="awards-title" className={styles.awardsLogo}>
          <SiteImage src="/images/na-awards-logo-white.png" alt="" sizes="(max-width: 600px) 180px, 250px" loading="eager" fetchPriority="high" />
          <span className={styles.hidden}>Not Alone Awards 2026</span>
        </h1>
        <PoweredBy className={styles.heroPowered} />
        <PresentedBy size="hero" />
      </div>
      {/* Owner (Oct 11): as on the Summit (Ryan, Oct 9), the date and venue sit in the bottom-right corner of the hero —
          on phones small and tucked under the stack, shrinking with the screen width. */}
      <div className={styles.awardsCorner}>
          <p className={`${styles.heroDate} ${styles.heroEyebrow} ${styles.awardsCornerDate}`}>{isPostEvent() ? postEventLabel : <>{show && !canceled
            ? <time className={styles.heroEyebrowDate} dateTime={show.startUtc}><StackedParts text={`${withoutYear(date, 2026)}, 2026`} split=", " className={styles.cornerPart} /></time>
            : <span className={styles.heroEyebrowDate}>{canceled ? date : `${withoutYear(date, 2026)}${/to be confirmed/i.test(date) ? "" : ", 2026"}`}</span>}
            <span className={styles.heroDateVenue}><StackedParts text={venue.replace(/ at /i, " · ")} split=" · " className={styles.cornerPart} /></span></>}</p>
      </div>
      {!/wynn las vegas/i.test(venue) && <div className={styles.heroFootnote}><p>Wynn Las Vegas · 2025 venue</p></div>}
    </section>
    {/* Ryan (Oct 8): the broadcast band carries the evening's details (date, doors and show time, RSVP + Info, the
        schedule link) and the iHeartRadio stream. Owner (Oct 8, approved): the Awards sentence is the band's headline —
        centred at the very top of the band (no rule above it), the opening phrase in bold gold — then one clearly asymmetric
        row: a compact details card on the left margin and the iHeartRadio block taking about two thirds on the right,
        its right edge on the page margin (never a mirror image). No separate sentence band. */}
    {/* Owner (Oct 8): the Awards sentence in its own band, right under the hero. */}
    <section className={`${styles.band} ${styles.awardsStatementBand}`} id="awards-honor" aria-label="About the Not Alone Awards">
      {(() => { const sentence = summitNarrative2026.awardsSentence; const cut = sentence.indexOf(",") + 1;
        return <p>{cut > 0 ? <><strong className={styles.awardsHonorLede}>{sentence.slice(0, cut)}</strong>{sentence.slice(cut)}</> : sentence}</p>; })()}
    </section>
    <section className={`${styles.band} ${styles.iheartBand}`} id="broadcast" aria-labelledby="broadcast-title">
      <div className={styles.broadcastDetails}>
        {/* Owner (Sept 23): from Nov 6, 2026 the date line reads "2027 — To Be Announced Soon." automatically. The venue
            is in the hero right above, so the card names the date only. */}
        <p className={styles.heroDate}>{isPostEvent() ? postEventLabel : show && !canceled ? <time dateTime={show.startUtc}>{withoutYear(date, 2026)}</time> : withoutYear(date, 2026)}</p>
        {/* Owner (Oct 7): doors and the show time (Aphrah's times); the rest of the evening is further down. */}
        {show && !canceled && <dl className={styles.heroScheduleTimes} aria-label="Doors and Awards Show start"><div><dt>Doors Open</dt><dd>{awardsDoorsOpen2026}</dd></div><div><dt>Awards Show</dt><dd>{awardsShowStart2026}</dd></div></dl>}
        {!canceled && show && !/to be confirmed/i.test(show.eligibilityScope.label) && <p className={styles.heroInvitation}>{show.eligibilityScope.label}</p>}
        <div className={styles.awardsActions}>
          {!canceled && <a className={styles.action} href={rsvpUrl} target="_blank" rel="noopener" aria-label="RSVP for the Not Alone Awards (opens in a new tab)">RSVP</a>}
          <AwardsInfoButton className={styles.infoButton}>Info</AwardsInfoButton>
        </div>
      </div>
      <div className={styles.broadcastStream}>
        <p className={styles.iheartKicker} id="broadcast-title">Broadcast live on</p>
        <img className={styles.iheartLogo} src="/images/iheartradio-logo-white.svg" alt="iHeartRadio" width={392} height={116} />
        <a className={styles.iheartStream} href={awards2026Editorial.iHeartUrl} target="_blank" rel="noreferrer" aria-label="Stream live on iHeartRadio's YouTube channel (opens in a new tab)">
          <Play size={20} fill="currentColor" aria-hidden="true" />Stream live on iHeartRadio
        </a>
      </div>
    </section>
    <AwardsGuestDirectory people={displayPeople} available={available} />
    {/* Owner (Sept 21): last year's mission statement (ICF's Awards page) stays here. Owner (Oct 7 meeting): its
        opening sentence now credits the presenters, in the owner's exact words. */}
    <section className={`${styles.band} ${styles.awardsIntroduction} ${styles.awardsMission}`} id="mission" aria-label="About the Not Alone Awards">
      <p>Inspiring Children Foundation × NAMI present the Not Alone Awards Show, powered by the <strong>Steven &amp; Alexandra Cohen Foundation</strong>.</p>
      {/* Owner (Sept 21, late): just the opening statement; the longer text is gone. */}
      {/* Owner (Oct 8): "The awards show", not "The award show" (2026 page only; the 2025 archive keeps ICF's text). */}
      {awards[1]!.blocks.slice(1, 2).map(block => <p key={block.text}>{block.text.replace(/^The award show\b/, "The awards show")}</p>)}
    </section>
    {/* Owner (Oct 8): The Evening section and the "View full schedule" link are gone — the schedule box in the broadcast
        band already carries the date, doors and show times. */}
    {/* Owner (Sept 21, late): the host sits below the Speakers. */}
    {host && !canceled && <section className={`${styles.band} ${styles.hostFeature}`} id="awards-host" aria-labelledby="awards-host-title">
      <h2 id="awards-host-title">Your 2026 Host</h2>
      <Link href={`/directory/${host.slug}?from=awards`} className={styles.hostProfile} aria-label={`Meet ${host.name}, your 2026 host`}>
        {host.image && (getSiteImageMetadata(host.image)
          ? <SiteImage src={host.image} alt={host.name} sizes="(max-width: 400px) calc(100vw - 40px), 360px" />
          : <img src={host.image} alt={host.name} width={360} height={360} loading="lazy" />)}
        <div className={styles.hostNameplate}>
          <h3>{host.name}</h3>
          <p>Comedian &amp; TV Host</p>
          <span className={styles.hostProfileAction}>Meet your host<ArrowUpRight size={17} aria-hidden="true" /></span>
        </div>
      </Link>
    </section>}
    <HighlightsVideo video="awards" tone="dark" />
    {/* Owner (Sept 21, late): the 2026 category list is gone; the page shows the 2025 awards, each with its
        recipient and (where the official announcement gives one) what the award recognizes. */}
    <section className={styles.band} id="winners" aria-labelledby="winners-title">
      <div className={styles.sectionTitle}><div><p className={styles.kicker}>The inaugural honorees</p><h2 id="winners-title">2025 Awards</h2></div></div>
      <div className={styles.categories}>{awards2025Winners.map(winner => <article key={winner.award}><h3>{winner.award}</h3><p className={styles.awardRecipient}>{winner.recipient}{"note" in winner && <span> · {winner.note}</span>}</p>{"description" in winner && <p>{winner.description}</p>}</article>)}</div>
      <a className={`${styles.action} ${styles.announcementButton}`} href={awards2025WinnersSource} target="_blank" rel="noreferrer">Read the official 2025 honoree announcement <ArrowUpRight size={18} aria-hidden="true" /></a>
    </section>
    {/* Owner (Sept 21, late): co-chairs and producers sit below the 2025 awards list. */}
    <Leadership chairsOnly confirmedNames={coChairNames} awardsProfiles={reviewedPeople} />
    <ProducerCredits2026 confirmedNames={confirmedNames} profiles={reviewedPeople} awardsContext snapshot={snapshot} />
    <section className={`${styles.band} ${styles.notAloneProgram}`} id="not-alone-challenge" aria-labelledby="challenge-title">
      <h2 id="challenge-title">Join the Not Alone Challenge</h2>
      <p>Take the Not Alone Challenge and get free access to the Not Alone mental fitness toolkit.</p>
      <div className={styles.programActions}>
        <a className={styles.action} href={awards2026Program.challengeUrl} target="_blank" rel="noreferrer">Join the Challenge <ArrowUpRight size={17} aria-hidden="true" /></a>
        <a className={styles.textAction} href={awards2026Program.toolkitUrl} target="_blank" rel="noreferrer">Get the free Not Alone toolkit <ArrowUpRight size={17} aria-hidden="true" /></a>
      </div>
    </section>
    <section className={`${styles.band} ${styles.policy}`} id="no-solicitation" aria-labelledby="no-solicitation-title"><h2 id="no-solicitation-title">{awards2026Program.noSolicitation.title}</h2><p>{awards2026Program.noSolicitation.body}</p></section>
  </main>;
}

export function OriginalAwardsPage({ year, program = null, snapshot = null, rsvpUrl }: AwardsPageProps) {
  if (year === 2026) return <CurrentAwardsPage program={program} snapshot={snapshot} rsvpUrl={rsvpUrl} />;
  // Owner (Sept 21): the 2025 archive uses the 2026 Awards format (logo hero over the 2025 highlights),
  // winners above the host, no-solicitation at the bottom, and no "registration closed" block.
  return <main id="main-content" tabIndex={-1} className={`${styles.page} ${styles.awards} ${styles.currentAwards}`}>
    <section className={styles.awardsHero} id="awards-program" aria-labelledby="awards-title">
      <SiteImage className={styles.heroScene} src="/images/wynn-las-vegas.webp" alt="Wynn Las Vegas overlooking its gardens and waterfall" sizes="100vw" loading="eager" fetchPriority="high" />
      <HeroRecap video="awards" poster={null} className={styles.heroVideo} />
      <div className={styles.heroContent}>
        <h1 id="awards-title" className={styles.awardsLogo}>
          <SiteImage src="/images/na-awards-logo-white.png" alt="" sizes="(max-width: 600px) 180px, 250px" loading="eager" fetchPriority="high" />
          <span className={styles.hidden}>Not Alone Awards {year}</span>
        </h1>
        <p className={styles.heroPowered}>Powered by<strong>{awards2026Editorial.foundation}</strong></p>
        <p className={styles.heroDate}><span className={styles.heroEdition}>2025</span><time dateTime="2025-11-12">Wednesday, November 12</time><span className={styles.heroDateVenue}> · Wynn Las Vegas</span></p>
      </div>
    </section>
    <section className={`${styles.band} ${styles.awardsIntroduction}`} id="mission">
      <p>{awards[1]!.blocks[1]!.text}</p>
    </section>
    <section className={styles.band} id="winners" aria-labelledby="winners-title"><div className={styles.sectionTitle}><div><p className={styles.kicker}>The inaugural honorees</p><h2 id="winners-title">2025 Award Winners</h2></div></div><div className={styles.categories}>{awards2025Winners.map(winner => <article key={winner.award}><p className={styles.kicker}>{winner.award}</p><h3>{winner.recipient}</h3>{"note" in winner && <p>{winner.note}</p>}</article>)}</div><a className={`${styles.action} ${styles.announcementButton}`} href={awards2025WinnersSource} target="_blank" rel="noreferrer">Read the official 2025 honoree announcement <ArrowUpRight size={18} aria-hidden="true" /></a></section>
    <div id="directory"><Portraits section={awards[3]!} awardsContext /></div>
    {awards.slice(5, 10).map(section => <Portraits key={section.id} section={section} awardsContext />)}
    <HighlightsVideo video="awards" tone="dark" />
    <Leadership producers />
    <section className={styles.band} id="award-categories"><div className={styles.sectionTitle}><div><p className={styles.kicker}>Honoring the pioneers</p><h2>2025 Awards</h2></div></div><AwardCategories /></section>
    <section className={`${styles.band} ${styles.policy}`} id="no-solicitation"><Copy section={awards[2]!} /></section>
  </main>;
}
