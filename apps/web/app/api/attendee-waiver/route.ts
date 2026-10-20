import { withSubmissionInbox } from "../../../lib/staff/submission-inbox";
import {getSubmissionStore} from '../../../lib/staff/store';
import {handleAttendeeWaiver} from '../../../lib/staff/attendee-waiver';
export const runtime='nodejs';export const dynamic='force-dynamic';
async function postWithoutInbox(request: Request){try{return await handleAttendeeWaiver(request,await getSubmissionStore());}catch{return Response.json({error:'We could not save your waiver. Please retry this same link.'},{status:503,headers:{'Cache-Control':'no-store'}});}}

// Oct 19: every request is stored in the submission inbox before validation (lib/staff/submission-inbox.ts).
export const POST = withSubmissionInbox("attendee-waiver", postWithoutInbox);
