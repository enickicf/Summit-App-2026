import { awards2026Editorial } from "./awards-editorial";

// Owner (Oct 4, 2026): private copies of the Awards site for NAMI and Lake Las Vegas guests ("websites within
// the websites"). Each is the Awards page with its RSVP buttons pointed at that group's own RSVP form, so the
// team can send a different address to each group. They are never linked from the public pages, are not in the
// sitemap and ask search engines not to list them.
export type AwardsPartnerSite = { key: string; path: string; label: string; rsvpUrl: string };
const form = (slug: string) => `${awards2026Editorial.rsvpUrl}/${slug}`;
export const awardsPartnerSites: AwardsPartnerSite[] = [
  { key: "nami", path: "/nami", label: "NAMI", rsvpUrl: form("nami-9wvfjfkt40dd") },
  { key: "nami-vip", path: "/nami/vip", label: "NAMI VIP", rsvpUrl: form("nami-vip-zton04cqu1") },
  { key: "lakelasvegas", path: "/lakelasvegas", label: "Lake Las Vegas", rsvpUrl: form("lake-las-vegas-3u3hr0lqil") },
  { key: "lakelasvegas-vip", path: "/lakelasvegas/vip", label: "Lake Las Vegas VIP", rsvpUrl: form("lake-las-vegas-vip-vh8gglzs5l") }
];
export const partnerSiteByPath = (pathname: string) => awardsPartnerSites.find(site => site.path === pathname.replace(/\/$/, "")) ?? null;
export const partnerSiteByKey = (key: string | null | undefined) => awardsPartnerSites.find(site => site.key === key) ?? null;
// Each partner copy has its own Community Day page at <path>/community-day.
export const partnerCommunityDayPath = (site: AwardsPartnerSite) => `${site.path}/community-day`;
export const partnerSiteByCommunityDayPath = (pathname: string) => awardsPartnerSites.find(site => partnerCommunityDayPath(site) === pathname.replace(/\/$/, "")) ?? null;
