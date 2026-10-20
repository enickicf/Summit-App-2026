import {getSubmissionStore} from '../../../lib/staff/store';
import {handleAttendeeWaiver} from '../../../lib/staff/attendee-waiver';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function POST(request:Request){try{return await handleAttendeeWaiver(request,await getSubmissionStore());}catch{return Response.json({error:'We could not save your waiver. Please retry this same link.'},{status:503,headers:{'Cache-Control':'no-store'}});}}
