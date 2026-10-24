"use client";

import { useMemo, useState, type FormEvent } from "react";
import type { PodcastEntry } from "../../../lib/podcasts-2026";
import styles from "./podcasts.module.css";

type Format = "short" | "long";
type Slot = { startUtc: string; endUtc: string; rooms: ("Room 1" | "Room 2" | "Room 3")[] };

const formatLabel = (format: Format) => format === "long" ? "Long form · 75 minutes" : "Short form · 20 minutes";
const when = (value: string) => new Intl.DateTimeFormat("en-US", { timeZone: "America/Los_Angeles", weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value));

export function InterviewBooking({ entry }: { entry: PodcastEntry }) {
  const formats = useMemo(() => [
    ...(entry.formats.includes("Short form") ? ["short" as const] : []),
    ...(entry.formats.includes("Full-length interviews") ? ["long" as const] : [])
  ], [entry.formats]);
  const [format, setFormat] = useState<Format>(formats[0] ?? "short");
  const [guestName, setGuestName] = useState("");
  const [email, setEmail] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slot, setSlot] = useState("");
  const [room, setRoom] = useState("");
  const [arrivalKnown, setArrivalKnown] = useState(false);
  const [travelVerified, setTravelVerified] = useState(false);
  const [needsArrival, setNeedsArrival] = useState(false);
  const [arrivalLocal, setArrivalLocal] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [booked, setBooked] = useState(false);
  const [started, setStarted] = useState(false);
  const selected = slots.find(item => item.startUtc === slot);

  async function findTimes() {
    if (guestName.trim().length < 2 || !email.includes("@")) { setMessage("Enter the interview guest’s full name and email first."); return; }
    setLoading(true); setMessage(""); setBooked(false); setSlot(""); setRoom("");
    const query = new URLSearchParams({ podcast: entry.show, guestName: guestName.trim(), format, ...(arrivalLocal ? { arrivalLocal } : {}) });
    const response = await fetch(`/api/podcast-bookings?${query}`, { cache: "no-store" });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) { setMessage(data.error ?? "Times could not be loaded."); return; }
    setSlots(data.slots); setArrivalKnown(data.arrivalKnown); setTravelVerified(data.travelVerified); setNeedsArrival(Boolean(data.needsArrival));
    setMessage(data.needsArrival ? "We do not have a verified arrival for this name. Add the arrival date and Las Vegas local time to continue." : data.slots.length ? "Choose a time and an available recording room." : "No compatible times are currently available. Production will follow up.");
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!selected || !room) { setMessage("Choose a time and room."); return; }
    setLoading(true); setMessage("");
    const response = await fetch("/api/podcast-bookings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ podcast: entry.show, guestName, email, format, startUtc: selected.startUtc, endUtc: selected.endUtc, room, travelVerified, arrivalLocal, website: "" }) });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) { setMessage(data.error ?? "The booking could not be saved."); return; }
    setBooked(true);
    setMessage(data.booking.travelVerified ? "Your interview time is booked." : "Your time is held pending final travel verification.");
  }

  if (!started) return <button type="button" className={styles.bookInterview} onClick={() => setStarted(true)}>Book an interview</button>;
  if (booked) return <div className={styles.bookingSuccess} role="status"><span>Booking received</span><h3>{entry.show}</h3><p>{formatLabel(format)}<br />{selected ? when(selected.startUtc) : ""} · {room}</p><strong>{message}</strong><small>The exact room location will be announced closer to the event.</small></div>;

  return <form className={styles.booking} onSubmit={submit}>
    <div className={styles.bookingTitle}><p className={styles.cardKicker}>Book an interview</p><h3>Choose your format and time</h3></div>
    <div className={styles.bookingGrid}>
      <label>Interview guest’s full name<input value={guestName} onChange={event => { setGuestName(event.target.value); setSlots([]); }} required /></label>
      <label>Email<input type="email" value={email} onChange={event => setEmail(event.target.value)} required /></label>
    </div>
    <fieldset><legend>Interview format</legend><div className={styles.formatChoices}>{formats.map(item => <label key={item} className={styles.formatChoice}><input type="radio" name={`format-${entry.show}`} checked={format === item} onChange={() => { setFormat(item); setSlots([]); setSlot(""); setRoom(""); }} /><span><strong>{item === "long" ? "Long form" : "Short form"}</strong><small>{item === "long" ? "75-minute recording (1+ hour)" : "20-minute focused interview"}</small></span></label>)}</div></fieldset>
    <button type="button" className={styles.findTimes} onClick={findTimes} disabled={loading}>{loading ? "Checking travel and rooms…" : "Book a time"}</button>
    {needsArrival && <label>Arrival date and time in Las Vegas<input type="datetime-local" min="2026-10-30T00:00" max="2026-11-04T23:59" value={arrivalLocal} onChange={event => setArrivalLocal(event.target.value)} required /><small className={styles.arrivalHelp}>This is used only to remove interview times that occur before arrival.</small></label>}
    {needsArrival && arrivalLocal && <button type="button" className={styles.findTimes} onClick={findTimes} disabled={loading}>{loading ? "Checking…" : "Show compatible times"}</button>}
    {slots.length > 0 && <>
      <div className={styles.travelNote}>{travelVerified ? "Times shown begin after the verified flight arrival." : arrivalKnown ? "Arrival date is known; exact timing is awaiting verification." : "Flight arrival is not yet recorded. Your selected time will be held pending travel verification."}</div>
      <label>Available time<select value={slot} onChange={event => { setSlot(event.target.value); setRoom(""); }} required><option value="">Select a time</option>{slots.map(item => <option key={item.startUtc} value={item.startUtc}>{when(item.startUtc)}</option>)}</select></label>
      {selected && <fieldset><legend>Recording room</legend><div className={styles.roomChoices}>{selected.rooms.map(item => <label key={item}><input type="radio" name={`room-${entry.show}`} value={item} checked={room === item} onChange={() => setRoom(item)} /><span>{item}<small>Exact location announced closer to the event</small></span></label>)}</div></fieldset>}
      <button className={styles.confirmBooking} type="submit" disabled={loading || !slot || !room}>{loading ? "Saving…" : "Confirm interview booking"}</button>
    </>}
    {message && <p className={styles.bookingMessage} role="status">{message}</p>}
  </form>;
}
