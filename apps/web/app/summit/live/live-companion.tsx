"use client";

import { getCountdownLabel } from "@not-alone/domain";
import type { EventSnapshot, ScheduleItem } from "@not-alone/validation";
import Link from "next/link";
import { formatSessionTimes, sessionDisplaySummary } from "../../schedule/schedule-presentation";
import { useEventClock } from "../../schedule/use-event-clock";
import { usePublicationRefresh } from "../../schedule/use-publication-refresh";
import { liveEventState } from "./live-state";
import { roomsPublic } from "../../../lib/room-privacy";
import { PublicEventNotices } from "../../../components/current-event-updates";
import styles from "./live.module.css";

function SessionFacts({ item, timeZone }: { item: ScheduleItem; timeZone: string }) {
  const times = formatSessionTimes(item, timeZone);
  const day = new Intl.DateTimeFormat("en-US", { timeZone, weekday: "long", month: "short", day: "numeric" }).format(new Date(item.startUtc));
  return <p className={styles.facts}>
    <span>{day}</span>
    <span><time dateTime={item.startUtc}>{times.start}</time> - <time dateTime={item.endUtc}>{times.end}</time></span>
    {roomsPublic && <span><strong>Location: </strong>{item.locationName}</span>}
    <span><strong>Access: </strong>{item.eligibilityScope.label}</span>
  </p>;
}

export function LiveCompanion({ snapshot, initialNowUtc, isUnverified = false }: { snapshot: EventSnapshot; initialNowUtc: string; isUnverified?: boolean }) {
  const nowUtc = useEventClock(initialNowUtc);
  usePublicationRefresh();
  const { current, next, upcoming, mode, pendingDays } = liveEventState(snapshot, nowUtc);
  const later = upcoming.slice(current.length ? 0 : 1, current.length ? 3 : 4);
  const status = mode === "current" ? "Scheduled now" : mode === "upcoming" ? "Coming up"
    : mode === "pending" ? "Timing pending" : mode === "after" ? "Published program complete" : "Schedule pending";

  return <>
    <p className={styles.status} role="status" aria-live="polite" aria-atomic="true">{isUnverified ? `Bundled schedule: ${status}` : status}</p>

    {!isUnverified && <PublicEventNotices snapshot={snapshot} nowUtc={nowUtc} />}

    <section className={styles.now} aria-label="Current program status">
      {current.length > 0 ? current.map(item => {
        const summary = sessionDisplaySummary(item);
        return <article key={item.id}>
          <h2>{item.title}</h2>
          {summary ? <p>{summary}</p> : null}
          <SessionFacts item={item} timeZone={snapshot.event.timeZone} />
        </article>;
      }) : next ? <article>
        <h2>{next.title}</h2>
        <p>Scheduled to begin in {getCountdownLabel(next.startUtc, nowUtc)}.</p>
        <SessionFacts item={next} timeZone={snapshot.event.timeZone} />
      </article> : mode === "pending" ? <>
        <h2>Program timing to be confirmed</h2>
        <p>No additional timed sessions are published. Activities with unconfirmed timing are listed below.</p>
      </> : mode === "after" ? <>
        <h2>{isUnverified ? "No later times in the bundled program." : "The published program has concluded."}</h2>
        <p>Event information and resources remain available.</p>
      </> : <>
        <h2>Schedule pending</h2>
        <p>No upcoming session times are currently published.</p>
      </>}
    </section>

    {pendingDays.map(day => <section key={day.date} className={styles.pending} aria-label={`${day.dayLabel}: timing pending`}>
      <h2>{day.dayLabel}</h2>
      {day.notes.map(note => <div key={note.id}>
        <h3>{note.title}</h3>
        {note.body.split(/\r?\n\s*\r?\n/).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
      </div>)}
    </section>)}

    <section className={styles.next} aria-labelledby="next-sessions">
      <h2 id="next-sessions">Next</h2>
      {later.length > 0 ? later.map(item => <article key={item.id}>
        <h3>{item.title}</h3>
        <SessionFacts item={item} timeZone={snapshot.event.timeZone} />
      </article>) : <p>No additional timed sessions are published.</p>}
    </section>

    <nav className={styles.links} aria-label="Event information">
      <Link href="/schedule">Full schedule</Link>
      <Link href="/venue">Venue</Link>
      <Link href="/contact">Event help</Link>
    </nav>
  </>;
}
