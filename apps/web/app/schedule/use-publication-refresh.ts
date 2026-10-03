"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const refreshIntervalMs = 60_000;
const resumeThrottleMs = 15_000;

export function usePublicationRefresh(): void {
  const router = useRouter();

  useEffect(() => {
    let timer: number | undefined;
    let disposed = false;
    let lastRefreshAt = performance.now();
    const isVisible = () => document.visibilityState === "visible";
    const cancel = () => {
      if (timer !== undefined) window.clearTimeout(timer);
      timer = undefined;
    };
    const schedule = (delay: number) => {
      cancel();
      if (disposed || !isVisible()) return;
      timer = window.setTimeout(() => {
        timer = undefined;
        if (disposed || !isVisible()) return;
        lastRefreshAt = performance.now();
        router.refresh();
        schedule(refreshIntervalMs);
      }, delay);
    };
    const resume = () => {
      if (!isVisible()) return cancel();
      schedule(Math.max(0, resumeThrottleMs - (performance.now() - lastRefreshAt)));
    };

    schedule(refreshIntervalMs);
    document.addEventListener("visibilitychange", resume);
    window.addEventListener("focus", resume);
    return () => {
      disposed = true;
      cancel();
      document.removeEventListener("visibilitychange", resume);
      window.removeEventListener("focus", resume);
    };
  }, [router]);
}
