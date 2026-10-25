"use client";

import { useMemo, useState } from "react";
import type { TicketConfirmationSubmission, TicketOfferSubmission } from "../lib/staff/store";
import type { ApprovalAttendee, TicketApprovalCandidate } from "../lib/staff/ticket-approval";
import styles from "../app/staff/staff.module.css";

const when = (iso: string) => new Date(iso).toLocaleString("en-US", { timeZone: "America/Los_Angeles", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) + " PT";
const pad = (rows: ApprovalAttendee[], count: number, prefix: string) => Array.from({ length: count }, (_, index) => rows[index] ?? ({ id: `${prefix}:missing:${index}`, name: "", email: "", phone: "", organization: "", professionalRole: "", waiverComplete: false }));

function ApprovalCard({ candidate, initial, confirmation }: { candidate: TicketApprovalCandidate; initial?: TicketOfferSubmission; confirmation?: TicketConfirmationSubmission }) {
  const [offer, setOffer] = useState(initial);
  const [awards, setAwards] = useState(initial?.decision === "declined" ? 0 : initial?.awardsTicketsOffered ?? candidate.awardsRequested);
  const [day, setDay] = useState(initial?.decision === "declined" ? 0 : initial?.communityDayTicketsOffered ?? candidate.communityDayRequested);
  const [state, setState] = useState<"idle" | "saving" | "error">("idle");
  const [message, setMessage] = useState("");
  async function save(decision: "approved" | "declined") {
    setState("saving"); setMessage("");
    const awardsCount = decision === "declined" ? 0 : awards, dayCount = decision === "declined" ? 0 : day;
    if (decision === "approved" && awardsCount + dayCount < 1) { setState("error"); setMessage("Offer at least one ticket, or decline the request."); return; }
    const response = await fetch("/api/staff/ticket-offers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
      externalApprovalId: candidate.id, sourceRsvpId: candidate.sourceRsvpId,
      name: candidate.name, email: candidate.email, phone: candidate.phone, organization: candidate.organization, professionalRole: candidate.professionalRole,
      decision, awardsTicketsOffered: awardsCount, communityDayTicketsOffered: dayCount,
      awardsAttendees: pad(candidate.awardsAttendees, awardsCount, `${candidate.id}:awards`).slice(0, awardsCount),
      communityDayAttendees: pad(candidate.communityDayAttendees, dayCount, `${candidate.id}:day`).slice(0, dayCount),
      approvalUpdatedAt: new Date().toISOString(),
    }) }).catch(() => null);
    const body = await response?.json().catch(() => ({})) as { error?: string; offer?: TicketOfferSubmission } | undefined;
    if (!response?.ok || !body?.offer) { setState("error"); setMessage(body?.error ?? "The decision was not saved. Please retry."); return; }
    setOffer(body.offer); setAwards(body.offer.awardsTicketsOffered); setDay(body.offer.communityDayTicketsOffered); setState("idle");
  }
  const path = offer?.decision === "approved" ? `/tickets/confirm/${offer.confirmationToken}` : "";
  return <article className={styles.approvalCard}>
    <div className={styles.approvalIdentity}><div><p className={styles.cardKicker}>{candidate.form} · {when(candidate.submittedAt)}</p><h2>{candidate.name}</h2><p><a href={`mailto:${candidate.email}`}>{candidate.email}</a>{candidate.phone ? ` · ${candidate.phone}` : ""}</p></div><span className={`${styles.badge} ${offer?.decision === "approved" ? styles.badgeApproved : offer?.decision === "declined" ? styles.badgeDeclined : ""}`}>{offer?.decision ?? "Needs decision"}</span></div>
    <div className={styles.approvalEvents}>
      <label><span>Not Alone Awards Show</span><small>{candidate.awardsRequested} requested</small><select value={awards} onChange={event => setAwards(Number(event.target.value))}>{Array.from({ length: candidate.awardsRequested + 1 }, (_, value) => <option key={value} value={value}>{value} offered</option>)}</select></label>
      <label><span>Nevada Mental Health Day</span><small>{candidate.communityDayRequested} requested</small><select value={day} onChange={event => setDay(Number(event.target.value))}>{Array.from({ length: candidate.communityDayRequested + 1 }, (_, value) => <option key={value} value={value}>{value} offered</option>)}</select></label>
    </div>
    <div className={styles.approvalActions}><button className={styles.button} type="button" disabled={state === "saving"} onClick={() => save("approved")}>Approve allocation</button><button className={styles.dangerButton} type="button" disabled={state === "saving"} onClick={() => save("declined")}>Decline</button></div>
    {message && <p role="alert" className={styles.noticeError}>{message}</p>}
    {path && <div className={styles.approvalLink}><div><strong>Private confirmation link</strong><br/><a href={path} target="_blank" rel="noreferrer">{path}</a></div><button className={styles.linkButton} type="button" onClick={() => navigator.clipboard.writeText(new URL(path, window.location.origin).toString())}>Copy link</button></div>}
    {confirmation && <p className={styles.notice}>Guest response saved {when(confirmation.submittedAt)} · Awards: {confirmation.awardsAttendees.length} · Nevada Mental Health Day: {confirmation.communityDayAttendees.length} · {confirmation.pendingWaiverIds?.length ?? 0} waivers pending</p>}
  </article>;
}

export function TicketApprovalWorkbench({ candidates, initialOffers, confirmations }: { candidates: TicketApprovalCandidate[]; initialOffers: TicketOfferSubmission[]; confirmations: TicketConfirmationSubmission[] }) {
  const [query, setQuery] = useState("");
  const visible = useMemo(() => candidates.filter(row => `${row.name} ${row.email} ${row.form}`.toLowerCase().includes(query.trim().toLowerCase())), [candidates, query]);
  return <>
    <section className={styles.section}>
      <div className={styles.sectionHead}><div><p className={styles.eyebrow}>Protected staff workspace</p><h1>Ticket approvals</h1></div><a className={styles.button} href="/staff">Back to staff portal</a></div>
      <p className={styles.help}>Approve, reduce or decline each party’s Awards Show and Nevada Mental Health Day requests separately. Saving creates a private confirmation link. Nothing is emailed, texted or ticketed automatically.</p>
      <label className={styles.approvalSearch}>Search requests<input value={query} onChange={event => setQuery(event.target.value)} placeholder="Name, email or invitation type" /></label>
    </section>
    <div className={styles.approvalList}>{visible.map(candidate => { const offer = initialOffers.find(row => row.externalApprovalId === candidate.id); const confirmation = offer ? confirmations.find(row => row.offerId === offer.id) : undefined; return <ApprovalCard key={candidate.id} candidate={candidate} {...(offer ? { initial: offer } : {})} {...(confirmation ? { confirmation } : {})}/>; })}</div>
    {visible.length === 0 && <p className={styles.empty}>No matching ticket requests.</p>}
  </>;
}
