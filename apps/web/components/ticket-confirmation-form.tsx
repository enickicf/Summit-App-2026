"use client";

import { useMemo, useState } from "react";
import styles from "./ticket-confirmation-form.module.css";
import type { TicketOfferSubmission } from "../lib/staff/store";

type Guest = { name: string; email: string; phone: string; organization: string; professionalRole: string };
const blankGuest = (): Guest => ({ name: "", email: "", phone: "", organization: "", professionalRole: "" });

function GuestFields({ title, guests, setGuests }: { title: string; guests: Guest[]; setGuests(value: Guest[]): void }) {
  return <div className={styles.guestList}>{guests.map((guest, index) => <fieldset key={index} className={styles.guest}>
    <legend>{title} attendee {index + 1}</legend>
    <div className={styles.grid}>
      <label>Full name *<input required value={guest.name} onChange={event => setGuests(guests.map((item, at) => at === index ? { ...item, name: event.target.value } : item))} /></label>
      <label>Email *<input required type="email" value={guest.email} onChange={event => setGuests(guests.map((item, at) => at === index ? { ...item, email: event.target.value } : item))} /></label>
      <label>Phone *<input required type="tel" value={guest.phone} onChange={event => setGuests(guests.map((item, at) => at === index ? { ...item, phone: event.target.value } : item))} /></label>
      <label>Organization<input value={guest.organization} onChange={event => setGuests(guests.map((item, at) => at === index ? { ...item, organization: event.target.value } : item))} /></label>
      <label>Professional role<input value={guest.professionalRole} onChange={event => setGuests(guests.map((item, at) => at === index ? { ...item, professionalRole: event.target.value } : item))} /></label>
    </div>
  </fieldset>)}</div>;
}

export function TicketConfirmationForm({ offer }: { offer: TicketOfferSubmission }) {
  const primary = useMemo(() => ({ name: offer.name, email: offer.email, phone: offer.phone, organization: offer.organization, professionalRole: offer.professionalRole }), [offer]);
  const [awards, setAwards] = useState<Guest[]>(offer.awardsTicketsOffered ? [primary] : []);
  const [community, setCommunity] = useState<Guest[]>(offer.communityDayTicketsOffered ? [primary] : []);
  const [contact, setContact] = useState(primary);
  const [notes, setNotes] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  const resize = (current: Guest[], count: number) => Array.from({ length: count }, (_, index) => current[index] ?? (index === 0 ? { ...contact } : blankGuest()));
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setState("saving"); setMessage("");
    const response = await fetch("/api/ticket-confirmations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ offerId: offer.id, confirmationToken: offer.confirmationToken, ...contact, awardsAttendees: awards, communityDayAttendees: community, notes }) }).catch(() => null);
    const body = await response?.json().catch(() => ({})) as { error?: string } | undefined;
    if (!response?.ok) { setState("error"); setMessage(body?.error ?? "We could not save your response. Please try again."); return; }
    setState("done");
  }
  if (state === "done") return <section className={styles.success}><h2>Response received</h2><p>Your attendance details have been saved. The event team will contact each attendee with confirmation and ticketing information.</p></section>;
  return <form className={styles.form} onSubmit={submit}>
    <section><p className={styles.eyebrow}>Your ticket offer</p><h1>Confirm your attendance</h1><p>Choose how many of the offered tickets you will use, then provide each attendee&apos;s information.</p></section>
    <section className={styles.offerGrid}>
      <label><strong>Not Alone Awards Show</strong><span>{offer.awardsTicketsOffered} offered</span><select value={awards.length} onChange={event => setAwards(resize(awards, Number(event.target.value)))}>{Array.from({ length: offer.awardsTicketsOffered + 1 }, (_, count) => <option key={count} value={count}>{count} attending</option>)}</select></label>
      <label><strong>Nevada Mental Health Day</strong><span>{offer.communityDayTicketsOffered} offered</span><select value={community.length} onChange={event => setCommunity(resize(community, Number(event.target.value)))}>{Array.from({ length: offer.communityDayTicketsOffered + 1 }, (_, count) => <option key={count} value={count}>{count} attending</option>)}</select></label>
    </section>
    <section><h2>Primary contact</h2><div className={styles.grid}>
      <label>Full name *<input required value={contact.name} onChange={event => setContact({ ...contact, name: event.target.value })} /></label>
      <label>Email *<input required type="email" value={contact.email} onChange={event => setContact({ ...contact, email: event.target.value })} /></label>
      <label>Phone<input type="tel" value={contact.phone} onChange={event => setContact({ ...contact, phone: event.target.value })} /></label>
      <label>Organization<input value={contact.organization} onChange={event => setContact({ ...contact, organization: event.target.value })} /></label>
      <label>Professional role<input value={contact.professionalRole} onChange={event => setContact({ ...contact, professionalRole: event.target.value })} /></label>
    </div></section>
    {awards.length > 0 && <section><h2>Awards Show attendees</h2><GuestFields title="Awards Show" guests={awards} setGuests={setAwards} /></section>}
    {community.length > 0 && <section><h2>Nevada Mental Health Day attendees</h2><GuestFields title="Nevada Mental Health Day" guests={community} setGuests={setCommunity} /></section>}
    <label>Notes<textarea rows={4} value={notes} onChange={event => setNotes(event.target.value)} /></label>
    {state === "error" && <p role="alert" className={styles.error}>{message}</p>}
    <button disabled={state === "saving" || awards.length + community.length === 0}>{state === "saving" ? "Saving…" : "Submit confirmation"}</button>
  </form>;
}
