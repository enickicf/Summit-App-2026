"use client";

import { useId, useRef, useState } from "react";
import { Lock } from "lucide-react";
import type { EventSnapshot } from "@not-alone/validation";
import { PublicEventNotices } from "./current-event-updates";
import {
  eventDateKey,
  formatSessionTimes,
  groupSessionsByStart,
  initialScheduleDay,
  isFoundersOnly,
  scheduleDayForKey,
  scheduleStatusLabels,
  sessionDisplaySummary,
  type ScheduleDay,
  tabIndexForKey
} from "../app/schedule/schedule-presentation";
import { isPokerNight, pokerNight } from "../lib/poker-night-links";
import { isWorkshopSignup } from "../lib/morning-workshops";
import { isWellnessSignupEntry, wellnessSignupPath } from "../lib/wellness-signups-2026";
import { sessionAttire } from "../lib/schedule-website-rules";
import { WorkshopSignup } from "./workshop-signup";
import styles from "../app/schedule/schedule.module.css";
import { useEventClock } from "../app/schedule/use-event-clock";
import { usePublicationRefresh } from "../app/schedule/use-publication-refresh";
import { publicPendingProgramBlocks } from "../app/schedule/pending-program";

export function ScheduleBrowser({ days, eventTimeZone, initialNowUtc, noticeSnapshot, showRooms = false }: {
  days: ScheduleDay[];
  eventTimeZone: string;
  initialNowUtc: string;
  noticeSnapshot?: EventSnapshot | null;
  // Owner / Ryan (Sept 29): rooms inside Wynn are shown only on the private venue guide (lib/room-privacy.ts).
  showRooms?: boolean;
}) {
  const id = useId();
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const [activeDay, setActiveDay] = useState(() => initialScheduleDay(days, eventDateKey(initialNowUtc, eventTimeZone)));
  const nowUtc = useEventClock(initialNowUtc);
  usePublicationRefresh();
  const selected = scheduleDayForKey(days, activeDay, eventDateKey(nowUtc, eventTimeZone));

  const notices = noticeSnapshot ? <PublicEventNotices snapshot={noticeSnapshot} nowUtc={nowUtc} /> : null;
  if (!selected) return <>{notices}<div className={styles.empty}>
    <p>The published schedule will appear here when available.</p>
  </div></>;

  return (
    <>{notices}<div className={styles.browser}>
      <div className={styles.days} role="tablist" aria-label="Schedule days">
        {days.map((day, index) => (
          <button
            key={day.date}
            ref={(node) => { tabs.current[index] = node; }}
            id={`${id}-tab-${day.date}`}
            type="button"
            role="tab"
            aria-controls={`${id}-panel-${day.date}`}
            aria-label={day.dayLabel}
            aria-selected={day.date === selected.date}
            tabIndex={day.date === selected.date ? 0 : -1}
            onClick={() => setActiveDay(day.date)}
            onKeyDown={(event) => {
              const next = tabIndexForKey(event.key, index, days.length);
              if (next === undefined) return;
              event.preventDefault();
              setActiveDay(days[next]!.date);
              tabs.current[next]?.focus();
            }}
          >
            <strong>{day.weekday}</strong>
            <span>{day.shortDate}</span>
          </button>
        ))}
      </div>

      {days.map(day => (
        <div
          key={day.date}
          id={`${id}-panel-${day.date}`}
          role="tabpanel"
          aria-labelledby={`${id}-tab-${day.date}`}
          tabIndex={0}
          hidden={day.date !== selected.date}
          className={styles.panel}
        >
          {day.date === selected.date ? <>
            {groupSessionsByStart(day.items).map(({ startUtc, items }) => (
              <section className={styles.timeGroup} key={startUtc} aria-labelledby={`${id}-time-${startUtc}`}>
                <h2 id={`${id}-time-${startUtc}`}>
                  <time dateTime={startUtc}>{formatSessionTimes(items[0]!, eventTimeZone).start}</time>
                </h2>
                <div className={styles.sessions}>
                  {items.map((item) => {
                    const times = formatSessionTimes(item, eventTimeZone);
                    const summary = sessionDisplaySummary(item);
                    const foundersOnly = isFoundersOnly(item);
                    return (
                      <article
                        className={styles.session}
                        data-status={item.status}
                        data-founders-only={foundersOnly || undefined}
                        key={item.id}
                        aria-labelledby={`${id}-session-${item.id}`}
                      >
                        <div className={styles.topline}>
                          {/* No end time in the source: none is shown (never "Until" the start time). */}
                          {item.endUtc !== item.startUtc && <span>Until <time dateTime={item.endUtc}>{times.end}</time></span>}
                          {item.featured ? <strong>Featured</strong> : null}
                          {scheduleStatusLabels(item, nowUtc).map(label => <strong key={label}>{label}</strong>)}
                        </div>
                        {/* Ryan (Oct 8): a founders-only event is marked with a red asterisk after its title (legend under the day). */}
                        <h3 id={`${id}-session-${item.id}`}>{item.title}{foundersOnly ? <> <span className={styles.foundersMark} aria-hidden="true">*</span><span className="srOnly">Founders-only event</span></> : null}</h3>
                        {/* Owner (Oct 7): other private events are listed and marked "Invite only" rather than hidden. */}
                        {!foundersOnly && item.eligibilityScope.id === "invite-only" ? <p className={styles.inviteOnly}><Lock size={15} aria-hidden="true" />Invite only</p> : null}
                        {summary ? <p>{summary}</p> : null}
                        {/* Owner (Oct 7): the Attire column from Airtable's Run of Show, for every event that carries one. */}
                        {sessionAttire(item) ? <p className={styles.attire}><span>Attire</span>{sessionAttire(item)}</p> : null}
                        {showRooms && <p className={styles.location}><span>Location</span>{/^location to be confirmed\.?$/i.test(item.locationName.trim()) ? "To be confirmed" : item.locationName}</p>}
                        {/* Owner (Sept 28): the poker night has its own site and its own RSVP; this entry is
                            the only place on the Summit site that links to them. */}
                        {isPokerNight(item.title) && pokerNight.live ? <p className={styles.pokerLinks}>
                          <a href={pokerNight.site} target="_blank" rel="noopener noreferrer">RSVP &amp; details</a>
                        </p> : null}
                        {/* Owner (Sept 28): name-only sign-up for the wellness workshops and the Thursday Tennis / High Tea, on the schedule page only. */}
                        {isWellnessSignupEntry(item.title) ? <p className={styles.pokerLinks}><a href={wellnessSignupPath}>Sign up for wellness classes</a></p> : null}
                        {isWorkshopSignup(item) ? <WorkshopSignup item={item} eventTimeZone={eventTimeZone} /> : null}
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}
            {day.notes.map(note => <div key={note.id} aria-label={note.title}>
              {publicPendingProgramBlocks(note.body).map((block, index) => block.start ? <section className={styles.timeGroup} key={index}>
                <h2>{block.start}</h2><div className={styles.sessions}><article className={styles.session}><h3>{block.title}</h3>{block.detail && <p>{block.detail}</p>}</article></div>
              </section> : <p className={styles.pending} key={index}>{block.detail}</p>)}
            </div>)}
            {day.items.some(isFoundersOnly) ? <p className={styles.foundersLegend}><span className={styles.foundersMark} aria-hidden="true">*</span> Founders-only event</p> : null}
            {day.items.length === 0 && day.notes.length === 0 ? <p className={styles.empty}>No published sessions for this day.</p> : null}
          </> : null}
        </div>
      ))}
    </div></>
  );
}
