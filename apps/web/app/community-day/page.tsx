import type { Metadata } from "next";
import { communityDay2026 as day } from "../../lib/community-day-2026";
import { CommunityDayView } from "./community-day-view";

export const metadata: Metadata = {
  title: "Nevada Mental Health Day – Community Day",
  // "Nevada Mental Health Day: Monday, November 2, 2026, 12:00–6:30 PM at Wynn Las Vegas. A free day at the Not Alone
  // Summit dedicated to ..." (the statement's own opening "Nevada Mental Health Day is a" would repeat the name).
  description: `${day.title}: ${day.date}, ${day.time} at ${day.venue}. ${day.about.replace(/^Nevada Mental Health Day is a/, "A")}`
};
// Checks the clock on every request: from Nov 6, 2026 the ticket request leaves the page and the hero reads
// "2027 — To Be Announced Soon.", like the other 2026 heroes (lib/event-phase.ts).
export const dynamic = "force-dynamic";

export default function CommunityDayPage() { return <CommunityDayView />; }
