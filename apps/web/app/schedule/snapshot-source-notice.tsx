import type { PublicSnapshotState } from "../../lib/snapshot";
import styles from "./schedule.module.css";

export function SnapshotSourceNotice({ state, compact = false }: { state: PublicSnapshotState; compact?: boolean }) {
  if (state.freshness === "current") return null;
  const publishedAt = state.latestSchedulePublishedAtUtc;
  const date = publishedAt ? new Intl.DateTimeFormat("en-US", {
    timeZone: state.snapshot.event.timeZone,
    month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short"
  }).format(new Date(publishedAt)) : null;

  const content = <>
    <p><strong>Current publication unavailable.</strong> Showing the reviewed bundled program, which may be out of date.</p>
    <p>{publishedAt ? <>Latest included session publication: <time dateTime={publishedAt}>{date}</time>.</> : "Session publication date unavailable."}</p>
  </>;
  return <aside className={`${styles.sourceNotice}${compact ? ` ${styles.sourceNoticeCompact}` : ""}`} aria-label="Program freshness">
    {compact ? <details><summary>Bundled program, freshness unverified</summary>{content}</details> : content}
  </aside>;
}
