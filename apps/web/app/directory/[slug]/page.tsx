import Link from "next/link";
import { RoleLines } from "../../../components/role-lines";
import { titleOneLine } from "../../../lib/title-overrides-2026";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { originalProducerCredit, producerCredit2026 } from "@not-alone/config";
import { directoryPeople } from "../../../lib/people";
import { awardsDisplayPeople, awardsPeople, awardsBiographies } from "../../../lib/awards-people";
import { getSiteSnapshot } from "../../../lib/snapshot";
import { robotsForPage, siteMetadataPolicy } from "../../../lib/site-metadata";
import { archiveProfile } from "./archive-profile";
import { ProfilePortrait } from "./portrait";
import { CurrentEventUpdates } from "../../../components/current-event-updates";
import { ProfileBackLink } from "../../../components/profile-return";
import { awards2026Editorial } from "../../../lib/awards-editorial";
import { portraitAttribution2026 } from "../../../lib/portrait-overrides";
import styles from "./profile.module.css";

export const dynamic = "force-dynamic";

type ProfilePageProps = { params: Promise<{ slug: string }>; searchParams: Promise<{ from?: string | string[] }> };

// React cache is request-scoped: metadata and markup share one publication read,
// including an unavailable result, without retaining guest data across requests.
const getProfileSnapshot = cache(getSiteSnapshot);

function summitProfiles(snapshot: Awaited<ReturnType<typeof getSiteSnapshot>> | null) {
  const curated = awardsPeople(snapshot, { includeCohens: true });
  const displayed = awardsDisplayPeople(snapshot, { includeCohens: true });
  const groupedNames = new Set(displayed.filter(person => person.slug.startsWith("2026-")).flatMap(person => person.name === "Sean & Ana Wolfington" ? ["Sean Wolfington", "Ana Wolfington"] : person.name === "Melinda & Noah Springer" ? ["Melinda Springer", "Noah Springer"] : []));
  const profiles = [...directoryPeople(snapshot).filter(person => !groupedNames.has(person.name)).map(person => {
    const publicProfile = curated.find(candidate => candidate.slug === person.slug);
    return publicProfile ? { ...person, ...(["Caroline Silby", "Lexi Hensler", "Bob Bryan", "Mike Bryan"].includes(person.name) && publicProfile.image ? { image: publicProfile.image } : {}), bio: person.bio.trim() || publicProfile.bio } : person;
  }), ...displayed.filter(person => ["2026-sean-ana-wolfington", "2026-melinda-noah-springer"].includes(person.slug))];
  // Credits without a staff record (owner-approved co-chairs and ICF founders) are listed on the
  // Summit page too, so their profiles must resolve there.
  const slugs = new Set(profiles.map(person => person.slug));
  return [...profiles, ...displayed.filter(person => person.slug.startsWith("2026-") && !slugs.has(person.slug))];
}

export async function generateMetadata({ params, searchParams }: ProfilePageProps): Promise<Metadata> {
  const { slug } = await params;
  const fromAwards = (await searchParams).from === "awards";
  const context = fromAwards ? "Awards" : "Summit";
  const archived = slug.startsWith("2025-");
  const snapshot = archived ? null : await getProfileSnapshot();
  const unavailable = !archived && !snapshot?.event.directoryEnabled;
  const person = unavailable ? undefined : archived
    ? archiveProfile(slug, fromAwards ? "awards" : "summit")
    : (fromAwards ? awardsDisplayPeople(snapshot) : summitProfiles(snapshot)).find(person => person.slug === slug);

  if (!person) {
    return {
      title: { absolute: `${unavailable ? "Guest details temporarily unavailable" : "Profile not found"} | Not Alone Summit` },
      description: unavailable ? "Published guest details are temporarily unavailable. Please try again shortly." : "This profile is not available in the selected event directory.",
      robots: robotsForPage(false),
      alternates: { canonical: null },
      openGraph: null,
      twitter: null
    };
  }

  const { origin } = siteMetadataPolicy();
  const canonical = new URL(`/directory/${encodeURIComponent(person.slug)}`, origin);
  const awardsHost = !archived && fromAwards && person.name === awards2026Editorial.host;
  // Awards context selects its curated category, portrait and biography.
  if (fromAwards) canonical.searchParams.set("from", "awards");
  const title = `${person.name} | Not Alone ${archived ? `${context} 2025 Archive` : awardsHost ? "Awards 2026 Host" : `${context} 2026`}`;
  const description = archived
    ? `${person.name} in the 2025 Not Alone ${context} archive.${person.role.trim() ? ` ${person.role.trim()}` : ""}`
    : awardsHost ? "Meet Loni Love, host of the 2026 Not Alone Awards." : fromAwards ? `${person.name}: ${titleOneLine(person.role)}. View their biography in the 2026 Not Alone Awards directory.` : `Published 2026 Summit profile for ${person.name}. Summit attendance does not confirm an Awards appearance, performance, or honor.`;
  const images: { url: string; alt: string }[] = [];
  if (person.image) {
    try {
      const image = new URL(person.image, origin);
      if (image.protocol === "https:" && !image.username && !image.password) images.push({ url: image.toString(), alt: person.name });
    } catch {
      // A missing or malformed portrait must not prevent profile metadata.
    }
  }

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: canonical.toString() },
    robots: robotsForPage(true),
    openGraph: { type: "website", siteName: "Not Alone Summit and Awards", title, description, url: canonical.toString(), images },
    twitter: { card: "summary", title, description, images }
  };
}

