import { SiteImage } from "./site-image";
import { PortalAutoRefresh } from "./portal-auto-refresh";
import styles from "../app/staff/staff.module.css";
import type { InboxEntry } from "../lib/staff/submission-inbox";

const when = (iso: string) => new Date(iso).toLocaleString("en-US", { timeZone: "America/Los_Angeles", month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }) + " PT";

export function SubmissionReviewPortal({ needsAttention, anonymousFailures, generatedAt }: { needsAttention: InboxEntry[] | null; anonymousFailures: number; generatedAt: string }) {
  return <main id="main-content" tabIndex={-1} className={styles.page}>
    <PortalAutoRefresh />
    <header className={styles.top}>
      <div className={styles.brand}><SiteImage src="/images/na-summit-logo-black-2.png" alt="Not Alone Summit" sizes="72px" className={styles.brandLogo} /><div><p className={styles.eyebrow}>Not Alone 2026</p><h1>Submission Review</h1></div></div>
      <nav className={styles.viewTabs} aria-label="Submission review actions">
        <a href="/staff">Back to staff portal</a>
        <a href="/api/staff/export?kind=inbox">Download unresolved CSV</a>
        <a href="/api/staff/export?kind=inbox-all">Every submission received</a>
        <form method="post" action="/api/staff/logout"><button type="submit" className={styles.linkButton}>Sign out</button></form>
      </nav>
    </header>

    <section className={styles.section} aria-labelledby="submission-review-title" style={needsAttention && needsAttention.length ? { border: "2px solid #c62828", background: "#fff4f4" } : undefined}>
      <div className={styles.sectionHead}><h2 id="submission-review-title">{needsAttention === null ? "Submission check unavailable" : needsAttention.length ? `${needsAttention.length} submission${needsAttention.length === 1 ? "" : "s"} to review` : "All submissions saved"}</h2></div>
      <p className={styles.help}>{needsAttention === null ? "The submission inbox could not be read just now; refresh in a minute." : "Every request sent from any form is copied into a separate inbox before it is checked. Requests refused because of a missing field, unsigned waiver, duplicate submission, or server error appear here until the same guest has a saved request."}{anonymousFailures > 0 ? ` ${anonymousFailures} other refused request${anonymousFailures === 1 ? "" : "s"} had no name, email or phone and are available in the complete submission spreadsheet.` : ""}</p>
      {needsAttention && needsAttention.length > 0 && <div className={styles.tableWrap}><table className={styles.table}>
        <thead><tr><th>When</th><th>Form</th><th>Name</th><th>Email</th><th>Phone</th><th>What the guest saw</th><th>Everything they sent</th></tr></thead>
        <tbody>{needsAttention.map(entry => <tr key={entry.id}><td className={styles.nowrap}>{when(entry.receivedAt)}</td><td>{entry.endpoint}</td><td className={styles.strong}>{entry.name || "—"}</td><td>{entry.email ? <a href={`mailto:${entry.email}`}>{entry.email}</a> : "—"}</td><td className={styles.nowrap}>{entry.phone || "—"}</td><td>{entry.status} {entry.error}</td><td className={styles.notes}><details><summary>Show</summary><pre style={{ whiteSpace: "pre-wrap", maxWidth: 420, fontSize: 11 }}>{entry.body}</pre></details></td></tr>)}</tbody>
      </table></div>}
    </section>
    <p className={styles.footer}>Generated {when(generatedAt)} · Refreshes automatically every minute</p>
  </main>;
}
