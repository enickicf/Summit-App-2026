// Owner (Sept 21, 2026): every 2026 headshot must pass the same checks (sharp, straight-on, well cropped,
// the same head size and position as ICF's public cards). For each person every available photo was
// compared (Airtable, ICF's own site, the site's approved portraits, permitted public photos) and the best
// one was cropped to the ICF card format (948x900; face about half the height, centered a little above the
// middle). Airtable photos are used only when they are the best. Cut-outs keep their transparency (PNG).
// Sources: airtable = the person's Airtable headshot; icf-card / icf-leader = inspiringchildren.org;
// site-2026 = a portrait already approved for the site; commons / web = a public photo (credit noted).
// attribution: the credit a freely licensed photo must show; it appears under the bio on the person's profile.
export type PortraitOverride = { file: string; source: string; airtableBytes?: number; credit?: string; attribution?: { label: string; href: string } };
export const portraitOverrides2026: Record<string, PortraitOverride> = {
  // Sept 21 late additions (sources in work/new-headshots-20260921/manifest.json).
  // Owner (Sept 21, late): a photo beats a name card. Hal Fisher and Sarah Steil use their own Airtable photos
  // (small originals, enlarged) until a sharper headshot is supplied.
  "sarah steil": { file: "/2026-headshots/portraits/sarah-steil-3.jpg", source: "airtable", airtableBytes: 8055667 },
  "sheri sobrato": { file: "/2026-headshots/portraits/sheri-sobrato.jpg", source: "web", credit: "Official portrait, sobrato.com/people/sheri-sobrato (courtesy The Sobrato Organization); Airtable only holds a 32px thumbnail" },
  "bob bryan": { file: "/2026-headshots/portraits/bob-bryan.jpg", source: "commons", credit: "Vbrunophotog, 2025 International Tennis Hall of Fame press conference, CC BY-SA 4.0" },
  "caroline silby": { file: "/2026-headshots/portraits/caroline-silby.jpg", source: "web", credit: "drsilby.com (her official site)" },
  "sanem sam alkan": { file: "/2026-headshots/portraits/sanem-alkan.jpg", source: "web", credit: "brainmind.org event page (same photo as her Sobrato profile)" },
  "alana springsteen": { file: "/2026-headshots/portraits/alana-springsteen-2.jpg", source: "web", credit: "public press photo already used on the site (release review pending)" },
  "alexa price": { file: "/2026-headshots/portraits/alexa-price.jpg", source: "airtable", airtableBytes: 8335 },
  "allison elbl": { file: "/2026-headshots/portraits/allison-elbl.jpg", source: "airtable", airtableBytes: 15978 },
  "ana wolfington": { file: "/2026-headshots/portraits/ana-wolfington.jpg", source: "airtable", airtableBytes: 133215 },
  "anthony ramos": { file: "/2026-headshots/portraits/anthony-ramos.jpg", source: "web", credit: "public press photo already used on the site (release review pending)" },
  "aphrah brokaw": { file: "/2026-headshots/portraits/aphrah-brokaw-2.jpg", source: "web", credit: "ICF Not Alone participants title card (inspiringchildren.org/notalone-participants); full photo, no cut-out (owner, Sept 21 late)" },
  "bianca mok": { file: "/2026-headshots/portraits/bianca-mok.jpg", source: "airtable", airtableBytes: 191013 },
  "bishop briggs": { file: "/2026-headshots/portraits/bishop-briggs.jpg", source: "icf-card" },
  "blaise aguirre": { file: "/2026-headshots/portraits/blaise-aguirre.jpg", source: "airtable", airtableBytes: 64007 },
  "brandon saho": { file: "/2026-headshots/portraits/brandon-saho.jpg", source: "airtable", airtableBytes: 3884561 },
  "caroline jones": { file: "/2026-headshots/portraits/caroline-jones-2.jpg", source: "web", credit: "Official \"Good Omen\" press headshot (Nashville Harbor Records / Big Machine, 2025), photo: Alysse Gafkjen; via tasteofcountry.com" },
  "cathy olson": { file: "/2026-headshots/portraits/cathy-olson-2.jpg", source: "airtable", airtableBytes: 962208 },
  "cherrial odell": { file: "/2026-headshots/portraits/cherrial-odell-2.jpg", source: "airtable", airtableBytes: 0 }, // owner-supplied photo, full frame (no cut-out) per owner Sept 21 late
  "clark cummings": { file: "/2026-headshots/portraits/clark-cummings-2.jpg", source: "airtable", airtableBytes: 570136 },
  "dan burkhead": { file: "/2026-headshots/portraits/dan-burkhead-2.jpg", source: "airtable", airtableBytes: 234293 },
  "daniel gillison": { file: "/2026-headshots/portraits/daniel-gillison.jpg", source: "airtable", airtableBytes: 508513 },
  "darryl mcdaniels": { file: "/2026-headshots/portraits/darryl-mcdaniels-2.jpg", source: "commons", credit: "Luigi Novi, 2014, CC BY 3.0, https://commons.wikimedia.org/wiki/File:10.12.14DarrylMcDanielsByLuigiNovi1.jpg" },
  "david eagleman": { file: "/2026-headshots/portraits/david-eagleman.jpg", source: "airtable", airtableBytes: 626569 },
  "ellie kanner": { file: "/2026-headshots/portraits/ellie-kanner-2.jpg", source: "airtable", airtableBytes: 0 }, // ICF card had a smeared edge; recut from Airtable (Sept 21 late)
  "erik blamoville": { file: "/2026-headshots/portraits/erik-blamoville.jpg", source: "airtable", airtableBytes: 406048 },
  "hal fisher": { file: "/2026-headshots/portraits/hal-fisher-2.jpg", source: "airtable", airtableBytes: 501586 },
  "harvey stern": { file: "/2026-headshots/portraits/harvey-stern-2.jpg", source: "airtable", airtableBytes: 480551 },
  "isabella wolfington": { file: "/2026-headshots/portraits/isabella-wolfington.jpg", source: "airtable", airtableBytes: 729696 },
  "jan thwaites": { file: "/2026-headshots/portraits/jan-thwaites-2.jpg", source: "airtable", airtableBytes: 116788 },
  "janet wozniak": { file: "/2026-headshots/portraits/janet-wozniak.jpg", source: "mobile" },
  "jason kennedy": { file: "/2026-headshots/portraits/jason-kennedy-2.jpg", source: "icf-card" },
  "jeff levin": { file: "/2026-headshots/portraits/jeff-levin.jpg", source: "airtable", airtableBytes: 1141135 },
  "jen smorgon": { file: "/2026-headshots/portraits/jen-smorgon.jpg", source: "icf-card" },
  "jessica edwards": { file: "/2026-headshots/portraits/jessica-edwards-3.jpg", source: "airtable", airtableBytes: 2107370 },
  "jewel": { file: "/2026-headshots/portraits/jewel-2.jpg", source: "web", credit: "Official Shore Fire Media press photo, 2025. Photo credit: Lindsey Appolis (press-kit image; keep the credit)" },
  "jon hershfield": { file: "/2026-headshots/portraits/jon-hershfield-2.jpg", source: "airtable", airtableBytes: 0 }, // recut from Airtable, smeared band removed (Sept 21 late)
  "josh wolf": { file: "/2026-headshots/portraits/josh-wolf-3.jpg", source: "web", credit: "Jimmy Kimmel's Comedy Club residency page press photo (2023); the only sharp, centered, eyes-visible photo of him; he wears his cap in every current photo" },
  "kevin hines": { file: "/2026-headshots/portraits/kevin-hines.jpg", source: "airtable", airtableBytes: 49041 },
  "leah smith": { file: "/2026-headshots/portraits/leah-smith-2.jpg", source: "site-2026" },
  "lexi hensler": { file: "/2026-headshots/portraits/lexi-hensler-4.jpg", source: "airtable", airtableBytes: 1367302 },
  "loni love": { file: "/2026-headshots/portraits/loni-love-2.jpg", source: "icf-card" },
  "marc brackett": { file: "/2026-headshots/portraits/marc-brackett-2.jpg", source: "icf-card" },
  "margaret hines": { file: "/2026-headshots/portraits/margaret-hines.jpg", source: "airtable", airtableBytes: 60135 },
  "melinda springer": { file: "/2026-headshots/portraits/melinda-springer.jpg", source: "airtable", airtableBytes: 35507 },
  "michael townsend": { file: "/2026-headshots/portraits/michael-townsend.jpg", source: "airtable", airtableBytes: 30596 },
  "mike bryan": { file: "/2026-headshots/portraits/mike-bryan-2.jpg", source: "airtable", airtableBytes: 24030 },
  "mike majlak": { file: "/2026-headshots/portraits/mike-majlak-3.jpg", source: "airtable", airtableBytes: 217678 },
  "mike tyson": { file: "/2026-headshots/portraits/mike-tyson-3.jpg", source: "icf-card" },
  "miriam isa": { file: "/2026-headshots/portraits/miriam-isa.jpg", source: "airtable", airtableBytes: 40984 },
  "morgan marler": { file: "/2026-headshots/portraits/morgan-marler.jpg", source: "airtable", airtableBytes: 16430 },
  "nick dana": { file: "/2026-headshots/portraits/nick-dana-2.jpg", source: "airtable", airtableBytes: 15669 },
  "nick kislinger": { file: "/2026-headshots/portraits/nick-kislinger.jpg", source: "icf-card" },
  "noah springer": { file: "/2026-headshots/portraits/noah-springer.jpg", source: "airtable", airtableBytes: 160737 },
  "paige neuenschwander": { file: "/2026-headshots/portraits/paige-neuenschwander.jpg", source: "airtable", airtableBytes: 216817 },
  "paul dalio": { file: "/2026-headshots/portraits/paul-dalio-2.jpg", source: "icf-card" },
  "rachel platten": { file: "/2026-headshots/portraits/rachel-platten.jpg", source: "site-2026" },
  "rahil briggs": { file: "/2026-headshots/portraits/rahil-briggs-2.jpg", source: "airtable", airtableBytes: 688686 },
  "ray lewis": { file: "/2026-headshots/portraits/ray-lewis-2.jpg", source: "web", credit: "Official speaker promo photo, Washington Speakers Bureau (wsb.com/speakers/ray-lewis); courtesy image (owner asked for a better photo, Sept 21 late)" },
  "ryan wolfington": { file: "/2026-headshots/portraits/ryan-wolfington-3.jpg", source: "icf-card", credit: "ICF Summit page headshot photo (500px original); owner (Sept 21) rejected the shoulder cut-out" },
  "sally dewhurst": { file: "/2026-headshots/portraits/sally-dewhurst-2.jpg", source: "airtable", airtableBytes: 464971 },
  "sarah gilman": { file: "/2026-headshots/portraits/sarah-gilman-2.jpg", source: "icf-card" },
  "sean wolfington": { file: "/2026-headshots/portraits/sean-wolfington-2.jpg", source: "airtable", airtableBytes: 16970 },
  "silas luke jones": { file: "/2026-headshots/portraits/silas-luke-jones-2.jpg", source: "web", credit: "Homer News, July 2023 (same photo as his Airtable headshot)" },
  "sophie novak": { file: "/2026-headshots/portraits/sophie-novak-2.jpg", source: "airtable", airtableBytes: 452749 },
  "steve wozniak": { file: "/2026-headshots/portraits/steve-wozniak-2.jpg", source: "airtable", airtableBytes: 273110 },
  "taylor perry": { file: "/2026-headshots/portraits/taylor-perry.jpg", source: "airtable", airtableBytes: 65044 },
  "trent alenik": { file: "/2026-headshots/portraits/trent-alenik-2.jpg", source: "airtable", airtableBytes: 0 },
  "trevor short": { file: "/2026-headshots/portraits/trevor-short-3.jpg", source: "airtable", airtableBytes: 0 },
  "wendy oliver pyatt": { file: "/2026-headshots/portraits/wendy-oliver-pyatt-2.jpg", source: "icf-card" },
  "jay mcgraw": { file: "/2026-headshots/portraits/jay-erica-mcgraw.jpg", source: "airtable", airtableBytes: 78227 }, // Sept 28: couple composite (Jay left, Erica right) from both Airtable headshots
  "erica mcgraw": { file: "/2026-headshots/portraits/jay-erica-mcgraw.jpg", source: "airtable", airtableBytes: 247361 },
  // Sept 28, 2026: Airtable re-read; new/re-uploaded headshots cropped to the card format (work/new-headshots-20260928/).
  "harry hudson": { file: "/2026-headshots/portraits/harry-hudson.jpg", source: "airtable", airtableBytes: 113310 },
  "karena dawn": { file: "/2026-headshots/portraits/karena-dawn-2.jpg", source: "airtable", airtableBytes: 10726132 },
  "forest blakk": { file: "/2026-headshots/portraits/forest-blakk.jpg", source: "airtable", airtableBytes: 301322 },
  "raquelle stevens": { file: "/2026-headshots/portraits/raquelle-stevens.jpg", source: "airtable", airtableBytes: 238753 },
  "gavin magnus": { file: "/2026-headshots/portraits/gavin-magnus.jpg", source: "airtable", airtableBytes: 25987 },
  "clayton alenik": { file: "/2026-headshots/portraits/clayton-alenik.jpg", source: "airtable", airtableBytes: 1346880 },
  "beth kojima": { file: "/2026-headshots/portraits/beth-kojima-2.jpg", source: "airtable", airtableBytes: 26074 },
  "jennifer donnelly": { file: "/2026-headshots/portraits/jennifer-donnelly-2.jpg", source: "airtable", airtableBytes: 241439 },
  "jeneva bell": { file: "/2026-headshots/portraits/jeneva-bell.jpg", source: "airtable", airtableBytes: 201591 },
  // Oct 3 Airtable re-read: new and replaced Airtable headshots (work/new-headshots-20261003/manifest.json).
  "king trot": { file: "/2026-headshots/portraits/king-trot.jpg", source: "airtable", airtableBytes: 594979 },
  // Oct 4 (owner): Logan Paul (his Airtable headshot, a tight portrait) and Aloe Blacc (no Airtable photo yet).
  "logan paul": { file: "/2026-headshots/portraits/logan-paul.jpg", source: "airtable", airtableBytes: 335560 },
  "aloe blacc": { file: "/2026-headshots/portraits/aloe-blacc.jpg", source: "commons", credit: "Web Summit Rio, Corporate Innovation Summit, Rio de Janeiro, April 28, 2025, CC BY 2.0 (cropped), https://commons.wikimedia.org/wiki/File:Aloe_Blacc_Corporate_Innovation_Summit_event_Rio_de_Janeiro_Riocentro_Web_Summit_Rio_20258310_(54483438773).jpg", attribution: { label: "Web Summit Rio, CC BY 2.0 (cropped)", href: "https://commons.wikimedia.org/wiki/File:Aloe_Blacc_Corporate_Innovation_Summit_event_Rio_de_Janeiro_Riocentro_Web_Summit_Rio_20258310_(54483438773).jpg" } },
  "mario martinez": { file: "/2026-headshots/portraits/mario-martinez.jpg", source: "airtable", airtableBytes: 217762 },
  "mike posner": { file: "/2026-headshots/portraits/mike-posner.jpg", source: "airtable", airtableBytes: 217258 },
  "casey caruso": { file: "/2026-headshots/portraits/casey-caruso.jpg", source: "airtable", airtableBytes: 3053415 },
  "payton mcdonald": { file: "/2026-headshots/portraits/payton-mcdonald.jpg", source: "airtable", airtableBytes: 128242 },
  "seth porter winterton": { file: "/2026-headshots/portraits/seth-porter-winterton.jpg", source: "airtable", airtableBytes: 1242914 },
  "nick ekern": { file: "/2026-headshots/portraits/nick-ekern.jpg", source: "airtable", airtableBytes: 1973840 },
  "ricky sypert": { file: "/2026-headshots/portraits/ricky-sypert.jpg", source: "airtable", airtableBytes: 384139 },
  "deb cullen": { file: "/2026-headshots/portraits/deb-cullen.jpg", source: "airtable", airtableBytes: 324267 },
  "max novak": { file: "/2026-headshots/portraits/max-novak.jpg", source: "airtable", airtableBytes: 657099 },
  "nicole kalhorn": { file: "/2026-headshots/portraits/nicole-kalhorn.jpg", source: "airtable", airtableBytes: 134401 },
  "jp saxe": { file: "/2026-headshots/portraits/jp-saxe.jpg", source: "airtable", airtableBytes: 574606 },
  "atz kilcher": { file: "/2026-headshots/portraits/atz-kilcher.jpg", source: "airtable", airtableBytes: 536096 },
  "jennifer karson-strauss": { file: "/2026-headshots/portraits/jennifer-karson-strauss-2.jpg", source: "airtable", airtableBytes: 209410 },
  "alex banayan": { file: "/2026-headshots/portraits/alex-banayan.jpg", source: "airtable", airtableBytes: 93719 },
  "rohan thakkar": { file: "/2026-headshots/portraits/rohan-thakkar.jpg", source: "airtable", airtableBytes: 50626 },
  "alyson niemann": { file: "/2026-headshots/portraits/alyson-niemann.jpg", source: "airtable", airtableBytes: 686239 },
  "ann morris": { file: "/2026-headshots/portraits/ann-morris.jpg", source: "airtable", airtableBytes: 158461 },
  "christopher moore": { file: "/2026-headshots/portraits/christopher-moore.jpg", source: "airtable", airtableBytes: 308174 },
  "lia shelesh": { file: "/2026-headshots/portraits/lia-shelesh.jpg", source: "airtable", airtableBytes: 270581 },
  "ben maxwell": { file: "/2026-headshots/portraits/ben-maxwell.jpg", source: "airtable", airtableBytes: 121086 },
};

