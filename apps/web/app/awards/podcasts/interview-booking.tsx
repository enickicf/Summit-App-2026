"use client";

import { useMemo, useState, type FormEvent } from "react";
import type { PodcastEntry } from "../../../lib/podcasts-2026";
import styles from "./podcasts.module.css";

type Format = "short" | "long";
type RequestWindow = { startUtc: string; endUtc: string };

const formatLabel = (format: Format) => format === "long" ? "Long form · 75 minutes" : "Short form · after your red carpet walk";
const when = (value: string) => new Intl.DateTimeFormat("en-US", { timeZone: "America/Los_Angeles", weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value));

export function InterviewBooking({ entry, startOpen = false }: { entry: PodcastEntry; startOpen?: boolean }) {
  const formats = useMemo(() => [
    ...(entry.formats.includes("Short form") ? ["short" as const] : []),
    ...(entry.formats.includes("Full-length interviews") ? ["long" as const] : [])
  ], [entry.formats]);
  const [selectedFormats, setSelectedFormats] = useState<Format[]>(formats.length === 1 ? formats : []);
  const [guestName, setGuestName] = useState("");
  const [email, setEmail] = useState("");
  const [requestWindow, setRequestWindow] = useState<RequestWindow | null>(null);
  const [travelVerified, setTravelVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [bookedFormats, setBookedFormats] = useState<Format[]>([]);
  const [started, setStarted] = useState(startOpen);
  const wantsLong = selectedFormats.includes("long");
  const wantsShort = selectedFormats.includes("short");

  function toggleFormat(format: Format) {
    setSelectedFormats(current => current.includes(format) ? current.filter(item => item !== format) : [...current, format]);
    setRequestWindow(null); setMessage("");
  }

  async function findTimes() {
    if (guestName.trim().length < 2 || !email.includes("@")) { setMessage("Enter the interview guest’s full name and email first."); return; }
    if (!wantsLong) { setMessage("Select long form to choose a scheduled time."); return; }
    setLoading(true); setMessage(""); setBookedFormats([]); setRequestWindow(null);
    const query = new URLSearchParams({ podcast: entry.show, guestName: guestName.trim(), format: "long" });
    const response = await fetch(`/api/podcast-bookings?${query}`, { cache: "no-store" });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) { setMessage(data.error ?? "Times could not be loaded."); return; }
    setRequestWindow(data.requestWindow); setTravelVerified(data.travelVerified);
    setMessage(data.requestWindow ? "Review the scheduling window, then send your request." : "No compatible long-form window is currently available. Production will follow up.");
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!selectedFormats.length) { setMessage("Choose short form, long form, or both."); return; }
    if (wantsLong && !requestWindow) { setMessage("Review the long-form availability window first."); return; }
    setLoading(true); setMessage("");
    const bookings = selectedFormats.map(format => ({ podcast: entry.show, guestName, email, format, startUtc: format === "long" ? requestWindow?.startUtc ?? "" : "", endUtc: format === "long" ? requestWindow?.endUtc ?? "" : "", room: "", travelVerified: format === "long" ? travelVerified : false, arrivalLocal: "", website: "" }));
    const response = await fetch("/api/podcast-bookings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bookings }) });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) { setMessage(data.error ?? "The booking could not be saved."); return; }
    setBookedFormats([...selectedFormats]);
    setMessage(wantsShort && wantsLong ? "Your long-form request was received, and your short-form interview is confirmed for after your red carpet walk. If the long-form request is accepted, the podcast will contact you with the confirmed time." : wantsShort ? "Your short-form interview is confirmed for after your red carpet walk." : "Your request was received. If it is accepted, the podcast will contact you with the confirmed interview time.");
  }

  if (!started) return <button type="button" className={styles.bookInterview} onClick={() => setStarted(true)}>Request an interview</button>;
  if (bookedFormats.length) return <div className={styles.bookingSuccess} role="status"><span>Request received</span><h3>{entry.show}</h3><p>{bookedFormats.map(format => <span key={format}>{formatLabel(format)}{format === "long" && requestWindow ? <><br />Scheduling window: {when(requestWindow.startUtc)}–{when(requestWindow.endUtc)}</> : null}</span>)}</p><strong>{message}</strong>{bookedFormats.includes("long") && <small>This is a request, not a confirmed long-form interview. If accepted, the podcast will coordinate one 75-minute interview time within the window shown. You will not be interviewed for the entire window.</small>}</div>;

  return <form className={styles.booking} onSubmit={submit}>
    <div className={styles.bookingTitle}><p className={styles.cardKicker}>Request an interview</p><h3>Choose one or both formats</h3></div>
    <div className={styles.bookingGrid}>
      <label>Interview guest’s full name<input value={guestName} onChange={event => { setGuestName(event.target.value); setRequestWindow(null); }} required /></label>
      <label>Email<input type="email" value={email} onChange={event => setEmail(event.target.value)} required /></label>
    </div>
    <fieldset><legend>Interview format</legend><div className={styles.formatChoices}>{formats.map(item => <label key={item} className={styles.formatChoice}><input type="checkbox" checked={selectedFormats.includes(item)} onChange={() => toggleFormat(item)} /><span><strong>{item === "long" ? "Long form" : "Short form"}</strong><small>{item === "long" ? "One 75-minute interview on Monday, November 2 · the exact time is coordinated after acceptance" : "Monday, November 2 · after your red carpet walk · no time selection needed"}</small></span></label>)}</div></fieldset>
    {wantsShort && !wantsLong ? <>
      <p className={styles.travelNote}>Your short-form interview will take place after your red carpet walk. No time selection is needed.</p>
      <button className={styles.confirmBooking} type="submit" disabled={loading}>{loading ? "Saving…" : "Request short-form interview"}</button>
    </> : wantsLong && !requestWindow ? <button type="button" className={styles.findTimes} onClick={findTimes} disabled={loading}>{loading ? "Checking availability…" : "See request window"}</button> : null}
    {requestWindow && <>
      <div className={styles.requestWindow}><span>If accepted, the podcast will coordinate one 75-minute interview time within this window</span><strong>{when(requestWindow.startUtc)}–{when(requestWindow.endUtc)}</strong><small>You do not need to be interviewed or remain on site for this entire window. The podcast will contact you with one exact time. {travelVerified ? "The window begins after the recorded guest and podcast arrivals." : "When no exact arrival time is on file, availability begins at 10:00 AM."}</small></div>
      <button className={styles.confirmBooking} type="submit" disabled={loading}>{loading ? "Sending request…" : wantsShort ? "Send both interview requests" : "Send long-form request"}</button>
    </>}
    {message && <p className={styles.bookingMessage} role="status">{message}</p>}
  </form>;
}
