import { producerCredit2026, talentPlacement2026 } from "@not-alone/config";
import type { EventSnapshot } from "@not-alone/validation";
import { directoryPeople, type SummitPerson, type PersonCategory } from "./people";
import { ownerApprovedCoChairs2026 } from "./content";
import original from "./original-sites.json";
import { originalAsset } from "./original-assets";
import { portrait2026 } from "./portrait-overrides";
import { personNameKey, personPortrait, updatedPortrait } from "./person-portraits";
import { airtableOverlay } from "./airtable-shared";
import { awards2026Editorial, ownerApprovedFounders2026 } from "./awards-editorial";

// Meeting direction, September 21: on the Awards page musicians come first, then founders.
// Founders are split into "Founders & Entrepreneurs" and "Philanthropists"; the former
// "Business Leaders & Philanthropists" group is split the same way ("Business Leaders").
// With Airtable connected the rubric groups (Founders, Comedians, Athletes, Podcasters, Talent) are used;
// empty groups are never shown.
export const awardsGuestCategories = ["Musicians", "Founders", "Founders & Entrepreneurs", "Philanthropists", "Comedians", "Athletes", "Entertainers & Athletes", "Experts", "Podcasters", "Talent", "Business Leaders"] as const;
// Summit order follows ICF's page (founders first); same groups.
export const summitGuestCategories = ["Founders", "Founders & Entrepreneurs", "Philanthropists", "Musicians", "Comedians", "Athletes", "Entertainers & Athletes", "Experts", "Podcasters", "Talent", "Business Leaders"] as const;
// Placement by each person's public ICF/Airtable affiliation: foundations, trusts, family giving and
// nonprofit advocacy are philanthropy; companies and ventures are entrepreneurship/business.
const philanthropists = new Set([
  "steven and alexandra cohen", "alex cohen", "pam and duncan goldie morrison", "winston and cameron kelly",
  "jennifer smorgon", "jen smorgen", "nick kislinger", "miriam isa", "sanem sam alkan", "ray lewis", "jessica edwards",
  "kevin hines", "margaret hines", "david hirsch", "sophie gregoire", "sophie gregoire trudeau", "jaymes black"
]);
const splitCategory = (category: string, key: string) =>
  category === "Founders" ? (philanthropists.has(key) ? "Philanthropists" : "Founders & Entrepreneurs")
  : category === "Business Leaders & Philanthropists" || category === "Business Leaders & Entrepreneurs" ? (philanthropists.has(key) ? "Philanthropists" : "Business Leaders")
  : category;
export const awardsCategoryPriority: PersonCategory[] = ["Co-Chairs", "Hosts", "Executive Producers", "Producers", ...awardsGuestCategories];
const sourceUrl = "https://www.inspiringchildren.org/awards";
const aliases: Record<string, string> = {
  "jen smorgen": "jennifer smorgon", "daniel gillison": "daniel h gillison",
  "bob bryan": "bob and mike bryan", "mike bryan": "bob and mike bryan",
  "melinda springer": "melinda and noah springer", "noah springer": "melinda and noah springer",
  "sean wolfington": "sean and ana wolfington", "ana wolfington": "sean and ana wolfington",
  "janet wozniak": "janet and steve wozniak"
};
type PublicCredit = { category: PersonCategory; role: string; image?: string };
const credits = new Map<string, PublicCredit>();
for (const section of original.awards.sections.slice(5, 10)) {
  for (const person of section.people) {
    const key = personNameKey(person.name);
    if (!credits.has(key)) credits.set(key, { category: splitCategory(section.title, key) as PersonCategory, role: person.role, image: originalAsset(person.image) });
  }
}
// Every public category a person holds on ICF's Summit and Awards pages (owner, Sept 21: people may be
// listed, with photo and bio, in each of their categories, e.g. Jewel as co-chair, producer and musician).
const allCredits = new Map<string, Map<string, string>>();
for (const section of [...original.awards.sections.slice(5, 10), ...original.summit.sections.slice(7, 12)]) {
  for (const person of section.people) {
    const key = personNameKey(person.name);
    const target = allCredits.get(key) ?? new Map<string, string>();
    const category = splitCategory(section.title, key);
    if (!target.has(category)) target.set(category, person.role);
    allCredits.set(key, target);
  }
}
const leadership = original.summit.sections[4]!;
leadership.blocks.filter(block => block.tag === "h4").slice(0, 3).forEach((person, index) => {
  credits.set(personNameKey(person.text), { category: "Co-Chairs", role: leadership.blocks.find((block, position) => leadership.blocks[position - 1]?.text === person.text)?.text ?? "Co-Chair", image: originalAsset(leadership.images[index]!.src) });
});
const producerImages = new Map(original.summit.sections[13]!.blocks.filter(block => block.tag === "h4").map((person, index) => [personNameKey(person.text), originalAsset(original.summit.sections[13]!.images[index]!.src)]));

