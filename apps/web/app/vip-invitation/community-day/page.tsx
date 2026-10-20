import type { Metadata } from "next";
import { CommunityDayView } from "../../../app/community-day/community-day-view";
import { partnerSiteByKey } from "../../../lib/awards-partner-sites";

// Owner (Oct 4, 2026): general Uber VIP Community Day copy; shares the combined VIP RSVP with /vip.
const site = partnerSiteByKey("vip-invitation")!;
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "VIP Invitation · Nevada Mental Health Day", robots: { index: false, follow: false } };
export default function PartnerCommunityDayPage() { return <CommunityDayView partner={site} />; }
