import { SiteImage } from "./site-image";
import { PortalViewSwitch } from "./portal-views";
import { PortalAutoRefresh } from "./portal-auto-refresh";
import { activeOf, activeRsvps, comingTo, isPokerSponsor, pokerInterestLabels, pokerSeatInterests, pokerSponsorshipLevels, pokerSponsorshipTotals, pokerTotals, removedOf, removedRsvps, rsvpTotals, type NominationSubmission, type PokerSponsorshipLevel, type PokerSubmission, type RsvpSubmission, type WorkshopSubmission, vipRsvps, namiRsvps, lakeLasVegasRsvps, rsvpForm, rsvpHeardFromLabels } from "../lib/staff/store";
import styles from "../app/staff/staff.module.css";

export type LineupGroup = { title: string; people: { name: string; role: string; rank: number | null; tier: string | null; photo: boolean }[] };

const when = (iso: string) => new Date(iso).toLocaleString("en-US", { timeZone: "America/Los_Angeles", month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }) + " PT";

// Owner (Sept 23): red = Awards Show, blue = Community Day; both when a guest is coming to both.
function ComingTo({ record }: { record: RsvpSubmission }) {
  const parts = comingTo(record);
  if (!parts.length && !record.vip && record.partner !== "nami" && record.tier !== "lake-las-vegas") return <span className={styles.muted}>—</span>;
  return <span className={styles.badges}>
    {record.vip && <span className={`${styles.badge} ${styles.badgeVip}`}>VIP</span>}
    {record.partner === "nami" && <span className={`${styles.badge} ${styles.badgeNami}`}>NAMI</span>}
    {record.tier === "lake-las-vegas" && <span className={`${styles.badge} ${styles.badgeLake}`}>Lake Las Vegas</span>}
    {parts.includes("awards") && <span className={`${styles.badge} ${styles.badgeAwards}`}>Awards</span>}
    {parts.includes("communityDay") && <span className={`${styles.badge} ${styles.badgeCommunity}`}>Community Day</span>}
  </span>;
}

// Owner (Sept 28): each row can be removed (test entries) or restored; nothing is deleted.
function RowAction({ row, action, kind = "rsvp" }: { row: { id: string }; action: "remove" | "restore" | "delete"; kind?: "rsvp" | "poker" }) {
  return <form method="post" action="/api/staff/rsvps" className={styles.rowAction}><input type="hidden" name="id" value={row.id} /><input type="hidden" name="kind" value={kind} /><input type="hidden" name="action" value={action} />{action === "remove" && <input type="hidden" name="reason" value="Removed by staff" />}<button type="submit" className={action === "delete" ? styles.dangerButton : styles.linkButton}>{action === "remove" ? "Remove" : action === "restore" ? "Restore" : "Delete permanently"}</button></form>;
}

function RsvpTable({ rows, action = "remove" }: { rows: RsvpSubmission[]; action?: "remove" | "restore" }) {
  return <div className={styles.tableWrap}><table className={styles.table}>
    <thead><tr><th>Submitted</th><th>Form</th><th>Name</th><th>Coming to</th><th>Email</th><th>Phone</th><th>Organization</th><th>Role / title</th><th>Invited by</th><th>Heard from</th><th>Party</th><th>Notes</th><th>Source</th>{action === "restore" && <th>Removed</th>}<th></th></tr></thead>
    <tbody>{rows.map(row => <tr key={row.id}>
      <td className={styles.nowrap}>{when(row.submittedAt)}</td><td className={styles.nowrap}>{rsvpForm(row)}</td><td className={styles.strong}>{row.name}</td><td><ComingTo record={row} /></td><td><a href={`mailto:${row.email}`}>{row.email}</a></td><td className={styles.nowrap}>{row.phone}</td><td>{row.organization}</td><td>{row.professionalRole}</td><td>{row.invitedBy}</td><td>{row.heardFrom ? rsvpHeardFromLabels[row.heardFrom] : ""}</td>
      <td className={styles.center}>{row.guestCount}</td><td className={styles.notes}>{row.notes}</td><td className={styles.muted}>{row.source === "import" ? "Previous portal" : "Form"}</td>{action === "restore" && <td className={styles.notes}>{row.removedAt ? when(row.removedAt) : ""}{row.removedReason ? ` · ${row.removedReason}` : ""}</td>}<td><span className={styles.badges}><RowAction row={row} action={action} />{action === "restore" && <RowAction row={row} action="delete" />}</span></td>
    </tr>)}</tbody>
  </table></div>;
}

