"use client";

import { useMemo, useState } from "react";
import { eventWaiverLiability, eventWaiverMedia, eventWaiverVersion } from "../lib/event-waiver";
import type { TicketConfirmationSubmission, TicketOfferSubmission } from "../lib/staff/store";
import styles from "./ticket-confirmation-form.module.css";

type Guest = { id: string; name: string; email: string; phone: string; organization: string; professionalRole: string; waiverComplete?: boolean };
type WaiverDraft = { signature: string; adultSelf: boolean; liabilityAccepted: boolean; mediaAccepted: boolean; electronicConsent: boolean; ticketTextConsent: boolean; futureTextConsent: boolean };
const ticketTextDisclosure = "I agree to receive texts at the mobile number provided about this ticket request, confirmation, ticketing and event logistics. Message frequency varies. Msg & data rates may apply. Reply STOP to opt out or HELP for help.";
const futureTextDisclosure = "Also text me updates about the Not Alone Awards, Nevada Mental Health Day and future Inspiring Children Foundation events. Message frequency varies. Msg & data rates may apply. Reply STOP to opt out or HELP for help. Optional; not required to confirm tickets.";
const blankGuest = (id: string): Guest => ({ id, name: "", email: "", phone: "", organization: "", professionalRole: "", waiverComplete: false });
const blankWaiver = (): WaiverDraft => ({ signature: "", adultSelf: false, liabilityAccepted: false, mediaAccepted: false, electronicConsent: false, ticketTextConsent: false, futureTextConsent: false });

