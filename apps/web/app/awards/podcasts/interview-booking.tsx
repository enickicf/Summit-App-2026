"use client";

import { useMemo, useState, type FormEvent } from "react";
import type { PodcastEntry } from "../../../lib/podcasts-2026";
import styles from "./podcasts.module.css";

type Format = "short" | "long";
type Slot = { startUtc: string; endUtc: string; rooms: ("Room 1" | "Room 2" | "Room 3")[] };

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
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slot, setSlot] = useState("");
  const [room, setRoom] = useState("");
  const [travelVerified, setTravelVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [bookedFormats, setBookedFormats] = useState<Format[]>([]);
  const [started, setStarted] = useState(startOpen);
  const selected = slots.find(item => item.startUtc === slot);
  const wantsLong = selectedFormats.includes("long");
  const wantsShort = selectedFormats.includes("short");

  function toggleFormat(format: Format) {
    setSelectedFormats(current => current.includes(format) ? current.filter(item => item !== format) : [...current, format]);
    setSlots([]); setSlot(""); setRoom(""); setMessage("");
  }

  async function findTimes() {
    if (guestName.trim().length < 2 || !email.includes("@")) { setMessage("Enter the interview guest’s full name and email first."); return; }
    if (!wantsLong) { setMessage("Select long form to choose a scheduled time."); return; }
    setLoading(true); setMessage(""); setBookedFormats([]); setSlot(""); setRoom("");
    const query = new URLSearchParams({ podcast: entry.show, guestName: guestName.trim(), format: "long" });
    const response = await fetch(`/api/podcast-bookings?${query}`, { cache: "no-store" });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) { setMessage(data.error ?? "Times could not be loaded."); return; }
    setSlots(data.slots); setTravelVerified(data.travelVerified);
    setMessage(data.slots.length ? "Choose a time and an available recording room." : "No compatible times are currently available. Production will follow up.");
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!selectedFormats.length) { setMessage("Choose short form, long form, or both."); return; }
    if (wantsLong && (!selected || !room)) { setMessage("Choose a time and room for the long-form interview."); return; }
    setLoading(true); setMessage("");
    const bookings = selectedFormats.map(format => ({ podcast: entry.show, guestName, email, format, startUtc: format === "long" ? selected?.startUtc ?? "" : "", endUtc: format === "long" ? selected?.endUtc ?? "" : "", room: format === "long" ? room : "", travelVerified: format === "long" ? travelVerified : false, arrivalLocal: "", website: "" }));
    const response = await fetch("/api/podcast-bookings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bookings }) });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) { setMessage(data.error ?? "The booking could not be saved."); return; }
    setBookedFormats([...selectedFormats]);
    setMessage(wantsShort && wantsLong ? "Your long-form interview is booked, and your short-form interview is confirmed for after your red carpet walk." : wantsShort ? "Your short-form interview is confirmed for after your red carpet walk." : "Your long-form interview time is booked.");
  }

  if (!started) return <button type="button" className={styles.bookInterview} onClick={() => setStarted(true)}>Book an interview</button>;
  if (bookedFormats.length) return <div className={styles.bookingSuccess} role="status"><span>Booking received</span><h3>{entry.show}</h3><p>{bookedFormats.map(format => <span key={format}>{formatLabel(format)}{format === "long" && selected ? <><br />{when(selected.startUtc)} · {room}</> : null}</span>)}</p><strong>{message}</strong>{bookedFormats.includes("long") && <small>The exact room location will be announced closer to the event.</small>}</div>;

  return <form className={styles.booking} onSubmit={submit}>
    <div className={styles.bookingTitle}><p className={styles.cardKicker}>Book an interview</p><h3>Choose one or both formats</h3></div>
    <div className={styles.bookingGrid}>
      <label>Interview guest’s full name<input value={guestName} onChange={event => { setGuestName(event.target.value); setSlots([]); }} required /></label>
      <label>Email<input type="email" value={email} onChange={event => setEmail(event.target.value)} required /></label>
    </div>
    <fieldset><legend>Interview format</legend><div className={styles.formatChoices}>{formats.map(item => <label key={item} className={styles.formatChoice}><input type="checkbox" checked={selectedFormats.includes(item)} onChange={() => toggleFormat(item)} /><span><strong>{item === "long" ? "Long form" : "Short form"}</strong><small>{item === "long" ? "75-minute recording (1+ hour) · available times begin at 10:00 AM or after recorded arrivals" : "After your red carpet walk · no time selection needed"}</small></span></label>)}</div></fieldset>
    {wantsShort && !wantsLong ? <>
      <p className={styles.travelNote}>Your short-form interview will take place after your red carpet walk. No time selection is needed.</p>
      <button className={styles.confirmBooking} type="submit" disabled={loading}>{loading ? "Saving…" : "Request short-form interview"}</button>
    </> : wantsLong ? <button type="button" className={styles.findTimes} onClick={findTimes} disabled={loading}>{loading ? "Checking arrivals and rooms…" : "See available times"}</button> : null}
    {slots.length > 0 && <>
      <div className={styles.travelNote}>{travelVerified ? "Times shown begin after the recorded guest and podcast availability." : "Times account for recorded podcast availability. When no guest arrival time is on file, availability begins at 10:00 AM."}</div>
      <label>Available time<select value={slot} onChange={event => { setSlot(event.target.value); setRoom(""); }} required><option value="">Select a time</option>{slots.map(item => <option key={item.startUtc} value={item.startUtc}>{when(item.startUtc)}</option>)}</select></label>
      {selected && <fieldset><legend>Recording room</legend><div className={styles.roomChoices}>{selected.rooms.map(item => <label key={item}><input type="radio" name={`room-${entry.show}`} value={item} checked={room === item} onChange={() => setRoom(item)} /><span>{item}<small>Exact location announced closer to the event</small></span></label>)}</div></fieldset>}
      <button className={styles.confirmBooking} type="submit" disabled={loading || !slot || !room}>{loading ? "Saving…" : wantsShort ? "Book both interviews" : "Confirm long-form interview"}</button>
    </>}
    {message && <p className={styles.bookingMessage} role="status">{message}</p>}
  </form>;
}
