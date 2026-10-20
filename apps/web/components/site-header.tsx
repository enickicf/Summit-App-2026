"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { SummitNavigation } from "./summit-navigation";
import { CommunityDayNavigation } from "./community-day-navigation";
import { Heart } from "lucide-react";
import { awards2026Editorial } from "../lib/awards-editorial";
import { ClassicHeader } from "./classic-header";
import { siteVariant } from "../lib/site-variant";
import { partnerCommunityDayPath, partnerSiteByCommunityDayPath, partnerSiteByPath } from "../lib/awards-partner-sites";
import styles from "./site-shell.module.css";

export function SiteHeader() {
  const pathname = usePathname();
  const fromAwards = useSearchParams().get("from") === "awards";
  // Owner (Oct 4): the private partner copies of the Awards site keep the Awards menu, with Tickets (and the
  // Awards link) staying inside that partner's site.
  const partner = partnerSiteByPath(pathname);
  const archive = ["/2025", "/summit/2025", "/awards/2025", "/partners/2025"].includes(pathname)
    || /^\/directory\/2025-[^/]+\/?$/.test(pathname);
  const year = archive ? 2025 : 2026;
  const awards = `/awards/${year}`;
  // Owner (Sept 23): the staff portal has its own chrome.
  if (pathname.startsWith("/staff")) return null;
  const awardsPage = pathname.startsWith("/awards") || (pathname.startsWith("/directory/") && fromAwards) || Boolean(partner);
  if (siteVariant === "classic") return <ClassicHeader pathname={pathname} awards={awardsPage} />;
  // Owner (Sept 29): Community Day has its own menu (no Summit, Schedule or Directory).
  const communityDayPartner = partnerSiteByCommunityDayPath(pathname);
  if (pathname === "/community-day" || communityDayPartner) return <CommunityDayNavigation partner={communityDayPartner} />;
  if (!awardsPage) return <SummitNavigation year={year} pathname={pathname} />;
  return <>
    {/* Owner (Sept 21): no logo bar; the Awards hero already carries the logo. */}
    <nav id="main-navigation" className={styles.awardsNavigation} aria-label="Awards navigation">
      {/* Owner (Sept 23): "Awards" with a hover/tap list (2026 / 2025), Tickets straight to the RSVP form,
          Nominate, and the Donate sticker on the far right. Owner (Oct 5): the Awards site no longer links to the
          Summit (the Summit is invitation-only; the Summit links here, not the other way), and every form link
          opens in a new tab so guests never need the back arrow. */}
      <div className={styles.navMenu}><Link href={partner?.path ?? "/awards/2026"} aria-current={pathname === "/awards/2026" || partner ? "page" : undefined} data-active={year === 2026 || undefined} aria-haspopup="true">Awards</Link>
        <div className={styles.navMenuList}><Link href={partner?.path ?? "/awards/2026"}>2026</Link><Link href="/awards/2025" aria-current={pathname === "/awards/2025" ? "page" : undefined} data-active={year === 2025 || undefined}>2025</Link></div></div>
      {/* Owner (Oct 3): the Community Day page is in the Awards menu. Owner (Oct 7 meeting): labelled "NV Mental Health Day"
          (the day is Nevada Mental Health Day); the link itself is unchanged. */}
      <Link href={partner ? partnerCommunityDayPath(partner) : "/community-day"}>NV Mental Health Day</Link>
      <a href={partner?.rsvpUrl ?? awards2026Editorial.rsvpUrl} target="_blank" rel="noopener">Tickets</a>
      <a href={awards2026Editorial.nominateUrl} target="_blank" rel="noopener">Nominate</a>
      <a className={styles.donateButton} href="https://www.inspiringchildren.org/donate"><Heart size={16} fill="currentColor" aria-hidden="true" />Donate</a>
    </nav>
  </>;
}
