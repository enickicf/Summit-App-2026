// Builds the app's Info content from the website's reviewed editorial sources (read-only imports;
// nothing in apps/web changes). Run from apps/mobile:
//   ../web/node_modules/.bin/tsx scripts/export-website-content.ts
// Writes lib/summit-content.generated.json.
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { publishedAwardsProgram } from "@not-alone/domain";
import { event2026Snapshot } from "@not-alone/test-fixtures/event-2026";
import { originalProducerCredit } from "@not-alone/config";
import original from "../../web/lib/original-sites.json";
import { awards2026Editorial, awards2025Winners } from "../../web/lib/awards-editorial";
import { awardsHeroTimes, awardsPromotionalProgram } from "../../web/lib/awards-program";
import { awardsDisplayPeople } from "../../web/lib/awards-people";
import { awards2025Highlights } from "../../web/lib/content";
import { directoryPeople } from "../../web/lib/people";
import { personNameKey, personPortrait, portraitImageStyle } from "../../web/lib/person-portraits";
import { appPublicGuests2026 } from "../lib/app-content-rules";

const site = "https://not-alone-summit.netlify.app";
const absolute = (image?: string | null) => image ? (image.startsWith("/") ? `${site}${image}` : image) : null;
const zoomFor = (name: string) => Number(/scale\(([\d.]+)\)/.exec(portraitImageStyle(name)?.transform ?? "")?.[1] ?? 1);

// Airtable Talent Level for confirmed talent/founders the website does not feature (read-only review,
// Sept 18, 2026). Used only to place them in Founders vs Talent; no roles are inferred.
const founderLevel = new Set(["Nick Kislinger", "Sanem (Sam) Alkan", "Daniel Gillison", "Jessica Edwards", "Ellie Kanner", "Jen Smorgen", "Miriam Isa", "Ray Lewis"].map(personNameKey));
const producers = ["Trevor Short", "Aphrah Brokaw", "Trent Alenik"];
// Airtable Occupation values read in full (Sept 18); only these are shown as roles.
const airtableRoles: Record<string, { role: string; category?: string }> = {
  "Sarah Steil": { role: "Musician", category: "Musicians" },
  "Michael Townsend": { role: "Tape Art" },
  "Leah Smith": { role: "Tape Art" },
  "Jeff Levin": { role: "Talent Manager" },
  "Jessica Edwards": { role: "CDO of NAMI" },
  "Ray Lewis": { role: "Speaker" }
};
const sectionOrder = ["Co-Chairs", "Hosts", "Founders", "Musicians", "Entertainers & Athletes", "Experts", "Business Leaders & Philanthropists", "Talent", "Executive Producers", "Producers"];

const allowed = new Set(appPublicGuests2026.map(personNameKey));
const featured = awardsDisplayPeople(event2026Snapshot);
const covered = new Set<string>();
type Person = { name: string; category: string; role: string; bio: string; image: string | null; zoom: number };
const people: Person[] = [];

for (const person of featured) {
  const names = person.name.includes("&") ? person.name.split("&").map((part, index, all) => index === 0 && !part.trim().includes(" ") ? `${part.trim()} ${all.at(-1)!.trim().split(" ").slice(1).join(" ")}` : part.trim()) : [person.name];
  const raw = person.categories[0]!;
  const category = raw;
  if (category !== "Co-Chairs" && category !== "Hosts" && !names.every(name => allowed.has(personNameKey(name)))) continue;
  names.forEach(name => covered.add(personNameKey(name)));
  people.push({ name: person.name, category, role: person.role, bio: person.bio, image: absolute(person.image), zoom: zoomFor(person.name) });
}

const directory = new Map(directoryPeople(event2026Snapshot).map(person => [personNameKey(person.name), person]));
for (const name of appPublicGuests2026) {
  const key = personNameKey(name);
  if (covered.has(key)) continue;
  const producer = producers.includes(name) ? originalProducerCredit(name) : undefined;
  const record = directory.get(key);
  covered.add(key);
  people.push({
    name,
    category: producer ? producer.category : airtableRoles[name]?.category ?? (founderLevel.has(key) ? "Founders" : "Talent"),
    role: producer?.role ?? airtableRoles[name]?.role ?? "",
    bio: record?.bio ?? "",
    image: absolute(record?.image ?? personPortrait(name)),
    zoom: zoomFor(name)
  });
}

// Owner-set display order within a section (Sept 19): Aphrah on the left, Trent on the right.
const pinnedOrder: Record<string, string[]> = { Producers: ["Aphrah Brokaw", "Trent Alenik"] };
const pin = (person: Person) => {
  const list = pinnedOrder[person.category];
  const index = list ? list.indexOf(person.name) : -1;
  return index < 0 ? Number.MAX_SAFE_INTEGER : index;
};
people.sort((a, b) => sectionOrder.indexOf(a.category) - sectionOrder.indexOf(b.category) || pin(a) - pin(b));

const program = publishedAwardsProgram(event2026Snapshot);
const programBody = program ? awardsPromotionalProgram(program.body, event2026Snapshot) : null;
const host = featured.find(person => person.name === awards2026Editorial.host);
const awards = {
  venue: awards2026Editorial.venue,
  date: awards2026Editorial.date,
  times: awardsHeroTimes(programBody, event2026Snapshot).filter(item => item.label !== "Red Carpet"),
  intro: original.awards.sections[1]!.blocks[1]!.text,
  foundation: awards2026Editorial.foundation,
  rsvpUrl: awards2026Editorial.rsvpUrl,
  iHeartUrl: awards2026Editorial.iHeartUrl,
  host: host ? { name: host.name, role: "Comedian & TV Host", bio: host.bio, image: absolute(host.image), zoom: zoomFor(host.name) } : null,
  highlights: { title: awards2025Highlights.title, url: awards2025Highlights.watchUrl, duration: awards2025Highlights.duration },
  winners2025: awards2025Winners
};

const output = { source: "apps/web editorial libs via apps/mobile/scripts/export-website-content.ts", sections: sectionOrder.filter(section => people.some(person => person.category === section)), people, awards };
writeFileSync(resolve(import.meta.dirname, "../lib/summit-content.generated.json"), `${JSON.stringify(output, null, 2)}\n`);
console.log(people.length, "people", output.sections, "| times", JSON.stringify(awards.times), "| host", Boolean(host));
console.log(people.filter(p => !p.image).map(p => p.name).join(", "));