// Short, original summaries of the public sources, reviewed September 17, 2026.
// These describe people, not an Awards performance, speaking slot or honor.
export const awardsBiographies: Record<string, { bio: string; source: string }> = {
  "Jewel": { bio: "Jewel is a singer-songwriter and mental health advocate. Inspiring Children recognizes her work in music and human development and lists her among the gathering's co-chairs.", source: "https://www.inspiringchildren.org/summit" },
  "Steve Wozniak": { bio: "Steve Wozniak is an engineer, inventor and co-founder of Apple. His philanthropic interests include education, creativity and innovation, and he co-founded the Wozniak Family Foundation with Janet Wozniak.", source: "https://www.inspiringchildren.org/summit-janet-and-steve-wozniak" },
  "Cherrial Odell": { bio: "Cherrial Odell is an Inspiring Children Foundation alumna. She is listed as a co-chair on the foundation's public Summit website and is an owner-confirmed co-chair for the 2026 gathering.", source: "https://www.inspiringchildren.org/summit" },
  "Loni Love": { bio: "Loni Love is a comedian and television host. She is the host of the 2026 Not Alone Awards, bringing her experience in entertainment to the celebration of human development and mental health.", source: sourceUrl },
  "Ellie Kanner": { bio: "Ellie Kanner is a director, writer and producer whose career also includes casting for Friends and Sex and the City. Her directing credits include Authors Anonymous, Wake and the series Dropping the Soap.", source: "https://www.inspiringchildren.org/summit-ellie-kanner" },
  "Nick Kislinger": { bio: "Nick Kislinger works across philanthropy, social innovation and mental health. His public ICF biography describes his work advising charitable initiatives, co-founding Impact Hub Los Angeles and launching the breathwork app Breathwrk.", source: "https://www.inspiringchildren.org/summit-nick-kislinger" },
  "Jen Smorgen": { bio: "Jennifer Smorgon is a meditation teacher and mentor, and a founding member of the Chopra Foundation. She has taught in corporate and community settings and helps make meditation accessible in daily life.", source: "https://www.inspiringchildren.org/summit-jennifer-smorgon" },
  "Sean Wolfington": { bio: "Sean Wolfington is a technology entrepreneur and philanthropist with experience in automotive technology, advertising and media. His charitable work supports youth development and mentorship in collaboration with Inspiring Children Foundation.", source: "https://www.inspiringchildren.org/summit-sean-and-ana-wolfington" },
  "Ana Wolfington": { bio: "Ana Wolfington is listed with Sean Wolfington among the founders on Inspiring Children's public Awards website. The foundation's shared profile recognizes their philanthropic work and connection to youth development.", source: "https://www.inspiringchildren.org/summit-sean-and-ana-wolfington" },
  "Janet Wozniak": { bio: "Janet Wozniak has worked in education development at Apple. With Steve Wozniak, she co-founded the Wozniak Family Foundation to support STEM education and social development.", source: "https://www.inspiringchildren.org/summit-janet-and-steve-wozniak" },
  "Melinda Springer": { bio: "Melinda Springer is listed with Noah Springer among the founders on Inspiring Children's public Awards website, where their affiliation is identified as Pickle Pro Labs.", source: sourceUrl },
  "Noah Springer": { bio: "Noah Springer is listed with Melinda Springer among the founders on Inspiring Children's public Awards website, where their affiliation is identified as Pickle Pro Labs.", source: sourceUrl },
  "Darryl McDaniels (DMC)": { bio: "Darryl McDaniels, known as DMC, is a musician associated with Run-DMC. Inspiring Children's public Awards website includes him in its Musicians category.", source: sourceUrl },
  "Jason Kennedy": { bio: "Jason Kennedy is an entertainment journalist. Inspiring Children's public Awards website lists him among entertainers and athletes, while its Summit website also recognizes him as Summit host.", source: "https://www.inspiringchildren.org/summit" },
  "Sarah Gilman": { bio: "Sarah Gilman is an actress. Inspiring Children's public Awards website includes her among its entertainers and athletes.", source: sourceUrl },
  "Mike Tyson": { bio: "Mike Tyson is a Hall of Fame boxer. His career in professional boxing is recognized on Inspiring Children's public Awards website, which includes him among entertainers and athletes.", source: sourceUrl },
  "Bob Bryan": { bio: "Bob Bryan is a Hall of Fame tennis player. Inspiring Children's public Awards website recognizes Bob and Mike Bryan together in its Entertainers & Athletes category.", source: sourceUrl },
  "Mike Bryan": { bio: "Mike Bryan is a Hall of Fame tennis player. Inspiring Children's public Awards website recognizes Mike and Bob Bryan together in its Entertainers & Athletes category.", source: sourceUrl },
  "Blaise Aguirre": { bio: "Blaise Aguirre is a child and adolescent psychiatrist at McLean Hospital. His work includes dialectical behavior therapy and the 3East programs for adolescents, and he has written books on treatment and mindfulness.", source: "https://www.inspiringchildren.org/summit-blaise-aguirre-md" },
  "David Eagleman": { bio: "David Eagleman is a neuroscientist and author whose research includes perception and sensory substitution. His books include Livewired and Incognito, and he has explored the relationship between neuroscience and the legal system.", source: "https://www.inspiringchildren.org/summit-david-eagleman" },
  "Jon Hershfield": { bio: "Jon Hershfield is a therapist specializing in obsessive-compulsive disorder and anxiety. His work combines exposure-based therapy with mindfulness and self-compassion, and he has authored and co-authored several books on OCD.", source: "https://www.inspiringchildren.org/summit-jon-hershfield" },
  "Marc Brackett": { bio: "Marc Brackett is listed as a Yale-affiliated expert on Inspiring Children's public Awards website. His inclusion connects the gathering with research and expertise in emotional and mental well-being.", source: sourceUrl },
  "Wendy Oliver-Pyatt": { bio: "Wendy Oliver-Pyatt is an eating disorder expert. Inspiring Children's public Awards website recognizes her clinical expertise in its Experts category.", source: sourceUrl },
  "Daniel Gillison": { bio: "Daniel Gillison is associated with the National Alliance on Mental Illness, known as NAMI. Inspiring Children's public Awards website recognizes him in its Business Leaders & Philanthropists category.", source: sourceUrl },
  "Kevin Hines": { bio: "Kevin Hines is a mental health advocate, author and speaker focused on suicide prevention and resilience. His work includes the Kevin & Margaret Hines Foundation and the book Cracked, Not Broken.", source: "https://www.inspiringchildren.org/summit-kevin-hines" },
  "Mike Majlak": { bio: "Mike Majlak is a media personality associated with the Impaulsive podcast. Inspiring Children's public Awards website includes him among business leaders and philanthropists.", source: sourceUrl },
  "Ryan Wolfington": { bio: "Ryan Wolfington is a founder of Inspiring Children Foundation. The foundation's public Summit website credits him as an executive producer of the gathering.", source: "https://www.inspiringchildren.org/summit" },
  "Trevor Short": { bio: "Trevor Short is a founder of Inspiring Dreams. Inspiring Children's public Summit website recognizes him among the gathering's executive producers.", source: "https://www.inspiringchildren.org/summit" },
  "Trent Alenik": { bio: "Trent Alenik is identified by Inspiring Children Foundation as its CEO. The foundation's public Summit website also credits him as a producer of the gathering.", source: "https://www.inspiringchildren.org/summit" },
  "Aphrah Brokaw": { bio: "Aphrah Brokaw is a music manager associated with Jewel Inc. Inspiring Children's public Summit website recognizes her work as a producer of the gathering.", source: "https://www.inspiringchildren.org/summit" },
  "Anthony Ramos": { bio: "Anthony Ramos is an actor and recording artist. He originated the roles of John Laurens and Philip Hamilton in Hamilton and played the lead role in the film adaptation of In the Heights.", source: "https://www.biography.com/actors/a44131012/anthony-ramos" },
  "Alana Springsteen": { bio: "Alana Springsteen is a country singer-songwriter and multi-instrumentalist. She plays guitar and piano, co-produces her music and draws on personal experience in her songwriting.", source: "https://alanaspringsteen.com/about/" },
  "Caroline Jones": { bio: "Caroline Jones is a singer-songwriter and multi-instrumentalist with a solo recording career and experience as a member of Zac Brown Band. Her work spans country music and collaborations with fellow artists.", source: "https://carolinejones.com/" },
  "Lexi Hensler": { bio: "Lexi Hensler is a digital content creator. Her public channels include YouTube, Instagram and TikTok, and her official links include the Hugz brand.", source: "https://linktr.ee/lexihensler" },
  "Brandon Saho": { bio: "Brandon Saho is a former sports reporter and the creator of The Mental Game. Through interviews and public conversations, he works to reduce stigma around mental health.", source: "https://www.themental.game/" },
  "Pam & Duncan Goldie-Morrison": { bio: "Pam and Duncan Goldie-Morrison are philanthropists. Inspiring Children Foundation's public Summit website lists them among the gathering's founders.", source: "https://www.inspiringchildren.org/summit" },
  // Newly confirmed in the Sept 21 Airtable review; short factual summaries of Airtable and public sources.
  "Bishop Briggs": { bio: "Bishop Briggs is a singer-songwriter known for songs including \"River.\" Inspiring Children's public Awards website includes her in its Musicians category.", source: sourceUrl },
  "Silas Luke Jones": { bio: "Silas Luke Jones is a musician. Inspiring Children's public Summit and Awards websites include him in their Musicians category.", source: "https://www.inspiringchildren.org/summit-silas-luke-jones" },
  "Sarah Steil": { bio: "Sarah Steil is a singer-songwriter and a confirmed guest of the 2026 gathering.", source: "https://nashvillevoyager.com/" },
  "Rahil Briggs": { bio: "Rahil Briggs is a child psychologist and National Director of HealthySteps, a ZERO TO THREE program that supports young children and families through pediatric primary care.", source: "https://www.zerotothree.org/team/rahil-d-briggs/" },
  "Jessica Edwards": { bio: "Jessica Edwards is part of the leadership team at the National Alliance on Mental Illness (NAMI).", source: "https://www.nami.org/who-we-are/meet-our-leadership/jessica-edwards/" },
  "Margaret Hines": { bio: "Margaret Hines is associated with the Kevin & Margaret Hines Foundation, which supports suicide prevention and mental health.", source: "https://www.inspiringchildren.org/summit-kevin-hines" },
  "Michael Townsend": { bio: "Michael Townsend is an artist with Tape Art, a studio that creates large-scale drawings with tape.", source: "https://www.tapeart.com/who-we-are" },
  "Leah Smith": { bio: "Leah Smith is an artist with Tape Art, a studio that creates large-scale drawings with tape.", source: "https://www.tapeart.com/who-we-are" },
  "Jeff Levin": { bio: "Jeff Levin is a talent manager and a confirmed guest of the 2026 gathering.", source: "https://www.adweek.com/" },
  "Sanem (Sam) Alkan": { bio: "Sanem (Sam) Alkan is associated with Resonance Philanthropies and is a confirmed guest of the 2026 gathering.", source: "https://www.sobrato.com/people/sam-alkan/" },
  "Ray Lewis": { bio: "Ray Lewis is associated with the Ray of Hope Foundation and is a confirmed guest of the 2026 gathering.", source: "https://www.inspiringchildren.org/awards" },
  "Miriam Isa": { bio: "Miriam Isa is associated with Flourish Trust and is a confirmed guest of the 2026 gathering.", source: "https://www.inspiringchildren.org/awards" },
  "Caroline Silby": { bio: "Caroline Silby is a sport psychologist who works with athletes on mental performance. Her experience includes supporting U.S. Figure Skating and athletes competing at the Olympic level.", source: "https://www.drsilby.com/" }
};
const additionalCredits: Record<string, PublicCredit> = {
  "Anthony Ramos": { category: "Musicians", role: "Actor & Recording Artist" },
  "Alana Springsteen": { category: "Musicians", role: "Singer-Songwriter" },
  "Caroline Jones": { category: "Musicians", role: "Singer-Songwriter & Multi-Instrumentalist" },
  "Lexi Hensler": { category: "Entertainers & Athletes", role: "Content Creator" },
  "Brandon Saho": { category: "Entertainers & Athletes", role: "The Mental Game" },
  "Caroline Silby": { category: "Experts", role: "Sport Psychologist" }
};
for (const [name, credit] of Object.entries(additionalCredits)) credits.set(personNameKey(name), credit);
// Reviewed Airtable placements fill in confirmed people with no public ICF credit.
for (const [name, placement] of Object.entries(talentPlacement2026)) if (!credits.has(personNameKey(name))) credits.set(personNameKey(name), placement as PublicCredit);
// Founders credited on ICF's Summit page (e.g. Pam & Duncan Goldie-Morrison) keep their photo.
const icfFounders = original.summit.sections[7]!.people.map(person => ({ name: person.name, role: person.role }));
const founderKeys = new Set(icfFounders.map(person => personNameKey(person.name)));
for (const person of original.summit.sections[7]!.people) {
  const key = personNameKey(person.name);
  if (!credits.has(key)) credits.set(key, { category: splitCategory("Founders", key) as PersonCategory, role: person.role, image: originalAsset(person.image) });
}

