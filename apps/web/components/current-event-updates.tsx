"use client";

import { getActiveOperationalNotices } from "@not-alone/domain";
import type { EventSnapshot } from "@not-alone/validation";
import { CircleAlert, Info, CalendarClock } from "lucide-react";
import { useEventClock } from "../app/schedule/use-event-clock";
import { usePublicationRefresh } from "../app/schedule/use-publication-refresh";
import styles from "./current-event-updates.module.css";

const severityDetails = {
  urgent: { label: "Urgent update", Icon: CircleAlert },
  change: { label: "Schedule change", Icon: CalendarClock },
  info: { label: "Event information", Icon: Info }
} as const;

const utcInstant = (value: string) => new Date(value).toISOString();

export function PublicEventNotices({ snapshot, nowUtc }: { snapshot: EventSnapshot; nowUtc: string }) {
  // Normalize precision for the shared selector's ISO comparisons, without
  // changing instants or allowing another event's records into this surface.
  const notices = getActiveOperationalNotices({
    ...snapshot,
    notices: snapshot.notices.filter(notice => notice.eventId === snapshot.event.id).map(notice => ({
      ...notice,
      startsAtUtc: utcInstant(notice.startsAtUtc),
      endsAtUtc: notice.endsAtUtc ? utcInstant(notice.endsAtUtc) : null
    })),
    scheduleItems: snapshot.scheduleItems.filter(item => item.eventId === snapshot.event.id).map(item => ({
      ...item, endUtc: utcInstant(item.endUtc)
    }))
  }, utcInstant(nowUtc), ["public"]);

  if (notices.length === 0) return null;

  return <section className={styles.strip} aria-label="Event updates">
    {notices.map(notice => {
      const { label, Icon } = severityDetails[notice.severity];
      return <article
        key={notice.id}
        className={styles.notice}
        data-severity={notice.severity}
        role={notice.severity === "urgent" ? "alert" : "status"}
        aria-atomic="true"
        aria-relevant="additions text"
      >
        <div className={styles.inner}>
          <p className={styles.severity}><Icon size={20} aria-hidden="true" /><span>{label}</span></p>
          <div className={styles.copy}><h2 className={styles.title}>{notice.title}</h2><p className={styles.body}>{notice.body}</p></div>
        </div>
      </article>;
    })}
  </section>;
}

export function CurrentEventUpdates({ snapshot, initialNowUtc }: { snapshot: EventSnapshot | null; initialNowUtc: string }) {
  const nowUtc = useEventClock(initialNowUtc);
  usePublicationRefresh();
  return snapshot ? <PublicEventNotices snapshot={snapshot} nowUtc={nowUtc} /> : null;
}
