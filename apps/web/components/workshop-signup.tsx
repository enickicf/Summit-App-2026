"use client";

import { useId, useState } from "react";
import type { WebScheduleItem } from "../lib/snapshot";
import { workshopDayLabel, workshopExclusivityNote, workshopTimeLabel } from "../lib/morning-workshops";
import styles from "../app/schedule/schedule.module.css";

// Owner (Sept 28): name-only sign-up for a wellness workshop or the Thursday Tennis / High Tea, shown only on the Summit schedule page.
export function WorkshopSignup({ item, eventTimeZone }: { item: Pick<WebScheduleItem, "id" | "title" | "startUtc">; eventTimeZone: string }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const day = workshopDayLabel(item.startUtc, eventTimeZone);
  const time = workshopTimeLabel(item.startUtc, eventTimeZone);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (name.trim().length < 2) { setError("Please enter your full name."); setState("error"); return; }
    setState("sending"); setError("");
    try {
      const response = await fetch("/api/workshops", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId: item.id, sessionTitle: item.title, sessionDay: day, sessionTime: time, name: name.trim(), website: (new FormData(event.currentTarget).get("website") as string) || "" }) });
      const body = await response.json().catch(() => ({}));
      if (!response.ok || !body?.ok) { setError(body?.error || "We could not save your sign-up. Please try again."); setState("error"); return; }
      setState("done");
    } catch {
      setError("We could not reach the server. Please try again."); setState("error");
    }
  }

  if (state === "done") return <p className={styles.signupDone} role="status">Thank you, {name.trim()}. You are signed up for {item.title} on {day} at {time}. Sign-ups are reviewed against the Summit guest list.</p>;
  return <div className={styles.signup}>
    {!open ? <button type="button" className={styles.signupButton} onClick={() => setOpen(true)}>Sign up</button> : (
      <form id={`${id}-form`} className={styles.signupForm} onSubmit={submit} noValidate>
        <p className={styles.signupNote}>{workshopExclusivityNote}</p>
        <label htmlFor={`${id}-name`}>Your full name</label>
        <div className={styles.signupRow}>
          <input id={`${id}-name`} name="name" type="text" autoComplete="name" required minLength={2} maxLength={120} value={name} onChange={event => setName(event.target.value)} disabled={state === "sending"} />
          <button type="submit" className={styles.signupButton} disabled={state === "sending"}>{state === "sending" ? "Signing up…" : "Sign up"}</button>
        </div>
        <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className={styles.signupHoneypot} defaultValue="" />
        {state === "error" && error ? <p className={styles.signupError} role="alert">{error}</p> : null}
      </form>
    )}
  </div>;
}
