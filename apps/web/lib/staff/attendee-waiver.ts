import {createHash,createHmac,timingSafeEqual} from 'node:crypto';
import {eventWaiverSchema,waiverReadyForSubmission} from '../event-waiver';
import {staffPassword} from './auth';
import {defaultSender,type Sender} from './rsvp-email';
import {newSubmission,type SubmissionStore,type RsvpSubmission,type ClosingDinnerSubmission} from './store';
import type {InvitationPayload} from './invitation-rsvp';
export type WaiverRef={kind:'rsvp'|'closingDinner';id:string;submittedAt:string;guest?:boolean};
type TokenData={refs:WaiverRef[];exp:number};
export function signWaiverToken(refs:WaiverRef[],secret:string,now=Date.now()) {const body=Buffer.from(JSON.stringify({refs,exp:now+90*86400000})).toString('base64url');return body+'.'+createHmac('sha256','attendee-waiver-v1:'+secret).update(body).digest('base64url');}
export function readWaiverToken(token:string,secret:string,now=Date.now()):TokenData|null{try{if(token.length>5000)return null;const [body,signature]=token.split('.');if(!body||!signature)return null;const expected=createHmac('sha256','attendee-waiver-v1:'+secret).update(body).digest();const actual=Buffer.from(signature,'base64url');if(actual.length!==expected.length||!timingSafeEqual(actual,expected))return null;const data=JSON.parse(Buffer.from(body,'base64url').toString());if(data.exp<now||!Array.isArray(data.refs)||data.refs.length<1||data.refs.length>3||data.refs.some((r:WaiverRef)=>!['rsvp','closingDinner'].includes(r.kind)||typeof r.id!=='string'||typeof r.submittedAt!=='string'))return null;return data;}catch{return null;}}
const recordFor=async(ref:WaiverRef,store:SubmissionStore)=>{const rows=ref.kind==='rsvp'?await store.list('rsvp'):await store.list('closingDinner');return rows.find(r=>r.id===ref.id&&r.submittedAt===ref.submittedAt&&!r.removedAt);};
export async function waiverTargets(refs:WaiverRef[],store:SubmissionStore){const rows=await Promise.all(refs.map(async ref=>({ref,row:await recordFor(ref,store)})));if(rows.some(x=>!x.row))return null;return rows as {ref:WaiverRef;row:RsvpSubmission|ClosingDinnerSubmission}[];}
export async function handleAttendeeWaiver(request:Request,store:SubmissionStore,secret:string|null=staffPassword()){
 const reply=(body:object,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store','Referrer-Policy':'no-referrer'}});if(!secret)return reply({error:'Waiver service is unavailable. Please contact the event team.'},503);
 let body;try{const raw=await request.text();if(raw.length>12000)return reply({error:'Request too large.'},413);body=JSON.parse(raw);}catch{return reply({error:'Invalid request.'},400);}
 const data=readWaiverToken(String(body.token||''),secret);if(!data)return reply({error:'This private waiver link is invalid or expired. Please contact the event team.'},403);
 const targets=await waiverTargets(data.refs,store);if(!targets)return reply({error:'Registration not available. Please contact the event team.'},404);
 const name=(t:typeof targets[number])=>t.ref.guest?(t.row as ClosingDinnerSubmission).guestName:t.row.name;
 const current=(t:typeof targets[number])=>t.ref.guest?(t.row as ClosingDinnerSubmission).guestEventWaiver:t.row.eventWaiver;
 if(targets.some(t=>name(t)!==name(targets[0]!)))return reply({error:'Attendee details changed. Please contact the team.'},409);
 if(body.action==='read')return reply({ok:true,name:name(targets[0]!),accepted:targets.every(t=>current(t)?.status==='accepted')});
 const parsed=eventWaiverSchema.safeParse(body.waiver);if(body.action!=='sign'||!parsed.success||!waiverReadyForSubmission(parsed.data,name(targets[0]!)))return reply({error:'Please accept each statement and sign with the registered attendee’s full name.'},400);
 for(const target of targets){if(current(target)?.status==='accepted')continue;const audit={waiverAcceptedAt:new Date().toISOString()};if(target.ref.kind==='rsvp')await store.add('rsvp',{...target.row,...audit,eventWaiver:parsed.data} as RsvpSubmission);else await store.add('closingDinner',{...target.row,...audit,...(target.ref.guest?{guestEventWaiver:parsed.data}:{eventWaiver:parsed.data})} as ClosingDinnerSubmission);}
 return reply({ok:true,accepted:true});
}
export async function invitationWaiverLinks(p:InvitationPayload,store:SubmissionStore,secret=staffPassword()){
 if(!secret)return [];const fingerprint=createHash('sha256').update(JSON.stringify(p)).digest('hex');const id=(kind:string,email:string)=>'invite-'+createHash('sha256').update(`${fingerprint}:${kind}:${email}`).digest('hex');
 const people=new Map([...p.day,...p.awards,...p.dinner].map(g=>[g.email,g]));const links=[];
 for(const person of people.values()){const refs:WaiverRef[]=[];if([...p.day,...p.awards].some(g=>g.email===person.email))refs.push({kind:'rsvp',id:id('rsvp',person.email),submittedAt:p.requestedAt});if(p.dinner.some(g=>g.email===person.email))refs.push({kind:'closingDinner',id:id('dinner',person.email),submittedAt:p.requestedAt});const targets=await waiverTargets(refs,store);if(!targets||targets.every(t=>t.row.eventWaiver?.status==='accepted'))continue;links.push({name:person.name,email:person.email,url:'https://notaloneawards.org/rsvp/waiver#'+signWaiverToken(refs,secret),id:'waiver-email-'+fingerprint+'-'+createHash('sha256').update(person.email).digest('hex')});}return links;
}
export async function sendWaiverLinks(links:Awaited<ReturnType<typeof invitationWaiverLinks>>,store:SubmissionStore,sender:Sender|null=defaultSender()){
 if(!links.length)return 'not-needed';if(!sender)return 'unavailable';let failed=false;const delivered=await store.list('rsvpEmail');
 for(const item of links){if(delivered.some(r=>r.id===item.id))continue;try{const subject='Complete your personal Not Alone event waiver';const text=`Your event request has been received. Please personally complete your waiver using this private link. You do not need to register again. Do not forward this link to anyone else.\n\n${item.url}\n\nYour tickets are not yet confirmed. Questions? Reply to this email.`;await sender({to:item.email,subject,text,html:'<p>'+text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/\n/g,'<br>')+'</p>'});await store.add('rsvpEmail',{...newSubmission({email:item.email,subject,rsvpId:item.id}),id:item.id});}catch{failed=true;}}return failed?'failed':'sent';
}
export async function dinnerWaiverLinks(record:ClosingDinnerSubmission,secret=staffPassword()){
 if(!secret)return [];const attendees=[{name:record.name,email:record.email,waiver:record.eventWaiver,guest:false},...(record.bringingGuest?[{name:record.guestName,email:record.guestEmail,waiver:record.guestEventWaiver,guest:true}]:[])];
 return attendees.filter(a=>a.waiver?.status!=='accepted').map(a=>({name:a.name,email:a.email,id:`dinner-waiver-${record.id}-${a.guest?'guest':'primary'}`,url:'https://notaloneawards.org/rsvp/waiver#'+signWaiverToken([{kind:'closingDinner',id:record.id,submittedAt:record.submittedAt,guest:a.guest}],secret)}));
}
