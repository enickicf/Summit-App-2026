import { waiverSummary } from "../lib/event-waiver";
import { SiteImage } from "./site-image";
import { PortalViewSwitch } from "./portal-views";
import { PortalAutoRefresh } from "./portal-auto-refresh";
import { RsvpEmailTools } from "./rsvp-email-tools";
import { activeOf, activeRsvps, comingTo, currentRequests, excludedFromPortalTotals, guestDetailsMissing, isPokerSponsor, pokerInterestLabels, pokerSeatInterests, pokerSponsorshipLevels, pokerSponsorshipTotals, pokerTotals, removedOf, removedRsvps, rsvpTotals, type NominationSubmission, type PokerSponsorshipLevel, type PokerSubmission, type RsvpSubmission, type WorkshopSubmission, vipRsvps, namiRsvps, ustaRsvps, lakeLasVegasRsvps, rsvpForm, rsvpHeardFromLabels, siteVisitTransportLabels, type SiteVisitTransport, type TextPreferenceRecord, type ClosingDinnerSubmission, type PodcastBookingSubmission, type TicketOfferSubmission, type TicketConfirmationSubmission, closingDinnerSeats, closingDinnerTotals } from "../lib/staff/store";
import styles from "../app/staff/staff.module.css";
import type { InboxEntry } from "../lib/staff/submission-inbox";
import { wellnessSessions } from "../lib/wellness-signups-2026";
import { staffGuestEvents, staffGuestLists } from "../lib/staff/staff-guest";
import { textConsentLabels, textConsentProtocolNote, textConsentShortLabels, textConsentStatus, textContactRows, textOptOutFooter } from "../lib/staff/text-consent";

export type LineupGroup = { title: string; people: { name: string; role: string; rank: number | null; tier: string | null; photo: boolean }[] };

const when = (iso: string) => new Date(iso).toLocaleString("en-US", { timeZone: "America/Los_Angeles", month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }) + " PT";

function PodcastBookings({ bookings }: { bookings: PodcastBookingSubmission[] }) {
  const rows = [...bookings].sort((a, b) => a.startUtc.localeCompare(b.startUtc) || a.podcast.localeCompare(b.podcast));
  const short = rows.filter(row => row.format === "short").length;
  const long = rows.filter(row => row.format === "long").length;
  return <>
    <section className={styles.stats} aria-label="Podcast booking totals">
      <div className={`${styles.stat} ${styles.statPrimary}`}><span className={styles.statValue}>{rows.length}</span><span className={styles.statLabel}>Interviews booked</span></div>
      <div className={styles.stat}><span className={styles.statValue}>{short}</span><span className={styles.statLabel}>Short form</span><span className={styles.statNote}>After the red carpet walk</span></div>
      <div className={styles.stat}><span className={styles.statValue}>{long}</span><span className={styles.statLabel}>Long form</span><span className={styles.statNote}>75-minute recordings</span></div>
    </section>
    <section className={styles.section} id="podcast-bookings" aria-labelledby="podcast-bookings-title">
      <div className={styles.sectionHead}><h2 id="podcast-bookings-title">Podcast interview bookings</h2><a className={styles.button} href="/api/staff/export?kind=podcast-bookings">Download CSV</a></div>
      <p className={styles.help}>Confirmed interview times from the private podcast page. Exact room locations will be announced closer to the event.</p>
      {rows.length === 0 ? <p className={styles.empty}>No podcast interviews have been booked yet.</p> : <div className={styles.tableWrap}><table className={styles.table}>
        <thead><tr><th>Interview time</th><th>Podcast</th><th>Guest</th><th>Email</th><th>Format</th><th>Room</th><th>Travel</th><th>Booked</th></tr></thead>
        <tbody>{rows.map(row => <tr key={row.id}><td className={styles.nowrap}>{when(row.startUtc)}<br/><small>to {when(row.endUtc)}</small></td><td className={styles.strong}>{row.podcast}</td><td>{row.guestName}</td><td><a href={`mailto:${row.email}`}>{row.email}</a></td><td>{row.format === "short" ? "Short form" : "Long form"}</td><td className={styles.nowrap}>{row.room}</td><td>{row.travelVerified ? "Verified flight" : row.arrivalLocal ? `Guest entered ${row.arrivalLocal.replace("T", " ")}` : "Pending verification"}</td><td className={styles.nowrap}>{when(row.submittedAt)}</td></tr>)}</tbody>
      </table></div>}
    </section>
  </>;
}

export function PodcastStaffPortal({ bookings, generatedAt }: { bookings: PodcastBookingSubmission[]; generatedAt: string }) {
  return <main id="main-content" tabIndex={-1} className={styles.page}>
    <PortalAutoRefresh />
    <header className={styles.top}>
      <div className={styles.brand}><SiteImage src="/images/na-summit-logo-black-2.png" alt="Not Alone Summit" sizes="72px" className={styles.brandLogo} /><div><p className={styles.eyebrow}>Not Alone 2026</p><h1>Podcast Bookings</h1></div></div>
      <nav className={styles.viewTabs} aria-label="Podcast staff actions"><a href="/awards/podcasts">Podcast page</a><form method="post" action="/api/staff/logout"><button type="submit" className={styles.linkButton}>Sign out</button></form></nav>
    </header>
    <PodcastBookings bookings={bookings} />
    <p className={styles.footer}>Generated {when(generatedAt)} · Refreshes automatically every minute · Podcast booking access only</p>
  </main>;
}

// Owner (Sept 23): red = Awards Show, blue = Community Day; both when a guest is coming to both.
function ComingTo({ record }: { record: RsvpSubmission }) {
  const parts = comingTo(record);
  if (!parts.length && !record.vip && !record.partner && record.tier !== "lake-las-vegas") return <span className={styles.muted}>—</span>;
  return <span className={styles.badges}>
    {record.vip && <span className={`${styles.badge} ${styles.badgeVip}`}>VIP</span>}
    {record.partner === "nami" && <span className={`${styles.badge} ${styles.badgeNami}`}>NAMI</span>}
    {record.partner === "usta" && <span className={`${styles.badge} ${styles.badgeUsta}`}>USTA</span>}
    {record.tier === "lake-las-vegas" && <span className={`${styles.badge} ${styles.badgeLake}`}>Lake Las Vegas</span>}
    {parts.includes("awards") && <span className={`${styles.badge} ${styles.badgeAwards}`}>Awards</span>}
    {parts.includes("communityDay") && <span className={`${styles.badge} ${styles.badgeCommunity}`}>Community Day</span>}
  </span>;
}