function GuestFields({ title, guests, setGuests }: { title: string; guests: Guest[]; setGuests(value: Guest[]): void }) {
  return <div className={styles.guestList}>{guests.map((guest, index) => <fieldset key={guest.id} className={styles.guest}>
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

export function TicketConfirmationForm({ offer, existing }: { offer: TicketOfferSubmission; existing?: TicketConfirmationSubmission }) {
  const primary = useMemo(() => ({ id: `primary:${offer.id}`, name: offer.name, email: offer.email, phone: offer.phone, organization: offer.organization, professionalRole: offer.professionalRole, waiverComplete: false }), [offer]);
  const roster = (event: "awards" | "day", count: number) => {
    const source = (event === "awards" ? offer.awardsAttendees : offer.communityDayAttendees) ?? [];
    return Array.from({ length: count }, (_, index) => source[index] ? { ...source[index]! } : index === 0 ? { ...primary, id: `${event}:${primary.id}` } : blankGuest(`${event}:${offer.id}:guest:${index}`));
  };
  const saved = (event: "awards" | "day", rows: TicketConfirmationSubmission["awardsAttendees"]) => rows.map((row, index) => ({ ...row, id: row.id || roster(event, Math.max(rows.length, 1))[index]?.id || `${event}:${offer.id}:legacy:${index}` }));
  const [awards, setAwards] = useState<Guest[]>(existing?.awardsAttendees?.length ? saved("awards", existing.awardsAttendees) : roster("awards", offer.awardsTicketsOffered));
  const [community, setCommunity] = useState<Guest[]>(existing?.communityDayAttendees?.length ? saved("day", existing.communityDayAttendees) : roster("day", offer.communityDayTicketsOffered));
  const [contact, setContact] = useState({ name: existing?.name ?? offer.name, email: existing?.email ?? offer.email, phone: existing?.phone ?? offer.phone, organization: existing?.organization ?? offer.organization, professionalRole: existing?.professionalRole ?? offer.professionalRole });
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [waivers, setWaivers] = useState<Record<string, WaiverDraft>>({});
  const [signerId, setSignerId] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(existing?.pendingWaiverIds ?? []);
  const priorWaivers = new Set(existing?.waivers?.map(row => row.personId) ?? []);
  const resize = (event: "awards" | "day", current: Guest[], count: number) => Array.from({ length: count }, (_, index) => current[index] ?? roster(event, count)[index]!);
  const selected = [...awards, ...community].filter((guest, index, rows) => rows.findIndex(row => row.id === guest.id) === index);
  const needsWaiver = (guest: Guest) => !guest.waiverComplete && !priorWaivers.has(guest.id);
  const updateWaiver = (id: string, change: Partial<WaiverDraft>) => setWaivers(current => ({ ...current, [id]: { ...(current[id] ?? blankWaiver()), ...change } }));

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setState("saving"); setMessage("");
    const newWaivers = [], smsConsents = [];
    if (signerId) {
      const guest = selected.find(row => row.id === signerId);
      if (!guest) { setState("error"); setMessage("Choose an attending person to complete their own waiver."); return; }
      const draft = waivers[guest.id] ?? blankWaiver();
      if (!draft.signature.trim() || !draft.adultSelf || !draft.liabilityAccepted || !draft.mediaAccepted || !draft.electronicConsent) {
        setState("error"); setMessage(`Complete every required waiver field for ${guest.name || "the selected attendee"}.`); return;
      }
      const now = new Date().toISOString();
      newWaivers.push({ personId: guest.id, version: eventWaiverVersion, signature: draft.signature, email: guest.email, acceptedAt: now, adultSelf: true as const, liabilityAccepted: true as const, mediaAccepted: true as const, electronicConsent: true as const });
      if (draft.ticketTextConsent) smsConsents.push({ personId: guest.id, phone: guest.phone, scope: "ticket-logistics" as const, optedIn: true as const, recordedAt: now, disclosure: ticketTextDisclosure, version: "confirmation-ticket-sms-2026-10-24" as const, source: "ticket-confirmation" as const });
      if (draft.futureTextConsent) smsConsents.push({ personId: guest.id, phone: guest.phone, scope: "event-and-icf" as const, optedIn: true as const, recordedAt: now, disclosure: futureTextDisclosure, version: "confirmation-sms-2026-10-24" as const, source: "ticket-confirmation" as const });
    }
    const response = await fetch("/api/ticket-confirmations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ offerId: offer.id, confirmationToken: offer.confirmationToken, ...contact, awardsAttendees: awards, communityDayAttendees: community, waivers: newWaivers, smsConsents, notes }) }).catch(() => null);
    const body = await response?.json().catch(() => ({})) as { error?: string; pendingWaiverIds?: string[] } | undefined;
    if (!response?.ok) { setState("error"); setMessage(body?.error ?? "We could not save your response. Please try again."); return; }
    setPending(body?.pendingWaiverIds ?? []); setState("done");
  }
  if (state === "done") return <section className={styles.success}><h2>Response received</h2><p>Your attendance details have been saved. The event team will contact each attendee with confirmation and ticketing information.</p>{pending.length > 0 && <p><strong>{pending.length} personal waiver{pending.length === 1 ? " is" : "s are"} still pending.</strong> Staff can send each attendee their private waiver link before tickets are issued.</p>}</section>;
  return <form className={styles.form} onSubmit={submit}>
    <header className={styles.intro}><p className={styles.eyebrow}>Your event confirmation</p><h1>Confirm your tickets</h1><p>Hi {contact.name.split(/\s+/)[0] || "there"}. Confirm each event below. Existing information stays filled in; complete only missing details or corrections.</p></header>
    {offer.awardsTicketsOffered > 0 && <section className={styles.eventCard}><div className={styles.eventHeading}><div><h2>Not Alone Awards Show</h2><p>{offer.awardsTicketsOffered} ticket{offer.awardsTicketsOffered === 1 ? "" : "s"} offered</p></div><strong>{awards.length} attending</strong></div>
      <label className={styles.ticketChoice}>How many tickets will you use?<select value={awards.length} onChange={event => setAwards(resize("awards", awards, Number(event.target.value)))}>{Array.from({ length: offer.awardsTicketsOffered + 1 }, (_, count) => <option key={count} value={count}>{count === 0 ? "Cannot attend" : `${count} ticket${count === 1 ? "" : "s"}`}</option>)}</select></label>
      {awards.length > 0 ? <><p className={styles.cardHelp}>Confirm the people using these tickets. Every attendee needs their own email and phone.</p><GuestFields title="Awards Show" guests={awards} setGuests={setAwards} /></> : <p className={styles.cancelNotice}>All Awards Show tickets will be released when you save.</p>}
    </section>}
    {offer.communityDayTicketsOffered > 0 && <section className={styles.eventCard}><div className={styles.eventHeading}><div><h2>Nevada Mental Health Day</h2><p>{offer.communityDayTicketsOffered} ticket{offer.communityDayTicketsOffered === 1 ? "" : "s"} offered</p></div><strong>{community.length} attending</strong></div>
      <label className={styles.ticketChoice}>How many tickets will you use?<select value={community.length} onChange={event => setCommunity(resize("day", community, Number(event.target.value)))}>{Array.from({ length: offer.communityDayTicketsOffered + 1 }, (_, count) => <option key={count} value={count}>{count === 0 ? "Cannot attend" : `${count} ticket${count === 1 ? "" : "s"}`}</option>)}</select></label>
      {community.length > 0 ? <><p className={styles.cardHelp}>Confirm the people using these tickets. Every attendee needs their own email and phone.</p><GuestFields title="Nevada Mental Health Day" guests={community} setGuests={setCommunity} /></> : <p className={styles.cancelNotice}>All Nevada Mental Health Day tickets will be released when you save.</p>}
    </section>}
    <section className={styles.eventCard}><h2>Primary contact</h2><div className={styles.grid}>
      <label>Full name *<input required value={contact.name} onChange={event => setContact({ ...contact, name: event.target.value })} /></label>
      <label>Email *<input required type="email" value={contact.email} onChange={event => setContact({ ...contact, email: event.target.value })} /></label>
      <label>Phone<input type="tel" value={contact.phone} onChange={event => setContact({ ...contact, phone: event.target.value })} /></label>
      <label>Organization<input value={contact.organization} onChange={event => setContact({ ...contact, organization: event.target.value })} /></label>
      <label>Professional role<input value={contact.professionalRole} onChange={event => setContact({ ...contact, professionalRole: event.target.value })} /></label>
    </div></section>
    {selected.some(needsWaiver) && <section className={`${styles.eventCard} ${styles.consentCard}`}><h2>Waiver &amp; text updates</h2><p>Each adult must personally review and sign. Choose yourself. Other guests remain pending until they personally complete their waiver.</p><label>Who is completing this form?<select value={signerId} onChange={event => setSignerId(event.target.value)}><option value="">Save attendance now; complete waivers later</option>{selected.filter(needsWaiver).map(guest => <option key={guest.id} value={guest.id}>{guest.name || "Unnamed attendee"}</option>)}</select></label>{signerId && selected.filter(needsWaiver).filter(guest => guest.id === signerId).map(guest => { const waiver = waivers[guest.id] ?? blankWaiver(); return <fieldset key={guest.id} className={styles.waiver}><legend>Attendee agreement, waiver &amp; photo/video release</legend>
      <details><summary>Read the full attendee agreement, waiver &amp; photo/video release</summary><p>Please accept your own agreement and waiver. For a minor, contact the team for a parent or guardian waiver.</p><p>{eventWaiverLiability}</p><p>{eventWaiverMedia}</p></details>
      <small>Version {eventWaiverVersion}</small>
      <label><input type="checkbox" checked={waiver.adultSelf} onChange={event => updateWaiver(guest.id, { adultSelf: event.target.checked })}/> I am this named attendee, I am 18 or older, and I am signing personally now.</label>
      <label><input type="checkbox" checked={waiver.liabilityAccepted} onChange={event => updateWaiver(guest.id, { liabilityAccepted: event.target.checked })}/> I have read and agree to the liability waiver.</label>
      <label><input type="checkbox" checked={waiver.mediaAccepted} onChange={event => updateWaiver(guest.id, { mediaAccepted: event.target.checked })}/> I have read and agree to the photo, video, name, likeness and voice release.</label>
      <label>Attendee&apos;s full name as signature<input value={waiver.signature} onChange={event => updateWaiver(guest.id, { signature: event.target.value })} placeholder={guest.name || "Full legal name"}/></label>
      <label><input type="checkbox" checked={waiver.electronicConsent} onChange={event => updateWaiver(guest.id, { electronicConsent: event.target.checked })}/> I agree to use electronic records and my typed name as my signature.</label>
      <fieldset className={styles.textConsent}><legend>Text updates — optional</legend><label><input type="checkbox" checked={waiver.ticketTextConsent} onChange={event => updateWaiver(guest.id, { ticketTextConsent: event.target.checked })}/> {ticketTextDisclosure}</label><label><input type="checkbox" checked={waiver.futureTextConsent} onChange={event => updateWaiver(guest.id, { futureTextConsent: event.target.checked })}/> {futureTextDisclosure}</label></fieldset>
    </fieldset>; })}</section>}
    <label className={styles.notes}>Notes<textarea rows={4} value={notes} onChange={event => setNotes(event.target.value)} /></label>
    {state === "error" && <p role="alert" className={styles.error}>{message}</p>}
    <button disabled={state === "saving"}>{state === "saving" ? "Saving…" : awards.length + community.length === 0 ? "Cancel all offered tickets" : "Submit confirmation"}</button>
  </form>;
}