// Public portrait sources selected for the Awards directory only. These remain
// external so the app does not copy or redistribute the source photography.
const awardsHeadshots: Record<string, string> = {
  // Owner (Sept 21): a proper headshot for Jewel's guest cards (ICF's own portrait from its producer credits).
  "Jewel": "/original-2025/df2e7f172d2e3977eac2.png",
  "Anthony Ramos": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ad/Anthony_Ramos_A_House_of_Dynamite-48_%28cropped%29.jpg/960px-Anthony_Ramos_A_House_of_Dynamite-48_%28cropped%29.jpg",
  "Alana Springsteen": "https://www.opry.com/assets/img/GOO_Alana_Springsteen_1200x628-93a25506d6.jpg",
  "Caroline Jones": "https://www.opry.com/assets/img/GOO_Caroline_Jones_1200x628-f78e720238.jpg",
  "Lexi Hensler": "https://celebmafia.com/wp-content/uploads/2019/03/lexi-hensler-kids-choice-awards-2019-4.jpg",
  "Mike Bryan": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1a/Bryan_M._RG19_%2812%29_%2848199368111%29.jpg/960px-Bryan_M._RG19_%2812%29_%2848199368111%29.jpg",
  "Brandon Saho": "https://static.wixstatic.com/media/68e392_0f29dead84ee4c73bdfde04b0a017b23~mv2.jpg/v1/crop/x_0,y_98,w_1440,h_1604/fill/w_834,h_928,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/592483239_1448771757255130_5949903694009096301_n.jpg"
};

