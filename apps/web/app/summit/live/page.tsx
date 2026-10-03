import { getPublicSnapshotState } from "../../../lib/snapshot";
import { SnapshotSourceNotice } from "../../schedule/snapshot-source-notice";
import { eventTimeZoneLabel } from "../../schedule/schedule-presentation";
import { LiveCompanion } from "./live-companion";
import styles from "./live.module.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "Live Event Companion" };

export default async function LivePage() {
  const state = await getPublicSnapshotState();
  const { snapshot } = state;
  const nowUtc = new Date().toISOString();

  return (
    <main id="main-content" tabIndex={-1} className={styles.page}>
      <header className={styles.intro}>
        <div>
          <p className={styles.eyebrow}>{snapshot.event.name}</p>
          <h1>Event companion</h1>
          <p>{snapshot.event.dateLabel} | {snapshot.event.venueName}</p>
          <p>{eventTimeZoneLabel(snapshot.event.timeZone, nowUtc)}</p>
        </div>
      </header>
      <SnapshotSourceNotice state={state} />
      <LiveCompanion snapshot={snapshot} initialNowUtc={nowUtc} isUnverified={state.freshness === "unverified"} />
    </main>
  );
}