// Owner (Sept 28): the All In poker tournament collects its seat requests on its own separate site;
// they are listed here in their own section so poker is never mixed with the Awards tickets or
// Community Day.
function PokerTable({ rows, action = "remove" }: { rows: PokerSubmission[]; action?: "remove" | "restore" }) {
  return <div className={styles.tableWrap}><table className={styles.table}>
    <thead><tr><th>Submitted</th><th>Name</th><th>Taking part as</th><th>Email</th><th>Phone</th><th>Organization</th><th>Seats</th><th>Experience</th><th>Notes</th>{action === "restore" && <th>Removed</th>}<th></th></tr></thead>
    <tbody>{rows.map(row => {
      const level = isPokerSponsor(row) ? pokerSponsorshipLevels[row.sponsorship as PokerSponsorshipLevel] : undefined;
      return <tr key={row.id} className={level ? styles.sponsorRow : undefined}>
        <td className={styles.nowrap}>{when(row.submittedAt)}</td><td className={styles.strong}>{row.name}</td>
        {/* A sponsor is flagged with their level and what it is worth, so it can never read as a guest. */}
        <td className={styles.nowrap}>{level
          ? <><span className={`${styles.badge} ${styles.badgeSponsor}`}>Sponsor</span> {level.label} · {level.price}</>
          : pokerInterestLabels[row.interest]}</td>
        <td><a href={`mailto:${row.email}`}>{row.email}</a></td><td className={styles.nowrap}>{row.phone}</td><td>{row.organization}</td>
        <td className={styles.center}>{level ? `${level.seats} reserved` : pokerSeatInterests.includes(row.interest) ? row.seats : <span className={styles.muted}>—</span>}</td>
        <td className={styles.nowrap}>{row.experience}</td><td className={styles.notes}>{row.notes}</td>
      </tr>;
    })}</tbody>
  </table></div>;
}

// Owner (Sept 28): workshop sign-ups grouped by session (day + title), oldest sign-up first within a session.
export function groupWorkshops(rows: WorkshopSubmission[]) {
  const groups = new Map<string, { key: string; day: string; time: string; title: string; people: WorkshopSubmission[] }>();
  for (const row of [...rows].sort((a, b) => a.submittedAt.localeCompare(b.submittedAt))) {
    const key = `${row.sessionDay}|${row.sessionTitle}`;
    if (!groups.has(key)) groups.set(key, { key, day: row.sessionDay, time: row.sessionTime, title: row.sessionTitle, people: [] });
    groups.get(key)!.people.push(row);
  }
  return [...groups.values()].sort((a, b) => a.day.localeCompare(b.day) || a.time.localeCompare(b.time));
}

// Thursday site visit: one row per person (name, case-insensitive) with Tennis / High Tea badges.
export function groupSiteVisit(rows: WorkshopSubmission[]) {
  const people = new Map<string, { key: string; name: string; tennis: boolean; highTea: boolean; first: string }>();
  for (const row of [...rows].sort((a, b) => a.submittedAt.localeCompare(b.submittedAt))) {
    const key = row.name.trim().toLowerCase().replace(/\s+/g, " ");
    const entry = people.get(key) ?? { key, name: row.name.trim(), tennis: false, highTea: false, first: row.submittedAt };
    const title = row.sessionTitle.trim().toLowerCase();
    if (/^tennis\b/.test(title)) entry.tennis = true;
    if (/^high tea\b/.test(title)) entry.highTea = true;
    people.set(key, entry);
  }
  return [...people.values()];
}