export function awardsPerson(person: SummitPerson): SummitPerson | undefined {
  const key = personNameKey(person.name);
  // Airtable listing: its rubric categories, title and headshot; bio from Airtable, then reviewed copy.
  if (person.source === "airtable") {
    if (!person.categories.length) return undefined;
    // Reviewed portraits win; a person whose photos failed review is listed by name only.
    const reviewed = portrait2026(person.name);
    const image = reviewed === null ? undefined : reviewed ?? person.image ?? awardsHeadshots[person.name] ?? personPortrait(person.name);
    const { image: _image, ...rest } = person;
    return { ...rest, bio: person.bio.trim() || awardsBiographies[person.name]?.bio || "", ...(image ? { image } : {}) };
  }
  const publicCredit = credits.get(aliases[key] ?? key);
  const producer = producerCredit2026(person.name);
  const category = publicCredit?.category === "Co-Chairs" ? "Co-Chairs"
    : person.name === awards2026Editorial.host ? "Hosts"
    : producer?.category ?? publicCredit?.category;
  if (!category) return undefined;
  const biography = awardsBiographies[person.name];
  const reviewed = portrait2026(person.name);
  const image = reviewed === null ? undefined : reviewed ?? (producer && category !== "Co-Chairs" ? producerImages.get(key) : awardsHeadshots[person.name] ?? publicCredit?.image ?? personPortrait(person.name));
  const { image: _publishedImage, ...rest } = person;
  const held = new Map([...(allCredits.get(aliases[key] ?? key) ?? []), ...(allCredits.get(key) ?? [])]);
  const extra = [...held.keys()].filter(value => value !== category && (awardsGuestCategories as readonly string[]).includes(value)) as PersonCategory[];
  const categoryRoles = Object.fromEntries(extra.map(value => [value, held.get(value)!])) as Partial<Record<PersonCategory, string>>;
  return { ...rest, categories: [...new Set<PersonCategory>([category, ...extra])], ...(extra.length ? { categoryRoles } : {}), role: producer && category !== "Co-Chairs" ? producer.role : publicCredit?.role ?? person.role,
    bio: person.bio.trim() || biography?.bio || (founderKeys.has(key) ? `${person.name} ${/ & /.test(person.name) ? "are" : "is"} listed among the founders of the Not Alone Summit on Inspiring Children Foundation's public Summit and Awards websites.` : ""), ...(image ? { image } : {}) };
}

