export const conciergeContact = "concierge@inspiringchildren.org or (702) 421-6351 by phone, text, or WhatsApp";
export const notCoveredAnswer = `That information is not covered by the public event sources. Please contact ${conciergeContact}.`;
export const faqSource = { title: "Summit FAQ", url: "https://notalonesummit.org/schedule" };

// Run before matching public people or calling the model. These questions must
// never be answered by restating a directory entry or inferring private details.
export function isPrivateQuestion(question: string): boolean {
  return /\b(?:airtable|raw records?|data entries|rsvp entries|submissions?|staff notes?|private contacts?|export|guest emails?|guest phone numbers?|room numbers?|talent fees?|speaker fees?|appearance fees?|compensation|staff war room|staff headquarters|founders?['’]?s? dinner|founders?['’]?s? cocktails?)\b/i.test(question)
    || /\b(?:room|hotel|suite|flight|travel|itinerary)\b.*\b(?:staying|sleeping|booked for|assigned to|speaker|guest|attendee|talent)\b/i.test(question)
    || /\b(?:where|which hotel|which room)\b.*\b(?:staying|sleeping)\b/i.test(question)
    || /\b(?:phone|email|contact|dietary|allergies|accessibility needs|travel details)\b.*\b(?:speaker|guest|attendee|person|talent|staff|sponsor|vendor)\b/i.test(question)
    || /\b(?:speaker|guest|attendee|person|talent|staff|sponsor|vendor)\b.*\b(?:phone|email|contact details|dietary|allergies|accessibility needs|travel details)\b/i.test(question)
    || /\b(?:who (?:is|will be|was) attending|private (?:dinner|gathering|reception|party)|unpublished|hidden (?:information|records|schedule))\b/i.test(question);
}

export const faqLogisticsIntent = /\b(?:park(?:ing)?|hotel|room block|airport|arriv\w*|depart\w*|pack|bring|badge|registration desk|concierge|weather|accessibility|dietary|allerg\w*|solicitation|photograph\w*|filming|updates?)\b/i;
