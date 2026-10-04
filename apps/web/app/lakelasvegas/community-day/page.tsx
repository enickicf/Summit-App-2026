import type { Metadata } from "next";
import { CommunityDayView } from "../../../app/community-day/community-day-view";
import { partnerSiteByKey } from "../../../lib/awards-partner-sites";

// Owner (Oct 4, 2026): private Lake Las Vegas copy of the Community Day page; only the RSVP destination differs.
const site = partnerSiteByKey("lakelasvegas")!;
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Community Day", robots: { index: false, follow: false } };
export default function PartnerCommunityDayPage() { return <CommunityDayView partner={site} />; }
