import type { Metadata } from "next";
import { publishedAwardsProgram } from "@not-alone/domain";
import { AwardsYearPage } from "../../components/awards-year-page";
import { partnerSiteByKey } from "../../lib/awards-partner-sites";
import { getSiteSnapshot } from "../../lib/snapshot";

// Dedicated invitation website; existing /vip links keep their original destination.
const site = partnerSiteByKey("vip-invitation")!;
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "VIP Invitation · Not Alone Awards 2026", robots: { index: false, follow: false } };
export default async function PartnerAwardsPage() {
  const snapshot = await getSiteSnapshot();
  return <AwardsYearPage year={2026} snapshot={snapshot} program={snapshot ? publishedAwardsProgram(snapshot) : null} rsvpUrl={site.rsvpUrl} invitationTier={site.invitationTier} />;
}
