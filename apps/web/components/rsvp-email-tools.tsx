"use client";

import { useState } from "react";
import styles from "../app/staff/staff.module.css";

// Owner (Oct 3, 2026): staff can send a test confirmation and the one-time catch-up from the portal itself.
export function RsvpEmailTools({ earlierCount }: { earlierCount: number }) {
  const [to, setTo] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const call = async (body: object) => {
    setBusy(true); setStatus(null);
    try {
      const response = await fetch("/api/staff/rsvp-emails", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      const result = await response.json().catch(() => ({ ok: false, error: `Request failed (${response.status}).` }));
      return result as { ok: boolean; error?: string; sent?: string | string[]; skipped?: number; failed?: string[] };
    } finally { setBusy(false); }
  };
  const sendTest = async () => {
    const result = await call({ mode: "test", to });
    setStatus(result.ok ? `Test email sent to ${result.sent}. Check that inbox (and spam).` : `Not sent: ${result.error}`);
  };
  const sendEarlier = async () => {
    if (!window.confirm(`Send the confirmation email once to everyone who RSVPed before it existed (about ${earlierCount} addresses)? Anyone already emailed is skipped.`)) return;
    const result = await call({ mode: "backfill" });
    setStatus(result.ok ? `Sent to ${(result.sent as string[]).length} guests · ${result.skipped ?? 0} skipped (already emailed) · ${(result.failed ?? []).length} failed${(result.failed ?? []).length ? `: ${(result.failed ?? []).join(", ")}` : ""}.` : `Not sent: ${result.error}`);
  };
  return <section className={styles.section} id="confirmation-emails" aria-labelledby="confirmation-emails-title">
    <div className={styles.sectionHead}><h2 id="confirmation-emails-title">Confirmation emails</h2><a className={styles.button} href="/api/staff/rsvp-emails" target="_blank" rel="noreferrer">Preview the email</a></div>
    <p className={styles.help}>Every new RSVP gets an automatic email from music@inspiringchildren.org confirming we received it and that tickets follow by email if they come off the waiting list.</p>
    <div className={styles.emailTools}>
      <label>Send a test to <input type="email" value={to} onChange={event => setTo(event.target.value)} placeholder="you@example.com" /></label>
      <button type="button" className={styles.button} disabled={busy || !to} onClick={sendTest}>Send test</button>
      <button type="button" className={styles.button} disabled={busy} onClick={sendEarlier}>Send to earlier RSVPs</button>
    </div>
    {status && <p className={styles.help} role="status">{status}</p>}
  </section>;
}
