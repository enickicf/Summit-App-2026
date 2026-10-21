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
  // Oct 20, 2026: Airtable headshots of confirmed people who had none on the site (Airtable Talent re-read; face-centred crops).
  "abraham kaoud": { file: "/2026-headshots/portraits/abraham-kaoud.jpg", source: "airtable" }, // Oct 21: his Airtable headshot (1205x1306), face-centred
  // Oct 21, 2026 (owner: "get online and ... figure out who they are their bios and headshots"; the guests agreed by email):
  // photos from each person's own organization / press page, face-centred. Christina Steil = Sarah Steil's mother
  // (Airtable occupation), Jill Hawley = Colorado youth-outcomes leader (sent by Nick Kislinger, who works on Colorado's
  // mental health field); Zak Levitt and Jayson Ainsworth are the best public match for the Airtable details (owner to confirm).
  "christina steil": { file: "/2026-headshots/portraits/christina-steil.jpg", source: "web", credit: "Hinsdale Magazine Group, https://hinsdalemag.com/dr-christina-steil/" },
  "jill hawley": { file: "/2026-headshots/portraits/jill-hawley.jpg", source: "web", credit: "Gary Community Ventures team page, https://garycommunity.org/team/jill-hawley/" },
  "zak levitt": { file: "/2026-headshots/portraits/zak-levitt.jpg", source: "web", credit: "Ballen Studios press release via Podnews, https://podnews.net/press-release/ballen-zak-levitt" },
  "jayson ainsworth": { file: "/2026-headshots/portraits/jayson-ainsworth.jpg", source: "web", credit: "Momentum Recovery employee spotlight, https://www.momentumrecovery.com/blog/employee-spotlight-jayson-ainsworth" },
  "alex accetta": { file: "/2026-headshots/portraits/alex-accetta.jpg", source: "airtable" },
  "basak kizilisik": { file: "/2026-headshots/portraits/basak-kizilisik-2.jpg", source: "web" }, // Oct 20: sharper copy of their photo from their own organization / press page (hires agent)
  "blake bonner": { file: "/2026-headshots/portraits/blake-bonner.jpg", source: "airtable" },
  "blu eyes": { file: "/2026-headshots/portraits/blu-eyes.jpg", source: "airtable" },
  "brian hill": { file: "/2026-headshots/portraits/brian-hill.jpg", source: "airtable" },
  "caitlin bonner": { file: "/2026-headshots/portraits/caitlin-bonner.jpg", source: "airtable" },
  "corey j nigro": { file: "/2026-headshots/portraits/dr-corey-j-nigro.jpg", source: "airtable" },
  "shashita inamdar": { file: "/2026-headshots/portraits/dr-shashita-inamdar-2.jpg", source: "web" }, // Oct 20: sharper copy of their photo from their own organization / press page (hires agent)
  "franco pascali": { file: "/2026-headshots/portraits/franco-pascali.jpg", source: "airtable" },
  "geoff ralston": { file: "/2026-headshots/portraits/geoff-ralston-2.jpg", source: "commons", credit: "Gdr2023, GeoffHeadshot.jpg, CC BY-SA 4.0 (cropped), https://commons.wikimedia.org/wiki/File:GeoffHeadshot.jpg", attribution: { label: "Gdr2023 / Wikimedia Commons, CC BY-SA 4.0 (cropped)", href: "https://commons.wikimedia.org/wiki/File:GeoffHeadshot.jpg" } },
  // Oct 20: Julie Scelfo's own press headshot (juliescelfo.com/contact, photo Kevin Abosch); not in Airtable yet.
  "julie scelfo": { file: "/2026-headshots/portraits/julie-scelfo.jpg", source: "web", credit: "Kevin Abosch, press headshot from https://juliescelfo.com/contact/" },
  "heather engellis": { file: "/2026-headshots/portraits/heather-engellis-2.jpg", source: "web" }, // Oct 20: sharper copy of their photo from their own organization / press page (hires agent)
  "jen whalen": { file: "/2026-headshots/portraits/jen-whalen-2.jpg", source: "web" }, // Oct 20: sharper copy of their photo from their own organization / press page (hires agent)
  "julie catineau": { file: "/2026-headshots/portraits/julie-catineau.jpg", source: "airtable" },
  "laura brady": { file: "/2026-headshots/portraits/laura-brady.jpg", source: "airtable" },
  "lauren ann": { file: "/2026-headshots/portraits/lauren-ann.jpg", source: "airtable" },
  "megan haley": { file: "/2026-headshots/portraits/megan-haley.jpg", source: "airtable" },
  "miguel tyson": { file: "/2026-headshots/portraits/miguel-tyson.jpg", source: "airtable" },
  "remington rhodes": { file: "/2026-headshots/portraits/remington-rhodes.jpg", source: "airtable" },
  "robert goldstein": { file: "/2026-headshots/portraits/robert-goldstein.jpg", source: "airtable" },
  "ryan chen": { file: "/2026-headshots/portraits/ryan-chen-2.jpg", source: "web" }, // Oct 20: sharper copy of their photo from their own organization / press page (hires agent)
  "tasha rasolkhani kalhorn": { file: "/2026-headshots/portraits/tasha-rasolkhani-kalhorn-2.jpg", source: "web" }, // Oct 20: sharper copy of their photo from their own organization / press page (hires agent)
  "theresa magnus": { file: "/2026-headshots/portraits/theresa-magnus.jpg", source: "airtable" },
  "valerie sizemore": { file: "/2026-headshots/portraits/valerie-sizemore.jpg", source: "airtable" },
  // Sept 21 late additions (sources in work/new-headshots-20260921/manifest.json).
  // Owner (Sept 21, late): a photo beats a name card. Hal Fisher and Sarah Steil use their own Airtable photos
  // (small originals, enlarged) until a sharper headshot is supplied.
  "sarah steil": { file: "/2026-headshots/portraits/sarah-steil-3-c.jpg", source: "airtable", airtableBytes: 8055667 },
  "sheri sobrato": { file: "/2026-headshots/portraits/sheri-sobrato-c.jpg", source: "web", credit: "Official portrait, sobrato.com/people/sheri-sobrato (courtesy The Sobrato Organization); Airtable only holds a 32px thumbnail" },
  "bob bryan": { file: "/2026-headshots/portraits/bob-bryan-c.jpg", source: "commons", credit: "Vbrunophotog, 2025 International Tennis Hall of Fame press conference, CC BY-SA 4.0" },
  "caroline silby": { file: "/2026-headshots/portraits/caroline-silby.jpg", source: "web", credit: "drsilby.com (her official site)" },
  "sanem sam alkan": { file: "/2026-headshots/portraits/sanem-alkan.jpg", source: "web", credit: "brainmind.org event page (same photo as her Sobrato profile)" },
  "alana springsteen": { file: "/2026-headshots/portraits/alana-springsteen-2.jpg", source: "web", credit: "public press photo already used on the site (release review pending)" },
  "alexa price": { file: "/2026-headshots/portraits/alexa-price-hd-20261015.jpg", source: "web", credit: "Alexa Price professional profile, theorg.com/org/shore-fire-media/teams/public-relations" },
  "allison elbl": { file: "/2026-headshots/portraits/allison-elbl.jpg", source: "airtable", airtableBytes: 15978 },
  "ana wolfington": { file: "/2026-headshots/portraits/ana-wolfington.jpg", source: "airtable", airtableBytes: 133215 },
  "anthony ramos": { file: "/2026-headshots/portraits/anthony-ramos.jpg", source: "web", credit: "public press photo already used on the site (release review pending)" },
  "aphrah brokaw": { file: "/2026-headshots/portraits/aphrah-brokaw-2-c.jpg", source: "web", credit: "ICF Not Alone participants title card (inspiringchildren.org/notalone-participants); full photo, no cut-out (owner, Sept 21 late)" },
  "bianca mok": { file: "/2026-headshots/portraits/bianca-mok.jpg", source: "airtable", airtableBytes: 191013 },
  "bishop briggs": { file: "/2026-headshots/portraits/bishop-briggs.jpg", source: "icf-card" },
  "blaise aguirre": { file: "/2026-headshots/portraits/blaise-aguirre.jpg", source: "airtable", airtableBytes: 64007 },
  "brandon saho": { file: "/2026-headshots/portraits/brandon-saho.jpg", source: "airtable", airtableBytes: 3884561 },
  "caroline jones": { file: "/2026-headshots/portraits/caroline-jones-2-c.jpg", source: "web", credit: "Official \"Good Omen\" press headshot (Nashville Harbor Records / Big Machine, 2025), photo: Alysse Gafkjen; via tasteofcountry.com" },
  "cathy olson": { file: "/2026-headshots/portraits/cathy-olson-2-c.jpg", source: "airtable", airtableBytes: 962208 },
  "cherrial odell": { file: "/2026-headshots/portraits/cherrial-odell-20261015.jpg", source: "airtable", airtableBytes: 0 }, // owner-supplied photo, full frame (no cut-out) per owner Oct 15
  "clark cummings": { file: "/2026-headshots/portraits/clark-cummings-2-c.jpg", source: "airtable", airtableBytes: 570136 },
  "dan burkhead": { file: "/2026-headshots/portraits/dan-burkhead-2-c.jpg", source: "airtable", airtableBytes: 234293 },
  "daniel gillison": { file: "/2026-headshots/portraits/daniel-gillison.jpg", source: "airtable", airtableBytes: 508513 },
  "darryl mcdaniels": { file: "/2026-headshots/portraits/darryl-mcdaniels-2-c.jpg", source: "commons", credit: "Luigi Novi, 2014, CC BY 3.0, https://commons.wikimedia.org/wiki/File:10.12.14DarrylMcDanielsByLuigiNovi1.jpg" },
  "david eagleman": { file: "/2026-headshots/portraits/david-eagleman.jpg", source: "airtable", airtableBytes: 626569 },
  "ellie kanner": { file: "/2026-headshots/portraits/ellie-kanner-2-c.jpg", source: "airtable", airtableBytes: 0 }, // ICF card had a smeared edge; recut from Airtable (Sept 21 late)
  "erik blamoville": { file: "/2026-headshots/portraits/erik-blamoville-c.jpg", source: "airtable", airtableBytes: 406048 },
  "hal fisher": { file: "/2026-headshots/portraits/hal-fisher-2.jpg", source: "airtable", airtableBytes: 501586 },
  "harvey stern": { file: "/2026-headshots/portraits/harvey-stern-2-c.jpg", source: "airtable", airtableBytes: 480551 },
  "isabella wolfington": { file: "/2026-headshots/portraits/isabella-wolfington.jpg", source: "airtable", airtableBytes: 729696 },
  "jan thwaites": { file: "/2026-headshots/portraits/jan-thwaites-2.jpg", source: "airtable", airtableBytes: 116788 },
  // Oct 19 (Aphrah via owner): Janet's Founder card shows Janet alone, not the Janet & Steve couple photo. The only
  // photo of her on file is that couple portrait (948x900), so her face is cut out of it, centered, without Steve.
  // Oct 20 (owner: "recrop Janet Wozniak's headshot ... better"): no solo photo of her may be used online (only Getty stock), so
  // she is re-cut from ICF's full-resolution original of the couple portrait (712 px, sharper than the 948 px upscale used
  // before), more of her face and hair in frame, and the sliver of Steve's beard beside her jaw filled with the photo's own dark tone.
  "janet wozniak": { file: "/2026-headshots/portraits/janet-wozniak-3.jpg", source: "mobile", credit: "Janet alone, re-cut from ICF's Janet & Steve Wozniak portrait at full resolution; Oct 20" },
  "jason kennedy": { file: "/2026-headshots/portraits/jason-kennedy-2.jpg", source: "icf-card" },
  "jeff levin": { file: "/2026-headshots/portraits/jeff-levin.jpg", source: "airtable", airtableBytes: 1141135 },
  "jen smorgon": { file: "/2026-headshots/portraits/jen-smorgon.jpg", source: "icf-card" },
  "jessica edwards": { file: "/2026-headshots/portraits/jessica-edwards-3-c.jpg", source: "airtable", airtableBytes: 2107370 },
  "jewel": { file: "/2026-headshots/portraits/jewel-2-c.jpg", source: "web", credit: "Official Shore Fire Media press photo, 2025. Photo credit: Lindsey Appolis (press-kit image; keep the credit)" },
  "jon hershfield": { file: "/2026-headshots/portraits/jon-hershfield-2.jpg", source: "airtable", airtableBytes: 0 }, // recut from Airtable, smeared band removed (Sept 21 late)
  "josh wolf": { file: "/2026-headshots/portraits/josh-wolf-3-c.jpg", source: "web", credit: "Jimmy Kimmel's Comedy Club residency page press photo (2023); the only sharp, centered, eyes-visible photo of him; he wears his cap in every current photo" },
  "kevin hines": { file: "/2026-headshots/portraits/kevin-hines.jpg", source: "airtable", airtableBytes: 49041 },
  // Oct 21 (owner: "Leah Smith's photo needs to be recropped"): re-cut from the 3000x2000 original of Tape Art's "Leah and Michael" photo (Wix original behind tapeart.com/who-we-are), face-centred.
  "leah smith": { file: "/2026-headshots/portraits/leah-smith-4.jpg", source: "web", credit: "Tape Art, tapeart.com/who-we-are (Leah and Michael photograph, cropped to Leah)" },
  "lexi hensler": { file: "/2026-headshots/portraits/lexi-hensler-4-c.jpg", source: "airtable", airtableBytes: 1367302 },
  "loni love": { file: "/2026-headshots/portraits/loni-love-2.jpg", source: "icf-card" },
  "marc brackett": { file: "/2026-headshots/portraits/marc-brackett-2.jpg", source: "icf-card" },
  "margaret hines": { file: "/2026-headshots/portraits/margaret-hines.jpg", source: "airtable", airtableBytes: 60135 },
  "melinda springer": { file: "/2026-headshots/portraits/melinda-springer.jpg", source: "airtable", airtableBytes: 35507 },
  "michael townsend": { file: "/2026-headshots/portraits/michael-townsend-hd-20261015.jpg", source: "web", credit: "DC/DOX official participant portrait, dcdoxfest.com/people/michael-townsend" },
  "mike bryan": { file: "/2026-headshots/portraits/mike-bryan-2.jpg", source: "airtable", airtableBytes: 24030 },
  "mike majlak": { file: "/2026-headshots/portraits/mike-majlak-3-c.jpg", source: "airtable", airtableBytes: 217678 },
  "mike tyson": { file: "/2026-headshots/portraits/mike-tyson-3-c.jpg", source: "icf-card" },
  "miriam isa": { file: "/2026-headshots/portraits/miriam-isa-hd-20261015.jpg", source: "web", credit: "Miriam Isa official website, miriamisa.com" },
  "morgan marler": { file: "/2026-headshots/portraits/morgan-marler.jpg", source: "airtable", airtableBytes: 16430 },
  "nick dana": { file: "/2026-headshots/portraits/nick-dana-hd-20261015.jpg", source: "web", credit: "The Ocean Race official crew portrait, archive.theoceanrace.com/en/crew/408_Nick-Dana.html" },
  "nick kislinger": { file: "/2026-headshots/portraits/nick-kislinger-hd-20261015.jpg", source: "web", credit: "Kislinger Impact Collective official portrait, kislingerimpactcollective.com/about" },
  "noah springer": { file: "/2026-headshots/portraits/noah-springer.jpg", source: "airtable", airtableBytes: 160737 },
  "paige neuenschwander": { file: "/2026-headshots/portraits/paige-neuenschwander.jpg", source: "airtable", airtableBytes: 216817 },
  "paul dalio": { file: "/2026-headshots/portraits/paul-dalio-2-c.jpg", source: "icf-card" },
  "rachel platten": { file: "/2026-headshots/portraits/rachel-platten.jpg", source: "site-2026" },
  "rahil briggs": { file: "/2026-headshots/portraits/rahil-briggs-2-c.jpg", source: "airtable", airtableBytes: 688686 },
  "ray lewis": { file: "/2026-headshots/portraits/ray-lewis-3.jpg", source: "web", // Oct 7 (owner): looser cut, face a touch above center (40%) so head and shoulders show instead of a giant head
     credit: "Official speaker promo photo, Washington Speakers Bureau (wsb.com/speakers/ray-lewis); courtesy image (owner asked for a better photo, Sept 21 late)" },
  "ryan wolfington": { file: "/2026-headshots/portraits/ryan-wolfington-4.jpg", source: "airtable", credit: "Airtable headshot uploaded by Oct 7, 2026 (1169x1346; owner asked for the new one, perfectly centered)" },
  // Owner (Oct 7): two individual founder cards with the photos the owner sent in chat (743x743 and 1151x1151, both
  // Photoshop exports dated Oct 7); Airtable still holds the 182px PNG and the full-body beach photo.
  "jay mcgraw": { file: "/2026-headshots/portraits/jay-mcgraw-2.jpg", source: "owner", credit: "Headshot supplied by the owner Oct 7, 2026 (work/new-headshots-20261007/owner-upload-2.jpg), face-centered" },
  "erica mcgraw": { file: "/2026-headshots/portraits/erica-mcgraw-2.jpg", source: "owner", credit: "Headshot supplied by the owner Oct 7, 2026 (work/new-headshots-20261007/owner-upload-1.jpg), face-centered" },
  "sally dewhurst": { file: "/2026-headshots/portraits/sally-dewhurst-2.jpg", source: "airtable", airtableBytes: 464971 },
  "sarah gilman": { file: "/2026-headshots/portraits/sarah-gilman-2-c.jpg", source: "icf-card" },
  "sean wolfington": { file: "/2026-headshots/portraits/sean-wolfington-hd-20261015.jpg", source: "web", credit: "Sean Wolfington official website, seanwolfington.net" },
  "silas luke jones": { file: "/2026-headshots/portraits/silas-luke-jones-2-c.jpg", source: "web", credit: "Homer News, July 2023 (same photo as his Airtable headshot)" },
  "sophie novak": { file: "/2026-headshots/portraits/sophie-novak-2-c.jpg", source: "airtable", airtableBytes: 452749 },
  "steve wozniak": { file: "/2026-headshots/portraits/steve-wozniak-2-c.jpg", source: "airtable", airtableBytes: 273110 },
  "taylor perry": { file: "/2026-headshots/portraits/taylor-perry.jpg", source: "airtable", airtableBytes: 65044 },
  "trent alenik": { file: "/2026-headshots/portraits/trent-alenik-2-c.jpg", source: "airtable", airtableBytes: 0 },
  "trevor short": { file: "/2026-headshots/portraits/trevor-short-3-c.jpg", source: "airtable", airtableBytes: 0 },
  "wendy oliver pyatt": { file: "/2026-headshots/portraits/wendy-oliver-pyatt-2.jpg", source: "icf-card" },
  // Sept 28, 2026: Airtable re-read; new/re-uploaded headshots cropped to the card format (work/new-headshots-20260928/).
  "harry hudson": { file: "/2026-headshots/portraits/harry-hudson.jpg", source: "airtable", airtableBytes: 113310 },
  "karena dawn": { file: "/2026-headshots/portraits/karena-dawn-2-c.jpg", source: "airtable", airtableBytes: 10726132 },
  "forest blakk": { file: "/2026-headshots/portraits/forest-blakk-c.jpg", source: "airtable", airtableBytes: 301322 },
  "raquelle stevens": { file: "/2026-headshots/portraits/raquelle-stevens-c.jpg", source: "airtable", airtableBytes: 238753 },
  "gavin magnus": { file: "/2026-headshots/portraits/gavin-magnus-hd-20261015.jpg", source: "web", credit: "Gavin Magnus official Linktree portrait, linktr.ee/gavinmagnus" },
  "clayton alenik": { file: "/2026-headshots/portraits/clayton-alenik-c.jpg", source: "airtable", airtableBytes: 1346880 },
  "beth kojima": { file: "/2026-headshots/portraits/beth-kojima-2-c.jpg", source: "airtable", airtableBytes: 26074 },
  "jennifer donnelly": { file: "/2026-headshots/portraits/jennifer-donnelly-2-c.jpg", source: "airtable", airtableBytes: 241439 },
  "jeneva bell": { file: "/2026-headshots/portraits/jeneva-bell-c.jpg", source: "airtable", airtableBytes: 201591 },
  // Oct 3 Airtable re-read: new and replaced Airtable headshots (work/new-headshots-20261003/manifest.json).
  "king trot": { file: "/2026-headshots/portraits/king-trot-c.jpg", source: "airtable", airtableBytes: 594979 },
  // Oct 4 (owner): Logan Paul (his Airtable headshot, a tight portrait) and Aloe Blacc (no Airtable photo yet).
  "logan paul": { file: "/2026-headshots/portraits/logan-paul-c.jpg", source: "airtable", airtableBytes: 335560 },
  // Oct 11 (owner): Christiana and Kimbal Musk, Founders; public headshots (sources in /private/tmp/claude-501/musk-headshots/manifest.json).
  "christiana musk": { file: "/2026-headshots/portraits/christiana-musk-2.jpg", source: "web", credit: "Her portrait in a cream hat (dark gray backdrop), the lead photo of her Aug 7, 2024 TIME op-ed as shared on her own LinkedIn post (908x974 screenshot; photo area only, no resizing); owner chose this photo Oct 11" },
  // Oct 11: Dr. George Rapier III, ICF's 2025 square headshot, face-centered.
  "george rapier": { file: "/2026-headshots/portraits/george-rapier.jpg", source: "icf-card", credit: "ICF 2025 Summit founder headshot (Dr. George Rapier III headshot 2025 sq crop)" },
  // Oct 19 (Paige, Oct 12, relaying Ryan: "add Bob Pittman as a founder on the website"): no Airtable row or photo; a freely
  // licensed Wikimedia Commons photo (Interbrand 2018 Global Brands Summit, CC BY-SA 4.0), cut to a face-centered square.
  "bob pittman": { file: "/2026-headshots/portraits/bob-pittman.jpg", source: "commons", credit: "Itsthegirl, Pittman Interbrand 2018 Global Brands Summit, CC BY-SA 4.0 (cropped), https://commons.wikimedia.org/wiki/File:Pittman_Interbrand_2018_Global_Brands_Summit.jpg", attribution: { label: "Itsthegirl / Wikimedia Commons, CC BY-SA 4.0 (cropped)", href: "https://commons.wikimedia.org/wiki/File:Pittman_Interbrand_2018_Global_Brands_Summit.jpg" } },
  "kimbal musk": { file: "/2026-headshots/portraits/kimbal-musk.jpg", source: "commons", credit: "1000x2020, KIMBAL_MUSK_OFFICIAL_HEADSHOT.jpg, CC BY-SA 4.0 (cropped), https://commons.wikimedia.org/wiki/File:KIMBAL_MUSK_OFFICIAL_HEADSHOT.jpg", attribution: { label: "1000x2020 / Wikimedia Commons, CC BY-SA 4.0 (cropped)", href: "https://commons.wikimedia.org/wiki/File:KIMBAL_MUSK_OFFICIAL_HEADSHOT.jpg" } },
  // Oct 12 (owner: "you can combine bob and mike bryan"): one card, a photo of the two of them together (2025 International
  // Tennis Hall of Fame press conference, Vbrunophotog, CC BY-SA 4.0, cropped to a square).
  "bob and mike bryan": { file: "/2026-headshots/portraits/bob-mike-bryan.jpg", source: "commons", credit: "Vbrunophotog, CC BY-SA 4.0 (cropped), https://commons.wikimedia.org/wiki/File:The_Bryan_Brothers_at_the_2025_International_Tennis_Hall_of_Fame_Induction_Ceremony_Press_Conference.jpg", attribution: { label: "Vbrunophotog / Wikimedia Commons, CC BY-SA 4.0 (cropped)", href: "https://commons.wikimedia.org/wiki/File:The_Bryan_Brothers_at_the_2025_International_Tennis_Hall_of_Fame_Induction_Ceremony_Press_Conference.jpg" } },
  "aloe blacc": { file: "/2026-headshots/portraits/aloe-blacc-c.jpg", source: "commons", credit: "Web Summit Rio, Corporate Innovation Summit, Rio de Janeiro, April 28, 2025, CC BY 2.0 (cropped), https://commons.wikimedia.org/wiki/File:Aloe_Blacc_Corporate_Innovation_Summit_event_Rio_de_Janeiro_Riocentro_Web_Summit_Rio_20258310_(54483438773).jpg", attribution: { label: "Web Summit Rio, CC BY 2.0 (cropped)", href: "https://commons.wikimedia.org/wiki/File:Aloe_Blacc_Corporate_Innovation_Summit_event_Rio_de_Janeiro_Riocentro_Web_Summit_Rio_20258310_(54483438773).jpg" } },
  // Oct 12: Casey's new Airtable headshot (Mario_Martinez_Headshot.JPG, 1086x1449 as served), face-centered square.
  "mario martinez": { file: "/2026-headshots/portraits/mario-martinez-2.jpg", source: "airtable" },
  "mike posner": { file: "/2026-headshots/portraits/mike-posner-c.jpg", source: "airtable", airtableBytes: 217258 },
  "casey caruso": { file: "/2026-headshots/portraits/casey-caruso-c.jpg", source: "airtable", airtableBytes: 3053415 },
  "payton mcdonald": { file: "/2026-headshots/portraits/payton-mcdonald-c.jpg", source: "airtable", airtableBytes: 128242 },
  "seth porter winterton": { file: "/2026-headshots/portraits/seth-porter-winterton-c.jpg", source: "airtable", airtableBytes: 1242914 },
  "nick ekern": { file: "/2026-headshots/portraits/nick-ekern-c.jpg", source: "airtable", airtableBytes: 1973840 },
  "ricky sypert": { file: "/2026-headshots/portraits/ricky-sypert-c.jpg", source: "airtable", airtableBytes: 384139 },
  "deb cullen": { file: "/2026-headshots/portraits/deb-cullen-c.jpg", source: "airtable", airtableBytes: 324267 },
  "max novak": { file: "/2026-headshots/portraits/max-novak-c.jpg", source: "airtable", airtableBytes: 657099 },
  // Oct 21 (owner: "find the high resolution photo for Nicole Kalhorn"): her Princeton Athletics roster portrait (1500x2000, 2018), face-centred; no upscaling.
  "nicole kalhorn": { file: "/2026-headshots/portraits/nicole-kalhorn-2.jpg", source: "web", credit: "Princeton University Athletics roster portrait, goprincetontigers.com (2018)" },
  "jp saxe": { file: "/2026-headshots/portraits/jp-saxe-c.jpg", source: "airtable", airtableBytes: 574606 },
  "atz kilcher": { file: "/2026-headshots/portraits/atz-kilcher-c.jpg", source: "airtable", airtableBytes: 536096 },
  "jennifer karson-strauss": { file: "/2026-headshots/portraits/jennifer-karson-strauss-2-c.jpg", source: "airtable", airtableBytes: 209410 },
  "alex banayan": { file: "/2026-headshots/portraits/alex-banayan-c.jpg", source: "airtable", airtableBytes: 93719 },
  "rohan thakkar": { file: "/2026-headshots/portraits/rohan-thakkar-c.jpg", source: "airtable", airtableBytes: 50626 },
  "alyson niemann": { file: "/2026-headshots/portraits/alyson-niemann-c.jpg", source: "airtable", airtableBytes: 686239 },
  "ann morris": { file: "/2026-headshots/portraits/ann-morris-c.jpg", source: "airtable", airtableBytes: 158461 },
  "christopher moore": { file: "/2026-headshots/portraits/christopher-moore-c.jpg", source: "airtable", airtableBytes: 308174 },
  "lia shelesh": { file: "/2026-headshots/portraits/lia-shelesh-c.jpg", source: "airtable", airtableBytes: 270581 },
  "ben maxwell": { file: "/2026-headshots/portraits/ben-maxwell-c.jpg", source: "airtable", airtableBytes: 121086 },
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
// Oct 21 (owner): Hayden Harveston stays off the site; Zak Levitt and Jayson Ainsworth off "for now" (identities not
// confirmed yet; their photos, titles and bios stay ready below and return when they are removed from this set).
export const hiddenFromSite2026 = new Set(["hal fisher", "hayden harveston", "zak levitt", "jayson ainsworth"].map(personNameKey));
// Owner (Sept 22): Jay & Erica McGraw were credited as founders before a photo existed (name cards).
// Owner (Oct 7): the owner supplied a headshot of each (work/new-headshots-20261007/owner-upload-*.jpg), so both are
// photo cards now (entries above) and nobody is listed without a photo. The set stays for the next such case.
export const listedWithoutPhoto2026 = new Set<string>([]);
export function hiddenUntilPhoto2026(name: string, image: string | undefined): boolean {
  const key = personNameKey(name);
  return hiddenFromSite2026.has(key) || (!image && !listedWithoutPhoto2026.has(key));
}
