import {it,expect} from 'vitest';
import {textConsentColumns,textContactRows} from './text-consent';
import {rsvpPayloadSchema,closingDinnerPayloadSchema} from './store';
it('records organizer permission as event-only and always respects STOP',()=>{
 const person={name:'Example Guest',email:'guest@example.com',phone:'7025550100',submittedAt:'2026-10-16T12:00:00Z',groupEventTextConsent:true,source:'RSVP guest'};
 expect(textConsentColumns(person).textMessageConsent).toContain('organizer attested');
 expect(textContactRows([person],[])[0]?.textMessageConsent).toContain('event/ticket');
 expect(textContactRows([person],[{phone:person.phone,choice:'no',submittedAt:'2026-10-16T13:00:00Z'}])[0]?.textMessageConsent).toContain('OPTED OUT');
 expect(textConsentColumns({...person,groupEventTextConsent:false}).textMessageConsent).not.toContain('attested');
 for(const schema of [rsvpPayloadSchema,closingDinnerPayloadSchema])expect(schema.parse({...person,organization:'Example',professionalRole:'Guest',attendanceStatus:'attending'}).groupEventTextConsent).toBe(true);
});
