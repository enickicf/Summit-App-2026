"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

const storageKey = "not-alone-profile-return-v1";
type ReturnPosition = { origin: string; profile: string; linkIndex: number; top: number; savedAt: number };

function readPosition(): ReturnPosition | null {
  try {
    const value = JSON.parse(sessionStorage.getItem(storageKey) || "null") as ReturnPosition | null;
    if (!value || Date.now() - value.savedAt > 30 * 60_000) return null;
    if (!/^\/(?:$|awards\/2026\/?$|community-day\/?$)/.test(value.origin.split("?")[0] || "") || !/^\/directory\/[a-z0-9-]+(?:\?from=awards)?$/.test(value.profile)) return null;
    return value;
  } catch { return null; }
}

// Store the position of the actual card, not just scrollY: images and client content can
// change document height while a profile is open. The index disambiguates repeated cards.
export function ProfileReturnTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const capture = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const link = target.closest<HTMLAnchorElement>('a[href^="/directory/"]');
      if (!link || link.target === "_blank" || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const profile = new URL(link.href).pathname + new URL(link.href).search;
      const links = [...document.querySelectorAll<HTMLAnchorElement>(`a[href="${CSS.escape(profile)}"]`)];
      const position: ReturnPosition = {
        origin: location.pathname + location.search + location.hash,
        profile,
        linkIndex: links.indexOf(link),
        top: link.getBoundingClientRect().top,
        savedAt: Date.now()
      };
      if (position.linkIndex >= 0) sessionStorage.setItem(storageKey, JSON.stringify(position));
    };
    document.addEventListener("click", capture, true);
    return () => document.removeEventListener("click", capture, true);
  }, []);

  useEffect(() => {
    const saved = readPosition();
    if (!saved || pathname !== saved.origin.split(/[?#]/)[0]) return;
    let attempts = 0;
    let timer: number;
    let canceled = false;
    const cancel = () => { canceled = true; window.clearTimeout(timer); sessionStorage.removeItem(storageKey); };
    window.addEventListener("wheel", cancel, { once: true });
    window.addEventListener("touchstart", cancel, { once: true });
    window.addEventListener("keydown", cancel, { once: true });
    const restore = () => {
      if (canceled) return;
      const links = [...document.querySelectorAll<HTMLAnchorElement>(`a[href="${CSS.escape(saved.profile)}"]`)];
      const link = links[saved.linkIndex];
      if (link) {
        const difference = link.getBoundingClientRect().top - saved.top;
        if (Math.abs(difference) > 2) window.scrollBy({ top: difference, behavior: "instant" });
      }
      if (++attempts < 25) timer = window.setTimeout(restore, 80);
      else sessionStorage.removeItem(storageKey);
    };
    timer = window.setTimeout(restore, 50);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("wheel", cancel);
      window.removeEventListener("touchstart", cancel);
      window.removeEventListener("keydown", cancel);
    };
  }, [pathname]);

  return null;
}

export function ProfileBackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <Link href={href} className="backLink" onClick={event => {
    const saved = readPosition();
    if (!saved || saved.profile !== location.pathname + location.search) return;
    event.preventDefault();
    window.history.back();
  }}>{children}</Link>;
}
