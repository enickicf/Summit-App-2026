"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Heart, X } from "lucide-react";
import styles from "./classic-summit.module.css";

// Header of the live ICF Summit page (inspiringchildren.org/summit, captured Sept 21, 2026):
// dismissible #NotAloneChallenge bar, white Summit logo left, text navigation and a Donate button.
// Only Schedule and Ask AI are added; they are this site's own pages.
export const classicNavigation = [
  { label: "About", href: "/#about" },
  { label: "Speakers", href: "/#speakers" },
  { label: "Awards", href: "/awards/2026" },
  { label: "Partners", href: "/partners" },
  { label: "Venue", href: "/venue" },
  { label: "Schedule", href: "/schedule" },
  { label: "Ask AI", href: "/ask-ai" },
  { label: "Contact Us", href: "/contact" },
  // Owner (Sept 21): the 2025 Summit (ICF's page, unchanged) sits at the far right.
  { label: "2025", href: "/2025" }
] as const;

export function ClassicHeader({ pathname, awards = false }: { pathname: string; awards?: boolean }) {
  const [barOpen, setBarOpen] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const overlay = pathname === "/" || pathname === "/2025";
  // On the 2025 page, About and Speakers stay on that page; on the Awards pages "2025" is the 2025 Awards.
  const archive = pathname === "/2025";
  const items = classicNavigation.map(item => archive && item.href.startsWith("/#") ? { ...item, href: `/2025${item.href.slice(1)}` }
    : awards && item.label === "2025" ? { ...item, href: "/awards/2025" }
    // Owner (Sept 21): the Unoriginal Awards pages must lead back to the Unoriginal Summit site.
    : awards && item.label === "Awards" ? { label: "Summit", href: "/" } : item);
  useEffect(() => setMenuOpen(false), [pathname]);
  useEffect(() => {
    if (!menuOpen) return;
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setMenuOpen(false); };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [menuOpen]);

  // ICF's Awards page has a black header without the Summit logo.
  return <div className={`${styles.headerWrap}${overlay ? ` ${styles.headerOverlay}` : ""}${awards ? ` ${styles.headerAwards}` : ""}`}>
    {barOpen && <div className={styles.announcement}>
      <a href="https://www.inspiringchildren.org/notalone">Join the #NotAloneChallenge!</a>
      <button type="button" aria-label="Close announcement" onClick={() => setBarOpen(false)}><X size={18} aria-hidden="true" /></button>
    </div>}
    <header className={styles.header}>
      {awards ? <span className={styles.logo} /> : <Link href="/" className={styles.logo} aria-label="Not Alone Summit home">
        <img src="/classic/summit-logo-white.png" alt="" width={82} height={91} />
      </Link>}
      <nav className={styles.nav} aria-label="Summit navigation" id="main-navigation">
        {items.map(item => <Link key={item.href} href={item.href} aria-label={item.label === "2025" ? (awards ? "2025 Awards" : "2025 Summit") : undefined} aria-current={pathname === item.href ? "page" : undefined}>{item.label}</Link>)}
      </nav>
      <a className={styles.donate} href="https://www.inspiringchildren.org/donate"><Heart size={16} fill="currentColor" aria-hidden="true" />Donate</a>
      <button type="button" className={styles.menuButton} aria-expanded={menuOpen} aria-controls="classic-menu" aria-label={menuOpen ? "Close menu" : "Open menu"} onClick={() => setMenuOpen(open => !open)}>
        {menuOpen ? <X size={32} aria-hidden="true" /> : <svg width="36" height="20" viewBox="0 0 36 20" aria-hidden="true"><path d="M0 5h36M0 15h36" stroke="currentColor" strokeWidth="1.5" /></svg>}
      </button>
    </header>
    {menuOpen && <nav className={styles.mobileMenu} id="classic-menu" aria-label="Summit menu">
      {items.map(item => <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>{item.label}</Link>)}
      <a className={styles.donate} href="https://www.inspiringchildren.org/donate"><Heart size={16} fill="currentColor" aria-hidden="true" />Donate Now</a>
    </nav>}
  </div>;
}
