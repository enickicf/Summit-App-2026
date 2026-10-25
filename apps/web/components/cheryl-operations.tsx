"use client";

import { useMemo, useState } from "react";
import type { ProgramApprovalCandidate } from "../lib/staff/cheryl-operations";
import type { TicketApprovalCandidate } from "../lib/staff/ticket-approval";
import type { ProgramApprovalSubmission, TicketConfirmationSubmission, TicketOfferSubmission } from "../lib/staff/store";
import styles from "../app/staff/staff.module.css";

const when = (iso: string) => new Date(iso).toLocaleString("en-US", { timeZone: "America/Los_Angeles", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) + " PT";
const offerFor = (candidate: TicketApprovalCandidate, rows: TicketOfferSubmission[]) => rows.find(row => row.externalApprovalId === candidate.id);
const confirmationFor = (offer: TicketOfferSubmission | undefined, rows: TicketConfirmationSubmission[]) => offer ? rows.find(row => row.offerId === offer.id) : undefined;
const approvalFor = (candidate: ProgramApprovalCandidate, rows: ProgramApprovalSubmission[]) => rows.find(row => row.sourceKind === candidate.sourceKind && row.sourceId === candidate.sourceId && row.eventKey === candidate.eventKey);
const selectOptions = (maximum: number, noun: string) => Array.from({ length: maximum + 1 }, (_, value) => <option key={value} value={value}>{value} {noun}</option>);
const roster = (rows: TicketApprovalCandidate["awardsAttendees"], count: number, prefix: string) => Array.from({ length: count }, (_, index) => rows[index] ?? ({ id: `${prefix}:missing:${index}`, name: "", email: "", phone: "", organization: "", professionalRole: "", waiverComplete: false }));

function TicketCard({ candidate, initial, confirmation, onSaved }: { candidate: TicketApprovalCandidate; initial?: TicketOfferSubmission; confirmation?: TicketConfirmationSubmission; onSaved(row: TicketOfferSubmission): void }) {
  const [awards, setAwards] = useState(initial?.decision === "declined" ? 0 : initial?.awardsTicketsOffered ?? candidate.awardsRequested);
  const [day, setDay] = useState(initial?.decision === "declined" ? 0 : initial?.communityDayTicketsOffered ?? candidate.communityDayRequested);
  const [notes, setNotes] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "error">("idle");
  const [message, setMessage] = useState("");
  async function save(decision: "approved" | "declined" | "hold", confirmationStatus = initial?.confirmationStatus ?? "hold") {
    setState("saving"); setMessage("");
    const awardsCount = decision === "declined" ? 0 : awards;
    const dayCount = decision === "declined" ? 0 : day;
    if (decision === "approved" && awardsCount + dayCount < 1) { setState("error"); setMessage("Approve at least one ticket, put the request on hold, or decline it."); return; }
    const response = await fetch("/api/staff/ticket-offers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
      externalApprovalId: candidate.id, sourceRsvpId: candidate.sourceRsvpId, name: candidate.name, email: candidate.email,
      phone: candidate.phone, organization: candidate.organization, professionalRole: candidate.professionalRole,
      decision, awardsTicketsOffered: awardsCount, communityDayTicketsOffered: dayCount,
      awardsAttendees: roster(candidate.awardsAttendees, awardsCount, `${candidate.id}:awards`).slice(0, awardsCount),
      communityDayAttendees: roster(candidate.communityDayAttendees, dayCount, `${candidate.id}:day`).slice(0, dayCount),
      confirmationStatus: decision === "approved" ? confirmationStatus : "hold",
      confirmationStatusUpdatedAt: new Date().toISOString(), approvalUpdatedAt: new Date().toISOString(), notes,
    }) }).catch(() => null);
    const body = await response?.json().catch(() => ({})) as { error?: string; offer?: TicketOfferSubmission } | undefined;
    if (!response?.ok || !body?.offer) { setState("error"); setMessage(body?.error ?? "The decision was not saved. Please retry."); return; }
    setState("idle"); onSaved(body.offer); setMessage("Saved.");
  }
  const decision = initial?.decision;
  const queue = initial?.confirmationStatus ?? "hold";
  const path = initial?.decision === "approved" ? `/tickets/confirm/${initial.confirmationToken}` : "";
  return <article className={styles.opsCard}>
    <div className={styles.approvalIdentity}><div><p className={styles.cardKicker}>{candidate.form} · {candidate.formVersion} form · {when(candidate.submittedAt)}</p><h2>{candidate.name}</h2><p><a href={`mailto:${candidate.email}`}>{candidate.email}</a>{candidate.phone ? ` · ${candidate.phone}` : ""}</p></div><div className={styles.badges}><span className={`${styles.badge} ${decision === "approved" ? styles.badgeApproved : decision === "declined" ? styles.badgeDeclined : decision === "hold" ? styles.badgeHold : ""}`}>{decision ?? "Needs review"}</span><span className={styles.badge}>{queue === "ready" ? "Ready to contact" : queue === "sent" ? "Confirmation sent" : "Contact hold"}</span></div></div>
    {candidate.missingDetails.length > 0 && <p className={styles.opsWarning}><strong>Missing:</strong> {candidate.missingDetails.join(", ")}</p>}
    <div className={styles.approvalEvents}>
      <label><span>Awards Show</span><small>{candidate.awardsRequested} requested</small><select value={awards} onChange={event => setAwards(Number(event.target.value))}>{selectOptions(candidate.awardsRequested, "approved")}</select></label>
      <label><span>Nevada Mental Health Day</span><small>{candidate.communityDayRequested} requested</small><select value={day} onChange={event => setDay(Number(event.target.value))}>{selectOptions(candidate.communityDayRequested, "approved")}</select></label>
    </div>
    <label className={styles.opsNotes}>Internal note<input value={notes} onChange={event => setNotes(event.target.value)} placeholder="Optional note for Ryan or Cheryl" /></label>
    <div className={styles.approvalActions}><button className={styles.button} disabled={state === "saving"} onClick={() => save("approved", "hold")}>Approve</button><button className={styles.secondaryButton} disabled={state === "saving"} onClick={() => save("hold", "hold")}>Hold</button><button className={styles.dangerButton} disabled={state === "saving"} onClick={() => save("declined", "hold")}>Decline</button>{decision === "approved" && queue !== "ready" && <button className={styles.readyButton} disabled={state === "saving"} onClick={() => save("approved", "ready")}>Add to confirmation queue</button>}{decision === "approved" && queue === "ready" && <button className={styles.secondaryButton} disabled={state === "saving"} onClick={() => save("approved", "hold")}>Remove from queue</button>}</div>
    {message && <p role="status" className={state === "error" ? styles.noticeError : styles.notice}>{message}</p>}
    {path && <div className={styles.approvalLink}><div><strong>Private confirmation page</strong><br/><a href={path} target="_blank" rel="noreferrer">{path}</a></div><button className={styles.linkButton} type="button" onClick={() => navigator.clipboard.writeText(new URL(path, window.location.origin).toString())}>Copy</button></div>}
    {confirmation && <p className={styles.notice}>Response received {when(confirmation.submittedAt)} · Awards {confirmation.awardsAttendees.length} · Nevada Mental Health Day {confirmation.communityDayAttendees.length} · {confirmation.pendingWaiverIds?.length ?? 0} waivers pending</p>}
  </article>;
}

