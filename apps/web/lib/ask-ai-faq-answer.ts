import { conciergeContact } from "./ask-ai-policy";

const sectionHeading = /^(?:The event|Daily overview and attire|Sunday, November 1|Monday, November 2|Tuesday, November 3|Wednesday, November 4|Thursday, November 5(?: \(optional\))?|Hotel, arrival, and parking|Before you arrive|Wellness and accessibility|Conduct and community|Contact and support|Crisis resources)$/i;
const questionHeading = /^(?:what|where|when|who|how|which|can|will|is|are|do|does|should|i have|my plans)\b.+[?.]$/i;

// Quote staff answers for common logistics, including when the model is off or
// unavailable. Do not derive missing hotel nights from the event's dates.
export function faqLogisticsAnswer(question: string, text: string): string | null {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const entries: Array<{ question: string; answer: string }> = [];
  for (let i = 0; i < lines.length; i++) {
    const heading = lines[i]!.replace(/^#+\s*/, "").trim();
    if (!questionHeading.test(heading)) continue;
    const body: string[] = [];
    while (i + 1 < lines.length) {
      const next = lines[i + 1]!.replace(/^#+\s*/, "").trim();
      if (questionHeading.test(next) || sectionHeading.test(next)) break;
      body.push(lines[++i]!);
    }
    if (body.join("\n").trim()) entries.push({ question: heading, answer: body.join("\n").trim() });
  }
  const intents = [
    { match: /\bpark(?:ing)?\b/i, heading: /\bparking\b/i },
    { match: /\b(?:nights?|dates?|cover\w*|includ\w*)\b.*\b(?:hotel|room block)\b|\b(?:hotel|room block)\b.*\b(?:nights?|dates?|cover\w*|includ\w*)\b/i, heading: /\b(?:nights?|dates?|cover\w*)\b.*\b(?:room|block)\b|\b(?:room|block)\b.*\b(?:nights?|dates?|cover\w*)\b/i, missing: "The FAQ does not specify the hotel room-block nights." },
    { match: /\b(?:arriv\w*|depart\w*|flights?|airport)\b/i, heading: /\bwhen\b.*\barrive\b.*\bdepart\b/i },
    { match: /\b(?:from the airport|airport to|airport transfer)\b/i, heading: /\bget from the airport\b/i },
    { match: /\b(?:what (?:should|do) i (?:pack|bring)|what to (?:pack|bring))\b/i, heading: /\b(?:pack|bring)\b/i },
    { match: /\b(?:badge|registration desk|check[ -]in)\b/i, heading: /\b(?:pick up my badge)\b/i },
    { match: /\b(?:concierge|lost and found|contact the team)\b/i, heading: /\bcontact with questions\b/i },
    { match: /\bweather\b/i, heading: /\bweather\b/i },
    { match: /\b(?:book my room|book a room|hotel booking)\b/i, heading: /\bbook my room\b/i }
  ];
  const matched = intents.filter(intent => intent.match.test(question));
  if (!matched.length) return null;
  const answers = new Set<string>();
  for (const intent of matched) {
    const entry = entries.find(entry => intent.heading.test(entry.question));
    if (entry) answers.add(entry.answer);
    else if (intent.missing) answers.add(`${intent.missing} Please contact ${conciergeContact}.`);
  }
  if (!answers.size) return null;
  const answer = [...answers].join("\n\n");
  return /\b\d{1,2}(?::\d{2})?\s*(?:AM|PM)\b/i.test(answer) ? `${answer}\n\nTimings and program subject to change.` : answer;
}
