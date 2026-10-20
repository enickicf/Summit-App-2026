import {describe,it,expect} from 'vitest';
import {eventWaiverSchema,eventWaiverVersion,waiverMatchesAttendee,waiverReadyForSubmission} from './event-waiver';
import {handleInvitationPost} from '../app/api/invitation-rsvp/route';
import {memorySubmissionStore} from './staff/store';
import {randomUUID} from 'node:crypto';
const signed={status:'accepted',version:eventWaiverVersion,signature:'Test Attendee',adultSelf:true,liabilityAccepted:true,mediaAccepted:true,ticketTextConsent:true,electronicConsent:true} as const;
describe('personal attendee waivers',()=>{
 it('requires every explicit consent and a current version',()=>{expect(eventWaiverSchema.safeParse(signed).success).toBe(true);for(const field of ['adultSelf','liabilityAccepted','mediaAccepted','electronicConsent'])expect(eventWaiverSchema.safeParse({...signed,[field]:false}).success).toBe(false);expect(eventWaiverSchema.safeParse({...signed,version:'old'}).success).toBe(false);});
 it('requires the named attendee signature',()=>{expect(waiverMatchesAttendee(signed,' Test  Attendee ')).toBe(true);expect(waiverMatchesAttendee(signed,'Another Guest')).toBe(false);});
 it('requires ticket text permission on new submissions while still parsing earlier records',()=>{expect(waiverReadyForSubmission(signed,'Test Attendee')).toBe(true);expect(eventWaiverSchema.safeParse({...signed,ticketTextConsent:undefined}).success).toBe(true);expect(waiverReadyForSubmission({...signed,ticketTextConsent:undefined},'Test Attendee')).toBe(false);});
 it('saves a whole group without assigning the organizer signature to guests',async()=>{
 const a={name:'Test Attendee',email:'test@example.com',phone:'7025550100',organization:'Test',professionalRole:'Guest',eventWaiver:signed};
 const b={...a,name:'Other Guest',email:'other@example.com',eventWaiver:{status:'pending',version:eventWaiverVersion}};
 const p={requestId:randomUUID(),requestedAt:new Date().toISOString(),level:'vip',requester:a,invitedBy:'Test',day:[a,b],awards:[a,b],dinner:[],notes:'',groupWaiverAttestation:true};
 const store=memorySubmissionStore();const response=await handleInvitationPost(new Request('https://example.com/api/invitation-rsvp',{method:'POST',body:JSON.stringify(p)}),store);
 expect(response.status).toBe(200);const rows=await store.list('rsvp');expect(rows).toHaveLength(2);expect(rows.find(r=>r.email===a.email)?.eventWaiver?.status).toBe('accepted');expect(rows.find(r=>r.email===b.email)?.eventWaiver?.status).toBe('pending');expect(rows.every(r=>r.attending==='both')).toBe(true);
 });
});
