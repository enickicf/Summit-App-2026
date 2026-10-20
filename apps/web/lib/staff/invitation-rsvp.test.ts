import { describe, it, expect } from "vitest";
import { randomUUID } from "node:crypto";
import { handleInvitationPost } from "../../app/api/invitation-rsvp/route";
import { memorySubmissionStore, rsvpTotals, closingDinnerTotals, rsvpForm, type SubmissionStore } from "./store";
import { eventWaiverVersion } from "../event-waiver";
const person = (i: number) => ({ name: `Guest ${i}`, email: `guest${i}@example.com`, phone: "7025550100", organization: "Example", professionalRole: "Director" });
const accepted=(name:string)=>({status:"accepted" as const,version:eventWaiverVersion,signature:name,adultSelf:true as const,liabilityAccepted:true as const,mediaAccepted:true as const,ticketTextConsent:true as const,electronicConsent:true as const});
const payload = () => ({ requestId: randomUUID(), requestedAt: new Date().toISOString(), level: "uber-vip", requester: {...person(1),eventWaiver:accepted("Guest 1")}, invitedBy: "Ryan", day: [person(1), person(2)], awards: [person(1), person(2), person(3), person(4)], dinner: [person(2)], notes: "", textConsent: true });
const request = (p: unknown) => new Request("https://notaloneawards.org/api/invitation-rsvp", { method: "POST", body: JSON.stringify(p) });
describe("combined invitations preserve exact event rosters", () => {
 it("stores unequal counts, per-person organization/title, tier and requester in the existing stores", async()=>{
  const store=memorySubmissionStore();expect((await handleInvitationPost(request(payload()),store)).status).toBe(200);
  const r=await store.list("rsvp");const totals=rsvpTotals(r);
  expect(totals.ticketsRequested).toBe(4);expect(totals.communityDayTickets).toBe(2);
  expect(r.find(x=>x.email===person(1).email)?.attending).toBe("both");
  expect(r.find(x=>x.email===person(3).email)?.attending).toBe("awards");
  expect(r[0]?.requesterOrganization).toBe("Example");expect(r[0]?.requesterProfessionalRole).toBe("Director");expect(r[0]?.organization).toBe("Example");expect(r[0]?.professionalRole).toBe("Director");expect(rsvpForm(r[0]!)).toBe("Uber VIP");
  expect(closingDinnerTotals(await store.list("closingDinner")).seatsRequested).toBe(1);
  expect((await store.list("closingDinner"))[0]?.email).toBe(person(2).email);
  expect(r.find(x=>x.email===person(2).email)?.textConsent).toBeUndefined();
 });
 it("retries safely after a partial save without losing an existing record",async()=>{
  const store=memorySubmissionStore();let failed=false;
  const flaky={...store,add:async(kind:string,record:unknown)=>{if(kind==='closingDinner'&&!failed){failed=true;throw new Error('network');}await (store.add as Function)(kind,record);}} as SubmissionStore;
  const p=payload();expect((await handleInvitationPost(request(p),flaky)).status).toBe(503);
  expect((await store.list('rsvp')).length).toBe(4);
  expect((await handleInvitationPost(request(p),flaky)).status).toBe(200);
  expect((await handleInvitationPost(request(p),flaky)).status).toBe(200);
  expect((await store.list('rsvp')).length).toBe(4);expect((await store.list('closingDinner')).length).toBe(1);
 });
 for(const [label,mutate] of [
  ['VIP dinner',(p:any)=>{p.level='vip';}],
  ['too many Day tickets',(p:any)=>{p.day=Array.from({length:5},(_,i)=>person(i));}],
  ['too many Awards tickets',(p:any)=>{p.awards=Array.from({length:11},(_,i)=>person(i));}],
  ['too many dinner seats',(p:any)=>{p.dinner=[person(1),person(2),person(3)];}],
  ['missing guest organization',(p:any)=>{p.awards[0].organization='';}],
  ['duplicate guest',(p:any)=>{p.day=[person(1),person(1)];}],
  ['conflicting same-person details',(p:any)=>{p.day[0].name='Different person';}],
  ['empty request',(p:any)=>{p.day=[];p.awards=[];p.dinner=[];}]
 ] as const) it(`rejects ${label} before any write`,async()=>{const p=payload();mutate(p);const store=memorySubmissionStore();expect((await handleInvitationPost(request(p),store)).status).toBe(400);expect(await store.list('rsvp')).toHaveLength(0);expect(await store.list('closingDinner')).toHaveLength(0);});
 it('accepts maximum-length requester names and notes without a partial validation failure',async()=>{const p=payload();p.requester.name='N'.repeat(180);p.notes='n'.repeat(600);const store=memorySubmissionStore();expect((await handleInvitationPost(request(p),store)).status).toBe(200);expect(await store.list('rsvp')).toHaveLength(4);});
 it('allows dinner only for Uber VIP and never adds Awards tickets implicitly',async()=>{const p=payload();p.day=[];p.awards=[];const store=memorySubmissionStore();expect((await handleInvitationPost(request(p),store)).status).toBe(200);expect(await store.list('rsvp')).toHaveLength(0);expect(await store.list('closingDinner')).toHaveLength(1);});
});

describe("every combined-invitation ticket needs contact details",()=>{
 for(const event of ['day','awards','dinner'] as const) for(const field of ['name','email','phone'] as const) it(`rejects missing ${event} attendee ${field}`,async()=>{
  const p=payload();p[event][0]![field]='';const store=memorySubmissionStore();
  expect((await handleInvitationPost(request(p),store)).status).toBe(400);
  expect(await store.list('rsvp')).toHaveLength(0);expect(await store.list('closingDinner')).toHaveLength(0);
 });
});

it('stores guest event-text permission separately from marketing consent',async()=>{const p={...payload(),groupEventTextConsent:true};const store=memorySubmissionStore();expect((await handleInvitationPost(request(p),store)).status).toBe(200);const guest=(await store.list('rsvp')).find(r=>r.email===person(2).email)!;expect(guest.groupEventTextConsent).toBe(true);expect(guest.textConsent).toBeUndefined();expect((await store.list('closingDinner'))[0]?.groupEventTextConsent).toBe(true);});
