// Owner (Sept 21, 2026): every 2026 partner shows its logo. Official logos collected from each brand's
// own site (or Wikimedia Commons), transparent background, stored in public/2026-partners/.
// Sources are recorded in work/partner-logos-20260921/manifest-*.json. A partner with no logo here keeps
// its name card, so new Airtable partners still appear before a logo is added.
const partnerLogoFiles: Record<string, string> = {
  "nami": "/2026-partners/nami.png",
  "slow north": "/2026-partners/slow-north.png",
  "moonbrew": "/2026-partners/moonbrew.png",
  "mantraband": "/2026-partners/mantraband.png",
  "lovetuner": "/2026-partners/lovetuner.png",
  "alice mushrooms": "/2026-partners/alice-mushrooms.png",
  "happy": "/2026-partners/happy.png",
  "just ice tea": "/2026-partners/just-ice-tea.png",
  "smartsweets": "/2026-partners/smartsweets.png",
  "ginger people": "/2026-partners/ginger-people.png",
  "drink hiyo": "/2026-partners/drink-hiyo.png",
  "prepare your mind": "/2026-partners/prepare-your-mind.png",
  "that s it": "/2026-partners/that-s-it.png",
  "realsy": "/2026-partners/realsy.png",
  "dripdrop": "/2026-partners/dripdrop.png",
  "nixie": "/2026-partners/nixie.png",
  "onsen": "/2026-partners/onsen.png",
  "dry water": "/2026-partners/dry-water.png",
  "cauli puffs": "/2026-partners/cauli-puffs.png",
  "g2g bar": "/2026-partners/g2g-bar.png",
  "drink waay": "/2026-partners/drink-waay.png",
  "gray matter": "/2026-partners/gray-matter.png",
  "voluspa": "/2026-partners/voluspa.png",
  "blue q": "/2026-partners/blue-q.png",
  "lamy": "/2026-partners/lamy.png",
  "rishi tea": "/2026-partners/rishi-tea.png",
  "sena rituals": "/2026-partners/sena-rituals.png",
  "pure parima": "/2026-partners/pure-parima.png",
  "sunsweet": "/2026-partners/sunsweet.png",
  "yes bar": "/2026-partners/yes-bar.png",
  "smartwool": "/2026-partners/smartwool.png",
  "pranarom": "/2026-partners/pranarom.png",
  "andar": "/2026-partners/andar.png",
  "go mouthwash": "/2026-partners/go-mouthwash.png",
  "drink update": "/2026-partners/drink-update.png",
  "sleep or die": "/2026-partners/sleep-or-die.png",
  "may lindstrom skin": "/2026-partners/may-lindstrom-skin.png",
  "nextsense": "/2026-partners/nextsense.png",
  "shiftwave": "/2026-partners/shiftwave.png",
  "somadome": "/2026-partners/somadome.png",
  "hugz": "/2026-partners/hugz.png",
  "body balance system": "/2026-partners/body-balance-system.png",
  "pet partners": "/2026-partners/pet-partners.png",
  // Pilates by Yvette = Y B Fit Pilates (Yvette Baker, Las Vegas; ybfitlv.com), the studio's own logo.
  "pilates by yvette": "/2026-partners/pilates-by-yvette.png",
  "radio rental": "/2026-partners/radio-rental.png",
  "tabl eau filtered water": "/2026-partners/tabl-eau-filtered-water.png",
  "woojer": "/2026-partners/woojer.png",
  "hyperice": "/2026-partners/hyperice.png",
  "fanatics": "/2026-partners/fanatics.png",
  // Oct 3: Airtable renamed the record "Fanatics Foundation"; same logo.
  "fanatics foundation": "/2026-partners/fanatics.png",
  // Oct 3 Airtable re-read: new confirmed partners (sources in work/partner-logos-20261003/manifest.json).
  "resonance foundation": "/2026-partners/resonance-foundation.png",
  // Oct 7: the owner calls it (and its logo reads) Resonance Philanthropies; either Airtable name finds the logo.
  "resonance philanthropies": "/2026-partners/resonance-foundation.png",
  "bryan brothers foundation": "/2026-partners/bryan-bros-foundation.png", // Oct 12: from bryanbros.com/foundation (background made transparent) until Nick's files arrive
  "wise friend": "/2026-partners/wise-friend-wordmark.png", // owner, Oct 5: the mark with the name "Wise Friend" under it (their symbol alone reads as nothing)
  "big league wiffleball": "/2026-partners/big-league-wiffleball.png",
  "atlys": "/2026-partners/atlys.png",
  "paul dalio s book": "/2026-partners/paul-dalio-s-book.png",
  "sugarbearpro": "/2026-partners/sugarbearpro.png",
  // Oct 7 Airtable re-read: new confirmed partners (sources, licence basis and processing notes in
  // work/partner-logos-20261007/manifest.json; official files from each brand's own site, white-only
  // wordmarks recoloured dark for this light page as on Oct 3).
  "tubby todd": "/2026-partners/tubby-todd.png",
  "tost": "/2026-partners/tost.png", // Airtable "TÖST": the key drops the diaeresis
  "nomad sauna": "/2026-partners/nomad-sauna.png",
  "tape art": "/2026-partners/tape-art.png",
  "pickleroll": "/2026-partners/pickleroll.png",
  // Airtable's "Moon Valley Plants" is Moon Valley Nurseries (the Las Vegas nursery); the logo reads Moon Valley Nurseries.
  "moon valley plants": "/2026-partners/moon-valley-nurseries.png",
  "moon valley nurseries": "/2026-partners/moon-valley-nurseries.png",
  // One card for the two By Dzign records; lib/partner-display-2026.ts names it "By Dzign".
  "by dzign": "/2026-partners/by-dzign.png",
  "villa bibbiani": "/2026-partners/villa-bibbiani.png"
};

export function partnerLogoKey(name: string): string {
  return name.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, " ").trim();
}

export function partnerLogo2026(name: string): string | undefined {
  return partnerLogoFiles[partnerLogoKey(name)];
}
