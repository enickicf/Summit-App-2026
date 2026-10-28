import { wellnessAirtableGet } from "../../../apps/web/lib/integrations/wellness-airtable";
import { sourceBookingStore, sourceSubmissionStore } from "../../../apps/web/lib/integrations/source-store";
export const config = { path: "/api/integrations/wellness-airtable", method: "GET" };
export default (request: Request) => wellnessAirtableGet(request, {
  storeProvider: () => sourceSubmissionStore(), bookingStoreProvider: () => sourceBookingStore(),
});