export function awardsPeople(snapshot: EventSnapshot | null): SummitPerson[] {
  const reviewed = directoryPeople(snapshot);
  const supplied = [...reviewed];
  if (snapshot?.event.directoryEnabled && reviewed.length) {
    for (const name of ownerApprovedCoChairs2026) {
      const key = personNameKey(name);
      const records = snapshot.speakers.filter(person => person.eventId === snapshot.event.id && personNameKey(person.name) === key);
      if ((!records.length || records.some(person => person.published)) && !supplied.some(person => personNameKey(person.name) === key)) {
        supplied.push({ name, slug: `2026-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`, categories: ["Co-Chairs"], role: "Co-Chair", bio: "", year: 2026 });
      }
    }
  }
  // Founders are a standing credit (ICF lists them on its current Summit and Awards pages). Per the
  // Sept 21 meeting ("add the 2 more, and last year's"), the published ICF founders and the
  // owner-approved Pam & Duncan Goldie-Morrison are shown even without a 2026 attendance record.
  if (snapshot?.event.directoryEnabled && reviewed.length) {
    const live = Boolean(airtableOverlay(snapshot)?.people);
    const present = new Set(supplied.map(person => { const key = personNameKey(person.name); return aliases[key] ?? key; }));
    // Any staff record (published, withdrawn or for another event) and any higher credit wins.
    for (const record of snapshot.speakers) { const key = personNameKey(record.name); present.add(aliases[key] ?? key); }
    for (const name of ["Jewel", "Ryan Wolfington", ...ownerApprovedCoChairs2026]) present.add(personNameKey(name));
    // With Airtable connected its Founder group replaces ICF's standing list; owner-approved credits stay.
    for (const founder of [...(live ? [] : icfFounders), ...ownerApprovedFounders2026.map(name => ({ name, role: "" }))]) {
      const key = personNameKey(founder.name);
      if (present.has(aliases[key] ?? key)) continue;
      present.add(key);
      supplied.push({ name: founder.name, slug: `2026-${founder.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`, categories: ["Founders"], role: founder.role, bio: "", year: 2026 });
    }
  }
  const seen = new Set<string>();
  return supplied.flatMap(person => {
    const key = personNameKey(person.name);
    const selected = awardsPerson(person);
    if (!selected || seen.has(key)) return [];
    seen.add(key);
    return [selected];
  });
}

