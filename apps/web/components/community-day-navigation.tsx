import Link from "next/link";
import { Heart } from "lucide-react";
import { communityDay2026 } from "../lib/community-day-2026";
import styles from "./summit-refresh.module.css";

// The Community Day page has its own menu in the Summit menu's look: Community Day, Concert (the Awards
// page) and the Donate sticker. No Summit, Schedule, Directory or Venue tab.
export function CommunityDayNavigation() {
  return <div className={`${styles.summitHeader} ${styles.communityDayHeader}`}>
    <nav className={`${styles.navigation} ${styles.communityDayNavigation}`} aria-label="Community Day navigation" id="main-navigation">
      <Link href="/community-day" aria-current="page">Community Day</Link>
      <a href={communityDay2026.menu.concertUrl}>Concert</a>
      <a className={styles.donateButton} href="https://www.inspiringchildren.org/donate"><Heart size={16} fill="currentColor" aria-hidden="true" />Donate</a>
    </nav>
  </div>;
}
