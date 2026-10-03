"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Owner (Sept 29, 2026): the staff portal renews itself while a tab stays open. The page is already
// rendered fresh on every request (never cached); this re-fetches the server-rendered data every
// minute while the tab is visible, and as soon as a hidden tab becomes visible again, without a full
// reload (scroll position, the current view and the URL hash are kept).
export const refreshEveryMs = 60_000;
export const minGapMs = 15_000;

// Refresh only for a visible tab and only when the last refresh is at least minGapMs old.
export function shouldRefresh(visible: boolean, sinceLastMs: number, minGap = minGapMs): boolean {
  return visible && sinceLastMs >= minGap;
}

export function PortalAutoRefresh() {
  // useRouter needs the App Router; the portal is also rendered statically in tests, where the hook
  // throws. The hook is always called (same order), so catching here keeps the rules of hooks.
  let router: ReturnType<typeof useRouter> | null = null;
  try { router = useRouter(); } catch { router = null; }
  useEffect(() => {
    if (!router) return;
    let last = Date.now();
    const refresh = () => {
      if (!shouldRefresh(document.visibilityState === "visible", Date.now() - last)) return;
      last = Date.now();
      router?.refresh();
    };
    const timer = window.setInterval(refresh, refreshEveryMs);
    document.addEventListener("visibilitychange", refresh);
    return () => { window.clearInterval(timer); document.removeEventListener("visibilitychange", refresh); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);
  return null;
}
