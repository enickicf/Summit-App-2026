import {describe,expect,it} from "vitest";
import {handleRsvpPost} from "../../app/api/rsvp/route";
import {eventWaiverVersion} from "../event-waiver";
import {memorySubmissionStore} from "./store";

const waiver={status:"accepted" as const,version:eventWaiverVersion,signature:"Primary Guest",adultSelf:true as const,liabilityAccepted:true as const,mediaAccepted:true as const,ticketTextConsent:true as const,electronicConsent:true as const};
const primary={name:"Primary Guest",email:"primary@example.com",phone:"7025550100",organization:"Example",professionalRole:"Director",invitedBy:"Host",attendanceStatus:"attending",eventWaiver:waiver};
const guest=(index:number)=>({name:`Guest ${index}`,email:`guest${index}@example.com`,phone:`702555${String(1000+index)}`,organization:"Example",professionalRole:"Guest"});
const post=async(body:unknown)=>{const store=memorySubmissionStore();const response=await handleRsvpPost(new Request("https://notalonesummit.org/api/rsvp",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(body)}),store,async()=>{},null);return {response,rows:await store.list("rsvp")};};

describe("public RSVP party limits and group agreement",()=>{
 it("accepts ten fully identified Awards guests in one request",async()=>{const guests=Array.from({length:9},(_,i)=>guest(i+2));const {response,rows}=await post({...primary,attending:"awards",guestCount:10,guests,groupWaiverAttestation:true});expect(response.status).toBe(200);expect(rows[0]?.guestCount).toBe(10);expect(rows[0]?.guests).toHaveLength(9);expect(rows[0]?.groupWaiverAttestation).toBe(true);});
 it("limits Nevada Mental Health Day to two people",async()=>{const accepted=await post({...primary,attending:"community-day",guestCount:2,guests:[guest(2)],groupWaiverAttestation:true});expect(accepted.response.status).toBe(200);const rejected=await post({...primary,attending:"community-day",guestCount:3,guests:[guest(2),guest(3)],groupWaiverAttestation:true});expect(rejected.response.status).toBe(400);expect(rejected.rows).toHaveLength(0);});
 it("requires the group agreement and complete guest details",async()=>{const noAgreement=await post({...primary,attending:"awards",guestCount:2,guests:[guest(2)]});expect(noAgreement.response.status).toBe(400);const incomplete=await post({...primary,attending:"awards",guestCount:2,guests:[{...guest(2),organization:""}],groupWaiverAttestation:true});expect(incomplete.response.status).toBe(400);});
});
