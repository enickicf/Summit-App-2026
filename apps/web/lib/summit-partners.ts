// Mirrors ICF's public Not Alone Summit partners page (inspiringchildren.org/summit-partners),
// as directed by the owner. Logos are ICF's published sponsor artwork; website links are the
// ones ICF links, with tracking parameters removed.
// Owner (Sept 29, 2026): Fury Co is not listed (they withdrew as a sponsor last year).
export type SummitPartner = { name: string; logo: string; website?: string };
export type SummitPartnerTier = { title: string; featured?: boolean; partners: readonly SummitPartner[] };

const logo = (file: string) => `/images/partners/${file}`;

export const summitPartnerTiers: readonly SummitPartnerTier[] = [
  { title: "Presenting Sponsor", featured: true, partners: [
    { name: "Steven & Alexandra Cohen Foundation", logo: logo("cohen-foundation.png") }
  ] },
  { title: "Premier Sponsor", featured: true, partners: [
    { name: "Wynn Resorts", logo: logo("wynn-resorts.jpg"), website: "https://www.wynnlasvegas.com/" }
  ] },
  { title: "Inaugural Sponsors", partners: [
    { name: "Hyperice", logo: logo("hyperice.jpg") },
    { name: "Project Wellbeing", logo: logo("project-wellbeing.jpg"), website: "https://www.projectwellbeing.co/" },
    { name: "Fanatics", logo: logo("fanatics.jpg") },
    { name: "Shiftwave", logo: logo("shiftwave.jpg"), website: "https://shiftwave.co/" },
    { name: "Pickleroll", logo: logo("pickleroll.png"), website: "https://pickleroll.com/" },
    { name: "McLaren", logo: logo("mclaren.jpg") },
    { name: "YB Fit", logo: logo("yb-fit.jpg"), website: "https://www.ybfitlv.com/" },
    { name: "TAO Group", logo: logo("tao.png") },
    { name: "Inspiring Dreams", logo: logo("inspiring-dreams.png") },
    { name: "Necker Cup", logo: logo("necker-cup.png") }
  ] },
  { title: "Nonprofit Sponsors", partners: [
    { name: "Wynn Foundation", logo: logo("wynn-foundation.png") },
    { name: "The Big Silence", logo: logo("the-big-silence.jpg"), website: "https://thebigsilence.com/" },
    { name: "Engelstad Foundation", logo: logo("engelstad-foundation.png") },
    { name: "Windsong Trust", logo: logo("windsong-trust.png") },
    { name: "USTA Foundation", logo: logo("usta-foundation.png") },
    { name: "Bryan Bros Foundation", logo: logo("bryan-bros-foundation.png") }
  ] }
];

export const partnerWithUsUrl = "https://www.inspiringchildren.org/summit-partners";