export default async function PersonPage({ params, searchParams }: ProfilePageProps) {
  const { slug } = await params;
  const fromAwards = (await searchParams).from === "awards";
  const context = fromAwards ? "awards" : "summit";
  const archived = slug.startsWith("2025-");
  const currentDirectory = fromAwards ? "/awards/2026#directory" : "/#directory";
  const archiveDirectory = fromAwards ? "/awards/2025" : "/2025#directory";
  const snapshot = archived ? null : await getProfileSnapshot();
  if (!archived && !snapshot?.event.directoryEnabled) {
    return <main id="main-content" tabIndex={-1} className={`contentPage ${styles.page}${fromAwards ? ` ${styles.awards}` : ""}`}>
      {!fromAwards && <CurrentEventUpdates snapshot={snapshot} initialNowUtc={new Date().toISOString()} />}
      <h1>Guest details temporarily unavailable</h1><p>Please try again shortly. No unpublished information is displayed.</p><div className={styles.actions}><a href={`/directory/${encodeURIComponent(slug)}${fromAwards ? "?from=awards" : ""}`} className="primaryButton">Try again</a><Link href={currentDirectory} className="backLink">Back to 2026 {fromAwards ? "Awards " : ""}directory</Link></div>
    </main>;
  }
  const person = archived ? archiveProfile(slug, context) : (fromAwards ? awardsDisplayPeople(snapshot) : summitProfiles(snapshot)).find(person => person.slug === slug);
  if (!person) notFound();
  const returnToChairs = fromAwards && !archived && person.categories.includes("Co-Chairs");
  const returnToProduction = fromAwards && !archived && !returnToChairs && Boolean(archived ? originalProducerCredit(person.name) : producerCredit2026(person.name));
  const awardsHost = fromAwards && !archived && person.name === awards2026Editorial.host;
  const returnHref = archived ? archiveDirectory : returnToChairs ? "/awards/2026#leadership" : returnToProduction ? "/awards/2026#producers" : currentDirectory;
  // A freely licensed photo (Creative Commons) carries its required credit under the bio.
  const photoCredit = archived ? null : portraitAttribution2026(person.name, person.image);
  const normalizedRole = person.role.trim().replace(/\s+/g, " ").toLowerCase();
  const visibleCategories = person.categories.filter(category => {
    const label = category.trim().replace(/\s+/g, " ").toLowerCase();
    return label !== normalizedRole && label !== `${normalizedRole}s`;
  });
  return <main id="main-content" tabIndex={-1} className={`profilePage ${styles.page}${fromAwards ? ` ${styles.awards}` : ""}`}>
    {!archived && !fromAwards && <CurrentEventUpdates snapshot={snapshot} initialNowUtc={new Date().toISOString()} />}
    <ProfileBackLink href={returnHref}>Back to {person.year}{fromAwards ? " Awards" : ""} {returnToChairs ? "co-chairs" : returnToProduction ? "production" : archived && fromAwards ? "archive" : "directory"}</ProfileBackLink>
    <section className="profileHero" aria-labelledby="profile-name">
      <ProfilePortrait name={person.name} image={person.image} />
      <div><p className="eyebrow">{archived ? `2025 ${fromAwards ? "Awards" : "Summit"} archive` : awardsHost ? "2026 Awards Host" : fromAwards ? "2026 Awards" : "2026 Summit"}</p>
        <h1 id="profile-name">{person.name}</h1>
        {!awardsHost && visibleCategories.length > 0 && <p className={styles.categories}>{visibleCategories.join(" · ")}</p>}
        {(awardsHost || person.role.trim()) && <p className="profileRole">{awardsHost ? "Host, Not Alone Awards 2026" : <RoleLines text={person.role} />}</p>}
        {person.bio.trim() && <p className="profileBio">{person.bio}</p>}
        {photoCredit && <p className={styles.photoCredit}>Photo: <a href={photoCredit.href} target="_blank" rel="noreferrer">{photoCredit.label}</a></p>}
        {fromAwards && !archived && awardsBiographies[person.name] && !snapshot?.speakers.find(speaker => speaker.id === person.slug)?.bio.trim() && <a href={awardsBiographies[person.name]!.source}>Biography source</a>}
        {fromAwards && !archived && !awardsHost && <p className={styles.attendanceNote}>Confirmed Summit attendance does not confirm an Awards appearance, performance, or honor.</p>}
      </div>
    </section>
  </main>;
}
