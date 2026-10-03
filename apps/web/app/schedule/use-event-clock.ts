"use client";

import { useEffect, useState } from "react";
import { z } from "zod";

const serverInstantSchema = z.iso.datetime();
type ClockAnchor = { serverMillis: number; monotonicMillis: number };
// Retain clock provenance across route remounts, never snapshots or freshness.
// Entries are created only by browser effects, not shared by server requests.
const documentAnchors = new WeakMap<Document, ClockAnchor>();

function anchoredMillis(anchor: ClockAnchor, monotonicMillis = performance.now()): number {
  const elapsed = Math.max(0, monotonicMillis - anchor.monotonicMillis);
  return anchor.serverMillis + elapsed;
}

export function useEventClock(initialNowUtc: string): string {
  const parsed = serverInstantSchema.safeParse(initialNowUtc);
  const serverMillis = parsed.success ? Date.parse(parsed.data) : null;
  const [nowUtc, setNowUtc] = useState(() => {
    if (serverMillis === null) throw new RangeError("The event clock requires a valid server UTC timestamp.");
    const previous = typeof document === "undefined" ? undefined : documentAnchors.get(document);
    if (previous) {
      const currentMillis = anchoredMillis(previous);
      if (serverMillis <= currentMillis) return new Date(currentMillis).toISOString();
    }
    return initialNowUtc;
  });

  useEffect(() => {
    if (serverMillis === null) return;
    let anchor = documentAnchors.get(document);
    const monotonicMillis = performance.now();
    // An unseen cached timestamp can still be older than the advancing clock.
    if (!anchor || serverMillis > anchoredMillis(anchor, monotonicMillis)) {
      anchor = { serverMillis, monotonicMillis };
      documentAnchors.set(document, anchor);
    }
    setNowUtc(new Date(anchoredMillis(anchor, monotonicMillis)).toISOString());
  }, [serverMillis]);

  useEffect(() => {
    let active = true;
    const update = () => {
      const anchor = documentAnchors.get(document);
      if (!active || !anchor) return;
      // Advance from server time, never from a potentially skewed device clock.
      setNowUtc(new Date(anchoredMillis(anchor)).toISOString());
    };
    const timer = window.setInterval(update, 30_000);
    document.addEventListener("visibilitychange", update);
    return () => {
      active = false;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", update);
    };
  }, []);
  return nowUtc;
}
