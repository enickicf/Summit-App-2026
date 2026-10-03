import Link from "next/link";
import { communityDay2026 } from "../lib/community-day-2026";
import styles from "./summit-refresh.module.css";

// The Community Day page has its own menu in the Summit menu's look: Community Day, Concert (the Awards
// page) and Donate. No Summit, Schedule, Directory or Venue tab. Owner (Oct 3): all three are plain links,
// centered on one line with equal spacing (Donate matches the other two, no sticker).
export function CommunityDayNavigation() {
  return <div className={`${styles.summitHeader} ${styles.communityDayHeader}`}>
    <nav className={`${styles.navigation} ${styles.communityDayNavigation}`} aria-label="Community Day navigation" id="main-navigation">
      <Link href="/community-day" aria-current="page">Community Day</Link>
      <a href={communityDay2026.menu.concertUrl}>Concert</a>
      <a href="https://www.inspiringchildren.org/donate">Donate</a>
    </nav>
  </div>;
}
