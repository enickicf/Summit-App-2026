"use client";

import Link from "next/link";
import { Fragment, useId, useMemo, useState } from "react";
import { categories, type PersonCategory, type SummitPerson } from "../lib/people";
import { personInitials, portraitImageStyle } from "../lib/person-portraits";
import { AwardsGuestDirectory } from "./awards-guest-directory";
import { peopleSections } from "../lib/people-sections";
import { getSiteImageMetadata, SiteImage } from "./site-image";
import styles from "./directory.module.css";

function DirectoryPortrait({ person }: { person: SummitPerson }) {
  const [failedImage, setFailedImage] = useState<string>();
  return <div className="portrait" aria-hidden="true">{person.image && person.image !== failedImage
    ? getSiteImageMetadata(person.image)
      ? <SiteImage src={person.image} alt="" sizes="(max-width: 600px) 44vw, (max-width: 900px) 30vw, (max-width: 1240px) 22vw, 280px" onError={() => setFailedImage(person.image)} />
      : <img src={person.image} alt="" style={portraitImageStyle(person.name, person.image)} loading="lazy" decoding="async" width={500} height={500} onError={() => setFailedImage(person.image)} />
    : <span>{personInitials(person.name)}</span>}</div>;
}

export function Directory({ people2026, available = true, context = "summit", simplified = false }: { people2026: SummitPerson[]; available?: boolean; context?: "summit" | "awards"; simplified?: boolean }) {
  const [query, setQuery] = useState("");
  const resultsId = useId();
  const matchingPeople = useMemo(() => {
    if (!available) return [];
    const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
    return people2026.filter(person => person.year === 2026 && terms.every(term => `${person.name} ${person.role} ${person.categories.join(" ")}`.toLocaleLowerCase().includes(term)));
  }, [available, query, people2026]);
  // A person is listed in every category they hold; on the simplified Summit page co-chairs and
  // producers have their own sections, so only their other categories are listed here.
  // Owner (Sept 21): on the Summit page the people are listed as Keynotes, Experts, Founders, Hosts,
  // Musicians & Talent and Attendees, each person once (founders may also appear under Founders);
  // co-chairs and producers have their own sections.
  const groups = useMemo(() => simplified
    ? peopleSections(matchingPeople).map(({ title, heading, people }) => ({ category: (heading ?? title) as string, people: people.map(({ person, role }): SummitPerson => { const { categoryRoles: _roles, ...rest } = person; return { ...rest, role }; }) }))
    : categories.map((category) => ({
      category: category as string,
      people: matchingPeople.filter((person) => (person.categories.length ? person.categories : ["Attendees"]).includes(category))
        .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || (a.order ?? 99) - (b.order ?? 99))
    })).filter((group) => group.people.length), [matchingPeople, simplified]);
  const groupId = (category: string) => `${resultsId}-${category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  if (context === "awards") return <AwardsGuestDirectory people={people2026.filter(person => person.year === 2026)} available={available} />;

  return (
    <section className={`directorySection ${styles.directory}${simplified ? ` ${styles.simplified}` : ""}`} id="directory">
      <div className="sectionHeading">{!simplified && <p className="eyebrow">2026 Summit</p>}<h2>{simplified ? "Who's Coming" : "Meet Our Guests"}</h2>{simplified && <p className={styles.announcement}>More talent and guests to be announced.</p>}{!simplified && <p>An exclusive convening of the nation’s top mental health advocates, including experts, celebrities, athletes, business leaders, #NotAlone supporters, and philanthropists.</p>}</div>
      {!simplified && <nav className="categoryTabs" aria-label="Participant year"><Link href="/#directory" aria-current="page">2026 participants</Link><Link href="/2025#directory">2025 participants</Link></nav>}
      {available && !simplified && <div className="directoryTools">
        {groups.length > 0 && <nav className="categoryTabs" aria-label="Guest categories">{groups.map(({ category }) => <a key={category} href={`#${groupId(category)}`}>{category}</a>)}</nav>}
        <label className="searchBox"><span className="srOnly">Search people</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search people" aria-controls={resultsId} /></label>
      </div>}
      {available && !simplified && <p className="directoryCount" role="status" aria-live="polite">{matchingPeople.length} {matchingPeople.length === 1 ? "guest" : "guests"}{query.trim() ? " found" : ""}</p>}
      <div className="directoryGroups" id={resultsId}>{groups.map(({ category, people }) => <Fragment key={category}><section className="directoryGroup" id={groupId(category)} aria-labelledby={`${groupId(category)}-title`} tabIndex={-1}><div className="groupHeading"><p className="eyebrow">2026 Directory</p><h3 id={`${groupId(category)}-title`}>{category}</h3></div><div className="peopleGrid">{people.map((person) => <Link className="personCard" href={`/directory/${encodeURIComponent(person.slug)}`} prefetch={false} key={`${category}-${person.slug}`}><DirectoryPortrait person={person} /><div><h4 className={styles.personName}>{person.name}</h4>{(person.categoryRoles?.[category as PersonCategory] || person.role).trim() && <p>{person.categoryRoles?.[category as PersonCategory] || person.role}</p>}</div></Link>)}</div></section>{/* Owner (Sept 23): Founding Partners right under the Founders section. */}{/* Ryan (Oct 8): the partner block now follows the narrative and Goals below Who's Coming (components/original-event-page.tsx). */}</Fragment>)}</div>
      {!groups.length && <p className="emptyState" role="status">{!available ? "The guest directory is temporarily unavailable. Please try again shortly." : query.trim() ? "No people match that search." : "Confirmed guest details will appear after event-team approval."}</p>}
    </section>
  );
}
