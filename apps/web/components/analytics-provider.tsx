"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { getAnalyticsRuntime } from "../lib/analytics/browser";
import type { ConsentChoice } from "../lib/analytics/identity";
import styles from "./analytics-consent.module.css";

// Starts the website event runtime, reports route changes as new page views and shows the one-time
// analytics choice. Only strictly necessary events are sent until the visitor allows analytics;
// browsers sending Global Privacy Control or Do Not Track are never asked and never tracked.
export function AnalyticsProvider() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams?.toString() ?? "";
  const [prompt, setPrompt] = useState(false);

  useEffect(() => {
    const runtime = getAnalyticsRuntime();
    runtime.start();
    setPrompt(runtime.promptNeeded());
  }, []);

  useEffect(() => {
    getAnalyticsRuntime().routeChanged(pathname ?? "/", search ? `?${search}` : "");
  }, [pathname, search]);

  if (!prompt) return null;
  const choose = (choice: ConsentChoice) => {
    getAnalyticsRuntime().setConsent(choice);
    setPrompt(false);
  };
  return <div className={styles.bar} role="region" aria-label="Analytics preferences" data-analytics-ignore="">
    <p>We use privacy-friendly analytics to understand how this site is used. No personal information is collected.</p>
    <div className={styles.actions}>
      <button type="button" onClick={() => choose("denied")}>Decline</button>
      <button type="button" className={styles.accept} onClick={() => choose("granted")}>Allow</button>
    </div>
  </div>;
}