// The public Awards display intentionally recognizes the Wolfingtons together.
// Canonical people remain separate for the Summit and all operational data.
// Owner (Oct 5, 2026): couples read "Sean and Ana Wolfington" (the word "and", not an ampersand).
export function awardsDisplayPeople(snapshot: EventSnapshot | null): SummitPerson[] {
  let people = awardsPeople(snapshot);
  const couples: { first: string; second: string; name: string; slug: string; bio: string; image?: string }[] = [
    { first: "Sean Wolfington", second: "Ana Wolfington", name: "Sean and Ana Wolfington", slug: "2026-sean-ana-wolfington", bio: "Sean and Ana Wolfington are entrepreneurs and philanthropists. Inspiring Children Foundation's public Awards and Summit materials recognize their shared philanthropic work and support for youth development." },
    { first: "Melinda Springer", second: "Noah Springer", name: "Melinda and Noah Springer", slug: "2026-melinda-noah-springer", bio: "Melinda and Noah Springer are recognized together among the founders on Inspiring Children Foundation's public Awards website, with their affiliation listed as Pickle Pro Labs." },
    // Sept 22 (Paige/owner): founder couples from Airtable, credited together like ICF's 2025 site.
    // Owner (Oct 5): Jay and Erica McGraw are NOT a couple card any more: no photo of the two of them exists that we
    // may publish, and a card must never be two photos side by side. They are two individual Founder cards (name
    // cards until each has a usable headshot; see lib/portrait-overrides.ts).
    { first: "Melony Lewis", second: "Adam Lewis", name: "Melony and Adam Lewis", slug: "2026-melony-adam-lewis", bio: "Melony and Adam Lewis are founders of the Not Alone Summit." },
    { first: "Winston Kelly", second: "Cameron Kelly", name: "Winston and Cameron Kelly", slug: "2026-winston-cameron-kelly", bio: "Winston and Cameron Kelly are founders of the Not Alone Summit." },
    // Sept 22: Airtable now holds Steven and Alexandra as two records; the website keeps ICF's joint card and photo.
    { first: "Steven Cohen", second: "Alexandra Cohen", name: "Steven and Alexandra Cohen", slug: "2026-steven-alexandra-cohen", bio: "The Steven & Alexandra Cohen Foundation powers the Not Alone Summit and Awards; Steven and Alexandra Cohen are founders of the Not Alone Summit.", image: "/original-2025/020a823cfe4f160d93b0.png" }
  ];
  for (const couple of couples) {
    const first = people.find(person => person.name === couple.first);
    const second = people.find(person => person.name === couple.second);
    if (!first || !second) continue;
    // With Airtable: both people's Airtable bios and titles, the photo of the two of them (Ana's and
    // Noah's Airtable headshots show the couple), and every category either one holds.
    const airtable = first.source === "airtable" && second.source === "airtable";
    const bios = [...new Set([first.bio, second.bio].map(bio => bio.trim()).filter(Boolean))];
    // Both titles, unless one already contains the other ("Co-Founder, Pickle Pro Labs" inside
    // "Co-Founder, Pickle Pro Labs and Philanthropist").
    const roles = [...new Set([first.role, second.role].map(role => role.trim()).filter(Boolean))]
      .filter((role, _, all) => !all.some(other => other !== role && other.toLowerCase().includes(role.toLowerCase())));
    const image = couple.image ?? (airtable ? second.image ?? first.image : first.image);
    const rank = [first.rank, second.rank].filter((value): value is number => value !== undefined);
    const tiers = [first.tier, second.tier].filter(Boolean) as NonNullable<SummitPerson["tier"]>[];
    const best = { ...(rank.length ? { rank: Math.min(...rank) } : {}), ...(tiers.length ? { tier: tiers.sort()[0] } : {}) };
    const shared: SummitPerson = airtable
      ? { ...first, name: couple.name, slug: couple.slug, bio: bios.length ? bios.join("\n\n") : couple.bio, role: roles.join(" · "),
        categories: [...new Set([...first.categories, ...second.categories])], featured: Boolean(first.featured || second.featured),
        order: Math.min(first.order ?? Number.MAX_SAFE_INTEGER, second.order ?? Number.MAX_SAFE_INTEGER), ...best, ...(image ? { image } : {}) }
      : { ...first, name: couple.name, slug: couple.slug, bio: couple.bio };
    people = people.flatMap(person => person.name === couple.first ? [shared] : person.name === couple.second ? [] : [person]);
  }
  return people;
}