// Owner (Sept 23): one clean, Not Alone-themed staff portal: ticket requests (with running totals at
// the top), nominations in their own section, and the current Awards lineup for reference.
export function StaffPortal({ rsvps, nominations, poker, workshops = [], lineup, generatedAt }: { rsvps: RsvpSubmission[]; nominations: NominationSubmission[]; poker: PokerSubmission[]; workshops?: WorkshopSubmission[]; lineup: LineupGroup[]; generatedAt: string }) {
  // Removed requests (test entries) leave every list and total but stay stored under "Removed".
  const active = activeRsvps(rsvps);
  const removed = removedRsvps(rsvps);
  const totals = rsvpTotals(active);
  const communityDay = active.filter(row => row.communityDay);
  const vip = vipRsvps(active);
  const nami = namiRsvps(active);
  const lakeLasVegas = lakeLasVegasRsvps(active);
  const pokerActive = activeOf(poker);
  const pokerRemoved = removedOf(poker);
  const pokerCounts = pokerTotals(pokerActive);
  const sponsorship = pokerSponsorshipTotals(pokerActive);
  const sponsors = pokerActive.filter(isPokerSponsor);
  const workshopRows = workshops.filter(row => row.category !== "siteVisit");
  const workshopGroups = groupWorkshops(workshopRows);
  const siteVisitPeople = groupSiteVisit(workshops.filter(row => row.category === "siteVisit"));
  const tennis = siteVisitPeople.filter(person => person.tennis).length, highTea = siteVisitPeople.filter(person => person.highTea).length;
  return <main id="main-content" tabIndex={-1} className={styles.page}>
    <PortalViewSwitch />
    <PortalAutoRefresh />
    <header className={styles.top}>
      <div className={styles.brand}><SiteImage src="/images/na-summit-logo-black-2.png" alt="Not Alone Summit" sizes="72px" className={styles.brandLogo} /><div><p className={styles.eyebrow}>Not Alone 2026</p><h1>Staff Portal</h1></div></div>
      <nav className={styles.viewTabs} aria-label="Portal views">
        {/* Owner (Sept 28): three separate views, each with its own numbers; the hash picks the view. */}
        <a href="#awards" data-view-tab="awards" aria-selected="true">Awards</a>
        <a href="#workshops" data-view-tab="workshops" aria-selected="false">Summit workshops</a>
        <a href="#site-visit" data-view-tab="site-visit" aria-selected="false">Tennis &amp; High Tea</a>
        <a href="#poker" data-view-tab="poker" aria-selected="false">Sponsorship</a>
        {/* Owner (Sept 30): a complete copy of everything, downloadable from any device at any time. */}
        <a href="/api/staff/export?kind=all" className={styles.linkButton}>Download full backup</a>
        <form method="post" action="/api/staff/logout"><button type="submit" className={styles.linkButton}>Sign out</button></form>
      </nav>
    </header>

    <div data-view="awards" id="awards">
      <nav className={styles.sectionNav} aria-label="Awards sections"><a href="#vip">VIP</a><a href="#lake-las-vegas">Lake Las Vegas</a><a href="#nami">NAMI</a><a href="#tickets">Tickets</a><a href="#community-day">Community Day</a><a href="#nominations">Nominations</a><a href="#removed">Removed</a><a href="#lineup">Lineup</a></nav>
      <section className={styles.stats} aria-label="Ticket totals">
        <div className={`${styles.stat} ${styles.statPrimary}`}><span className={styles.statValue}>{totals.ticketsRequested}</span><span className={styles.statLabel}>Tickets requested</span><span className={styles.statNote}>Party sizes of every ticket request, one per guest email</span></div>
        <div className={`${styles.stat} ${styles.statPrimary}`}><span className={styles.statValue}>{totals.formsSubmitted}</span><span className={styles.statLabel}>Forms submitted</span><span className={styles.statNote}>Every RSVP submission received</span></div>
        {totals.moreInformation > 0 && <div className={styles.stat}><span className={styles.statValue}>{totals.moreInformation}</span><span className={styles.statLabel}>Asked for more information</span></div>}
        <div className={`${styles.stat} ${styles.statVip}`}><span className={styles.statValue}>{totals.vipTickets}</span><span className={styles.statLabel}>VIP tickets</span><span className={styles.statNote}>{totals.vipGuests} VIP {totals.vipGuests === 1 ? "guest" : "guests"} through the VIP link</span></div>
        <div className={`${styles.stat} ${styles.statLake}`}><span className={styles.statValue}>{totals.lakeLasVegasTickets}</span><span className={styles.statLabel}>Lake Las Vegas tickets</span><span className={styles.statNote}>{totals.lakeLasVegasGuests} {totals.lakeLasVegasGuests === 1 ? "guest" : "guests"} through the Lake Las Vegas form</span></div>
        <div className={`${styles.stat} ${styles.statNami}`}><span className={styles.statValue}>{totals.namiTickets}</span><span className={styles.statLabel}>NAMI tickets</span><span className={styles.statNote}>{totals.namiGuests} NAMI {totals.namiGuests === 1 ? "guest" : "guests"} through the NAMI form</span></div>
        <div className={`${styles.stat} ${styles.statCommunity}`}><span className={styles.statValue}>{totals.communityDayTickets}</span><span className={styles.statLabel}>Community Day tickets</span><span className={styles.statNote}>{totals.communityDayGuests} {totals.communityDayGuests === 1 ? "guest" : "guests"} said yes to Community Day</span></div>
        <div className={styles.stat}><span className={styles.statValue}>{nominations.length}</span><span className={styles.statLabel}>Nominations</span></div>
      </section>

      {/* Owner (Oct 1): VIP requests (private VIP link) sit first in the one staff portal, with who invited them. */}
      <section className={styles.section} id="vip" aria-labelledby="vip-title">
        <div className={styles.sectionHead}><h2 id="vip-title">VIP RSVPs</h2><span className={`${styles.badge} ${styles.badgeVip}`}>{totals.vipGuests} guests · {totals.vipTickets} tickets</span><a className={styles.button} href="/api/staff/export?kind=rsvp&amp;form=vip">Download list</a></div>
        <p className={styles.help}>Requests from the private VIP RSVP link (artists, honorees, personal invitations). Organization, title and who invited them are required on that form. They also appear in the full list below with a <span className={`${styles.badge} ${styles.badgeVip}`}>VIP</span> badge.</p>
        {vip.length === 0 ? <p className={styles.empty}>No VIP RSVPs yet.</p> : <RsvpTable rows={vip} />}
      </section>

      {/* Owner (Oct 3): requests from the private Lake Las Vegas RSVP form, with their own seating list. */}
      <section className={styles.section} id="lake-las-vegas" aria-labelledby="lake-las-vegas-title">
        <div className={styles.sectionHead}><h2 id="lake-las-vegas-title">Lake Las Vegas RSVPs</h2><span className={`${styles.badge} ${styles.badgeLake}`}>{totals.lakeLasVegasGuests} guests · {totals.lakeLasVegasTickets} tickets</span><a className={styles.button} href="/api/staff/export?kind=rsvp&amp;form=lake-las-vegas">Download list</a></div>
        <p className={styles.help}>Requests from the private Lake Las Vegas RSVP link. They also appear in the full list below with a <span className={`${styles.badge} ${styles.badgeLake}`}>Lake Las Vegas</span> badge.</p>
        {lakeLasVegas.length === 0 ? <p className={styles.empty}>No Lake Las Vegas RSVPs yet.</p> : <RsvpTable rows={lakeLasVegas} />}
      </section>

      {/* Owner (Oct 2): requests from the NAMI form (/rsvp/nami), tagged NAMI; they also appear in the full list. */}
      <section className={styles.section} id="nami" aria-labelledby="nami-title">
        <div className={styles.sectionHead}><h2 id="nami-title">NAMI RSVPs</h2><span className={`${styles.badge} ${styles.badgeNami}`}>{totals.namiGuests} guests · {totals.namiTickets} tickets</span><a className={styles.button} href="/api/staff/export?kind=rsvp&amp;form=nami">Download list</a></div>
        <p className={styles.help}>Requests from NAMI's private RSVP link. They also appear in the full list below with a <span className={`${styles.badge} ${styles.badgeNami}`}>NAMI</span> badge.</p>
        {nami.length === 0 ? <p className={styles.empty}>No NAMI RSVPs yet.</p> : <RsvpTable rows={nami} />}
      </section>

      <section className={styles.section} id="tickets" aria-labelledby="tickets-title">
        <div className={styles.sectionHead}><h2 id="tickets-title">Awards ticket requests</h2><a className={styles.button} href="/api/staff/export?kind=rsvp">Download CSV</a></div>
        <p className={styles.help}>Everything the RSVP form collects, newest first. Submitting the form is a waiting-list request, not a ticket. <span className={`${styles.badge} ${styles.badgeAwards}`}>Awards</span> = requested Awards Show tickets (every request counts as planning to attend); <span className={`${styles.badge} ${styles.badgeCommunity}`}>Community Day</span> = said yes to Community Day (asked from Sept 23; earlier requests show Awards only).</p>
        {active.length === 0 ? <p className={styles.empty}>No ticket requests yet.</p> : <RsvpTable rows={active} />}
      </section>

      <section className={styles.section} id="community-day" aria-labelledby="community-day-title">
        <div className={styles.sectionHead}><h2 id="community-day-title">Community Day RSVPs</h2><span className={`${styles.badge} ${styles.badgeCommunity}`}>{totals.communityDayGuests} guests · {totals.communityDayTickets} tickets</span></div>
        <p className={styles.help}>Guests who switched on "Community Day" on the RSVP form (doors 5:30 PM). Those also attending the Awards Show carry both badges.</p>
        {communityDay.length === 0 ? <p className={styles.empty}>No Community Day RSVPs yet.</p> : <RsvpTable rows={communityDay} />}
      </section>

      <section className={styles.section} id="nominations" aria-labelledby="nominations-title">
        <div className={styles.sectionHead}><h2 id="nominations-title">Award nominations</h2><a className={styles.button} href="/api/staff/export?kind=nominations">Download CSV</a></div>
        <p className={styles.help}>Submitted through the nomination form, newest first.</p>
        {nominations.length === 0 ? <p className={styles.empty}>No nominations yet.</p> : <div className={styles.cards}>{nominations.map(row => <article key={row.id} className={styles.card}>
          <p className={styles.cardKicker}>{row.category} · {when(row.submittedAt)}</p>
          <h3>{row.nomineeName}{row.nomineeOrganization && <span className={styles.cardSub}> · {row.nomineeOrganization}</span>}</h3>
          <p className={styles.reason}>{row.reason}</p>
          {row.links && <p className={styles.links}>Links: {row.links}</p>}
          <p className={styles.muted}>Nominated by {row.nominatorName} · <a href={`mailto:${row.nominatorEmail}`}>{row.nominatorEmail}</a>{row.nominatorPhone && ` · ${row.nominatorPhone}`}{row.relationship && ` · ${row.relationship}`}</p>
        </article>)}</div>}
      </section>

      <section className={styles.section} id="removed" aria-labelledby="removed-title">
        <div className={styles.sectionHead}><h2 id="removed-title">Removed guests</h2><span className={styles.badge}>{removed.length} {removed.length === 1 ? "request" : "requests"}</span></div>
        <p className={styles.help}>Requests taken out of the lists above (test entries, duplicates). Nothing is deleted: every field is kept here and in the CSV download, and any request can be restored.</p>
        {removed.length === 0 ? <p className={styles.empty}>No removed requests.</p> : <RsvpTable rows={removed} action="restore" />}
      </section>

      <section className={styles.section} id="lineup" aria-labelledby="lineup-title">
        <div className={styles.sectionHead}><h2 id="lineup-title">Current Awards lineup</h2><a className={styles.button} href="https://notaloneawards.org/awards/2026" target="_blank" rel="noreferrer">View the page</a></div>
        <p className={styles.help}>What the public Awards page lists right now (from Airtable's Website Grouping), for reference alongside the requests.</p>
        {lineup.length === 0 ? <p className={styles.empty}>The lineup is unavailable at the moment.</p> : lineup.map(group => <div key={group.title} className={styles.lineupGroup}>
          <h3>{group.title} <span className={styles.count}>{group.people.length}</span></h3>
          <ol className={styles.lineupList}>{group.people.map(person => <li key={person.name}><span className={styles.strong}>{person.name}</span>{person.role && <span className={styles.muted}> · {person.role}</span>}{person.rank ? <span className={styles.tag}>#{person.rank}</span> : person.tier ? <span className={styles.tag}>{person.tier} talent</span> : null}{!person.photo && <span className={styles.tagWarn}>no photo</span>}</li>)}</ol>
        </div>)}
      </section>
    </div>

    <div data-view="workshops" id="workshops" hidden>
      <section className={styles.stats} aria-label="Summit workshop totals">
        <div className={`${styles.stat} ${styles.statPrimary}`}><span className={styles.statValue}>{workshopRows.length}</span><span className={styles.statLabel}>Summit workshop sign-ups</span><span className={styles.statNote}>Name-only sign-ups from the schedule page</span></div>
        {workshopGroups.map(group => <div key={group.key} className={styles.stat}><span className={styles.statValue}>{group.people.length}</span><span className={styles.statLabel}>{group.title}</span><span className={styles.statNote}>{group.day}{group.time ? ` · ${group.time}` : ""}</span></div>)}
      </section>

      <section className={styles.section} id="workshop-list" aria-labelledby="workshops-title">
        <div className={styles.sectionHead}><h2 id="workshops-title">Summit workshops</h2><a className={styles.button} href="/api/staff/export?kind=workshops">Download CSV</a></div>
        <p className={styles.help}>Sign-ups from the Summit schedule page for Wellness &amp; Community Programming (Monday, November 2) and the Wellness Activity mornings (Tuesday, November 3 and Wednesday, November 4). Each date is its own list. Name only. The sign-up is for Summit attendees only; check each name against the guest list and remove anyone who is not on it.</p>
        {workshopRows.length === 0 ? <p className={styles.empty}>No workshop sign-ups yet.</p> : <div className={styles.cards}>{workshopGroups.map(group => <article key={group.key} className={styles.card}>
          <p className={styles.cardKicker}>{group.day}{group.time ? ` · ${group.time}` : ""}</p>
          <h3>{group.title} <span className={styles.count}>{group.people.length}</span></h3>
          <ol className={styles.lineupList}>{group.people.map(row => <li key={row.id}><span className={styles.strong}>{row.name}</span><span className={styles.muted}> · {when(row.submittedAt)}</span></li>)}</ol>
        </article>)}</div>}
      </section>
    </div>

    <div data-view="site-visit" id="site-visit" hidden>
      <section className={styles.stats} aria-label="Tennis and High Tea totals">
        <div className={`${styles.stat} ${styles.statTennis}`}><span className={styles.statValue}>{tennis}</span><span className={styles.statLabel}>Tennis</span><span className={styles.statNote}>People signed up · Thursday, November 5</span></div>
        <div className={`${styles.stat} ${styles.statTea}`}><span className={styles.statValue}>{highTea}</span><span className={styles.statLabel}>High Tea</span><span className={styles.statNote}>People signed up · Thursday, November 5</span></div>
        <div className={styles.stat}><span className={styles.statValue}>{siteVisitPeople.filter(person => person.tennis && person.highTea).length}</span><span className={styles.statLabel}>Both</span></div>
        <div className={styles.stat}><span className={styles.statValue}>{siteVisitPeople.length}</span><span className={styles.statLabel}>People in total</span></div>
      </section>

      <section className={styles.section} id="site-visit-list" aria-labelledby="site-visit-title">
        <div className={styles.sectionHead}><h2 id="site-visit-title">Tennis &amp; High Tea</h2><a className={styles.button} href="/api/staff/export?kind=site-visit">Download CSV</a></div>
        <p className={styles.help}>Thursday November 5 ICF site visit sign-ups from the schedule page. <span className={`${styles.badge} ${styles.badgeTennis}`}>Tennis</span> = signed up for Tennis; <span className={`${styles.badge} ${styles.badgeTea}`}>High Tea</span> = signed up for High Tea; both badges when both. Attendees only; remove anyone not on the guest list.</p>
        {siteVisitPeople.length === 0 ? <p className={styles.empty}>No Tennis or High Tea sign-ups yet.</p> : <div className={styles.tableWrap}><table className={styles.table}>
          <thead><tr><th>Name</th><th>Signed up for</th><th>First sign-up</th></tr></thead>
          <tbody>{siteVisitPeople.map(person => <tr key={person.key}><td className={styles.strong}>{person.name}</td><td><span className={styles.badges}>{person.tennis && <span className={`${styles.badge} ${styles.badgeTennis}`}>Tennis</span>}{person.highTea && <span className={`${styles.badge} ${styles.badgeTea}`}>High Tea</span>}</span></td><td className={styles.nowrap}>{when(person.first)}</td></tr>)}</tbody>
        </table></div>}
      </section>
    </div>

    <div data-view="poker" id="poker" hidden>
      {/* Owner (Sept 29): seats for the poker tournament are requested on the foundation's own
          Constant Contact invitation now, so this tab shows sponsorship enquiries and the level
          each one asked about. Any seat requests taken before that change are kept below. */}
      <nav className={styles.sectionNav} aria-label="Poker sections"><a href="#poker-sponsors">Sponsorship enquiries</a><a href="#poker-requests">Earlier seat requests</a><a href="#poker-removed">Removed</a></nav>
      <section className={styles.stats} aria-label="Sponsorship totals">
        <div className={`${styles.stat} ${styles.statPoker}`}><span className={styles.statValue}>{sponsorship.sponsors}</span><span className={styles.statLabel}>Sponsorship enquiries</span><span className={styles.statNote}>All In For Mental Health, Nov 1 · a level asked about, not a commitment</span></div>
        <div className={`${styles.stat} ${styles.statPoker}`}><span className={styles.statValue}>${sponsorship.pledged.toLocaleString("en-US")}</span><span className={styles.statLabel}>Levels enquired about</span><span className={styles.statNote}>the matrix&rsquo;s own figures, not money received</span></div>
        <div className={styles.stat}><span className={styles.statValue}>{sponsorship.reservedSeats}</span><span className={styles.statLabel}>Seats at those levels</span></div>
        <div className={styles.stat}><span className={styles.statValue}>{sponsorship.awardsTickets}</span><span className={styles.statLabel}>Awards tickets at those levels</span></div>
        <div className={styles.stat}><span className={styles.statValue}>{pokerCounts.seatsRequested}</span><span className={styles.statLabel}>Earlier seat requests</span><span className={styles.statNote}>taken before seats moved to the invitation</span></div>
      </section>

      <section className={styles.section} id="poker-sponsors" aria-labelledby="poker-sponsors-title">
        <div className={styles.sectionHead}><h2 id="poker-sponsors-title">Sponsorship enquiries</h2><a className={styles.button} href="/api/staff/export?kind=poker">Download CSV</a></div>
        <p className={styles.help}>Sent from the pop-up on all-in-for-mental-health.netlify.app. Each one says which level the sender asked about; the figures are the sponsorship matrix&rsquo;s own numbers, not payments received. Trent follows these up by email.</p>
        {sponsors.length === 0 ? <p className={styles.empty}>No sponsorship enquiries yet.</p> : <div className={styles.cards}>{sponsors.map(row => { const level = pokerSponsorshipLevels[row.sponsorship as PokerSponsorshipLevel]; return <article key={row.id} className={styles.card}>
          <p className={styles.cardKicker}>{level?.label ?? row.sponsorship} · {level?.price ?? ""}</p>
          <h3>{row.name}{row.organization && <span className={styles.cardSub}> · {row.organization}</span>}</h3>
          <p className={styles.muted}>{level ? `${level.seats} reserved seats · ${level.tickets} Awards tickets` : ""}</p>
          {row.notes && <p className={styles.muted}>{row.notes}</p>}
          <p className={styles.muted}><a href={`mailto:${row.email}`}>{row.email}</a>{row.phone && ` · ${row.phone}`} · {when(row.submittedAt)}</p>
        </article>; })}</div>}
      </section>

      <section className={styles.section} id="poker-requests" aria-labelledby="poker-title">
        <div className={styles.sectionHead}><h2 id="poker-title">Earlier seat requests</h2></div>
        <p className={styles.help}>Seat requests taken on the poker site before September 29, when seats moved to the foundation&rsquo;s own invitation. Kept so nothing is lost; no new ones arrive here.</p>
        {pokerActive.filter(row => !isPokerSponsor(row)).length === 0 ? <p className={styles.empty}>No earlier seat requests.</p> : <PokerTable rows={pokerActive.filter(row => !isPokerSponsor(row))} />}
      </section>

      <section className={styles.section} id="poker-removed" aria-labelledby="poker-removed-title">
        <div className={styles.sectionHead}><h2 id="poker-removed-title">Removed</h2><span className={styles.badge}>{pokerRemoved.length} {pokerRemoved.length === 1 ? "entry" : "entries"}</span></div>
        <p className={styles.help}>Test entries and duplicates taken out of the poker list. Kept in full; anything can be restored.</p>
        {pokerRemoved.length === 0 ? <p className={styles.empty}>Nothing removed.</p> : <PokerTable rows={pokerRemoved} action="restore" />}
      </section>
    </div>

    <p className={styles.footer}>Generated {when(generatedAt)} · Refreshes automatically every minute while open · Password-protected staff page · Not indexed</p>
  </main>;
}
