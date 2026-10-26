"use client";

import Link from "next/link";
import { RoleLines } from "./role-lines";
import { Fragment, useState } from "react";
import type { PersonCategory, SummitPerson } from "../lib/people";
import { awardsGuestCategories, awardsPerson } from "../lib/awards-people";
import { isKeynote, peopleSections } from "../lib/people-sections";
import { EventPartners } from "./event-partners";
import { personInitials, personNameKey, portraitBackgroundStyle, portraitImageStyle } from "../lib/person-portraits";
import styles from "./awards-guest-directory.module.css";
import eventStyles from "./original-event-page.module.css";
import { getSiteImageMetadata, SiteImage } from "./site-image";

// Editorial display order only: this does not grant attendance or a show role.
const featuredNames = [
  "Anthony Ramos", "Darryl McDaniels (DMC)", "Caroline Jones", "Alana Springsteen",
  "Mike Tyson", "Jason Kennedy", "Bob Bryan", "Mike Bryan", "Lexi Hensler", "Brandon Saho",
  "Jewel", "Steve Wozniak", "Loni Love", "Mike Majlak", "David Eagleman",
  "Marc Brackett", "Kevin Hines"
];
const featuredOrder = new Map(featuredNames.map((name, index) => [personNameKey(name), index]));

export function orderAwardsGuests(people: SummitPerson[]) {
  // Airtable "A-Talent" first, then Airtable's own ranking (its list order), then the editorial order.
  return [...people].sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) ||
    (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER) ||
    (featuredOrder.get(personNameKey(a.name)) ?? featuredNames.length) - (featuredOrder.get(personNameKey(b.name)) ?? featuredNames.length)
    || a.name.localeCompare(b.name, "en", { sensitivity: "base" }));
}

function GuestPortrait({ person }: { person: SummitPerson }) {
  const [failedSource, setFailedSource] = useState<string>();
  return person.image && person.image !== failedSource
    ? <span className={styles.photoFrame} style={portraitBackgroundStyle(person.image)}>{getSiteImageMetadata(person.image)
      ? <SiteImage src={person.image} alt="" sizes="(max-width: 600px) 44vw, (max-width: 900px) 30vw, (max-width: 1240px) 22vw, 280px" style={portraitImageStyle(person.name, person.image)} onError={() => setFailedSource(person.image)} />
      : <img src={person.image} alt="" style={portraitImageStyle(person.name, person.image)} loading="lazy" decoding="async" width={500} height={500} onError={() => setFailedSource(person.image)} />}</span>
    : <span className={styles.portraitFallback} aria-hidden="true">{personInitials(person.name)}</span>;
}

function GuestName({ person, category }: { person: SummitPerson; category?: string }) {
  const role = (category && person.categoryRoles?.[category as keyof typeof person.categoryRoles]) || person.role;
  const genericRole = /^confirmed\s+2026\s+(?:summit\s+)?guest$/i.test(role.trim());
  return <div><h3>{person.name}</h3>{role && !genericRole && <p><RoleLines text={role} /></p>}</div>;
}

// Categories listed in the people sections (co-chairs and producers have their own sections).
const listed: PersonCategory[] = [...awardsGuestCategories, "Hosts", "Attendees"];

// foundingPartners (owner, Oct 4): the Community Day page leaves out the Founding Partners block because its own
// "Presented With Our Community Partners" section already shows them.
export function AwardsGuestDirectory({ people, available = true, foundingPartners = true }: { people: SummitPerson[]; available?: boolean; foundingPartners?: boolean }) {
  const seen = new Set<string>();
  const confirmed = available ? orderAwardsGuests(people.flatMap(person => {
    const selected = awardsPerson(person) ?? person;
    const key = personNameKey(person.name);
    if (!selected || !(isKeynote(selected) || listed.some(category => selected.categories.includes(category))) || seen.has(key)) return [];
    seen.add(key);
    return [selected];
  })) : [];

  return <section className={`${eventStyles.band} ${eventStyles.portraitSection} ${styles.section}`} id="directory" aria-labelledby="awards-guests-title">
    {/* Owner (Sept 21): festival-style lineup wording (lineup, more to be announced). */}
    <h2 id="awards-guests-title">The 2026 Lineup</h2>
    <p className={styles.announcement}>More talent and guests to be announced.</p>
    <div id="awards-directory-results">
      {/* Owner (Sept 21): Keynotes, Experts, Founders, Hosts, Musicians & Talent, Attendees; each person
          once (founders may also appear under Founders). */}
      {peopleSections(confirmed, "awards").map(({ title, heading, people: members }) => {
        // Owner (Sept 23): one grid of equal squares; a person without a photo gets a monogram square in
        // the same row order, so nothing sits alone or full-width.
        return <Fragment key={title}><section className={styles.category} aria-label={title}>{heading !== null && <h2>{heading ?? title}</h2>}
      {members.length > 0 && <div className={eventStyles.portraits} role="group" aria-label={`${title} with portraits`}>
        {members.map(({ person, role }) => <Link key={person.slug} href={`/directory/${encodeURIComponent(person.slug)}?from=awards`} prefetch={false} data-awards-guest={person.slug}>
          <GuestPortrait person={person} /><GuestName person={{ ...person, role }} />
        </Link>)}
      </div>}
        </section>{/* Owner (Sept 23 / Oct 5): the partner block right under the Founders section. */}{title === "Founders" && foundingPartners && <EventPartners tone="dark" id="awards-partners" />}</Fragment>;
      })}
      {/* Owner (Sept 22): no "+ More to be announced" line below the lineup; the note at the top already says it. */}
      {!confirmed.length && <p className={styles.empty}>{!available ? "The guest list is temporarily unavailable. Please try again shortly." : "Confirmed guest details will appear after event-team approval."}</p>}
    </div>
  </section>;
}