function ProgramCard({ candidate, initial, onSaved }: { candidate: ProgramApprovalCandidate; initial?: ProgramApprovalSubmission; onSaved(row: ProgramApprovalSubmission): void }) {
  const [quantity, setQuantity] = useState(initial?.decision === "declined" ? 0 : initial?.approvedQuantity ?? candidate.requestedQuantity);
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [state, setState] = useState<"idle" | "saving" | "error">("idle");
  const [message, setMessage] = useState("");
  async function save(decision: "approved" | "declined" | "hold", confirmationStatus = initial?.confirmationStatus ?? "hold") {
    setState("saving"); setMessage("");
    const approvedQuantity = decision === "declined" ? 0 : quantity;
    const response = await fetch("/api/staff/program-approvals", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
      sourceKind: candidate.sourceKind, sourceId: candidate.sourceId, eventKey: candidate.eventKey, eventLabel: candidate.eventLabel,
      name: candidate.name, email: candidate.email, phone: candidate.phone, form: candidate.form,
      requestedQuantity: candidate.requestedQuantity, approvedQuantity, decision, fulfillment: candidate.fulfillment,
      confirmationStatus: decision === "approved" ? confirmationStatus : "hold", missingDetails: candidate.missingDetails,
      formVersion: candidate.formVersion, notes, reviewedAt: new Date().toISOString(),
    }) }).catch(() => null);
    const body = await response?.json().catch(() => ({})) as { error?: string; approval?: ProgramApprovalSubmission } | undefined;
    if (!response?.ok || !body?.approval) { setState("error"); setMessage(body?.error ?? "The decision was not saved. Please retry."); return; }
    setState("idle"); onSaved(body.approval); setMessage("Saved.");
  }
  const decision = initial?.decision;
  const queue = initial?.confirmationStatus ?? "hold";
  return <article className={styles.opsCard}>
    <div className={styles.approvalIdentity}><div><p className={styles.cardKicker}>{candidate.form} · {candidate.formVersion} form · {when(candidate.submittedAt)}</p><h2>{candidate.eventLabel}</h2><p><strong>{candidate.name}</strong>{candidate.email ? <> · <a href={`mailto:${candidate.email}`}>{candidate.email}</a></> : ""}{candidate.phone ? ` · ${candidate.phone}` : ""}</p></div><div className={styles.badges}>{candidate.excludedFromTotals && <span className={`${styles.badge} ${styles.badgeTest}`}>Test / excluded</span>}<span className={`${styles.badge} ${decision === "approved" ? styles.badgeApproved : decision === "declined" ? styles.badgeDeclined : decision === "hold" ? styles.badgeHold : ""}`}>{decision ?? "Needs review"}</span></div></div>
    {candidate.missingDetails.length > 0 && <p className={styles.opsWarning}><strong>Missing:</strong> {candidate.missingDetails.join(", ")}</p>}
    <div className={styles.programDecision}><label>Requested<strong>{candidate.requestedQuantity}</strong></label><label>Approved<select value={quantity} onChange={event => setQuantity(Number(event.target.value))}>{selectOptions(candidate.requestedQuantity, "places")}</select></label><label>Fulfillment<strong>{candidate.fulfillment === "check-in" ? "Check-in list" : candidate.fulfillment === "ticket" ? "Ticket" : "Reservation list"}</strong></label></div>
    <label className={styles.opsNotes}>Internal note<input value={notes} onChange={event => setNotes(event.target.value)} placeholder="Optional note for Ryan or Cheryl" /></label>
    <div className={styles.approvalActions}><button className={styles.button} disabled={state === "saving"} onClick={() => save("approved", "hold")}>Approve</button><button className={styles.secondaryButton} disabled={state === "saving"} onClick={() => save("hold", "hold")}>Hold</button><button className={styles.dangerButton} disabled={state === "saving"} onClick={() => save("declined", "hold")}>Decline</button>{decision === "approved" && queue !== "ready" && <button className={styles.readyButton} disabled={state === "saving"} onClick={() => save("approved", "ready")}>Mark ready for follow-up</button>}{decision === "approved" && queue === "ready" && <button className={styles.secondaryButton} disabled={state === "saving"} onClick={() => save("approved", "hold")}>Remove from queue</button>}</div>
    {message && <p role="status" className={state === "error" ? styles.noticeError : styles.notice}>{message}</p>}
  </article>;
}

