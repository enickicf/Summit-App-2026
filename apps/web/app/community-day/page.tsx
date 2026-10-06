import type { Metadata } from "next";
import { communityDay2026 as day } from "../../lib/community-day-2026";
import { CommunityDayView } from "./community-day-view";

export const metadata: Metadata = {
  title: "Nevada Mental Health Day – Community Day",
  description: `${day.name}, ${day.date}, ${day.heroTime} at ${day.venue}. ${day.about}`
};
// Checks the clock on every request: from Nov 6, 2026 the ticket request leaves the page and the hero reads
// "2027 — To Be Announced Soon.", like the other 2026 heroes (lib/event-phase.ts).
export const dynamic = "force-dynamic";

export default function CommunityDayPage() { return <CommunityDayView />; }
