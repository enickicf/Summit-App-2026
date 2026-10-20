// Owner (Oct 5, 2026): one partner credit for every 2026 page (Summit, Awards and its partner copies, Community
// Day). The Steven & Alexandra Cohen Foundation is "Powered by"; the Inspiring Children Foundation and NAMI
// present the events together (one box, "Presented by", joined by a plus sign); Wynn Las Vegas is the host venue in
// its own box. Nowhere may NAMI be called a "community partner".
export type PartnerLogo = { light: string; dark: string; width: number; height: number };
export type EventPartner = { name: string; shortName: string; logo: PartnerLogo };

export const cohenFoundation: EventPartner = {
  name: "Steven & Alexandra Cohen Foundation", shortName: "Cohen Foundation",
  logo: { light: "/images/cohen-foundation-give.png", dark: "/images/cohen-foundation-give-white.png", width: 730, height: 366 }
};
export const inspiringChildren: EventPartner = {
  name: "Inspiring Children Foundation", shortName: "Inspiring Children",
  logo: { light: "/images/icf-logo.webp", dark: "/images/icf-logo-white.png", width: 1500, height: 1136 }
};
export const nami: EventPartner = {
  name: "NAMI, National Alliance on Mental Illness", shortName: "NAMI",
  logo: { light: "/2026-partners/nami.png", dark: "/2026-partners/nami-white.png", width: 1851, height: 712 }
};
// The Wynn mark is dark type on a transparent background; the dark variant shows it inverted (CSS).
export const wynnLasVegas: EventPartner = {
  name: "Wynn Las Vegas", shortName: "Wynn",
  logo: { light: "/images/wynn-las-vegas-logo.png", dark: "/images/wynn-las-vegas-logo.png", width: 525, height: 236 }
};

export const eventPartners2026 = {
  poweredBy: cohenFoundation,
  presentedBy: [inspiringChildren, nami] as const,
  hostVenue: wynnLasVegas
} as const;

// Owner (Oct 5 / Oct 7): the top of every Awards page shows doors and the show time. Owner (Oct 7 meeting): publicly
// the evening is Doors Open 6:30 PM and the Awards Show 7:30 PM (the show runs 7:30–10:00 PM); no Pre-Show is announced.
export const awardsDoorsOpen2026 = "6:30 PM";
export const awardsShowStart2026 = "7:30 PM";
