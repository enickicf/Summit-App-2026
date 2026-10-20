import type { Metadata } from "next";
import { groupPublishedProgramByDay } from "@not-alone/domain";
import { ScheduleBrowser } from "../../components/schedule-browser";
import { getPublicSnapshotState } from "../../lib/snapshot";
import styles from "../schedule/schedule.module.css";

// Owner (Oct 20, 2026): "a full summit schedule link that includes the locations ... I can send that to people confirmed
// coming but make it a separate private link". Same schedule as /schedule with each session's room shown. Rooms stay off
// every public page (lib/room-privacy.ts), so this page is reached only by this unguessable address: not linked from any
// page or menu, not in the sitemap, never indexed or edge-cached. Share it with confirmed guests only.
export const metadata: Metadata = { title: "Summit Schedule (private)", robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } } };
export const dynamic = "force-dynamic";

export default async function PrivateSchedulePage() {
  const { snapshot } = await getPublicSnapshotState();
  const days = groupPublishedProgramByDay(snapshot);
  return (
    <main id="main-content" tabIndex={-1} className={styles.page}>
      <header className={styles.intro}>
        <p className={styles.eyebrow}>Not Alone Summit 2026 · for confirmed guests</p>
        <h1>Summit Schedule</h1>
        <p className={styles.dates}>{snapshot.event.dateLabel}<span aria-hidden="true"> · </span><span className={styles.venue}>{snapshot.event.venueName}</span></p>
        <p className={styles.privateNote}>This schedule includes room locations and is shared with confirmed guests only. Please do not post or forward the link.</p>
      </header>
      <ScheduleBrowser days={days} eventTimeZone={snapshot.event.timeZone} initialNowUtc={new Date().toISOString()} noticeSnapshot={null} showRooms />
    </main>
  );
}