// Owner (Sept 28): each row can be removed (test entries) or restored; nothing is deleted.
function RowAction({ row, action, kind = "rsvp" }: { row: { id: string }; action: "remove" | "restore" | "delete"; kind?: "rsvp" | "poker" }) {
  return <form method="post" action="/api/staff/rsvps" className={styles.rowAction}><input type="hidden" name="id" value={row.id} /><input type="hidden" name="kind" value={kind} /><input type="hidden" name="action" value={action} />{action === "remove" && <input type="hidden" name="reason" value="Removed by staff" />}<button type="submit" className={action === "delete" ? styles.dangerButton : styles.linkButton}>{action === "remove" ? "Remove" : action === "restore" ? "Restore" : "Delete permanently"}</button></form>;
}

// Owner (Oct 12): text message consent (lib/staff/text-consent.ts): "Yes (box)" = ticked the box on the form;
// "Tickets only" = gave a phone without the box (event and ticket texts only, opt out any time).
function TextConsent({ record, prefs = [] }: { record: { phone?: string | undefined; email?: string | undefined; textConsent?: boolean | undefined; submittedAt: string }; prefs?: readonly TextPreferenceRecord[] }) {
  const status = textConsentStatus(record, prefs);
  return <span title={textConsentLabels[status]} className={status === "none" ? styles.muted : status === "optedOut" ? styles.optedOut : undefined}>{textConsentShortLabels[status]}</span>;
}

