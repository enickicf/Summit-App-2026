"use client";

import { useEffect } from "react";

// Owner (Sept 28): the staff portal is four separate views (Awards / Summit workshops / Tennis & High Tea / Poker), each with its own
// numbers on top. The server renders all three with Awards visible; this switches by the URL hash so
// #poker, #summit, or any section id (#tickets, #workshops, #poker-removed ...) opens the right view.
export const portalViews = ["awards", "workshops", "site-visit", "wellness", "closing-dinner", "texts", "poker"] as const;
export type PortalView = (typeof portalViews)[number];
const sectionView: Record<string, PortalView> = { awards: "awards", tickets: "awards", "community-day": "awards", nominations: "awards", removed: "awards", lineup: "awards", summit: "workshops", workshops: "workshops", "workshop-list": "workshops", "site-visit": "site-visit", "site-visit-list": "site-visit", wellness: "wellness", "wellness-list": "wellness", "closing-dinner": "closing-dinner", "closing-dinner-list": "closing-dinner", texts: "texts", "texts-list": "texts", poker: "poker", "poker-sponsors": "poker", "poker-requests": "poker", "poker-removed": "poker" };
export const viewForHash = (hash: string): PortalView => sectionView[hash.replace(/^#/, "")] ?? "awards";

export function PortalViewSwitch() {
  useEffect(() => {
    const apply = () => {
      const view = viewForHash(window.location.hash);
      for (const el of document.querySelectorAll<HTMLElement>("[data-view]")) el.hidden = el.dataset.view !== view;
      for (const tab of document.querySelectorAll<HTMLElement>("[data-view-tab]")) tab.setAttribute("aria-selected", tab.dataset.viewTab === view ? "true" : "false");
      const target = window.location.hash.length > 1 ? document.getElementById(window.location.hash.slice(1)) : null;
      if (target && target.dataset.view === undefined) target.scrollIntoView({ block: "start" });
    };
    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, []);
  return null;
}
