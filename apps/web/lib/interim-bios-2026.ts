import { personNameKey } from "./person-portraits";

// Owner (Sept 21, 2026): every listed person has a bio. Until the person's own bio is entered in
// Airtable (which always wins), this short bio is shown. It states only what Airtable records about
// them (role and organization); nothing is invented.
const interimBios: Record<string, string> = {
  // Oct 3, 2026 Airtable re-read: role-only lines for the new listable records that have no Airtable bio yet.
  "Laura Brady": "Laura Brady is a confirmed guest of the 2026 Not Alone Summit with Boxing Bullies.",
  "Tasha Rasolkhani-Kalhorn": "Tasha Rasolkhani-Kalhorn is a confirmed guest of the 2026 Not Alone Summit.",
  "Lia Shelesh": "Lia Shelesh is a confirmed guest of the 2026 Not Alone Summit.",
  "Theresa Magnus": "Theresa Magnus is a confirmed guest of the 2026 Not Alone Summit.",
  "Lauren Ann": "Lauren Ann is a confirmed guest of the 2026 Not Alone Summit.",
  "Donnelly - Expert": "Donnelly - Expert is a confirmed guest of the 2026 Not Alone Summit.",
  "Julie Catineau": "Julie Catineau is a confirmed guest of the 2026 Not Alone Summit.",
  "Blake Bonner": "Blake Bonner is a confirmed guest of the 2026 Not Alone Summit.",
  "Caitlin Bonner": "Caitlin Bonner is a confirmed guest of the 2026 Not Alone Summit.",
  "Rohan Thakkar": "Rohan Thakkar is a confirmed guest of the 2026 Not Alone Summit with Hugz.",
  "Robert Goldstein": "Robert Goldstein is a confirmed guest of the 2026 Not Alone Summit.",
  "Ann Morris": "Ann Morris is a confirmed guest of the 2026 Not Alone Summit with NAMI.",
  // Sept 29, 2026 Airtable re-read: role-only lines for the new records that have no Airtable bio yet.
  "Mike Posner": "Mike Posner is a speaker at the 2026 Not Alone Summit.",
  "Steven C. Hayes": "Steven C. Hayes is a confirmed guest of the 2026 Not Alone Summit.",
  "Atz Kilcher": "Atz Kilcher is a confirmed guest of the 2026 Not Alone Summit.",
  "Alex Banayan": "Alex Banayan is a speaker at the 2026 Not Alone Summit with the Coming Alive documentary.",
  "Basak Kizilisik": "Basak Kizilisik is a confirmed guest of the 2026 Not Alone Summit.",
  "Megan Haley": "Megan Haley is a confirmed guest of the 2026 Not Alone Summit.",
  "Shayla Roland": "Shayla Roland is a confirmed guest of the 2026 Not Alone Summit with NAMI.",
  "Alyson Niemann": "Alyson Niemann is the CEO of Mindful Philanthropy and a confirmed guest of the 2026 Not Alone Summit.",
  // Sept 28, 2026 Airtable re-read: role-only lines for records that still have no Airtable bio.
  "Ben Maxwell": "Ben Maxwell is a confirmed guest of the 2026 Not Alone Summit.",
  // Oct 5: listed because Airtable holds space for her (owner: any Hold Space status counts); no title or photo yet, so no card.
  "Dr. Shashita Inamdar": "Dr. Shashita Inamdar is holding a place at the 2026 Not Alone Summit.",
  "Casey Caruso": "Casey Caruso is an associate producer of the 2026 Not Alone Summit.",
  "Payton McDonald": "Payton McDonald is an associate producer of the 2026 Not Alone Summit.",
  "Seth Porter Winterton": "Seth Porter Winterton is an associate producer of the 2026 Not Alone Summit.",
  "Sydney King": "Sydney King is an associate producer of the 2026 Not Alone Summit.",
  "Nick Ekern": "Nick Ekern is an associate producer of the 2026 Not Alone Summit.",
  "Ricky Sypert": "Ricky Sypert is an associate producer of the 2026 Not Alone Summit.",
  "Deb Cullen": "Deb Cullen is a co-producer of the 2026 Not Alone Summit.",
  "Max Novak": "Max Novak is an associate producer of the 2026 Not Alone Summit.",
  "Will Elmore Jr.": "Will Elmore Jr. is an associate producer of the 2026 Not Alone Summit.",
  "Hayden Harveston": "Hayden Harveston is a confirmed guest of the 2026 Not Alone Summit.",
  "Valerie Sizemore": "Valerie Sizemore is a confirmed guest of the 2026 Not Alone Summit.",
  "Miguel Tyson": "Miguel Tyson is a confirmed guest of the 2026 Not Alone Summit.",
  "Logan Paul": "Logan Paul is a founder of the Not Alone Summit.",
  "Forest Blakk": "Forest Blakk is a musician and a confirmed guest of the 2026 Not Alone Summit.", // Sept 28: Airtable title only, no bio yet
  "Mario Martinez": "Mario Martinez is a professional soccer player and a confirmed guest of the 2026 Not Alone Summit.",
  "Jan Thwaites": "Jan Thwaites is a producer of the 2026 Not Alone Summit with Inspiring Dreams.",
  "Sally Dewhurst": "Sally Dewhurst is a producer of the 2026 Not Alone Summit with UKNY.",
  "Sophie Novak": "Sophie Novak is a producer of the 2026 Not Alone Summit with UKNY.",
  "Clark Cummings": "Clark Cummings is an associate producer of the 2026 Not Alone Summit with Inspiring Dreams.",
  "Paige Neuenschwander": "Paige Neuenschwander is a producer of the 2026 Not Alone Summit with the Inspiring Children Foundation.",
  "Isabella Wolfington": "Isabella Wolfington is an associate producer of the 2026 Not Alone Summit with the Inspiring Children Foundation.",
  "Bianca Mok": "Bianca Mok is an associate producer of the 2026 Not Alone Summit with the Inspiring Children Foundation.",
  "Hal Fisher": "Hal Fisher is a confirmed guest of the 2026 Not Alone Summit.",
  "Jen Whalen": "Jen Whalen is a confirmed guest of the 2026 Not Alone Summit.",
  "Sheri Sobrato": "Sheri Sobrato is the founder of Resonance Philanthropies and a founder of the Not Alone Summit.",
  "Steven & Alexandra Cohen": "The Steven & Alexandra Cohen Foundation powers the Not Alone Summit and Awards; Steven and Alexandra Cohen are founders of the Not Alone Summit.",
  "Steven Cohen": "The Steven & Alexandra Cohen Foundation powers the Not Alone Summit and Awards; Steven and Alexandra Cohen are founders of the Not Alone Summit.",
  "Alexandra Cohen": "The Steven & Alexandra Cohen Foundation powers the Not Alone Summit and Awards; Steven and Alexandra Cohen are founders of the Not Alone Summit.",
  // Paige/owner, Sept 22: founder couples credited together; the shared card de-duplicates the sentence.
  "Jay McGraw": "Jay McGraw is a founder of the Not Alone Summit.",
  "Erica McGraw": "Erica McGraw is a founder of the Not Alone Summit.",
  "Melony Lewis": "Melony and Adam Lewis are founders of the Not Alone Summit.",
  "Adam Lewis": "Melony and Adam Lewis are founders of the Not Alone Summit.",
  "Winston Kelly": "Winston and Cameron Kelly are founders of the Not Alone Summit.",
  "Cameron Kelly": "Winston and Cameron Kelly are founders of the Not Alone Summit.",
  // Sept 22 afternoon Airtable read: role-only lines from the Title column for records whose Airtable bio
  // the interface truncates (or that have none yet). Airtable's own bio replaces these automatically.
  "Jeneva Bell": "Jeneva Bell, founder and president of Ruggable, is a founder of the Not Alone Summit.",
  "John Ratcliff": "John Ratcliff is a founder of the Not Alone Summit.",
  "Harry Hudson": "Harry Hudson is a singer-songwriter confirmed for the 2026 Not Alone Summit.",
  "Geoff Ralston": "Geoff Ralston is confirmed for the 2026 Not Alone Summit.",
  "Raquelle Stevens": "Raquelle Stevens, author and producer, is a confirmed guest of the 2026 Not Alone Summit.",
  "Gavin Magnus": "Gavin Magnus, singer, rapper and actor, is confirmed for the 2026 Not Alone Summit.",
  "Nicole Kalhorn": "Nicole Kalhorn, co-founder of Wise Friend, is confirmed for the 2026 Not Alone Summit.",
  "Clayton Alenik": "Clayton Alenik, co-founder of Wise Friend, is confirmed for the 2026 Not Alone Summit.",
  "Remington Rhodes": "Remington Rhodes is a confirmed guest of the 2026 Not Alone Summit.",
  "Erik Blamoville": "Erik Blamoville is a confirmed guest of the 2026 Not Alone Summit.",
  "Jennifer Donnelly": "Jennifer Donnelly, The Ultimate Matchmaker, is a founder of the Not Alone Summit.",
  "Ryan Chen": "Ryan Chen, co-founder of Neurogum, is confirmed for the 2026 Not Alone Summit."
};
const byKey = new Map(Object.entries(interimBios).map(([name, bio]) => [personNameKey(name), bio]));

export function interimBio2026(name: string): string | undefined {
  return byKey.get(personNameKey(name));
}
