import { groupPublishedProgramByDay } from "@not-alone/domain";
import { ScheduleBrowser } from "../../components/schedule-browser";
import { getPublicSnapshotState } from "../../lib/snapshot";
import { noticeOnlySnapshot, summitScheduleShowsRooms, withoutRooms } from "../../lib/room-privacy";
import { SnapshotSourceNotice } from "./snapshot-source-notice";
import styles from "./schedule.module.css";

export const metadata = { title: "Summit Schedule" };

// Oct 19 (Sophie, Sat; per-day QR codes): /schedule/<YYYY-MM-DD> renders this same page with that day selected
// (app/schedule/[day]/page.tsx). /schedule itself is unchanged (today, or the first upcoming day).
export default async function SchedulePage({ initialDay }: { initialDay?: string } = {}) {
  const state = await getPublicSnapshotState();
  const { snapshot } = state;
  const days = groupPublishedProgramByDay(snapshot);

  return (
    <main id="main-content" tabIndex={-1} className={styles.page}>
      <header className={styles.intro}>
        <p className={styles.eyebrow}>Not Alone Summit 2026</p>
        <h1>Summit Schedule</h1>
        <p className={styles.dates}>{snapshot.event.dateLabel}<span aria-hidden="true"> · </span><span className={styles.venue}>{snapshot.event.venueName}</span></p>
      </header>
      <SnapshotSourceNotice state={state} compact />
      <ScheduleBrowser days={summitScheduleShowsRooms ? days : withoutRooms(days)} showRooms={summitScheduleShowsRooms} eventTimeZone={snapshot.event.timeZone} initialNowUtc={new Date().toISOString()} noticeSnapshot={state.source === "published" ? noticeOnlySnapshot(snapshot) : null} initialDay={initialDay} />
    </main>
  );
}