function RsvpTable({ rows, action = "remove", prefs = [] }: { rows: RsvpSubmission[]; action?: "remove" | "restore"; prefs?: readonly TextPreferenceRecord[] }) {
  return <div className={styles.tableWrap}><table className={styles.table}>
    <thead><tr><th>Submitted</th><th>Form</th><th>Name</th><th>Coming to</th><th>Email</th><th>Phone</th><th>Texts</th><th>Organization</th><th>Role / title</th><th>Invited by</th><th>Heard from</th><th>Party</th><th>Notes</th><th>Source</th>{action === "restore" && <th>Removed</th>}<th></th></tr></thead>
    <tbody>{rows.map(row => <tr key={row.id}>
      <td className={styles.nowrap}>{when(row.submittedAt)}</td><td className={styles.nowrap}>{rsvpForm(row)}</td><td className={styles.strong}>{row.name}{excludedFromPortalTotals(row) && <><br/><span className={`${styles.badge} ${styles.badgeTest}`}>Test · excluded from totals</span></>}<br/><small>{waiverSummary(row.eventWaiver)}</small>{guestDetailsMissing(row) && <><br/><span className={`${styles.badge} ${styles.badgeFollowUp}`}>Guest details missing</span></>}{/* Owner (Oct 5): the other people in the party, with their own email and phone. */}{row.guests?.length ? <ul className={styles.partyGuests}>{row.guests.map((guest, index) => <li key={index}><span>{guest.name}</span> · <a href={`mailto:${guest.email}`}>{guest.email}</a> · {guest.phone}<br/><small>{waiverSummary(guest.eventWaiver)}</small></li>)}</ul> : null}</td><td><ComingTo record={row} /></td><td><a href={`mailto:${row.email}`}>{row.email}</a></td><td className={styles.nowrap}>{row.phone}</td><td className={styles.nowrap}><TextConsent record={row} prefs={prefs} /></td><td>{row.organization}</td><td>{row.professionalRole}</td><td>{row.invitedBy}</td><td>{row.heardFrom ? rsvpHeardFromLabels[row.heardFrom] : ""}</td>
      <td className={styles.center}>{row.guestCount}</td><td className={styles.notes}>{row.notes}</td><td className={styles.muted}>{row.source === "import" ? "Previous portal" : row.source === "staff" ? `Added by ${row.addedBy || "staff"}` : "Form"}</td>{action === "restore" && <td className={styles.notes}>{row.removedAt ? when(row.removedAt) : ""}{row.removedReason ? ` · ${row.removedReason}` : ""}</td>}<td><span className={styles.badges}><RowAction row={row} action={action} />{action === "restore" && <RowAction row={row} action="delete" />}</span></td>
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
        <td className={styles.nowrap}>{when(row.submittedAt)}</td><td className={styles.strong}>{row.name}{excludedFromPortalTotals(row) && <><br/><span className={`${styles.badge} ${styles.badgeTest}`}>Test · excluded from totals</span></>}</td>
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

// Oct 12: wellness sign-ups grouped by class, in the order of the morning (day, start time), oldest sign-up first.
const wellnessDays = ["Monday, November 2", "Tuesday, November 3", "Wednesday, November 4"];
export function groupWellness(rows: WorkshopSubmission[]) {
  const order = new Map(wellnessSessions.map((session, index) => [session.id, index]));
  const groups = new Map<string, { key: string; day: string; time: string; title: string; people: WorkshopSubmission[] }>();
  for (const row of [...rows].sort((a, b) => a.submittedAt.localeCompare(b.submittedAt))) {
    if (!groups.has(row.sessionId)) groups.set(row.sessionId, { key: row.sessionId, day: row.sessionDay, time: row.sessionTime, title: row.sessionTitle, people: [] });
    groups.get(row.sessionId)!.people.push(row);
  }
  const rank = (id: string) => order.get(id) ?? Number.MAX_SAFE_INTEGER;
  return [...groups.values()].sort((a, b) => rank(a.key) - rank(b.key));
}

// Thursday site visit: one row per person (name, case-insensitive) with Tennis / High Tea badges.
// Oct 7: and the signed waiver (the full name typed with the first sign-up that carried one); sign-ups from before
// Oct 7 have no waiver and show "—".
export function groupSiteVisit(rows: WorkshopSubmission[]) {
  const people = new Map<string, { key: string; name: string; tennis: boolean; highTea: boolean; first: string; signature?: string; email?: string; phone?: string; transport?: SiteVisitTransport; textConsent?: boolean }>();
  for (const row of [...rows].sort((a, b) => a.submittedAt.localeCompare(b.submittedAt))) {
    const key = row.name.trim().toLowerCase().replace(/\s+/g, " ");
    const entry = people.get(key) ?? { key, name: row.name.trim(), tennis: false, highTea: false, first: row.submittedAt };
    const title = row.sessionTitle.trim().toLowerCase();
    if (/^tennis\b/.test(title)) entry.tennis = true;
    if (/^high tea\b/.test(title)) entry.highTea = true;
    if (row.waiverAccepted === true && row.signature?.trim() && !entry.signature) entry.signature = row.signature.trim();
    // Oct 9: the Tennis & High Tea form adds contact details and transport; the latest sign-up that has them wins.
    if (row.email) entry.email = row.email;
    if (row.phone) entry.phone = row.phone;
    if (row.transport) entry.transport = row.transport;
    if (row.textConsent !== undefined) entry.textConsent = row.textConsent;
    people.set(key, entry);
  }
  return [...people.values()];
}

// Owner (Sept 23): one clean, Not Alone-themed staff portal: ticket requests (with running totals at
// the top), nominations in their own section, and the current Awards lineup for reference.
export function StaffPortal({ rsvps, nominations, poker, workshops = [], textPreferences = [], closingDinner = [], podcastBookings = [], ticketOffers = [], ticketConfirmations = [], needsAttention = [], anonymousFailures = 0, lineup, generatedAt, addGuest = {} }: { addGuest?: { added?: string | undefined; to?: string | undefined; error?: string | undefined }; rsvps: RsvpSubmission[]; nominations: NominationSubmission[]; poker: PokerSubmission[]; workshops?: WorkshopSubmission[]; textPreferences?: TextPreferenceRecord[]; closingDinner?: ClosingDinnerSubmission[]; podcastBookings?: PodcastBookingSubmission[]; ticketOffers?: TicketOfferSubmission[]; ticketConfirmations?: TicketConfirmationSubmission[]; needsAttention?: InboxEntry[] | null; anonymousFailures?: number; lineup: LineupGroup[]; generatedAt: string }) {
  // Removed requests (test entries) leave every list and total but stay stored under "Removed".
  const active = activeRsvps(rsvps);
  const removed = removedRsvps(rsvps);
  const totals = rsvpTotals(active);
  const current = currentRequests(active);
  const missingDetails = [...new Map([...current.awards, ...current.communityDay].filter(guestDetailsMissing).map(row => [row.id, row])).values()].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  const communityDay = active.filter(row => comingTo(row).includes("communityDay"));
  const vip = vipRsvps(active);
  const nami = namiRsvps(active);
  const usta = ustaRsvps(active);
  const lakeLasVegas = lakeLasVegasRsvps(active);
  const pokerActive = activeOf(poker);
  const pokerRemoved = removedOf(poker);
  const pokerCounts = pokerTotals(pokerActive);
  const sponsorship = pokerSponsorshipTotals(pokerActive);
  const sponsors = pokerActive.filter(isPokerSponsor);
  const workshopRows = workshops.filter(row => row.category !== "siteVisit" && row.category !== "wellness");
  const wellnessRows = workshops.filter(row => row.category === "wellness");
  const countedWorkshopRows = workshopRows.filter(row => !excludedFromPortalTotals(row));
  const countedWellnessRows = wellnessRows.filter(row => !excludedFromPortalTotals(row));
  // Oct 12 (owner): text message consent and opt-outs, one row per phone number (lib/staff/text-consent.ts).
  const dinnerActive = activeOf(closingDinner);
  const dinner = closingDinnerTotals(dinnerActive);
  const textContacts = textContactRows([
    ...nominations.filter(row => row.nominatorPhone).map(row => ({ name: row.nominatorName, email: row.nominatorEmail, phone: row.nominatorPhone, submittedAt: row.submittedAt, textConsent: row.textConsent, source: "Award nomination" })),
    ...dinnerActive.map(row => ({ name: row.name, email: row.email, phone: row.phone, submittedAt: row.submittedAt, textConsent: row.textConsent, groupEventTextConsent:row.groupEventTextConsent, source: "Closing Dinner request" })),
    ...active.flatMap(row => (row.guests ?? []).map(g => ({...g,submittedAt:row.submittedAt,groupEventTextConsent:row.groupEventTextConsent,source:"RSVP guest"}))),
      ...dinnerActive.filter(row=>row.bringingGuest).map(row=>({name:row.guestName,email:row.guestEmail,phone:row.guestPhone,submittedAt:row.submittedAt,groupEventTextConsent:row.groupEventTextConsent,source:"Closing dinner guest"})),
      ...active.map(row => ({ name: row.name, email: row.email, phone: row.phone, submittedAt: row.submittedAt, textConsent: row.textConsent, groupEventTextConsent:row.groupEventTextConsent, source: "Awards / Community Day RSVP" })),
    ...workshops.filter(row => row.phone).map(row => ({ name: row.name, email: row.email ?? "", phone: row.phone ?? "", submittedAt: row.submittedAt, textConsent: row.textConsent, source: row.category === "wellness" ? "Wellness classes" : "Tennis & High Tea" }))
  ], textPreferences);
  const textCount = (status: string) => textContacts.filter(row => row.status === status).length;
  const textChoices = [...textPreferences].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  const wellnessGroups = groupWellness(wellnessRows);
  const wellnessPeople = new Set(countedWellnessRows.map(row => row.name.trim().toLowerCase().replace(/\s+/g, " "))).size;
  const workshopGroups = groupWorkshops(workshopRows);
  const siteVisitPeople = groupSiteVisit(workshops.filter(row => row.category === "siteVisit"));
  const countedSiteVisitPeople = siteVisitPeople.filter(person => !excludedFromPortalTotals(person));
  const tennis = countedSiteVisitPeople.filter(person => person.tennis).length, highTea = countedSiteVisitPeople.filter(person => person.highTea).length;
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
        <a href="#wellness" data-view-tab="wellness" aria-selected="false">Wellness</a>
        <a href="#closing-dinner" data-view-tab="closing-dinner" aria-selected="false">Closing Dinner</a>
        <a href="#podcasts" data-view-tab="podcasts" aria-selected="false">Podcasts</a>
        <a href="#texts" data-view-tab="texts" aria-selected="false">Texts</a>
        <a href="#poker" data-view-tab="poker" aria-selected="false">Sponsorship</a>
        <a href="/staff/submissions">Submission review{needsAttention && needsAttention.length > 0 ? ` (${needsAttention.length})` : ""}</a>
        {/* Owner (Sept 30): a complete copy of everything, downloadable from any device at any time. */}
        <a href="/api/staff/export?kind=all" className={styles.linkButton}>Download full backup</a>
        <form method="post" action="/api/staff/logout"><button type="submit" className={styles.linkButton}>Sign out</button></form>
      </nav>
    </header>

    <div data-view="awards" id="awards">
      <nav className={styles.sectionNav} aria-label="Awards sections"><a href="#add-guest">Add a guest</a><a href="#ticket-confirmations">Approvals &amp; confirmations</a><a href="#vip">VIP</a><a href="#lake-las-vegas">Lake Las Vegas</a><a href="#nami">NAMI</a><a href="#usta">USTA</a><a href="#tickets">Tickets</a><a href="#community-day">Community Day</a><a href="#nominations">Nominations</a><a href="#removed">Removed</a><a href="#lineup">Lineup</a></nav>
      {/* Oct 20 (Cherrial, owner approved): add a guest Trent sends by WhatsApp / text. Stored like an RSVP, tagged "Added by
          staff"; no confirmation email (they get one only when they RSVP themselves). */}
      <section className={styles.section} id="add-guest" aria-labelledby="add-guest-title">
        <div className={styles.sectionHead}><h2 id="add-guest-title">Add a guest</h2></div>
        <p className={styles.help}>For guests Trent (or anyone on the team) sends by WhatsApp or text. They appear in every list and spreadsheet as &ldquo;Added by&rdquo; you. No confirmation email is sent; if they later fill out an RSVP form themselves, they get the normal confirmation then. Their waiver is not signed until they do.</p>
        {addGuest.added && <p className={styles.notice} role="status">Added {addGuest.added}{addGuest.to ? ` (${addGuest.to})` : ""}.</p>}
        {addGuest.error && <p className={styles.noticeError} role="alert">{addGuest.error}</p>}
        <form method="post" action="/api/staff/guests" className={styles.guestForm}>
          <label>Full name *<input name="name" required minLength={2} maxLength={180} /></label>
          <label>Email *<input name="email" type="email" required maxLength={254} /></label>
          <label>Phone<input name="phone" type="tel" maxLength={80} /></label>
          <label>Organization<input name="organization" maxLength={240} /></label>
          <label>Title<input name="professionalRole" maxLength={180} /></label>
          <label>Invited by<input name="invitedBy" maxLength={180} placeholder="e.g. Trent" /></label>
          <label>List<select name="list" defaultValue="standard">{Object.entries(staffGuestLists).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <label>Coming to<select name="events" defaultValue="awards">{Object.entries(staffGuestEvents).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <label>Party size<select name="guestCount" defaultValue="1">{Array.from({ length: 10 }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}</select></label>
          <label className={styles.checkLabel}><input type="checkbox" name="closingDinner" /> Also the Closing Dinner (Nov 4)</label>
          <label className={styles.wide}>Notes<input name="notes" maxLength={900} placeholder="e.g. names of the other people in the party" /></label>
          <label>Added by (your name) *<input name="addedBy" required minLength={2} maxLength={120} /></label>
          <label className={styles.checkLabel}><input type="checkbox" name="allowDuplicate" /> Add anyway if already on file</label>
          <button type="submit" className={styles.button}>Add guest</button>
        </form>
      </section>

      <section className={styles.section} id="ticket-confirmations" aria-labelledby="ticket-confirmations-title">
        <div className={styles.sectionHead}><h2 id="ticket-confirmations-title">Ticket approvals &amp; attendance confirmations</h2><a className={styles.button} href="/api/staff/export?kind=ticket-confirmations">Download CSV</a></div>
        <p className={styles.help}>Approval allocations are copied from Cherrial&apos;s approval system. Guest responses are stored separately, so confirming attendance never changes an RSVP request or the approved ticket counts. Outbound email, text and ticket sending remains disabled.</p>
        {ticketOffers.length === 0 ? <p className={styles.empty}>No approval offers have been synced yet.</p> : <div className={styles.tableWrap}><table className={styles.table}>
          <thead><tr><th>Guest</th><th>Offered</th><th>Response</th><th>Attendees</th><th>Approval sync</th><th>Private confirmation link</th></tr></thead>
          <tbody>{ticketOffers.map(offer => { const confirmation = ticketConfirmations.find(row => row.offerId === offer.id); return <tr key={offer.id}>
            <td className={styles.strong}>{offer.name}<br/><a href={`mailto:${offer.email}`}>{offer.email}</a>{offer.phone ? <><br/>{offer.phone}</> : null}</td>
            <td>Awards: {offer.awardsTicketsOffered}<br/>Nevada Mental Health Day: {offer.communityDayTicketsOffered}</td>
            <td>{confirmation ? when(confirmation.submittedAt) : <span className={styles.muted}>Awaiting response</span>}</td>
            <td>{confirmation ? <>Awards: {confirmation.awardsAttendees.length}<br/>Nevada Mental Health Day: {confirmation.communityDayAttendees.length}</> : "—"}</td>
            <td>{confirmation ? confirmation.mirrorStatus : "—"}{confirmation?.mirrorError ? <><br/><small>{confirmation.mirrorError}</small></> : null}</td>
            <td><a href={`/tickets/confirm/${offer.confirmationToken}`}>Open form</a></td>
          </tr>; })}</tbody>
        </table></div>}
      </section>
      <section className={styles.stats} aria-label="Ticket totals">
        <div className={`${styles.stat} ${styles.statPrimary}`}><span className={styles.statValue}>{totals.ticketsRequested}</span><span className={styles.statLabel}>Awards Show tickets</span><span className={styles.statNote}>Each guest’s newest Awards Show request, counted once per email. A later Nevada Mental Health Day-only form never removes it (each event is counted on its own)</span></div>
        <div className={`${styles.stat} ${styles.statPrimary}`}><span className={styles.statValue}>{totals.formsSubmitted}</span><span className={styles.statLabel}>Forms submitted</span><span className={styles.statNote}>Every RSVP submission received</span></div>
        {totals.moreInformation > 0 && <div className={styles.stat}><span className={styles.statValue}>{totals.moreInformation}</span><span className={styles.statLabel}>Asked for more information</span></div>}
        <div className={`${styles.stat} ${styles.statVip}`}><span className={styles.statValue}>{totals.vipTickets}</span><span className={styles.statLabel}>VIP tickets</span><span className={styles.statNote}>{totals.vipGuests} VIP {totals.vipGuests === 1 ? "guest" : "guests"} through the VIP link</span></div>
        <div className={`${styles.stat} ${styles.statLake}`}><span className={styles.statValue}>{totals.lakeLasVegasTickets}</span><span className={styles.statLabel}>Lake Las Vegas tickets</span><span className={styles.statNote}>{totals.lakeLasVegasGuests} {totals.lakeLasVegasGuests === 1 ? "guest" : "guests"} through the Lake Las Vegas form</span></div>
        <div className={`${styles.stat} ${styles.statNami}`}><span className={styles.statValue}>{totals.namiTickets}</span><span className={styles.statLabel}>NAMI tickets</span><span className={styles.statNote}>{totals.namiGuests} NAMI {totals.namiGuests === 1 ? "guest" : "guests"} through the NAMI form</span></div>
        <div className={`${styles.stat} ${styles.statUsta}`}><span className={styles.statValue}>{totals.ustaTickets}</span><span className={styles.statLabel}>USTA tickets</span><span className={styles.statNote}>{totals.ustaGuests} USTA {totals.ustaGuests === 1 ? "guest" : "guests"} through the USTA form</span></div>
        <div className={`${styles.stat} ${styles.statCommunity}`}><span className={styles.statValue}>{totals.communityDayTickets}</span><span className={styles.statLabel}>Community Day tickets</span><span className={styles.statNote}>{totals.communityDayGuests} {totals.communityDayGuests === 1 ? "guest" : "guests"} said yes to Community Day{totals.communityDayOnlyGuests > 0 ? ` · ${totals.communityDayOnlyGuests} Community Day only (${totals.communityDayOnlyTickets} ${totals.communityDayOnlyTickets === 1 ? "ticket" : "tickets"})` : ""}</span></div>
        {totals.guestDetailsMissingRequests > 0 && <a className={`${styles.stat} ${styles.statFollowUp}`} href="#guest-details-missing"><span className={styles.statValue}>{totals.guestDetailsMissingRequests}</span><span className={styles.statLabel}>Guest details missing</span><span className={styles.statNote}>Parties of 2+ sent without the other guests’ details ({totals.guestDetailsMissingTickets} seats). Still counted: a follow-up, not a cancellation</span></a>}
        <div className={styles.stat}><span className={styles.statValue}>{nominations.length}</span><span className={styles.statLabel}>Nominations</span></div>
      </section>

      <RsvpEmailTools earlierCount={totals.uniqueGuests} />

      {/* Owner (Oct 1): VIP requests (private VIP link) sit first in the one staff portal, with who invited them. */}
      <section className={styles.section} id="vip" aria-labelledby="vip-title">
        <div className={styles.sectionHead}><h2 id="vip-title">VIP RSVPs</h2><span className={`${styles.badge} ${styles.badgeVip}`}>{totals.vipGuests} guests · {totals.vipTickets} tickets</span><a className={styles.button} href="/api/staff/export?kind=rsvp&amp;form=vip">VIP list</a><a className={styles.button} href="/api/staff/export?kind=rsvp&amp;form=nami-vip">NAMI VIP list</a><a className={styles.button} href="/api/staff/export?kind=rsvp&amp;form=lake-las-vegas-vip">Lake Las Vegas VIP list</a></div>
        <p className={styles.help}>Requests from the private VIP RSVP links: VIP (artists, honorees, personal invitations), NAMI VIP and Lake Las Vegas VIP (the Form column says which). Organization, title and who invited them are required on that form. They also appear in the full list below with a <span className={`${styles.badge} ${styles.badgeVip}`}>VIP</span> badge.</p>
        {vip.length === 0 ? <p className={styles.empty}>No VIP RSVPs yet.</p> : <RsvpTable prefs={textPreferences} rows={vip} />}
      </section>

      {/* Owner (Oct 3): requests from the private Lake Las Vegas RSVP form, with their own seating list. */}
      <section className={styles.section} id="lake-las-vegas" aria-labelledby="lake-las-vegas-title">
        <div className={styles.sectionHead}><h2 id="lake-las-vegas-title">Lake Las Vegas RSVPs</h2><span className={`${styles.badge} ${styles.badgeLake}`}>{totals.lakeLasVegasGuests} guests · {totals.lakeLasVegasTickets} tickets</span><a className={styles.button} href="/api/staff/export?kind=rsvp&amp;form=lake-las-vegas">Download list</a></div>
        <p className={styles.help}>Requests from the private Lake Las Vegas RSVP link. They also appear in the full list below with a <span className={`${styles.badge} ${styles.badgeLake}`}>Lake Las Vegas</span> badge.</p>
        {lakeLasVegas.length === 0 ? <p className={styles.empty}>No Lake Las Vegas RSVPs yet.</p> : <RsvpTable prefs={textPreferences} rows={lakeLasVegas} />}
      </section>

      {/* Owner (Oct 2): requests from the NAMI form (/rsvp/nami), tagged NAMI; they also appear in the full list. */}
      <section className={styles.section} id="nami" aria-labelledby="nami-title">
        <div className={styles.sectionHead}><h2 id="nami-title">NAMI RSVPs</h2><span className={`${styles.badge} ${styles.badgeNami}`}>{totals.namiGuests} guests · {totals.namiTickets} tickets</span><a className={styles.button} href="/api/staff/export?kind=rsvp&amp;form=nami">Download list</a></div>
        <p className={styles.help}>Requests from NAMI's private RSVP link. They also appear in the full list below with a <span className={`${styles.badge} ${styles.badgeNami}`}>NAMI</span> badge.</p>
        {nami.length === 0 ? <p className={styles.empty}>No NAMI RSVPs yet.</p> : <RsvpTable prefs={textPreferences} rows={nami} />}
      </section>

      <section className={styles.section} id="usta" aria-labelledby="usta-title">
        <div className={styles.sectionHead}><h2 id="usta-title">USTA RSVPs</h2><span className={`${styles.badge} ${styles.badgeUsta}`}>{totals.ustaGuests} guests · {totals.ustaTickets} tickets</span><a className={styles.button} href="/api/staff/export?kind=rsvp&amp;form=usta">Download list</a></div>
        <p className={styles.help}>Requests from USTA's private Community Day + Awards RSVP link. They also appear in the full list below with a <span className={`${styles.badge} ${styles.badgeUsta}`}>USTA</span> badge.</p>
        {usta.length === 0 ? <p className={styles.empty}>No USTA RSVPs yet.</p> : <RsvpTable prefs={textPreferences} rows={usta} />}
      </section>

      <section className={styles.section} id="tickets" aria-labelledby="tickets-title">
        <div className={styles.sectionHead}><h2 id="tickets-title">Awards ticket requests</h2><a className={styles.button} href="/api/staff/export?kind=rsvp">Download CSV</a></div>
        <p className={styles.help}>Everything the RSVP form collects, newest first. Submitting the form is a waiting-list request, not a ticket. <span className={`${styles.badge} ${styles.badgeAwards}`}>Awards</span> = requested Awards Show tickets (every request counts as planning to attend); <span className={`${styles.badge} ${styles.badgeCommunity}`}>Community Day</span> = said yes to Community Day (asked from Sept 23; earlier requests show Awards only).</p>
        {active.length === 0 ? <p className={styles.empty}>No ticket requests yet.</p> : <RsvpTable prefs={textPreferences} rows={active} />}
      </section>

      <section className={styles.section} id="community-day" aria-labelledby="community-day-title">
        <div className={styles.sectionHead}><h2 id="community-day-title">Community Day RSVPs</h2><span className={`${styles.badge} ${styles.badgeCommunity}`}>{totals.communityDayGuests} guests · {totals.communityDayTickets} tickets</span></div>
        <p className={styles.help}>Guests who chose Nevada Mental Health Day (Community Day) on an RSVP form: Wellness & Check-In 12–2:30 PM, Summit Sessions 2:30–6:30 PM. Those also attending the Awards Show carry both badges.</p>
        {communityDay.length === 0 ? <p className={styles.empty}>No Community Day RSVPs yet.</p> : <RsvpTable prefs={textPreferences} rows={communityDay} />}
      </section>

      {/* Oct 21 (Cherrial, owner approved): parties sent without every guest's details stay active and counted; this list is the follow-up. */}
      <section className={styles.section} id="guest-details-missing" aria-labelledby="guest-details-missing-title">
        <div className={styles.sectionHead}><h2 id="guest-details-missing-title">Guest details missing</h2><span className={`${styles.badge} ${styles.badgeFollowUp}`}>{missingDetails.length} requests · {totals.guestDetailsMissingTickets} seats</span></div>
        <p className={styles.help}>Current requests for a party of two or more that did not include the other guests' name, email and phone (the older form did not ask). They stay on file and are counted in the totals above; ask the guest to send the form again with their guests (it updates their request instead of adding a second one).</p>
        {missingDetails.length === 0 ? <p className={styles.empty}>Every current party request has its guests' details.</p> : <RsvpTable prefs={textPreferences} rows={missingDetails} />}
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
        {removed.length === 0 ? <p className={styles.empty}>No removed requests.</p> : <RsvpTable prefs={textPreferences} rows={removed} action="restore" />}
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
        <div className={`${styles.stat} ${styles.statPrimary}`}><span className={styles.statValue}>{countedWorkshopRows.length}</span><span className={styles.statLabel}>Summit workshop sign-ups</span><span className={styles.statNote}>Test submissions excluded</span></div>
        {workshopGroups.map(group => <div key={group.key} className={styles.stat}><span className={styles.statValue}>{group.people.filter(row => !excludedFromPortalTotals(row)).length}</span><span className={styles.statLabel}>{group.title}</span><span className={styles.statNote}>{group.day}{group.time ? ` · ${group.time}` : ""}</span></div>)}
      </section>

      <section className={styles.section} id="workshop-list" aria-labelledby="workshops-title">
        <div className={styles.sectionHead}><h2 id="workshops-title">Summit workshops</h2><a className={styles.button} href="/api/staff/export?kind=workshops">Download CSV</a></div>
        <p className={styles.help}>Sign-ups from the Summit schedule page for Wellness &amp; Community Programming (Monday, November 2) and the Wellness Activity mornings (Tuesday, November 3 and Wednesday, November 4). Each date is its own list. Name only. The sign-up is for Summit attendees only; check each name against the guest list and remove anyone who is not on it.</p>
        {workshopRows.length === 0 ? <p className={styles.empty}>No workshop sign-ups yet.</p> : <div className={styles.cards}>{workshopGroups.map(group => <article key={group.key} className={styles.card}>
          <p className={styles.cardKicker}>{group.day}{group.time ? ` · ${group.time}` : ""}</p>
          <h3>{group.title} <span className={styles.count}>{group.people.filter(row => !excludedFromPortalTotals(row)).length}</span></h3>
          <ol className={styles.lineupList}>{group.people.map(row => <li key={row.id}><span className={styles.strong}>{row.name}</span>{excludedFromPortalTotals(row) && <span className={`${styles.badge} ${styles.badgeTest}`}>Test · excluded</span>}<span className={styles.muted}> · {when(row.submittedAt)}</span></li>)}</ol>
        </article>)}</div>}
      </section>
    </div>

    <div data-view="site-visit" id="site-visit" hidden>
      <section className={styles.stats} aria-label="Tennis and High Tea totals">
        <div className={`${styles.stat} ${styles.statTennis}`}><span className={styles.statValue}>{tennis}</span><span className={styles.statLabel}>Tennis</span><span className={styles.statNote}>People signed up · Thursday, November 5</span></div>
        <div className={`${styles.stat} ${styles.statTea}`}><span className={styles.statValue}>{highTea}</span><span className={styles.statLabel}>High Tea</span><span className={styles.statNote}>People signed up · Thursday, November 5</span></div>
        <div className={styles.stat}><span className={styles.statValue}>{countedSiteVisitPeople.filter(person => person.tennis && person.highTea).length}</span><span className={styles.statLabel}>Both</span></div>
        <div className={styles.stat}><span className={styles.statValue}>{countedSiteVisitPeople.length}</span><span className={styles.statLabel}>People in total</span><span className={styles.statNote}>Test submissions excluded</span></div>
      </section>

      <section className={styles.section} id="site-visit-list" aria-labelledby="site-visit-title">
        <div className={styles.sectionHead}><h2 id="site-visit-title">Tennis &amp; High Tea</h2><a className={styles.button} href="/api/staff/export?kind=site-visit">Download CSV</a></div>
        <p className={styles.help}>Thursday November 5 ICF site visit sign-ups from the Tennis &amp; High Tea form (notalonesummit.org/tennis-high-tea) and the schedule page. <span className={`${styles.badge} ${styles.badgeTennis}`}>Tennis</span> = signed up for Tennis; <span className={`${styles.badge} ${styles.badgeTea}`}>High Tea</span> = signed up for High Tea; both badges when both. Waiver = the full name typed to sign the activity waiver (sign-ups from Oct 7 on; earlier sign-ups show —). Attendees only; remove anyone not on the guest list.</p>
        {siteVisitPeople.length === 0 ? <p className={styles.empty}>No Tennis or High Tea sign-ups yet.</p> : <div className={styles.tableWrap}><table className={styles.table}>
          <thead><tr><th>Name</th><th>Signed up for</th><th>Email</th><th>Phone</th><th>Texts</th><th>Getting there</th><th>Waiver</th><th>First sign-up</th></tr></thead>
          <tbody>{siteVisitPeople.map(person => <tr key={person.key}><td className={styles.strong}>{person.name}{excludedFromPortalTotals(person) && <><br/><span className={`${styles.badge} ${styles.badgeTest}`}>Test · excluded from totals</span></>}</td><td><span className={styles.badges}>{person.tennis && <span className={`${styles.badge} ${styles.badgeTennis}`}>Tennis</span>}{person.highTea && <span className={`${styles.badge} ${styles.badgeTea}`}>High Tea</span>}</span></td><td>{person.email ? <a href={`mailto:${person.email}`}>{person.email}</a> : <span className={styles.muted}>—</span>}</td><td className={styles.nowrap}>{person.phone || <span className={styles.muted}>—</span>}</td><td className={styles.nowrap}><TextConsent record={{ phone: person.phone, email: person.email, textConsent: person.textConsent, submittedAt: person.first }} prefs={textPreferences} /></td><td className={styles.nowrap}>{person.transport ? siteVisitTransportLabels[person.transport] : <span className={styles.muted}>—</span>}</td><td className={styles.nowrap}>{person.signature ? `Signed: ${person.signature}` : <span className={styles.muted}>—</span>}</td><td className={styles.nowrap}>{when(person.first)}</td></tr>)}</tbody>
        </table></div>}
      </section>
    </div>

    {/* Oct 12 (Kristin via owner): the morning wellness classes (Nov 3 and 4) from notalonesummit.org/wellness, one list per class. */}
    <div data-view="wellness" id="wellness" hidden>
      <section className={styles.stats} aria-label="Wellness totals">
        <div className={`${styles.stat} ${styles.statPrimary}`}><span className={styles.statValue}>{wellnessPeople}</span><span className={styles.statLabel}>People signed up</span><span className={styles.statNote}>{countedWellnessRows.length} class sign-ups · tests excluded</span></div>
        {wellnessDays.map(day => { const count = countedWellnessRows.filter(row => row.sessionDay === day).length; return <div key={day} className={styles.stat}><span className={styles.statValue}>{count}</span><span className={styles.statLabel}>{day}</span><span className={styles.statNote}>Class sign-ups that morning</span></div>; })}
      </section>

      <section className={styles.section} id="wellness-list" aria-labelledby="wellness-title">
        <div className={styles.sectionHead}><h2 id="wellness-title">Wellness classes</h2><a className={styles.button} href="/api/staff/export?kind=wellness">Download CSV</a></div>
        <p className={styles.help}>Sign-ups from the wellness form (notalonesummit.org/wellness) for the Tuesday November 3 and Wednesday November 4 morning classes: Fitness, Pilates with Yvette Baker, Movement &amp; Breathwork and drop-in Pickleball. One list per class, oldest sign-up first. Waiver = the full name typed to sign the activity waiver. Attendees only; remove anyone not on the guest list.</p>
        {wellnessRows.length === 0 ? <p className={styles.empty}>No wellness sign-ups yet.</p> : <div className={styles.cards}>{wellnessGroups.map(group => <article key={group.key} className={styles.card}>
          <p className={styles.cardKicker}>{group.day} · {group.time}</p>
          <h3>{group.title} <span className={styles.count}>{group.people.filter(row => !excludedFromPortalTotals(row)).length}</span></h3>
          <ol className={styles.lineupList}>{group.people.map(row => <li key={row.id}><span className={styles.strong}>{row.name}</span>{excludedFromPortalTotals(row) && <span className={`${styles.badge} ${styles.badgeTest}`}>Test · excluded</span>}{row.email ? <> · <a href={`mailto:${row.email}`}>{row.email}</a></> : null}{row.phone ? <span className={styles.muted}> · {row.phone}</span> : null}<span className={styles.muted}> · Texts: <TextConsent record={row} prefs={textPreferences} /> · {row.signature ? `Signed: ${row.signature}` : "No waiver"} · {when(row.submittedAt)}</span></li>)}</ol>
        </article>)}</div>}
      </section>
    </div>

    {/* Oct 13 (owner / Ryan): requests for the closing night dinner and live performance with Jewel (Nov 4). */}
    <div data-view="closing-dinner" id="closing-dinner" hidden>
      <section className={styles.stats} aria-label="Closing Dinner totals">
        <div className={`${styles.stat} ${styles.statPrimary}`}><span className={styles.statValue}>{dinner.seatsRequested}</span><span className={styles.statLabel}>Seats requested</span><span className={styles.statNote}>Each request counted once per email (its latest)</span></div>
        <div className={styles.stat}><span className={styles.statValue}>{dinner.requests}</span><span className={styles.statLabel}>Requests</span><span className={styles.statNote}>{dinner.formsSubmitted} forms submitted</span></div>
        <div className={styles.stat}><span className={styles.statValue}>{dinner.withGuest}</span><span className={styles.statLabel}>Bringing a guest</span></div>
      </section>
      <section className={styles.section} id="closing-dinner-list" aria-labelledby="closing-dinner-title">
        <div className={styles.sectionHead}><h2 id="closing-dinner-title">Closing Dinner requests</h2><a className={styles.button} href="/api/staff/export?kind=closing-dinner">Download CSV</a></div>
        <p className={styles.help}>Closing night dinner and live performance with Jewel, Wednesday November 4, 7:00&ndash;10:00 PM, Margaux Ballroom at Wynn Las Vegas. Requests from the unlisted VIP form (notaloneawards.org/rsvp/closing-dinner-yiqy7fw0j3), oldest first: space is limited and first come, first served. A request is not a seat; the team emails each guest whose spot is secured.</p>
        {dinnerActive.length === 0 ? <p className={styles.empty}>No closing dinner requests yet.</p> : <div className={styles.tableWrap}><table className={styles.table}>
          <thead><tr><th>#</th><th>When</th><th>Name</th><th>Organization / title</th><th>Email</th><th>Phone</th><th>Seats</th><th>Guest</th><th>Texts</th><th>Notes</th></tr></thead>
          <tbody>{[...dinnerActive].sort((a, b) => a.submittedAt.localeCompare(b.submittedAt)).map((row, index) => <tr key={row.id}><td>{index + 1}</td><td className={styles.nowrap}>{when(row.submittedAt)}</td><td className={styles.strong}>{row.name}{excludedFromPortalTotals(row) && <><br/><span className={`${styles.badge} ${styles.badgeTest}`}>Test · excluded from totals</span></>}<br/><small>{waiverSummary(row.eventWaiver)}</small>{row.bringingGuest && <><br/><small>{row.guestName}: {waiverSummary(row.guestEventWaiver)}</small></>}</td><td>{[row.organization, row.professionalRole].filter(Boolean).join(" · ")}</td><td><a href={`mailto:${row.email}`}>{row.email}</a></td><td className={styles.nowrap}>{row.phone}</td><td>{closingDinnerSeats(row)}</td><td>{row.bringingGuest ? `${row.guestName} <${row.guestEmail}> ${row.guestPhone} ${[row.guestOrganization, row.guestProfessionalRole].filter(Boolean).join(" · ")}` : "—"}</td><td className={styles.nowrap}>{textConsentShortLabels[textConsentStatus(row, textPreferences)]}</td><td className={styles.notes}>{row.notes}</td></tr>)}</tbody>
        </table></div>}
      </section>
    </div>

    <div data-view="podcasts" id="podcasts" hidden>
      <PodcastBookings bookings={podcastBookings} />
    </div>

    {/* Oct 12 (owner): who may be texted. Never text an opted-out number; news only to "Yes"; every text ends "Reply STOP to opt out." */}
    <div data-view="texts" id="texts" hidden>
      <section className={styles.stats} aria-label="Text message consent totals">
        <div className={`${styles.stat} ${styles.statPrimary}`}><span className={styles.statValue}>{textCount("checkbox")}</span><span className={styles.statLabel}>Yes: may text</span><span className={styles.statNote}>Event, tickets and ICF news</span></div>
        <div className={styles.stat}><span className={styles.statValue}>{textCount("phone")}</span><span className={styles.statLabel}>Tickets only</span><span className={styles.statNote}>Phone given, no consent box yet: ask them on the text-updates page</span></div>
        <div className={styles.stat}><span className={styles.statValue}>{textCount("optedOut")}</span><span className={styles.statLabel}>Opted out</span><span className={styles.statNote}>Never text these numbers</span></div>
        <div className={styles.stat}><span className={styles.statValue}>{textContacts.length}</span><span className={styles.statLabel}>Phone numbers</span></div>
      </section>

      <section className={styles.section} id="texts-list" aria-labelledby="texts-title">
        <div className={styles.sectionHead}><h2 id="texts-title">Text message consent</h2><a className={styles.button} href="/api/staff/export?kind=texts">Download CSV</a></div>
        <p className={styles.help}>{textConsentProtocolNote}. <strong>Yes</strong> = ticked the consent box on a form or said yes on the text-updates page (event, tickets and Inspiring Children Foundation news). <strong>Tickets only</strong> = gave a phone number without the box: event and ticket texts only. <strong>Opted out</strong> = said no, replied STOP or asked staff: never text them. Every text must end with &ldquo;{textOptOutFooter}&rdquo; To ask the &ldquo;Tickets only&rdquo; guests for consent, send them the link <a href="https://notalonesummit.org/text-updates">notalonesummit.org/text-updates</a>.</p>
        <form method="post" action="/api/staff/text-preferences" className={styles.inlineForm}>
          <strong>Record a choice</strong>
          <input name="name" placeholder="Name" maxLength={180} />
          <input name="phone" placeholder="Phone *" required maxLength={40} />
          <input name="email" type="email" placeholder="Email" maxLength={254} />
          <select name="choice" defaultValue="no"><option value="no">Opted out</option><option value="yes">Said yes</option></select>
          <select name="via" defaultValue="stop-reply"><option value="stop-reply">Replied STOP</option><option value="staff">Told staff</option></select>
          <input name="note" placeholder="Note" maxLength={300} />
          <button type="submit" className={styles.button}>Save</button>
        </form>
        {textChoices.length === 0 ? <p className={styles.empty}>No opt-outs or text-updates page answers yet.</p> : <div className={styles.tableWrap}><table className={styles.table}>
          <thead><tr><th>When</th><th>Choice</th><th>Name</th><th>Phone</th><th>Email</th><th>How</th><th>Note</th></tr></thead>
          <tbody>{textChoices.map(pref => <tr key={pref.id}><td className={styles.nowrap}>{when(pref.submittedAt)}</td><td className={pref.choice === "no" ? styles.optedOut : styles.strong}>{pref.choice === "no" ? "Opted out" : "Yes"}</td><td>{pref.name}</td><td className={styles.nowrap}>{pref.phone}</td><td>{pref.email}</td><td className={styles.nowrap}>{pref.via === "page" ? "Text-updates page" : pref.via === "stop-reply" ? "Replied STOP" : "Told staff"}</td><td className={styles.notes}>{pref.note ?? ""}</td></tr>)}</tbody>
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

    <p className={styles.footer}>Texts column: {textConsentProtocolNote}. &ldquo;Yes&rdquo; = gave consent (event, tickets and ICF news); &ldquo;Tickets only&rdquo; = gave a phone number without the box (event and ticket texts only); &ldquo;Opted out&rdquo; = never text. Every text must end &ldquo;Reply STOP to opt out.&rdquo; See the Texts tab.</p>
    <p className={styles.footer}>Generated {when(generatedAt)} · Refreshes automatically every minute while open · Password-protected staff page · Not indexed</p>
  </main>;
}
