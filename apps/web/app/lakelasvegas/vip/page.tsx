import type { Metadata } from "next";
import { publishedAwardsProgram } from "@not-alone/domain";
import { AwardsYearPage } from "../../../components/awards-year-page";
import { partnerSiteByKey } from "../../../lib/awards-partner-sites";
import { getSiteSnapshot } from "../../../lib/snapshot";

// Owner (Oct 4, 2026): private Lake Las Vegas VIP copy of the Awards site; only the RSVP destination differs.
const site = partnerSiteByKey("lakelasvegas-vip")!;
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Not Alone Awards 2026", robots: { index: false, follow: false } };
export default async function PartnerAwardsPage() {
  const snapshot = await getSiteSnapshot();
  return <AwardsYearPage year={2026} snapshot={snapshot} program={snapshot ? publishedAwardsProgram(snapshot) : null} rsvpUrl={site.rsvpUrl} />;
}
