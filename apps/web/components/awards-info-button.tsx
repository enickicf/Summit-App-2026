"use client";

import type { ReactNode } from "react";

// Owner (Oct 4, 2026): "Info" scrolls to a halfway place: the end of the mission statement fills the top of
// the screen and the evening schedule starts in the lower half, so a visitor sees both and picks. Without
// JavaScript the link still jumps to the mission statement.
export function AwardsInfoButton({ className, children, upper = "mission", lower = "evening" }: { className?: string | undefined; children: ReactNode; upper?: string; lower?: string }) {
  return <a className={className} href={`#${upper}`} onClick={event => {
    const target = document.getElementById(lower) ?? document.getElementById(upper);
    if (!target) return;
    event.preventDefault();
    const first = document.getElementById(upper);
    const half = target.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.5;
    // Never scroll past the start of the upper section (short screens / long mission text).
    const top = first ? Math.max(half, first.getBoundingClientRect().top + window.scrollY - 72) : half;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: Math.max(0, top), behavior: calm ? "auto" : "smooth" });
  }}>{children}</a>;
}
