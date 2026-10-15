import Link from "next/link";
import { Heart } from "lucide-react";
import { communityDay2026 } from "../lib/community-day-2026";
import { partnerCommunityDayPath, type AwardsPartnerSite } from "../lib/awards-partner-sites";
import summit from "./summit-refresh.module.css";
import styles from "./community-day-navigation.module.css";

// The Nevada Mental Health Day page has its own menu in the Summit menu's look. Owner (Oct 7): "NV Mental Health
// Day" (this page), "Schedule" (scrolls down to the schedule on this page), "Tickets" (this copy's RSVP form, new
// tab) and "Awards" (the Awards page; it was labelled "Concert"), with Donate as the ICF-style sticker on the far
// right exactly like the Summit and Awards menus. No Summit, Directory or Venue tab. Reached from a private
// partner copy of the Awards site (/nami/community-day, ...), the page, Tickets and Awards stay inside that copy.
// Owner (Oct 11): on a review link every link between the sites stays on that review link (the live notaloneawards.org
// page would show the live, older layout). The live site keeps its address on notaloneawards.org.
const awardsLink = process.env.NEXT_PUBLIC_REVIEW_BUILD === "1" ? "/awards/2026" : communityDay2026.menu.awardsUrl;

export function CommunityDayNavigation({ partner = null }: { partner?: AwardsPartnerSite | null }) {
  return <div className={`${summit.summitHeader} ${styles.header}`}>
    <nav className={`${summit.navigation} ${styles.nav}`} aria-label="Nevada Mental Health Day navigation" id="main-navigation">
      <Link className={styles.link} href={partner ? partnerCommunityDayPath(partner) : "/community-day"} aria-current="page">NV Mental Health Day</Link>
      <a className={styles.link} href="#schedule">Schedule</a>
      <a className={styles.link} href={partner?.rsvpUrl ?? communityDay2026.rsvpUrl} target="_blank" rel="noopener">Tickets</a>
      {/* Owner (Oct 5): links from the Summit side to the Awards open in a new tab. */}
      {partner ? <Link className={styles.link} href={partner.path} target="_blank" rel="noopener">Awards</Link> : <a className={styles.link} href={awardsLink} target="_blank" rel="noopener">Awards</a>}
      {partner?.closingDinnerUrl && <a className={styles.link} href={partner.closingDinnerUrl} target="_blank" rel="noopener">Closing dinner</a>}
      <a className={`${summit.donateButton} ${styles.donate}`} href="https://www.inspiringchildren.org/donate"><Heart size={16} fill="currentColor" aria-hidden="true" />Donate</a>
    </nav>
  </div>;
}