export function CherylOperations({ ticketCandidates, programCandidates, initialOffers, confirmations, initialProgramApprovals }: { ticketCandidates: TicketApprovalCandidate[]; programCandidates: ProgramApprovalCandidate[]; initialOffers: TicketOfferSubmission[]; confirmations: TicketConfirmationSubmission[]; initialProgramApprovals: ProgramApprovalSubmission[] }) {
  const [offers, setOffers] = useState(initialOffers);
  const [programApprovals, setProgramApprovals] = useState(initialProgramApprovals);
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"all" | "review" | "queue" | "responses" | "fulfillment">("review");
  const [ticketLimit, setTicketLimit] = useState(40);
  const [programLimit, setProgramLimit] = useState(40);
  const updateOffer = (row: TicketOfferSubmission) => setOffers(current => [row, ...current.filter(item => item.id !== row.id)]);
  const updateProgram = (row: ProgramApprovalSubmission) => setProgramApprovals(current => [row, ...current.filter(item => item.id !== row.id)]);
  const matches = (text: string) => text.toLowerCase().includes(query.trim().toLowerCase());
  const ticketRows = useMemo(() => ticketCandidates.filter(candidate => {
    const offer = offerFor(candidate, offers), response = confirmationFor(offer, confirmations);
    const stage = !offer || offer.decision === "hold" || offer.decision === "declined" ? "review" : response ? ((response.pendingWaiverIds?.length ?? 0) > 0 ? "responses" : "fulfillment") : offer.confirmationStatus === "ready" ? "queue" : "review";
    return matches(`${candidate.name} ${candidate.email} ${candidate.form}`) && (view === "all" || view === stage);
  }), [ticketCandidates, offers, confirmations, query, view]);
  const programRows = useMemo(() => programCandidates.filter(candidate => {
    const approval = approvalFor(candidate, programApprovals);
    const stage = !approval || approval.decision === "hold" || approval.decision === "declined" ? "review" : approval.confirmationStatus === "ready" ? "queue" : "review";
    return matches(`${candidate.name} ${candidate.email} ${candidate.form} ${candidate.eventLabel}`) && (view === "all" || view === stage);
  }), [programCandidates, programApprovals, query, view]);
  const needsReview = ticketCandidates.filter(row => { const offer = offerFor(row, offers); return !offer || offer.decision === "hold"; }).length + programCandidates.filter(row => { const approval = approvalFor(row, programApprovals); return !approval || approval.decision === "hold"; }).length;
  const ready = offers.filter(row => row.decision === "approved" && row.confirmationStatus === "ready").length + programApprovals.filter(row => row.decision === "approved" && row.confirmationStatus === "ready").length;
  const responded = confirmations.length;
  const pendingWaivers = confirmations.reduce((sum, row) => sum + (row.pendingWaiverIds?.length ?? 0), 0);
  const awardsReady = confirmations.reduce((sum, row) => sum + ((row.pendingWaiverIds?.length ?? 0) === 0 ? row.awardsAttendees.length : 0), 0);
  const dayCheckIn = confirmations.reduce((sum, row) => sum + row.communityDayAttendees.length, 0);
  return <>
    <section className={`${styles.section} ${styles.opsHero}`}>
      <div className={styles.sectionHead}><div><p className={styles.eyebrow}>Protected staff workspace</p><h1>Cheryl Operations</h1></div><div className={styles.viewTabs}><a href="/staff">Staff portal</a><a href="/api/staff/export?kind=all">Full backup</a></div></div>
      <p className={styles.opsLead}>One connected workflow for every request. Original forms remain unchanged; decisions, confirmation responses and fulfillment status are stored separately in the same journaled staff database.</p>
      <ol className={styles.workflow}><li><strong>1. Intake</strong><span>All form types</span></li><li><strong>2. Review</strong><span>Approve, hold, decline</span></li><li><strong>3. Contact queue</strong><span>Choose who receives a confirmation</span></li><li><strong>4. Guest response</strong><span>Counts, contacts and waivers</span></li><li><strong>5. Fulfillment</strong><span>Awards tickets or event check-in</span></li></ol>
    </section>
    <div className={styles.opsStats}><button onClick={() => setView("review")}><strong>{needsReview}</strong><span>Need review</span></button><button onClick={() => setView("queue")}><strong>{ready}</strong><span>Ready to contact</span></button><button onClick={() => setView("responses")}><strong>{responded}</strong><span>Responses received</span></button><button onClick={() => setView("responses")}><strong>{pendingWaivers}</strong><span>Waivers pending</span></button><button onClick={() => setView("fulfillment")}><strong>{awardsReady}</strong><span>Awards tickets ready</span></button><button onClick={() => setView("fulfillment")}><strong>{dayCheckIn}</strong><span>NMHD check-ins</span></button></div>
    <section className={styles.opsControls}><div className={styles.opsTabs}>{(["review", "queue", "responses", "fulfillment", "all"] as const).map(item => <button key={item} aria-pressed={view === item} onClick={() => { setView(item); setTicketLimit(40); setProgramLimit(40); }}>{item === "queue" ? "Confirmation queue" : item.charAt(0).toUpperCase() + item.slice(1)}</button>)}</div><label>Search<input value={query} onChange={event => { setQuery(event.target.value); setTicketLimit(40); setProgramLimit(40); }} placeholder="Name, email, event or invitation type" /></label></section>
    <section className={styles.opsSection}><div className={styles.sectionHead}><div><p className={styles.eyebrow}>Awards and Nevada Mental Health Day</p><h2>Ticket requests</h2></div><span className={styles.count}>{ticketRows.length}</span></div><p className={styles.help}>Awards confirmations lead to actual ticket delivery. Nevada Mental Health Day confirmations place guests on the check-in list. Showing {Math.min(ticketRows.length, ticketLimit)} of {ticketRows.length} in this view.</p><div className={styles.approvalList}>{ticketRows.slice(0, ticketLimit).map(candidate => { const offer = offerFor(candidate, offers); const response = confirmationFor(offer, confirmations); return <TicketCard key={candidate.id} candidate={candidate} {...(offer ? { initial: offer } : {})} {...(response ? { confirmation: response } : {})} onSaved={updateOffer}/>; })}</div>{ticketRows.length === 0 && <p className={styles.empty}>No ticket requests in this view.</p>}{ticketRows.length > ticketLimit && <button className={styles.secondaryButton} onClick={() => setTicketLimit(value => value + 40)}>Show 40 more ticket requests</button>}</section>
    <section className={styles.opsSection}><div className={styles.sectionHead}><div><p className={styles.eyebrow}>Closing dinner, wellness, Summit, site visits and poker</p><h2>Program requests</h2></div><span className={styles.count}>{programRows.length}</span></div><p className={styles.help}>These requests resolve to a reservation or check-in list. They do not create Awards tickets. Showing {Math.min(programRows.length, programLimit)} of {programRows.length} in this view.</p><div className={styles.approvalList}>{programRows.slice(0, programLimit).map(candidate => { const approval = approvalFor(candidate, programApprovals); return <ProgramCard key={candidate.id} candidate={candidate} {...(approval ? { initial: approval } : {})} onSaved={updateProgram}/>; })}</div>{programRows.length === 0 && <p className={styles.empty}>No program requests in this view.</p>}{programRows.length > programLimit && <button className={styles.secondaryButton} onClick={() => setProgramLimit(value => value + 40)}>Show 40 more program requests</button>}</section>
    <section className={styles.opsSection}><h2>Sending status</h2><p className={styles.noticeError}><strong>Outbound sending remains off.</strong> “Ready to contact” is a reviewed queue. It does not email, text or issue a ticket. This prevents an accidental send while the message template and delivery provider are still awaiting final approval.</p></section>
  </>;
}
