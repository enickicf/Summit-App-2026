import Link from "next/link";
import { communityDay2026 } from "../lib/community-day-2026";
import { partnerCommunityDayPath, type AwardsPartnerSite } from "../lib/awards-partner-sites";
import styles from "./summit-refresh.module.css";

// The Community Day page has its own menu in the Summit menu's look: Community Day, Concert (the Awards
// page) and Donate. No Summit, Schedule, Directory or Venue tab. Owner (Oct 3): all three are plain links,
// centered on one line with equal spacing (Donate matches the other two, no sticker). Owner (Oct 4): a
// "Schedule" link scrolls down to the schedule on this page. Reached from a private partner copy of the
// Awards site (/nami/community-day, ...), "Concert" leads back to that copy.
export function CommunityDayNavigation({ partner = null }: { partner?: AwardsPartnerSite | null }) {
  return <div className={`${styles.summitHeader} ${styles.communityDayHeader}`}>
    <nav className={`${styles.navigation} ${styles.communityDayNavigation}`} aria-label="Community Day navigation" id="main-navigation">
      <Link href={partner ? partnerCommunityDayPath(partner) : "/community-day"} aria-current="page">Community Day</Link>
      <a href="#schedule">Schedule</a>
      {partner ? <Link href={partner.path}>Concert</Link> : <a href={communityDay2026.menu.concertUrl}>Concert</a>}
      <a href="https://www.inspiringchildren.org/donate">Donate</a>
    </nav>
  </div>;
}