// Owner (Oct 5, 2026): on the Partners page's Philanthropists section a couple is one card ("Steve and Janet
// Wozniak"), never two profiles. Steve is a co-chair and keynote elsewhere, so this pairing applies only there;
// the photo is ICF's own picture of the two of them (2025 site).
export const philanthropistCouples = [
  { first: "Steve Wozniak", second: "Janet Wozniak", name: "Steve and Janet Wozniak", slug: "2026-steve-janet-wozniak",
    image: originalAsset("https://static1.squarespace.com/static/628691b65c3a24383d0eac0a/t/68ec81e77594567546cc159d/1760330215338/Steve+and+Janet+Wozniak+sq.jpg?format=500w") }
] as const;
export function philanthropistDisplayPeople(people: SummitPerson[]): SummitPerson[] {
  for (const couple of philanthropistCouples) {
    const first = people.find(person => person.name === couple.first);
    const second = people.find(person => person.name === couple.second);
    if (!first || !second) continue;
    const roles = [...new Set([first.role, second.role].map(role => role.trim()).filter(Boolean))];
    const shared: SummitPerson = { ...second, name: couple.name, slug: couple.slug, image: couple.image, role: roles.join(" · "),
      categories: [...new Set([...first.categories, ...second.categories])] };
    people = people.flatMap(person => person.name === couple.first ? [shared] : person.name === couple.second ? [] : [person]);
  }
  return people;
}
