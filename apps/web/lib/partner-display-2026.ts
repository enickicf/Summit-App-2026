import { partnerLogoKey } from "./partner-logos-2026";

// Display rules for the 2026 Partners page (Oct 7, 2026 Airtable re-read). The recorded and live Airtable rows
// stay exactly as Airtable has them; these rules only decide which cards the page shows:
// - "ICF Items/Cold Creek Plunges" is an internal label for the foundation's own items, not a brand: never a card.
// - "By Dzign Ceiling Equipment" and "By Dzign (All Decor)" are two records for the same Las Vegas event-design
//   vendor (by-dzign.com): one card named "By Dzign".
// - A brand recorded in two groups gets one card: the first one a visitor reaches in page order (groups as the
//   page lists them, Airtable order within a group), so Hugz ("Partner" + "Vendors") stays in the Partners group
//   where it is today even though Airtable's grid lists its Vendors row first.
const internalLabels = new Set(["icf items cold creek plunges"]);

// Airtable's "Partner" (singular) joins the Partners group; "Curriculum Partner" follows it.
export const partnerGroupOf = (partner: { group: string }): string => !partner.group || partner.group === "Partner" ? "Partners" : partner.group;
export const partnerGroupOrder = ["Sponsors", "Partners", "Curriculum Partner", "Vendors", "Gifting Suite"];
const groupRank = (group: string) => partnerGroupOrder.indexOf(group) + 1 || 99;

export function isInternalPartnerLabel(name: string): boolean {
  return internalLabels.has(partnerLogoKey(name));
}

export function partnerDisplayName(name: string): string {
  const trimmed = name.trim();
  return /^by dzign\b/i.test(trimmed) ? "By Dzign" : trimmed;
}

/**
 * Hides internal labels, merges same-vendor records and keeps one card per brand (its first card in page order).
 * Returns the kept rows in their Airtable order; the page groups and orders them as before.
 */
export function displayPartners<T extends { name: string; group: string }>(partners: readonly T[]): T[] {
  const inPageOrder = partners.map((partner, index) => ({ partner, index }))
    .sort((a, b) => groupRank(partnerGroupOf(a.partner)) - groupRank(partnerGroupOf(b.partner)) || a.index - b.index);
  const seen = new Set<string>();
  const kept = new Map<number, T>();
  for (const { partner, index } of inPageOrder) {
    if (isInternalPartnerLabel(partner.name)) continue;
    const name = partnerDisplayName(partner.name);
    const key = partnerLogoKey(name);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    kept.set(index, name === partner.name ? partner : { ...partner, name });
  }
  return partners.flatMap((_, index) => { const card = kept.get(index); return card ? [card] : []; });
}
