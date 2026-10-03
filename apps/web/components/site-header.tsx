"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { SummitNavigation } from "./summit-navigation";
import { SummitLink } from "./summit-link";
import { Heart } from "lucide-react";
import { awards2026Editorial } from "../lib/awards-editorial";
import { ClassicHeader } from "./classic-header";
import { siteVariant } from "../lib/site-variant";
import styles from "./site-shell.module.css";

export function SiteHeader() {
  const pathname = usePathname();
  const fromAwards = useSearchParams().get("from") === "awards";
  const archive = ["/2025", "/summit/2025", "/awards/2025", "/partners/2025"].includes(pathname)
    || /^\/directory\/2025-[^/]+\/?$/.test(pathname);
  const year = archive ? 2025 : 2026;
  const summit = archive ? "/2025" : "/";
  const awards = `/awards/${year}`;
  // Owner (Sept 23): the staff portal has its own chrome.
  if (pathname.startsWith("/staff")) return null;
  const awardsPage = pathname.startsWith("/awards") || (pathname.startsWith("/directory/") && fromAwards);
  if (siteVariant === "classic") return <ClassicHeader pathname={pathname} awards={awardsPage} />;
  if (!awardsPage) return <SummitNavigation year={year} pathname={pathname} />;
  return <>
    {/* Owner (Sept 21): no logo bar; the Awards hero already carries the logo. */}
    <nav id="main-navigation" className={styles.awardsNavigation} aria-label="Awards navigation">
      {/* Owner (Sept 23): "Awards" with a hover/tap list (2026 / 2025), Tickets straight to the RSVP form,
          Nominate to ICF's nominations page, Summit, and the Donate sticker on the far right. */}
      <div className={styles.navMenu}><Link href="/awards/2026" aria-current={pathname === "/awards/2026" ? "page" : undefined} data-active={year === 2026 || undefined} aria-haspopup="true">Awards</Link>
        <div className={styles.navMenuList}><Link href="/awards/2026">2026</Link><Link href="/awards/2025" aria-current={pathname === "/awards/2025" ? "page" : undefined} data-active={year === 2025 || undefined}>2025</Link></div></div>
      <a href={awards2026Editorial.rsvpUrl}>Tickets</a>
      <a href={awards2026Editorial.nominateUrl}>Nominate</a>
      <SummitLink href={summit}>Summit</SummitLink>
      <a className={styles.donateButton} href="https://www.inspiringchildren.org/donate"><Heart size={16} fill="currentColor" aria-hidden="true" />Donate</a>
    </nav>
  </>;
}