// No photo passed the checks yet (the owner is asked for one); these people are listed by name only.
function personNameKey(name: string): string {
  return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/\b(dr|md|phd|mft|lmft|faed|ceds|jr|iii|dmc)\b\.?/g, "")
    .replace(/&/g, " and ").replace(/[^a-z0-9]+/g, " ").trim();
}

// Owner (Sept 21, late): everyone listed shows a photo when any certain-identity photo exists. Jen Whalen and
// Mario Martinez have no photo anywhere (Airtable or public) and no page establishes which person they are.
export const noApprovedPortrait2026 = new Set<string>([].map(personNameKey));

// The visible credit for a freely licensed portrait, only while that portrait is the photo being shown.
export function portraitAttribution2026(name: string, image: string | undefined): { label: string; href: string } | null {
  const override = portraitOverrides2026[personNameKey(name)];
  return override?.attribution && override.file === image ? override.attribution : null;
}

export function portrait2026(name: string): string | null | undefined {
  const key = personNameKey(name);
  if (noApprovedPortrait2026.has(key)) return null;
  return portraitOverrides2026[key]?.file;
}

// Owner (Sept 21, late): anyone without a photo is left off the site for now, and Hal Fisher is left off
// until a proper headshot is supplied. Their Airtable records are untouched; they return when this changes.
export const hiddenFromSite2026 = new Set(["hal fisher"].map(personNameKey));
// Owner (Sept 22): Jay & Erica McGraw are credited as founders now, before a photo exists (name card).
export const listedWithoutPhoto2026 = new Set<string>(); // Sept 28: the McGraws now have Airtable photos (couple composite)
export function hiddenUntilPhoto2026(name: string, image: string | undefined): boolean {
  const key = personNameKey(name);
  return hiddenFromSite2026.has(key) || (!image && !listedWithoutPhoto2026.has(key));
}
