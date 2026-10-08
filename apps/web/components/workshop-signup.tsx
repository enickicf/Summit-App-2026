"use client";

import { useId, useState } from "react";
import type { WebScheduleItem } from "../lib/snapshot";
import { signatureMatchesName, siteVisitWaiver, waiverRequiredFor, workshopCategory, workshopDayLabel, workshopExclusivityNote, workshopTimeLabel } from "../lib/morning-workshops";
import styles from "../app/schedule/schedule.module.css";

// Owner (Sept 28): name-only sign-up for a wellness workshop or the Thursday Tennis / High Tea, shown only on the Summit schedule page.
// Owner (Oct 7): the Tennis / High Tea sign-up asks for the full name, shows the waiver, and needs the box ticked and the full
// name typed again as the signature before "Sign up". `defaultOpen` renders the form straight away (used by the tests).
export function WorkshopSignup({ item, eventTimeZone, defaultOpen = false }: { item: Pick<WebScheduleItem, "id" | "title" | "startUtc">; eventTimeZone: string; defaultOpen?: boolean }) {
  const id = useId();
  const [open, setOpen] = useState(defaultOpen);
  const [name, setName] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [signature, setSignature] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const day = workshopDayLabel(item.startUtc, eventTimeZone);
  const time = workshopTimeLabel(item.startUtc, eventTimeZone);
  const waiver = waiverRequiredFor(workshopCategory(item.title));
  const sending = state === "sending";

  function fail(message: string) { setError(message); setState("error"); }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (name.trim().length < 2) return fail("Please enter your full name.");
    if (waiver) {
      if (!accepted) return fail("Please read the waiver and tick the box to agree to it.");
      if (signature.trim().length < 2) return fail("Please type your full name to sign the waiver.");
      if (!signatureMatchesName(signature, name)) return fail(`Your signature needs to match the full name above. Please type “${name.trim()}” exactly as entered.`);
    }
    setState("sending"); setError("");
    const payload = {
      sessionId: item.id, sessionTitle: item.title, sessionDay: day, sessionTime: time, name: name.trim(),
      ...(waiver ? { waiverAccepted: true, signature: signature.trim(), waiverVersion: siteVisitWaiver.version } : {}),
      website: (new FormData(event.currentTarget).get("website") as string) || ""
    };
    try {
      const response = await fetch("/api/workshops", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const body = await response.json().catch(() => ({}));
      if (!response.ok || !body?.ok) return fail(body?.error || "We could not save your sign-up. Please try again.");
      setState("done");
    } catch {
      fail("We could not reach the server. Please try again.");
    }
  }

  if (state === "done") return <p className={styles.signupDone} role="status">Thank you, {name.trim()}. You are signed up for {item.title} on {day} at {time}.{waiver ? " Your signed waiver is on file." : ""} Sign-ups are reviewed against the Summit guest list.</p>;
  return <div className={styles.signup}>
    {!open ? <button type="button" className={styles.signupButton} onClick={() => setOpen(true)}>Sign up</button> : (
      <form id={`${id}-form`} className={styles.signupForm} onSubmit={submit} noValidate>
        <div className={styles.signupField}>
          <label htmlFor={`${id}-name`}>Your full name</label>
          <input id={`${id}-name`} name="name" type="text" autoComplete="name" required minLength={2} maxLength={120} value={name} onChange={event => setName(event.target.value)} disabled={sending} />
        </div>
        <p className={styles.signupNote}>{workshopExclusivityNote}</p>
        {waiver && <>
          <p className={styles.signupWaiver} id={`${id}-waiver`}><strong>Waiver.</strong> {siteVisitWaiver.text}</p>
          <label className={styles.signupCheck} htmlFor={`${id}-agree`}>
            <input id={`${id}-agree`} type="checkbox" name="waiverAccepted" required checked={accepted} onChange={event => setAccepted(event.target.checked)} aria-describedby={`${id}-waiver`} disabled={sending} />
            <span>I have read and agree to the waiver</span>
          </label>
          <div className={styles.signupField}>
            <label htmlFor={`${id}-signature`}>Type your full name to sign</label>
            <input id={`${id}-signature`} name="signature" type="text" autoComplete="off" required minLength={2} maxLength={120} value={signature} onChange={event => setSignature(event.target.value)} disabled={sending} />
          </div>
        </>}
        <div className={styles.signupRow}>
          <button type="submit" className={styles.signupButton} disabled={sending}>{sending ? "Signing up…" : "Sign up"}</button>
        </div>
        <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className={styles.signupHoneypot} defaultValue="" />
        {state === "error" && error ? <p className={styles.signupError} role="alert">{error}</p> : null}
      </form>
    )}
  </div>;
}
