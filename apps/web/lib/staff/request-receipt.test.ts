import { describe, it, expect, vi } from "vitest";
import { memorySubmissionStore } from "./store";
import { invitationSchema } from "./invitation-rsvp";
import { sendInvitationReceipt, sendRequestReceipt, requestReceipt } from "./request-receipt";
import { handleInvitationPost } from "../../app/api/invitation-rsvp/route";
import { handleClosingDinnerPost } from "../../app/api/closing-dinner/route";
import { eventWaiverVersion } from "../event-waiver";
const person={name:"Test Guest",email:"guest@example.com",phone:"7025550100",organization:"Example",professionalRole:"Guest"};
const accepted=(name:string)=>({status:"accepted" as const,version:eventWaiverVersion,signature:name,adultSelf:true as const,liabilityAccepted:true as const,mediaAccepted:true as const,ticketTextConsent:true as const,electronicConsent:true as const});
const payload=()=>invitationSchema.parse({requestId:crypto.randomUUID(),requestedAt:new Date().toISOString(),level:"uber-vip",requester:{...person,email:"requester@example.com",eventWaiver:accepted(person.name)},invitedBy:"Host",day:[person],awards:[person],dinner:[person]});
const req=(body:unknown)=>new Request("https://notaloneawards.org/api/invitation-rsvp",{method:"POST",body:JSON.stringify(body)});
describe("automatic request receipts",()=>{
 it("sends one combined receipt to the requester after all events save; retries skip sent receipt",async()=>{
  const p=payload(), store=memorySubmissionStore();
  const sender=vi.fn(async()=>{expect(await store.list("rsvp")).toHaveLength(1);expect(await store.list("closingDinner")).toHaveLength(1);});
  expect((await handleInvitationPost(req(p),store,sender)).status).toBe(200);
  expect((await handleInvitationPost(req(p),store,sender)).status).toBe(200);
  expect(sender).toHaveBeenCalledTimes(1);
  expect(sender).toHaveBeenCalledWith(expect.objectContaining({to:"requester@example.com",text:expect.stringContaining("Closing dinner with Jewel: 1")}));
  expect((await store.list("rsvpEmail"))).toHaveLength(1);
 });
 it("does not email on invalid or partially saved requests",async()=>{
  const sender=vi.fn(async()=>{}),store=memorySubmissionStore();
  expect((await handleInvitationPost(req({...payload(),day:[],awards:[],dinner:[]}),store,sender)).status).toBe(400);
  vi.spyOn(store,"add").mockRejectedValue(new Error("storage unavailable"));
  expect((await handleInvitationPost(req(payload()),store,sender)).status).toBe(503);
  expect(sender).not.toHaveBeenCalled();
 });
 it("sends dinner receipt after storage and preserves RSVP success if SMTP fails",async()=>{
  const store=memorySubmissionStore(),sender=vi.fn(async()=>{expect(await store.list("closingDinner")).toHaveLength(1);throw new Error("offline");});
  expect((await handleClosingDinnerPost(req({...person,bringingGuest:false,eventWaiver:accepted(person.name)}),store,sender)).status).toBe(201);
  expect(sender).toHaveBeenCalledTimes(1);expect(await store.list("rsvpEmail")).toHaveLength(0);
 });
 it("has event-specific receipt text, escapes HTML and allows retry after email failure",async()=>{
  const store=memorySubmissionStore(),p=payload();p.day=[];p.awards=[];
  const sender=vi.fn(async()=>{});
  expect(await sendInvitationReceipt(p,store,async()=>{throw new Error("offline")})).toBe("failed");
  expect(await sendInvitationReceipt(p,store,sender)).toBe("sent");
  expect(sender.mock.calls[0]).toBeDefined();
  const m=requestReceipt("<script>",["Closing dinner with Jewel"]);
  expect(m.html).not.toContain("<script>");expect(m.text).toContain("Your tickets are not yet confirmed");
  expect(m.text).not.toContain("Awards Show");
  expect(await sendRequestReceipt("x",person.name,person.email,["Event"],store,null)).toBe("no-mailer");
 });
});
